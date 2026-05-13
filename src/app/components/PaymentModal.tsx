import { useState } from "react";
import { DollarSign, Loader2, CheckCircle2, CreditCard, Banknote, Smartphone } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { addPayment, type Sale } from "../../lib/database";
import { useAuth } from "../contexts/AuthContext";

type PaymentMethod = "transfer" | "cash" | "ewallet";

const methodConfig: Record<PaymentMethod, { label: string; icon: typeof CreditCard }> = {
  transfer: { label: "Transfer", icon: CreditCard },
  cash: { label: "Cash", icon: Banknote },
  ewallet: { label: "E-Wallet", icon: Smartphone },
};

function formatIDR(val: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(val);
}

type Props = {
  sale: Sale;
  onClose: () => void;
  onSuccess: () => void;
};

export function PaymentModal({ sale, onClose, onSuccess }: Props) {
  const { user } = useAuth();
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<PaymentMethod>("transfer");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const remaining = Number(sale.remaining);
  const amountNum = parseInt(amount) || 0;

  const handleConfirm = async () => {
    if (!user || amountNum <= 0) return;
    setSaving(true);
    try {
      await addPayment({
        sale_id: sale.id,
        user_id: user.id,
        amount: amountNum,
        payment_method: method,
        note: note || null,
      });
      setSaved(true);
      setTimeout(() => { onSuccess(); onClose(); }, 1000);
    } catch (err) {
      console.error("Payment failed:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-4">
        <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-xl">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-gray-900 text-lg">Record Payment</h3>
              <p className="text-gray-400 text-sm">for {sale.customer_name}</p>
            </div>
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500">✕</button>
          </div>
          <div className="p-5 space-y-4">
            <div className="bg-red-50 border border-red-100 rounded-xl p-3 text-center">
              <p className="text-red-400 text-[11px] uppercase tracking-wider font-semibold">Outstanding</p>
              <p className="text-red-600 font-bold text-xl">{formatIDR(remaining)}</p>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">Amount (IDR)</label>
              <div className="relative">
                <DollarSign className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0"
                  className="w-full h-12 bg-[#F4F6FA] rounded-xl pl-10 pr-4 text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-[#2563EB]" />
              </div>
            </div>

            <div className="flex gap-2">
              <button onClick={() => setAmount(remaining.toString())}
                className="flex-1 h-10 rounded-xl bg-blue-50 border border-blue-200 text-xs font-semibold text-blue-600 active:scale-95 transition-transform">
                Pay All
              </button>
              <button onClick={() => setAmount(Math.round(remaining / 2).toString())}
                className="flex-1 h-10 rounded-xl bg-gray-50 border border-gray-200 text-xs font-semibold text-gray-600 active:scale-95 transition-transform">
                Pay Half
              </button>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Method</label>
              <div className="flex gap-2">
                {(Object.keys(methodConfig) as PaymentMethod[]).map((m) => {
                  const mc = methodConfig[m];
                  const Icon = mc.icon;
                  return (
                    <button key={m} onClick={() => setMethod(m)}
                      className={`flex-1 h-11 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                        method === m ? "bg-[#2563EB] text-white" : "bg-gray-50 border border-gray-200 text-gray-600"
                      }`}>
                      <Icon className="w-3.5 h-3.5" />{mc.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">Note (optional)</label>
              <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Transfer BCA"
                className="w-full h-11 bg-[#F4F6FA] rounded-xl px-4 text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]" />
            </div>

            {amountNum > 0 && (
              <div className="bg-[#F4F6FA] rounded-xl p-3 space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">After payment</span>
                  <span className={`font-bold ${remaining - amountNum <= 0 ? "text-green-600" : "text-gray-800"}`}>
                    {remaining - amountNum <= 0 ? "✓ LUNAS" : formatIDR(remaining - amountNum)}
                  </span>
                </div>
              </div>
            )}

            <button onClick={handleConfirm} disabled={saving || amountNum <= 0}
              className={`w-full h-[52px] mt-2 rounded-2xl font-semibold flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:opacity-70 ${
                saved ? "bg-green-500 text-white" : "bg-[#2563EB] text-white"
              }`}>
              {saved ? (<><CheckCircle2 className="w-5 h-5" /> Recorded!</>) :
                saving ? (<Loader2 className="w-5 h-5 animate-spin" />) :
                (<><CheckCircle2 className="w-5 h-5" /> Confirm Payment</>)}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
