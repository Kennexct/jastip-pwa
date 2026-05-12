import { useState, useRef } from "react";
import { useNavigate } from "react-router";
import {
  ChevronLeft,
  Upload,
  User,
  Hash,
  DollarSign,
  AlertCircle,
  CheckCircle2,
  Heart,
  Plus,
  Filter,
  Search,
  Trash2,
  Clock,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

const wishlistItems = [
  {
    id: 1,
    customer: "Sarah",
    item: "Laneige Lip Sleeping Mask Berry",
    qty: 2,
    estPrice: "Rp 180.000",
    dpStatus: "paid",
    dpAmount: "Rp 54.000",
    imageUrl: "https://images.unsplash.com/photo-1770048792338-aaf6a575305f?w=80&h=80&fit=crop",
  },
  {
    id: 2,
    customer: "Maya",
    item: "SKII Facial Treatment Essence 230ml",
    qty: 1,
    estPrice: "Rp 950.000",
    dpStatus: "pending",
    dpAmount: "Rp 0",
    imageUrl: null,
  },
  {
    id: 3,
    customer: "Rina",
    item: "Sulwhasoo First Care Serum",
    qty: 1,
    estPrice: "Rp 1.200.000",
    dpStatus: "partial",
    dpAmount: "Rp 200.000",
    imageUrl: null,
  },
];

type DpStatus = "pending" | "paid" | "partial";

const statusConfig: Record<DpStatus, { label: string; bg: string; text: string; icon: typeof Clock }> = {
  pending: { label: "Pending", bg: "bg-red-100", text: "text-red-700", icon: Clock },
  paid: { label: "DP Paid", bg: "bg-green-100", text: "text-green-700", icon: CheckCircle2 },
  partial: { label: "Partial", bg: "bg-amber-100", text: "text-amber-700", icon: AlertCircle },
};

export function Wishlist() {
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [itemName, setItemName] = useState("");
  const [qty, setQty] = useState("1");
  const [estPrice, setEstPrice] = useState("");
  const [dpAmount, setDpAmount] = useState("");
  const [imageFile, setImageFile] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      setShowForm(false);
      setCustomerName("");
      setItemName("");
      setQty("1");
      setEstPrice("");
      setDpAmount("");
      setImageFile(null);
    }, 1500);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setImageFile(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F6FA]">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#d97706] to-[#f59e0b] px-5 pt-12 pb-6">
        <div className="flex items-center gap-3 mb-2">
          <button
            onClick={() => navigate("/")}
            className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center"
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
          <div className="flex-1">
            <h1 className="text-white font-bold" style={{ fontSize: "22px" }}>
              Wishlist Pipeline
            </h1>
            <p className="text-amber-100 text-xs">Pre-order customer requests</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center"
          >
            <Plus className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Search & Filter */}
        <div className="flex gap-2 mt-3">
          <div className="flex-1 bg-white/20 rounded-xl flex items-center gap-2 px-3 h-10">
            <Search className="w-4 h-4 text-white/70" />
            <input
              placeholder="Search customer or item..."
              className="bg-transparent text-white placeholder-white/60 text-sm flex-1 outline-none"
            />
          </div>
          <button className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <Filter className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>

      <div className="px-4 py-4 space-y-3">
        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "Total Items", value: "12", color: "text-amber-700", bg: "bg-amber-50 border-amber-200" },
            { label: "DP Pending", value: "5", color: "text-red-700", bg: "bg-red-50 border-red-200" },
            { label: "DP Received", value: "7", color: "text-green-700", bg: "bg-green-50 border-green-200" },
          ].map((s) => (
            <div key={s.label} className={`${s.bg} border rounded-xl p-2.5 text-center`}>
              <div className={`font-bold text-lg ${s.color}`}>{s.value}</div>
              <div className="text-gray-500 text-[10px]">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Existing wishlist items */}
        <div className="space-y-3">
          {wishlistItems.map((item, i) => {
            const status = statusConfig[item.dpStatus as DpStatus];
            const StatusIcon = status.icon;
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
              >
                <div className="p-4">
                  <div className="flex items-start gap-3">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.item}
                        className="w-14 h-14 rounded-xl object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-xl bg-amber-50 border-2 border-dashed border-amber-200 flex items-center justify-center flex-shrink-0">
                        <Heart className="w-5 h-5 text-amber-400" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <User className="w-3 h-3 text-gray-400" />
                            <span className="text-xs text-gray-500 font-medium">{item.customer}</span>
                          </div>
                          <p className="text-sm font-semibold text-gray-800 leading-tight">{item.item}</p>
                        </div>
                        <button className="w-7 h-7 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0">
                          <Trash2 className="w-3.5 h-3.5 text-red-400" />
                        </button>
                      </div>

                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-lg font-medium">
                          x{item.qty}
                        </span>
                        <span className="text-sm font-bold text-gray-800">{item.estPrice}</span>
                      </div>
                    </div>
                  </div>

                  {/* DP Section */}
                  <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <StatusIcon className={`w-3.5 h-3.5 ${status.text}`} />
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${status.bg} ${status.text}`}>
                        DP: {status.label}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">
                      Received: <span className="font-semibold text-gray-700">{item.dpAmount}</span>
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Add Wishlist Modal / Bottom Sheet */}
      <AnimatePresence>
        {showForm && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowForm(false)}
              className="fixed inset-0 bg-black/50 z-40"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 400 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl max-w-lg mx-auto"
            >
              {/* Handle */}
              <div className="flex justify-center pt-3 pb-2">
                <div className="w-10 h-1 bg-gray-300 rounded-full" />
              </div>

              <div className="px-5 pb-8 overflow-y-auto max-h-[85vh]">
                <h2 className="text-gray-900 font-bold mb-4" style={{ fontSize: "20px" }}>
                  Add to Wishlist
                </h2>

                {/* Image upload */}
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                <button
                  onClick={() => fileRef.current?.click()}
                  className={`w-full h-[120px] rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-2 mb-4 transition-colors ${
                    imageFile ? "border-amber-400 bg-amber-50" : "border-gray-300 bg-gray-50"
                  }`}
                >
                  {imageFile ? (
                    <img src={imageFile} alt="item" className="h-24 w-full object-cover rounded-xl" />
                  ) : (
                    <>
                      <Upload className="w-7 h-7 text-gray-400" />
                      <span className="text-sm text-gray-500">Upload screenshot of item</span>
                    </>
                  )}
                </button>

                <div className="space-y-3">
                  {/* Customer Name */}
                  <div>
                    <label className="text-sm text-gray-600 mb-1.5 block">Customer Name</label>
                    <div className="relative">
                      <User className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                      <input
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="e.g. Sarah"
                        className="w-full h-[52px] bg-[#F4F6FA] rounded-xl pl-10 pr-4 text-gray-800 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-400"
                      />
                    </div>
                  </div>

                  {/* Item Name */}
                  <div>
                    <label className="text-sm text-gray-600 mb-1.5 block">Item Name / Description</label>
                    <input
                      value={itemName}
                      onChange={(e) => setItemName(e.target.value)}
                      placeholder="e.g. Laneige Lip Sleeping Mask Berry"
                      className="w-full h-[52px] bg-[#F4F6FA] rounded-xl px-4 text-gray-800 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-400"
                    />
                  </div>

                  {/* QTY */}
                  <div>
                    <label className="text-sm text-gray-600 mb-1.5 block">Quantity (QTY)</label>
                    <div className="relative">
                      <Hash className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                      <input
                        type="number"
                        value={qty}
                        onChange={(e) => setQty(e.target.value)}
                        min="1"
                        className="w-full h-[52px] bg-[#F4F6FA] rounded-xl pl-10 pr-4 text-gray-800 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-400"
                      />
                    </div>
                  </div>

                  {/* Estimated Price */}
                  <div>
                    <label className="text-sm text-gray-600 mb-1.5 block">Estimated Price (IDR)</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-600 font-bold text-sm">Rp</span>
                      <input
                        type="number"
                        value={estPrice}
                        onChange={(e) => setEstPrice(e.target.value)}
                        placeholder="180000"
                        className="w-full h-[52px] bg-[#F4F6FA] rounded-xl pl-10 pr-4 text-gray-800 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-400"
                      />
                    </div>
                  </div>

                  {/* DP Section */}
                  <div className="bg-red-50 rounded-xl p-3.5 border border-red-100">
                    <div className="flex items-center justify-between mb-2.5">
                      <div className="flex items-center gap-1.5">
                        <AlertCircle className="w-4 h-4 text-red-500" />
                        <span className="text-sm font-semibold text-gray-800">Down Payment (DP)</span>
                      </div>
                      <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-0.5 rounded-full">
                        Status: Pending
                      </span>
                    </div>
                    <label className="text-sm text-gray-600 mb-1.5 block">DP Amount Received</label>
                    <div className="relative">
                      <DollarSign className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                      <input
                        type="number"
                        value={dpAmount}
                        onChange={(e) => setDpAmount(e.target.value)}
                        placeholder="0"
                        className="w-full h-[52px] bg-white rounded-xl pl-10 pr-4 text-gray-800 border border-red-200 focus:outline-none focus:ring-2 focus:ring-red-400"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1.5">Enter 0 if no DP has been collected yet</p>
                  </div>

                  {/* Save Button */}
                  <button
                    onClick={handleSave}
                    className={`w-full h-[56px] rounded-2xl font-bold text-white transition-all flex items-center justify-center gap-2 ${
                      saved ? "bg-green-500" : "bg-amber-500"
                    } shadow-lg`}
                  >
                    {saved ? (
                      <>
                        <CheckCircle2 className="w-5 h-5" />
                        Saved to Wishlist!
                      </>
                    ) : (
                      <>
                        <Heart className="w-5 h-5" />
                        Save to Wishlist
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
