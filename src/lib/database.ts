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
  image_url: string | null;
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

export async function addWishlistItem(item: Omit<WishlistItem, 'id' | 'created_at'>) {
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

// ==================== DASHBOARD STATS ====================

export async function getDashboardStats() {
  const [wishlistRes, catalogRes] = await Promise.all([
    supabase.from('wishlist_items').select('*'),
    supabase.from('catalog_items').select('*'),
  ]);

  const wishlist = (wishlistRes.data || []) as WishlistItem[];
  const catalog = (catalogRes.data || []) as CatalogItem[];

  const pendingWishlist = wishlist.filter(w => w.dp_status === 'pending').length;
  const readyStock = catalog.length;
  const totalProfit = catalog.reduce((sum, c) => {
    const baseIDR = c.base_price * c.exchange_rate;
    return sum + (c.final_price_idr - baseIDR);
  }, 0);
  const unpaidBills = wishlist
    .filter(w => w.dp_status !== 'paid')
    .reduce((sum, w) => sum + Math.max(0, w.est_price - w.dp_amount), 0);

  // Recent activity: combine latest from both tables
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
