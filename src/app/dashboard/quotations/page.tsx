'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Download, Trash2, Edit } from 'lucide-react';

export default function QuotationsPage() {
  const [quotations, setQuotations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuotations();
  }, []);

  const fetchQuotations = async () => {
    try {
      const response = await fetch('/api/quotations');
      const data = await response.json();
      setQuotations(data.quotations || data);
    } catch (error) {
      console.error('Error fetching quotations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (quotation: any) => {
    try {
      const response = await fetch('/api/quotations/pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: quotation.id }),
      });

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${quotation.quotationNumber}.pdf`;
      a.click();
    } catch (error) {
      console.error('Error downloading PDF:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this quotation?')) return;

    try {
      await fetch(`/api/quotations/${id}`, { method: 'DELETE' });
      fetchQuotations();
    } catch (error) {
      console.error('Error deleting quotation:', error);
    }
  };

  if (loading) {
    return <div className="text-[#464646]">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-[#464646]">Quotations</h1>
          <p className="text-[#bebebf] mt-2">Manage all your quotations</p>
        </div>
        <Link
          href="/dashboard/quotations/create"
          className="bg-[#fcc425] text-[#464646] px-6 py-3 rounded-lg font-semibold hover:bg-[#fae29b] transition"
        >
          Create Quotation
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-[#e9eaea] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#fcfcfc]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#bebebf] uppercase tracking-wider">
                  Quotation #
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#bebebf] uppercase tracking-wider">
                  Client
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#bebebf] uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#bebebf] uppercase tracking-wider">
                  Valid Until
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#bebebf] uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#bebebf] uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#bebebf] uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e9eaea]">
              {quotations.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-[#bebebf]">
                    No quotations yet. <Link href="/dashboard/quotations/create" className="text-[#fcc425] hover:underline">Create your first quotation</Link>
                  </td>
                </tr>
              ) : (
                quotations.map((quotation) => (
                  <tr key={quotation.id} className="hover:bg-[#fcfcfc]">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#464646]">
                      {quotation.quotationNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#464646]">
                      {quotation.toName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#464646]">
                      ${quotation.total.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#bebebf]">
                      {new Date(quotation.validUntil).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        quotation.status === 'accepted' 
                          ? 'bg-green-100 text-green-800' 
                          : quotation.status === 'sent'
                          ? 'bg-blue-100 text-blue-800'
                          : quotation.status === 'rejected'
                          ? 'bg-red-100 text-red-800'
                          : quotation.status === 'converted'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {quotation.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#bebebf]">
                      {new Date(quotation.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex space-x-3">
                        <Link
                          href={`/dashboard/quotations/${quotation.id}`}
                          className="text-[#464646] hover:text-[#fcc425] transition"
                          title="Edit Quotation"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDownload(quotation)}
                          className="text-[#fcc425] hover:text-[#fae29b] transition"
                          title="Download PDF"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(quotation.id)}
                          className="text-red-500 hover:text-red-700 transition"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
