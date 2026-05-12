import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router";
import {
  ChevronLeft,
  Calculator,
  Camera,
  RotateCcw,
  ArrowRight,
  Info,
  Tag,
  Loader2,
  CheckCircle2,
  X,
  ImageIcon,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "../contexts/AuthContext";
import { addCatalogItem } from "../../lib/database";
import { getMarginConfig, getTripConfig } from "../../lib/settings";

export function LiveCatalog() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Camera state
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");
  const streamRef = useRef<MediaStream | null>(null);

  // Form state
  const [itemName, setItemName] = useState("");
  const [basePrice, setBasePrice] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Load settings
  const tripConfig = getTripConfig();
  const marginConfig = getMarginConfig();
  const currency = tripConfig.currency;
  const exchangeRate = tripConfig.exchangeRate;
  const marginType = marginConfig.type;
  const marginValue = parseFloat(marginConfig.value) || 0;

  // Calculations
  const basePriceNum = parseFloat(basePrice) || 0;
  const baseIDR = basePriceNum * exchangeRate;
  const marginAmount = marginType === "percent" ? (baseIDR * marginValue) / 100 : marginValue;
  const finalIDR = baseIDR + marginAmount;

  const formatIDR = (val: number) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(val);

  // ========== Camera Functions ==========
  const startCamera = useCallback(async (facing: "environment" | "user") => {
    try {
      // Stop previous stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
      setCameraError("");

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: facing, width: { ideal: 1280 }, height: { ideal: 1280 } },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
          setCameraReady(true);
        };
      }
    } catch (err: any) {
      console.error("Camera error:", err);
      setCameraError("Tidak bisa mengakses kamera. Pastikan izin kamera diaktifkan.");
    }
  }, []);

  useEffect(() => {
    if (!capturedPhoto) {
      startCamera(facingMode);
    }
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
    };
  }, [facingMode, capturedPhoto]);

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    // Make it square (crop center)
    const size = Math.min(video.videoWidth, video.videoHeight);
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d")!;
    const sx = (video.videoWidth - size) / 2;
    const sy = (video.videoHeight - size) / 2;
    ctx.drawImage(video, sx, sy, size, size, 0, 0, size, size);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
    setCapturedPhoto(dataUrl);
    // Stop camera
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
    }
  };

  const retakePhoto = () => {
    setCapturedPhoto(null);
    setCameraReady(false);
  };

  const switchCamera = () => {
    setFacingMode(f => f === "environment" ? "user" : "environment");
  };

  // ========== Save ==========
  const handleSave = async () => {
    if (!user || !itemName || basePriceNum <= 0) return;
    setSaving(true);

    try {
      await addCatalogItem({
        user_id: user.id,
        item_name: itemName,
        base_price: basePriceNum,
        currency,
        exchange_rate: exchangeRate,
        margin_type: marginType,
        margin_value: marginValue,
        final_price_idr: Math.round(finalIDR),
      });

      setSaved(true);
      setTimeout(() => {
        navigate("/fulfillment", {
          state: { itemName, finalIDR, basePrice, currency, photo: capturedPhoto },
        });
      }, 800);
    } catch (err) {
      console.error("Failed to save:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Hidden canvas for photo capture */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Camera / Photo Section */}
      <div className="relative flex-1 min-h-[340px] max-h-[420px] overflow-hidden bg-gray-900">
        <AnimatePresence mode="wait">
          {capturedPhoto ? (
            // ── Captured Photo Preview ──
            <motion.div
              key="photo"
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute inset-0"
            >
              <img src={capturedPhoto} alt="Captured" className="w-full h-full object-cover" />
              {/* Retake button */}
              <div className="absolute top-12 left-4 right-4 flex justify-between">
                <button onClick={() => navigate("/")} className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center">
                  <ChevronLeft className="w-5 h-5 text-white" />
                </button>
                <button onClick={retakePhoto} className="flex items-center gap-2 bg-black/50 backdrop-blur-sm rounded-full px-4 py-2">
                  <RotateCcw className="w-4 h-4 text-white" />
                  <span className="text-white text-sm font-medium">Retake</span>
                </button>
              </div>
              {/* Success badge */}
              <div className="absolute bottom-4 left-0 right-0 flex justify-center">
                <div className="bg-green-500/90 backdrop-blur-sm rounded-full px-4 py-2 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-white" />
                  <span className="text-white text-sm font-semibold">Photo captured!</span>
                </div>
              </div>
            </motion.div>
          ) : (
            // ── Live Camera View ──
            <motion.div
              key="camera"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0"
            >
              {cameraError ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-gray-800 flex items-center justify-center mb-4">
                    <ImageIcon className="w-8 h-8 text-gray-500" />
                  </div>
                  <p className="text-gray-400 text-sm mb-4">{cameraError}</p>
                  <button onClick={() => startCamera(facingMode)} className="text-blue-400 text-sm font-semibold">
                    Coba Lagi
                  </button>
                </div>
              ) : (
                <>
                  <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                  {/* Camera UI overlay */}
                  <div className="absolute inset-0">
                    {/* Top bar */}
                    <div className="flex items-center justify-between px-4 pt-12">
                      <button onClick={() => navigate("/")} className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center">
                        <ChevronLeft className="w-5 h-5 text-white" />
                      </button>
                      <div className="bg-black/50 backdrop-blur-sm rounded-full px-3 py-1.5 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                        <span className="text-white text-xs font-semibold">LIVE</span>
                      </div>
                      <button onClick={switchCamera} className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center">
                        <RotateCcw className="w-5 h-5 text-white" />
                      </button>
                    </div>

                    {/* Scanning frame */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="relative w-56 h-56">
                        <div className="absolute top-0 left-0 w-8 h-8 border-t-[3px] border-l-[3px] border-white/60 rounded-tl-lg" />
                        <div className="absolute top-0 right-0 w-8 h-8 border-t-[3px] border-r-[3px] border-white/60 rounded-tr-lg" />
                        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-[3px] border-l-[3px] border-white/60 rounded-bl-lg" />
                        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-[3px] border-r-[3px] border-white/60 rounded-br-lg" />
                      </div>
                    </div>

                    {/* Capture button */}
                    <div className="absolute bottom-6 left-0 right-0 flex justify-center">
                      <button
                        onClick={capturePhoto}
                        disabled={!cameraReady}
                        className="w-[72px] h-[72px] rounded-full bg-white/20 border-4 border-white flex items-center justify-center active:scale-90 transition-transform disabled:opacity-50"
                      >
                        <div className="w-[56px] h-[56px] rounded-full bg-white" />
                      </button>
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Form */}
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-t-3xl shadow-2xl px-5 pt-4 pb-8 flex-1 overflow-y-auto"
      >
        <div className="flex justify-center mb-4">
          <div className="w-10 h-1 bg-gray-200 rounded-full" />
        </div>

        <div className="space-y-3">
          {/* Item Name */}
          <div>
            <label className="text-sm text-gray-500 mb-1.5 block">Item Name</label>
            <div className="relative">
              <Tag className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                placeholder="Ketik nama produk..."
                className="w-full h-[52px] bg-[#F4F6FA] rounded-xl pl-10 pr-4 text-gray-800 font-medium border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Base Price */}
          <div>
            <label className="text-sm text-gray-500 mb-1.5 block">
              Base Price ({currency})
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

          {/* Margin Info (read-only, from Settings) */}
          <div className="bg-[#F4F6FA] rounded-xl p-3.5 flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400">Margin / Jasa</p>
              <p className="text-sm font-semibold text-gray-700 mt-0.5">
                {marginType === "percent" ? `${marginConfig.value}%` : `Rp ${Number(marginConfig.value).toLocaleString("id-ID")}`}
              </p>
            </div>
            <button
              onClick={() => navigate("/settings")}
              className="text-xs text-[#2563EB] font-semibold bg-blue-50 px-3 py-1.5 rounded-lg"
            >
              Ubah di Settings
            </button>
          </div>
        </div>

        {/* Final Price Display */}
        <div className="mt-4 bg-gradient-to-r from-[#2563EB] to-[#1d4ed8] rounded-2xl p-4">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1.5">
              <Calculator className="w-4 h-4 text-blue-200" />
              <span className="text-blue-200 text-sm">Final IDR Price</span>
            </div>
            {marginValue > 0 && (
              <span className="text-blue-200 text-xs">
                +{marginType === "percent" ? `${marginConfig.value}%` : formatIDR(marginValue)} margin
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
          disabled={saving || !itemName || basePriceNum <= 0 || !capturedPhoto}
          className={`w-full mt-4 h-[56px] rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg transition-all disabled:opacity-40 ${
            saved
              ? "bg-green-500 text-white shadow-green-200"
              : "bg-gradient-to-r from-green-500 to-green-600 text-white shadow-green-200"
          }`}
        >
          {saved ? (
            <><CheckCircle2 className="w-5 h-5" /> Saved!</>
          ) : saving ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <><span>{capturedPhoto ? "Save & Continue" : "Take Photo First"}</span><ArrowRight className="w-5 h-5" /></>
          )}
        </button>
      </motion.div>
    </div>
  );
}
