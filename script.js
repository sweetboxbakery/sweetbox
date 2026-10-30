// mark the page as "js is working" (the reveal effect needs this)
document.documentElement.classList.add("js");

// the header and menu only exist on pages that have them (not log in / sign up)
const header = document.getElementById("header");
if (header) {
  const menuToggle = document.getElementById("menuToggle");
  const nav = document.getElementById("nav");
  const navLinks = nav.querySelectorAll("a");

  // wrap link text in a span so the hover underline only covers the words
  document.querySelectorAll(".nav a, .auth a").forEach(function (link) {
    link.innerHTML = "<span>" + link.textContent + "</span>";
  });

  // highlight the link for the page we're on
  const currentPage = location.pathname.split("/").pop() || "index.html";
  navLinks.forEach(function (link) {
    const href = link.getAttribute("href");
    if (href === currentPage || (currentPage === "index.html" && href === "#home")) {
      link.classList.add("active");
    }
  });

  // open / close the menu on small screens
  function setMenu(open) {
    nav.classList.toggle("open", open);
    menuToggle.classList.toggle("open", open);
    menuToggle.setAttribute("aria-expanded", open);
  }

  menuToggle.addEventListener("click", function () {
    setMenu(!nav.classList.contains("open"));
  });

  navLinks.forEach(function (link) {
    link.addEventListener("click", function () {
      setMenu(false);
    });
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") setMenu(false);
  });

  // give the header a background once the page is scrolled
  function checkScroll() {
    header.classList.toggle("scrolled", window.scrollY > 40);
  }

  window.addEventListener("scroll", checkScroll);
  checkScroll();
}

// every link that starts with # scrolls smoothly (Order Now, locations, Home)
document.querySelectorAll('a[href^="#"]').forEach(function (link) {
  link.addEventListener("click", function (e) {
    const target = document.querySelector(link.getAttribute("href"));
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: "smooth" });
  });
});

// fade things in the first time they come into view
const items = document.querySelectorAll(".reveal");

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add("in-view");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });

  items.forEach(function (item) {
    observer.observe(item);
  });
} else {
  items.forEach(function (item) {
    item.classList.add("in-view");
  });
}

// cart: kept in the browser (localStorage) so it is still there on every page
const CART_KEY = "sweetbox-cart";

function getCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) || [];
  } catch (err) {
    return [];
  }
}

function saveCart(cart) {
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  } catch (err) {
    // storage is blocked, so the cart just won't be remembered
  }
}

// add one product, or add 1 more if it is already in the cart
function addToCart(product) {
  const cart = getCart();
  const found = cart.find(function (line) {
    return line.name === product.name;
  });

  if (found) found.qty++;
  else cart.push(Object.assign({ qty: 1 }, product));

  saveCart(cart);
}

// shop page: the tabs and the search bar filter the collection
const searchBox = document.getElementById("searchBox");

if (searchBox) {
  const tabs = document.querySelectorAll(".filters button");
  const tiles = document.querySelectorAll(".cake-tile");
  const groupTitle = document.getElementById("groupTitle");
  const emptyNote = document.getElementById("emptyNote");
  let category = "all";

  // show only the tiles that match the tab and the words typed
  function showTiles() {
    const word = searchBox.value.trim().toLowerCase();
    let count = 0;

    tiles.forEach(function (tile) {
      const text = (tile.dataset.name + " " + tile.dataset.category).toLowerCase();
      const show = (category === "all" || tile.dataset.category === category) && text.includes(word);
      tile.hidden = !show;
      if (show) count++;
    });

    emptyNote.hidden = count > 0;
  }

  // highlight a tab and put its name in the heading
  function setTab(name) {
    category = name;
    tabs.forEach(function (tab) {
      const on = tab.dataset.category === name;
      tab.classList.toggle("active", on);
      if (on) groupTitle.textContent = tab.textContent;
    });
  }

  tabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      searchBox.value = "";
      setTab(tab.dataset.category);
      showTiles();
    });
  });

  // typing searches everything, so go back to the All tab
  searchBox.addEventListener("input", function () {
    if (searchBox.value) setTab("all");
    showTiles();
  });
}

// categories page: pick a category to see its products
const categoryList = document.getElementById("categoryList");

