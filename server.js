// include the required packages
const express = require('express');
const mysql = require('mysql2');
const cors = require("cors");   // ✅ ADD THIS
require('dotenv').config();
const port = 3000;

// database config info
const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    waitForConnections: true,
    connectionLimit: 100,
    queueLimit: 0,
};

// initialize express app
const app = express();

// ✅ ADD THIS CORS BLOCK (before routes)
const allowedOrigins = [
    "http://localhost:3000",
    // add deployed frontend later
    // "https://your-frontend.vercel.app",
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

// helps app read JSON
app.use(express.json());

// start the server
app.listen(port, () => {
    console.log('Server running on port', port);
});

// routes
app.get('/allcards', async (req, res) => {
    try {
        let connection = await mysql.createConnection(dbConfig);
        const [rows] = await connection.execute(
            'SELECT * FROM defaultdb.cards'
        );
        res.json(rows);
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Server error for allcards' });
    }
});
