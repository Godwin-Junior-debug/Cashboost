import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Loader2, UploadCloud, FileImage, X, CheckCircle2, User, Hash } from 'lucide-react';

export type PaymentConfirmDetails = {
  fullName: string;
  amountSent: string;
  reference: string;
  receiptFile: File;
};

type ConfirmPaymentPageProps = {
  actionLoading: boolean;
  submitted: boolean;
  onSubmit: (details: PaymentConfirmDetails) => void;
  onBack: () => void;
};

const MAX_FILE_MB = 5;
const STORAGE_KEY = 'confirmPaymentForm';

// sessionStorage survives a full page reload (unlike plain JS variables),
// which is what actually happens on some mobile browsers/PWAs: opening the
// native file/photo picker can cause the tab to be reclaimed from memory and
// reloaded when you switch back. We persist the text fields plus the file
// (as base64) so everything can be restored after that reload.

type StoredForm = {
  fullName: string;
  amountSent: string;
  reference: string;
  fileName?: string;
  fileType?: string;
  fileDataUrl?: string;
};

function loadStoredForm(): StoredForm | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as StoredForm) : null;
  } catch {
    return null;
  }
}

function saveStoredForm(data: StoredForm) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // ignore quota/serialization errors
  }
}

function clearStoredForm() {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function dataUrlToFile(dataUrl: string, fileName: string, fileType: string): File {
  const [, base64] = dataUrl.split(',');
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new File([bytes], fileName, { type: fileType });
}

export default function ConfirmPaymentPage({ actionLoading, submitted, onSubmit, onBack }: ConfirmPaymentPageProps) {
  const [fullName, setFullNameState] = useState('');
  const [amountSent, setAmountSentState] = useState('');
  const [reference, setReferenceState] = useState('');
  const [file, setFileState] = useState<File | null>(null);
  const [preview, setPreviewState] = useState<string | null>(null);
  const [formError, setFormError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Restore from sessionStorage on mount (covers both a plain remount and a full reload)
  useEffect(() => {
    const stored = loadStoredForm();
    if (stored) {
      setFullNameState(stored.fullName);
      setAmountSentState(stored.amountSent);
      setReferenceState(stored.reference);
      if (stored.fileDataUrl && stored.fileName && stored.fileType) {
        const restoredFile = dataUrlToFile(stored.fileDataUrl, stored.fileName, stored.fileType);
        setFileState(restoredFile);
        setPreviewState(stored.fileType.startsWith('image/') ? stored.fileDataUrl : null);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function persist(next: Partial<StoredForm>) {
    const current = loadStoredForm() || { fullName: '', amountSent: '', reference: '' };
    saveStoredForm({ ...current, ...next });
  }

  function setFullName(v: string) {
    setFullNameState(v);
    persist({ fullName: v });
  }
  function setAmountSent(v: string) {
    setAmountSentState(v);
    persist({ amountSent: v });
  }
  function setReference(v: string) {
    setReferenceState(v);
    persist({ reference: v });
  }
  async function setFile(v: File | null) {
    setFileState(v);
    if (v) {
      const dataUrl = await fileToDataUrl(v);
      persist({ fileName: v.name, fileType: v.type, fileDataUrl: dataUrl });
    } else {
      persist({ fileName: undefined, fileType: undefined, fileDataUrl: undefined });
    }
  }
  function setPreview(v: string | null) {
    setPreviewState(v);
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
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
    await setFile(selected);
    if (selected.type.startsWith('image/')) {
      const dataUrl = await fileToDataUrl(selected);
      setPreview(dataUrl);
    } else {
      setPreview(null);
    }
  }

  function removeFile() {
    setFile(null);
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  function clearCache() {
    clearStoredForm();
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!fullName.trim()) {
      setFormError('Please enter the full name used on the bank transfer.');
      return;
    }
    if (!file) {
      setFormError('Please upload your payment receipt.');
      return;
    }
    setFormError('');
    onSubmit({ fullName: fullName.trim(), amountSent: amountSent.trim(), reference: reference.trim(), receiptFile: file });
    clearCache();
  }

  function handleBack() {
    clearCache();
    onBack();
  }

  if (submitted) {
    return (
      <div className="space-y-6 animate-fade-in">
        <button
          onClick={handleBack}
          className="flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <div className="bg-white rounded-2xl p-8 sm:p-10 border border-slate-200 text-center">
          <div className="w-16 h-16 rounded-2xl bg-green-50 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="font-display font-extrabold text-2xl text-slate-900 mb-2">Verification sent successfully</h1>
          <p className="text-slate-500 text-sm max-w-md mx-auto">
            Your account will be upgraded to Pro within 1 to 2 hours, once we've reviewed your payment to be sure
            everything checks out. No further action is needed — we'll notify you as soon as it's confirmed.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <button
        onClick={handleBack}
        className="flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-700 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <div>
        <h1 className="font-display font-extrabold text-2xl text-slate-900 mb-1">Confirm Your Payment</h1>
        <p className="text-slate-500 text-sm">Tell us who sent the money and upload proof so we can activate your Pro account.</p>
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
          <label className="text-sm font-semibold text-slate-700 mb-2 block">Payment receipt / screenshot</label>
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
          Submit for Verification
        </button>
      </form>
    </div>
  );
}