if (categoryList) {
  const menuGrid = document.getElementById("menuGrid");
  const catButtons = categoryList.querySelectorAll("button");
  let currentCategory = "cookies";

  // each product: name, price, number of reviews, picture, glow colour, short description
  const menu = {
    cakes: [
      ["Strawberry Shortcake", 120, 156, "shop-cake1", "yellow", "Fluffy vanilla sponge layered with whipped cream and fresh strawberries."],
      ["Carrot Cake", 110, 98, "shop-cake2", "pink", "Moist spiced carrot cake topped with smooth cream cheese frosting."],
      ["Chocolate Cake", 115, 203, "shop-cake3", "yellow", "Rich layers of dark chocolate cake with silky chocolate ganache."],
      ["Matcha Strawberry Cake", 130, 87, "shop-cake4", "yellow", "Earthy matcha sponge with sweet strawberries and light cream."],
      ["Classic Cheesecake", 135, 142, "shop-cake5", "pink", "Creamy cheesecake on a buttery crust with a blueberry glaze."],
      ["Orange Chiffon", 125, 64, "shop-cake6", "yellow", "Soft sponge with whipped cream and a mix of fresh fruit."]
    ],
    cookies: [
      ["Biscoff Chewy Crumble Cookie", 80, 125, "shop-cookie1", "yellow", "A soft, chewy, cookie topped with Biscoff spread, crunchy biscoff crumble, with a drizzle 	of sweet caramel on top."],
      ["Strawberry cheesecake crumble cookie", 80, 90, "shop-cookie2", "pink", "A soft strawberry flavored cookie with cheesecake frosting and cookie crumbs on top. 	Inspired by the delicious flavor of strawberry cheesecake."],
      ["Ferrero choco crumble cookie", 70, 187, "shop-cookie3", "yellow", "Soft chocolate cookie with hazelnuts and rich chocolate frosting with almonds on top. An 	extra treat for extra cravings of choco-nut goodness."],
      ["Pink funfetti crumble cookie", 70, 84, "shop-cookie4", "pink", "A soft buttery, vanilla flavored cookie with a creamy strawberry frosting and candy 	sprinkles."],
      ["Double Chocolate Cookie", 65, 312, "shop-cookie5", "pink", "A decadent chocolate cookie topped with rich chocolate frosting with small bits of chocolate 	shavings. For true chocolate lovers."],
      ["Cookies and cream cookie", 70, 118, "shop-cookie6", "yellow", "Chocolate based cookie made with oreos topped with creamy frosting and oreo crumbs. Classic 	cookies and cream combination that is irresistible."]
    ],
    pastries: [
      ["Butter Croissant", 75, 125, "shop-bread1", "yellow", "Flaky, golden croissant baked fresh with real butter."],
      ["Cinnamon Roll", 85, 90, "shop-bread6", "pink", "A soft swirled roll with cinnamon sugar and a sweet glaze."],
      ["Cream Puff", 80, 84, "shop-bread5", "pink", "Light pastry filled with vanilla custard cream and dusted with sugar."],
      ["Sourdough", 60, 200, "shop-bread8", "yellow", "A rustic loaf with a crisp crust and a tangy, chewy inside."],
      ["Soft Pretzel", 70, 125, "shop-bread9", "pink", "A soft, buttery pretzel twist with a golden brown crust."],
      ["Pain au Chocolat", 90, 258, "shop-bread3", "yellow", "Buttery, flaky pastry rolled around rich dark chocolate."]
    ],
      chocolates: [
      ["Caramel Heart", 25, 208, "shop-chocolate1", "yellow", "A chocolate wrapped in caramel flavored goodness, perfect for those who love extra sweet treats."],
      ["Dark Chocolate Heart", 25, 219, "shop-chocolate2", "pink", "Double coated chocolate for those who love sweet yet bitter chocolates, double the amount."],
      ["Milk Chocolate Heart", 25, 120, "shop-chocolate3", "yellow", "Chocolates that taste milky with a hint of sweetness. "],
      ["Red Velvet Heart", 25, 108, "shop-chocolate4", "pink", "A chocolate flavored cookie coated in red velvety goodness. One of the unique flavors that can be 	found here at Sweet Box Bakery."],
      ["Hazelnut Heart", 25, 174, "shop-chocolate5", "pink", "Mocha flavored cookies sprinkled in with nuts."],
      ["Vanilla Heart", 25, 250, "shop-chocolate6", "yellow", "Vanilla flavored cookies, for those who like it plain."],
    ],
};

  // draw the cards for one category and highlight its button
  function showCategory(name) {
    currentCategory = name;
    menuGrid.dataset.category = name;

    menuGrid.innerHTML = menu[name].map(function (item, index) {
      return '<article class="item" data-index="' + index + '" tabindex="0" role="button" aria-label="View ' + item[0] + '">' +
        '<div class="item-pic glow-' + item[4] + '"><img src="images/' + item[3] + '.png" alt=""></div>' +
        '<div class="item-info">' +
          '<h3>' + item[0] + '</h3>' +
          '<div class="item-meta">' +
            '<span class="item-price">₱' + item[1].toFixed(2) + '</span>' +
            '<span><span class="item-stars" aria-label="4.5 out of 5 stars">★★★★★</span> <span class="item-count">(' + item[2] + ')</span></span>' +
          '</div>' +
        '</div>' +
      '</article>';
    }).join("");

    catButtons.forEach(function (button) {
      button.classList.toggle("active", button.dataset.category === name);
    });
  }

  catButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      showCategory(button.dataset.category);
    });
  });

  showCategory("cookies");

  // ----- product panel (pops out beside the product) -----
  const panel = document.getElementById("productPanel");
  const panelPic = document.getElementById("panelPic");
  const panelImg = document.getElementById("panelImg");
  const panelName = document.getElementById("panelName");
  const panelRating = document.getElementById("panelRating");
  const panelDesc = document.getElementById("panelDesc");
  const panelPrice = document.getElementById("panelPrice");
  const toast = document.getElementById("toast");
  let openCard = null;
  let toastTimer;

  // hide the panel and un-highlight the product
  function closePanel() {
    panel.hidden = true;
    if (openCard) openCard.classList.remove("selected");
    openCard = null;
  }

  // fill the panel, then put it on the right of the product (or the left if there is no room)
  function openProduct(card) {
    const item = menu[currentCategory][Number(card.dataset.index)];

    if (openCard) openCard.classList.remove("selected");
    openCard = card;
    card.classList.add("selected");

    panel.dataset.category = currentCategory;
    panelPic.className = "panel-pic glow-" + item[4];
    panelImg.src = "images/" + item[3] + ".png";
    panelImg.alt = item[0].replace("&amp;", "&");
    panelName.innerHTML = item[0];
    panelRating.textContent = "4.5 (" + item[2] + " reviews)";
    panelDesc.textContent = item[5];
    panelPrice.textContent = "₱" + item[1].toFixed(2);
    panel.hidden = false;

    // position is measured from the section that holds the panel
    const box = panel.offsetParent.getBoundingClientRect();
    const pic = card.querySelector(".item-pic").getBoundingClientRect();
    const gap = 16;
    let left = pic.right - box.left + gap;
    if (pic.right + gap + panel.offsetWidth > window.innerWidth - 8) {
      left = pic.left - box.left - gap - panel.offsetWidth;
    }
    panel.style.left = left + "px";
    panel.style.top = (pic.top - box.top) + "px";
  }

  // click a product (or press Enter / Space on it) to open its panel
  menuGrid.addEventListener("click", function (e) {
    const card = e.target.closest(".item");
    if (!card) return;
    if (card === openCard) closePanel();
    else openProduct(card);
  });

  menuGrid.addEventListener("keydown", function (e) {
    const card = e.target.closest(".item");
    if (card && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      if (card === openCard) closePanel();
      else openProduct(card);
    }
  });

  // close with the X, by clicking anywhere else, or with Esc
  document.getElementById("panelClose").addEventListener("click", closePanel);

  document.addEventListener("click", function (e) {
    if (!panel.contains(e.target) && !e.target.closest(".item")) closePanel();
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closePanel();
  });

  // changing category closes the panel
  catButtons.forEach(function (button) {
    button.addEventListener("click", closePanel);
  });

  // Add to Cart saves the product, closes the panel and shows the alert for a moment
  document.getElementById("addToCart").addEventListener("click", function () {
    if (openCard) {
      const item = menu[currentCategory][Number(openCard.dataset.index)];
      addToCart({
        name: item[0].replace("&amp;", "&"),
        price: item[1],
        pic: item[3],
        glow: item[4],
        tile: currentCategory,
        desc: item[5]
      });
    }

    closePanel();
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toast.classList.remove("show");
    }, 2200);
  });
}

