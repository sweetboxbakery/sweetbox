// ===== Sweet Box - cart.js =====
// Handles quantity changes, removing items, totals, and saving the cart to localStorage.

const DELIVERY_FEE = 50;
const CART_KEY = "sweetboxCart";

// Format a number as Philippine peso
function formatPeso(amount) {
  return "₱" + amount.toFixed(2);
}

// Save the current cart items so the checkout page can read them
function saveCart() {
  const items = [];
  document.querySelectorAll(".cart-item").forEach(function (item) {
    items.push({
      id: item.dataset.id,
      name: item.dataset.name,
      image: item.dataset.image,
      price: parseFloat(item.dataset.unitPrice),
      qty: parseInt(item.querySelector(".qty-input").value, 10)
    });
  });
  try {
    localStorage.setItem(CART_KEY, JSON.stringify({ items: items }));
  } catch (e) {
    console.warn("Could not save cart:", e);
  }
}

// Restore quantities / removed items from a previous visit
function loadCart() {
  try {
    const raw = localStorage.getItem(CART_KEY);
    if (!raw) return;
    const saved = JSON.parse(raw);
    if (!saved || !Array.isArray(saved.items)) return;
    document.querySelectorAll(".cart-item").forEach(function (item) {
      const found = saved.items.find(function (i) { return i.id === item.dataset.id; });
      if (!found) {
        item.remove();
      } else {
        item.querySelector(".qty-input").value = found.qty;
      }
    });
  } catch (e) {
    console.warn("Could not load cart:", e);
  }
}

// Recalculate prices, subtotal, delivery fee and total
function recalculateCart() {
  const items = document.querySelectorAll(".cart-item");
  let subtotal = 0;

  items.forEach(function (item) {
    const price = parseFloat(item.dataset.unitPrice);
    const input = item.querySelector(".qty-input");
    let qty = parseInt(input.value, 10);
    if (isNaN(qty) || qty < 1) qty = 1;
    input.value = qty;
    const lineTotal = price * qty;
    item.querySelector(".price").textContent = formatPeso(lineTotal);
    subtotal += lineTotal;
  });

  const hasItems = items.length > 0;
  document.getElementById("subtotal").textContent = formatPeso(subtotal);
  document.getElementById("delivery-fee").textContent = formatPeso(hasItems ? DELIVERY_FEE : 0);
  document.getElementById("total").textContent = formatPeso(hasItems ? subtotal + DELIVERY_FEE : 0);
  document.getElementById("empty-msg").style.display = hasItems ? "none" : "block";

  saveCart();
}

// Event: plus, minus and remove buttons
document.getElementById("cart-items").addEventListener("click", function (e) {
  const item = e.target.closest(".cart-item");
  if (!item) return;
  const input = item.querySelector(".qty-input");

  if (e.target.classList.contains("qty-plus")) {
    input.value = parseInt(input.value, 10) + 1;
    recalculateCart();
  }
  if (e.target.classList.contains("qty-minus")) {
    const q = parseInt(input.value, 10);
    if (q > 1) {
      input.value = q - 1;
      recalculateCart();
    }
  }
  if (e.target.classList.contains("remove")) {
    e.preventDefault();
    item.remove();
    recalculateCart();
  }
});

// Event: typing a quantity directly
document.getElementById("cart-items").addEventListener("input", function (e) {
  if (e.target.classList.contains("qty-input")) recalculateCart();
});

// Event: Proceed to Checkout
document.getElementById("checkout-btn").addEventListener("click", function () {
  if (document.querySelectorAll(".cart-item").length === 0) {
    alert("Your cart is empty. Please add items before checking out.");
    return;
  }
  saveCart();
  window.location.href = "checkout.html";
});

// Event: Continue Shopping (change the link to your shop page)
document.getElementById("continue-btn").addEventListener("click", function () {
  window.location.href = "index.html";
});

// Start
loadCart();
recalculateCart();
