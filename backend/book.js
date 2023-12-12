const express = require('express');
const bodyParser = require('body-parser');
const router = express.Router();
const db = require('./db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const rimraf = require('rimraf');

router.use(bodyParser.json());

// Configure Multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join('commicweb-app 2', 'public', 'book_covers'));
    },
    filename: (req, file, cb) => {
        if (req.params.id) {
            // If an ID is provided, it's an edit operation
            const bookId = req.params.id;
            cb(null, 'book_cover-' + bookId + '-' + file.originalname);
        } else {
            // If no ID is provided, it's a registration
            cb(null, 'book_cover-' + file.originalname);
        }
    }
});


const upload = multer({ storage: storage });

// Add book endpoint
router.post('/add', upload.single('book_cover'), (req, res) => {
    let { title, authors, status, summary, release_date } = req.body;
    let imageUrl = 'NULL'; // Default to 'NULL' if no image is uploaded

    if (!title || !status) {
        return res.json({ message: 'Title and status required' });
    }

    if (!release_date) {
        release_date = null;
    }

    if (req.file) {
        imageUrl = path.join('book_covers', req.file.filename);
    }

    // Query the database to add new book
    let query = 'INSERT INTO book (Title, Book_Cover, Status,Summary,release_date) VALUES (?,?,?,?,?)';
    db.query(query, [title, imageUrl, status, summary, release_date], (err, results) => {
        if (err) {
            console.error('Error executing query: ' + err);
            return res.json({ error: 'Database error' });
        }

        const insertedBookId = results.insertId;

        // Check if author exists, if not add author
        let query1 = `INSERT IGNORE INTO author (Author_Name) VALUES (?);`;
        let query2 = `SELECT Author_ID FROM author WHERE Author_name = ?;`
        let query3 = `INSERT IGNORE INTO \`write\` (Book_ID,Author_ID) VALUES (?,?);`;

        let insert_authors = JSON.parse(authors);

        insert_authors.forEach(author => {
            db.query(query1, [author], (err) => {
                if (err) {
                    console.error('Error executing query: ' + err);
                    return res.json({ error: 'Database error' });
                }

                db.query(query2, [author], (err, results) => {
                    if (err) {
                        console.error('Error executing query: ' + err);
                        return res.json({ error: 'Database error' });
                    }

                    const author_id = results[0].Author_ID
                    db.query(query3, [insertedBookId, author_id], (err) => {
                        if (err) {
                            console.error('Error executing query: ' + err);
                            return res.json({ error: 'Database error' });
                        }
                    })
                })
            })
        });

        // Rename the uploaded file with the user's ID
        const folderName = insertedBookId.toString();
        const newFolderPath = path.join('commicweb-app 2', 'public', 'books', folderName);

        fs.mkdir(newFolderPath, (err) => {
            if (err) {
                if (err.code === 'EEXIST') {
                    console.log(`Folder '${folderName}' already exists.`);
                } else {
                    console.error(`Error creating folder '${folderName}': ${err}`);
                }
            }
        });

        if (req.file) {
            const newFileName = 'book_cover-' + insertedBookId + '-' + req.file.originalname;
            const newPathRelative = path.join('book_covers', newFileName);
            const newPath = path.join('commicweb-app 2', 'public', newPathRelative);
            fs.rename(req.file.path, newPath, (err) => {
                if (err) {
                    console.error('Error renaming book cover file: ' + err);
                    return res.json({ error: 'File upload error' });
                }

                query = 'UPDATE book SET book_cover = ? WHERE book_id = ?';
                db.query(query, [newPathRelative, insertedBookId], (err) => {
                    if (err) {
                        console.error('Error Inserting profile picture: ' + err);
                        return res.json({ error: 'Database error: ' + err });
                    }
                })
            });
        }


        return res.json({ message: 'Book added successfully' });
    });
});


