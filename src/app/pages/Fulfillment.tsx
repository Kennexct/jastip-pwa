import { useNavigate, useLocation } from "react-router";
import {
  CheckCircle2,
  Share2,
  Home,
  Download,
  Sparkles,
  Instagram,
  Copy,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";

export function Fulfillment() {
  const navigate = useNavigate();
  const location = useLocation();
  const [shared, setShared] = useState(false);
  const [copied, setCopied] = useState(false);

  const state = location.state as {
    itemName?: string;
    finalIDR?: number;
    basePrice?: string;
    currency?: string;
    photo?: string;
  } | null;

  const itemName = state?.itemName || "Item";
  const finalIDR = state?.finalIDR || 0;
  const photo = state?.photo || null;

  const formatIDR = (val: number) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(val);

  const handleShare = () => {
    setShared(true);
    setTimeout(() => setShared(false), 2000);
  };

  const handleCopy = () => {
    const text = `${itemName}\nHarga: ${formatIDR(finalIDR)}\n\n📸 Ready Stock!\nOrder via DM/WA 🛍️`;
    navigator.clipboard.writeText(text).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="min-h-screen bg-[#F4F6FA]">
      {/* Header */}
      <div className="bg-white px-5 pt-14 pb-5 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300, delay: 0.1 }}
            className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center"
          >
            <CheckCircle2 className="w-6 h-6 text-green-500" />
          </motion.div>
          <div>
            <h1 className="text-gray-900 font-bold text-xl">Saved!</h1>
            <p className="text-gray-400 text-xs">Ready to share to customers</p>
          </div>
        </div>
      </div>

      <div className="px-5 py-5 space-y-4">
        {/* Canvas Preview Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15 }}
          className="bg-white rounded-3xl shadow-sm overflow-hidden border border-gray-100"
        >
          {/* Product Photo with Overlays */}
          <div className="relative w-full aspect-square bg-gray-100">
            {photo ? (
              <img src={photo} alt={itemName} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-100 flex items-center justify-center">
                <Sparkles className="w-12 h-12 text-gray-300" />
              </div>
            )}

            {/* Gradient overlay at bottom */}
            <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/70 to-transparent" />

            {/* Watermark */}
            <div className="absolute top-4 right-4 bg-white/25 backdrop-blur-sm rounded-xl px-3 py-2 border border-white/40" style={{ opacity: 0.75 }}>
              <div className="flex items-center gap-1.5">
                <div className="w-5 h-5 rounded-md bg-blue-500 flex items-center justify-center">
                  <Sparkles className="w-3 h-3 text-white" />
                </div>
                <span className="text-white font-bold text-sm">JastipFlow</span>
              </div>
            </div>

            {/* Price Ribbon */}
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-white/80 text-xs mb-0.5">Ready Stock 🇸🇬</p>
                  <p className="text-white font-bold leading-tight" style={{ fontSize: "18px" }}>
                    {itemName.length > 24 ? itemName.slice(0, 24) + "…" : itemName}
                  </p>
                </div>
                <div className="bg-gradient-to-r from-[#2563EB] to-[#1d4ed8] text-white rounded-xl px-4 py-2 shadow-lg">
                  <p className="text-white/80 text-[10px]">HARGA</p>
                  <p className="text-white font-bold" style={{ fontSize: "20px" }}>{formatIDR(finalIDR)}</p>
                </div>
              </div>
            </div>

            {/* Stock badge */}
            <div className="absolute top-4 left-4 bg-green-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide">
              In Stock
            </div>
          </div>

          {/* Item Details */}
          <div className="px-4 py-3.5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Item</p>
                <p className="font-semibold text-gray-800 text-sm">{itemName}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-400 mb-0.5">Final Price</p>
                <p className="font-bold text-green-600">{formatIDR(finalIDR)}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Success Banner */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-green-50 border border-green-100 rounded-2xl px-4 py-3 flex items-start gap-3"
        >
          <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-green-800 font-semibold text-sm">Item saved to catalog!</p>
            <p className="text-green-600 text-xs mt-0.5">Price ribbon & watermark applied. Share now!</p>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="space-y-3">
          {/* IG Story Share */}
          <button onClick={handleShare} className={`w-full h-[52px] rounded-2xl font-semibold flex items-center justify-center gap-2.5 transition-all ${shared ? "bg-green-500" : "bg-gradient-to-r from-[#f09433] via-[#e6683c] to-[#bc1888]"}`}>
            {shared ? (<><CheckCircle2 className="w-5 h-5 text-white" /><span className="text-white">Shared!</span></>) : (<><Instagram className="w-5 h-5 text-white" /><span className="text-white">Share to IG Story</span></>)}
          </button>

          {/* Secondary actions */}
          <div className="flex gap-3">
            <button onClick={handleCopy} className="flex-1 h-[48px] rounded-xl font-medium flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-600 text-sm">
              <Copy className="w-4 h-4" />{copied ? "Copied!" : "Copy Text"}
            </button>
            <button className="flex-1 h-[48px] rounded-xl font-medium flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-600 text-sm">
              <Download className="w-4 h-4" />Save Photo
            </button>
            <button className="flex-1 h-[48px] rounded-xl font-medium flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-600 text-sm">
              <Share2 className="w-4 h-4" />Share
            </button>
          </div>

          {/* Navigation */}
          <div className="flex gap-3">
            <button onClick={() => navigate("/")} className="flex-1 h-[48px] rounded-xl font-medium flex items-center justify-center gap-2 bg-[#F4F6FA] border border-gray-200 text-gray-600 text-sm">
              <Home className="w-4 h-4" />Home
            </button>
            <button onClick={() => navigate("/live-catalog")} className="flex-1 h-[48px] rounded-xl font-medium flex items-center justify-center gap-2 bg-blue-50 border border-blue-200 text-blue-600 text-sm">
              <Sparkles className="w-4 h-4" />Add Another
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
