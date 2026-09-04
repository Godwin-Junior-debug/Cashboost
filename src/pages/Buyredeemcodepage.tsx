import { ShoppingBag, Wallet, Crown, Check, Info, ArrowLeft } from 'lucide-react';

type BuyRedeemCodePageProps = {
  walletBalance: number;
  onBuyClick: (tier: { value: number; price: number }) => void;
  onBack: () => void;
};

type VoucherTier = {
  id: string;
  value: number;
  price: number;
  popular?: boolean;
};

// NOTE: placeholder tiers — replace values/prices with whatever discount
// structure you actually want to offer. `value` is what the code is worth
// when redeemed, `price` is what it costs via bank transfer.
const TIERS: VoucherTier[] = [
  { id: 't1', value: 5000, price: 4750 },
  { id: 't2', value: 10000, price: 9400 },
  { id: 't3', value: 20000, price: 18400, popular: true },
  { id: 't4', value: 50000, price: 45000 },
  { id: 't5', value: 100000, price: 88000 },
  { id: 't6', value: 200000, price: 172000 },
];

function discountPct(value: number, price: number) {
  return Math.round(((value - price) / value) * 100);
}

export default function BuyRedeemCodePage({ walletBalance, onBuyClick, onBack }: BuyRedeemCodePageProps) {
  return (
    <div className="space-y-5 sm:space-y-6 animate-fade-in max-w-3xl">
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="w-10 h-10 rounded-2xl bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors flex-shrink-0"
        >
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </button>
        <div>
          <h1 className="font-display font-extrabold text-xl sm:text-2xl text-slate-900">Buy Redeem Vouchers</h1>
          <p className="text-slate-500 text-xs sm:text-sm">Buy a voucher below its value, then gift, sell, or redeem the code.</p>
        </div>
      </div>

      {/* Balance */}
      <div className="bg-gradient-to-br from-primary-700 via-primary-800 to-slate-950 rounded-2xl p-4 sm:p-5 flex items-center gap-3">
        <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-white/10 flex items-center justify-center flex-shrink-0">
          <Wallet className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="text-primary-200 text-xs">Wallet balance</p>
          <p className="font-display font-extrabold text-lg sm:text-xl text-white">₦{walletBalance.toLocaleString()}</p>
        </div>
      </div>

      {/* Info banner */}
      <div className="flex items-start gap-2.5 bg-primary-50 border border-primary-100 rounded-2xl px-4 py-3.5">
        <Info className="w-4 h-4 text-primary-600 mt-0.5 flex-shrink-0" />
        <p className="text-xs sm:text-sm text-primary-800">
          Pay by bank transfer, then confirm your payment — your voucher code is sent after a quick review.
        </p>
      </div>

      {/* Voucher grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        {TIERS.map((tier) => {
          const pct = discountPct(tier.value, tier.price);

          return (
            <div
              key={tier.id}
              className={`relative bg-white rounded-2xl p-4 sm:p-5 border-2 transition-all ${
                tier.popular ? 'border-amber-400 shadow-glow' : 'border-slate-200'
              }`}
            >
              {tier.popular && (
                <div className="absolute -top-3 left-4 flex items-center gap-1 px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 text-white text-[10px] font-bold shadow-sm">
                  <Crown className="w-3 h-3" />
                  MOST POPULAR
                </div>
              )}

              <div className="flex items-start justify-between mb-2">
                <span className="font-display font-bold text-sm text-primary-700">Cashboost9ja</span>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                  {pct}% OFF
                </span>
              </div>

              <p className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900 leading-tight">
                ₦{tier.value.toLocaleString()}
              </p>
              <p className="text-[11px] font-semibold tracking-wide text-slate-400 uppercase mb-3">Voucher value</p>

              <div className="flex items-center justify-between pt-3 border-t border-dashed border-slate-200">
                <div>
                  <p className="text-[11px] text-slate-400">You pay</p>
                  <p className="font-display font-bold text-base sm:text-lg text-slate-900">
                    ₦{tier.price.toLocaleString()}
                  </p>
                </div>
                <button
                  onClick={() => onBuyClick({ value: tier.value, price: tier.price })}
                  className="flex items-center justify-center gap-1.5 px-4 sm:px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary-600 to-accent-500 text-white font-bold text-xs sm:text-sm hover:shadow-glow hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  <ShoppingBag className="w-4 h-4" />
                  Buy Now
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* How it works */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200">
        <div className="flex items-center gap-2 mb-3">
          <Info className="w-4 h-4 text-slate-500" />
          <h3 className="font-display font-bold text-sm sm:text-base text-slate-900">How it works</h3>
        </div>
        <ul className="space-y-2 text-xs sm:text-sm text-slate-600">
          <li className="flex items-start gap-2">
            <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
            Pick a voucher and pay the discounted price by bank transfer.
          </li>
          <li className="flex items-start gap-2">
            <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
            Confirm your payment with the transfer receipt.
          </li>
          <li className="flex items-start gap-2">
            <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
            Your unique code is sent shortly after review.
          </li>
          <li className="flex items-start gap-2">
            <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
            Share or sell the code, or redeem it yourself on the Redeem Code page.
          </li>
        </ul>
      </div>
    </div>
  );
}