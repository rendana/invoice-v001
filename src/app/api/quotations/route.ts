import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    console.log('Quotations API GET called');
    const session = await getServerSession(authOptions);
    console.log('Quotations API session:', session?.user?.email);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // list quotations for user
    const quotations = await prisma.quotation.findMany({
      where: { user: { email: session.user.email } },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ quotations });
  } catch (err) {
    console.error('Quotations GET error', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    console.log('Quotations API POST called');
    const session = await getServerSession(authOptions);
    console.log('Quotations API session:', session?.user?.email);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    // allow frontends that send `summary: { ... }` as well as top-level fields
    const payload = body?.summary ?? body;
    console.log('Quotations API POST body:', { payloadSummary: { quotationNumber: payload.quotationNumber, toName: payload.toName, items: Array.isArray(payload.items) ? payload.items.length : undefined } });

    // Basic validation
    if (!payload.quotationNumber || !payload.toName || !payload.items || !Array.isArray(payload.items)) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // create quotation
    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const created = await prisma.quotation.create({
      data: {
        quotationNumber: payload.quotationNumber,
        userId: user.id,
        fromName: payload.fromName || user.name || '',
        fromEmail: payload.fromEmail || user.email,
        fromAddress: payload.fromAddress,
        fromCity: payload.fromCity,
        fromCountry: payload.fromCountry,
        toName: payload.toName,
        toEmail: payload.toEmail,
        toAddress: payload.toAddress,
        toCity: payload.toCity,
        toCountry: payload.toCountry,
        quotationDate: payload.quotationDate ? new Date(payload.quotationDate) : new Date(),
        validUntil: payload.validUntil ? new Date(payload.validUntil) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        items: payload.items,
        subtotal: payload.subtotal ?? 0,
        tax: payload.tax ?? 0,
        discount: payload.discount ?? 0,
        total: payload.total ?? 0,
        notes: payload.notes,
        terms: payload.terms,
      },
    });

    return NextResponse.json({ quotation: created });
  } catch (err) {
    console.error('Quotations POST error', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
