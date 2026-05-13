import { useState, useRef, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router";
import {
  ChevronLeft, Upload, User, Hash, DollarSign, AlertCircle, CheckCircle2,
  Heart, Plus, Search, Trash2, Clock, Loader2, Phone, Eye,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "../contexts/AuthContext";
import {
  getWishlistItems, addWishlistItem, deleteWishlistItem,
  updateWishlistDp, updateWishlistStatus, type WishlistItem,
} from "../../lib/database";
import { getDpConfig } from "../../lib/settings";

type DpStatus = "pending" | "paid" | "partial";
type WlStatus = "pending" | "hunting" | "fulfilled" | "cancelled";

const dpStatusConfig: Record<DpStatus, { label: string; bg: string; text: string; icon: typeof Clock }> = {
  pending: { label: "Pending", bg: "bg-red-50", text: "text-red-600", icon: Clock },
  paid: { label: "DP Paid", bg: "bg-green-50", text: "text-green-600", icon: CheckCircle2 },
  partial: { label: "Partial", bg: "bg-amber-50", text: "text-amber-600", icon: AlertCircle },
};

const wlStatusConfig: Record<WlStatus, { label: string; bg: string; text: string }> = {
  pending: { label: "Pending", bg: "bg-gray-100", text: "text-gray-600" },
  hunting: { label: "Ready to Hunt", bg: "bg-blue-50", text: "text-blue-600" },
  fulfilled: { label: "Fulfilled", bg: "bg-green-50", text: "text-green-600" },
  cancelled: { label: "Cancelled", bg: "bg-red-50", text: "text-red-500" },
};

function formatIDR(val: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(val);
}

export function Wishlist() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const filterTab = searchParams.get("filter") || "all";

  const { user } = useAuth();
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [itemName, setItemName] = useState("");
  const [qty, setQty] = useState("1");
  const [estPrice, setEstPrice] = useState("");
  const [dpAmount, setDpAmount] = useState("");
  const [phoneNum, setPhoneNum] = useState("");
  const [imageFile, setImageFile] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  // DP Record modal
  const [dpItem, setDpItem] = useState<WishlistItem | null>(null);
  const [dpRecordAmount, setDpRecordAmount] = useState("");
  const [dpSaving, setDpSaving] = useState(false);

  const dpConfig = getDpConfig();

  useEffect(() => { loadItems(); }, []);

  const loadItems = async () => {
    try {
      setLoading(true);
      const data = await getWishlistItems();
      setItems(data);
    } catch (err) {
      console.error("Failed to load wishlist:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user || !customerName || !itemName) return;
    setSaving(true);
    try {
      const dpNum = parseInt(dpAmount) || 0;
      const priceNum = parseInt(estPrice) || 0;
      let dpStat: DpStatus = "pending";
      if (dpNum > 0 && dpNum >= priceNum) dpStat = "paid";
      else if (dpNum > 0) dpStat = "partial";

      const wlStatus: WlStatus = dpNum > 0 ? "hunting" : "pending";

      await addWishlistItem({
        user_id: user.id,
        customer_name: customerName,
        item_name: itemName,
        qty: parseInt(qty) || 1,
        est_price: priceNum,
        dp_amount: dpNum,
        dp_status: dpStat,
        status: wlStatus,
        phone: phoneNum || null,
        image_url: imageFile,
      });

      setSaved(true);
      setTimeout(() => {
        setSaved(false);
        setShowForm(false);
        setCustomerName(""); setItemName(""); setQty("1");
        setEstPrice(""); setDpAmount(""); setPhoneNum("");
        setImageFile(null);
        loadItems();
      }, 1200);
    } catch (err) {
      console.error("Failed to save:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteWishlistItem(id);
      setItems(items.filter(i => i.id !== id));
    } catch (err) {
      console.error("Failed to delete:", err);
    }
  };

  const handleRecordDp = async () => {
    if (!dpItem) return;
    setDpSaving(true);
    try {
      const newDp = (dpItem.dp_amount || 0) + (parseInt(dpRecordAmount) || 0);
      const dpStat = newDp >= dpItem.est_price ? "paid" : newDp > 0 ? "partial" : "pending";
      await updateWishlistDp(dpItem.id, newDp, dpStat);
      if (newDp > 0 && dpItem.status === "pending") {
        await updateWishlistStatus(dpItem.id, "hunting");
      }
      setDpItem(null);
      setDpRecordAmount("");
      loadItems();
    } catch (err) {
      console.error("Failed to record DP:", err);
    } finally {
      setDpSaving(false);
    }
  };

  const canFoundIt = (item: WishlistItem) => {
    if (item.status === "fulfilled" || item.status === "cancelled") return false;
    if (dpConfig.mandatory && item.dp_amount <= 0) return false;
    return true;
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setImageFile(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  // Filter
  let filtered = items;
  if (filterTab === "pending") filtered = filtered.filter(i => i.status === "pending");
  else if (filterTab === "hunting") filtered = filtered.filter(i => i.status === "hunting");
  else if (filterTab === "fulfilled") filtered = filtered.filter(i => i.status === "fulfilled");

  if (searchQuery) {
    filtered = filtered.filter(i =>
      i.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.item_name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  const totalItems = items.length;
  const dpPending = items.filter(i => i.dp_status === "pending").length;
  const readyToHunt = items.filter(i => i.status === "hunting").length;
  const fulfilledCount = items.filter(i => i.status === "fulfilled").length;

  return (
    <div className="min-h-screen bg-[#F4F6FA] pb-24">
      {/* Header */}
      <div className="bg-white px-5 pt-14 pb-5 border-b border-gray-100">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => navigate("/")} className="w-9 h-9 rounded-xl bg-[#F4F6FA] flex items-center justify-center">
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div className="flex-1">
            <h1 className="text-gray-900 font-bold text-xl">Wishlist</h1>
            <p className="text-gray-400 text-xs">Pre-order customer requests</p>
          </div>
          <button onClick={() => setShowForm(true)} className="w-9 h-9 rounded-xl bg-[#2563EB] flex items-center justify-center">
            <Plus className="w-5 h-5 text-white" />
          </button>
        </div>

        <div className="bg-[#F4F6FA] rounded-xl flex items-center gap-2 px-3.5 h-11">
          <Search className="w-4 h-4 text-gray-400" />
          <input placeholder="Search customer or item..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent text-gray-700 placeholder-gray-400 text-sm flex-1 outline-none" />
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 mt-4 px-1 pb-1 overflow-x-auto no-scrollbar">
          {(["all", "pending", "hunting", "fulfilled"] as const).map(tab => (
            <button key={tab} onClick={() => setSearchParams({ filter: tab })}
              className={`whitespace-nowrap px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                filterTab === tab ? "bg-[#2563EB] text-white shadow-md shadow-blue-500/20"
                  : "bg-white text-gray-500 border border-gray-100 hover:bg-gray-50"
              }`}>
              {tab === "all" ? "All Items" : tab === "pending" ? "Pending DP" : tab === "hunting" ? "Ready to Hunt" : "Fulfilled"}
            </button>
          ))}
        </div>
      </div>

      <div className="px-5 py-4 space-y-3">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: "Total", value: totalItems, color: "text-gray-900" },
            { label: "DP Pending", value: dpPending, color: "text-red-600" },
            { label: "Hunt Ready", value: readyToHunt, color: "text-blue-600" },
            { label: "Fulfilled", value: fulfilledCount, color: "text-green-600" },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-xl p-2.5 text-center border border-gray-100">
              <div className={`font-bold text-lg ${s.color}`}>{s.value}</div>
              <div className="text-gray-400 text-[10px] mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        {loading && (
          <div className="flex justify-center py-12">
            <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
          </div>
        )}

        {!loading && items.length === 0 && (
          <div className="flex flex-col items-center py-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
              <Heart className="w-8 h-8 text-gray-300" />
            </div>
            <p className="text-gray-500 font-medium mb-1">Belum ada wishlist</p>
            <p className="text-gray-400 text-sm">Tap tombol + untuk menambahkan</p>
          </div>
        )}

        {/* Wishlist Cards */}
        <div className="space-y-3">
          {filtered.map((item, i) => {
            const dpSc = dpStatusConfig[item.dp_status as DpStatus] || dpStatusConfig.pending;
            const wlSc = wlStatusConfig[(item.status || "pending") as WlStatus] || wlStatusConfig.pending;
            const StatusIcon = dpSc.icon;
            const isFulfilled = item.status === "fulfilled";

            return (
              <motion.div key={item.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }} className="bg-white rounded-2xl border border-gray-100 p-4">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {item.image_url ? (
                      <img src={item.image_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <Heart className="w-5 h-5 text-gray-300" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <User className="w-3 h-3 text-gray-400" />
                          <span className="text-xs text-gray-400 font-medium">{item.customer_name}</span>
                        </div>
                        <p className="text-sm font-semibold text-gray-800 leading-tight">{item.item_name}</p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {/* Contextual action button */}
                        {isFulfilled ? (
                          <span className="text-[10px] font-bold bg-green-50 text-green-600 px-2 py-1 rounded-lg flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Done
                          </span>
                        ) : item.dp_status === "pending" ? (
                          <button onClick={() => { setDpItem(item); setDpRecordAmount(""); }}
                            className="text-[10px] font-bold bg-amber-500 text-white px-2 py-1 rounded-lg uppercase tracking-wide active:scale-95 transition-transform">
                            Record DP
                          </button>
                        ) : canFoundIt(item) ? (
                          <button onClick={() => navigate(`/wishlist/capture/${item.id}`, { state: { item } })}
                            className="text-[10px] font-bold bg-[#2563EB] text-white px-2.5 py-1 rounded-lg uppercase tracking-wide active:scale-95 transition-transform flex items-center gap-1">
                            <Eye className="w-3 h-3" /> Found It
                          </button>
                        ) : (
                          <span className="text-[10px] font-bold bg-gray-100 text-gray-400 px-2 py-1 rounded-lg">
                            Need DP
                          </span>
                        )}
                        {!isFulfilled && (
                          <button onClick={() => handleDelete(item.id)}
                            className="w-7 h-7 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0">
                            <Trash2 className="w-3.5 h-3.5 text-gray-400" />
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-lg font-medium">x{item.qty}</span>
                      <span className="text-sm font-bold text-gray-800">{formatIDR(item.est_price)}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-gray-50 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <StatusIcon className={`w-3.5 h-3.5 ${dpSc.text}`} />
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${dpSc.bg} ${dpSc.text}`}>
                      DP: {dpSc.label}
                    </span>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${wlSc.bg} ${wlSc.text}`}>
                      {wlSc.label}
                    </span>
                  </div>
                  <span className="text-xs text-gray-400">
                    Received: <span className="font-semibold text-gray-600">{formatIDR(item.dp_amount)}</span>
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Add Wishlist Bottom Sheet */}
      <AnimatePresence>
        {showForm && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowForm(false)} className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" />
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 400 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl max-w-lg mx-auto">
              <div className="flex justify-center pt-3 pb-2"><div className="w-10 h-1 bg-gray-200 rounded-full" /></div>
              <div className="px-5 pb-8 overflow-y-auto max-h-[85vh]">
                <h2 className="text-gray-900 font-bold text-lg mb-5">Add to Wishlist</h2>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                <button onClick={() => fileRef.current?.click()}
                  className={`w-full h-[100px] rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-2 mb-5 transition-colors ${
                    imageFile ? "border-blue-300 bg-blue-50" : "border-gray-200 bg-[#F4F6FA]"
                  }`}>
                  {imageFile ? (
                    <img src={imageFile} alt="item" className="h-20 w-full object-cover rounded-xl" />
                  ) : (
                    <><Upload className="w-6 h-6 text-gray-400" /><span className="text-xs text-gray-400">Upload screenshot</span></>
                  )}
                </button>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-500 mb-1.5 block">Customer Name</label>
                    <div className="relative">
                      <User className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                      <input value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="e.g. Sarah"
                        className="w-full h-12 bg-[#F4F6FA] rounded-xl pl-10 pr-4 text-gray-800 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500 mb-1.5 block">Phone (WhatsApp)</label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                      <input value={phoneNum} onChange={(e) => setPhoneNum(e.target.value)} placeholder="e.g. 08123456789"
                        className="w-full h-12 bg-[#F4F6FA] rounded-xl pl-10 pr-4 text-gray-800 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500 mb-1.5 block">Item Name</label>
                    <input value={itemName} onChange={(e) => setItemName(e.target.value)} placeholder="e.g. Laneige Lip Sleeping Mask"
                      className="w-full h-12 bg-[#F4F6FA] rounded-xl px-4 text-gray-800 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm text-gray-500 mb-1.5 block">QTY</label>
                      <div className="relative">
                        <Hash className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                        <input type="number" value={qty} onChange={(e) => setQty(e.target.value)} min="1"
                          className="w-full h-12 bg-[#F4F6FA] rounded-xl pl-10 pr-4 text-gray-800 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm text-gray-500 mb-1.5 block">Est. Price (IDR)</label>
                      <input type="number" value={estPrice} onChange={(e) => setEstPrice(e.target.value)} placeholder="180000"
                        className="w-full h-12 bg-[#F4F6FA] rounded-xl px-4 text-gray-800 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                  </div>
                  <div className="bg-[#F4F6FA] rounded-xl p-4">
                    <div className="flex items-center gap-1.5 mb-3">
                      <DollarSign className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-semibold text-gray-700">Down Payment (DP)</span>
                      {dpConfig.mandatory && (
                        <span className="text-[10px] font-bold text-red-500 bg-red-50 px-1.5 py-0.5 rounded">MANDATORY</span>
                      )}
                    </div>
                    <input type="number" value={dpAmount} onChange={(e) => setDpAmount(e.target.value)} placeholder="0"
                      className="w-full h-12 bg-white rounded-xl px-4 text-gray-800 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    <p className="text-xs text-gray-400 mt-2">{dpConfig.mandatory ? "DP is required before hunting" : "Enter 0 if no DP collected"}</p>
                  </div>
                  <button onClick={handleSave} disabled={saving || !customerName || !itemName}
                    className={`w-full h-[52px] rounded-2xl font-semibold text-white transition-all flex items-center justify-center gap-2 disabled:opacity-50 ${
                      saved ? "bg-green-500" : "bg-[#2563EB]"
                    }`}>
                    {saved ? (<><CheckCircle2 className="w-5 h-5" /> Saved!</>) : saving ? (<Loader2 className="w-5 h-5 animate-spin" />) : (<><Heart className="w-5 h-5" /> Save to Wishlist</>)}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Record DP Modal */}
      <AnimatePresence>
        {dpItem && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-xl">
              <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">Record DP</h3>
                  <p className="text-gray-400 text-sm">{dpItem.customer_name} — {dpItem.item_name}</p>
                </div>
                <button onClick={() => setDpItem(null)}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500">✕</button>
              </div>
              <div className="p-5 space-y-4">
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-3">
                  <p className="text-blue-800 text-xs">
                    Item Price: <b>{formatIDR(dpItem.est_price)}</b> · Current DP: <b>{formatIDR(dpItem.dp_amount)}</b>
                  </p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">DP Amount (IDR)</label>
                  <div className="relative">
                    <DollarSign className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input type="number" value={dpRecordAmount} onChange={(e) => setDpRecordAmount(e.target.value)}
                      placeholder="e.g. 100000"
                      className="w-full h-12 bg-[#F4F6FA] rounded-xl pl-10 pr-4 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#2563EB]" />
                  </div>
                </div>
                <div className="flex gap-2">
                  {[dpItem.est_price, Math.round(dpItem.est_price / 2)].map((v) => (
                    <button key={v} onClick={() => setDpRecordAmount(v.toString())}
                      className="flex-1 h-10 rounded-xl bg-gray-50 border border-gray-200 text-xs font-semibold text-gray-600 active:scale-95 transition-transform">
                      {v === dpItem.est_price ? "Pay All" : "Pay Half"}
                    </button>
                  ))}
                </div>
                <button onClick={handleRecordDp} disabled={dpSaving || !dpRecordAmount}
                  className="w-full h-[52px] mt-2 bg-amber-500 text-white rounded-2xl font-semibold flex items-center justify-center gap-2 active:scale-[0.98] transition-transform disabled:opacity-70">
                  {dpSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <><DollarSign className="w-5 h-5" /> Confirm DP</>}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
