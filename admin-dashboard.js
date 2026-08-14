document.addEventListener("DOMContentLoaded", () => {

  /* =========================================================
     AUTH GUARD — bounce back to login if not signed in
     ========================================================= */
  if (sessionStorage.getItem("cms_auth") !== "true") {
    window.location.href = "admin-login.html";
    return;
  }

  if (window.lucide) lucide.createIcons();

  document.getElementById("adminLogoutBtn").addEventListener("click", () => {
    sessionStorage.removeItem("cms_auth");
    window.location.href = "admin-login.html";
  });

  /* =========================================================
     TAB SWITCHING
     ========================================================= */
  const tabButtons = document.querySelectorAll(".admin-tab-btn");
  const tabPanels = document.querySelectorAll(".admin-tab-panel");

  tabButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      tabButtons.forEach((b) => b.classList.remove("active"));
      tabPanels.forEach((p) => p.classList.remove("active"));
      btn.classList.add("active");
      document.getElementById("tab-" + btn.dataset.tab).classList.add("active");
    });
  });

  /* =========================================================
     TOAST
     ========================================================= */
  const toast = document.getElementById("adminToast");
  function showToast(message) {
    toast.textContent = message;
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 1800);
  }

  /* =========================================================
     STORAGE HELPERS
     ========================================================= */
  function loadList(key) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }
  function saveList(key, list) {
    try { localStorage.setItem(key, JSON.stringify(list)); } catch (e) {}
  }

  const deleteIconSvg = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';

  /* =========================================================
     ORDERS — placed at checkout, awaiting admin approval
     ========================================================= */
  const ORDERS_KEY = "cms_orders";
  const orderList = document.getElementById("orderList");

  function renderOrders() {
    const items = loadList(ORDERS_KEY);
    orderList.innerHTML = "";
    if (!items.length) {
      orderList.innerHTML = '<div class="admin-list-empty">No orders yet.</div>';
      return;
    }
    // Newest first
    items.slice().reverse().forEach((order) => {
      const itemsText = (order.items || []).map((i) => `${i.title} ($${i.price})`).join(", ");
      const dateText = order.date ? new Date(order.date).toLocaleString() : "";
      const row = document.createElement("div");
      row.className = "admin-list-item";
      row.innerHTML = `
        <div class="admin-list-item-info">
          <h4>${order.customerName || "Customer"} — $${order.total}
            <span class="admin-status-badge ${order.status}">${order.status}</span>
          </h4>
          <div class="admin-item-meta">${order.customerEmail || "no email provided"}</div>
          <p class="admin-order-items">${itemsText}</p>
          <p style="color:#4a5268; font-size:11px;">${dateText}</p>
        </div>
        <div class="admin-order-actions">
          ${order.status === "pending"
            ? `<button class="admin-approve-btn" data-id="${order.id}">Approve &amp; Notify</button>`
            : ""}
          <button class="admin-delete-btn" data-delete-id="${order.id}" aria-label="Delete order">${deleteIconSvg}</button>
        </div>
      `;
      orderList.appendChild(row);
    });

    orderList.querySelectorAll(".admin-approve-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const orders = loadList(ORDERS_KEY);
        const order = orders.find((o) => o.id === btn.dataset.id);
        if (!order) return;
        order.status = "confirmed";
        saveList(ORDERS_KEY, orders);
        renderOrders();
        showToast("Order confirmed");

        // Open a pre-filled confirmation email to the customer in Gmail
        if (order.customerEmail) {
          const subject = encodeURIComponent("Your order is confirmed!");
          const body = encodeURIComponent(
            `Hi ${order.customerName || "there"},\n\n` +
            `Great news — your order has been confirmed!\n\n` +
            `Order summary:\n${(order.items || []).map((i) => `- ${i.title}: $${i.price}`).join("\n")}\n` +
            `Total: $${order.total}\n\n` +
            `Thank you for shopping with Apex Marketing Systems LLC.\n\n` +
            `Best,\nApex Marketing Systems LLC`
          );
          const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(order.customerEmail)}&su=${subject}&body=${body}`;
          window.open(gmailUrl, "_blank");
        }
      });
    });

    orderList.querySelectorAll("[data-delete-id]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const remaining = loadList(ORDERS_KEY).filter((o) => o.id !== btn.dataset.deleteId);
        saveList(ORDERS_KEY, remaining);
        renderOrders();
        showToast("Order removed");
      });
    });
  }

  renderOrders();

  /* =========================================================
     MESSAGES — submitted from the Contact page form
     ========================================================= */
  const MESSAGES_KEY = "cms_messages";
  const messageList = document.getElementById("messageList");

  function renderMessages() {
    const items = loadList(MESSAGES_KEY);
    messageList.innerHTML = "";
    if (!items.length) {
      messageList.innerHTML = '<div class="admin-list-empty">No messages yet.</div>';
      return;
    }
    items.slice().reverse().forEach((msg) => {
      const dateText = msg.date ? new Date(msg.date).toLocaleString() : "";
      const row = document.createElement("div");
      row.className = "admin-list-item";
      row.innerHTML = `
        <div class="admin-list-item-info">
          <h4>${msg.name || "Someone"}
            <span class="admin-status-badge ${msg.status === "replied" ? "confirmed" : "pending"}">${msg.status}</span>
          </h4>
          <div class="admin-item-meta">${msg.email || ""}${msg.phone ? " · " + msg.phone : ""}</div>
          <p>${msg.message}</p>
          <p style="color:#4a5268; font-size:11px; margin-top:4px;">${dateText}</p>
        </div>
        <div class="admin-order-actions">
          <button class="admin-approve-btn" data-reply-id="${msg.id}">Reply</button>
          <button class="admin-delete-btn" data-delete-msg-id="${msg.id}" aria-label="Delete message">${deleteIconSvg}</button>
        </div>
      `;
      messageList.appendChild(row);
    });

    messageList.querySelectorAll("[data-reply-id]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const messages = loadList(MESSAGES_KEY);
        const msg = messages.find((m) => m.id === btn.dataset.replyId);
        if (!msg) return;

        msg.status = "replied";
        saveList(MESSAGES_KEY, messages);
        renderMessages();
        showToast("Marked as replied");

        if (msg.email) {
          const subject = encodeURIComponent("Re: Your message to Apex Marketing Systems LLC");
          const body = encodeURIComponent(
            `Hi ${msg.name || "there"},\n\nThank you for reaching out! ...\n\n` +
            `Your message:\n"${msg.message}"\n\n` +
            `Best,\nApex Marketing Systems LLC`
          );
          const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(msg.email)}&su=${subject}&body=${body}`;
          window.open(gmailUrl, "_blank");
        }
      });
    });

    messageList.querySelectorAll("[data-delete-msg-id]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const remaining = loadList(MESSAGES_KEY).filter((m) => m.id !== btn.dataset.deleteMsgId);
        saveList(MESSAGES_KEY, remaining);
        renderMessages();
        showToast("Message removed");
      });
    });
  }

  renderMessages();

  /* =========================================================
     SERVICES
     ========================================================= */
  const SERVICES_KEY = "cms_services";
  const serviceForm = document.getElementById("serviceForm");
  const serviceList = document.getElementById("serviceList");

  function renderServices() {
    const items = loadList(SERVICES_KEY);
    serviceList.innerHTML = "";
    if (!items.length) {
      serviceList.innerHTML = '<div class="admin-list-empty">No custom services added yet.</div>';
      return;
    }
    items.forEach((item) => {
      const row = document.createElement("div");
      row.className = "admin-list-item";
      row.innerHTML = `
        <div class="admin-list-item-info">
          <h4>${item.title}</h4>
          <div class="admin-item-meta">${item.icon}</div>
          <p>${item.description}</p>
        </div>
        <button class="admin-delete-btn" data-id="${item.id}" aria-label="Delete">${deleteIconSvg}</button>
      `;
      serviceList.appendChild(row);
    });
    serviceList.querySelectorAll(".admin-delete-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const remaining = loadList(SERVICES_KEY).filter((i) => i.id !== btn.dataset.id);
        saveList(SERVICES_KEY, remaining);
        renderServices();
        showToast("Service removed");
      });
    });
  }

  serviceForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const items = loadList(SERVICES_KEY);
    items.push({
      id: "svc_" + Date.now(),
      title: document.getElementById("serviceTitle").value.trim(),
      icon: document.getElementById("serviceIcon").value,
      description: document.getElementById("serviceDescription").value.trim()
    });
    saveList(SERVICES_KEY, items);
    serviceForm.reset();
    renderServices();
    showToast("Service added — check the Services page");
  });

  renderServices();

  /* =========================================================
     SHOP PRODUCTS
     ========================================================= */
  const PRODUCTS_KEY = "cms_products";
  const productForm = document.getElementById("productForm");
  const productList = document.getElementById("productList");

  function renderProducts() {
    const items = loadList(PRODUCTS_KEY);
    productList.innerHTML = "";
    if (!items.length) {
      productList.innerHTML = '<div class="admin-list-empty">No custom products added yet.</div>';
      return;
    }
    items.forEach((item) => {
      const row = document.createElement("div");
      row.className = "admin-list-item";
      row.innerHTML = `
        <div class="admin-list-item-info">
          <h4>${item.title} — $${item.price}</h4>
          <div class="admin-item-meta">${item.category}</div>
          <p>${item.description}</p>
        </div>
        <button class="admin-delete-btn" data-id="${item.id}" aria-label="Delete">${deleteIconSvg}</button>
      `;
      productList.appendChild(row);
    });
    productList.querySelectorAll(".admin-delete-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const remaining = loadList(PRODUCTS_KEY).filter((i) => i.id !== btn.dataset.id);
        saveList(PRODUCTS_KEY, remaining);
        renderProducts();
        showToast("Product removed");
      });
    });
  }

  productForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const items = loadList(PRODUCTS_KEY);
    items.push({
      id: "prod_" + Date.now(),
      title: document.getElementById("productTitle").value.trim(),
      category: document.getElementById("productCategory").value.trim().toUpperCase(),
      price: parseInt(document.getElementById("productPrice").value, 10) || 0,
      description: document.getElementById("productDescription").value.trim()
    });
    saveList(PRODUCTS_KEY, items);
    productForm.reset();
    renderProducts();
    showToast("Product added — check the Shop page");
  });

  renderProducts();

  /* =========================================================
     LEADERSHIP TEAM
     ========================================================= */
  const TEAM_KEY = "cms_team";
  const teamForm = document.getElementById("teamForm");
  const teamList = document.getElementById("teamList");

  function initials(name) {
    return name.split(" ").filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join("");
  }

  function renderTeam() {
    const items = loadList(TEAM_KEY);
    teamList.innerHTML = "";
    if (!items.length) {
      teamList.innerHTML = '<div class="admin-list-empty">No team members added yet.</div>';
      return;
    }
    items.forEach((item) => {
      const row = document.createElement("div");
      row.className = "admin-list-item";
      row.innerHTML = `
        <div class="admin-list-item-info">
          <h4>${item.name}</h4>
          <div class="admin-item-meta">${item.role}</div>
          <p>${item.description}</p>
        </div>
        <button class="admin-delete-btn" data-id="${item.id}" aria-label="Delete">${deleteIconSvg}</button>
      `;
      teamList.appendChild(row);
    });
    teamList.querySelectorAll(".admin-delete-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const remaining = loadList(TEAM_KEY).filter((i) => i.id !== btn.dataset.id);
        saveList(TEAM_KEY, remaining);
        renderTeam();
        showToast("Team member removed");
      });
    });
  }

  teamForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const items = loadList(TEAM_KEY);
    const name = document.getElementById("teamName").value.trim();
    items.push({
      id: "team_" + Date.now(),
      name: name,
      role: document.getElementById("teamRole").value.trim(),
      description: document.getElementById("teamDescription").value.trim(),
      initials: initials(name)
    });
    saveList(TEAM_KEY, items);
    teamForm.reset();
    renderTeam();
    showToast("Team member added — check the About page");
  });

  renderTeam();

  /* =========================================================
     CONTACT INFO
     ========================================================= */
  const CONTACT_KEY = "cms_contact";
  const contactForm = document.getElementById("contactInfoForm");

  function loadContact() {
    try {
      const raw = localStorage.getItem(CONTACT_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      return {};
    }
  }

  const existingContact = loadContact();
  if (existingContact.email) document.getElementById("contactEmail").value = existingContact.email;
  if (existingContact.phone) document.getElementById("contactPhone").value = existingContact.phone;
  if (existingContact.address) document.getElementById("contactAddress").value = existingContact.address;

  contactForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const data = {
      email: document.getElementById("contactEmail").value.trim(),
      phone: document.getElementById("contactPhone").value.trim(),
      address: document.getElementById("contactAddress").value.trim()
    };
    try { localStorage.setItem(CONTACT_KEY, JSON.stringify(data)); } catch (e) {}
    showToast("Contact info saved — check the Contact page");
  });

});
