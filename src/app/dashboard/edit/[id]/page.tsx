'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import InvoiceEditor from '@/components/InvoiceEditor';
import InvoicePreview from '@/components/InvoicePreview';

interface InvoiceData {
  fromName: string;
  fromEmail: string;
  fromAddress: string;
  fromCity: string;
  fromCountry: string;
  toName: string;
  toEmail: string;
  toAddress: string;
  toCity: string;
  toCountry: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  items: { description: string; quantity: number; rate: number; amount: number }[];
  tax: number;
  discount: number;
  notes: string;
  terms: string;
  logoUrl?: string;
  logoPosition?: 'top-left' | 'top-center' | 'top-right';
  signatureUrl?: string;
  signaturePosition?: 'bottom-left' | 'bottom-center' | 'bottom-right';
}

export default function EditInvoicePage() {
  const params = useParams() as { id: string } | null;
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [invoiceData, setInvoiceData] = useState<InvoiceData>({
    fromName: '',
    fromEmail: '',
    fromAddress: '',
    fromCity: '',
    fromCountry: '',
    toName: '',
    toEmail: '',
    toAddress: '',
    toCity: '',
    toCountry: '',
    invoiceNumber: '',
    invoiceDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    items: [{ description: '', quantity: 1, rate: 0, amount: 0 }],
    tax: 0,
    discount: 0,
    notes: '',
    terms: '',
    logoUrl: '',
    logoPosition: 'top-right',
    signatureUrl: '',
    signaturePosition: 'bottom-right',
  });

  useEffect(() => {
    if (!params?.id) return;

    const id = params.id as string;
    const fetchInvoice = async () => {
      try {
        const response = await fetch(`/api/invoices/${id}`);
        if (!response.ok) {
          throw new Error('Invoice not found');
        }
        const invoice = await response.json();
        
        setInvoiceData({
          fromName: invoice.fromName || '',
          fromEmail: invoice.fromEmail || '',
          fromAddress: invoice.fromAddress || '',
          fromCity: invoice.fromCity || '',
          fromCountry: invoice.fromCountry || '',
          toName: invoice.toName || '',
          toEmail: invoice.toEmail || '',
          toAddress: invoice.toAddress || '',
          toCity: invoice.toCity || '',
          toCountry: invoice.toCountry || '',
          invoiceNumber: invoice.invoiceNumber || '',
          invoiceDate: new Date(invoice.invoiceDate).toISOString().split('T')[0],
          dueDate: new Date(invoice.dueDate).toISOString().split('T')[0],
          items: invoice.items as any,
          tax: invoice.tax || 0,
          discount: invoice.discount || 0,
          notes: invoice.notes || '',
          terms: invoice.terms || '',
          logoUrl: invoice.logoUrl || '',
          logoPosition: invoice.logoPosition || 'top-right',
          signatureUrl: invoice.signatureUrl || '',
          signaturePosition: invoice.signaturePosition || 'bottom-right',
        });
      } catch (error) {
        console.error('Error fetching invoice:', error);
        alert('Failed to load invoice');
        router.push('/dashboard/invoices');
      } finally {
        setLoading(false);
      }
    };

    fetchInvoice();
  }, [params, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-[#464646]">Loading invoice...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[#464646]">Edit Invoice</h1>
        <p className="text-[#bebebf] mt-2">Update your invoice details</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-[#e9eaea] p-6 h-fit">
          <InvoiceEditor 
            invoiceData={invoiceData} 
            setInvoiceData={setInvoiceData}
            isEditing={true}
            invoiceId={params?.id as string}
          />
        </div>

        <div className="lg:sticky lg:top-24 h-fit">
          <InvoicePreview invoiceData={invoiceData} />
        </div>
      </div>
    </div>
  );
}