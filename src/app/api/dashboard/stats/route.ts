import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

interface Invoice {
  id: string;
  total: number;
  status: string;
  createdAt: Date;
  invoiceNumber: string;
  toName: string;
}

interface Quotation {
  id: string;
  total: number;
  status: string;
  createdAt: Date;
  quotationNumber: string;
  toName: string;
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const invoices = await prisma.invoice.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    }) as Invoice[];

    const quotations = await prisma.quotation.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    }) as Quotation[];

    const stats = {
      totalInvoices: invoices.length,
      totalQuotations: quotations.length,
      totalRevenue: invoices.reduce((sum, inv) => sum + inv.total, 0),
      pendingInvoices: invoices.filter((inv) => inv.status !== 'paid').length,
      paidInvoices: invoices.filter((inv) => inv.status === 'paid').length,
      activeQuotations: quotations.filter((q) => q.status === 'draft' || q.status === 'sent').length,
      acceptedQuotations: quotations.filter((q) => q.status === 'accepted').length,
    };

    const recentInvoices = invoices.slice(0, 5);
    const recentQuotations = quotations.slice(0, 5);

    return NextResponse.json({ stats, recentInvoices, recentQuotations });
  } catch (error: unknown) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}