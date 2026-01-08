// include the required packages
const express = require('express');
const mysql = require('mysql2/promise');
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
    queueLimit:0,
};

//intialize express app
const app = express();
//helps app to read JSON
app.use(express.json());

// start the server
app.listen(port, () => {
    console.log('Server running on port', port);
});

// example route: get all cards
app.get('/allcards', async(req, res) => {
    try {
        let connection = await mysql.createConnection(dbConfig);
        const [rows] = await connection.execute('SELECT * FROM defaultdb.cards');
        res.json(rows);
    } catch (err) {
        console.log(err);
        res.status(500).json({message:'Server error for allcards'});
    }
});

// Example Route: Create a new card
app.post('/addcard', async (req, res) => {
    const { card_name, card_pic } = req.body;
    try {
        let connection = await mysql.createConnection(dbConfig);
        await connection.execute(
            'INSERT INTO cards (card_name, card_pic) VALUES (?, ?)',
            [card_name, card_pic]
        );
        res.status(201).json({
            message: 'Card ' + card_name + ' added successfully'
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: 'Server error - could not add card ' + card_name
        });
    }
});

// example route: get all sanrio characters
app.get('/allcharacters', async(req, res) => {
    try {
        let connection = await mysql.createConnection(dbConfig);
        const [rows] = await connection.execute('SELECT * FROM defaultdb.sanrio');
        res.json(rows);
    } catch (err) {
        console.log(err);
        res.status(500).json({message:'Server error for all sanrio characters'});
    }
});

// Add a new sanrio character
    app.post('/allcharacters', async (req, res) => {
    const { character_name, character_pic } = req.body;
    try {
        const connection = await mysql.createConnection(dbConfig);
        await connection.execute(
            'INSERT INTO sanrio (character_name, character_pic) VALUES (?, ?)',
            [character_name, character_pic]
        );
        res.status(201).json({
            message: 'Character ' + character_name + ' added successfully'
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: 'Server error - could not add character ' + character_name
        });
    }
});


//update
app.put('/allcharacters/:id', async (req, res) => {
    const { id } = req.params;
    const { character_name, character_pic } = req.body;

    try {
        const connection = await mysql.createConnection(dbConfig);
        await connection.execute(
            'UPDATE sanrio SET character_name = ?, character_pic = ? WHERE id = ?',
            [character_name, character_pic, id]
        );

        res.json({
            message: 'Character updated successfully'
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: 'Server error - could not update character'
        });
    }
});

//delete
app.delete('/allcharacters/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const connection = await mysql.createConnection(dbConfig);
        await connection.execute(
            'DELETE FROM sanrio WHERE id = ?',
            [id]
        );

        res.json({
            message: 'Character deleted successfully'
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: 'Server error - could not delete character'
        });
    }
});

