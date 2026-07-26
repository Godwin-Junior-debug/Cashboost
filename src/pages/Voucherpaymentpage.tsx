import { useState } from 'react';
import { Receipt, Landmark, Copy, Check, CheckCircle2, X } from 'lucide-react';

type BankDetails = {
  bankName: string;
  accountNumber: string;
  accountName: string;
};

type VoucherPaymentPageProps = {
  voucherValue: number;
  purchasePrice: number;
  bankDetails: BankDetails;
  onProceedToConfirm: () => void;
  onCancel: () => void;
};

export default function VoucherPaymentPage({
  voucherValue,
  purchasePrice,
  bankDetails,
  onProceedToConfirm,
  onCancel,
}: VoucherPaymentPageProps) {
  const [copied, setCopied] = useState(false);

  function copyAccountNumber() {
    navigator.clipboard.writeText(bankDetails.accountNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-lg">
      <div>
        <h1 className="font-display font-extrabold text-xl sm:text-2xl text-slate-900">Complete Payment</h1>
        <p className="text-slate-500 text-xs sm:text-sm">Transfer the exact amount below, then confirm your payment.</p>
      </div>

      {/* Order summary */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200">
        <div className="flex items-center gap-2 mb-4">
          <Receipt className="w-4 h-4 text-slate-500" />
          <h3 className="font-display font-bold text-sm sm:text-base text-slate-900">Order summary</h3>
        </div>
        <div className="flex items-center justify-between py-2.5 border-b border-slate-100">
          <span className="text-sm text-slate-500">Voucher amount</span>
          <span className="text-sm font-semibold text-slate-400 line-through">₦{voucherValue.toLocaleString()}</span>
        </div>
        <div className="flex items-center justify-between py-2.5">
          <span className="text-sm font-medium text-slate-700">Purchase price</span>
          <span className="font-display font-extrabold text-lg text-green-600">₦{purchasePrice.toLocaleString()}</span>
        </div>
      </div>

      {/* Bank transfer details */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200">
        <div className="flex items-center gap-2 mb-4">
          <Landmark className="w-4 h-4 text-slate-500" />
          <h3 className="font-display font-bold text-sm sm:text-base text-slate-900">Bank transfer details</h3>
        </div>
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 sm:p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-[11px] font-semibold tracking-wide text-slate-400 uppercase mb-1">Bank name</p>
              <p className="font-display font-bold text-sm sm:text-base text-slate-900">{bankDetails.bankName}</p>
            </div>
            <div>
              <p className="text-[11px] font-semibold tracking-wide text-slate-400 uppercase mb-1">Account name</p>
              <p className="font-display font-bold text-sm sm:text-base text-slate-900">{bankDetails.accountName}</p>
            </div>
          </div>
          <div>
            <p className="text-[11px] font-semibold tracking-wide text-slate-400 uppercase mb-1">Account number</p>
            <div className="flex items-center gap-2">
              <p className="font-display font-extrabold text-lg sm:text-xl text-primary-700 tracking-wider">
                {bankDetails.accountNumber}
              </p>
              <button
                onClick={copyAccountNumber}
                className="p-1.5 rounded-lg hover:bg-slate-200 transition-colors"
                title="Copy account number"
              >
                {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4 text-slate-500" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          onClick={onProceedToConfirm}
          className="flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-green-500 to-green-600 text-white font-bold text-sm hover:shadow-glow hover:scale-[1.01] active:scale-[0.99] transition-all"
        >
          <CheckCircle2 className="w-5 h-5" />
          I Have Made Payment
        </button>
        <button
          onClick={onCancel}
          className="flex items-center justify-center gap-2 py-3.5 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold text-sm hover:bg-slate-50 transition-all"
        >
          <X className="w-5 h-5" />
          Cancel
        </button>
      </div>
    </div>
  );
}