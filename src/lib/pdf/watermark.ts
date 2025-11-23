export default async function applyWatermark(
  input: ArrayBuffer | Uint8Array,
  watermarkText = 'Generated with InvoiceGen - Free Plan'
): Promise<Uint8Array | ArrayBuffer> {
  try {
    const pdfLib = await import('pdf-lib');
    const { PDFDocument, rgb, StandardFonts } = pdfLib as any;

    const existing = input instanceof ArrayBuffer ? new Uint8Array(input) : input;
    const pdfDoc = await PDFDocument.load(existing);
    const pages = pdfDoc.getPages();

    // Try to embed a bold font, fallback to regular Helvetica
    let font;
    try {
      font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    } catch (err) {
      font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    }

    // Watermark appearance defaults — tuned for visibility across common page sizes
    const fontSize = 14;
    const color = rgb(0, 0, 0); // darker color for contrast
    const opacity = 0.95;

    // Use a sensible fallback for page size (A4 in points) if `getSize()` is not available
    const DEFAULT_PAGE = { width: 595.28, height: 841.89 };

    console.log('applyWatermark: pages found=', pages.length);
    // Sanitize watermark text to remove emoji and special Unicode characters
    // Keep only ASCII letters, numbers, spaces, hyphens, parentheses, and common punctuation
    const sanitized = String(watermarkText)
      .replace(/[^\w\s\-().,&]/gi, '') // Remove emoji and special chars, keep word chars, spaces, hyphens, etc
      .trim();
    const displayText = sanitized.length > 0 ? sanitized : 'Generated with InvoiceGen - Free Plan';
    if (displayText !== watermarkText) {
      // eslint-disable-next-line no-console
      console.log('applyWatermark: sanitized watermark text', { original: watermarkText, sanitized: displayText });
    }

    for (let i = 0; i < pages.length; i++) {
      const page = pages[i];
      // Some PDFs or page objects might not expose getSize the same way; guard defensively
      let pageSize: { width: number; height: number } = DEFAULT_PAGE;
      try {
        // `getSize()` is the pdf-lib API; if not present, fall back to DEFAULT_PAGE
        // Also guard when it returns unexpected values
        // @ts-ignore
        const s = page.getSize ? page.getSize() : null;
        if (s && typeof s.width === 'number' && typeof s.height === 'number') {
          pageSize = s;
        }
      } catch (e) {
        // ignore and use default
      }

      const { width } = pageSize;
      console.log(`applyWatermark: page ${i} size=`, pageSize);

      // If watermark text is long, shrink the font to fit within the page width with a margin
      const margin = 40; // points
      const maxTextWidth = Math.max(0, width - margin * 2);
      let sizeToUse = fontSize;
      
      // Measure using displayText (sanitized) to avoid encoding errors
      try {
        const measured = font.widthOfTextAtSize(displayText, fontSize);
        if (measured > maxTextWidth && measured > 0) {
          sizeToUse = Math.max(8, Math.floor((fontSize * maxTextWidth) / measured));
        }
      } catch (e) {
        // If measurement fails, use default size
        sizeToUse = fontSize;
      }

      // Measure and draw the sanitized/display text to avoid encoding errors for emoji
      let textWidth = 0;
      try {
        textWidth = font.widthOfTextAtSize(displayText, sizeToUse);
      } catch (measureErr) {
        // Fallback: if measurement fails, reduce font and try again
        // eslint-disable-next-line no-console
        console.warn('applyWatermark: failed to measure text width, falling back', measureErr);
        try {
          textWidth = font.widthOfTextAtSize(displayText, Math.max(8, Math.floor(sizeToUse / 2)));
        } catch (e) {
          textWidth = Math.min(maxTextWidth, 100);
        }
      }
      const x = Math.max(margin, (width - textWidth) / 2);
      const y = 40; // larger margin from bottom to avoid footer overlap

      try {
        console.log(`applyWatermark: drawing watermark on page ${i} with size ${sizeToUse}`);
        page.drawText(displayText, {
          x,
          y,
          size: sizeToUse,
          font,
          color,
          opacity,
        });
      } catch (drawErr) {
        // If drawing fails for any page, log and continue with other pages
        // eslint-disable-next-line no-console
        console.warn('applyWatermark: failed to draw watermark on a page', drawErr);
      }
    }

    const modified = await pdfDoc.save();
    return modified;
  } catch (err) {
    // If pdf-lib isn't available or something goes wrong, do not block PDF generation.
    // Log the error and return the original buffer unchanged.
    // eslint-disable-next-line no-console
    console.warn('applyWatermark: pdf-lib not available or failed — returning original PDF', err);
    return input;
  }
}
