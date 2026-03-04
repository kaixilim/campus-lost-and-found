/* =====================
   COMMON FETCH HELPER
   ===================== */

async function send(url, data = {}, method = "POST") {
    const options = { method, headers: { "Content-Type": "application/json" } };
    if (method !== "GET") options.body = JSON.stringify(data);
    const res    = await fetch(url, options);
    const result = await res.json();
    if (result.message) alert(result.message);
    return result;
}

/* =====================
   CURRENT USER
   ===================== */

let currentUser = null;

async function checkAuth() {
    try {
        const res = await fetch("/api/me");
        if (res.status === 401) { location.href = "login.html"; return; }
        const data = await res.json();
        currentUser = data.user;
    } catch {
        location.href = "login.html";
    }
}

/* =====================
   SIGNUP
   ===================== */

const signupForm = document.querySelector("#signupForm");
if (signupForm) {
    signupForm.addEventListener("submit", async e => {
        e.preventDefault();
        const email    = signupForm.querySelector("[name=email]").value.trim();
        const password = signupForm.querySelector("[name=password]").value;

        if (!email || !password)
            return alert("All fields are required");
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
            return alert("Invalid email format");
        if (password.length < 6)
            return alert("Password must be at least 6 characters");

        const r = await send("/api/signup", { email, password });
        if (r.message === "Signup successful") location.href = "login.html";
    });
}

/* =====================
   LOGIN
   ===================== */

const loginForm = document.querySelector("#loginForm");
if (loginForm) {
    loginForm.addEventListener("submit", async e => {
        e.preventDefault();
        const data = Object.fromEntries(new FormData(loginForm));
        const r    = await send("/api/login", data);
        if (r.message === "Login success") location.href = "homepage.html";
    });
}

/* =====================
   LOGOUT
   ===================== */

function logout() {
    fetch("/api/logout").then(() => location.href = "login.html");
}

/* =====================
   SUBMIT ITEM FORM
   ===================== */

const itemForm = document.querySelector("#itemForm");
if (itemForm) {
    itemForm.addEventListener("submit", async e => {
        e.preventDefault();
        const data = Object.fromEntries(new FormData(itemForm));

        // Required field check
        const required = ["title", "description", "location", "date", "contact", "category", "status"];
        for (const f of required) {
            if (!data[f] || data[f].trim() === "")
                return alert(`Field '${f}' is required`);
        }

        // Phone number validation — 10 to 15 digits, optional leading +
        const phoneClean = data.contact.replace(/[\s\-]/g, "");
        if (!/^\+?[0-9]{10,15}$/.test(phoneClean))
            return alert("Invalid phone number. Please enter 10–15 digits (e.g. 0123456789).");

        // Email validation — optional, only validate if filled in
        const emailVal = (data.email || "").trim();
        if (emailVal && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal))
            return alert("Invalid email format. Please enter a valid email or leave it empty.");

        const r = await send("/api/items", data);
        if (r.message === "Item submitted") location.href = "homepage.html";
    });
}

/* =====================
   LOAD & DISPLAY ITEMS
   ===================== */

async function loadItems() {
    const container = document.querySelector("#items");
    if (!container) return;

    const status = container.dataset.status;
    let endpoint;
    if (status === "Lost")       endpoint = "/api/items/lost";
    else if (status === "Found") endpoint = "/api/items/found";
    else                         endpoint = "/api/items";

    let res;
    try {
        res = await fetch(endpoint);
    } catch {
        container.innerHTML = "<p class='no-items'>Could not connect to server.</p>";
        return;
    }

    if (res.status === 401) { location.href = "login.html"; return; }

    let data = await res.json();

    // Client-side filtering
    const keyword  = (document.querySelector("#searchInput")?.value   || "").toLowerCase().trim();
    const category = (document.querySelector("#categoryFilter")?.value || "").trim();

    if (keyword) {
        data = data.filter(i =>
            (i.title       || "").toLowerCase().includes(keyword) ||
            (i.description || "").toLowerCase().includes(keyword) ||
            (i.location    || "").toLowerCase().includes(keyword)
        );
    }
    if (category) {
        data = data.filter(i => i.category === category);
    }

    container.innerHTML = "";

    if (!data.length) {
        container.innerHTML = "<p class='no-items'>No items found.</p>";
        return;
    }

    data.forEach(i => {
        const dateStr  = i.date ? new Date(i.date).toLocaleDateString() : "N/A";
        const emailRow = i.email
            ? `<p><b>✉️ Email:</b> ${i.email}</p>`
            : "";

        // Delete button — active only for the creator
        const isOwner   = currentUser && i.user_id === currentUser.id;
        const deleteBtn = isOwner
            ? `<button class="btn-delete" onclick="deleteItem(${i.id})">🗑 Delete</button>`
            : `<button class="btn-delete btn-disabled" disabled title="Only the reporter can delete this">🗑 Delete</button>`;

        container.innerHTML += `
        <div class="item-card">
            <div class="item-status status-${(i.status || "").toLowerCase()}">${i.status}</div>
            <h3>${i.title}</h3>
            <p>${i.description}</p>
            <p><b>📍 Location:</b> ${i.location}</p>
            <p><b>🏷️ Category:</b> ${i.category}</p>
            <p><b>📅 Date:</b> ${dateStr}</p>
            <p><b>📞 Contact:</b> ${i.contact}</p>
            ${emailRow}
            <div class="item-actions">
                <button class="btn-claim" onclick="claimItem(${i.id})">✔ Claim</button>
                ${deleteBtn}
            </div>
        </div>`;
    });
}

function loadLostItems()  { loadItems(); }
function loadFoundItems() { loadItems(); }

/* =====================
   CLAIM / DELETE
   ===================== */

function claimItem(id) {
    if (!confirm("Mark this item as Claimed?")) return;
    fetch("/api/items/" + id, { method: "PUT" })
        .then(r => r.json())
        .then(r => { alert(r.message); loadItems(); });
}

function deleteItem(id) {
    if (!confirm("Delete this item? This cannot be undone.")) return;
    fetch("/api/items/" + id, { method: "DELETE" })
        .then(r => r.json())
        .then(r => { alert(r.message); loadItems(); });
}

function updateItem(id) { claimItem(id); }
function removeItem(id) { deleteItem(id); }

/* =====================
   AUTO INIT
   ===================== */

document.addEventListener("DOMContentLoaded", async () => {
    const container = document.querySelector("#items");
    if (container) {
        await checkAuth();
        loadItems();

        document.querySelector("#searchInput")   ?.addEventListener("input",  loadItems);
        document.querySelector("#categoryFilter") ?.addEventListener("change", loadItems);
    }
});