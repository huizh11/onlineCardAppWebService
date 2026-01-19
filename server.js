// include the required packages
const express = require('express');
const mysql = require('mysql2/promise');
const cors = require("cors");
require('dotenv').config();

const port = process.env.PORT || 3000;

// database config info
const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,        // MUST be "defaultdb"
    port: Number(process.env.DB_PORT),    // ✅ IMPORTANT FIX
    waitForConnections: true,
    connectionLimit: 100,
    queueLimit: 0,
};

// initialize express app
const app = express();

// CORS
const allowedOrigins = [
    "http://localhost:3000",
    // add frontend Render URL later, e.g.
    // "https://your-frontend.onrender.com"
];

app.use(
    cors({
        origin: function (origin, callback) {
            if (!origin) return callback(null, true);
            if (allowedOrigins.includes(origin)) {
                return callback(null, true);
            }
            return callback(new Error("Not allowed by CORS"));
        },
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
        credentials: false,
    })
);

// middleware
app.use(express.json());

// health check
app.get('/', (req, res) => {
    res.send('Online Card App Web Service is running');
});

// routes
app.get('/allcards', async (req, res) => {
    try {
        const connection = await mysql.createConnection(dbConfig);
        const [rows] = await connection.execute('SELECT * FROM cards');
        await connection.end();
        res.json(rows);
    } catch (err) {
        console.error("DB ERROR:", err); // clearer logs in Render
        res.status(500).json({ message: 'Server error for allcards' });
    }
});

// start server
app.listen(port, () => {
    console.log('Server running on port', port);
});
