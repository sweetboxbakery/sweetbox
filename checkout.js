// ===== Sweet Box - checkout.js =====
// Reads the cart from localStorage, computes totals, validates the form,
// handles GCash / Bank Transfer / COD payment options, and places the order.

const DELIVERY_FEE = 50;
const CART_KEY = "sweetboxCart";
const ORDER_KEY = "sweetboxLastOrder";

function formatPeso(amount) {
  return "₱" + amount.toFixed(2);
}

// ---------- Load cart ----------
function getCart() {
  try {
    const raw = localStorage.getItem(CART_KEY);
    if (!raw) return [];
    const saved = JSON.parse(raw);
    return saved && Array.isArray(saved.items) ? saved.items : [];
  } catch (e) {
    return [];
  }
}

let cartItems = getCart();

// ---------- Render order summary ----------
function renderSummary() {
  const list = document.getElementById("summary-items");
  list.innerHTML = "";
  let subtotal = 0;

  cartItems.forEach(function (item) {
    const line = item.price * item.qty;
    subtotal += line;

    const row = document.createElement("div");
    row.className = "sum-item";

    const img = document.createElement("img");
    img.src = item.image;
    img.alt = item.name;

    const info = document.createElement("div");
    info.className = "sum-info";
    info.textContent = item.name + " × " + item.qty;

    const amt = document.createElement("span");
    amt.textContent = formatPeso(line);

    row.appendChild(img);
    row.appendChild(info);
    row.appendChild(amt);
    list.appendChild(row);
  });

  const hasItems = cartItems.length > 0;
  const delivery = hasItems ? DELIVERY_FEE : 0;
  document.getElementById("subtotal").textContent = formatPeso(subtotal);
  document.getElementById("delivery-fee").textContent = formatPeso(delivery);
  document.getElementById("total").textContent = formatPeso(subtotal + delivery);
  document.getElementById("empty-msg").style.display = hasItems ? "none" : "block";
  document.getElementById("place-order").disabled = !hasItems;

  return subtotal + delivery;
}

// ---------- Payment option toggle ----------
function getPaymentMethod() {
  return document.querySelector('input[name="payment"]:checked').value;
}

function updatePaymentPanels() {
  const method = getPaymentMethod();
  document.getElementById("panel-gcash").style.display = method === "gcash" ? "block" : "none";
  document.getElementById("panel-bank").style.display = method === "bank" ? "block" : "none";
  document.getElementById("panel-cod").style.display = method === "cod" ? "block" : "none";

  document.querySelectorAll(".pay-option").forEach(function (label) {
    label.classList.toggle("selected", label.querySelector("input").checked);
  });
}

document.querySelectorAll('input[name="payment"]').forEach(function (radio) {
  radio.addEventListener("change", updatePaymentPanels);
});

// ---------- Validation helpers ----------
function setError(id, message) {
  const el = document.getElementById("err-" + id);
  if (el) el.textContent = message;
  const field = document.getElementById(id);
  if (field) field.classList.toggle("invalid", message !== "");
  return message === "";
}

function validateForm() {
  let ok = true;
  const v = function (id) { return document.getElementById(id).value.trim(); };

  // Delivery details
  ok = setError("fullname", v("fullname").length < 2 || !/^[A-Za-zÑñ .'-]+$/.test(v("fullname"))
        ? "Please enter your full name (letters only)." : "") && ok;
  ok = setError("phone", !/^09\d{9}$/.test(v("phone"))
        ? "Enter a valid mobile number (e.g. 09171234567)." : "") && ok;
  ok = setError("email", !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v("email"))
        ? "Enter a valid email address." : "") && ok;
  ok = setError("address", v("address").length < 10
        ? "Please enter your complete delivery address." : "") && ok;

  // Payment details depend on chosen method
  const method = getPaymentMethod();

  // Clear errors of the panels not in use
  if (method !== "gcash") { setError("gcash-number", ""); setError("gcash-ref", ""); }
  if (method !== "bank") { setError("bank-name", ""); setError("bank-holder", ""); setError("bank-ref", ""); }

  if (method === "gcash") {
    ok = setError("gcash-number", !/^09\d{9}$/.test(v("gcash-number"))
          ? "Enter the GCash number you paid from (11 digits)." : "") && ok;
    ok = setError("gcash-ref", !/^\d{13}$/.test(v("gcash-ref"))
          ? "GCash reference number must be 13 digits." : "") && ok;
  }
  if (method === "bank") {
    ok = setError("bank-name", v("bank-name") === "" ? "Please select your bank." : "") && ok;
    ok = setError("bank-holder", v("bank-holder").length < 2
          ? "Enter the account holder's name." : "") && ok;
    ok = setError("bank-ref", !/^[A-Za-z0-9]{6,20}$/.test(v("bank-ref"))
          ? "Enter a valid reference number (6-20 letters/numbers)." : "") && ok;
  }
  return ok;
}

// Live clean-up of errors while typing
document.querySelectorAll("input, textarea, select").forEach(function (field) {
  field.addEventListener("input", function () {
    if (field.classList.contains("invalid")) {
      field.classList.remove("invalid");
      const err = document.getElementById("err-" + field.id);
      if (err) err.textContent = "";
    }
  });
});

// Only allow digits in number fields
["phone", "gcash-number", "gcash-ref"].forEach(function (id) {
  document.getElementById(id).addEventListener("input", function (e) {
    e.target.value = e.target.value.replace(/\D/g, "");
  });
});

// ---------- Place order ----------
document.getElementById("checkout-form").addEventListener("submit", function (e) {
  e.preventDefault();

  if (cartItems.length === 0) {
    alert("Your cart is empty.");
    return;
  }
  if (!validateForm()) {
    const firstBad = document.querySelector(".invalid");
    if (firstBad) firstBad.focus();
    return;
  }

  const total = renderSummary();
  const method = getPaymentMethod();
  const methodNames = { gcash: "GCash", bank: "Bank Transfer", cod: "Cash on Delivery" };
  const orderNumber = "SB-" + Date.now().toString().slice(-8);

  const order = {
    orderNumber: orderNumber,
    customer: {
      name: document.getElementById("fullname").value.trim(),
      phone: document.getElementById("phone").value.trim(),
      email: document.getElementById("email").value.trim(),
      address: document.getElementById("address").value.trim()
    },
    paymentMethod: methodNames[method],
    items: cartItems,
    total: total,
    status: method === "cod" ? "Pay upon delivery" : "Payment under verification"
  };

  try {
    localStorage.setItem(ORDER_KEY, JSON.stringify(order));
    // Empty the cart after a successful order
    localStorage.setItem(CART_KEY, JSON.stringify({ items: [] }));
  } catch (err) {
    console.warn("Could not save order:", err);
  }

  // Show confirmation
  document.getElementById("conf-order").textContent = orderNumber;
  document.getElementById("conf-method").textContent = methodNames[method];
  document.getElementById("conf-total").textContent = formatPeso(total);
  document.getElementById("conf-status").textContent = order.status;
  document.getElementById("modal").classList.add("show");
});

document.getElementById("modal-close").addEventListener("click", function () {
  window.location.href = "cart.html";
});

// ---------- Start ----------
updatePaymentPanels();
renderSummary();
