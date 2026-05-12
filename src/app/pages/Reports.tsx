import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router";
import {
  ChevronLeft,
  MessageCircle,
  TrendingUp,
  Search,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  AlertCircle,
  Clock,
  Package,
  BarChart2,
  ArrowUpRight,
  Loader2,
  Heart,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { getWishlistItems, getCatalogItems, type WishlistItem } from "../../lib/database";

function formatIDR(val: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(val);
}

// Group wishlist items by customer
function groupByCustomer(items: WishlistItem[]) {
  const map = new Map<string, WishlistItem[]>();
  items.forEach(item => {
    const existing = map.get(item.customer_name) || [];
    existing.push(item);
    map.set(item.customer_name, existing);
  });
  return Array.from(map.entries()).map(([name, items]) => {
    const totalPrice = items.reduce((sum, i) => sum + i.est_price * i.qty, 0);
    const dpPaid = items.reduce((sum, i) => sum + i.dp_amount, 0);
    const remaining = Math.max(0, totalPrice - dpPaid);
    let status = "unpaid";
    if (remaining === 0) status = "paid";
    else if (dpPaid > 0) status = "partial";
    return { name, items, totalPrice, dpPaid, remaining, status };
  });
}

function CustomerCard({ customer }: { customer: ReturnType<typeof groupByCustomer>[0] }) {
  const [expanded, setExpanded] = useState(true);

  const statusConfig = {
    paid: { label: "Lunas", bg: "bg-green-50", text: "text-green-600", icon: CheckCircle2, border: "border-green-100" },
    partial: { label: "Sebagian", bg: "bg-amber-50", text: "text-amber-600", icon: Clock, border: "border-amber-100" },
    unpaid: { label: "Belum Bayar", bg: "bg-red-50", text: "text-red-600", icon: AlertCircle, border: "border-red-100" },
  };

  const sc = statusConfig[customer.status as keyof typeof statusConfig];
  const StatusIcon = sc.icon;
  const initials = customer.name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);

  const handleWhatsApp = () => {
    const itemList = customer.items.map(i => `• ${i.item_name} x${i.qty} = ${formatIDR(i.est_price * i.qty)}`).join("\n");
    const msg = encodeURIComponent(
      `Halo ${customer.name}! 👋\n\nBerikut tagihan order kamu dari JastipFlow:\n\n${itemList}\n\n*Total: ${formatIDR(customer.totalPrice)}*\nDP Dibayar: ${formatIDR(customer.dpPaid)}\n*Sisa Tagihan: ${formatIDR(customer.remaining)}*\n\nMohon segera dilunasi ya! Terima kasih 🙏`
    );
    window.open(`https://wa.me/?text=${msg}`, "_blank");
  };

  return (
    <motion.div layout className={`bg-white rounded-2xl border overflow-hidden ${sc.border}`}>
      <button onClick={() => setExpanded(!expanded)} className="w-full px-4 py-3.5 flex items-center gap-3 text-left">
        <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm flex-shrink-0">
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-900">{customer.name}</span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${sc.bg} ${sc.text} flex items-center gap-1`}>
              <StatusIcon className="w-2.5 h-2.5" />{sc.label}
            </span>
          </div>
          <div className="text-xs text-gray-400 mt-0.5">
            {customer.items.length} item · {customer.status === "paid" ? <span className="text-green-600 font-medium">Lunas</span> : <span className="text-red-500 font-medium">Sisa {formatIDR(customer.remaining)}</span>}
          </div>
        </div>
        {expanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}>
            <div className="px-4 pb-4 border-t border-gray-50">
              <div className="py-3 space-y-2">
                {customer.items.map((item) => (
                  <div key={item.id} className="flex items-start gap-2">
                    <Package className="w-3.5 h-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <span className="text-sm text-gray-700">{item.item_name}</span>
                      <span className="text-xs text-gray-400 ml-1.5">×{item.qty}</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-800 flex-shrink-0">{formatIDR(item.est_price * item.qty)}</span>
                  </div>
                ))}
              </div>

              <div className="bg-[#F4F6FA] rounded-xl p-3 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Total</span>
                  <span className="font-semibold text-gray-800">{formatIDR(customer.totalPrice)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">DP Paid</span>
                  <span className="font-semibold text-green-600">{formatIDR(customer.dpPaid)}</span>
                </div>
                <div className="h-px bg-gray-200" />
                <div className="flex justify-between">
                  <span className="text-sm font-semibold text-gray-700">Remaining</span>
                  <span className={`font-bold ${customer.remaining === 0 ? "text-green-600" : "text-red-500"}`}>
                    {customer.remaining === 0 ? "✓ Lunas" : formatIDR(customer.remaining)}
                  </span>
                </div>
              </div>

              {customer.status !== "paid" && (
                <button onClick={handleWhatsApp} className="mt-3 w-full h-[48px] bg-[#25D366] text-white rounded-xl font-semibold flex items-center justify-center gap-2 active:scale-[0.98] transition-transform">
                  <MessageCircle className="w-4 h-4" />
                  <span className="text-sm">Share Bill via WhatsApp</span>
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function Reports() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const filterBills = searchParams.get("filter") || "all";

  const [activeTab, setActiveTab] = useState<"bills" | "profit">("bills");
  const [loading, setLoading] = useState(true);
  const [customers, setCustomers] = useState<ReturnType<typeof groupByCustomer>>([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalOutstanding, setTotalOutstanding] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [wishlist, catalog] = await Promise.all([getWishlistItems(), getCatalogItems()]);
      const grouped = groupByCustomer(wishlist);
      setCustomers(grouped);
      const revenue = wishlist.reduce((sum, w) => sum + w.est_price * w.qty, 0);
      const outstanding = grouped.filter(c => c.status !== "paid").reduce((sum, c) => sum + c.remaining, 0);
      setTotalRevenue(revenue);
      setTotalOutstanding(outstanding);
    } catch (err) {
      console.error("Failed to load reports:", err);
    } finally {
      setLoading(false);
    }
  };

  let filteredCustomers = customers;
  if (filterBills === "unpaid") {
    filteredCustomers = filteredCustomers.filter(c => c.status !== "paid");
  }
  if (searchQuery) {
    filteredCustomers = filteredCustomers.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }

  return (
    <div className="min-h-screen bg-[#F4F6FA]">
      {/* Header */}
      <div className="bg-white px-5 pt-14 pb-5 border-b border-gray-100">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => navigate("/")} className="w-9 h-9 rounded-xl bg-[#F4F6FA] flex items-center justify-center">
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-gray-900 font-bold text-xl">Reports</h1>
            <p className="text-gray-400 text-xs">Billing & profit summary</p>
          </div>
        </div>

        {/* Outstanding Banner */}
        <div className="bg-gradient-to-r from-[#2563EB] to-[#1d4ed8] rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-200 text-xs mb-0.5">Total Outstanding</p>
              <p className="text-white font-bold text-2xl">{formatIDR(totalOutstanding)}</p>
              <p className="text-blue-200 text-xs mt-0.5">
                from {customers.filter(c => c.status !== "paid").length} customers
              </p>
            </div>
            <div className="text-right">
              <div className="bg-white/15 rounded-xl p-2.5">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <p className="text-blue-200 text-[10px] mt-1">Revenue</p>
              <p className="text-white font-bold text-sm">{formatIDR(totalRevenue)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-5 py-4 space-y-4">
        {/* Tabs */}
        <div className="flex bg-white rounded-2xl p-1 border border-gray-100">
          {[
            { key: "bills", label: "Customer Bills", icon: MessageCircle },
            { key: "profit", label: "Profit Summary", icon: BarChart2 },
          ].map((tab) => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key as "bills" | "profit")} className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${activeTab === tab.key ? "bg-[#2563EB] text-white" : "text-gray-400"}`}>
              <tab.icon className="w-4 h-4" />{tab.label}
            </button>
          ))}
        </div>

        {loading && (
          <div className="flex justify-center py-12">
            <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
          </div>
        )}

        {activeTab === "bills" && !loading && (
          <>
            <div className="flex items-center gap-2 mb-4 px-1 pb-1 overflow-x-auto no-scrollbar">
              <button
                onClick={() => setSearchParams({ filter: "all" })}
                className={`whitespace-nowrap px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                  filterBills === "all"
                    ? "bg-[#2563EB] text-white shadow-md shadow-blue-500/20"
                    : "bg-white text-gray-500 border border-gray-100 hover:bg-gray-50"
                }`}
              >
                Semua Tagihan
              </button>
              <button
                onClick={() => setSearchParams({ filter: "unpaid" })}
                className={`whitespace-nowrap px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                  filterBills === "unpaid"
                    ? "bg-[#2563EB] text-white shadow-md shadow-blue-500/20"
                    : "bg-white text-gray-500 border border-gray-100 hover:bg-gray-50"
                }`}
              >
                Belum Lunas
              </button>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 flex items-center gap-2 px-3.5 h-11 mb-4">
              <Search className="w-4 h-4 text-gray-400" />
              <input placeholder="Search customer..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="bg-transparent text-gray-700 text-sm flex-1 outline-none" />
            </div>

            {filteredCustomers.length === 0 && (
              <div className="flex flex-col items-center py-16 text-center">
                <Heart className="w-8 h-8 text-gray-200 mb-3" />
                <p className="text-gray-400 text-sm">Belum ada data tagihan</p>
              </div>
            )}

            <div className="space-y-3">
              {filteredCustomers.map((customer, i) => (
                <motion.div key={customer.name} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <CustomerCard customer={customer} />
                </motion.div>
              ))}
            </div>
          </>
        )}

        {activeTab === "profit" && !loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
            {[
              { label: "Total Revenue", value: formatIDR(totalRevenue), icon: TrendingUp, color: "text-green-600", bg: "bg-green-50" },
              { label: "Est. Service Fee (20%)", value: formatIDR(totalRevenue * 0.2), icon: ArrowUpRight, color: "text-blue-600", bg: "bg-blue-50" },
              { label: "Outstanding", value: formatIDR(totalOutstanding), icon: AlertCircle, color: "text-red-500", bg: "bg-red-50" },
              { label: "Collected", value: formatIDR(totalRevenue - totalOutstanding), icon: CheckCircle2, color: "text-green-600", bg: "bg-green-50" },
            ].map((stat, i) => (
              <div key={i} className="bg-white rounded-2xl p-4 flex items-center gap-3 border border-gray-100">
                <div className={`w-10 h-10 ${stat.bg} rounded-xl flex items-center justify-center`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <div className="flex-1">
                  <p className="text-gray-400 text-xs">{stat.label}</p>
                  <p className={`font-bold text-lg ${stat.color}`}>{stat.value}</p>
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
