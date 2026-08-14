 document.addEventListener("DOMContentLoaded", () => {
            // Initialize Lucide Icons
            if (typeof lucide !== 'undefined') {
                lucide.createIcons();
            }

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
       SCROLL / LOAD REVEAL — elements rise smoothly from bottom
       to top, staggered, using the .reveal-up class already
       defined in contact.css
       ========================================================= */
    (function initRevealUp() {
        const revealEls = document.querySelectorAll(".reveal-up");
        if (!revealEls.length) return;

        // Stagger elements that share the same parent so groups
        // (e.g. footer columns) rise one after another.
        const groups = new Map();
        revealEls.forEach((el) => {
            const parent = el.parentElement;
            if (!groups.has(parent)) groups.set(parent, []);
            groups.get(parent).push(el);
        });
        groups.forEach((els) => {
            els.forEach((el, i) => {
                el.style.transitionDelay = (i * 0.12) + "s";
            });
        });

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("in-view");
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.15, rootMargin: "0px 0px -40px 0px" });

        revealEls.forEach((el) => observer.observe(el));
    })();

    /* =========================================================
       CMS CONTACT INFO — overrides email/phone/address if the
       admin panel has saved custom values
       ========================================================= */
    (function applyCustomContactInfo() {
        let data = {};
        try {
            const raw = localStorage.getItem("cms_contact");
            data = raw ? JSON.parse(raw) : {};
        } catch (e) {}

        const emailEl = document.getElementById("contactEmailDisplay");
        if (data.email && emailEl) {
            emailEl.textContent = data.email;
            emailEl.href = "https://mail.google.com/mail/?view=cm&fs=1&to=" + encodeURIComponent(data.email);
        }

        const phoneItem = document.getElementById("contactPhoneItem");
        const phoneDisplay = document.getElementById("contactPhoneDisplay");
        if (data.phone && phoneItem && phoneDisplay) {
            phoneDisplay.textContent = data.phone;
            phoneItem.style.display = "";
        }

        const addressEl = document.getElementById("contactAddressDisplay");
        if (data.address && addressEl) {
            addressEl.textContent = data.address;
        }
    })();


    // 2. Form Submission & Validation Handling
    const form = document.querySelector(".contact-form-container form");
    const messageInput = document.getElementById("message");
    const validationTooltip = document.querySelector(".validation-tooltip");

    if (form) {
        form.addEventListener("submit", (e) => {
            e.preventDefault(); // Real submit ko rokne ke liye (Testing purpose)

            // Basic Validation Check
            if (!messageInput.value.trim()) {
                if (validationTooltip) {
                    validationTooltip.style.opacity = "1";
                    validationTooltip.style.transform = "translateY(0)";
                }
                return;
            }

            // Form Data Get Karein
            const formData = {
                name: document.getElementById("name").value,
                email: document.getElementById("email").value,
                phone: document.getElementById("phone").value,
                message: messageInput.value
            };

            // Success Visual Feedback
            const submitBtn = document.querySelector(".submit-btn");
            const originalText = submitBtn.innerHTML;
            
            submitBtn.innerHTML = 'Sending... <i class="fa-solid fa-spinner fa-spin"></i>';
            submitBtn.style.pointerEvents = "none";

            // 2 Seconds ka fake delay (Yahan aap apna Formspree ya EmailJS API laga sakte hain)
            setTimeout(() => {
                // Save this message so the admin can see and reply to it
                try {
                    const messages = JSON.parse(localStorage.getItem("cms_messages") || "[]");
                    messages.push({
                        id: "msg_" + Date.now(),
                        name: formData.name,
                        email: formData.email,
                        phone: formData.phone,
                        message: formData.message,
                        status: "new",
                        date: new Date().toISOString()
                    });
                    localStorage.setItem("cms_messages", JSON.stringify(messages));
                } catch (err) {}

                alert(`Thank you, ${formData.name}! Your message has been sent successfully.`);
                form.reset();
                submitBtn.innerHTML = originalText;
                submitBtn.style.pointerEvents = "auto";
            }, 2000);
        });
    }

    // Hide validation tooltip when user starts typing
    if (messageInput && validationTooltip) {
        messageInput.addEventListener("input", () => {
            if (messageInput.value.trim() !== "") {
                validationTooltip.style.opacity = "0";
                validationTooltip.style.transform = "translateY(8px)";
            }
        });
    }

    // 3. Simple Nav-Item Active State Switcher
    const navItems = document.querySelectorAll(".nav-item");
    navItems.forEach(item => {
        item.addEventListener("click", function() {
            navItems.forEach(nav => nav.classList.remove("active"));
            this.classList.add("active");
        });
    });

   /* =========================================================
     CART DRAWER — identical behavior across every page
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

  /* Wire up "Add to cart" buttons if this page has any product cards */
  document.querySelectorAll(".btn-cart").forEach((btn, index) => {
    const card = btn.closest(".product-card");
    const title = card?.querySelector(".product-title-text")?.textContent.trim() || "Product";
    const priceText = card?.querySelector(".product-price")?.textContent.trim() || "$0";
    const price = parseInt(priceText.replace(/[^0-9]/g, ""), 10) || 0;
    const icon = card?.querySelector(".product-icon-box i")?.getAttribute("data-lucide") || "package";
    const id = "p" + index;
    btn.dataset.id = id;

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

        // Save this order so the admin can review, approve, and email the customer
        try {
          const orders = JSON.parse(localStorage.getItem("cms_orders") || "[]");
          orders.push({
            id: "order_" + Date.now(),
            customerName: name,
            customerEmail: document.getElementById("checkoutEmail").value || "",
            items: cart.map(function(i) { return { title: i.title, price: i.price }; }),
            total: cart.reduce(function(sum, i) { return sum + i.price; }, 0),
            status: "pending",
            date: new Date().toISOString()
          });
          localStorage.setItem("cms_orders", JSON.stringify(orders));
        } catch (err) {}

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










