import { useCallback, useEffect, useState } from 'react';
import {
  Loader2, Check, X, FileImage, ExternalLink,
  Clock, CheckCircle2, XCircle, AlertCircle,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { ProPaymentRequest } from '../lib/supabase';

type StatusFilter = 'pending' | 'approved' | 'rejected';

export default function AdminPaymentRequestsTab() {
  const [filter, setFilter] = useState<StatusFilter>('pending');
  const [requests, setRequests] = useState<ProPaymentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  const showToast = (type: 'success' | 'error', msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 4000);
  };

  const loadRequests = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('pro_payment_requests')
      .select('*, profiles(username, full_name)')
      .eq('status', filter)
      .order('created_at', { ascending: false });

    if (error) {
      showToast('error', error.message);
    } else {
      setRequests((data as ProPaymentRequest[]) || []);
    }
    setLoading(false);
  }, [filter]);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  async function reviewRequest(requestId: string, approve: boolean) {
    setProcessingId(requestId);
    const { data, error } = await supabase.rpc('admin_review_pro_payment', {
      p_request_id: requestId,
      p_approve: approve,
    });

    if (error || !data?.success) {
      showToast('error', error?.message || data?.message || 'Could not process request.');
    } else {
      showToast('success', approve ? 'Approved — user upgraded to Pro.' : 'Request rejected.');
      setRequests((prev) => prev.filter((r) => r.id !== requestId));
    }
    setProcessingId(null);
  }

  const filters: { id: StatusFilter; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'pending', label: 'Pending', icon: Clock },
    { id: 'approved', label: 'Approved', icon: CheckCircle2 },
    { id: 'rejected', label: 'Rejected', icon: XCircle },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display font-bold text-lg text-slate-900 mb-1">Pro Payment Requests</h2>
        <p className="text-slate-500 text-sm">Review receipts and approve or reject Pro upgrades.</p>
      </div>

      {toast && (
        <div className={`flex items-center gap-2 px-5 py-3 rounded-xl ${
          toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
        }`}>
          {toast.type === 'success' ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span className="text-sm font-medium">{toast.msg}</span>
        </div>
      )}

      <div className="flex gap-2">
        {filters.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold border transition-colors ${
              filter === f.id
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
            }`}
          >
            <f.icon className="w-4 h-4" />
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-6 h-6 text-primary-600 animate-spin" />
        </div>
      ) : requests.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 py-16 text-center">
          <FileImage className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 text-sm">No {filter} requests.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map((r) => (
            <div key={r.id} className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col sm:flex-row gap-4">
              <a
                href={r.receipt_url}
                target="_blank"
                rel="noreferrer"
                className="w-full sm:w-32 h-32 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden flex-shrink-0 group relative"
              >
                <img
                  src={r.receipt_url}
                  alt="Receipt"
                  className="w-full h-full object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 flex items-center justify-center transition-colors">
                  <ExternalLink className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </a>

              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-1">
                  <p className="font-semibold text-slate-900">{r.full_name}</p>
                  <span className="text-xs text-slate-400">@{r.profiles?.username || 'unknown'}</span>
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-500 mb-2">
                  {r.amount_sent && <span>₦{r.amount_sent.toLocaleString()}</span>}
                  {r.reference && <span>Ref: {r.reference}</span>}
                  <span>{new Date(r.created_at).toLocaleString('en-NG', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                </div>

                {filter === 'pending' && (
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => reviewRequest(r.id, true)}
                      disabled={processingId === r.id}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-semibold hover:bg-green-700 transition-colors disabled:opacity-60"
                    >
                      {processingId === r.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                      Approve
                    </button>
                    <button
                      onClick={() => reviewRequest(r.id, false)}
                      disabled={processingId === r.id}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-red-50 text-red-600 text-sm font-semibold hover:bg-red-100 transition-colors disabled:opacity-60"
                    >
                      <X className="w-4 h-4" />
                      Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}