// Book edit endpoint
router.put('/edit/:id', upload.single('book_cover'), (req, res) => {
    const bookId = req.params.id;
    const { title, authors, status, summary, release_date } = req.body;
    let imageUrl = null;
    if (!title || !status) {
        return res.json({ message: 'Title and status required' });
    }

    // Check if author exists, if not add author
    let query1 = `INSERT IGNORE INTO author (Author_Name) VALUES (?);`;
    let query2 = `SELECT Author_ID FROM author WHERE Author_name = ?;`
    let query3 = `INSERT IGNORE INTO \`write\` (Book_ID,Author_ID) VALUES (?,?);`;
    let query4 = `DELETE FROM \`write\` WHERE Book_ID = ? AND Author_ID = ?;`; // New query for removing author

    let insert_authors = JSON.parse(authors);

    // Function to handle the removal of authors
    const removeAuthors = (bookId, currentAuthors, newAuthors) => {
        const removedAuthors = currentAuthors.filter(author => !newAuthors.includes(author));
        removedAuthors.forEach(removedAuthor => {
            db.query(query2, [removedAuthor], (err, results) => {
                if (err) {
                    console.error('Error executing query: ' + err);
                    return res.json({ error: 'Database error' });
                }
                const authorId = results[0].Author_ID;
                db.query(query4, [bookId, authorId], (err) => {
                    if (err) {
                        console.error('Error executing query: ' + err);
                        return res.json({ error: 'Database error' });
                    }
                });
            });
        });
    };

    insert_authors.forEach(author => {
        db.query(query1, [author], (err) => {
            if (err) {
                console.error('Error executing query: ' + err);
                return res.json({ error: 'Database error' });
            }

            db.query(query2, [author], (err, results) => {
                if (err) {
                    console.error('Error executing query: ' + err);
                    return res.json({ error: 'Database error' });
                }

                const author_id = results[0].Author_ID
                db.query(query3, [bookId, author_id], (err) => {
                    if (err) {
                        console.error('Error executing query: ' + err);
                        return res.json({ error: 'Database error' });
                    }
                })
            })
        })
    });

    // Check if a new book cover was uploaded
    if (req.file) {
        imageUrl = path.join('book_covers', req.file.filename);

        // Get the current book cover URL from the database
        const getCurrentBookCoverQuery = 'SELECT book_cover FROM book WHERE book_id = ?';
        db.query(getCurrentBookCoverQuery, [bookId], (err, results) => {
            if (err) {
                console.error('Error getting current book cover: ' + err);
                return res.json({ error: 'Database error' });
            }

            const currentBookCover = results[0].book_cover;

            // Delete the old image file (if it exists)
            if (currentBookCover != imageUrl && currentBookCover) {
                const filePath = path.join(__dirname, '..', 'commicweb-app 2', 'public', currentBookCover);
                fs.unlink(filePath, (err) => {
                    if (err) {
                        console.error('Error deleting old book cover: ' + err);
                    }
                });
            }

            // Update the book's cover in the database
            const updateBookQuery = `UPDATE book SET title = ?, book_cover= ?, status = ?, summary = ?, release_date = ? WHERE book_id = ?`;
            const updateBookValues = [title, imageUrl, status, summary, release_date, bookId];

            // Get the current authors of the book from the database
            const getCurrentAuthorsQuery = 'SELECT Author_Name FROM `write` JOIN author ON `write`.Author_ID = author.Author_ID WHERE `write`.Book_ID = ?';
            db.query(getCurrentAuthorsQuery, [bookId], (err, results) => {
                if (err) {
                    console.error('Error getting current authors: ' + err);
                    return res.json({ error: 'Database error' });
                }

                const currentAuthors = results.map(result => result.Author_Name);
                removeAuthors(bookId, currentAuthors, insert_authors);

                db.query(updateBookQuery, updateBookValues, (err) => {
                    if (err) {
                        console.error('Error updating book: ' + err);
                        return res.json({ error: 'Database error' });
                    }

                    return res.json({ message: 'Book updated successfully' });
                });
            });
        });
    } else {
        // If no new book cover is uploaded, update the book's information without changing the book cover
        const updateBookQuery = 'UPDATE book SET title = ?, status = ?, summary = ?, release_date = ? WHERE book_id = ?';
        const updateBookValues = [title, status, summary, release_date, bookId];

        // Get the current authors of the book from the database
        const getCurrentAuthorsQuery = 'SELECT Author_Name FROM `write` JOIN author ON `write`.Author_ID = author.Author_ID WHERE `write`.Book_ID = ?';
        db.query(getCurrentAuthorsQuery, [bookId], (err, results) => {
            if (err) {
                console.error('Error getting current authors: ' + err);
                return res.json({ error: 'Database error' });
            }

            const currentAuthors = results.map(result => result.Author_Name);
            removeAuthors(bookId, currentAuthors, insert_authors);

            db.query(updateBookQuery, updateBookValues, (err) => {
                if (err) {
                    console.error('Error updating user: ' + err);
                    return res.json({ error: 'Database error' });
                }

                return res.json({ message: 'Book updated successfully' });
            });
        });
    }
});


