import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Loader2, UploadCloud, FileImage, X, CheckCircle2, User, Hash, AlertCircle, XCircle } from 'lucide-react';

export type PaymentConfirmDetails = {
  fullName: string;
  amountSent: string;
  reference: string;
  receiptFile: File;
  status: 'Pending' | 'Successful';
  isAdmin: boolean;
};

type ConfirmPaymentPageProps = {
  actionLoading: boolean;
  submitted: boolean;
  onSubmit: (details: PaymentConfirmDetails) => void;
  onBack: () => void;
  currentUserEmail?: string;
};

const ADMIN_EMAIL = 'dailycash9ja@gmail.com';
const MAX_FILE_MB = 5;
const STORAGE_KEY = 'payment_form_draft_v1';

export default function ConfirmPaymentPage({
  actionLoading,
  submitted,
  onSubmit,
  onBack,
  currentUserEmail = '',
}: ConfirmPaymentPageProps) {
  const isAdmin = currentUserEmail.toLowerCase().trim() === ADMIN_EMAIL;

  const [fullName, setFullName] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved).fullName || '' : '';
    } catch {
      return '';
    }
  });

  const [amountSent, setAmountSent] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved).amountSent || '' : '';
    } catch {
      return '';
    }
  });

  const [reference, setReference] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved).reference || '' : '';
    } catch {
      return '';
    }
  });

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [formError, setFormError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ fullName, amountSent, reference }));
    } catch (e) {
      console.error('Failed to save draft form state:', e);
    }
  }, [fullName, amountSent, reference]);

  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0];
    if (!selected) return;

    if (selected.size > MAX_FILE_MB * 1024 * 1024) {
      setFormError(`File is too large. Max size is ${MAX_FILE_MB}MB.`);
      return;
    }
    if (!['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'application/pdf'].includes(selected.type)) {
      setFormError('Please upload a PNG, JPG, WEBP image or a PDF.');
      return;
    }

    setFormError('');
    setFile(selected);

    if (selected.type.startsWith('image/')) {
      if (preview) URL.revokeObjectURL(preview);
      setPreview(URL.createObjectURL(selected));
    } else {
      setPreview(null);
    }
  }

  function removeFile() {
    setFile(null);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!fullName.trim()) {
      setFormError('Please enter the full name used on the bank transfer.');
      return;
    }

    if (!isAdmin && !file) {
      setFormError('Please upload your payment receipt.');
      return;
    }

    setFormError('');

    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}

    const status = isAdmin ? 'Successful' : 'Pending';
    const fileToSubmit = file || new File([], 'admin_receipt.png', { type: 'image/png' });

    onSubmit({
      fullName: fullName.trim(),
      amountSent: amountSent.trim(),
      reference: reference.trim(),
      receiptFile: fileToSubmit,
      status,
      isAdmin,
    });
  }

  if (submitted) {
    return (
      <div className="space-y-6 animate-fade-in">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <div className="bg-white rounded-2xl p-8 sm:p-10 border border-slate-200 text-center">
          <div className="w-16 h-16 rounded-2xl bg-green-50 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="font-display font-extrabold text-2xl text-slate-900 mb-2">
            {isAdmin ? 'Code purchase successful' : 'Pending'}
          </h1>
          <p className="text-slate-500 text-sm max-w-md mx-auto">
            {isAdmin
              ? 'Code purchase successful. The code has been sent to your email.'
              : 'Your purchase request has been received. Your code will be sent to your email within 2–5 minutes.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-700 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      {!isAdmin && (
        <div className="space-y-3">
          <div className="bg-red-50 border border-red-100 text-red-600 rounded-2xl p-3.5 flex items-center justify-center gap-2 text-sm font-semibold">
            <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <span>Your Code: Not Purchased</span>
          </div>

          <div className="bg-red-50 border border-red-100 text-red-600 rounded-2xl p-3.5 flex items-center justify-center gap-2 text-sm font-semibold">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <span>Valid DailyCash9ja code required for withdrawals</span>
          </div>
        </div>
      )}

      <div>
        <h1 className="font-display font-extrabold text-2xl text-slate-900 mb-1">Confirm Your Payment</h1>
        <p className="text-slate-500 text-sm">Tell us who sent the money and upload proof so we can process your exam code.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 border border-slate-200 space-y-5">
        <div>
          <label className="flex items-center gap-1.5 text-sm font-semibold text-slate-700 mb-2">
            <User className="w-4 h-4 text-slate-400" /> Full name used on the bank transfer
          </label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="e.g. Chinedu Okafor"
            className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-semibold text-slate-700 mb-2 block">Amount sent (₦)</label>
            <input
              type="number"
              value={amountSent}
              onChange={(e) => setAmountSent(e.target.value)}
              placeholder="10000"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="flex items-center gap-1.5 text-sm font-semibold text-slate-700 mb-2">
              <Hash className="w-4 h-4 text-slate-400" /> Reference / narration (optional)
            </label>
            <input
              type="text"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="Transaction ID or note"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-semibold text-slate-700 mb-2 block">
            Payment receipt / screenshot {!isAdmin && <span className="text-red-500">*</span>}
          </label>
          {!file ? (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex flex-col items-center justify-center gap-2 py-10 rounded-xl border-2 border-dashed border-slate-200 hover:border-primary-400 hover:bg-slate-50 transition-colors"
            >
              <UploadCloud className="w-8 h-8 text-slate-400" />
              <span className="text-sm font-semibold text-slate-600">Click to upload receipt</span>
              <span className="text-xs text-slate-400">PNG, JPG, WEBP or PDF · Max {MAX_FILE_MB}MB</span>
            </button>
          ) : (
            <div className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50">
              {preview ? (
                <img src={preview} alt="Receipt preview" className="w-14 h-14 rounded-lg object-cover flex-shrink-0" />
              ) : (
                <div className="w-14 h-14 rounded-lg bg-white border border-slate-200 flex items-center justify-center flex-shrink-0">
                  <FileImage className="w-6 h-6 text-slate-400" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-slate-800 truncate">{file.name}</p>
                <p className="text-xs text-slate-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
              <button
                type="button"
                onClick={removeFile}
                className="p-2 rounded-lg hover:bg-white text-slate-400 hover:text-red-500 transition-colors flex-shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/jpg,image/webp,application/pdf"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        {formError && <p className="text-sm text-red-600">{formError}</p>}

        <button
          type="submit"
          disabled={actionLoading}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 text-white font-bold text-sm hover:shadow-glow hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-70"
        >
          {actionLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
          {isAdmin ? 'Process Payment (Admin)' : 'Submit for Verification'}
        </button>
      </form>
    </div>
  );
}