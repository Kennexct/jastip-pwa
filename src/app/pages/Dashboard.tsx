import { useNavigate } from "react-router";
import { useState, useEffect } from "react";
import {
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
  Loader2,
  Heart,
} from "lucide-react";
import { motion } from "motion/react";
import { getDashboardStats } from "../../lib/database";

function formatIDR(val: number) {
  if (val >= 1000000) return `Rp ${(val / 1000000).toFixed(1)}M`;
  if (val >= 1000) return `Rp ${(val / 1000).toFixed(0)}K`;
  return `Rp ${val}`;
}

function formatIDRFull(val: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(val);
}

export function Dashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    pendingWishlist: 0,
    readyStock: 0,
    totalProfit: 0,
    unpaidBills: 0,
    recentActivity: [] as { id: string; name: string; customer: string; price: number; time: string; status: "ready" | "pending" | "paid" }[],
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const data = await getDashboardStats();
      setStats(data);
    } catch (err) {
      console.error("Failed to load stats:", err);
    } finally {
      setLoading(false);
    }
  };

  const metrics = [
    { id: 1, label: "Pending Wishlist", value: stats.pendingWishlist.toString(), icon: Clock, iconBg: "bg-amber-50", iconColor: "text-amber-500" },
    { id: 2, label: "Ready Stock", value: stats.readyStock.toString(), icon: Package, iconBg: "bg-blue-50", iconColor: "text-blue-500" },
    { id: 3, label: "Est. Profit", value: formatIDR(stats.totalProfit), icon: TrendingUp, iconBg: "bg-green-50", iconColor: "text-green-500" },
    { id: 4, label: "Unpaid Bills", value: formatIDR(stats.unpaidBills), icon: AlertCircle, iconBg: "bg-red-50", iconColor: "text-red-500" },
  ];

  return (
    <div className="min-h-screen bg-[#F4F6FA]">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#2563EB] to-[#1d4ed8] px-5 pt-14 pb-7">
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="text-blue-200 text-sm">Good morning,</p>
            <h1 className="text-white text-[26px] font-bold leading-tight">Dewi 👋</h1>
          </div>
          <button className="relative w-10 h-10 rounded-full bg-white/15 flex items-center justify-center backdrop-blur-sm">
            <Bell className="w-5 h-5 text-white" />
          </button>
        </div>
        <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-xl px-4 py-2.5">
          <MapPin className="w-3.5 h-3.5 text-blue-200" />
          <span className="text-white text-sm font-medium">🇸🇬 Singapore</span>
          <span className="w-px h-3.5 bg-white/30" />
          <span className="text-blue-200 text-sm">Rate: 11,500</span>
        </div>
      </div>

      <div className="px-5 -mt-3 space-y-5 pb-8">
        {/* Metric Cards */}
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {metrics.map((m, i) => (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="bg-white rounded-2xl p-4 border border-gray-100"
              >
                <div className={`${m.iconBg} w-10 h-10 rounded-xl flex items-center justify-center mb-3`}>
                  <m.icon className={`w-5 h-5 ${m.iconColor}`} />
                </div>
                <div className="text-2xl font-bold text-gray-900 leading-none">{m.value}</div>
                <div className="text-gray-400 text-xs mt-1.5">{m.label}</div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Quick Add CTA */}
        <motion.button
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          onClick={() => navigate("/live-catalog")}
          className="w-full bg-white rounded-2xl p-4 flex items-center gap-4 border border-gray-100 active:scale-[0.98] transition-transform"
        >
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#2563EB] to-[#1d4ed8] flex items-center justify-center shadow-md shadow-blue-500/20">
            <Camera className="w-6 h-6 text-white" />
          </div>
          <div className="text-left flex-1">
            <div className="font-bold text-gray-900 text-[15px]">Quick Add</div>
            <div className="text-gray-400 text-xs">Live Catalog — Snap & Price</div>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-300" />
        </motion.button>

        {/* Recent Activity */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-gray-900 font-semibold text-[15px]">Recent Activity</h3>
            <button onClick={() => navigate("/wishlist")} className="text-[#2563EB] text-sm font-medium flex items-center gap-1">
              See all <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {!loading && stats.recentActivity.length === 0 && (
            <div className="bg-white rounded-xl p-8 border border-gray-100 text-center">
              <Heart className="w-8 h-8 text-gray-200 mx-auto mb-2" />
              <p className="text-gray-400 text-sm">Belum ada aktivitas</p>
            </div>
          )}

          <div className="space-y-2">
            {stats.recentActivity.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.06 }}
                className="bg-white rounded-xl p-3.5 flex items-center gap-3 border border-gray-100"
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${item.status === "ready" ? "bg-blue-50" : item.status === "paid" ? "bg-green-50" : "bg-amber-50"}`}>
                  {item.status === "ready" ? <Package className="w-[18px] h-[18px] text-blue-500" /> : item.status === "paid" ? <CheckCircle2 className="w-[18px] h-[18px] text-green-500" /> : <Clock className="w-[18px] h-[18px] text-amber-500" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-800 truncate">{item.name}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{item.customer} · {item.time}</div>
                </div>
                <div className="text-sm font-semibold text-gray-800 flex-shrink-0">{formatIDRFull(item.price)}</div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <h3 className="text-gray-900 font-semibold text-[15px] mb-3">Quick Actions</h3>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Add Wishlist", icon: Heart, color: "text-amber-500", bg: "bg-amber-50", path: "/wishlist" },
              { label: "View Reports", icon: TrendingUp, color: "text-green-500", bg: "bg-green-50", path: "/reports" },
              { label: "Trip Setup", icon: MapPin, color: "text-blue-500", bg: "bg-blue-50", path: "/settings" },
            ].map((action) => (
              <button key={action.label} onClick={() => navigate(action.path)} className="bg-white rounded-xl p-4 flex flex-col items-center gap-2.5 border border-gray-100 active:scale-95 transition-transform">
                <div className={`${action.bg} w-10 h-10 rounded-xl flex items-center justify-center`}>
                  <action.icon className={`w-5 h-5 ${action.color}`} />
                </div>
                <span className="text-xs text-gray-600 font-medium text-center leading-tight">{action.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