// Add a route for deleting a book by its ID
router.delete('/delete/:id', (req, res) => {
    const bookId = req.params.id;

    // Query the database to get the book cover file path
    const getBookCoverQuery = 'SELECT book_cover FROM book WHERE book_id = ?';

    db.query(getBookCoverQuery, [bookId], (err, results) => {
        if (err) {
            console.error('Error getting book cover: ' + err);
            return res.json({ error: 'Database error' });
        }

        let bookCoverPath = "";

        if (results.length === 0) {
            console.log('Book cover with the provided ID was not found');
        }

        else {
            bookCoverPath = results[0].book_cover;
        }

        // Delete the book cover file (if it exists)
        if (bookCoverPath && bookCoverPath != "NULL") {
            const filePath = path.join(__dirname, '..', 'commicweb-app 2', 'public', bookCoverPath);
            fs.unlink(filePath, (err) => {
                if (err) {
                    console.error('Error deleting book cover file: ' + err);
                }
            });
        }

        // Query the database to delete the book
        const deleteBookQuery = 'DELETE FROM book WHERE book_id = ?';

        db.query(deleteBookQuery, [bookId], (err, results) => {
            if (err) {
                console.error('Error deleting book: ' + err);
                return res.json({ error: 'Database error' });
            }

            // Check if a book with the provided ID was found and deleted
            if (results.affectedRows === 0) {
                return res.json({ message: 'Book with the provided ID was not found' });
            }

            // Delete the corresponding folder
            const folderPath = path.join(__dirname, '..', 'commicweb-app 2', 'public', 'books', bookId.toString());
            const isDirectoryEmpty = fs.readdirSync(folderPath).length === 0;
            if (!isDirectoryEmpty) {
                rimraf.sync(folderPath);
            }
            else {
                console.log("There is an error removing book folder");
            }

            return res.json({ message: 'Book and associated folder deleted successfully' });
        });
    });
});


//Get details of book
router.get('/getBook', (req, res) => {
    const { bookId } = req.query;

    let query = 'SELECT book.*, author.author_name FROM book JOIN `write` ON `write`.Book_ID=book.Book_ID JOIN author ON `write`.Author_ID=author.Author_ID WHERE book.book_id = ?;';
    db.query(query, [bookId], (err, results) => {
        if (err) {
            console.error('Error getting book details: ' + err);
            return res.json({ error: 'Database error' });
        }
        const combinedData = Object.values(results.reduce((acc, entry) => {
            if (!acc[entry.Book_ID]) {
                acc[entry.Book_ID] = { ...entry, author_names: [entry.author_name] };
                delete acc[entry.Book_ID].author_name; // Remove original author_name
            } else {
                acc[entry.Book_ID].author_names.push(entry.author_name);
            }
            return acc;
        }, {}));

        return res.json(combinedData[0]);
    })
})


//Get all chapters in the book
router.get('/getChapters', (req, res) => {
    const { bookId } = req.query;

    let query = 'SELECT * FROM book_chapter WHERE book_id = ?;';
    db.query(query, [bookId], (err, results) => {
        if (err) {
            console.error('Error getting chapters: ' + err);
            return res.json({ error: 'Database error' });
        }

        return res.json(results);
    })
})


module.exports = router;
