// Canvas rendering utilities for product images and receipts

export type CanvasProductOptions = {
  photo: string;
  itemName: string;
  finalPriceIDR: number;
  country?: string;
  watermarkText?: string;
};

export type CanvasReceiptOptions = {
  receiptNumber: string;
  date: string;
  customerName: string;
  items: { name: string; qty: number; price: number }[];
  total: number;
  dpPaid: number;
  totalPaid: number;
  remaining: number;
};

const formatIDR = (val: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);

/**
 * Render a product image with watermark + price overlay.
 * Returns a data URL (JPEG).
 */
export async function renderProductCanvas(options: CanvasProductOptions): Promise<string> {
  const { photo, itemName, finalPriceIDR, country = '🇸🇬', watermarkText = 'JastipFlow' } = options;
  const SIZE = 1080;

  const canvas = document.createElement('canvas');
  canvas.width = SIZE;
  canvas.height = SIZE;
  const ctx = canvas.getContext('2d')!;

  // Load photo
  const img = await loadImage(photo);
  const imgSize = Math.min(img.width, img.height);
  const sx = (img.width - imgSize) / 2;
  const sy = (img.height - imgSize) / 2;
  ctx.drawImage(img, sx, sy, imgSize, imgSize, 0, 0, SIZE, SIZE);

  // Bottom gradient overlay
  const grad = ctx.createLinearGradient(0, SIZE * 0.55, 0, SIZE);
  grad.addColorStop(0, 'rgba(0,0,0,0)');
  grad.addColorStop(1, 'rgba(0,0,0,0.75)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, SIZE * 0.55, SIZE, SIZE * 0.45);

  // Watermark (top-right)
  ctx.save();
  ctx.globalAlpha = 0.75;
  const wmW = 220;
  const wmH = 50;
  const wmX = SIZE - wmW - 30;
  const wmY = 30;
  ctx.fillStyle = 'rgba(255,255,255,0.25)';
  roundRect(ctx, wmX, wmY, wmW, wmH, 16);
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.fillStyle = '#2563EB';
  roundRect(ctx, wmX + 12, wmY + 10, 30, 30, 8);
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 16px Inter, sans-serif';
  ctx.fillText('✦', wmX + 20, wmY + 31);
  ctx.font = 'bold 20px Inter, sans-serif';
  ctx.fillText(watermarkText, wmX + 52, wmY + 33);
  ctx.restore();

  // "In Stock" badge (top-left)
  ctx.save();
  ctx.fillStyle = '#22C55E';
  roundRect(ctx, 30, 30, 120, 36, 18);
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 14px Inter, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('IN STOCK', 90, 53);
  ctx.restore();

  // Product name (bottom-left)
  ctx.save();
  ctx.fillStyle = 'rgba(255,255,255,0.7)';
  ctx.font = '16px Inter, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(`Ready Stock ${country}`, 30, SIZE - 130);
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 26px Inter, sans-serif';
  const displayName = itemName.length > 30 ? itemName.slice(0, 30) + '…' : itemName;
  ctx.fillText(displayName, 30, SIZE - 95);
  ctx.restore();

  // Price ribbon (bottom-right)
  ctx.save();
  const prW = 260;
  const prH = 70;
  const prX = SIZE - prW - 30;
  const prY = SIZE - prH - 30;
  const prGrad = ctx.createLinearGradient(prX, prY, prX + prW, prY);
  prGrad.addColorStop(0, '#2563EB');
  prGrad.addColorStop(1, '#1d4ed8');
  ctx.fillStyle = prGrad;
  roundRect(ctx, prX, prY, prW, prH, 16);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.7)';
  ctx.font = '12px Inter, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('HARGA', prX + 20, prY + 25);
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 28px Inter, sans-serif';
  ctx.fillText(formatIDR(finalPriceIDR), prX + 20, prY + 55);
  ctx.restore();

  return canvas.toDataURL('image/jpeg', 0.9);
}

/**
 * Render a receipt as a canvas image.
 * Returns a data URL (PNG).
 */
export async function renderReceiptCanvas(options: CanvasReceiptOptions): Promise<string> {
  const { receiptNumber, date, customerName, items, total, dpPaid, totalPaid, remaining } = options;
  const W = 600;
  const lineH = 32;
  const headerH = 200;
  const itemsH = items.length * lineH + 40;
  const summaryH = 200;
  const footerH = 80;
  const H = headerH + itemsH + summaryH + footerH;

  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d')!;

  // Background
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, W, H);

  // Header
  ctx.fillStyle = '#2563EB';
  ctx.fillRect(0, 0, W, 100);
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 28px Inter, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('🛍️ JastipFlow', W / 2, 45);
  ctx.font = '18px Inter, sans-serif';
  ctx.fillText('RECEIPT', W / 2, 75);

  // Receipt info
  let y = 130;
  ctx.fillStyle = '#6B7280';
  ctx.font = '14px Inter, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(receiptNumber, 40, y);
  ctx.textAlign = 'right';
  ctx.fillText(date, W - 40, y);
  y += 30;
  ctx.textAlign = 'left';
  ctx.fillStyle = '#111827';
  ctx.font = 'bold 18px Inter, sans-serif';
  ctx.fillText(`Customer: ${customerName}`, 40, y);

  // Divider
  y += 25;
  ctx.strokeStyle = '#E5E7EB';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(40, y);
  ctx.lineTo(W - 40, y);
  ctx.stroke();

  // Items
  y += 30;
  for (const item of items) {
    ctx.fillStyle = '#374151';
    ctx.font = '15px Inter, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`${item.name}  ×${item.qty}`, 40, y);
    ctx.textAlign = 'right';
    ctx.fillText(formatIDR(item.price * item.qty), W - 40, y);
    y += lineH;
  }

  // Divider
  y += 10;
  ctx.strokeStyle = '#E5E7EB';
  ctx.beginPath();
  ctx.moveTo(40, y);
  ctx.lineTo(W - 40, y);
  ctx.stroke();

  // Summary
  y += 30;
  const summaryRows = [
    { label: 'Total', value: formatIDR(total), bold: false, color: '#374151' },
    { label: 'DP Paid', value: formatIDR(dpPaid), bold: false, color: '#22C55E' },
    { label: 'Total Paid', value: formatIDR(totalPaid), bold: false, color: '#22C55E' },
    { label: 'Remaining', value: remaining <= 0 ? '✓ LUNAS' : formatIDR(remaining), bold: true, color: remaining <= 0 ? '#22C55E' : '#EF4444' },
  ];
  for (const row of summaryRows) {
    ctx.textAlign = 'left';
    ctx.fillStyle = '#6B7280';
    ctx.font = `${row.bold ? 'bold ' : ''}15px Inter, sans-serif`;
    ctx.fillText(row.label, 40, y);
    ctx.textAlign = 'right';
    ctx.fillStyle = row.color;
    ctx.font = `${row.bold ? 'bold 18px' : '15px'} Inter, sans-serif`;
    ctx.fillText(row.value, W - 40, y);
    y += lineH;
  }

  // Footer
  y += 20;
  ctx.textAlign = 'center';
  ctx.fillStyle = '#9CA3AF';
  ctx.font = '12px Inter, sans-serif';
  ctx.fillText('Thank you for your order! 🙏', W / 2, y);

  return canvas.toDataURL('image/png');
}

// ==================== HELPERS ====================

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}
