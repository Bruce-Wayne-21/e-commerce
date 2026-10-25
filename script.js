// ===== Product catalog =====
const PRODUCTS = [
  { id: 1,  name: "Ceramic Mug",        category: "Kitchen",  price: 18,  emoji: "☕", rating: 4.6, bg: "#fde68a", badge: "" },
  { id: 2,  name: "Linen Apron",        category: "Kitchen",  price: 34,  emoji: "🧑‍🍳", rating: 4.3, bg: "#fbcfe8", badge: "" },
  { id: 3,  name: "Desk Lamp",          category: "Office",   price: 72,  emoji: "💡", rating: 4.8, bg: "#bfdbfe", badge: "Popular" },
  { id: 4,  name: "Notebook Set",       category: "Office",   price: 24,  emoji: "📓", rating: 4.5, bg: "#c7d2fe", badge: "" },
  { id: 5,  name: "Wireless Earbuds",   category: "Tech",     price: 119, emoji: "🎧", rating: 4.7, bg: "#a7f3d0", badge: "New" },
  { id: 6,  name: "Smart Speaker",      category: "Tech",     price: 89,  emoji: "🔊", rating: 4.2, bg: "#ddd6fe", badge: "" },
  { id: 7,  name: "Canvas Tote",        category: "Lifestyle",price: 28,  emoji: "👜", rating: 4.4, bg: "#fed7aa", badge: "" },
  { id: 8,  name: "Scented Candle",     category: "Lifestyle",price: 22,  emoji: "🕯️", rating: 4.9, bg: "#fecaca", badge: "Popular" },
  { id: 9,  name: "Pour-Over Kettle",   category: "Kitchen",  price: 58,  emoji: "🫖", rating: 4.6, bg: "#99f6e4", badge: "" },
  { id: 10, name: "Mechanical Keyboard",category: "Tech",     price: 145, emoji: "⌨️", rating: 4.8, bg: "#bae6fd", badge: "New" },
  { id: 11, name: "Fountain Pen",       category: "Office",   price: 46,  emoji: "🖋️", rating: 4.5, bg: "#e9d5ff", badge: "" },
  { id: 12, name: "Wool Blanket",       category: "Lifestyle",price: 68,  emoji: "🧣", rating: 4.7, bg: "#fbcfe8", badge: "" },
];

const CATEGORIES = ["All", ...new Set(PRODUCTS.map(p => p.category))];

// ===== State =====
const cart = new Map(); // id -> qty
let activeCategory = "All";
let searchTerm = "";
let sortMode = "featured";

// ===== DOM refs =====
const $ = sel => document.querySelector(sel);
const grid = $("#productGrid");
const filters = $("#filters");
const emptyState = $("#emptyState");
const cartItemsEl = $("#cartItems");
const cartCountEl = $("#cartCount");
const cartTotalEl = $("#cartTotal");
const checkoutBtn = $("#checkoutBtn");
const drawer = $("#cartDrawer");
const overlay = $("#overlay");
const toast = $("#toast");

const money = n => "$" + n.toFixed(2);

// ===== Render filter chips =====
function renderFilters() {
  filters.innerHTML = "";
  CATEGORIES.forEach(cat => {
    const btn = document.createElement("button");
    btn.className = "chip" + (cat === activeCategory ? " is-active" : "");
    btn.textContent = cat;
    btn.setAttribute("role", "tab");
    btn.setAttribute("aria-selected", cat === activeCategory);
    btn.addEventListener("click", () => {
      activeCategory = cat;
      renderFilters();
      renderProducts();
    });
    filters.appendChild(btn);
  });
}

// ===== Render product grid =====
function visibleProducts() {
  let list = PRODUCTS.filter(p => {
    const matchCat = activeCategory === "All" || p.category === activeCategory;
    const matchSearch = p.name.toLowerCase().includes(searchTerm);
    return matchCat && matchSearch;
  });
  switch (sortMode) {
    case "price-asc":  list.sort((a, b) => a.price - b.price); break;
    case "price-desc": list.sort((a, b) => b.price - a.price); break;
    case "rating":     list.sort((a, b) => b.rating - a.rating); break;
  }
  return list;
}

function renderProducts() {
  const list = visibleProducts();
  grid.innerHTML = "";
  emptyState.hidden = list.length > 0;

  list.forEach(p => {
    const card = document.createElement("article");
    card.className = "card";
    card.innerHTML = `
      <div class="card__media" style="background:${p.bg}">
        ${p.badge ? `<span class="card__badge">${p.badge}</span>` : ""}
        <span>${p.emoji}</span>
      </div>
      <div class="card__body">
        <span class="card__cat">${p.category}</span>
        <h3 class="card__name">${p.name}</h3>
        <span class="card__rating">★ ${p.rating.toFixed(1)}</span>
        <div class="card__foot">
          <span class="card__price">${money(p.price)}</span>
          <button class="card__add" data-id="${p.id}">Add +</button>
        </div>
      </div>`;
    grid.appendChild(card);
  });
}

