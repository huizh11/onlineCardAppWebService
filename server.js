// include the required packages
const express = require('express');
const mysql = require('mysql2/promise'); // ✅ IMPORTANT
require('dotenv').config();
const port = 3000;

// database config info
const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
};

// initialize express app
const app = express();
app.use(express.json());

// allow frontend to access backend (CORS)
const cors = require('cors');
app.use(cors());

// start server
app.listen(port, () => {
    console.log('Server running on port', port);
});

// API route
app.get('/allcards', async (req, res) => {
    try {
        const connection = await mysql.createConnection(dbConfig);
        const [rows] = await connection.execute(
            'SELECT * FROM cards'
        );
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error for allcards' });
    }
});
