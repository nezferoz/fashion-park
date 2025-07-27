// utils/cart.js
import api from './api';

export async function getCart() {
  const res = await api.get('/cart');
  return res.data;
}

export async function addToCart(product_id, variant_id, quantity) {
  await api.post('/cart', { product_id, variant_id, quantity });
}

export async function updateCartQty(product_id, variant_id, quantity) {
  await api.post('/cart', { product_id, variant_id, quantity });
}

export async function removeFromCart(product_id, variant_id) {
  await api.delete('/cart/item', { data: { product_id, variant_id } });
}

export async function clearCart() {
  await api.delete('/cart/clear');
}

export async function getCartCount() {
  const cart = await getCart();
  return cart.reduce((sum, item) => sum + item.quantity, 0);
} 