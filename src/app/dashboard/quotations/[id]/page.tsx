'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import QuotationEditor from '@/components/QuotationEditor';
import QuotationPreview from '@/components/QuotationPreview';

interface QuotationItem {
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

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
  items: QuotationItem[];
  tax: number;
  discount: number;
  notes: string;
  terms: string;
  logoUrl?: string;
  logoPosition?: 'top-left' | 'top-center' | 'top-right';
  signatureUrl?: string;
  signaturePosition?: 'bottom-left' | 'bottom-center' | 'bottom-right';
}

const initialData: QuotationData = {
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
  quotationNumber: '',
  quotationDate: '',
  validUntil: '',
  items: [],
  tax: 0,
  discount: 0,
  notes: '',
  terms: '',
  logoUrl: '',
  logoPosition: 'top-right',
  signatureUrl: '',
  signaturePosition: 'bottom-right',
};

export default function QuotationDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const [quotationData, setQuotationData] = useState<QuotationData>(initialData);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchQuotation = async () => {
      try {
        const response = await fetch(`/api/quotations/${id}`);
        const data = await response.json();
        
        if (data.quotation) {
          const q = data.quotation;
          setQuotationData({
            fromName: q.fromName || '',
            fromEmail: q.fromEmail || '',
            fromAddress: q.fromAddress || '',
            fromCity: q.fromCity || '',
            fromCountry: q.fromCountry || '',
            toName: q.toName || '',
            toEmail: q.toEmail || '',
            toAddress: q.toAddress || '',
            toCity: q.toCity || '',
            toCountry: q.toCountry || '',
            quotationNumber: q.quotationNumber || '',
            quotationDate: new Date(q.quotationDate).toISOString().split('T')[0],
            validUntil: new Date(q.validUntil).toISOString().split('T')[0],
            items: q.items || [],
            tax: q.tax || 0,
            discount: q.discount || 0,
            notes: q.notes || '',
            terms: q.terms || '',
            logoUrl: q.logoUrl || '',
            logoPosition: q.logoPosition || 'top-right',
            signatureUrl: q.signatureUrl || '',
            signaturePosition: q.signaturePosition || 'bottom-right',
          });
        }
      } catch (error) {
        console.error('Error fetching quotation:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuotation();
  }, [id]);

  if (loading) {
    return <div className="text-[#464646]">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[#464646]">Edit Quotation</h1>
        <p className="text-[#bebebf] mt-2">Modify your quotation details and see live preview</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Editor Side */}
        <div className="bg-white rounded-xl shadow-sm border border-[#e9eaea] p-6 h-fit">
          <QuotationEditor
            quotationData={quotationData}
            setQuotationData={setQuotationData}
            isEditing={true}
            quotationId={id}
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
