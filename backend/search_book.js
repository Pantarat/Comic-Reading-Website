const express = require('express');
const router = express.Router();
const db = require('./db');

// API endpoint for searching books by title
router.get('/', (req, res) => {
    const { title } = req.query;
    // Search for books in the database with a matching title
    const query = 'SELECT * FROM book WHERE title LIKE ?';
    const searchTitle = `%${title}%`;

    db.query(query, [searchTitle], (err, rows) => {
        if (err) {
            console.error('Error searching for books:', err);
            return res.status(500).json({ error: 'Database error' });
        }

        if (rows.length === 0) {
            return res.json({ message: 'No books found with the given title' });
        }

        res.json(rows);
    });
});

module.exports = router;