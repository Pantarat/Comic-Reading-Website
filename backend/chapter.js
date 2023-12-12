const express = require('express');
const bodyParser = require('body-parser');
const router = express.Router();
const db = require('./db');
const fs = require('fs');
const path = require('path');
const rimraf = require('rimraf');

router.use(bodyParser.json());

// API endpoint to add a chapter to a book
router.post('/add', (req, res) => {
    const { bookId, chapter_num, chapter_name } = req.body;
    let chapNum = chapter_num;
    if (!chapter_num) {
        chapNum = 1;
    }

    if (!bookId || !chapter_name) {
        return res.json({ message: 'Both bookId and chapter name are required.' });
    }

    let query = 'SELECT chapter_num FROM book_chapter WHERE book_id = ? ORDER BY chapter_num DESC LIMIT 1'

    db.query(query, [bookId], (err, results) => {
        if (err) {
            console.error('Error getting current chapter of book: ' + err);
            return res.json({ error: 'Database error' });
        }

        if (results.length !== 0 && !chapter_num) {
            chapNum = results[0].chapter_num + 1;
        }

        // if (chapter_num) {
        //     chapNum = chapter_num;
        // }

        query = 'INSERT INTO book_chapter (book_id,chapter_num,chapter_name) VALUES (?,?,?);'
        db.query(query, [bookId, chapNum, chapter_name], (err) => {
            if (err) {
                console.error('Error inserting book chapter: ' + err);
                return res.json({ error: 'Database error' });
            }

            const bookFolderName = bookId.toString();
            const chapterFolderName = chapNum.toString();
            const newFolderPath = path.join(__dirname, '..', 'commicweb-app 2', 'public', 'books', bookFolderName, chapterFolderName);

            fs.mkdir(newFolderPath, (err) => {
                if (err) {
                    if (err.code === 'EEXIST') {
                        console.log(`Folder '${chapterFolderName}' already exists.`);
                    } else {
                        console.error(`Error creating folder '${chapterFolderName}': ${err}`);
                    }
                }

                // Send the response only after the database operation is completed
                return res.json({
                    message: 'Book chapter added succesfully!',
                    chapter_num: chapNum
                });
            });
        });
    });
});


router.delete('/delete', (req, res) => {
    const { bookId, chapter_num } = req.body;


    // Delete the corresponding folder
    const chapterPath = path.join(__dirname, '..', 'commicweb-app 2', 'public', 'books', bookId.toString(), chapter_num.toString());
    const isDirectoryEmpty = fs.readdirSync(chapterPath).length === 0;
    // if (!isDirectoryEmpty) {
    rimraf.sync(chapterPath);
    // }
    // fs.rmdir(chapterPath, (err) => {
    //     if (err) {
    //         console.error('Error deleting chapter folder: ' + err);
    //     }
    // });

    // Query the database to delete the book
    const deleteBookQuery = 'DELETE FROM book_chapter WHERE book_id = ? AND chapter_num = ?';

    db.query(deleteBookQuery, [bookId, chapter_num], (err, results) => {
        if (err) {
            console.error('Error deleting book: ' + err);
            return res.json({ error: 'Database error' });
        }

        // Check if a book with the provided ID was found and deleted
        if (results.affectedRows === 0) {
            return res.json({ message: 'Chapter with the provided IDs was not found' });
        }

        return res.json({ message: 'Chapter and associated folder deleted successfully' });
    });
});

//Get all pages in the chapter
router.get('/getPages', (req, res) => {
    const { bookId, chapter_num } = req.query;

    let query = 'SELECT * FROM book_page WHERE book_id = ? AND chapter_num = ?;';
    db.query(query, [bookId, chapter_num], (err, results) => {
        if (err) {
            console.error('Error getting pages: ' + err);
            return res.json({ error: 'Database error' });
        }

        return res.json(results);
    })
})


module.exports = router;