// cart page: show the saved items, change amounts, remove, and work out the total
const cartList = document.getElementById("cartList");

if (cartList) {
  const subtotalText = document.getElementById("subtotal");
  const deliveryText = document.getElementById("delivery");
  const totalText = document.getElementById("total");
  const checkoutBtn = document.getElementById("checkoutBtn");
  const deliveryFee = 50;

  // products that have their own photo for the cart
  const cartPhotos = {
    "Butter Croissant": "cart-butter-croissant"
  };

  function peso(number) {
    return "₱" + number.toFixed(2);
  }

  // stop names from being read as html
  function safe(text) {
    return String(text).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  function drawCart() {
    const cart = getCart();
    let subtotal = 0;

    if (cart.length === 0) {
      cartList.innerHTML = '<div class="cart-empty">Your cart is empty.<br><a href="categories.html">Continue Shopping</a></div>';
    } else {
      cartList.innerHTML = cart.map(function (line, index) {
        subtotal += line.price * line.qty;
        const photo = cartPhotos[line.name];
        const picture = photo || line.pic;

        return '<article class="cart-item">' +
          '<div class="cart-pic glow-' + line.glow + (photo ? " photo" : "") + '" data-tile="' + line.tile + '">' +
            '<img src="images/' + picture + '.png" alt="' + safe(line.name) + '">' +
          '</div>' +
          '<div class="cart-info">' +
            '<h3>' + safe(line.name) + '</h3>' +
            '<p class="cart-desc">' + safe(line.desc) + '</p>' +
            '<div class="qty">' +
              '<button type="button" data-action="minus" data-index="' + index + '" aria-label="One less">&minus;</button>' +
              '<span>' + line.qty + '</span>' +
              '<button type="button" data-action="plus" data-index="' + index + '" aria-label="One more">+</button>' +
            '</div>' +
            '<div class="cart-bottom">' +
              '<span class="cart-price">' + peso(line.price * line.qty) + '</span>' +
              '<button type="button" class="remove" data-action="remove" data-index="' + index + '">Remove</button>' +
            '</div>' +
          '</div>' +
        '</article>';
      }).join("");
    }

    // the delivery fee only counts when there is something in the cart
    const delivery = cart.length ? deliveryFee : 0;
    subtotalText.textContent = peso(subtotal);
    deliveryText.textContent = peso(delivery);
    totalText.textContent = peso(subtotal + delivery);
    checkoutBtn.disabled = cart.length === 0;
  }

  // + / - / Remove buttons
  cartList.addEventListener("click", function (e) {
    const button = e.target.closest("button[data-action]");
    if (!button) return;

    const cart = getCart();
    const line = cart[Number(button.dataset.index)];
    if (!line) return;

    if (button.dataset.action === "plus" && line.qty < 99) line.qty++;
    if (button.dataset.action === "minus" && line.qty > 1) line.qty--;
    if (button.dataset.action === "remove") cart.splice(Number(button.dataset.index), 1);

    saveCart(cart);
    drawCart();
  });

  drawCart();
}

// log in / sign up: simple checks, then on to the next page
const authForm = document.getElementById("authForm");

if (authForm) {
  const formError = document.getElementById("formError");
  const inputs = authForm.querySelectorAll("input");
  const passwordBox = authForm.querySelector('input[type="password"]');

  function showError(message) {
    formError.textContent = message;
    formError.hidden = false;
  }

  authForm.addEventListener("submit", function (e) {
    e.preventDefault();
    formError.hidden = true;

    // every box needs something in it
    for (const box of inputs) {
      if (!box.value.trim()) {
        showError("Please fill in every box.");
        box.focus();
        return;
      }
    }

    const emailBox = authForm.querySelector('input[type="email"]');
    if (!/^\S+@\S+\.\S+$/.test(emailBox.value.trim())) {
      showError("Please enter a valid email address.");
      emailBox.focus();
      return;
    }

    // a new account needs a password of at least 6 characters
    if (authForm.dataset.checkPassword === "yes" && passwordBox.value.length < 6) {
      showError("Password must be at least 6 characters.");
      passwordBox.focus();
      return;
    }

    location.href = authForm.dataset.next;
  });
}

