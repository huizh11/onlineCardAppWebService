// ===============================
// Required modules
// ===============================
const express = require("express");
const mysql = require("mysql2/promise");
const cors = require("cors");
const jwt = require("jsonwebtoken");
require("dotenv").config();

// ===============================
// App setup
// ===============================
const app = express();
app.use(express.json());

const port = process.env.PORT || 3000;

// ===============================
// CORS configuration
// ===============================
const allowedOrigins = [
    "http://localhost:3000",
    "https://card-app-smoky.vercel.app",
];

app.use(
    cors({
        origin: function (origin, callback) {
            if (!origin) return callback(null, true);
            if (allowedOrigins.includes(origin)) return callback(null, true);
            return callback(new Error("Not allowed by CORS"));
        },
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
        credentials: false,
    })
);

// ===============================
// Database pool (ONE instance)
// ===============================
const dbConfig = {
    host: (process.env.DB_HOST || "").trim(),
    user: (process.env.DB_USER || "").trim(),
    password: process.env.DB_PASSWORD,
    database: (process.env.DB_NAME || "").trim(),
    port: Number(process.env.DB_PORT) || 3306,
    waitForConnections: true,
    connectionLimit: 100,
    queueLimit: 0,
};

const pool = mysql.createPool(dbConfig);

// ===============================
// Demo auth setup
// ===============================
const DEMO_USER = {
    id: 1,
    username: "admin",
    password: "admin123",
};

const JWT_SECRET = process.env.JWT_SECRET;

// ===============================
// Auth routes
// ===============================
app.post("/login", (req, res) => {
    const { username, password } = req.body;

    if (
        username !== DEMO_USER.username ||
        password !== DEMO_USER.password
    ) {
        return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
        { userId: DEMO_USER.id, username: DEMO_USER.username },
        JWT_SECRET,
        { expiresIn: "1h" }
    );

    res.json({ token });
});

// ===============================
// JWT middleware
// ===============================
function requireAuth(req, res, next) {
    const header = req.headers.authorization;

    if (!header) {
        return res.status(401).json({ error: "Authorization header missing" });
    }

    const [type, token] = header.split(" ");

    if (type !== "Bearer" || !token) {
        return res.status(401).json({ error: "Invalid authorization header" });
    }

    try {
        const payload = jwt.verify(token, JWT_SECRET);
        req.user = payload;
        next();
    } catch {
        return res.status(401).json({ error: "Invalid or expired token" });
    }
}

// ===============================
// Routes
// ===============================

// Root test
app.get("/", (req, res) => {
    res.send("Backend is running");
});

// Get all cards
app.get("/allcards", async (req, res) => {
    try {
        const [rows] = await pool.query("SELECT * FROM cards");
        res.json(rows);
    } catch (error) {
        console.error("Error fetching cards:", error);
        res.status(500).json({ error: "Internal Server Error for allcards" });
    }
});

// Add card (protected)
app.post("/addcard", requireAuth, async (req, res) => {
    const { card_name, card_pic } = req.body;

    if (!card_name || !card_pic) {
        return res
            .status(400)
            .json({ error: "card_name and card_pic are required" });
    }

    try {
        const [result] = await pool.query(
            "INSERT INTO cards (card_name, card_pic) VALUES (?, ?)",
            [card_name, card_pic]
        );

        res.status(201).json(result);
    } catch (error) {
        console.error("Error adding card:", error);
        res.status(500).json({ error: "Internal Server Error for addcard" });
    }
});

// Update card
app.put("/updatecard/:id", async (req, res) => {
    const { id } = req.params;
    const { card_name, card_pic } = req.body;

    if (!card_name || !card_pic) {
        return res
            .status(400)
            .json({ error: "card_name and card_pic are required" });
    }

    try {
        const [result] = await pool.query(
            "UPDATE cards SET card_name = ?, card_pic = ? WHERE id = ?",
            [card_name, card_pic, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Card not found" });
        }

        res.json({ message: "Card updated", affectedRows: result.affectedRows });
    } catch (error) {
        console.error("Error updating card:", error);
        res.status(500).json({ error: "Internal Server Error for updatecard" });
    }
});

// Delete card
app.delete("/deletecard/:id", async (req, res) => {
    const { id } = req.params;

    try {
        const [result] = await pool.query(
            "DELETE FROM cards WHERE id = ?",
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Card not found" });
        }

        res.json({ message: "Card deleted", affectedRows: result.affectedRows });
    } catch (error) {
        console.error("Error deleting card:", error);
        res.status(500).json({ error: "Internal Server Error for deletecard" });
    }
});

// ===============================
// Start server
// ===============================
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
