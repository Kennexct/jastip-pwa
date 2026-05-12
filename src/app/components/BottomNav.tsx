import { useNavigate, useLocation } from "react-router";
import { Home, Heart, BarChart2, Settings } from "lucide-react";
import { motion } from "motion/react";

const navItems = [
  { icon: Home, label: "Home", path: "/" },
  { icon: Heart, label: "Wishlist", path: "/wishlist" },
  { icon: BarChart2, label: "Reports", path: "/reports" },
  { icon: Settings, label: "Settings", path: "/settings" },
];

export function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-t border-gray-100 max-w-md mx-auto md:max-w-full">
      <div className="flex items-center justify-around px-4 py-2 max-w-lg mx-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className="relative flex flex-col items-center justify-center min-w-[56px] min-h-[48px] px-3 gap-1 transition-all"
            >
              {/* Active indicator line */}
              {isActive && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute -top-0.5 w-6 h-[3px] bg-[#2563EB] rounded-full"
                  transition={{ type: "spring", stiffness: 500, damping: 35 }}
                />
              )}
              <item.icon
                className={`w-[22px] h-[22px] transition-colors ${
                  isActive ? "text-[#2563EB]" : "text-gray-400"
                }`}
                strokeWidth={isActive ? 2.5 : 1.8}
              />
              <span
                className={`text-[10px] transition-colors ${
                  isActive
                    ? "text-[#2563EB] font-semibold"
                    : "text-gray-400 font-medium"
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
      <div className="h-safe-area-bottom bg-white/80" />
    </div>
  );
}
