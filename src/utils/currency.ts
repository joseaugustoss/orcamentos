export function calcSubtotal(items: { qty: number; price: number }[]): number {
  return items.reduce((acc, item) => acc + item.qty * item.price, 0);
}

export function calcDiscount(subtotal: number, pct?: number): number {
  if (!pct) return 0;
  return subtotal * (pct / 100);
}

export function calcTotal(subtotal: number, discountValue: number): number {
  return subtotal - discountValue;
}

export function formatCurrency(value: number): string {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}
