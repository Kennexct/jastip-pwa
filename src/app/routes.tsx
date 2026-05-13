import { createBrowserRouter } from "react-router";
import { Root } from "./Root";
import { Dashboard } from "./pages/Dashboard";
import { Settings } from "./pages/Settings";
import { Wishlist } from "./pages/Wishlist";
import { LiveCatalog } from "./pages/LiveCatalog";
import { CatalogList } from "./pages/CatalogList";
import { Fulfillment } from "./pages/Fulfillment";
import { Reports } from "./pages/Reports";
import { WishlistCapture } from "./pages/WishlistCapture";
import { WishlistFulfill } from "./pages/WishlistFulfill";
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
          { path: "catalog", Component: CatalogList },
          { path: "fulfillment", Component: Fulfillment },
          { path: "reports", Component: Reports },
        ],
      },
      // Full-screen pages (no bottom nav)
      { path: "wishlist/capture/:id", Component: WishlistCapture },
      { path: "wishlist/fulfill/:id", Component: WishlistFulfill },
    ],
  },
  { path: "/login", Component: Login },
  { path: "/register", Component: Register },
]);
