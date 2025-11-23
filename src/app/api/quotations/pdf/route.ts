import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import React from 'react';
import applyWatermark from '@/lib/pdf/watermark';

export async function POST(req: Request) {
  try {
    console.log('Quotations PDF POST called');
    const session = await getServerSession(authOptions);
    console.log('Quotations PDF session:', session?.user?.email);
    if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

    const quotation = await prisma.quotation.findUnique({ where: { id }, include: { user: true } });
    if (!quotation) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    // ensure ownership
    if (!quotation.user || quotation.user.email !== session.user.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

    // Build PDF with react-pdf
    const ReactPDF = await import('@react-pdf/renderer');
    const { Document, Page, Text, View, StyleSheet, pdf } = ReactPDF;

    const styles = StyleSheet.create({
      page: { padding: 40, fontSize: 12, fontFamily: 'Helvetica' },
      header: { fontSize: 20, marginBottom: 10 },
      tableRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
      watermark: { position: 'absolute', bottom: 20, left: 0, right: 0, textAlign: 'center' },
    });

    const doc = React.createElement(
      Document,
      null,
      React.createElement(
        Page,
        { size: 'A4', style: styles.page },
        React.createElement(Text, { style: styles.header }, 'QUOTATION'),
        React.createElement(Text, null, `Quotation #: ${quotation.quotationNumber}`),
        React.createElement(Text, null, `Date: ${new Date(quotation.quotationDate).toLocaleDateString()}`),
        React.createElement(View, { style: { marginTop: 10 } },
          ...(quotation.items as any[]).map((it: any, idx: number) =>
            React.createElement(View, { key: idx, style: styles.tableRow },
              React.createElement(Text, null, it.description),
              React.createElement(Text, null, `$${it.amount.toFixed(2)}`)
            )
          )
        ),
        // watermark will be applied post-generation
      )
    );

    const pdfBlob = await pdf(doc).toBlob();
    const arrayBuffer = await pdfBlob.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    // apply watermark for free users
    const isFree = !quotation.user || (typeof quotation.user.plan === 'string' && quotation.user.plan.toLowerCase() === 'free');
    let finalBuffer: Uint8Array = buffer;
    if (isFree) {
      try {
        const watermarked = await applyWatermark(buffer, 'Generated with InvoiceGen - Free Plan');
        finalBuffer = new Uint8Array(watermarked);
      } catch (err) {
        console.warn('Quotation PDF watermark failed', err);
      }
    }

    const body = new Blob([Buffer.from(finalBuffer)], { type: 'application/pdf' });
    return new NextResponse(body, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${quotation.quotationNumber}.pdf"`,
      },
    });
  } catch (err) {
    console.error('Quotation PDF error', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
