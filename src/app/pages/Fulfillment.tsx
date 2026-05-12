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
  } | null;

  const itemName = state?.itemName || "Laneige Lip Sleeping Mask Berry";
  const finalIDR = state?.finalIDR || 182850;
  const formatIDR = (val: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(val);

  const handleShare = () => {
    setShared(true);
    setTimeout(() => setShared(false), 2000);
  };

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="min-h-screen bg-[#F4F6FA]">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#16a34a] to-[#22c55e] px-5 pt-12 pb-6">
        <div className="flex items-center gap-3 mb-1">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300, delay: 0.1 }}
            className="w-10 h-10 rounded-full bg-white/30 flex items-center justify-center"
          >
            <CheckCircle2 className="w-6 h-6 text-white" />
          </motion.div>
          <div>
            <h1 className="text-white font-bold" style={{ fontSize: "22px" }}>
              Photo Generated!
            </h1>
            <p className="text-green-100 text-xs">Ready to share to customers</p>
          </div>
        </div>
      </div>

      <div className="px-4 py-5 space-y-4">
        {/* Canvas Preview Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15 }}
          className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100"
        >
          {/* Product Photo with Overlays */}
          <div className="relative w-full aspect-square bg-gray-100">
            <img
              src="https://images.unsplash.com/photo-1770048792338-aaf6a575305f?w=600&h=600&fit=crop"
              alt={itemName}
              className="w-full h-full object-cover"
            />

            {/* Dark gradient overlay at bottom */}
            <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/70 to-transparent" />

            {/* Watermark Logo (translucent) */}
            <div
              className="absolute top-4 right-4 bg-white/25 backdrop-blur-sm rounded-xl px-3 py-2 border border-white/40"
              style={{ opacity: 0.75 }}
            >
              <div className="flex items-center gap-1.5">
                <div className="w-5 h-5 rounded-md bg-blue-500 flex items-center justify-center">
                  <Sparkles className="w-3 h-3 text-white" />
                </div>
                <span className="text-white font-bold text-sm">JastipFlow</span>
              </div>
              <p className="text-white/80 text-[9px] mt-0.5">@jastipby.dewi</p>
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
                <div className="text-right">
                  <div
                    className="bg-gradient-to-r from-[#2563EB] to-[#1d4ed8] text-white rounded-xl px-4 py-2 shadow-lg"
                  >
                    <p className="text-white/80 text-[10px]">HARGA</p>
                    <p className="text-white font-bold" style={{ fontSize: "20px" }}>
                      {formatIDR(finalIDR)}
                    </p>
                  </div>
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
                <p className="text-xs text-gray-500 mb-0.5">Item</p>
                <p className="font-semibold text-gray-800 text-sm">{itemName}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500 mb-0.5">Final Price</p>
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
          className="bg-green-50 border border-green-200 rounded-2xl px-4 py-3 flex items-start gap-3"
        >
          <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-green-800 font-semibold text-sm">
              Success! Item saved to Live Catalog & Ready Stock.
            </p>
            <p className="text-green-700 text-xs mt-0.5">
              Price ribbon & watermark applied. Share to your channels now!
            </p>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-3"
        >
          {/* IG Story Share */}
          <button
            onClick={handleShare}
            className={`w-full h-[56px] rounded-2xl font-bold flex items-center justify-center gap-2.5 shadow-lg transition-all ${
              shared
                ? "bg-green-500 shadow-green-200"
                : "bg-gradient-to-r from-[#f09433] via-[#e6683c] to-[#bc1888] shadow-pink-200"
            }`}
          >
            {shared ? (
              <>
                <CheckCircle2 className="w-5 h-5 text-white" />
                <span className="text-white">Shared!</span>
              </>
            ) : (
              <>
                <Instagram className="w-5 h-5 text-white" />
                <span className="text-white">Share to IG Story</span>
              </>
            )}
          </button>

          {/* Secondary actions row */}
          <div className="flex gap-3">
            <button
              onClick={handleCopy}
              className="flex-1 h-[52px] rounded-2xl font-semibold flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 shadow-sm"
            >
              <Copy className="w-4 h-4" />
              <span className="text-sm">{copied ? "Copied!" : "Copy Link"}</span>
            </button>
            <button className="flex-1 h-[52px] rounded-2xl font-semibold flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 shadow-sm">
              <Download className="w-4 h-4" />
              <span className="text-sm">Save Photo</span>
            </button>
            <button className="flex-1 h-[52px] rounded-2xl font-semibold flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 shadow-sm">
              <Share2 className="w-4 h-4" />
              <span className="text-sm">Share</span>
            </button>
          </div>

          {/* Back to Home */}
          <button
            onClick={() => navigate("/")}
            className="w-full h-[52px] rounded-2xl font-semibold flex items-center justify-center gap-2 bg-[#F4F6FA] border border-gray-200 text-gray-700"
          >
            <Home className="w-4 h-4" />
            Back to Home
          </button>
        </motion.div>

        {/* Add Another Item */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          onClick={() => navigate("/live-catalog")}
          className="w-full h-[52px] rounded-2xl font-semibold flex items-center justify-center gap-2 bg-blue-50 border border-blue-200 text-blue-700"
        >
          <Sparkles className="w-4 h-4" />
          Add Another Item
        </motion.button>
      </div>
    </div>
  );
}
