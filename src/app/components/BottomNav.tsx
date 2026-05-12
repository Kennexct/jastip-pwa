import { useNavigate, useLocation } from "react-router";
import { Home, Heart, Plus, BarChart2, Settings } from "lucide-react";

const navItems = [
  { icon: Home, label: "Home", path: "/" },
  { icon: Heart, label: "Wishlist", path: "/wishlist" },
  { icon: Plus, label: "Add", path: "/live-catalog", center: true },
  { icon: BarChart2, label: "Reports", path: "/reports" },
  { icon: Settings, label: "Settings", path: "/settings" },
];

export function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg max-w-md mx-auto md:max-w-full">
      <div className="flex items-center justify-around px-2 py-2 max-w-lg mx-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          if (item.center) {
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className="flex flex-col items-center justify-center -mt-5"
              >
                <div className="w-14 h-14 rounded-full bg-[#2563EB] flex items-center justify-center shadow-lg shadow-blue-500/40 active:scale-95 transition-transform">
                  <item.icon className="w-6 h-6 text-white" strokeWidth={2.5} />
                </div>
                <span className="text-[10px] text-[#2563EB] mt-1 font-semibold">Add</span>
              </button>
            );
          }
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className="flex flex-col items-center justify-center min-w-[44px] min-h-[44px] px-2 gap-0.5"
            >
              <item.icon
                className={`w-5 h-5 ${isActive ? "text-[#2563EB]" : "text-gray-400"}`}
                strokeWidth={isActive ? 2.5 : 2}
              />
              <span
                className={`text-[10px] font-medium ${
                  isActive ? "text-[#2563EB]" : "text-gray-400"
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
      <div className="h-safe-area-bottom bg-white" />
    </div>
  );
}
