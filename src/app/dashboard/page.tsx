'use client';

import { useEffect, useState } from 'react';
import { FileText, DollarSign, Clock, CheckCircle, BookOpen } from 'lucide-react';
import Link from 'next/link';
import UsageWidget from '@/components/UsageWidget';

interface Stats {
  totalInvoices: number;
  totalQuotations: number;
  totalRevenue: number;
  pendingInvoices: number;
  paidInvoices: number;
  activeQuotations: number;
  acceptedQuotations: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({
    totalInvoices: 0,
    totalQuotations: 0,
    totalRevenue: 0,
    pendingInvoices: 0,
    paidInvoices: 0,
    activeQuotations: 0,
    acceptedQuotations: 0,
  });
  const [recentInvoices, setRecentInvoices] = useState<any[]>([]);
  const [recentQuotations, setRecentQuotations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'invoices' | 'quotations'>('invoices');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/dashboard/stats');
      const data = await response.json();
      setStats(data.stats);
      setRecentInvoices(data.recentInvoices);
      setRecentQuotations(data.recentQuotations);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-[#464646]">Loading...</div>;
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold text-[#464646]">Dashboard</h1>
        <p className="text-[#bebebf] mt-2">Welcome back! Here&apos;s your overview.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Stats - Left 2/3 */}
        <div className="lg:col-span-2 space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-[#e9eaea]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#bebebf]">Total Invoices</p>
                  <p className="text-3xl font-bold text-[#464646] mt-2">{stats.totalInvoices}</p>
                </div>
                <div className="bg-[#fae29b] p-3 rounded-lg">
                  <FileText className="w-6 h-6 text-[#fcc425]" />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-[#e9eaea]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#bebebf]">Total Quotations</p>
                  <p className="text-3xl font-bold text-[#464646] mt-2">{stats.totalQuotations}</p>
                </div>
                <div className="bg-[#fae29b] p-3 rounded-lg">
                  <BookOpen className="w-6 h-6 text-[#fcc425]" />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-[#e9eaea]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#bebebf]">Total Revenue</p>
                  <p className="text-3xl font-bold text-[#464646] mt-2">${stats.totalRevenue.toFixed(2)}</p>
                </div>
                <div className="bg-[#fae29b] p-3 rounded-lg">
                  <DollarSign className="w-6 h-6 text-[#fcc425]" />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-[#e9eaea]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#bebebf]">Pending Invoices</p>
                  <p className="text-3xl font-bold text-[#464646] mt-2">{stats.pendingInvoices}</p>
                </div>
                <div className="bg-[#fae29b] p-3 rounded-lg">
                  <Clock className="w-6 h-6 text-[#fcc425]" />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-[#e9eaea]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#bebebf]">Paid Invoices</p>
                  <p className="text-3xl font-bold text-[#464646] mt-2">{stats.paidInvoices}</p>
                </div>
                <div className="bg-[#fae29b] p-3 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-[#fcc425]" />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-[#e9eaea]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#bebebf]">Active Quotations</p>
                  <p className="text-3xl font-bold text-[#464646] mt-2">{stats.activeQuotations}</p>
                </div>
                <div className="bg-[#fae29b] p-3 rounded-lg">
                  <BookOpen className="w-6 h-6 text-[#fcc425]" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Usage Widget - Right 1/3 */}
        <div className="lg:col-span-1">
          <UsageWidget />
        </div>
      </div>

      {/* Recent Items with Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-[#e9eaea] overflow-hidden">
        {/* Tab Navigation */}
        <div className="flex border-b border-[#e9eaea]">
          <button
            onClick={() => setActiveTab('invoices')}
            className={`flex-1 px-6 py-4 font-semibold transition text-center ${
              activeTab === 'invoices'
                ? 'border-b-2 border-[#fcc425] text-[#464646]'
                : 'text-[#bebebf] hover:text-[#464646]'
            }`}
          >
            Recent Invoices
          </button>
          <button
            onClick={() => setActiveTab('quotations')}
            className={`flex-1 px-6 py-4 font-semibold transition text-center ${
              activeTab === 'quotations'
                ? 'border-b-2 border-[#fcc425] text-[#464646]'
                : 'text-[#bebebf] hover:text-[#464646]'
            }`}
          >
            Recent Quotations
          </button>
        </div>

        {/* Invoices Tab */}
        {activeTab === 'invoices' && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#fcfcfc]">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#bebebf] uppercase tracking-wider">
                    Invoice #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#bebebf] uppercase tracking-wider">
                    Client
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#bebebf] uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#bebebf] uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#bebebf] uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e9eaea]">
                {recentInvoices.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-[#bebebf]">
                      No invoices yet. <Link href="/dashboard/create" className="text-[#fcc425] hover:underline">Create your first invoice</Link>
                    </td>
                  </tr>
                ) : (
                  recentInvoices.map((invoice) => (
                    <tr key={invoice.id} className="hover:bg-[#fcfcfc]">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#464646]">
                        {invoice.invoiceNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#464646]">
                        {invoice.toName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#464646]">
                        ${invoice.total.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          invoice.status === 'paid' 
                            ? 'bg-green-100 text-green-800' 
                            : invoice.status === 'sent'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {invoice.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#bebebf]">
                        {new Date(invoice.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Quotations Tab */}
        {activeTab === 'quotations' && (
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
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#bebebf] uppercase tracking-wider">
                    Valid Until
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e9eaea]">
                {recentQuotations.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-[#bebebf]">
                      No quotations yet. <Link href="/dashboard/quotations/create" className="text-[#fcc425] hover:underline">Create your first quotation</Link>
                    </td>
                  </tr>
                ) : (
                  recentQuotations.map((quotation) => (
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
                        {new Date(quotation.validUntil).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}