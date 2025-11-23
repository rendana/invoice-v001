import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { canUserCreateInvoice, incrementInvoiceCount } from '@/lib/usage';

export async function POST(req: Request) {
  try {
    console.log('Quotation Convert POST called');
    const session = await getServerSession(authOptions);
    console.log('Quotation Convert session:', session?.user?.email);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { quotationId } = await req.json();
    if (!quotationId) {
      return NextResponse.json({ error: 'Missing quotationId' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Fetch the quotation
    const quotation = await prisma.quotation.findUnique({
      where: { id: quotationId },
    });

    if (!quotation) {
      return NextResponse.json({ error: 'Quotation not found' }, { status: 404 });
    }

    // Ensure ownership
    if (quotation.userId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Check if user can create invoice
    const canCreate = await canUserCreateInvoice(user.id);
    if (!canCreate.allowed) {
      return NextResponse.json(
        {
          error: canCreate.message,
          limitReached: true,
          upgradeRequired: true,
        },
        { status: 403 }
      );
    }

    // Generate invoice number
    const existingInvoices = await prisma.invoice.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 1,
    });

    const lastNumber = existingInvoices[0]?.invoiceNumber || 'INV-0';
    const nextNumber = `INV-${parseInt(lastNumber.split('-')[1] || '0') + 1}`;

    // Create invoice from quotation
    const invoice = await prisma.invoice.create({
      data: {
        userId: user.id,
        invoiceNumber: nextNumber,
        fromName: quotation.fromName,
        fromEmail: quotation.fromEmail,
        fromAddress: quotation.fromAddress,
        fromCity: quotation.fromCity,
        fromCountry: quotation.fromCountry,
        toName: quotation.toName,
        toEmail: quotation.toEmail,
        toAddress: quotation.toAddress,
        toCity: quotation.toCity,
        toCountry: quotation.toCountry,
        invoiceDate: new Date(),
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        items: quotation.items as any,
        subtotal: quotation.subtotal,
        tax: quotation.tax,
        discount: quotation.discount,
        total: quotation.total,
        notes: quotation.notes,
        terms: quotation.terms,
        status: 'draft',
      },
    });

    // Update quotation to mark as converted
    await prisma.quotation.update({
      where: { id: quotationId },
      data: {
        status: 'converted',
        convertedToInvoiceId: invoice.id,
      },
    });

    // Increment invoice count
    await incrementInvoiceCount(user.id);

    return NextResponse.json({ invoice, success: true });
  } catch (err) {
    console.error('Quotation convert error', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
