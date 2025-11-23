import { prisma } from './prisma';

export async function convertQuotationToInvoice(quotationId: string) {
  const q = await prisma.quotation.findUnique({ where: { id: quotationId } });
  if (!q) throw new Error('Quotation not found');

  const invoice = await prisma.invoice.create({
    data: {
      invoiceNumber: `INV-${q.quotationNumber}`,
      userId: q.userId,
      fromName: q.fromName,
      fromEmail: q.fromEmail,
      fromAddress: q.fromAddress,
      fromCity: q.fromCity,
      fromCountry: q.fromCountry,
      toName: q.toName,
      toEmail: q.toEmail,
      toAddress: q.toAddress,
      toCity: q.toCity,
      toCountry: q.toCountry,
      invoiceDate: new Date(),
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      items: q.items as any,
      subtotal: q.subtotal,
      tax: q.tax,
      discount: q.discount,
      total: q.total,
      notes: q.notes,
      terms: q.terms,
      status: 'draft',
    },
  });

  // mark quotation as converted
  await prisma.quotation.update({ where: { id: quotationId }, data: { status: 'converted', convertedToInvoiceId: invoice.id } });

  return invoice;
}
