import { useState } from "react";
import { useNavigate } from "react-router";
import {
  ChevronLeft,
  Zap,
  Calculator,
  Camera,
  FlashlightOff,
  RotateCcw,
  Sparkles,
  ArrowRight,
  Info,
  Tag,
} from "lucide-react";
import { motion } from "motion/react";

export function LiveCatalog() {
  const navigate = useNavigate();
  const [itemName, setItemName] = useState("Laneige Lip Sleeping Mask Berry");
  const [basePrice, setBasePrice] = useState("15.9");
  const [currency] = useState("SGD");
  const [exchangeRate] = useState(11500);
  const [marginType, setMarginType] = useState<"percent" | "nominal">("percent");
  const [margin, setMargin] = useState("20");
  const [isAiFilled, setIsAiFilled] = useState(true);
  const [flashOn, setFlashOn] = useState(false);

  const basePriceNum = parseFloat(basePrice) || 0;
  const marginNum = parseFloat(margin) || 0;
  const baseIDR = basePriceNum * exchangeRate;
  const marginAmount =
    marginType === "percent" ? (baseIDR * marginNum) / 100 : marginNum;
  const finalIDR = baseIDR + marginAmount;

  const formatIDR = (val: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(val);

  const handleSave = () => {
    navigate("/fulfillment", {
      state: {
        itemName,
        finalIDR,
        basePrice,
        currency,
      },
    });
  };

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Camera Viewfinder - Top Half */}
      <div className="relative flex-1 min-h-[320px] max-h-[420px] overflow-hidden">
        {/* Simulated camera feed */}
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
          <div className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `repeating-linear-gradient(
                45deg,
                transparent,
                transparent 10px,
                rgba(255,255,255,0.03) 10px,
                rgba(255,255,255,0.03) 20px
              )`,
            }}
          />
          {/* Product mockup in center */}
          <img
            src="https://images.unsplash.com/photo-1770048792338-aaf6a575305f?w=400&h=400&fit=crop"
            alt="scanned"
            className="absolute inset-0 w-full h-full object-cover opacity-60"
          />
        </div>

        {/* Camera UI Overlay */}
        <div className="absolute inset-0">
          {/* Top bar */}
          <div className="flex items-center justify-between px-4 pt-12 pb-2">
            <button
              onClick={() => navigate("/")}
              className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center"
            >
              <ChevronLeft className="w-5 h-5 text-white" />
            </button>
            <div className="bg-black/50 backdrop-blur-sm rounded-full px-3 py-1.5 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-white text-xs font-semibold">LIVE SCAN</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setFlashOn(!flashOn)}
                className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center"
              >
                {flashOn ? (
                  <Zap className="w-5 h-5 text-yellow-400" />
                ) : (
                  <FlashlightOff className="w-5 h-5 text-white" />
                )}
              </button>
              <button className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center">
                <RotateCcw className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>

          {/* Scanning brackets */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative w-56 h-56">
              {/* Corner brackets */}
              <div className="absolute top-0 left-0 w-8 h-8 border-t-3 border-l-3 border-[#2563EB] rounded-tl-md" style={{ borderWidth: 3 }} />
              <div className="absolute top-0 right-0 w-8 h-8 border-t-3 border-r-3 border-[#2563EB] rounded-tr-md" style={{ borderWidth: 3 }} />
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-3 border-l-3 border-[#2563EB] rounded-bl-md" style={{ borderWidth: 3 }} />
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-3 border-r-3 border-[#2563EB] rounded-br-md" style={{ borderWidth: 3 }} />

              {/* Scanning line */}
              <motion.div
                className="absolute left-2 right-2 h-0.5 bg-gradient-to-r from-transparent via-[#2563EB] to-transparent"
                animate={{ top: ["10%", "90%", "10%"] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              />

              {/* AI indicator */}
              <div className="absolute -bottom-8 left-0 right-0 flex justify-center">
                <div className="bg-[#2563EB]/80 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-white" />
                  <span className="text-white text-[10px] font-semibold">AI DETECTING...</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Camera button */}
        <div className="absolute bottom-6 left-0 right-0 flex justify-center">
          <button className="w-16 h-16 rounded-full bg-white border-4 border-gray-300 shadow-xl flex items-center justify-center active:scale-95 transition-transform">
            <Camera className="w-7 h-7 text-gray-700" />
          </button>
        </div>
      </div>

      {/* Bottom Sheet Calculator */}
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-t-3xl shadow-2xl px-5 pt-4 pb-8 flex-1 overflow-y-auto"
      >
        {/* Handle */}
        <div className="flex justify-center mb-4">
          <div className="w-10 h-1 bg-gray-300 rounded-full" />
        </div>

        {/* AI-filled badge */}
        {isAiFilled && (
          <div className="flex items-center gap-2 bg-blue-50 rounded-xl px-3 py-2 mb-4 border border-blue-100">
            <Sparkles className="w-4 h-4 text-blue-500 flex-shrink-0" />
            <span className="text-blue-700 text-xs">
              AI auto-detected item name. Tap to edit.
            </span>
            <button
              onClick={() => setIsAiFilled(false)}
              className="ml-auto text-xs text-blue-500 underline"
            >
              Edit
            </button>
          </div>
        )}

        <div className="space-y-3">
          {/* Item Name */}
          <div>
            <label className="text-sm text-gray-600 mb-1.5 block">Item Name</label>
            <div className="relative">
              <Tag className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                value={itemName}
                onChange={(e) => { setItemName(e.target.value); setIsAiFilled(false); }}
                className="w-full h-[52px] bg-[#F4F6FA] rounded-xl pl-10 pr-4 text-gray-800 font-medium border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Base Price */}
          <div>
            <label className="text-sm text-gray-600 mb-1.5 block">
              Base Price (Foreign Currency)
            </label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 bg-blue-100 rounded-md px-2 py-0.5">
                <span className="text-blue-700 text-xs font-bold">{currency}</span>
              </div>
              <input
                type="number"
                value={basePrice}
                onChange={(e) => setBasePrice(e.target.value)}
                className="w-full h-[52px] bg-[#F4F6FA] rounded-xl pl-16 pr-4 text-gray-800 font-medium border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
              />
            </div>
            {basePriceNum > 0 && (
              <div className="flex items-center gap-1 mt-1">
                <Info className="w-3 h-3 text-gray-400" />
                <span className="text-xs text-gray-500">
                  = {formatIDR(baseIDR)} (@ {exchangeRate.toLocaleString("id-ID")} IDR)
                </span>
              </div>
            )}
          </div>

          {/* Margin */}
          <div>
            <label className="text-sm text-gray-600 mb-1.5 block">Margin / Jasa</label>
            <div className="flex gap-2">
              <div className="flex bg-[#F4F6FA] rounded-xl p-1 flex-shrink-0">
                {(["percent", "nominal"] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setMarginType(type)}
                    className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                      marginType === type
                        ? "bg-white text-blue-600 shadow-sm"
                        : "text-gray-500"
                    }`}
                  >
                    {type === "percent" ? "%" : "Rp"}
                  </button>
                ))}
              </div>
              <div className="relative flex-1">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-medium">
                  {marginType === "percent" ? "%" : "Rp"}
                </span>
                <input
                  type="number"
                  value={margin}
                  onChange={(e) => setMargin(e.target.value)}
                  className="w-full h-[52px] bg-[#F4F6FA] rounded-xl pl-9 pr-4 text-gray-800 font-medium border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Final Price Display */}
        <div className="mt-4 bg-gradient-to-r from-[#2563EB] to-[#1d4ed8] rounded-2xl p-4">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1.5">
              <Calculator className="w-4 h-4 text-blue-200" />
              <span className="text-blue-200 text-sm">Final IDR Price</span>
            </div>
            {marginNum > 0 && (
              <span className="text-blue-200 text-xs">
                +{marginType === "percent" ? `${margin}%` : formatIDR(marginNum)} margin
              </span>
            )}
          </div>
          <div className="text-white font-bold" style={{ fontSize: "28px" }}>
            {finalIDR > 0 ? formatIDR(finalIDR) : "Rp —"}
          </div>
          {finalIDR > 0 && (
            <div className="text-blue-200 text-xs mt-0.5">
              Profit: {formatIDR(marginAmount)} per item
            </div>
          )}
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          className="w-full mt-4 h-[56px] bg-gradient-to-r from-green-500 to-green-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-green-200"
        >
          <span>Save & Render Photo</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </motion.div>
    </div>
  );
}
