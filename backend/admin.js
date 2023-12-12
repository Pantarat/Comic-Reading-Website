const express = require('express');
const bodyParser = require('body-parser');
const router = express.Router();
const db = require('./db');

router.use(bodyParser.json());

router.post('/addEdit', (req,res) => {
    const { userId, bookId } = req.body;

    let query = 'INSERT IGNORE INTO edit (user_id,book_id) VALUES (?,?)';

    db.query(query,[userId,bookId], (err) => {
        if (err) {
            console.error('Error inserting edit into the database: ' + err);
            return res.json({ error: 'Database Error' });
        }
        return res.json({ message: 'Add to edit list successfully!'});
    })
})

router.delete('/deleteEdit', (req,res) => {
    const { userId, bookId } = req.body;

    let query = 'DELETE FROM edit WHERE user_id = ? AND book_id = ?';

    db.query(query,[userId,bookId], (err,results) => {
        if (err) {
            console.error('Error deleting from edit list: ' + err);
            return res.json({ error: 'Database Error' });
        }
        if (results.affectedRows === 0) {
            return res.json({ message: 'Book and Admin with the provided ID was not found' });
        }
        return res.json({ message: 'Remove from edit list successfully!' });
    })
});

router.post('/getEdit', (req,res) => {
    const { userId, title } = req.body;

    let query = 'SELECT book.* FROM edit JOIN book ON book.Book_ID=edit.Book_ID WHERE user_id = ? AND Title LIKE ?';
    const searchTitle = `%${title}%`;

    db.query(query,[userId, searchTitle], (err,results) => {
        if (err) {
            console.error('Error retrieving edit list: ' + err);
            return res.json({ error: 'Database Error' });
        }
        return res.json(results);
    })
})

router.post('/checkAdmin', (req,res) => {
    const { userId } = req.body;

    let query = 'SELECT user_id FROM admin WHERE user_id = ?';

    db.query(query, [userId], (err,results) => {
        if (err) {
            console.error('Error checking admin: ' + err);
            return res.json({ error: 'Database Error' });
        }
        return res.json({ isAdmin: results.length > 0});
    })
})

module.exports = router;