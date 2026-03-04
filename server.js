require("dotenv").config();

const express = require("express");
const session = require("express-session");
const mysql   = require("mysql2");
const path    = require("path");

const app = express();

/* =====================
   DATABASE
   ===================== */

const db = mysql.createConnection({
    host:     process.env.DB_HOST     || "localhost",
    user:     process.env.DB_USER     || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME     || "lostfound_db"
});

db.connect(err => {
    if (err) { console.error("DB ERROR:", err.message); process.exit(1); }
    console.log("MySQL Connected");
});

/* =====================
   MIDDLEWARE
   ===================== */

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret:            process.env.SESSION_SECRET || "lostfoundsecret",
    resave:            false,
    saveUninitialized: false,
    cookie:            { httpOnly: true, maxAge: 1000 * 60 * 60 * 2 }
}));
app.use(express.static(path.join(__dirname, "public")));

/* =====================
   SECURITY HELPERS
   ===================== */

function escapeHtml(str) {
    if (typeof str !== "string") return str;
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function sanitize(obj) {
    const out = {};
    for (const k in obj) out[k] = escapeHtml(String(obj[k] || "").trim());
    return out;
}

function requireLogin(req, res, next) {
    if (!req.session.user) return res.status(401).json({ message: "Login required" });
    next();
}

/* =====================
   ROOT
   ===================== */

app.get("/", (req, res) => res.redirect("/login.html"));

/* =====================
   AUTH
   ===================== */

app.post("/api/signup", (req, res) => {
    const { email, password } = sanitize(req.body);

    if (!email || !password)
        return res.status(400).json({ message: "All fields are required" });

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
        return res.status(400).json({ message: "Invalid email format" });

    if (password.length < 6)
        return res.status(400).json({ message: "Password must be at least 6 characters" });

    db.query("SELECT id FROM users WHERE email = ?", [email], (err, rows) => {
        if (err) return res.status(500).json({ message: "Server error" });
        if (rows.length) return res.status(400).json({ message: "Email already registered" });

        db.query("INSERT INTO users (email, password) VALUES (?, ?)", [email, password], err => {
            if (err) return res.status(500).json({ message: "Server error" });
            res.json({ message: "Signup successful" });
        });
    });
});

app.post("/api/login", (req, res) => {
    const { email, password } = sanitize(req.body);

    if (!email || !password)
        return res.status(400).json({ message: "All fields are required" });

    db.query("SELECT * FROM users WHERE email = ? AND password = ?", [email, password], (err, rows) => {
        if (err) return res.status(500).json({ message: "Server error" });
        if (!rows.length) return res.status(401).json({ message: "Invalid email or password" });

        req.session.user = { id: rows[0].id, email: rows[0].email };
        res.json({ message: "Login success" });
    });
});

app.get("/api/logout", (req, res) => {
    req.session.destroy(() => res.json({ message: "Logged out" }));
});

app.get("/api/me", (req, res) => {
    if (!req.session.user) return res.status(401).json({ message: "Not logged in" });
    res.json({ user: req.session.user });
});

/* =====================
   ITEMS
   NOTE: /lost and /found MUST be before /:id
   ===================== */

app.get("/api/items/lost", requireLogin, (req, res) => {
    db.query(
        "SELECT * FROM items WHERE status = 'Lost' ORDER BY created_at DESC",
        (err, rows) => {
            if (err) { console.error(err); return res.status(500).json({ message: "Server error" }); }
            res.json(rows);
        }
    );
});

app.get("/api/items/found", requireLogin, (req, res) => {
    db.query(
        "SELECT * FROM items WHERE status = 'Found' ORDER BY created_at DESC",
        (err, rows) => {
            if (err) { console.error(err); return res.status(500).json({ message: "Server error" }); }
            res.json(rows);
        }
    );
});

app.get("/api/items", requireLogin, (req, res) => {
    db.query(
        "SELECT * FROM items ORDER BY created_at DESC",
        (err, rows) => {
            if (err) { console.error(err); return res.status(500).json({ message: "Server error" }); }
            res.json(rows);
        }
    );
});

app.get("/api/items/:id", requireLogin, (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });

    db.query("SELECT * FROM items WHERE id = ?", [id], (err, rows) => {
        if (err) return res.status(500).json({ message: "Server error" });
        if (!rows.length) return res.status(404).json({ message: "Item not found" });
        res.json(rows[0]);
    });
});

// POST — submit new item
app.post("/api/items", requireLogin, (req, res) => {
    const raw = req.body;

    // Required fields
    const required = ["title", "description", "location", "date", "contact", "category", "status"];
    for (const field of required) {
        if (!raw[field] || String(raw[field]).trim() === "")
            return res.status(400).json({ message: `Field '${field}' is required` });
    }

    if (!["Lost", "Found"].includes(raw.status))
        return res.status(400).json({ message: "Status must be Lost or Found" });

    if (raw.title.length > 255)
        return res.status(400).json({ message: "Title is too long" });

    // Phone number validation — digits only, 10 to 15 characters
    const phoneClean = String(raw.contact).replace(/[\s\-]/g, "");
    if (!/^\+?[0-9]{10,15}$/.test(phoneClean))
        return res.status(400).json({ message: "Invalid phone number. Must be 10–15 digits." });

    // Email validation — optional, validate only if provided
    const rawEmail = String(raw.email || "").trim();
    if (rawEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(rawEmail))
        return res.status(400).json({ message: "Invalid contact email format" });

    const { title, description, location, date, contact, category, status } = sanitize(raw);
    const contactEmail = rawEmail ? escapeHtml(rawEmail) : null; // null if not provided
    const user_id      = req.session.user.id;

    db.query(
        "INSERT INTO items (title, description, location, date, contact, email, category, status, user_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [title, description, location, date, contact, contactEmail, category, status, user_id],
        err => {
            if (err) { console.error(err); return res.status(500).json({ message: "Server error" }); }
            res.json({ message: "Item submitted" });
        }
    );
});

// PUT — mark as claimed
app.put("/api/items/:id", requireLogin, (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });

    db.query("UPDATE items SET status = 'Claimed' WHERE id = ?", [id], (err, result) => {
        if (err) return res.status(500).json({ message: "Server error" });
        if (result.affectedRows === 0) return res.status(404).json({ message: "Item not found" });
        res.json({ message: "Item marked as Claimed" });
    });
});

// DELETE — only creator can delete
app.delete("/api/items/:id", requireLogin, (req, res) => {
    const id      = parseInt(req.params.id);
    const user_id = req.session.user.id;

    if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });

    db.query("SELECT user_id FROM items WHERE id = ?", [id], (err, rows) => {
        if (err) return res.status(500).json({ message: "Server error" });
        if (!rows.length) return res.status(404).json({ message: "Item not found" });

        if (rows[0].user_id !== user_id)
            return res.status(403).json({ message: "You can only delete your own reports" });

        db.query("DELETE FROM items WHERE id = ?", [id], err => {
            if (err) return res.status(500).json({ message: "Server error" });
            res.json({ message: "Item deleted" });
        });
    });
});

/* =====================
   404 & ERROR HANDLERS
   ===================== */

app.use((req, res) => {
    res.status(404).json({ message: "Route not found" });
});

app.use((err, req, res, next) => {
    console.error("Unhandled error:", err.stack);
    res.status(500).json({ message: "Internal server error" });
});

/* =====================
   START
   ===================== */

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running → http://localhost:${PORT}`));