import { supabase } from './supabase';

// ==================== TYPES ====================

export type WishlistItem = {
  id: string;
  user_id: string;
  customer_name: string;
  item_name: string;
  qty: number;
  est_price: number;
  dp_amount: number;
  dp_status: 'pending' | 'partial' | 'paid';
  status: 'pending' | 'hunting' | 'fulfilled' | 'cancelled';
  phone: string | null;
  image_url: string | null;
  fulfilled_at: string | null;
  created_at: string;
};

export type CatalogItem = {
  id: string;
  user_id: string;
  item_name: string;
  base_price: number;
  currency: string;
  exchange_rate: number;
  margin_type: 'percent' | 'nominal';
  margin_value: number;
  final_price_idr: number;
  qty?: number;
  photo_url?: string | null;
  created_at: string;
};

export type Sale = {
  id: string;
  user_id: string;
  wishlist_item_id: string | null;
  customer_name: string;
  item_name: string;
  qty: number;
  base_price: number;
  currency: string;
  exchange_rate: number;
  margin_type: 'percent' | 'nominal';
  margin_value: number;
  final_price_idr: number;
  dp_amount: number;
  total_paid: number;
  remaining: number;
  photo_url: string | null;
  canvas_image_url: string | null;
  status: 'pending_dp' | 'dp_paid' | 'fulfilled' | 'completed';
  fulfilled_at: string | null;
  created_at: string;
};

export type Payment = {
  id: string;
  sale_id: string;
  user_id: string;
  amount: number;
  payment_method: 'transfer' | 'cash' | 'ewallet';
  note: string | null;
  created_at: string;
};

// ==================== WISHLIST ====================

export async function getWishlistItems() {
  const { data, error } = await supabase
    .from('wishlist_items')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data as WishlistItem[];
}

export async function addWishlistItem(item: Omit<WishlistItem, 'id' | 'created_at' | 'fulfilled_at'>) {
  const { data, error } = await supabase
    .from('wishlist_items')
    .insert(item)
    .select()
    .single();
  if (error) throw error;
  return data as WishlistItem;
}

export async function deleteWishlistItem(id: string) {
  const { error } = await supabase
    .from('wishlist_items')
    .delete()
    .eq('id', id);
  if (error) throw error;
}

export async function updateWishlistDp(id: string, dpAmount: number, dpStatus: string) {
  const { error } = await supabase
    .from('wishlist_items')
    .update({ dp_amount: dpAmount, dp_status: dpStatus })
    .eq('id', id);
  if (error) throw error;
}

export async function updateWishlistPrice(id: string, actualPrice: number) {
  const { error } = await supabase
    .from('wishlist_items')
    .update({ est_price: actualPrice })
    .eq('id', id);
  if (error) throw error;
}

export async function updateWishlistStatus(id: string, status: WishlistItem['status']) {
  const updates: Record<string, unknown> = { status };
  if (status === 'fulfilled') {
    updates.fulfilled_at = new Date().toISOString();
  }
  const { error } = await supabase
    .from('wishlist_items')
    .update(updates)
    .eq('id', id);
  if (error) throw error;
}

// ==================== CATALOG ====================

export async function getCatalogItems() {
  const { data, error } = await supabase
    .from('catalog_items')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data as CatalogItem[];
}

export async function addCatalogItem(item: Omit<CatalogItem, 'id' | 'created_at'>) {
  const { data, error } = await supabase
    .from('catalog_items')
    .insert(item)
    .select()
    .single();
  if (error) throw error;
  return data as CatalogItem;
}

export async function deleteCatalogItem(id: string) {
  const { error } = await supabase
    .from('catalog_items')
    .delete()
    .eq('id', id);
  if (error) throw error;
}

// ==================== SALES ====================

export async function getSales() {
  const { data, error } = await supabase
    .from('sales')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data as Sale[];
}

export async function getSalesByCustomer(customerName: string) {
  const { data, error } = await supabase
    .from('sales')
    .select('*')
    .eq('customer_name', customerName)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data as Sale[];
}

