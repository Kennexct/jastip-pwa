import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router";
import {
  ChevronLeft, MessageCircle, TrendingUp, Search, ChevronDown, ChevronUp,
  CheckCircle2, AlertCircle, Clock, Package, BarChart2, ArrowUpRight,
  Loader2, Heart, FileText, CreditCard,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { getSales, getPaymentsBySale, type Sale, type Payment } from "../../lib/database";
import { PaymentModal } from "../components/PaymentModal";
import { ReceiptView } from "../components/ReceiptView";

function formatIDR(val: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(val);
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

// Group sales by customer
type CustomerGroup = {
  name: string;
  sales: Sale[];
  totalPrice: number;
  totalPaid: number;
  remaining: number;
  status: "paid" | "partial" | "unpaid";
};

function groupByCustomer(sales: Sale[]): CustomerGroup[] {
  const map = new Map<string, Sale[]>();
  sales.forEach(s => {
    const existing = map.get(s.customer_name) || [];
    existing.push(s);
    map.set(s.customer_name, existing);
  });
  return Array.from(map.entries()).map(([name, sales]) => {
    const totalPrice = sales.reduce((sum, s) => sum + Number(s.final_price_idr) * s.qty, 0);
    const totalPaid = sales.reduce((sum, s) => sum + Number(s.total_paid), 0);
    const remaining = sales.reduce((sum, s) => sum + Number(s.remaining), 0);
    let status: "paid" | "partial" | "unpaid" = "unpaid";
    if (remaining <= 0) status = "paid";
    else if (totalPaid > 0) status = "partial";
    return { name, sales, totalPrice, totalPaid, remaining, status };
  });
}

function CustomerCard({ customer, onPayment, onReceipt }: {
  customer: CustomerGroup;
  onPayment: (sale: Sale) => void;
  onReceipt: (customer: CustomerGroup) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  const statusConfig = {
    paid: { label: "Lunas", bg: "bg-green-50", text: "text-green-600", icon: CheckCircle2, border: "border-green-100" },
    partial: { label: "Sebagian", bg: "bg-amber-50", text: "text-amber-600", icon: Clock, border: "border-amber-100" },
    unpaid: { label: "Belum Bayar", bg: "bg-red-50", text: "text-red-600", icon: AlertCircle, border: "border-red-100" },
  };

  const sc = statusConfig[customer.status];
  const StatusIcon = sc.icon;
  const initials = customer.name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);

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
            {customer.sales.length} item · {customer.status === "paid"
              ? <span className="text-green-600 font-medium">Lunas</span>
              : <span className="text-red-500 font-medium">Sisa {formatIDR(customer.remaining)}</span>}
          </div>
        </div>
        {expanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}>
            <div className="px-4 pb-4 border-t border-gray-50">
              <div className="py-3 space-y-2">
                {customer.sales.map((sale) => (
                  <div key={sale.id} className="flex items-start gap-2">
                    <Package className="w-3.5 h-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <span className="text-sm text-gray-700">{sale.item_name}</span>
                      <span className="text-xs text-gray-400 ml-1.5">×{sale.qty}</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-800 flex-shrink-0">
                      {formatIDR(Number(sale.final_price_idr) * sale.qty)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Summary */}
              <div className="bg-[#F4F6FA] rounded-xl p-3 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Total</span>
                  <span className="font-semibold text-gray-800">{formatIDR(customer.totalPrice)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Paid</span>
                  <span className="font-semibold text-green-600">{formatIDR(customer.totalPaid)}</span>
                </div>
                <div className="h-px bg-gray-200" />
                <div className="flex justify-between">
                  <span className="text-sm font-semibold text-gray-700">Remaining</span>
                  <span className={`font-bold ${customer.remaining <= 0 ? "text-green-600" : "text-red-500"}`}>
                    {customer.remaining <= 0 ? "✓ Lunas" : formatIDR(customer.remaining)}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 mt-3">
                {customer.status !== "paid" && (
                  <button onClick={() => {
                    const unpaidSale = customer.sales.find(s => Number(s.remaining) > 0);
                    if (unpaidSale) onPayment(unpaidSale);
                  }}
                    className="flex-1 h-[44px] bg-[#2563EB] text-white rounded-xl font-semibold flex items-center justify-center gap-2 text-sm active:scale-[0.98] transition-transform">
                    <CreditCard className="w-4 h-4" /> Record Payment
                  </button>
                )}
                <button onClick={() => onReceipt(customer)}
                  className={`${customer.status === "paid" ? "flex-1" : ""} h-[44px] px-4 bg-white border border-gray-200 text-gray-600 rounded-xl font-semibold flex items-center justify-center gap-2 text-sm active:scale-[0.98] transition-transform`}>
                  <FileText className="w-4 h-4" /> Receipt
                </button>
              </div>

              {/* WhatsApp */}
              {customer.status !== "paid" && (
                <button onClick={() => {
                  const itemList = customer.sales.map(s => `• ${s.item_name} ×${s.qty} = ${formatIDR(Number(s.final_price_idr) * s.qty)}`).join("\n");
                  const msg = encodeURIComponent(
                    `Halo ${customer.name}! 👋\n\nBerikut tagihan order kamu:\n\n${itemList}\n\n*Total: ${formatIDR(customer.totalPrice)}*\nDibayar: ${formatIDR(customer.totalPaid)}\n*Sisa: ${formatIDR(customer.remaining)}*\n\nMohon segera dilunasi ya! 🙏`
                  );
                  window.open(`https://wa.me/?text=${msg}`, "_blank");
                }}
                  className="mt-2 w-full h-[44px] bg-[#25D366] text-white rounded-xl font-semibold flex items-center justify-center gap-2 text-sm active:scale-[0.98] transition-transform">
                  <MessageCircle className="w-4 h-4" /> Share Bill via WhatsApp
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
  const [customers, setCustomers] = useState<CustomerGroup[]>([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalOutstanding, setTotalOutstanding] = useState(0);
  const [totalProfit, setTotalProfit] = useState(0);
  const [totalCollected, setTotalCollected] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  // Payment modal
  const [paymentSale, setPaymentSale] = useState<Sale | null>(null);

  // Receipt view
  const [receiptCustomer, setReceiptCustomer] = useState<CustomerGroup | null>(null);
  const [receiptPayments, setReceiptPayments] = useState<Payment[]>([]);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const sales = await getSales();
      const grouped = groupByCustomer(sales);
      setCustomers(grouped);
      const revenue = sales.reduce((sum, s) => sum + Number(s.final_price_idr) * s.qty, 0);
      const outstanding = grouped.filter(c => c.status !== "paid").reduce((sum, c) => sum + c.remaining, 0);
      const collected = sales.reduce((sum, s) => sum + Number(s.total_paid), 0);
      const profit = sales.reduce((sum, s) => {
        const baseIDR = Number(s.base_price) * Number(s.exchange_rate);
        return sum + (Number(s.final_price_idr) - baseIDR) * s.qty;
      }, 0);
      setTotalRevenue(revenue);
      setTotalOutstanding(outstanding);
      setTotalCollected(collected);
      setTotalProfit(profit);
    } catch (err) {
      console.error("Failed to load reports:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenReceipt = async (customer: CustomerGroup) => {
    try {
      const allPayments: Payment[] = [];
      for (const sale of customer.sales) {
        const payments = await getPaymentsBySale(sale.id);
        allPayments.push(...payments);
      }
      setReceiptPayments(allPayments);
      setReceiptCustomer(customer);
    } catch (err) {
      console.error("Failed to load payments:", err);
    }
  };

  let filteredCustomers = customers;
  if (filterBills === "unpaid") filteredCustomers = filteredCustomers.filter(c => c.status !== "paid");
  if (searchQuery) filteredCustomers = filteredCustomers.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="min-h-screen bg-[#F4F6FA] pb-24">
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
            <button key={tab.key} onClick={() => setActiveTab(tab.key as "bills" | "profit")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                activeTab === tab.key ? "bg-[#2563EB] text-white" : "text-gray-400"
              }`}>
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
              {(["all", "unpaid"] as const).map(f => (
                <button key={f} onClick={() => setSearchParams({ filter: f })}
                  className={`whitespace-nowrap px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                    filterBills === f ? "bg-[#2563EB] text-white shadow-md shadow-blue-500/20"
                      : "bg-white text-gray-500 border border-gray-100 hover:bg-gray-50"
                  }`}>
                  {f === "all" ? "Semua Tagihan" : "Belum Lunas"}
                </button>
              ))}
            </div>

            <div className="bg-white rounded-xl border border-gray-100 flex items-center gap-2 px-3.5 h-11 mb-4">
              <Search className="w-4 h-4 text-gray-400" />
              <input placeholder="Search customer..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent text-gray-700 text-sm flex-1 outline-none" />
            </div>

            {filteredCustomers.length === 0 && (
              <div className="flex flex-col items-center py-16 text-center">
                <Heart className="w-8 h-8 text-gray-200 mb-3" />
                <p className="text-gray-400 text-sm">Belum ada data tagihan</p>
                <p className="text-gray-300 text-xs mt-1">Fulfill wishlist items to see bills here</p>
              </div>
            )}

            <div className="space-y-3">
              {filteredCustomers.map((customer, i) => (
                <motion.div key={customer.name} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <CustomerCard
                    customer={customer}
                    onPayment={(sale) => setPaymentSale(sale)}
                    onReceipt={(c) => handleOpenReceipt(c)}
                  />
                </motion.div>
              ))}
            </div>
          </>
        )}

        {activeTab === "profit" && !loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
            {[
              { label: "Total Revenue", value: formatIDR(totalRevenue), icon: TrendingUp, color: "text-green-600", bg: "bg-green-50" },
              { label: "Est. Profit (Margin)", value: formatIDR(totalProfit), icon: ArrowUpRight, color: "text-blue-600", bg: "bg-blue-50" },
              { label: "Outstanding", value: formatIDR(totalOutstanding), icon: AlertCircle, color: "text-red-500", bg: "bg-red-50" },
              { label: "Collected", value: formatIDR(totalCollected), icon: CheckCircle2, color: "text-green-600", bg: "bg-green-50" },
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

      {/* Payment Modal */}
      {paymentSale && (
        <PaymentModal sale={paymentSale} onClose={() => setPaymentSale(null)} onSuccess={loadData} />
      )}

      {/* Receipt View */}
      <AnimatePresence>
        {receiptCustomer && (
          <ReceiptView
            sales={receiptCustomer.sales}
            payments={receiptPayments}
            customerName={receiptCustomer.name}
            onClose={() => setReceiptCustomer(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
