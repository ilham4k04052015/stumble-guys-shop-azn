// Utilities
const azn = new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'AZN', maximumFractionDigits: 2 });

/** @typedef {{id:string,title:string,description:string,price:number,image:string,images:string[],tag?:string}} Product */

/** @type {Product[]} */
const PRODUCTS = [
  { id: 'gems-80', title: '80 Гемов', description: 'Малый набор гемов', price: 1.99, image: 'https://raw.githubusercontent.com/one-aalam/assets-cdn/main/stumble-guys/packs/gems-80.jpg', images: [
    'https://raw.githubusercontent.com/one-aalam/assets-cdn/main/stumble-guys/packs/gems-80.jpg',
    'https://raw.githubusercontent.com/one-aalam/assets-cdn/main/stumble-guys/packs/gems-80-2.jpg'
  ], tag: 'Хит' },
  { id: 'gems-250', title: '250 Гемов', description: 'Старт для апгрейда', price: 4.99, image: 'https://raw.githubusercontent.com/one-aalam/assets-cdn/main/stumble-guys/packs/gems-250.jpg', images: [
    'https://raw.githubusercontent.com/one-aalam/assets-cdn/main/stumble-guys/packs/gems-250.jpg'
  ] },
  { id: 'gems-800', title: '800 Гемов', description: 'Выгодный набор', price: 12.99, image: 'https://raw.githubusercontent.com/one-aalam/assets-cdn/main/stumble-guys/packs/gems-800.jpg', images: [
    'https://raw.githubusercontent.com/one-aalam/assets-cdn/main/stumble-guys/packs/gems-800.jpg',
    'https://raw.githubusercontent.com/one-aalam/assets-cdn/main/stumble-guys/packs/gems-800-2.jpg'
  ], tag: 'Выгода' },
  { id: 'gems-1700', title: '1700 Гемов', description: 'Максимальная экономия', price: 24.99, image: 'https://raw.githubusercontent.com/one-aalam/assets-cdn/main/stumble-guys/packs/gems-1700.jpg', images: [
    'https://raw.githubusercontent.com/one-aalam/assets-cdn/main/stumble-guys/packs/gems-1700.jpg'
  ] },
  { id: 'skin-rare', title: 'Редкий скин', description: 'Открой новый стиль', price: 3.49, image: 'https://raw.githubusercontent.com/one-aalam/assets-cdn/main/stumble-guys/skins/rare.jpg', images: [
    'https://raw.githubusercontent.com/one-aalam/assets-cdn/main/stumble-guys/skins/rare.jpg',
    'https://raw.githubusercontent.com/one-aalam/assets-cdn/main/stumble-guys/skins/rare-2.jpg'
  ] },
  { id: 'skin-epic', title: 'Эпический скин', description: 'Выделяйся в лобби', price: 6.99, image: 'https://raw.githubusercontent.com/one-aalam/assets-cdn/main/stumble-guys/skins/epic.jpg', images: [
    'https://raw.githubusercontent.com/one-aalam/assets-cdn/main/stumble-guys/skins/epic.jpg'
  ] },
  { id: 'pass', title: 'Stumble Pass', description: 'Сезонные награды', price: 9.99, image: 'https://static.wikia.nocookie.net/stumbleguys/images/a/a5/Battle_Pass_-_Icon_-_Stumble_Guys.png/revision/latest?cb=20220802100839', images: [
    'https://i.ytimg.com/vi/9dfaItJPemw/maxresdefault.jpg',
    'https://i.ytimg.com/vi/fPgX4UwiOxs/maxresdefault.jpg'
  ] },
  { id: 'bundle-starter', title: 'Стартовый набор', description: 'Гемы + скин', price: 7.49, image: 'https://raw.githubusercontent.com/one-aalam/assets-cdn/main/stumble-guys/bundles/starter.jpg', images: [
    'https://raw.githubusercontent.com/one-aalam/assets-cdn/main/stumble-guys/bundles/starter.jpg',
    'https://raw.githubusercontent.com/one-aalam/assets-cdn/main/stumble-guys/bundles/starter-2.jpg'
  ] },
];

// Cart State
/** @type {Record<string, number>} */
let cart = {};

function loadCart() {
  try {
    const raw = localStorage.getItem('sg_cart');
    cart = raw ? JSON.parse(raw) : {};
  } catch { cart = {}; }
}
function saveCart() { localStorage.setItem('sg_cart', JSON.stringify(cart)); }

