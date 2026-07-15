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
               SCROLL / LOAD REVEAL — elements rise smoothly from
               bottom to top, staggered, using the .reveal-up class
               already defined in service.css
               ========================================================= */
            (function initRevealUp() {
                const revealEls = document.querySelectorAll(".reveal-up");
                if (!revealEls.length) return;

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
               CART DRAWER — standardized, shared with every page,
               with items persisted across pages via localStorage
               ========================================================= */
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

            let cart = loadCart();

            const cartBtn = document.getElementById("cartBtn");
            const cartClose = document.getElementById("cartClose");
            const cartDrawer = document.getElementById("cartDrawer");
            const cartOverlay = document.getElementById("cartOverlay");
            const cartCount = document.getElementById("cartCount");
            const cartItemsCount = document.getElementById("cartItemsCount");
            const cartEmptyState = document.getElementById("cartEmptyState");
            const cartItemsList = document.getElementById("cartItemsList");
            const cartDrawerFooter = document.getElementById("cartDrawerFooter");
            const cartTotal = document.getElementById("cartTotal");
            const continueShoppingBtn = document.getElementById("continueShoppingBtn");

            function openCart() {
                cartDrawer.classList.add("open");
                cartOverlay.classList.add("open");
                document.body.style.overflow = "hidden";
            }

            function closeCart() {
                cartDrawer.classList.remove("open");
                cartOverlay.classList.remove("open");
                document.body.style.overflow = "";
            }

            if (cartBtn) cartBtn.addEventListener("click", openCart);
            if (cartClose) cartClose.addEventListener("click", closeCart);
            if (cartOverlay) cartOverlay.addEventListener("click", closeCart);
            if (continueShoppingBtn) continueShoppingBtn.addEventListener("click", (e) => { e.preventDefault(); closeCart(); });

            document.addEventListener("keydown", (e) => {
                if (e.key === "Escape") closeCart();
            });

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
                        <div class="cart-line-icon"><i data-lucide="${item.icon || 'package'}"></i></div>
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
                        renderCart();
                    });
                });

                cartTotal.textContent = "$" + total;
            }

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

            // Card Interactivity Handler
            const serviceCards = document.querySelectorAll(".service-card");
            serviceCards.forEach(card => {
                card.addEventListener("click", function(e) {
                    if (e.target.closest(".learn-more")) return;

                    // Sab cards se active attributes clean karein
                    serviceCards.forEach(c => {
                        c.classList.remove("active-intent");
                        const title = c.querySelector(".card-title");
                        if (title) title.classList.remove("accent-title");
                    });

                    // Current card ko high-contrast active state dein
                    this.classList.add("active-intent");
                    const currentTitle = this.querySelector(".card-title");
                    if (currentTitle) currentTitle.classList.add("accent-title");
                });
            });

            // CTA Button Link
            const ctaBtn = document.querySelector(".cta-button");
            if (ctaBtn) {
                ctaBtn.addEventListener("click", () => {
                    window.location.href = "contact.html";
                });
            }
        });
    