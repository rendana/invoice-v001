'use client';

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

export default function QuotationPreview({ quotationData }: { quotationData: QuotationData }) {
  const calculateSubtotal = () => {
    return quotationData.items.reduce((sum, item) => sum + item.amount, 0);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const taxAmount = (subtotal * quotationData.tax) / 100;
    const discountAmount = (subtotal * quotationData.discount) / 100;
    return subtotal + taxAmount - discountAmount;
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-[#e9eaea] p-8 min-h-[800px] relative">
      {/* Top Logo */}
      {quotationData.logoUrl && (
        <div className={`absolute top-8 flex justify-start ${
          quotationData.logoPosition === 'top-center' ? 'justify-center' : 
          quotationData.logoPosition === 'top-right' ? 'justify-end' : 
          'justify-start'
        } ${quotationData.logoPosition?.includes('left') ? 'left-8' : quotationData.logoPosition?.includes('right') ? 'right-8' : 'left-1/2 -translate-x-1/2'}`}>
          <img 
            src={quotationData.logoUrl} 
            alt="Company Logo" 
            className="h-16 max-w-xs object-contain"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        </div>
      )}

      {/* Header with top padding for logo */}
      <div className={`border-b-2 border-[#fcc425] pb-6 mb-6 ${quotationData.logoUrl ? 'pt-20' : ''}`}>
        <h1 className="text-4xl font-bold text-[#464646] mb-2">QUOTATION</h1>
        <p className="text-[#bebebf]">{quotationData.quotationNumber}</p>
      </div>

      {/* From & To Section */}
      <div className="grid grid-cols-2 gap-8 mb-8">
        <div>
          <h3 className="text-sm font-semibold text-[#bebebf] mb-2">FROM</h3>
          <div className="text-[#464646]">
            <p className="font-semibold">{quotationData.fromName || 'Your Name'}</p>
            <p className="text-sm">{quotationData.fromEmail || 'your@email.com'}</p>
            {quotationData.fromAddress && <p className="text-sm">{quotationData.fromAddress}</p>}
            {(quotationData.fromCity || quotationData.fromCountry) && (
              <p className="text-sm">
                {quotationData.fromCity}
                {quotationData.fromCity && quotationData.fromCountry && ', '}
                {quotationData.fromCountry}
              </p>
            )}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-[#bebebf] mb-2">QUOTE FOR</h3>
          <div className="text-[#464646]">
            <p className="font-semibold">{quotationData.toName || 'Client Name'}</p>
            <p className="text-sm">{quotationData.toEmail || 'client@email.com'}</p>
            {quotationData.toAddress && <p className="text-sm">{quotationData.toAddress}</p>}
            {(quotationData.toCity || quotationData.toCountry) && (
              <p className="text-sm">
                {quotationData.toCity}
                {quotationData.toCity && quotationData.toCountry && ', '}
                {quotationData.toCountry}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Quotation Details */}
      <div className="grid grid-cols-3 gap-4 mb-8 bg-[#fcfcfc] p-4 rounded-lg">
        <div>
          <p className="text-sm text-[#bebebf]">Quotation Date</p>
          <p className="font-semibold text-[#464646]">
            {quotationData.quotationDate ? new Date(quotationData.quotationDate).toLocaleDateString() : '-'}
          </p>
        </div>
        <div>
          <p className="text-sm text-[#bebebf]">Valid Until</p>
          <p className="font-semibold text-[#464646]">
            {quotationData.validUntil ? new Date(quotationData.validUntil).toLocaleDateString() : '-'}
          </p>
        </div>
        <div>
          <p className="text-sm text-[#bebebf]">Days Valid</p>
          <p className="font-semibold text-[#464646]">
            {quotationData.validUntil && quotationData.quotationDate
              ? Math.ceil((new Date(quotationData.validUntil).getTime() - new Date(quotationData.quotationDate).getTime()) / (1000 * 60 * 60 * 24))
              : '-'}
          </p>
        </div>
      </div>

      {/* Items Table */}
      <div className="mb-8">
        <table className="w-full">
          <thead>
            <tr className="border-b-2 border-[#e9eaea]">
              <th className="text-left py-3 text-sm font-semibold text-[#bebebf]">DESCRIPTION</th>
              <th className="text-right py-3 text-sm font-semibold text-[#bebebf]">QTY</th>
              <th className="text-right py-3 text-sm font-semibold text-[#bebebf]">RATE</th>
              <th className="text-right py-3 text-sm font-semibold text-[#bebebf]">AMOUNT</th>
            </tr>
          </thead>
          <tbody>
            {quotationData.items.map((item, index) => (
              <tr key={index} className="border-b border-[#e9eaea]">
                <td className="py-3 text-[#464646]">{item.description || 'Item description'}</td>
                <td className="py-3 text-right text-[#464646]">{item.quantity}</td>
                <td className="py-3 text-right text-[#464646]">${item.rate.toFixed(2)}</td>
                <td className="py-3 text-right text-[#464646] font-semibold">${item.amount.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="flex justify-end mb-8">
        <div className="w-64 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-[#bebebf]">Subtotal:</span>
            <span className="text-[#464646] font-semibold">${calculateSubtotal().toFixed(2)}</span>
          </div>
          {quotationData.tax > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-[#bebebf]">Tax ({quotationData.tax}%):</span>
              <span className="text-[#464646] font-semibold">
                ${((calculateSubtotal() * quotationData.tax) / 100).toFixed(2)}
              </span>
            </div>
          )}
          {quotationData.discount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-[#bebebf]">Discount ({quotationData.discount}%):</span>
              <span className="text-[#464646] font-semibold">
                -${((calculateSubtotal() * quotationData.discount) / 100).toFixed(2)}
              </span>
            </div>
          )}
          <div className="flex justify-between text-lg font-bold pt-2 border-t-2 border-[#fcc425]">
            <span className="text-[#464646]">Total:</span>
            <span className="text-[#fcc425]">${calculateTotal().toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Signature */}
      {quotationData.signatureUrl && (
        <div className={`mt-6 pt-6 border-t border-[#e9eaea] flex ${
          quotationData.signaturePosition === 'bottom-center' ? 'justify-center' : 
          quotationData.signaturePosition === 'bottom-right' ? 'justify-end' : 
          'justify-start'
        }`}>
          <div className="flex flex-col items-start">
            <p className="text-sm text-[#bebebf] mb-2">Authorized By:</p>
            <img 
              src={quotationData.signatureUrl} 
              alt="Signature" 
              className="h-12 max-w-xs object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>
        </div>
      )}

      {/* Notes */}
      {quotationData.notes && (
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-[#bebebf] mb-2">NOTES</h3>
          <p className="text-sm text-[#464646] whitespace-pre-wrap">{quotationData.notes}</p>
        </div>
      )}

      {/* Terms */}
      {quotationData.terms && (
        <div>
          <h3 className="text-sm font-semibold text-[#bebebf] mb-2">TERMS & CONDITIONS</h3>
          <p className="text-sm text-[#464646] whitespace-pre-wrap">{quotationData.terms}</p>
        </div>
      )}
    </div>
  );
}
