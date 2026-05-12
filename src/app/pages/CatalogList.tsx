import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  ChevronLeft,
  Package,
  Search,
  Loader2,
  TrendingUp,
} from "lucide-react";
import { motion } from "motion/react";
import { getCatalogItems, type CatalogItem } from "../../lib/database";

function formatIDR(val: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(val);
}

export function CatalogList() {
  const navigate = useNavigate();
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

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
    </div>
  );
}
