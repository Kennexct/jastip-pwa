import { useNavigate, useLocation } from "react-router";
import {
  CheckCircle2, Share2, Home, Download, Sparkles, Copy,
  MessageCircle, Package, ArrowRight,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";

function formatIDR(val: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(val);
}

export function WishlistFulfill() {
  const navigate = useNavigate();
  const location = useLocation();
  const [copied, setCopied] = useState(false);

  const state = location.state as {
    itemName?: string; finalIDR?: number; canvasImage?: string;
    customerName?: string; customerQty?: number; excessQty?: number;
    totalBill?: number; dpAmount?: number; remaining?: number; phone?: string;
  } | null;

  const itemName = state?.itemName || "Item";
  const finalIDR = state?.finalIDR || 0;
  const canvasImage = state?.canvasImage || null;
  const customerName = state?.customerName || "Customer";
  const customerQty = state?.customerQty || 1;
  const excessQty = state?.excessQty || 0;
  const totalBill = state?.totalBill || 0;
  const dpAmount = state?.dpAmount || 0;
  const remaining = state?.remaining || 0;
  const phone = state?.phone || "";

  const handleDownload = () => {
    if (!canvasImage) return;
    const link = document.createElement("a");
    link.download = `${itemName.replace(/\s+/g, "_")}_jastipflow.jpg`;
    link.href = canvasImage;
    link.click();
  };

  const handleCopy = () => {
    const text = `${itemName}\nHarga: ${formatIDR(finalIDR)}\n\n📸 Ready Stock!\nOrder via DM/WA 🛍️`;
    navigator.clipboard.writeText(text).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleWhatsApp = () => {
    const msg = encodeURIComponent(
      `Halo ${customerName}! 👋\n\nPesanan kamu sudah ditemukan! ✅\n\n🛍️ ${itemName}\nQTY: ${customerQty}\nHarga: ${formatIDR(finalIDR)}/pcs\n\n*Total: ${formatIDR(totalBill)}*\nDP: ${formatIDR(dpAmount)}\n*Sisa Tagihan: ${formatIDR(remaining)}*\n\n${remaining > 0 ? "Mohon segera dilunasi ya! 🙏" : "✅ Sudah lunas! Terima kasih 🙏"}`
    );
    const waUrl = phone ? `https://wa.me/${phone.replace(/^0/, "62")}?text=${msg}` : `https://wa.me/?text=${msg}`;
    window.open(waUrl, "_blank");
  };

  return (
    <div className="min-h-screen bg-[#F4F6FA]">
      {/* Header */}
      <div className="bg-white px-5 pt-14 pb-5 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 300, delay: 0.1 }}
            className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6 text-green-500" />
          </motion.div>
          <div>
            <h1 className="text-gray-900 font-bold text-xl">Order Fulfilled!</h1>
            <p className="text-gray-400 text-xs">Canvas image ready to share</p>
          </div>
        </div>
      </div>

      <div className="px-5 py-5 space-y-4">
        {/* Canvas Preview */}
        <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.15 }}
          className="bg-white rounded-3xl shadow-sm overflow-hidden border border-gray-100">
          {canvasImage ? (
            <img src={canvasImage} alt={itemName} className="w-full aspect-square object-cover" />
          ) : (
            <div className="w-full aspect-square bg-gradient-to-br from-gray-200 to-gray-100 flex items-center justify-center">
              <Sparkles className="w-12 h-12 text-gray-300" />
            </div>
          )}
        </motion.div>

        {/* Order Summary */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3">
          <h3 className="font-semibold text-gray-900 text-sm">Order Summary</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Customer</span>
              <span className="font-semibold text-gray-800">{customerName}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">{itemName} ×{customerQty}</span>
              <span className="font-semibold text-gray-800">{formatIDR(totalBill)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">DP Paid</span>
              <span className="font-semibold text-green-600">{formatIDR(dpAmount)}</span>
            </div>
            <div className="h-px bg-gray-100" />
            <div className="flex justify-between">
              <span className="text-sm font-semibold text-gray-700">Remaining</span>
              <span className={`font-bold ${remaining <= 0 ? "text-green-600" : "text-red-500"}`}>
                {remaining <= 0 ? "✓ Lunas" : formatIDR(remaining)}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Split Info */}
        {excessQty > 0 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
            className="bg-blue-50 border border-blue-100 rounded-2xl px-4 py-3 flex items-start gap-3">
            <Package className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-blue-800 font-semibold text-sm">+{excessQty} added to Ready Stock</p>
              <p className="text-blue-600 text-xs mt-0.5">Excess items saved to your catalog for resale</p>
            </div>
          </motion.div>
        )}

        {/* Success Banner */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="bg-green-50 border border-green-100 rounded-2xl px-4 py-3 flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-green-800 font-semibold text-sm">Wishlist fulfilled!</p>
            <p className="text-green-600 text-xs mt-0.5">Watermark & price overlay applied. Share now!</p>
          </div>
        </motion.div>

        {/* Actions */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="space-y-3">
          <button onClick={handleWhatsApp}
            className="w-full h-[52px] rounded-2xl font-semibold bg-[#25D366] text-white flex items-center justify-center gap-2.5 active:scale-[0.98] transition-transform">
            <MessageCircle className="w-5 h-5" /> Send Bill to {customerName}
          </button>
          <div className="flex gap-3">
            <button onClick={handleDownload}
              className="flex-1 h-[48px] rounded-xl font-medium flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-600 text-sm">
              <Download className="w-4 h-4" />Save Photo
            </button>
            <button onClick={handleCopy}
              className="flex-1 h-[48px] rounded-xl font-medium flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-600 text-sm">
              <Copy className="w-4 h-4" />{copied ? "Copied!" : "Copy Text"}
            </button>
            <button className="flex-1 h-[48px] rounded-xl font-medium flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-600 text-sm">
              <Share2 className="w-4 h-4" />Share
            </button>
          </div>
          <div className="flex gap-3">
            <button onClick={() => navigate("/wishlist")}
              className="flex-1 h-[48px] rounded-xl font-medium flex items-center justify-center gap-2 bg-[#F4F6FA] border border-gray-200 text-gray-600 text-sm">
              <Home className="w-4 h-4" />Wishlist
            </button>
            <button onClick={() => navigate("/reports")}
              className="flex-1 h-[48px] rounded-xl font-medium flex items-center justify-center gap-2 bg-blue-50 border border-blue-200 text-blue-600 text-sm">
              <ArrowRight className="w-4 h-4" />View Reports
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
