const express = require('express');
const mysql = require('mysql');
const multer = require('multer');
const path = require('path');
const router = express.Router();
const db = require('./db');

// Variable to track the page number
let pageNum = 1;

// Set up Multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        // Determine the folder name based on the request
        const uploadDir = path.join('commicweb-app 2', 'public', 'books', req.body.bookId.toString(), req.body.chapter_num.toString());

        // Set the destination for the uploaded files
        callback(null, uploadDir);
    },
    filename: function (req, file, callback) {
        const bookId = req.body.bookId;
        const chapter_num = req.body.chapter_num;

        const res = req.res;
        let query = 'SELECT page_num FROM book_page WHERE book_id = ? AND chapter_num = ? ORDER BY page_num DESC LIMIT 1';

        db.query(query, [bookId, chapter_num], (err, results) => {
            if (err) {
                console.error('Error getting current page of the chapter: ' + err);
                return res.json({ error: 'Database error' });
            }

            // Initialize pageNum to 1 if there are no results or the chapter is new
            if (results.length === 0 || results[0].page_num === null) {
                pageNum = 1;
            } else {
                pageNum = results[0].page_num + 1;
            }

            const fileName = pageNum.toString() + path.extname(file.originalname);
            const filePath = path.join('books', bookId.toString(), chapter_num.toString(), fileName);

            query = 'INSERT INTO book_page (book_id, chapter_num, page_num, page_path) VALUES (?, ?, ?, ?)';
            db.query(query, [bookId, chapter_num, pageNum, filePath], (err) => {
                if (err) {
                    console.error('Error inserting file into the database: ' + err);
                    return res.json({ message: 'Error inserting page into database' });
                }
                callback(null, fileName);
            });
        });
    },
});

const upload = multer({ storage: storage });

// Set up a route for uploading multiple pages
router.post('/upload', upload.single('page'), (req, res) => {

    res.json({ message: 'Page uploaded successfully' });
});

module.exports = router;
