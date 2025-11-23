'use client';

import { Plus, Trash2, Save, Send, Download, ArrowLeft, FileText } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

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

interface QuotationEditorProps {
  quotationData: QuotationData;
  setQuotationData: (data: QuotationData) => void;
  isEditing?: boolean;
  quotationId?: string;
}

export default function QuotationEditor({
  quotationData,
  setQuotationData,
  isEditing = false,
  quotationId = '',
}: QuotationEditorProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const updateField = (field: string, value: any) => {
    setQuotationData({ ...quotationData, [field]: value });
  };

  const addItem = () => {
    setQuotationData({
      ...quotationData,
      items: [...quotationData.items, { description: '', quantity: 1, rate: 0, amount: 0 }],
    });
  };

  const removeItem = (index: number) => {
    const newItems = quotationData.items.filter((_, i) => i !== index);
    setQuotationData({ ...quotationData, items: newItems });
  };

  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...quotationData.items];
    newItems[index] = { ...newItems[index], [field]: value };

    if (field === 'quantity' || field === 'rate') {
      newItems[index].amount = newItems[index].quantity * newItems[index].rate;
    }

    setQuotationData({ ...quotationData, items: newItems });
  };

  const calculateSubtotal = () => {
    return quotationData.items.reduce((sum, item) => sum + item.amount, 0);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const taxAmount = (subtotal * quotationData.tax) / 100;
    const discountAmount = (subtotal * quotationData.discount) / 100;
    return subtotal + taxAmount - discountAmount;
  };

  const handleSave = async (status: string = 'draft') => {
    setLoading(true);
    setMessage('');

    try {
      const url = isEditing ? `/api/quotations/${quotationId}` : '/api/quotations';
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...quotationData,
          subtotal: calculateSubtotal(),
          total: calculateTotal(),
          status,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.limitReached) {
          setMessage(data.error || 'You have reached your quotation limit for this month.');

          const shouldUpgrade = confirm(
            `${data.error}\n\nWould you like to upgrade your plan to create unlimited quotations?`
          );

          if (shouldUpgrade) {
            router.push('/dashboard/pricing');
          }
          return;
        }
        throw new Error('Failed to save quotation');
      }

      if (isEditing) {
        setMessage('Quotation updated successfully!');
        if (status === 'sent') {
          setMessage('Quotation updated and sent via email!');
        }
      } else {
        setMessage('Quotation saved successfully!');
        if (status === 'sent') {
          setMessage('Quotation saved and sent via email!');
        }
      }

      setTimeout(() => {
        router.push('/dashboard/quotations');
      }, 1500);
    } catch (error) {
      setMessage('Error saving quotation');
      console.error('Save error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/quotations/pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: quotationId,
        }),
      });

      if (!response.ok) throw new Error('Failed to generate PDF');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${quotationData.quotationNumber}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);

      setMessage('PDF downloaded successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Error generating PDF');
      console.error('PDF error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendEmail = async () => {
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/quotations/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: quotationId,
          recipientEmail: quotationData.toEmail,
        }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || 'Failed to send email');

      setMessage('Quotation sent via email successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Error sending email');
      console.error('Email error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConvertToInvoice = async () => {
    if (!isEditing || !quotationId) {
      setMessage('Please save the quotation first before converting.');
      return;
    }

    if (!confirm('Convert this quotation to an invoice? This will create a new invoice with the same details.')) {
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/quotations/convert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quotationId }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.limitReached) {
          setMessage(data.error || 'You have reached your invoice limit for this month.');

          const shouldUpgrade = confirm(
            `${data.error}\n\nWould you like to upgrade your plan to create unlimited invoices?`
          );

          if (shouldUpgrade) {
            router.push('/dashboard/pricing');
          }
          return;
        }
        throw new Error('Failed to convert quotation');
      }

      setMessage('Quotation converted to invoice successfully!');
      setTimeout(() => {
        router.push(`/dashboard/edit/${data.invoice.id}`);
      }, 1500);
    } catch (error) {
      setMessage('Error converting quotation');
      console.error('Conversion error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm space-y-6">
      {/* Header with back button */}
      <div className="flex items-center justify-between pb-4 border-b border-[#e9eaea]">
        <button
          onClick={() => router.back()}
          className="flex items-center space-x-2 text-[#bebebf] hover:text-[#464646] transition"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>
        <h2 className="text-2xl font-bold text-[#464646]">
          {isEditing ? 'Edit Quotation' : 'Create Quotation'}
        </h2>
        <div className="w-20"></div>
      </div>

      {/* Message */}
      {message && (
        <div className={`p-4 rounded-lg text-sm font-medium ${
          message.includes('Error') 
            ? 'bg-red-50 text-red-800' 
            : 'bg-green-50 text-green-800'
        }`}>
          {message}
        </div>
      )}

      {/* From Section */}
      <div>
        <h3 className="text-lg font-semibold text-[#464646] mb-3">From</h3>
        <div className="space-y-3">
          <input
            type="text"
            placeholder="Your Name"
            value={quotationData.fromName}
            onChange={(e) => updateField('fromName', e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-[#e9eaea] focus:outline-none focus:border-[#fcc425]"
          />
          <input
            type="email"
            placeholder="Your Email"
            value={quotationData.fromEmail}
            onChange={(e) => updateField('fromEmail', e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-[#e9eaea] focus:outline-none focus:border-[#fcc425]"
          />
          <input
            type="text"
            placeholder="Address"
            value={quotationData.fromAddress}
            onChange={(e) => updateField('fromAddress', e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-[#e9eaea] focus:outline-none focus:border-[#fcc425]"
          />
          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="City"
              value={quotationData.fromCity}
              onChange={(e) => updateField('fromCity', e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-[#e9eaea] focus:outline-none focus:border-[#fcc425]"
            />
            <input
              type="text"
              placeholder="Country"
              value={quotationData.fromCountry}
              onChange={(e) => updateField('fromCountry', e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-[#e9eaea] focus:outline-none focus:border-[#fcc425]"
            />
          </div>
        </div>
      </div>

      {/* To Section */}
      <div>
        <h3 className="text-lg font-semibold text-[#464646] mb-3">Bill To</h3>
        <div className="space-y-3">
          <input
            type="text"
            placeholder="Client Name"
            value={quotationData.toName}
            onChange={(e) => updateField('toName', e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-[#e9eaea] focus:outline-none focus:border-[#fcc425]"
          />
          <input
            type="email"
            placeholder="Client Email"
            value={quotationData.toEmail}
            onChange={(e) => updateField('toEmail', e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-[#e9eaea] focus:outline-none focus:border-[#fcc425]"
          />
          <input
            type="text"
            placeholder="Address"
            value={quotationData.toAddress}
            onChange={(e) => updateField('toAddress', e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-[#e9eaea] focus:outline-none focus:border-[#fcc425]"
          />
          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="City"
              value={quotationData.toCity}
              onChange={(e) => updateField('toCity', e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-[#e9eaea] focus:outline-none focus:border-[#fcc425]"
            />
            <input
              type="text"
              placeholder="Country"
              value={quotationData.toCountry}
              onChange={(e) => updateField('toCountry', e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-[#e9eaea] focus:outline-none focus:border-[#fcc425]"
            />
          </div>
        </div>
      </div>

      {/* Quotation Details */}
      <div>
        <h3 className="text-lg font-semibold text-[#464646] mb-3">Quotation Details</h3>
        <div className="space-y-3">
          <input
            type="text"
            placeholder="Quotation Number"
            value={quotationData.quotationNumber}
            onChange={(e) => updateField('quotationNumber', e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-[#e9eaea] focus:outline-none focus:border-[#fcc425]"
          />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-[#bebebf] mb-1 block">Quotation Date</label>
              <input
                type="date"
                value={quotationData.quotationDate}
                onChange={(e) => updateField('quotationDate', e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-[#e9eaea] focus:outline-none focus:border-[#fcc425]"
              />
            </div>
            <div>
              <label className="text-sm text-[#bebebf] mb-1 block">Valid Until</label>
              <input
                type="date"
                value={quotationData.validUntil}
                onChange={(e) => updateField('validUntil', e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-[#e9eaea] focus:outline-none focus:border-[#fcc425]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Line Items */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-semibold text-[#464646]">Items</h3>
          <button
            onClick={addItem}
            className="bg-[#fcc425] text-[#464646] px-4 py-2 rounded-lg font-semibold hover:bg-[#fae29b] transition flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Item</span>
          </button>
        </div>

        <div className="space-y-3">
          {quotationData.items.map((item, index) => (
            <div key={index} className="flex gap-3 items-end">
              <input
                type="text"
                placeholder="Description"
                value={item.description}
                onChange={(e) => updateItem(index, 'description', e.target.value)}
                className="flex-1 px-4 py-2 rounded-lg border border-[#e9eaea] focus:outline-none focus:border-[#fcc425]"
              />
              <input
                type="number"
                placeholder="Qty"
                value={item.quantity}
                onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value))}
                className="w-20 px-4 py-2 rounded-lg border border-[#e9eaea] focus:outline-none focus:border-[#fcc425]"
              />
              <input
                type="number"
                placeholder="Rate"
                value={item.rate}
                onChange={(e) => updateItem(index, 'rate', parseFloat(e.target.value))}
                className="w-24 px-4 py-2 rounded-lg border border-[#e9eaea] focus:outline-none focus:border-[#fcc425]"
              />
              <div className="w-24 px-4 py-2 rounded-lg bg-[#fcfcfc] border border-[#e9eaea] font-semibold text-[#464646]">
                ${item.amount.toFixed(2)}
              </div>
              <button
                onClick={() => removeItem(index)}
                className="text-red-500 hover:text-red-700 transition p-2"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Calculations */}
      <div className="bg-[#fcfcfc] p-6 rounded-lg space-y-2">
        <div className="flex justify-between text-[#464646]">
          <span>Subtotal:</span>
          <span className="font-semibold">${calculateSubtotal().toFixed(2)}</span>
        </div>

        <div className="flex gap-4">
          <div className="flex-1 flex items-center space-x-2">
            <label className="text-sm text-[#bebebf]">Tax (%)</label>
            <input
              type="number"
              value={quotationData.tax}
              onChange={(e) => updateField('tax', parseFloat(e.target.value))}
              className="flex-1 px-3 py-1 rounded border border-[#e9eaea] focus:outline-none focus:border-[#fcc425]"
            />
          </div>
          <div className="flex-1 flex items-center space-x-2">
            <label className="text-sm text-[#bebebf]">Discount (%)</label>
            <input
              type="number"
              value={quotationData.discount}
              onChange={(e) => updateField('discount', parseFloat(e.target.value))}
              className="flex-1 px-3 py-1 rounded border border-[#e9eaea] focus:outline-none focus:border-[#fcc425]"
            />
          </div>
        </div>

        <div className="border-t border-[#e9eaea] pt-3 mt-3 flex justify-between text-lg font-bold text-[#464646]">
          <span>Total:</span>
          <span>${calculateTotal().toFixed(2)}</span>
        </div>
      </div>

      {/* Logo and Signature */}
      <div>
        <h3 className="text-lg font-semibold text-[#464646] mb-3">Branding</h3>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="text-sm font-medium text-[#464646] mb-2 block">Company Logo</label>
            <input
              type="text"
              placeholder="Paste image URL here"
              value={quotationData.logoUrl || ''}
              onChange={(e) => updateField('logoUrl', e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-[#e9eaea] focus:outline-none focus:border-[#fcc425]"
            />
            {quotationData.logoUrl && (
              <>
                <div className="mt-2 p-2 border border-[#e9eaea] rounded-lg bg-[#fcfcfc]">
                  <img 
                    src={quotationData.logoUrl} 
                    alt="Logo Preview" 
                    className="max-h-16 max-w-full object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
                <div className="mt-2">
                  <label className="text-sm text-[#bebebf] mb-1 block">Logo Position</label>
                  <select
                    value={quotationData.logoPosition || 'top-right'}
                    onChange={(e) => updateField('logoPosition', e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-[#e9eaea] focus:outline-none focus:border-[#fcc425]"
                  >
                    <option value="top-left">Top Left</option>
                    <option value="top-center">Top Center</option>
                    <option value="top-right">Top Right</option>
                  </select>
                </div>
              </>
            )}
          </div>

          <div>
            <label className="text-sm font-medium text-[#464646] mb-2 block">Signature</label>
            <input
              type="text"
              placeholder="Paste signature image URL here"
              value={quotationData.signatureUrl || ''}
              onChange={(e) => updateField('signatureUrl', e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-[#e9eaea] focus:outline-none focus:border-[#fcc425]"
            />
            {quotationData.signatureUrl && (
              <>
                <div className="mt-2 p-2 border border-[#e9eaea] rounded-lg bg-[#fcfcfc]">
                  <img 
                    src={quotationData.signatureUrl} 
                    alt="Signature Preview" 
                    className="max-h-16 max-w-full object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
                <div className="mt-2">
                  <label className="text-sm text-[#bebebf] mb-1 block">Signature Position</label>
                  <select
                    value={quotationData.signaturePosition || 'bottom-right'}
                    onChange={(e) => updateField('signaturePosition', e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-[#e9eaea] focus:outline-none focus:border-[#fcc425]"
                  >
                    <option value="bottom-left">Bottom Left</option>
                    <option value="bottom-center">Bottom Center</option>
                    <option value="bottom-right">Bottom Right</option>
                  </select>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Notes and Terms */}
      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="text-sm font-medium text-[#464646] mb-2 block">Notes</label>
          <textarea
            placeholder="Additional notes..."
            value={quotationData.notes}
            onChange={(e) => updateField('notes', e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-[#e9eaea] focus:outline-none focus:border-[#fcc425] h-24"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-[#464646] mb-2 block">Terms</label>
          <textarea
            placeholder="Payment terms..."
            value={quotationData.terms}
            onChange={(e) => updateField('terms', e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-[#e9eaea] focus:outline-none focus:border-[#fcc425] h-24"
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 justify-end pt-6 border-t border-[#e9eaea] flex-wrap">
        {isEditing && (
          <>
            <button
              onClick={() => handleDownload()}
              disabled={loading}
              className="bg-gray-200 text-[#464646] px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition flex items-center space-x-2 disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>Download PDF</span>
            </button>
            <button
              onClick={() => handleSendEmail()}
              disabled={loading}
              className="bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-600 transition flex items-center space-x-2 disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>Send Email</span>
            </button>
            <button
              onClick={() => handleConvertToInvoice()}
              disabled={loading}
              className="bg-purple-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-600 transition flex items-center space-x-2 disabled:opacity-50"
            >
              <FileText className="w-4 h-4" />
              <span>Convert to Invoice</span>
            </button>
          </>
        )}
        <button
          onClick={() => handleSave('draft')}
          disabled={loading}
          className="bg-gray-300 text-[#464646] px-6 py-3 rounded-lg font-semibold hover:bg-gray-400 transition flex items-center space-x-2 disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{loading ? 'Saving...' : 'Save Draft'}</span>
        </button>
        <button
          onClick={() => handleSave('sent')}
          disabled={loading}
          className="bg-[#fcc425] text-[#464646] px-6 py-3 rounded-lg font-semibold hover:bg-[#fae29b] transition flex items-center space-x-2 disabled:opacity-50"
        >
          <Send className="w-4 h-4" />
          <span>{loading ? 'Sending...' : 'Save & Send'}</span>
        </button>
      </div>
    </div>
  );
}
