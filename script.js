document.addEventListener("DOMContentLoaded", () => {

  /* ---------- Init Lucide icons ---------- */
  if (window.lucide) lucide.createIcons();

  /* =========================================================
     MOBILE NAV TOGGLE
     ========================================================= */
  const navToggle = document.getElementById("navToggle");
  const navMenu = document.getElementById("navMenu");
  const navClose = document.getElementById("navClose");
  if (navToggle && navMenu) {
    navToggle.addEventListener("click", () => {
      const open = navMenu.classList.toggle("open");
      navToggle.setAttribute("aria-expanded", open);
    });
    navMenu.querySelectorAll("a").forEach(link => {
      link.addEventListener("click", () => {
        navMenu.classList.remove("open");
        navToggle.setAttribute("aria-expanded", "false");
      });
    });
    if (navClose) {
      navClose.addEventListener("click", () => {
        navMenu.classList.remove("open");
        navToggle.setAttribute("aria-expanded", "false");
      });
    }
  }

  /* =========================================================
     PAGE-LOAD + SCROLL REVEAL — elements rise up, staggered
     ========================================================= */
  const revealSelector = [
    ".hero-heading", ".hero-description", ".hero-buttons",
    ".stat-card", ".section-header", ".service-card",
    ".products-header", ".product-card", ".process-header",
    ".why-left-content", ".why-right-card", ".card",
    ".journey-content", ".footer-col"
  ].join(", ");

  const revealEls = document.querySelectorAll(revealSelector);
  revealEls.forEach(el => el.classList.add("reveal-up"));

  // Stagger siblings inside the same parent
  const groups = new Map();
  revealEls.forEach(el => {
    const parent = el.parentElement;
    if (!groups.has(parent)) groups.set(parent, []);
    groups.get(parent).push(el);
  });
  groups.forEach(list => {
    list.forEach((el, i) => { el.style.transitionDelay = `${i * 90}ms`; });
  });

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("in-view");
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });

  revealEls.forEach(el => revealObserver.observe(el));

  // Reveal whatever is already visible right on load (hero etc.)
  requestAnimationFrame(() => {
    revealEls.forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight) el.classList.add("in-view");
    });
  });

  /* =========================================================
     TIMELINE — center line fill + "revealed-live" items
     ========================================================= */
  const centerLine = document.getElementById("centerLine");
  const timelineWrapper = document.querySelector(".timeline-wrapper");
  const timelineItems = document.querySelectorAll(".timeline-item");

  if (centerLine && timelineWrapper) {
    const updateLine = () => {
      const rect = timelineWrapper.getBoundingClientRect();
      const vh = window.innerHeight;
      const total = rect.height;
      const visible = Math.min(Math.max(vh * 0.75 - rect.top, 0), total);
      const pct = total > 0 ? (visible / total) * 100 : 0;
      centerLine.style.height = pct + "%";
    };
    window.addEventListener("scroll", updateLine);
    window.addEventListener("resize", updateLine);
    updateLine();
  }

  const timelineObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("revealed-live");
        timelineObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });
  timelineItems.forEach(item => timelineObserver.observe(item));

  /* =========================================================
     PRODUCT CARD — sliding highlight track on hover
     ========================================================= */
  const slidingTrack = document.getElementById("slidingBgTrack");
  const productCards = document.querySelectorAll(".product-card");
  const productsContainer = document.querySelector(".products-container");

  if (slidingTrack && productsContainer && productCards.length) {
    const moveTrackTo = (card) => {
      const containerRect = productsContainer.getBoundingClientRect();
      const cardRect = card.getBoundingClientRect();
      slidingTrack.style.width = cardRect.width + "px";
      slidingTrack.style.height = cardRect.height + "px";
      slidingTrack.style.left = (cardRect.left - containerRect.left) + "px";
      slidingTrack.style.top = (cardRect.top - containerRect.top) + "px";
      slidingTrack.style.opacity = "0.04";
    };

    productCards.forEach(card => {
      card.addEventListener("mouseenter", () => {
        moveTrackTo(card);
        card.classList.add("hover-active");
      });
      card.addEventListener("mouseleave", () => {
        slidingTrack.style.opacity = "0";
        card.classList.remove("hover-active");
      });
    });
  }

  /* =========================================================
     CART DRAWER
     ========================================================= */
  const cartBtn = document.getElementById("cartBtn");
  const cartOverlay = document.getElementById("cartOverlay");
  const cartDrawer = document.getElementById("cartDrawer");
  const cartClose = document.getElementById("cartClose");
  const cartCount = document.getElementById("cartCount");
  const cartItemsCount = document.getElementById("cartItemsCount");
  const cartEmptyState = document.getElementById("cartEmptyState");
  const cartItemsList = document.getElementById("cartItemsList");
  const cartDrawerFooter = document.getElementById("cartDrawerFooter");
  const cartTotal = document.getElementById("cartTotal");
  const continueShoppingBtn = document.getElementById("continueShoppingBtn");

  let cart = loadCart(); // { id, title, price, icon }

  function loadCart() {
    try {
      const raw = localStorage.getItem("beparagon_cart");
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }
  function saveCart(cart) {
    try { localStorage.setItem("beparagon_cart", JSON.stringify(cart)); } catch (e) {}
  }

  function openCart() {
    cartOverlay.classList.add("open");
    cartDrawer.classList.add("open");
    document.body.style.overflow = "hidden";
  }
  function closeCart() {
    cartOverlay.classList.remove("open");
    cartDrawer.classList.remove("open");
    document.body.style.overflow = "";
  }

  cartBtn?.addEventListener("click", openCart);
  cartClose?.addEventListener("click", closeCart);
  cartOverlay?.addEventListener("click", closeCart);
  continueShoppingBtn?.addEventListener("click", (e) => { e.preventDefault(); closeCart(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeCart(); });

  function renderCart() {
    cartItemsList.innerHTML = "";

    const isEmpty = cart.length === 0;
    cartEmptyState.style.display = isEmpty ? "block" : "none";
    cartItemsList.classList.toggle("show", !isEmpty);
    cartDrawerFooter.classList.toggle("show", !isEmpty);

    cartItemsCount.textContent = `(${cart.length} item${cart.length === 1 ? "" : "s"})`;
    cartCount.textContent = cart.length;
    cartCount.classList.toggle("show", cart.length > 0);

    if (isEmpty) {
      cartTotal.textContent = "$0";
      return;
    }

    let total = 0;
    cart.forEach(item => {
      total += item.price;
      const line = document.createElement("div");
      line.className = "cart-line";
      line.innerHTML = `
        <div class="cart-line-icon"><i data-lucide="${item.icon}"></i></div>
        <div class="cart-line-info">
          <div class="cart-line-title">${item.title}</div>
          <div class="cart-line-price">$${item.price}</div>
        </div>
        <button class="cart-line-remove" data-id="${item.id}" aria-label="Remove item">
          <i data-lucide="x"></i>
        </button>`;
      cartItemsList.appendChild(line);
    });

    if (window.lucide) lucide.createIcons();

    cartItemsList.querySelectorAll(".cart-line-remove").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.dataset.id;
        cart = cart.filter(item => item.id !== id);
        saveCart(cart);
        document.querySelector(`.btn-cart[data-id="${id}"]`)?.classList.remove("added");
        renderCart();
      });
    });

    cartTotal.textContent = "$" + total;
  }

  /* Wire up every "Add to cart" button on product cards */
  document.querySelectorAll(".btn-cart").forEach((btn, index) => {
    const card = btn.closest(".product-card");
    const title = card?.querySelector(".product-title-text")?.textContent.trim() || "Product";
    const priceText = card?.querySelector(".product-price")?.textContent.trim() || "$0";
    const price = parseInt(priceText.replace(/[^0-9]/g, ""), 10) || 0;
    const icon = card?.querySelector(".product-icon-box i")?.getAttribute("data-lucide") || "package";
    const id = "p" + index;
    btn.dataset.id = id;
    if (cart.find(item => item.id === id)) btn.classList.add("added");

    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const exists = cart.find(item => item.id === id);
      if (exists) {
        cart = cart.filter(item => item.id !== id);
        btn.classList.remove("added");
      } else {
        cart.push({ id, title, price, icon });
        btn.classList.add("added");
      }
      saveCart(cart);
      renderCart();
    });
  });

  renderCart();

  /* =========================================================
     CHECKOUT MODAL — order summary, fake payment, success
     ========================================================= */
  const checkoutOverlay = document.getElementById("checkoutOverlay");
  const checkoutModal = document.getElementById("checkoutModal");
  const checkoutClose = document.getElementById("checkoutClose");
  const checkoutForm = document.getElementById("checkoutForm");
  const checkoutOrderSummary = document.getElementById("checkoutOrderSummary");
  const checkoutPayAmount = document.getElementById("checkoutPayAmount");
  const checkoutPayBtn = document.getElementById("checkoutPayBtn");
  const checkoutPaymentStep = document.getElementById("checkoutPaymentStep");
  const checkoutSuccessStep = document.getElementById("checkoutSuccessStep");
  const checkoutSuccessSummary = document.getElementById("checkoutSuccessSummary");
  const checkoutSuccessMessage = document.getElementById("checkoutSuccessMessage");
  const checkoutDoneBtn = document.getElementById("checkoutDoneBtn");
  const checkoutCardInput = document.getElementById("checkoutCard");
  const checkoutExpiryInput = document.getElementById("checkoutExpiry");
  const cartCheckoutBtn = document.querySelector(".cart-checkout-btn");

  function openCheckout() {
    if (!cart.length) return;
    let html = "";
    let total = 0;
    cart.forEach(item => {
      total += item.price;
      html += `<div class="checkout-order-line"><span>${item.title}</span><span class="price">$${item.price}</span></div>`;
    });
    html += `<div class="checkout-order-line total"><span>Total</span><span>$${total}</span></div>`;
    checkoutOrderSummary.innerHTML = html;
    checkoutPayAmount.textContent = "$" + total;

    checkoutPaymentStep.style.display = "block";
    checkoutSuccessStep.style.display = "none";
    if (checkoutForm) checkoutForm.reset();

    closeCart();
    checkoutOverlay.classList.add("open");
    checkoutModal.classList.add("open");
    document.body.style.overflow = "hidden";
  }

  function closeCheckout() {
    checkoutOverlay.classList.remove("open");
    checkoutModal.classList.remove("open");
    document.body.style.overflow = "";
  }

  if (cartCheckoutBtn) cartCheckoutBtn.addEventListener("click", openCheckout);
  if (checkoutClose) checkoutClose.addEventListener("click", closeCheckout);
  if (checkoutOverlay) checkoutOverlay.addEventListener("click", closeCheckout);
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeCheckout(); });

  if (checkoutCardInput) {
    checkoutCardInput.addEventListener("input", () => {
      let digits = checkoutCardInput.value.replace(/\D/g, "").slice(0, 16);
      checkoutCardInput.value = digits.replace(/(.{4})/g, "$1 ").trim();
    });
  }
  if (checkoutExpiryInput) {
    checkoutExpiryInput.addEventListener("input", () => {
      let digits = checkoutExpiryInput.value.replace(/\D/g, "").slice(0, 4);
      if (digits.length >= 3) digits = digits.slice(0, 2) + "/" + digits.slice(2);
      checkoutExpiryInput.value = digits;
    });
  }

  if (checkoutForm) {
    checkoutForm.addEventListener("submit", (e) => {
      e.preventDefault();
      checkoutPayBtn.disabled = true;
      const originalText = checkoutPayBtn.innerHTML;
      checkoutPayBtn.innerHTML = "Processing...";

      setTimeout(() => {
        const name = document.getElementById("checkoutName").value || "Customer";
        checkoutSuccessMessage.textContent = `Thank you, ${name}! A confirmation has been sent to your email.`;
        checkoutSuccessSummary.innerHTML = checkoutOrderSummary.innerHTML;

        checkoutPaymentStep.style.display = "none";
        checkoutSuccessStep.style.display = "block";

        checkoutPayBtn.disabled = false;
        checkoutPayBtn.innerHTML = originalText;

        cart = [];
        saveCart(cart);
        renderCart();
      }, 1800);
    });
  }

  if (checkoutDoneBtn) {
    checkoutDoneBtn.addEventListener("click", () => { closeCheckout(); });
  }

});