function getProduct(productId) { return PRODUCTS.find(p => p.id === productId); }
function cartItemsDetailed() {
  return Object.entries(cart).map(([productId, qty]) => ({
    product: getProduct(productId),
    qty
  })).filter(x => x.product);
}
function cartTotal() {
  return cartItemsDetailed().reduce((sum, { product, qty }) => sum + product.price * qty, 0);
}
function cartCount() { return Object.values(cart).reduce((a, b) => a + b, 0); }

// DOM
const productGrid = document.getElementById('productGrid');
const cartDrawer = document.getElementById('cartDrawer');
const cartItemsEl = document.getElementById('cartItems');
const cartTotalEl = document.getElementById('cartTotal');
const cartCountEl = document.getElementById('cartCount');
const openCartBtn = document.getElementById('openCartBtn');
const closeCartBtn = document.getElementById('closeCartBtn');
const goCheckoutBtn = document.getElementById('goCheckoutBtn');
const checkoutForm = document.getElementById('checkoutForm');
const toastEl = document.getElementById('toast');

function showToast(text) {
  toastEl.textContent = text;
  toastEl.classList.add('show');
  setTimeout(() => toastEl.classList.remove('show'), 1800);
}

function renderProducts() {
  const frag = document.createDocumentFragment();
  for (const p of PRODUCTS) {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML = `
      <img src="${p.image}" alt="${p.title}" referrerpolicy="no-referrer" data-gallery-open="${p.id}" data-index="0" onerror="this.onerror=null; this.src='https://via.placeholder.com/600x400?text=Image+unavailable';">
      <div class="product-title">${p.title}</div>
      <div class="product-meta">${p.description}</div>
      <div class="price">${azn.format(p.price)}</div>
      ${p.images && p.images.length > 1 ? `<div class="thumbs">${p.images.map((src, idx) => `<img src="${src}" alt="${p.title} ${idx+1}" referrerpolicy=\"no-referrer\" data-gallery-open=\"${p.id}\" data-index=\"${idx}\" onerror=\"this.onerror=null; this.style.opacity=0.4;\">`).join('')}</div>` : ''}
      <div class="actions">
        <button class="primary" data-add="${p.id}">Добавить</button>
        <button class="secondary" data-buy="${p.id}">Купить сейчас</button>
      </div>
    `;
    frag.appendChild(card);
  }
  productGrid.appendChild(frag);

  productGrid.addEventListener('click', (e) => {
    const t = e.target;
    if (!(t instanceof HTMLElement)) return;
    const open = t.getAttribute('data-gallery-open');
    const idxAttr = t.getAttribute('data-index');
    if (open) {
      const idx = idxAttr ? parseInt(idxAttr, 10) : 0;
      openGallery(open, idx);
      return;
    }
    const addId = t.getAttribute('data-add');
    const buyId = t.getAttribute('data-buy');
    if (addId) { addToCart(addId); }
    if (buyId) { addToCart(buyId); openCart(); }
  });
}

function addToCart(productId, qtyDelta = 1) {
  cart[productId] = (cart[productId] || 0) + qtyDelta;
  if (cart[productId] <= 0) delete cart[productId];
  saveCart();
  updateCartUI();
  showToast('Добавлено в корзину');
}

function updateCartUI() {
  const items = cartItemsDetailed();
  cartItemsEl.innerHTML = '';
  for (const { product, qty } of items) {
    const row = document.createElement('div');
    row.className = 'cart-item';
    row.innerHTML = `
      <img src="${product.image}" alt="${product.title}">
      <div>
        <div style="font-weight:700">${product.title}</div>
        <div style="color:#a7acff; font-size:14px">${azn.format(product.price)} · x${qty}</div>
        <button class="remove" data-remove="${product.id}">Удалить</button>
      </div>
      <div class="qty">
        <button data-dec="${product.id}">-</button>
        <span>${qty}</span>
        <button data-inc="${product.id}">+</button>
      </div>
    `;
    cartItemsEl.appendChild(row);
  }
  cartTotalEl.textContent = `${azn.format(cartTotal())}`;
  cartCountEl.textContent = String(cartCount());
}

function openCart() { cartDrawer.classList.add('open'); cartDrawer.setAttribute('aria-hidden', 'false'); }
function closeCart() { cartDrawer.classList.remove('open'); cartDrawer.setAttribute('aria-hidden', 'true'); }

