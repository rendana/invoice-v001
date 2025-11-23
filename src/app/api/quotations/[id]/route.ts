import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    console.log('Quotation [id] GET called, id=', params.id);
    const session = await getServerSession(authOptions);
    console.log('Quotation [id] session:', session?.user?.email);
    if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const id = params.id;
    const quotation = await prisma.quotation.findUnique({ where: { id } });
    if (!quotation) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    // ensure ownership
    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user || quotation.userId !== user.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

    return NextResponse.json({ quotation });
  } catch (err) {
    console.error('Quotation GET error', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    console.log('Quotation [id] PUT called, id=', params.id);
    const session = await getServerSession(authOptions);
    console.log('Quotation [id] session:', session?.user?.email);
    if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const id = params.id;
    const body = await req.json();
    const payload = body?.summary ?? body;
    console.log('Quotation [id] PUT payload:', { payloadSummary: { toName: payload.toName, items: Array.isArray(payload.items) ? payload.items.length : undefined } });

    const quotation = await prisma.quotation.findUnique({ where: { id } });
    if (!quotation) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user || quotation.userId !== user.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

    const updated = await prisma.quotation.update({
      where: { id },
      data: {
        toName: payload.toName ?? quotation.toName,
        toEmail: payload.toEmail ?? quotation.toEmail,
        items: payload.items ?? quotation.items,
        subtotal: payload.subtotal ?? quotation.subtotal,
        tax: payload.tax ?? quotation.tax,
        discount: payload.discount ?? quotation.discount,
        total: payload.total ?? quotation.total,
        notes: payload.notes ?? quotation.notes,
        terms: payload.terms ?? quotation.terms,
        status: payload.status ?? quotation.status,
      },
    });

    return NextResponse.json({ quotation: updated });
  } catch (err) {
    console.error('Quotation PUT error', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    console.log('Quotation [id] DELETE called, id=', params.id);
    const session = await getServerSession(authOptions);
    console.log('Quotation [id] session:', session?.user?.email);
    if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const id = params.id;
    const quotation = await prisma.quotation.findUnique({ where: { id } });
    if (!quotation) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user || quotation.userId !== user.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

    await prisma.quotation.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Quotation DELETE error', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
