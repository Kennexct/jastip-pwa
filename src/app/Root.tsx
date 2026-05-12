import { Outlet } from "react-router";
import { BottomNav } from "./components/BottomNav";

export function Root() {
  return (
    <div className="min-h-screen bg-[#F4F6FA] flex flex-col">
      <div className="flex-1 overflow-y-auto pb-20">
        <Outlet />
      </div>
      <BottomNav />
    </div>
  );
}
