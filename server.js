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
    database: process.env.DB_NAME,        // defaultdb
    port: Number(process.env.DB_PORT),    // e.g. 17822
    waitForConnections: true,
    connectionLimit: 100,
    queueLimit: 0,
};

// initialize express app
const app = express();

// CORS
const allowedOrigins = [
    "http://localhost:3000",
    // add frontend Render URL later
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
        methods: ["GET", "POST", "PUT", "DELETE"],
        allowedHeaders: ["Content-Type"],
    })
);

// middleware
app.use(express.json());

// health check
app.get('/', (req, res) => {
    res.send('Online Card App Web Service is running');
});

/* =====================
   ROUTES
===================== */

// GET all cards
app.get('/allcards', async (req, res) => {
    try {
        const connection = await mysql.createConnection(dbConfig);
        const [rows] = await connection.execute('SELECT * FROM cards');
        await connection.end();
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to fetch cards' });
    }
});

// ADD card
app.post('/addcard', async (req, res) => {
    const { card_name, card_image } = req.body;

    try {
        const connection = await mysql.createConnection(dbConfig);
        const [result] = await connection.execute(
            'INSERT INTO cards (card_name, card_image) VALUES (?, ?)',
            [card_name, card_image]
        );
        await connection.end();

        res.json({ id: result.insertId, card_name, card_image });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to add card' });
    }
});

// UPDATE card
app.put('/updatecard/:id', async (req, res) => {
    const { id } = req.params;
    const { card_name, card_image } = req.body;

    try {
        const connection = await mysql.createConnection(dbConfig);
        await connection.execute(
            'UPDATE cards SET card_name = ?, card_image = ? WHERE id = ?',
            [card_name, card_image, id]
        );
        await connection.end();

        res.json({ message: 'Card updated' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to update card' });
    }
});

// DELETE card
app.delete('/deletecard/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const connection = await mysql.createConnection(dbConfig);
        await connection.execute(
            'DELETE FROM cards WHERE id = ?',
            [id]
        );
        await connection.end();

        res.json({ message: 'Card deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to delete card' });
    }
});

// start server
app.listen(port, () => {
    console.log('Server running on port', port);
});
