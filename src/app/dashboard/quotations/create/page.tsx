'use client';

import { useState } from 'react';
import QuotationEditor from '@/components/QuotationEditor';
import QuotationPreview from '@/components/QuotationPreview';

interface QuotationData {
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
  quotationNumber: string;
  quotationDate: string;
  validUntil: string;
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

const initialQuotationData: QuotationData = {
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
  quotationNumber: `Q-${Date.now()}`,
  quotationDate: new Date().toISOString().split('T')[0],
  validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  items: [{ description: '', quantity: 1, rate: 0, amount: 0 }],
  tax: 0,
  discount: 0,
  notes: '',
  terms: '',
  logoUrl: '',
  logoPosition: 'top-right',
  signatureUrl: '',
  signaturePosition: 'bottom-right',
};

export default function CreateQuotationPage() {
  const [quotationData, setQuotationData] = useState(initialQuotationData);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[#464646]">Create Quotation</h1>
        <p className="text-[#bebebf] mt-2">Fill in the details to generate your quotation</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Editor Side */}
        <div className="bg-white rounded-xl shadow-sm border border-[#e9eaea] p-6 h-fit">
          <QuotationEditor
            quotationData={quotationData}
            setQuotationData={setQuotationData}
            isEditing={false}
          />
        </div>

        {/* Preview Side */}
        <div className="lg:sticky lg:top-24 h-fit">
          <QuotationPreview quotationData={quotationData} />
        </div>
      </div>
    </div>
  );
}