function wireCartEvents() {
  openCartBtn.addEventListener('click', openCart);
  closeCartBtn.addEventListener('click', closeCart);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeCart(); });
  cartItemsEl.addEventListener('click', (e) => {
    const t = e.target;
    if (!(t instanceof HTMLElement)) return;
    const inc = t.getAttribute('data-inc');
    const dec = t.getAttribute('data-dec');
    const rem = t.getAttribute('data-remove');
    if (inc) addToCart(inc, 1);
    if (dec) addToCart(dec, -1);
    if (rem) { delete cart[rem]; saveCart(); updateCartUI(); }
  });
}

function wireCheckout() {
  goCheckoutBtn.addEventListener('click', () => {
    closeCart();
    document.getElementById('checkout').scrollIntoView({ behavior: 'smooth' });
  });
  checkoutForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const order = {
      playerId: /** @type {HTMLInputElement} */(document.getElementById('playerId')).value.trim(),
      email: /** @type {HTMLInputElement} */(document.getElementById('email')).value.trim(),
      firstName: /** @type {HTMLInputElement} */(document.getElementById('firstName')).value.trim(),
      lastName: /** @type {HTMLInputElement} */(document.getElementById('lastName')).value.trim(),
      items: cartItemsDetailed().map(x => ({ id: x.product.id, qty: x.qty, price: x.product.price })),
      total: cartTotal(),
      createdAt: new Date().toISOString()
    };
    if (!order.items.length) { showToast('Добавьте товары в корзину'); return; }
    console.log('ORDER (demo):', order);
    localStorage.setItem('sg_last_order', JSON.stringify(order));
    cart = {}; saveCart(); updateCartUI();
    showToast('Заказ подтверждён! Письмо отправлено на e-mail (демо)');
    setTimeout(() => window.location.hash = '#catalog', 400);
  });
}

// Gallery Modal
const galleryModal = document.getElementById('galleryModal');
const galleryImage = document.getElementById('galleryImage');
const galleryCaption = document.getElementById('galleryCaption');
const galleryPrev = document.getElementById('galleryPrev');
const galleryNext = document.getElementById('galleryNext');
const galleryClose = document.getElementById('galleryClose');
let currentGallery = { productId: null, index: 0 };

function refreshGallery() {
  if (!currentGallery.productId) return;
  const product = getProduct(currentGallery.productId);
  if (!product) return;
  let idx = Math.max(0, Math.min(product.images.length - 1, currentGallery.index));
  // Skip broken images by probing
  const tryLoad = (i, attemptsLeft) => {
    if (attemptsLeft <= 0) { return; }
    const url = product.images[i];
    const probe = new Image();
    probe.onload = () => {
      currentGallery.index = i;
      galleryImage.src = url;
      galleryImage.alt = product.title + ' ' + (i + 1);
      galleryCaption.textContent = `${product.title} — ${i + 1}/${product.images.length}`;
    };
    probe.onerror = () => {
      const next = (i + 1) % product.images.length;
      if (next !== i) tryLoad(next, attemptsLeft - 1);
    };
    probe.src = url;
  };
  tryLoad(idx, product.images.length);
}

function openGallery(productId, index = 0) {
  currentGallery = { productId, index };
  refreshGallery();
  galleryModal.classList.add('open');
  galleryModal.setAttribute('aria-hidden', 'false');
}
function closeGallery() {
  galleryModal.classList.remove('open');
  galleryModal.setAttribute('aria-hidden', 'true');
}

function wireGallery() {
  galleryPrev.addEventListener('click', () => {
    const product = getProduct(currentGallery.productId);
    if (!product) return;
    currentGallery.index = (currentGallery.index - 1 + product.images.length) % product.images.length;
    refreshGallery();
  });
  galleryNext.addEventListener('click', () => {
    const product = getProduct(currentGallery.productId);
    if (!product) return;
    currentGallery.index = (currentGallery.index + 1) % product.images.length;
    refreshGallery();
  });
  galleryClose.addEventListener('click', closeGallery);
  document.querySelector('[data-close-modal]')?.addEventListener('click', closeGallery);
  document.addEventListener('keydown', (e) => {
    if (galleryModal.classList.contains('open')) {
      if (e.key === 'Escape') closeGallery();
      if (e.key === 'ArrowLeft') galleryPrev.click();
      if (e.key === 'ArrowRight') galleryNext.click();
    }
  });
}

function boot() {
  loadCart();
  renderProducts();
  updateCartUI();
  wireCartEvents();
  wireCheckout();
  wireGallery();
}

document.addEventListener('DOMContentLoaded', boot);


