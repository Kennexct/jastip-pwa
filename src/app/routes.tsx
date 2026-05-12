import { createBrowserRouter } from "react-router";
import { Root } from "./Root";
import { Dashboard } from "./pages/Dashboard";
import { Settings } from "./pages/Settings";
import { Wishlist } from "./pages/Wishlist";
import { LiveCatalog } from "./pages/LiveCatalog";
import { Fulfillment } from "./pages/Fulfillment";
import { Reports } from "./pages/Reports";
import { Login } from "./pages/Auth/Login";
import { Register } from "./pages/Auth/Register";
import { ProtectedRoute } from "./components/ProtectedRoute";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: ProtectedRoute,
    children: [
      {
        path: "/",
        Component: Root,
        children: [
          { index: true, Component: Dashboard },
          { path: "settings", Component: Settings },
          { path: "wishlist", Component: Wishlist },
          { path: "live-catalog", Component: LiveCatalog },
          { path: "fulfillment", Component: Fulfillment },
          { path: "reports", Component: Reports },
        ],
      }
    ],
  },
  { path: "/login", Component: Login },
  { path: "/register", Component: Register },
]);
