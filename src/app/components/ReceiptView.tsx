import { useState } from "react";
import { X, Download, MessageCircle, CheckCircle2, Loader2 } from "lucide-react";
import { motion } from "motion/react";
import { renderReceiptCanvas } from "../../lib/canvas-utils";
import { type Sale, type Payment } from "../../lib/database";

function formatIDR(val: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(val);
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

type Props = {
  sales: Sale[];
  payments: Payment[];
  customerName: string;
  phone?: string | null;
  onClose: () => void;
};

export function ReceiptView({ sales, payments, customerName, phone, onClose }: Props) {
  const [downloading, setDownloading] = useState(false);

  const items = sales.map(s => ({ name: s.item_name, qty: s.qty, price: Number(s.final_price_idr) }));
  const total = sales.reduce((sum, s) => sum + Number(s.final_price_idr) * s.qty, 0);
  const dpPaid = sales.reduce((sum, s) => sum + Number(s.dp_amount), 0);
  const totalPaid = sales.reduce((sum, s) => sum + Number(s.total_paid), 0);
  const remaining = sales.reduce((sum, s) => sum + Number(s.remaining), 0);

  const receiptNum = `#JF-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${Math.random().toString(36).slice(2, 5).toUpperCase()}`;
  const dateStr = formatDate(new Date().toISOString());

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const dataUrl = await renderReceiptCanvas({
        receiptNumber: receiptNum, date: dateStr, customerName,
        items, total, dpPaid, totalPaid, remaining,
      });
      const link = document.createElement("a");
      link.download = `receipt_${customerName.replace(/\s+/g, "_")}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Download failed:", err);
    } finally {
      setDownloading(false);
    }
  };

  const handleWhatsApp = () => {
    const itemList = items.map(i => `• ${i.name} ×${i.qty} = ${formatIDR(i.price * i.qty)}`).join("\n");
    const msg = encodeURIComponent(
      `🧾 *RECEIPT - JastipFlow*\n${receiptNum}\n${dateStr}\n\nHalo ${customerName}! 👋\n\n${itemList}\n\n*Total: ${formatIDR(total)}*\nDP: ${formatIDR(dpPaid)}\nDibayar: ${formatIDR(totalPaid)}\n*Sisa: ${remaining <= 0 ? "✅ LUNAS" : formatIDR(remaining)}*\n\nTerima kasih! 🙏`
    );
    const waUrl = phone ? `https://wa.me/${phone.replace(/^0/, "62")}?text=${msg}` : `https://wa.me/?text=${msg}`;
    window.open(waUrl, "_blank");
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-[#F4F6FA] overflow-y-auto">
      <div className="max-w-md mx-auto pb-8">
        {/* Header */}
        <div className="bg-white px-5 pt-14 pb-4 flex items-center justify-between border-b border-gray-100">
          <h2 className="font-bold text-gray-900 text-lg">Receipt</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        <div className="px-5 py-5 space-y-4">
          {/* Receipt Card */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
            {/* Brand Header */}
            <div className="bg-gradient-to-r from-[#2563EB] to-[#1d4ed8] px-6 py-5 text-center">
              <p className="text-white text-2xl mb-1">🛍️ JastipFlow</p>
              <p className="text-blue-200 text-sm font-medium tracking-wider uppercase">Receipt</p>
            </div>

            <div className="px-6 py-5 space-y-4">
              {/* Receipt Info */}
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">{receiptNum}</span>
                <span className="text-gray-400">{dateStr}</span>
              </div>
              <div>
                <p className="text-gray-400 text-xs uppercase tracking-wider">Customer</p>
                <p className="font-bold text-gray-900 text-lg">{customerName}</p>
              </div>

              {/* Items */}
              <div className="border-t border-b border-gray-100 py-3 space-y-2">
                {items.map((item, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span className="text-gray-700">{item.name} <span className="text-gray-400">×{item.qty}</span></span>
                    <span className="font-semibold text-gray-800">{formatIDR(item.price * item.qty)}</span>
                  </div>
                ))}
              </div>

              {/* Summary */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Total</span>
                  <span className="font-semibold text-gray-800">{formatIDR(total)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">DP Paid</span>
                  <span className="font-semibold text-green-600">{formatIDR(dpPaid)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Total Paid</span>
                  <span className="font-semibold text-green-600">{formatIDR(totalPaid)}</span>
                </div>
                <div className="h-px bg-gray-100" />
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-700">Remaining</span>
                  <span className={`font-bold text-lg ${remaining <= 0 ? "text-green-600" : "text-red-500"}`}>
                    {remaining <= 0 ? "✓ LUNAS" : formatIDR(remaining)}
                  </span>
                </div>
              </div>

              {/* Payment History */}
              {payments.length > 0 && (
                <div className="border-t border-gray-100 pt-3">
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Payment History</p>
                  <div className="space-y-1.5">
                    {payments.map((p) => (
                      <div key={p.id} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-3 h-3 text-green-500" />
                          <span className="text-gray-600">{formatDate(p.created_at)}</span>
                          <span className="text-gray-400 capitalize">{p.payment_method}</span>
                        </div>
                        <span className="font-semibold text-green-600">{formatIDR(Number(p.amount))}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-6 py-3 text-center">
              <p className="text-gray-400 text-xs">Thank you for your order! 🙏</p>
            </div>
          </motion.div>

          {/* Actions */}
          <div className="space-y-3">
            <button onClick={handleWhatsApp}
              className="w-full h-[52px] rounded-2xl font-semibold bg-[#25D366] text-white flex items-center justify-center gap-2.5 active:scale-[0.98] transition-transform">
              <MessageCircle className="w-5 h-5" /> Share via WhatsApp
            </button>
            <button onClick={handleDownload} disabled={downloading}
              className="w-full h-[48px] rounded-xl font-medium bg-white border border-gray-200 text-gray-600 flex items-center justify-center gap-2 text-sm active:scale-[0.98] transition-transform">
              {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              Download Receipt Image
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
