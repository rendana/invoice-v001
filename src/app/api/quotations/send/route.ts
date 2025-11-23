import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { sendInvoiceEmail } from '@/lib/email';
import applyWatermark from '@/lib/pdf/watermark';
import React from 'react';

export async function POST(req: Request) {
  try {
    console.log('Quotations SEND POST called');
    const session = await getServerSession(authOptions);
    console.log('Quotations SEND session:', session?.user?.email);
    if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id, recipientEmail } = await req.json();
    if (!id || !recipientEmail) return NextResponse.json({ error: 'Missing params' }, { status: 400 });

    const quotation = await prisma.quotation.findUnique({ where: { id }, include: { user: true } });
    if (!quotation) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    if (!quotation.user || quotation.user.email !== session.user.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

    // generate PDF (reuse the PDF route logic inline for simplicity)
    const ReactPDF = await import('@react-pdf/renderer');
    const { Document, Page, Text, View, StyleSheet, pdf } = ReactPDF;

    const styles = StyleSheet.create({ page: { padding: 40, fontSize: 12, fontFamily: 'Helvetica' }, header: { fontSize: 20, marginBottom: 10 } });

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
            React.createElement(View, { key: idx, style: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 } },
              React.createElement(Text, null, it.description),
              React.createElement(Text, null, `$${it.amount.toFixed(2)}`)
            )
          )
        )
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
        console.warn('Quotation send watermark failed', err);
      }
    }

    const pdfBuffer = Buffer.from(finalBuffer);

    const emailResult = await sendInvoiceEmail({
      to: recipientEmail,
      invoiceNumber: quotation.quotationNumber,
      invoiceDate: new Date(quotation.quotationDate).toLocaleDateString(),
      total: `$${quotation.total.toFixed(2)}`,
      pdfBuffer,
      fromName: quotation.fromName,
    });

    if (!emailResult.success) return NextResponse.json({ error: emailResult.error || 'Failed to send' }, { status: 500 });

    // update status to sent
    await prisma.quotation.update({ where: { id }, data: { status: 'sent' } });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Quotation send error', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
