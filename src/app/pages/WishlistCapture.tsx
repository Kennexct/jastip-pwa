import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate, useLocation, useParams } from "react-router";
import {
  ChevronLeft, RotateCcw, CheckCircle2, ImageIcon, Tag, Loader2,
  Sparkles, Type, Hash, Info, Calculator, ArrowRight, Camera,
  AlertTriangle, Package,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "../contexts/AuthContext";
import {
  addSale, addCatalogItem, updateWishlistStatus,
  type WishlistItem,
} from "../../lib/database";
import { getMarginConfig, getTripConfig } from "../../lib/settings";
import { renderProductCanvas } from "../../lib/canvas-utils";

type Step = "camera" | "pricing" | "split" | "saving";

export function WishlistCapture() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();

  const wishlistItem = (location.state as { item?: WishlistItem })?.item;

  // Camera
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Form
  const [step, setStep] = useState<Step>("camera");
  const [itemName, setItemName] = useState(wishlistItem?.item_name || "");
  const [basePrice, setBasePrice] = useState("");
  const [margin, setMargin] = useState("");
  const [boughtQty, setBoughtQty] = useState(wishlistItem?.qty.toString() || "1");
  const [saving, setSaving] = useState(false);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrDone, setOcrDone] = useState(false);

  const tripConfig = getTripConfig();
  const marginConfig = getMarginConfig();
  const currency = tripConfig.currency;
  const exchangeRate = tripConfig.exchangeRate;
  const marginType = marginConfig.type;

  const basePriceNum = parseFloat(basePrice) || 0;
  const marginNum = parseFloat(margin) || parseFloat(marginConfig.value) || 0;
  const baseIDR = basePriceNum * exchangeRate;
  const marginAmount = marginType === "percent" ? (baseIDR * marginNum) / 100 : marginNum;
  const finalIDR = baseIDR + marginAmount;

  const requestedQty = wishlistItem?.qty || 1;
  const boughtQtyNum = parseInt(boughtQty) || 0;
  const excessQty = Math.max(0, boughtQtyNum - requestedQty);
  const customerQty = Math.min(boughtQtyNum, requestedQty);

  const formatIDR = (val: number) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(val);

  // Camera logic
  const startCamera = useCallback(async () => {
    try {
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
      setCameraError("");
      const tempStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      tempStream.getTracks().forEach(t => t.stop());

      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(d => d.kind === "videoinput");
      const mainRear = videoDevices.find(d => {
        const l = d.label.toLowerCase();
        return (l.includes("back") || l.includes("rear")) && !l.includes("wide") && !l.includes("ultra");
      });

      const constraints: MediaStreamConstraints = {
        video: mainRear
          ? { deviceId: { exact: mainRear.deviceId }, width: { ideal: 1920 }, height: { ideal: 1440 } }
          : { facingMode: { ideal: "environment" }, width: { ideal: 4032 }, height: { ideal: 3024 } },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => { videoRef.current?.play(); setCameraReady(true); };
      }
    } catch {
      setCameraError("Cannot access camera. Please enable camera permission.");
    }
  }, []);

  useEffect(() => {
    if (step === "camera" && !capturedPhoto) startCamera();
    return () => { if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop()); };
  }, [step, capturedPhoto, startCamera]);

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const size = Math.min(video.videoWidth, video.videoHeight);
    canvas.width = size; canvas.height = size;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(video, (video.videoWidth - size) / 2, (video.videoHeight - size) / 2, size, size, 0, 0, size, size);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
    setCapturedPhoto(dataUrl);
    streamRef.current?.getTracks().forEach(t => t.stop());
    setStep("pricing");
    runOCR(dataUrl);
  };

  const retakePhoto = () => {
    setCapturedPhoto(null); setCameraReady(false); setOcrDone(false); setStep("camera");
  };

  const runOCR = async (imageDataUrl: string) => {
    if (itemName) { setOcrDone(true); return; }
    setOcrLoading(true);
    try {
      const { createWorker } = await import("tesseract.js");
      const worker = await createWorker("eng");
      const { data } = await worker.recognize(imageDataUrl);
      await worker.terminate();
      const lines = data.text.split("\n").map(l => l.trim()).filter(l => l.length > 3 && !/^[\d\s.,!@#$%^&*()]+$/.test(l));
      if (lines.length > 0) {
        setItemName(lines.reduce((a, b) => (a.length > b.length ? a : b), ""));
      }
      setOcrDone(true);
    } catch { setOcrDone(true); }
    finally { setOcrLoading(false); }
  };

  const handleConfirmPrice = () => {
    if (!itemName || basePriceNum <= 0) return;
    setMargin(margin || marginConfig.value);
    setStep("split");
  };

  const handleFulfill = async () => {
    if (!user || !wishlistItem || !id || !capturedPhoto) return;
    setSaving(true);
    setStep("saving");
    try {
      // 1. Render canvas image
      const canvasImage = await renderProductCanvas({
        photo: capturedPhoto, itemName, finalPriceIDR: Math.round(finalIDR),
        country: tripConfig.country === "SG" ? "🇸🇬" : tripConfig.country,
      });

      // 2. Create sale for customer
      const totalBill = Math.round(finalIDR) * customerQty;
      const dpAmt = wishlistItem.dp_amount || 0;
      const remaining = Math.max(0, totalBill - dpAmt);

      await addSale({
        user_id: user.id,
        wishlist_item_id: id,
        customer_name: wishlistItem.customer_name,
        item_name: itemName,
        qty: customerQty,
        base_price: basePriceNum,
        currency,
        exchange_rate: exchangeRate,
        margin_type: marginType,
        margin_value: marginNum,
        final_price_idr: Math.round(finalIDR),
        dp_amount: dpAmt,
        total_paid: dpAmt,
        remaining,
        photo_url: capturedPhoto,
        canvas_image_url: canvasImage,
        status: remaining <= 0 ? "completed" : dpAmt > 0 ? "dp_paid" : "pending_dp",
        fulfilled_at: new Date().toISOString(),
      });

      // 3. Split excess to catalog
      if (excessQty > 0) {
        await addCatalogItem({
          user_id: user.id,
          item_name: itemName,
          base_price: basePriceNum,
          currency,
          exchange_rate: exchangeRate,
          margin_type: marginType,
          margin_value: marginNum,
          final_price_idr: Math.round(finalIDR),
          qty: excessQty,
          photo_url: capturedPhoto,
        });
      }

      // 4. Update wishlist status
      await updateWishlistStatus(id, "fulfilled");

      // 5. Navigate to success
      navigate(`/wishlist/fulfill/${id}`, {
        state: {
          itemName, finalIDR: Math.round(finalIDR), canvasImage,
          customerName: wishlistItem.customer_name,
          customerQty, excessQty, totalBill, dpAmount: dpAmt, remaining,
          phone: wishlistItem.phone,
        },
      });
    } catch (err) {
      console.error("Fulfill failed:", err);
      setStep("split");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col">
      <canvas ref={canvasRef} className="hidden" />

      {/* Camera / Photo Section */}
      <div className="relative flex-1 min-h-[280px] max-h-[380px] overflow-hidden bg-gray-900">
        <AnimatePresence mode="wait">
          {capturedPhoto ? (
            <motion.div key="photo" initial={{ opacity: 0, scale: 1.05 }} animate={{ opacity: 1, scale: 1 }} className="absolute inset-0">
              <img src={capturedPhoto} alt="Captured" className="w-full h-full object-cover" />
              <div className="absolute top-12 left-4 right-4 flex justify-between">
                <button onClick={() => navigate("/wishlist")} className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center">
                  <ChevronLeft className="w-5 h-5 text-white" />
                </button>
                <button onClick={retakePhoto} className="flex items-center gap-2 bg-black/50 backdrop-blur-sm rounded-full px-4 py-2">
                  <RotateCcw className="w-4 h-4 text-white" /><span className="text-white text-sm font-medium">Retake</span>
                </button>
              </div>
              <div className="absolute bottom-4 left-0 right-0 flex justify-center">
                <div className="bg-green-500/90 backdrop-blur-sm rounded-full px-4 py-2 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-white" /><span className="text-white text-sm font-semibold">Photo captured!</span>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div key="camera" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0">
              {cameraError ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
                  <ImageIcon className="w-12 h-12 text-gray-500 mb-4" />
                  <p className="text-gray-400 text-sm mb-4">{cameraError}</p>
                  <button onClick={startCamera} className="text-blue-400 text-sm font-semibold">Try Again</button>
                </div>
              ) : (
                <>
                  <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                  <div className="absolute inset-0">
                    <div className="flex items-center justify-between px-4 pt-12">
                      <button onClick={() => navigate("/wishlist")} className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center">
                        <ChevronLeft className="w-5 h-5 text-white" />
                      </button>
                      <div className="bg-black/50 backdrop-blur-sm rounded-full px-3 py-1.5 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" /><span className="text-white text-xs font-semibold">HUNTING</span>
                      </div>
                      <div className="w-10" />
                    </div>
                    {wishlistItem && (
                      <div className="absolute top-24 left-4 right-4">
                        <div className="bg-black/50 backdrop-blur-sm rounded-xl px-3 py-2">
                          <p className="text-white/70 text-[11px]">Looking for:</p>
                          <p className="text-white font-semibold text-sm">{wishlistItem.item_name}</p>
                          <p className="text-blue-300 text-xs">for {wishlistItem.customer_name} · x{wishlistItem.qty}</p>
                        </div>
                      </div>
                    )}
                    <div className="absolute bottom-6 left-0 right-0 flex justify-center">
                      <button onClick={capturePhoto} disabled={!cameraReady}
                        className="w-[72px] h-[72px] rounded-full bg-white/20 border-4 border-white flex items-center justify-center active:scale-90 transition-transform disabled:opacity-50">
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
      <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}
        className="bg-white rounded-t-3xl shadow-2xl px-5 pt-4 pb-8 flex-1 overflow-y-auto">
        <div className="flex justify-center mb-4"><div className="w-10 h-1 bg-gray-200 rounded-full" /></div>

        {/* Step: Pricing */}
        {step === "pricing" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm text-gray-500">Item Name</label>
              {ocrLoading && (
                <div className="flex items-center gap-1.5 bg-blue-50 px-2.5 py-1 rounded-lg">
                  <Loader2 className="w-3 h-3 text-blue-500 animate-spin" /><span className="text-blue-600 text-[11px] font-semibold">Detecting...</span>
                </div>
              )}
              {ocrDone && !ocrLoading && itemName && (
                <div className="flex items-center gap-1.5 bg-green-50 px-2.5 py-1 rounded-lg">
                  <Sparkles className="w-3 h-3 text-green-500" /><span className="text-green-600 text-[11px] font-semibold">Ready</span>
                </div>
              )}
            </div>
            <div className="relative">
              <Tag className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input value={itemName} onChange={(e) => setItemName(e.target.value)} placeholder="Product name..."
                className="w-full h-[52px] bg-[#F4F6FA] rounded-xl pl-10 pr-4 text-gray-800 font-medium border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="text-sm text-gray-500 mb-1.5 block">Base Price ({currency})</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 bg-blue-100 rounded-md px-2 py-0.5">
                  <span className="text-blue-700 text-xs font-bold">{currency}</span>
                </div>
                <input type="number" value={basePrice} onChange={(e) => setBasePrice(e.target.value)}
                  className="w-full h-[52px] bg-[#F4F6FA] rounded-xl pl-16 pr-4 text-gray-800 font-medium border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="0.00" />
              </div>
              {basePriceNum > 0 && (
                <div className="flex items-center gap-1 mt-1">
                  <Info className="w-3 h-3 text-gray-400" />
                  <span className="text-xs text-gray-500">= {formatIDR(baseIDR)} (@ {exchangeRate.toLocaleString("id-ID")})</span>
                </div>
              )}
            </div>
            <div>
              <label className="text-sm text-gray-500 mb-1.5 block">Margin ({marginType === "percent" ? "%" : "Rp"})</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 bg-green-100 rounded-md px-2 py-0.5">
                  <span className="text-green-700 text-xs font-bold">{marginType === "percent" ? "%" : "Rp"}</span>
                </div>
                <input type="number" value={margin || marginConfig.value} onChange={(e) => setMargin(e.target.value)}
                  className="w-full h-[52px] bg-[#F4F6FA] rounded-xl pl-14 pr-4 text-gray-800 font-medium border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
            </div>
            <div className="bg-gradient-to-r from-[#2563EB] to-[#1d4ed8] rounded-2xl p-4 mt-2">
              <div className="flex items-center gap-1.5 mb-1">
                <Calculator className="w-4 h-4 text-blue-200" /><span className="text-blue-200 text-sm">Final IDR Price</span>
              </div>
              <div className="text-white font-bold text-[28px]">{finalIDR > 0 ? formatIDR(finalIDR) : "Rp —"}</div>
            </div>
            <button onClick={handleConfirmPrice} disabled={!itemName || basePriceNum <= 0}
              className="w-full mt-3 h-[56px] rounded-2xl font-bold flex items-center justify-center gap-2 bg-[#2563EB] text-white disabled:opacity-40 active:scale-[0.98] transition-transform">
              Next: Set Quantity <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Step: Split */}
        {step === "split" && (
          <div className="space-y-4">
            <div className="text-center mb-2">
              <h3 className="font-bold text-gray-900 text-lg">Quantity & Split</h3>
              <p className="text-gray-400 text-sm">{itemName} · {formatIDR(Math.round(finalIDR))}/pcs</p>
            </div>
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-3">
              <p className="text-blue-800 text-xs">
                Customer <b>{wishlistItem?.customer_name}</b> requested <b>{requestedQty}</b> item{requestedQty > 1 ? "s" : ""}. 
                If you bought more, excess goes to <b>Ready Stock</b>.
              </p>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">
                Total QTY Bought
              </label>
              <div className="relative">
                <Hash className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input type="number" value={boughtQty} onChange={(e) => setBoughtQty(e.target.value)} min="1"
                  className="w-full h-12 bg-[#F4F6FA] rounded-xl pl-10 pr-4 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#2563EB]" />
              </div>
            </div>

            {/* Split Preview */}
            <div className="bg-[#F4F6FA] rounded-xl p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-green-500" /> For {wishlistItem?.customer_name}</span>
                <span className="font-semibold text-gray-800">×{customerQty} = {formatIDR(Math.round(finalIDR) * customerQty)}</span>
              </div>
              {excessQty > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 flex items-center gap-1.5"><Package className="w-3.5 h-3.5 text-blue-500" /> → Ready Stock</span>
                  <span className="font-semibold text-blue-600">×{excessQty}</span>
                </div>
              )}
              {boughtQtyNum < requestedQty && boughtQtyNum > 0 && (
                <div className="flex items-center gap-2 mt-2 text-amber-600">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="text-xs font-medium">Not enough to fully fulfill ({boughtQtyNum}/{requestedQty})</span>
                </div>
              )}
              <div className="h-px bg-gray-200 my-1" />
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Customer Bill</span>
                <span className="font-bold text-gray-900">{formatIDR(Math.round(finalIDR) * customerQty)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">DP Received</span>
                <span className="font-semibold text-green-600">{formatIDR(wishlistItem?.dp_amount || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-semibold text-gray-700">Remaining</span>
                <span className="font-bold text-red-500">
                  {formatIDR(Math.max(0, Math.round(finalIDR) * customerQty - (wishlistItem?.dp_amount || 0)))}
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep("pricing")}
                className="flex-1 h-[52px] rounded-2xl font-semibold bg-gray-100 text-gray-600 active:scale-[0.98] transition-transform">
                Back
              </button>
              <button onClick={handleFulfill} disabled={saving || boughtQtyNum <= 0}
                className="flex-1 h-[52px] rounded-2xl font-bold bg-gradient-to-r from-green-500 to-green-600 text-white flex items-center justify-center gap-2 disabled:opacity-40 active:scale-[0.98] transition-transform">
                {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <><CheckCircle2 className="w-5 h-5" /> Fulfill</>}
              </button>
            </div>
          </div>
        )}

        {/* Step: Camera placeholder */}
        {step === "camera" && (
          <div className="text-center py-8">
            <Camera className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">Take a photo of the product</p>
            <p className="text-gray-300 text-xs mt-1">Point your camera at the item and tap the capture button</p>
          </div>
        )}

        {/* Step: Saving */}
        {step === "saving" && (
          <div className="text-center py-12">
            <Loader2 className="w-10 h-10 text-blue-500 animate-spin mx-auto mb-4" />
            <p className="text-gray-700 font-semibold">Processing...</p>
            <p className="text-gray-400 text-sm mt-1">Rendering canvas image & saving data</p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
