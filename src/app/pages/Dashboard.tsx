import { useNavigate } from "react-router";
import {
  ShoppingCart,
  Package,
  TrendingUp,
  AlertCircle,
  Camera,
  Bell,
  ChevronRight,
  MapPin,
  ArrowUpRight,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { motion } from "motion/react";

const metrics = [
  {
    id: 1,
    label: "Pending Wishlist",
    value: "12",
    sub: "items",
    icon: Clock,
    bg: "bg-amber-50",
    border: "border-amber-200",
    iconBg: "bg-amber-100",
    iconColor: "text-amber-600",
    valueColor: "text-amber-700",
    badge: "bg-amber-100 text-amber-700",
    trend: "+3 today",
  },
  {
    id: 2,
    label: "Ready Stock",
    value: "28",
    sub: "items",
    icon: Package,
    bg: "bg-blue-50",
    border: "border-blue-200",
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
    valueColor: "text-blue-700",
    badge: "bg-blue-100 text-blue-700",
    trend: "+8 today",
  },
  {
    id: 3,
    label: "Est. Gross Profit",
    value: "Rp 2.4M",
    sub: "this trip",
    icon: TrendingUp,
    bg: "bg-green-50",
    border: "border-green-200",
    iconBg: "bg-green-100",
    iconColor: "text-green-600",
    valueColor: "text-green-700",
    badge: "bg-green-100 text-green-700",
    trend: "+12%",
  },
  {
    id: 4,
    label: "Unpaid Bills",
    value: "Rp 4.5M",
    sub: "outstanding",
    icon: AlertCircle,
    bg: "bg-red-50",
    border: "border-red-200",
    iconBg: "bg-red-100",
    iconColor: "text-red-600",
    valueColor: "text-red-700",
    badge: "bg-red-100 text-red-700",
    trend: "6 customers",
  },
];

const recentActivity = [
  {
    id: 1,
    type: "added",
    name: "Laneige Lip Sleeping Mask",
    customer: "Sarah",
    price: "Rp 180.000",
    time: "2m ago",
    status: "ready",
  },
  {
    id: 2,
    type: "wishlist",
    name: "SKII Facial Treatment Essence",
    customer: "Maya",
    price: "Rp 950.000",
    time: "15m ago",
    status: "pending",
  },
  {
    id: 3,
    type: "paid",
    name: "Sulwhasoo First Care Serum",
    customer: "Rina",
    price: "Rp 1.200.000",
    time: "1h ago",
    status: "paid",
  },
];

export function Dashboard() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F4F6FA]">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#1a4fc4] to-[#2563EB] px-5 pt-12 pb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-white/70 text-sm">Good morning,</span>
              <span className="text-white text-sm font-semibold">Dewi 👋</span>
            </div>
            <h1 className="text-white" style={{ fontSize: "28px", fontWeight: 700, lineHeight: 1.2 }}>
              JastipFlow
            </h1>
          </div>
          <button className="relative w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
            <Bell className="w-5 h-5 text-white" />
            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-400 rounded-full border-2 border-[#2563EB]" />
          </button>
        </div>

        {/* Trip Badge */}
        <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 border border-white/30">
          <MapPin className="w-3.5 h-3.5 text-white" />
          <span className="text-white text-sm font-semibold">Trip: SG Active</span>
          <span className="w-px h-3 bg-white/40" />
          <span className="text-white/90 text-sm">Rate: 11,500 IDR</span>
        </div>
      </div>

      <div className="px-4 -mt-4 space-y-5 pb-6">
        {/* Metric Cards Grid */}
        <div className="grid grid-cols-2 gap-3">
          {metrics.map((m, i) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className={`${m.bg} ${m.border} border rounded-2xl p-4 shadow-sm`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className={`${m.iconBg} w-9 h-9 rounded-xl flex items-center justify-center`}>
                  <m.icon className={`w-4.5 h-4.5 ${m.iconColor}`} />
                </div>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${m.badge}`}>
                  {m.trend}
                </span>
              </div>
              <div className={`text-xl font-bold ${m.valueColor} leading-tight`}>{m.value}</div>
              <div className="text-gray-500 text-xs mt-0.5">{m.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Quick Add CTA */}
        <motion.button
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          onClick={() => navigate("/live-catalog")}
          className="w-full bg-gradient-to-r from-[#2563EB] to-[#1d4ed8] text-white rounded-2xl py-4 px-5 flex items-center justify-center gap-3 shadow-lg shadow-blue-500/30 active:scale-98 transition-transform"
        >
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
            <Camera className="w-5 h-5 text-white" />
          </div>
          <div className="text-left">
            <div className="font-bold text-base">📸 Quick Add</div>
            <div className="text-blue-100 text-xs">Live Catalog — Snap & Price</div>
          </div>
          <ChevronRight className="w-5 h-5 text-white/70 ml-auto" />
        </motion.button>

        {/* Recent Activity */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-gray-800 font-semibold">Recent Activity</h3>
            <button className="text-[#2563EB] text-sm font-medium flex items-center gap-1">
              See all <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="space-y-2.5">
            {recentActivity.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.35 + i * 0.07 }}
                className="bg-white rounded-xl p-3.5 flex items-center gap-3 shadow-sm border border-gray-100"
              >
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    item.status === "ready"
                      ? "bg-blue-100"
                      : item.status === "paid"
                      ? "bg-green-100"
                      : "bg-amber-100"
                  }`}
                >
                  {item.status === "ready" ? (
                    <Package className="w-4 h-4 text-blue-600" />
                  ) : item.status === "paid" ? (
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                  ) : (
                    <Clock className="w-4 h-4 text-amber-600" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-800 truncate">{item.name}</div>
                  <div className="text-xs text-gray-500">
                    {item.customer} · {item.time}
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-sm font-semibold text-gray-800">{item.price}</div>
                  <span
                    className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                      item.status === "ready"
                        ? "bg-blue-100 text-blue-700"
                        : item.status === "paid"
                        ? "bg-green-100 text-green-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {item.status}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <h3 className="text-gray-800 font-semibold mb-3">Quick Actions</h3>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Add Wishlist", icon: ShoppingCart, color: "text-amber-600", bg: "bg-amber-50", path: "/wishlist" },
              { label: "View Reports", icon: TrendingUp, color: "text-green-600", bg: "bg-green-50", path: "/reports" },
              { label: "Trip Setup", icon: MapPin, color: "text-blue-600", bg: "bg-blue-50", path: "/settings" },
            ].map((action) => (
              <button
                key={action.label}
                onClick={() => navigate(action.path)}
                className={`${action.bg} rounded-xl p-3 flex flex-col items-center gap-2 border border-gray-100 active:scale-95 transition-transform`}
              >
                <action.icon className={`w-5 h-5 ${action.color}`} />
                <span className="text-xs text-gray-600 font-medium text-center leading-tight">{action.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
