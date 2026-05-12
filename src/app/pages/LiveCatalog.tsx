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
  ImageIcon,
  Sparkles,
  ScanText,
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
  const streamRef = useRef<MediaStream | null>(null);

  // Form state
  const [itemName, setItemName] = useState("");
  const [basePrice, setBasePrice] = useState("");
  const [margin, setMargin] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrDone, setOcrDone] = useState(false);

  // Load settings
  const tripConfig = getTripConfig();
  const marginConfig = getMarginConfig();
  const currency = tripConfig.currency;
  const exchangeRate = tripConfig.exchangeRate;
  const marginType = marginConfig.type;

  // Calculations
  const basePriceNum = parseFloat(basePrice) || 0;
  const marginNum = parseFloat(margin) || 0;
  const baseIDR = basePriceNum * exchangeRate;
  const marginAmount = marginType === "percent" ? (baseIDR * marginNum) / 100 : marginNum;
  const finalIDR = baseIDR + marginAmount;

  const formatIDR = (val: number) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(val);

  // ========== Camera: Select Main Lens ==========
  const findMainCamera = async (): Promise<string | undefined> => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(d => d.kind === "videoinput");

      if (videoDevices.length <= 1) return undefined; // Only 1 camera, no need to pick

      // Try to find the main rear camera (exclude wide, ultra-wide, macro)
      const mainRear = videoDevices.find(d => {
        const label = d.label.toLowerCase();
        return (
          (label.includes("back") || label.includes("rear") || label.includes("environment")) &&
          !label.includes("wide") &&
          !label.includes("ultra") &&
          !label.includes("macro") &&
          !label.includes("tele")
        );
      });

      if (mainRear) return mainRear.deviceId;

      // Fallback: pick the first back-facing camera that isn't explicitly wide
      const anyRear = videoDevices.find(d => {
        const label = d.label.toLowerCase();
        return label.includes("back") || label.includes("rear") || label.includes("0, facing back");
      });

      return anyRear?.deviceId;
    } catch {
      return undefined;
    }
  };

  const startCamera = useCallback(async () => {
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
      setCameraError("");

      // First, get any camera to trigger permission (labels are only available after permission)
      const tempStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      tempStream.getTracks().forEach(t => t.stop());

      // Now find the main camera
      const mainDeviceId = await findMainCamera();

      const constraints: MediaStreamConstraints = {
        video: mainDeviceId
          ? { deviceId: { exact: mainDeviceId }, width: { ideal: 1920 }, height: { ideal: 1440 } }
          : { facingMode: { ideal: "environment" }, width: { ideal: 4032 }, height: { ideal: 3024 } },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
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
      startCamera();
    }
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
    };
  }, [capturedPhoto]);

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const size = Math.min(video.videoWidth, video.videoHeight);
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d")!;
    const sx = (video.videoWidth - size) / 2;
    const sy = (video.videoHeight - size) / 2;
    ctx.drawImage(video, sx, sy, size, size, 0, 0, size, size);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
    setCapturedPhoto(dataUrl);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
    }
    // Auto-trigger OCR
    runOCR(dataUrl);
  };

  const retakePhoto = () => {
    setCapturedPhoto(null);
    setCameraReady(false);
    setItemName("");
    setOcrDone(false);
  };

  // ========== OCR: Auto-detect Item Name ==========
  const runOCR = async (imageDataUrl: string) => {
    setOcrLoading(true);
    setOcrDone(false);
    try {
      const { createWorker } = await import("tesseract.js");
      const worker = await createWorker("eng");
      const { data } = await worker.recognize(imageDataUrl);
      await worker.terminate();

      // Extract the most meaningful text line (longest line as product name)
      const lines = data.text
        .split("\n")
        .map(l => l.trim())
        .filter(l => l.length > 3 && !/^[\d\s.,!@#$%^&*()]+$/.test(l)); // Filter out noise

      if (lines.length > 0) {
        // Pick the longest meaningful line as the likely product name
        const bestLine = lines.reduce((a, b) => (a.length > b.length ? a : b), "");
        setItemName(bestLine);
      }
      setOcrDone(true);
    } catch (err) {
      console.error("OCR failed:", err);
      setOcrDone(true);
    } finally {
      setOcrLoading(false);
    }
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
        margin_value: marginNum,
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
      <canvas ref={canvasRef} className="hidden" />

      {/* Camera / Photo Section */}
      <div className="relative flex-1 min-h-[320px] max-h-[400px] overflow-hidden bg-gray-900">
        <AnimatePresence mode="wait">
          {capturedPhoto ? (
            <motion.div key="photo" initial={{ opacity: 0, scale: 1.05 }} animate={{ opacity: 1, scale: 1 }} className="absolute inset-0">
              <img src={capturedPhoto} alt="Captured" className="w-full h-full object-cover" />
              <div className="absolute top-12 left-4 right-4 flex justify-between">
                <button onClick={() => navigate("/")} className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center">
                  <ChevronLeft className="w-5 h-5 text-white" />
                </button>
                <button onClick={retakePhoto} className="flex items-center gap-2 bg-black/50 backdrop-blur-sm rounded-full px-4 py-2">
                  <RotateCcw className="w-4 h-4 text-white" />
                  <span className="text-white text-sm font-medium">Retake</span>
                </button>
              </div>
              <div className="absolute bottom-4 left-0 right-0 flex justify-center">
                <div className="bg-green-500/90 backdrop-blur-sm rounded-full px-4 py-2 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-white" />
                  <span className="text-white text-sm font-semibold">Photo captured!</span>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div key="camera" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0">
              {cameraError ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-gray-800 flex items-center justify-center mb-4">
                    <ImageIcon className="w-8 h-8 text-gray-500" />
                  </div>
                  <p className="text-gray-400 text-sm mb-4">{cameraError}</p>
                  <button onClick={startCamera} className="text-blue-400 text-sm font-semibold">Coba Lagi</button>
                </div>
              ) : (
                <>
                  <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                  <div className="absolute inset-0">
                    <div className="flex items-center justify-between px-4 pt-12">
                      <button onClick={() => navigate("/")} className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center">
                        <ChevronLeft className="w-5 h-5 text-white" />
                      </button>
                      <div className="bg-black/50 backdrop-blur-sm rounded-full px-3 py-1.5 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                        <span className="text-white text-xs font-semibold">LIVE</span>
                      </div>
                      <div className="w-10" /> {/* Spacer */}
                    </div>

                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="relative w-56 h-56">
                        <div className="absolute top-0 left-0 w-8 h-8 border-t-[3px] border-l-[3px] border-white/60 rounded-tl-lg" />
                        <div className="absolute top-0 right-0 w-8 h-8 border-t-[3px] border-r-[3px] border-white/60 rounded-tr-lg" />
                        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-[3px] border-l-[3px] border-white/60 rounded-bl-lg" />
                        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-[3px] border-r-[3px] border-white/60 rounded-br-lg" />
                      </div>
                    </div>

                    <div className="absolute bottom-6 left-0 right-0 flex justify-center">
                      <button onClick={capturePhoto} disabled={!cameraReady} className="w-[72px] h-[72px] rounded-full bg-white/20 border-4 border-white flex items-center justify-center active:scale-90 transition-transform disabled:opacity-50">
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
      <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="bg-white rounded-t-3xl shadow-2xl px-5 pt-4 pb-8 flex-1 overflow-y-auto">
        <div className="flex justify-center mb-4">
          <div className="w-10 h-1 bg-gray-200 rounded-full" />
        </div>

        <div className="space-y-3">
          {/* Item Name with OCR status */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm text-gray-500">Item Name</label>
              {ocrLoading && (
                <div className="flex items-center gap-1.5 bg-blue-50 px-2.5 py-1 rounded-lg">
                  <Loader2 className="w-3 h-3 text-blue-500 animate-spin" />
                  <span className="text-blue-600 text-[11px] font-semibold">Detecting text...</span>
                </div>
              )}
              {ocrDone && !ocrLoading && itemName && (
                <div className="flex items-center gap-1.5 bg-green-50 px-2.5 py-1 rounded-lg">
                  <Sparkles className="w-3 h-3 text-green-500" />
                  <span className="text-green-600 text-[11px] font-semibold">Auto-detected</span>
                </div>
              )}
              {ocrDone && !ocrLoading && !itemName && (
                <div className="flex items-center gap-1.5 bg-amber-50 px-2.5 py-1 rounded-lg">
                  <ScanText className="w-3 h-3 text-amber-500" />
                  <span className="text-amber-600 text-[11px] font-semibold">Ketik manual</span>
                </div>
              )}
            </div>
            <div className="relative">
              <Tag className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                placeholder={ocrLoading ? "Mendeteksi nama produk..." : "Ketik nama produk..."}
                className="w-full h-[52px] bg-[#F4F6FA] rounded-xl pl-10 pr-4 text-gray-800 font-medium border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Base Price */}
          <div>
            <label className="text-sm text-gray-500 mb-1.5 block">Base Price ({currency})</label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 bg-blue-100 rounded-md px-2 py-0.5">
                <span className="text-blue-700 text-xs font-bold">{currency}</span>
              </div>
              <input type="number" value={basePrice} onChange={(e) => setBasePrice(e.target.value)} className="w-full h-[52px] bg-[#F4F6FA] rounded-xl pl-16 pr-4 text-gray-800 font-medium border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="0.00" />
            </div>
            {basePriceNum > 0 && (
              <div className="flex items-center gap-1 mt-1">
                <Info className="w-3 h-3 text-gray-400" />
                <span className="text-xs text-gray-500">= {formatIDR(baseIDR)} (@ {exchangeRate.toLocaleString("id-ID")} IDR)</span>
              </div>
            )}
          </div>

          {/* Margin Input — free value, type from Settings */}
          <div>
            <label className="text-sm text-gray-500 mb-1.5 block">
              Margin / Jasa ({marginType === "percent" ? "%" : "Rp"})
            </label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 bg-green-100 rounded-md px-2 py-0.5">
                <span className="text-green-700 text-xs font-bold">{marginType === "percent" ? "%" : "Rp"}</span>
              </div>
              <input
                type="number"
                value={margin}
                onChange={(e) => setMargin(e.target.value)}
                className="w-full h-[52px] bg-[#F4F6FA] rounded-xl pl-14 pr-4 text-gray-800 font-medium border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder={marginType === "percent" ? "20" : "50000"}
              />
            </div>
            {marginNum > 0 && basePriceNum > 0 && (
              <div className="flex items-center gap-1 mt-1">
                <Info className="w-3 h-3 text-gray-400" />
                <span className="text-xs text-gray-500">
                  Profit: {formatIDR(marginAmount)} per item
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Final Price */}
        <div className="mt-4 bg-gradient-to-r from-[#2563EB] to-[#1d4ed8] rounded-2xl p-4">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1.5">
              <Calculator className="w-4 h-4 text-blue-200" />
              <span className="text-blue-200 text-sm">Final IDR Price</span>
            </div>
          </div>
          <div className="text-white font-bold" style={{ fontSize: "28px" }}>
            {finalIDR > 0 ? formatIDR(finalIDR) : "Rp —"}
          </div>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={saving || !itemName || basePriceNum <= 0 || !capturedPhoto}
          className={`w-full mt-4 h-[56px] rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg transition-all disabled:opacity-40 ${
            saved ? "bg-green-500 text-white" : "bg-gradient-to-r from-green-500 to-green-600 text-white shadow-green-200"
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
