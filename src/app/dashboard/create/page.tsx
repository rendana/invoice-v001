'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import InvoiceEditor from '@/components/InvoiceEditor';
import InvoicePreview from '@/components/InvoicePreview';
import UpgradeModal from '@/components/UpgradeModal';

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

export default function CreateInvoicePage() {
  const router = useRouter();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [canCreate, setCanCreate] = useState(true);
  const [limitMessage, setLimitMessage] = useState('');
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
    invoiceNumber: `INV-${Date.now()}`,
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
    checkCanCreate();
  }, []);

  const checkCanCreate = async () => {
    try {
      const response = await fetch('/api/invoices/check-limit');
      const data = await response.json();
      
      if (!data.allowed) {
        setCanCreate(false);
        setLimitMessage(data.message);
        setShowUpgradeModal(true);
      }
    } catch (error) {
      console.error('Error checking limit:', error);
    }
  };

  if (!canCreate) {
    return (
      <div className="space-y-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-8 text-center">
          <h2 className="text-2xl font-bold text-[#464646] mb-4">Limit Reached</h2>
          <p className="text-[#464646] mb-6">{limitMessage}</p>
          <button
            onClick={() => router.push('/dashboard/pricing')}
            className="bg-[#fcc425] text-[#464646] px-8 py-3 rounded-lg font-semibold hover:bg-[#fae29b] transition"
          >
            View Upgrade Options
          </button>
        </div>
        <UpgradeModal
          isOpen={showUpgradeModal}
          onClose={() => router.push('/dashboard')}
          currentPlan="free"
          reason={limitMessage}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[#464646]">Create Invoice</h1>
        <p className="text-[#bebebf] mt-2">Fill in the details to generate your invoice</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Editor Side */}
        <div className="bg-white rounded-xl shadow-sm border border-[#e9eaea] p-6 h-fit">
          <InvoiceEditor invoiceData={invoiceData} setInvoiceData={setInvoiceData} />
        </div>

        {/* Preview Side */}
        <div className="lg:sticky lg:top-24 h-fit">
          <InvoicePreview invoiceData={invoiceData} />
        </div>
      </div>
    </div>
  );
}