export async function addSale(sale: Omit<Sale, 'id' | 'created_at'>) {
  const { data, error } = await supabase
    .from('sales')
    .insert(sale)
    .select()
    .single();
  if (error) throw error;
  return data as Sale;
}

export async function updateSalePayment(id: string, totalPaid: number, remaining: number) {
  const status = remaining <= 0 ? 'completed' : 'dp_paid';
  const { error } = await supabase
    .from('sales')
    .update({ total_paid: totalPaid, remaining, status })
    .eq('id', id);
  if (error) throw error;
}

export async function updateSaleStatus(id: string, status: Sale['status']) {
  const updates: Record<string, unknown> = { status };
  if (status === 'fulfilled') {
    updates.fulfilled_at = new Date().toISOString();
  }
  const { error } = await supabase
    .from('sales')
    .update(updates)
    .eq('id', id);
  if (error) throw error;
}

// ==================== PAYMENTS ====================

export async function getPaymentsBySale(saleId: string) {
  const { data, error } = await supabase
    .from('payments')
    .select('*')
    .eq('sale_id', saleId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data as Payment[];
}

export async function getAllPayments() {
  const { data, error } = await supabase
    .from('payments')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data as Payment[];
}

export async function addPayment(payment: Omit<Payment, 'id' | 'created_at'>) {
  // 1. Insert payment record
  const { data, error } = await supabase
    .from('payments')
    .insert(payment)
    .select()
    .single();
  if (error) throw error;

  // 2. Get the sale to recalculate totals
  const { data: sale, error: saleErr } = await supabase
    .from('sales')
    .select('*')
    .eq('id', payment.sale_id)
    .single();
  if (saleErr) throw saleErr;

  // 3. Get all payments for this sale to sum up
  const { data: allPayments, error: payErr } = await supabase
    .from('payments')
    .select('amount')
    .eq('sale_id', payment.sale_id);
  if (payErr) throw payErr;

  const totalPaid = (allPayments || []).reduce((sum, p) => sum + Number(p.amount), 0);
  const totalBill = Number(sale.final_price_idr) * Number(sale.qty);
  const remaining = Math.max(0, totalBill - totalPaid);

  // 4. Update sale totals and status
  await updateSalePayment(payment.sale_id, totalPaid, remaining);

  return data as Payment;
}

// ==================== DASHBOARD STATS ====================

export async function getDashboardStats() {
  const [wishlistRes, catalogRes, salesRes] = await Promise.all([
    supabase.from('wishlist_items').select('*'),
    supabase.from('catalog_items').select('*'),
    supabase.from('sales').select('*'),
  ]);

  const wishlist = (wishlistRes.data || []) as WishlistItem[];
  const catalog = (catalogRes.data || []) as CatalogItem[];
  const sales = (salesRes.data || []) as Sale[];

  const pendingWishlist = wishlist.filter(w => w.status === 'pending' || w.status === 'hunting').length;
  const completedWishlist = wishlist.filter(w => w.status === 'fulfilled').length;
  const readyStock = catalog.length;

  // Calculate profit from sales
  const totalProfit = sales.reduce((sum, s) => {
    const baseIDR = Number(s.base_price) * Number(s.exchange_rate);
    return sum + (Number(s.final_price_idr) - baseIDR) * Number(s.qty);
  }, 0);

  // Outstanding = total remaining across all unpaid sales
  const unpaidBills = sales
    .filter(s => s.status !== 'completed')
    .reduce((sum, s) => sum + Number(s.remaining), 0);

  // Recent activity: combine latest from wishlist and sales
  const recentWishlist = wishlist.slice(0, 3).map(w => ({
    id: w.id,
    name: w.item_name,
    customer: w.customer_name,
    price: w.est_price,
    time: getRelativeTime(w.created_at),
    status: w.dp_status === 'paid' ? 'paid' as const : w.dp_status === 'partial' ? 'ready' as const : 'pending' as const,
  }));

  return {
    pendingWishlist,
    completedWishlist,
    readyStock,
    totalProfit,
    unpaidBills,
    recentActivity: recentWishlist,
  };
}

function getRelativeTime(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}
