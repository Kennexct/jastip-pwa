import { useState } from "react";
import { useNavigate } from "react-router";
import {
  ChevronLeft,
  MessageCircle,
  TrendingUp,
  Filter,
  Search,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  AlertCircle,
  Clock,
  Package,
  BarChart2,
  ArrowUpRight,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

const customers = [
  {
    id: 1,
    name: "Sarah Putri",
    avatar: "SP",
    avatarColor: "bg-pink-100 text-pink-700",
    items: [
      { name: "Laneige Lip Sleeping Mask Berry", qty: 2, price: 180000 },
      { name: "Innisfree Green Tea Serum", qty: 1, price: 320000 },
    ],
    dpPaid: 150000,
    status: "partial",
    phone: "6281234567890",
  },
  {
    id: 2,
    name: "Maya Rahayu",
    avatar: "MR",
    avatarColor: "bg-purple-100 text-purple-700",
    items: [
      { name: "SKII Facial Treatment Essence 230ml", qty: 1, price: 950000 },
    ],
    dpPaid: 0,
    status: "unpaid",
    phone: "6289876543210",
  },
  {
    id: 3,
    name: "Rina Susanti",
    avatar: "RS",
    avatarColor: "bg-blue-100 text-blue-700",
    items: [
      { name: "Sulwhasoo First Care Serum", qty: 1, price: 1200000 },
      { name: "The History of Whoo Cream", qty: 1, price: 850000 },
    ],
    dpPaid: 500000,
    status: "partial",
    phone: "6285555555555",
  },
  {
    id: 4,
    name: "Dewi Anggraeni",
    avatar: "DA",
    avatarColor: "bg-green-100 text-green-700",
    items: [
      { name: "Shiseido Ultimune Serum", qty: 1, price: 780000 },
    ],
    dpPaid: 780000,
    status: "paid",
    phone: "6287777777777",
  },
];

function formatIDR(val: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(val);
}

function CustomerCard({ customer }: { customer: (typeof customers)[0] }) {
  const [expanded, setExpanded] = useState(true);
  const totalPrice = customer.items.reduce((sum, i) => sum + i.price * i.qty, 0);
  const remaining = Math.max(0, totalPrice - customer.dpPaid);

  const statusConfig = {
    paid: {
      label: "Lunas",
      bg: "bg-green-100",
      text: "text-green-700",
      icon: CheckCircle2,
      border: "border-green-200",
    },
    partial: {
      label: "Sebagian",
      bg: "bg-amber-100",
      text: "text-amber-700",
      icon: Clock,
      border: "border-amber-200",
    },
    unpaid: {
      label: "Belum Bayar",
      bg: "bg-red-100",
      text: "text-red-700",
      icon: AlertCircle,
      border: "border-red-200",
    },
  };

  const sc = statusConfig[customer.status as keyof typeof statusConfig];
  const StatusIcon = sc.icon;

  const handleWhatsApp = () => {
    const totalFormatted = formatIDR(totalPrice);
    const dpFormatted = formatIDR(customer.dpPaid);
    const remainingFormatted = formatIDR(remaining);

    const itemList = customer.items
      .map((i) => `• ${i.name} x${i.qty} = ${formatIDR(i.price * i.qty)}`)
      .join("\n");

    const msg = encodeURIComponent(
      `Halo ${customer.name}! 👋\n\nBerikut tagihan order kamu dari JastipFlow:\n\n${itemList}\n\n*Total: ${totalFormatted}*\nDP Dibayar: ${dpFormatted}\n*Sisa Tagihan: ${remainingFormatted}*\n\nMohon segera dilunasi ya! Terima kasih 🙏`
    );
    window.open(`https://wa.me/${customer.phone}?text=${msg}`, "_blank");
  };

  return (
    <motion.div
      layout
      className={`bg-white rounded-2xl shadow-sm border overflow-hidden ${sc.border}`}
    >
      {/* Card Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-4 py-3.5 flex items-center gap-3 text-left"
      >
        <div
          className={`w-10 h-10 rounded-full ${customer.avatarColor} flex items-center justify-center font-bold text-sm flex-shrink-0`}
        >
          {customer.avatar}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-900">{customer.name}</span>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${sc.bg} ${sc.text} flex items-center gap-1`}
            >
              <StatusIcon className="w-2.5 h-2.5" />
              {sc.label}
            </span>
          </div>
          <div className="text-xs text-gray-500 mt-0.5">
            {customer.items.length} item{customer.items.length > 1 ? "s" : ""} ·{" "}
            {customer.status === "paid" ? (
              <span className="text-green-600 font-medium">Lunas</span>
            ) : (
              <span className="text-red-600 font-medium">Sisa {formatIDR(remaining)}</span>
            )}
          </div>
        </div>
        {expanded ? (
          <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
        )}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="px-4 pb-4 border-t border-gray-100">
              {/* Item List */}
              <div className="py-3 space-y-2">
                {customer.items.map((item, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <Package className="w-3.5 h-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <span className="text-sm text-gray-700 leading-tight">{item.name}</span>
                      <span className="text-xs text-gray-500 ml-1.5">×{item.qty}</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-800 flex-shrink-0">
                      {formatIDR(item.price * item.qty)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Financial Summary */}
              <div className="bg-[#F4F6FA] rounded-xl p-3 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total Final Price</span>
                  <span className="font-semibold text-gray-800">{formatIDR(totalPrice)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">DP Paid</span>
                  <span className="font-semibold text-green-600">{formatIDR(customer.dpPaid)}</span>
                </div>
                <div className="h-px bg-gray-200" />
                <div className="flex justify-between">
                  <span className="text-sm font-semibold text-gray-700">Remaining Bill</span>
                  <span
                    className={`font-bold ${
                      remaining === 0 ? "text-green-600" : "text-red-600"
                    }`}
                    style={{ fontSize: "16px" }}
                  >
                    {remaining === 0 ? "✓ Lunas" : formatIDR(remaining)}
                  </span>
                </div>
              </div>

              {/* WA Button */}
              {customer.status !== "paid" && (
                <button
                  onClick={handleWhatsApp}
                  className="mt-3 w-full h-[48px] bg-[#25D366] text-white rounded-xl font-semibold flex items-center justify-center gap-2 shadow-sm shadow-green-200 active:scale-98 transition-transform"
                >
                  <MessageCircle className="w-4.5 h-4.5" />
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
  const [activeTab, setActiveTab] = useState<"bills" | "profit">("bills");

  const totalOutstanding = customers
    .filter((c) => c.status !== "paid")
    .reduce((sum, c) => {
      const total = c.items.reduce((s, i) => s + i.price * i.qty, 0);
      return sum + Math.max(0, total - c.dpPaid);
    }, 0);

  const totalRevenue = customers.reduce(
    (sum, c) => sum + c.items.reduce((s, i) => s + i.price * i.qty, 0),
    0
  );

  return (
    <div className="min-h-screen bg-[#F4F6FA]">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#16a34a] to-[#22c55e] px-5 pt-12 pb-6">
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => navigate("/")}
            className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center"
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
          <div>
            <h1 className="text-white font-bold" style={{ fontSize: "22px" }}>
              Reports & Billing
            </h1>
            <p className="text-green-100 text-xs">Trip: SG — May 2026</p>
          </div>
        </div>

        {/* Outstanding Banner */}
        <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 border border-white/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-xs mb-0.5">Total Outstanding</p>
              <p className="text-white font-bold" style={{ fontSize: "26px" }}>
                {formatIDR(totalOutstanding)}
              </p>
              <p className="text-green-100 text-xs mt-0.5">
                from {customers.filter((c) => c.status !== "paid").length} customers
              </p>
            </div>
            <div className="text-right">
              <div className="bg-white/20 rounded-xl p-2.5">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <p className="text-green-100 text-[10px] mt-1">Est. Revenue</p>
              <p className="text-white font-bold text-sm">{formatIDR(totalRevenue)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* Tabs */}
        <div className="flex bg-white rounded-2xl p-1 shadow-sm border border-gray-100">
          {[
            { key: "bills", label: "Customer Bills", icon: MessageCircle },
            { key: "profit", label: "Profit Summary", icon: BarChart2 },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as "bills" | "profit")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                activeTab === tab.key
                  ? "bg-[#2563EB] text-white shadow-sm"
                  : "text-gray-500"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "bills" && (
          <>
            {/* Search & Filter row */}
            <div className="flex gap-2">
              <div className="flex-1 bg-white rounded-xl border border-gray-200 flex items-center gap-2 px-3 h-11">
                <Search className="w-4 h-4 text-gray-400" />
                <input
                  placeholder="Search customer..."
                  className="bg-transparent text-gray-700 text-sm flex-1 outline-none"
                />
              </div>
              <button className="w-11 h-11 bg-white rounded-xl border border-gray-200 flex items-center justify-center">
                <Filter className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            {/* Customer Bill Cards */}
            <div className="space-y-3">
              {customers.map((customer, i) => (
                <motion.div
                  key={customer.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07 }}
                >
                  <CustomerCard customer={customer} />
                </motion.div>
              ))}
            </div>
          </>
        )}

        {activeTab === "profit" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-3"
          >
            {/* Profit cards */}
            {[
              { label: "Total Revenue", value: formatIDR(totalRevenue), icon: TrendingUp, color: "text-green-700", bg: "bg-green-50 border-green-200" },
              { label: "Est. Service Fee (20%)", value: formatIDR(totalRevenue * 0.2), icon: ArrowUpRight, color: "text-blue-700", bg: "bg-blue-50 border-blue-200" },
              { label: "Outstanding Receivable", value: formatIDR(totalOutstanding), icon: AlertCircle, color: "text-red-700", bg: "bg-red-50 border-red-200" },
              { label: "Collected", value: formatIDR(totalRevenue - totalOutstanding), icon: CheckCircle2, color: "text-green-700", bg: "bg-green-50 border-green-200" },
            ].map((stat, i) => (
              <div
                key={i}
                className={`${stat.bg} border rounded-2xl p-4 flex items-center gap-3`}
              >
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <div className="flex-1">
                  <p className="text-gray-500 text-xs">{stat.label}</p>
                  <p className={`font-bold ${stat.color}`} style={{ fontSize: "18px" }}>
                    {stat.value}
                  </p>
                </div>
              </div>
            ))}

            {/* Item breakdown */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100">
                <h3 className="font-semibold text-gray-800">Top Selling Items</h3>
              </div>
              {[
                { name: "Sulwhasoo First Care Serum", sold: 3, revenue: "Rp 3.600.000" },
                { name: "SKII Facial Treatment Essence", sold: 2, revenue: "Rp 1.900.000" },
                { name: "Laneige Lip Sleeping Mask", sold: 5, revenue: "Rp 900.000" },
              ].map((item, i) => (
                <div key={i} className="px-4 py-3 border-b border-gray-50 flex items-center gap-3 last:border-0">
                  <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-700 font-bold text-xs">{i + 1}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{item.name}</p>
                    <p className="text-xs text-gray-500">{item.sold} sold</p>
                  </div>
                  <span className="text-sm font-semibold text-green-700">{item.revenue}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
