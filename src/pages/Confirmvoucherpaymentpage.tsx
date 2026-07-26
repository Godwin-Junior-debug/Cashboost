import { useState } from 'react';
import { ArrowLeft, Loader2, UploadCloud, CheckCircle2, FileImage } from 'lucide-react';

export type VoucherPaymentConfirmDetails = {
  fullName: string;
  amountSent: string;
  reference: string;
  receiptFile: File;
};

type ConfirmVoucherPaymentPageProps = {
  voucherValue: number;
  purchasePrice: number;
  actionLoading: boolean;
  submitted: boolean;
  onSubmit: (details: VoucherPaymentConfirmDetails) => Promise<void>;
  onBack: () => void;
};

export default function ConfirmVoucherPaymentPage({
  voucherValue,
  purchasePrice,
  actionLoading,
  submitted,
  onSubmit,
  onBack,
}: ConfirmVoucherPaymentPageProps) {
  const [fullName, setFullName] = useState('');
  const [amountSent, setAmountSent] = useState(purchasePrice.toString());
  const [reference, setReference] = useState('');
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!fullName.trim()) {
      setError('Enter the name used on the transfer.');
      return;
    }
    if (!receiptFile) {
      setError('Upload a screenshot or photo of your payment receipt.');
      return;
    }

    await onSubmit({ fullName: fullName.trim(), amountSent, reference: reference.trim(), receiptFile });
  }

  if (submitted) {
    return (
      <div className="space-y-6 animate-fade-in max-w-lg">
        <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-7 h-7 text-white" />
          </div>
          <div>
            <h2 className="font-display font-extrabold text-xl text-slate-900">Payment submitted</h2>
            <p className="text-slate-500 text-sm mt-1">
              We're reviewing your ₦{purchasePrice.toLocaleString()} payment for the ₦{voucherValue.toLocaleString()} voucher.
              Your code will be sent within 1 to 2 hours.
            </p>
          </div>
          <button
            onClick={onBack}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-primary-600 to-accent-500 text-white font-bold text-sm hover:shadow-glow hover:scale-[1.01] active:scale-[0.99] transition-all"
          >
            Back to Overview
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-lg">
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="w-10 h-10 rounded-2xl bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors flex-shrink-0"
        >
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </button>
        <div>
          <h1 className="font-display font-extrabold text-xl sm:text-2xl text-slate-900">Confirm Payment</h1>
          <p className="text-slate-500 text-xs sm:text-sm">Tell us about your transfer so we can verify it quickly.</p>
        </div>
      </div>

      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center justify-between">
        <span className="text-sm text-slate-500">Voucher</span>
        <span className="text-sm font-semibold text-slate-800">
          ₦{voucherValue.toLocaleString()} for ₦{purchasePrice.toLocaleString()}
        </span>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 border border-slate-200 space-y-5">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Name on transfer</label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Full name used for the bank transfer"
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Amount sent</label>
          <input
            type="number"
            value={amountSent}
            onChange={(e) => setAmountSent(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Transfer reference <span className="text-slate-400 font-normal">(optional)</span>
          </label>
          <input
            type="text"
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            placeholder="e.g. session ID or narration"
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Payment receipt</label>
          <label
            htmlFor="voucher-receipt-upload"
            className="flex flex-col items-center justify-center gap-2 py-8 rounded-xl border-2 border-dashed border-slate-200 hover:border-primary-300 hover:bg-primary-50/30 transition-colors cursor-pointer text-center"
          >
            {receiptFile ? (
              <>
                <FileImage className="w-6 h-6 text-primary-600" />
                <span className="text-sm font-medium text-slate-700 px-4 truncate max-w-full">{receiptFile.name}</span>
                <span className="text-xs text-slate-400">Tap to choose a different file</span>
              </>
            ) : (
              <>
                <UploadCloud className="w-6 h-6 text-slate-400" />
                <span className="text-sm font-medium text-slate-600">Tap to upload screenshot or photo</span>
                <span className="text-xs text-slate-400">PNG, JPG up to 5MB</span>
              </>
            )}
          </label>
          <input
            id="voucher-receipt-upload"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => setReceiptFile(e.target.files?.[0] || null)}
          />
        </div>

        {error && <p className="text-sm text-red-600 font-medium">{error}</p>}

        <button
          type="submit"
          disabled={actionLoading}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-primary-600 to-accent-500 text-white font-bold text-sm hover:shadow-glow hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-60 disabled:hover:scale-100"
        >
          {actionLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
          {actionLoading ? 'Submitting...' : 'Submit for Review'}
        </button>
      </form>
    </div>
  );
}