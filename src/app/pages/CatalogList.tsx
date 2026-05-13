import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  ChevronLeft,
  Package,
  Search,
  Loader2,
  TrendingUp,
  User,
  CheckCircle2,
  ShoppingBag,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "../contexts/AuthContext";
import { getCatalogItems, deleteCatalogItem, addWishlistItem, type CatalogItem } from "../../lib/database";

function formatIDR(val: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(val);
}

export function CatalogList() {
  const navigate = useNavigate();
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const { user } = useAuth();

  const [sellItem, setSellItem] = useState<CatalogItem | null>(null);
  const [customerName, setCustomerName] = useState("");
  const [dpStatus, setDpStatus] = useState<"pending" | "paid">("pending");
  const [selling, setSelling] = useState(false);

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    try {
      setLoading(true);
      const data = await getCatalogItems();
      setItems(data);
    } catch (err) {
      console.error("Failed to load catalog:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSell = async () => {
    if (!sellItem || !user || !customerName) return;
    setSelling(true);
    try {
      await addWishlistItem({
        user_id: user.id,
        customer_name: customerName,
        item_name: sellItem.item_name,
        qty: 1,
        est_price: sellItem.final_price_idr,
        dp_amount: dpStatus === "paid" ? sellItem.final_price_idr : 0,
        dp_status: dpStatus,
        status: dpStatus === "paid" ? "hunting" : "pending",
        phone: null,
        image_url: null,
      });
      await deleteCatalogItem(sellItem.id);

      setSellItem(null);
      setCustomerName("");
      setDpStatus("pending");
      loadItems();
    } catch (err) {
      console.error("Failed to sell item:", err);
    } finally {
      setSelling(false);
    }
  };

  const filtered = items.filter(i =>
    i.item_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalItems = items.length;
  const totalValue = items.reduce((sum, i) => sum + i.final_price_idr, 0);

  return (
    <div className="min-h-screen bg-[#F4F6FA]">
      {/* Header */}
      <div className="bg-white px-5 pt-14 pb-5 border-b border-gray-100">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => navigate("/")} className="w-9 h-9 rounded-xl bg-[#F4F6FA] flex items-center justify-center">
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div className="flex-1">
            <h1 className="text-gray-900 font-bold text-xl">Ready Stock</h1>
            <p className="text-gray-400 text-xs">Katalog barang tersedia</p>
          </div>
        </div>

        <div className="bg-[#F4F6FA] rounded-xl flex items-center gap-2 px-3.5 h-11">
          <Search className="w-4 h-4 text-gray-400" />
          <input
            placeholder="Search item..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent text-gray-700 placeholder-gray-400 text-sm flex-1 outline-none"
          />
        </div>
      </div>

      <div className="px-5 py-4 space-y-3">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-2 mb-2">
          <div className="bg-white rounded-xl p-3 text-center border border-gray-100">
            <div className="font-bold text-lg text-blue-600">{totalItems}</div>
            <div className="text-gray-400 text-xs mt-0.5">Total Items</div>
          </div>
          <div className="bg-white rounded-xl p-3 text-center border border-gray-100">
            <div className="font-bold text-lg text-green-600">{formatIDR(totalValue)}</div>
            <div className="text-gray-400 text-xs mt-0.5">Total Value</div>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-12">
            <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
          </div>
        )}

        {/* Empty State */}
        {!loading && items.length === 0 && (
          <div className="flex flex-col items-center py-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
               <Package className="w-8 h-8 text-gray-300" />
            </div>
            <p className="text-gray-500 font-medium mb-1">Belum ada barang</p>
            <p className="text-gray-400 text-sm">Gunakan Quick Add untuk foto barang.</p>
          </div>
        )}

        {/* Catalog Items */}
        <div className="space-y-3">
          {filtered.map((item, i) => {
            const baseIDR = item.base_price * item.exchange_rate;
            const profit = item.final_price_idr - baseIDR;

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="bg-white rounded-2xl border border-gray-100 p-4"
              >
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center flex-shrink-0">
                    <Package className="w-5 h-5 text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 leading-tight mb-1">{item.item_name}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-lg font-medium">
                        {item.currency} {item.base_price}
                      </span>
                      <span className="text-sm font-bold text-blue-600">{formatIDR(item.final_price_idr)}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setSellItem(item)}
                    className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0 active:scale-95 transition-transform"
                  >
                    <ShoppingBag className="w-5 h-5 text-blue-600" />
                  </button>
                </div>

                <div className="mt-3 pt-3 border-t border-gray-50 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-gray-400">
                    <span className="font-semibold">{new Date(item.created_at).toLocaleDateString("id-ID")}</span>
                  </div>
                  <div className="flex items-center gap-1 text-green-600 bg-green-50 px-2 py-0.5 rounded-lg">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span className="text-xs font-semibold text-green-700">+{formatIDR(profit)}</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Sell Modal */}
      <AnimatePresence>
        {sellItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-xl"
            >
              <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">Sell Item</h3>
                  <p className="text-gray-400 text-sm">{sellItem.item_name}</p>
                </div>
                <button
                  onClick={() => setSellItem(null)}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500"
                >
                  ✕
                </button>
              </div>

              <div className="p-5 space-y-4">
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">
                    Customer Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="e.g. Budi"
                      className="w-full h-12 bg-[#F4F6FA] rounded-xl pl-10 pr-4 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">
                    Payment Status
                  </label>
                  <div className="flex bg-[#F4F6FA] p-1 rounded-xl">
                    <button
                      onClick={() => setDpStatus("pending")}
                      className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-colors ${
                        dpStatus === "pending" ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      Belum Bayar
                    </button>
                    <button
                      onClick={() => setDpStatus("paid")}
                      className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-colors ${
                        dpStatus === "paid" ? "bg-green-500 text-white shadow-sm shadow-green-500/20" : "text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      Lunas
                    </button>
                  </div>
                </div>

                <button
                  onClick={handleSell}
                  disabled={selling || !customerName}
                  className="w-full h-[52px] mt-2 bg-gradient-to-r from-[#2563EB] to-[#1d4ed8] text-white rounded-2xl font-semibold flex items-center justify-center gap-2 active:scale-[0.98] transition-transform disabled:opacity-70"
                >
                  {selling ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <CheckCircle2 className="w-5 h-5" /> Confirm Sale — {formatIDR(sellItem.final_price_idr)}
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