// ===== Cart logic =====
function addToCart(id) {
  cart.set(id, (cart.get(id) || 0) + 1);
  const p = PRODUCTS.find(x => x.id === id);
  showToast(`Added ${p.name}`);
  renderCart();
}

function setQty(id, qty) {
  if (qty <= 0) cart.delete(id);
  else cart.set(id, qty);
  renderCart();
}

function renderCart() {
  cartItemsEl.innerHTML = "";
  let total = 0, count = 0;

  if (cart.size === 0) {
    cartItemsEl.innerHTML = `<p class="cart-empty">Your cart is empty.<br>Add something nice.</p>`;
  }

  cart.forEach((qty, id) => {
    const p = PRODUCTS.find(x => x.id === id);
    total += p.price * qty;
    count += qty;
    const row = document.createElement("div");
    row.className = "cart-item";
    row.innerHTML = `
      <div class="cart-item__media" style="background:${p.bg}">${p.emoji}</div>
      <div class="cart-item__info">
        <div class="cart-item__name">${p.name}</div>
        <div class="cart-item__price">${money(p.price)} each</div>
        <div class="cart-item__controls">
          <div class="qty">
            <button data-act="dec" data-id="${id}" aria-label="Decrease quantity">−</button>
            <span>${qty}</span>
            <button data-act="inc" data-id="${id}" aria-label="Increase quantity">+</button>
          </div>
          <button class="cart-item__remove" data-act="rm" data-id="${id}">Remove</button>
        </div>
      </div>
      <strong>${money(p.price * qty)}</strong>`;
    cartItemsEl.appendChild(row);
  });

  cartTotalEl.textContent = money(total);
  cartCountEl.textContent = count;
  cartCountEl.hidden = count === 0;
  checkoutBtn.disabled = count === 0;
}

// ===== Toast =====
let toastTimer;
function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add("is-show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("is-show"), 1800);
}

// ===== Drawer =====
function openCart() {
  drawer.classList.add("is-open");
  drawer.setAttribute("aria-hidden", "false");
  overlay.hidden = false;
}
function closeCart() {
  drawer.classList.remove("is-open");
  drawer.setAttribute("aria-hidden", "true");
  overlay.hidden = true;
}

// ===== Event wiring =====
grid.addEventListener("click", e => {
  const btn = e.target.closest(".card__add");
  if (btn) addToCart(Number(btn.dataset.id));
});

cartItemsEl.addEventListener("click", e => {
  const btn = e.target.closest("button[data-act]");
  if (!btn) return;
  const id = Number(btn.dataset.id);
  const qty = cart.get(id) || 0;
  if (btn.dataset.act === "inc") setQty(id, qty + 1);
  if (btn.dataset.act === "dec") setQty(id, qty - 1);
  if (btn.dataset.act === "rm")  setQty(id, 0);
});

$("#searchInput").addEventListener("input", e => {
  searchTerm = e.target.value.trim().toLowerCase();
  renderProducts();
});

$("#sortSelect").addEventListener("change", e => {
  sortMode = e.target.value;
  renderProducts();
});

$("#cartToggle").addEventListener("click", openCart);
$("#cartClose").addEventListener("click", closeCart);
overlay.addEventListener("click", closeCart);
document.addEventListener("keydown", e => { if (e.key === "Escape") closeCart(); });

checkoutBtn.addEventListener("click", () => {
  const count = [...cart.values()].reduce((a, b) => a + b, 0);
  showToast(`Order placed · ${count} item${count > 1 ? "s" : ""}. Thank you!`);
  cart.clear();
  renderCart();
  closeCart();
});

// ===== Theme toggle =====
const themeToggle = $("#themeToggle");
const themeIcon = $("#themeIcon");
function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  themeIcon.textContent = theme === "dark" ? "☀️" : "🌙";
  try { localStorage.setItem("lumen-theme", theme); } catch (_) {}
}
themeToggle.addEventListener("click", () => {
  const next = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
  applyTheme(next);
});
(function initTheme() {
  let saved;
  try { saved = localStorage.getItem("lumen-theme"); } catch (_) {}
  applyTheme(saved || "light");
})();

// ===== Init =====
renderFilters();
renderProducts();
renderCart();
