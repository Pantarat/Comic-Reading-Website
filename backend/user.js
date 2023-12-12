const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const router = express.Router();
const db = require('./db');
const fs = require('fs');

router.use(bodyParser.json());

// User login endpoint
router.post('/login', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.json({ message: 'Username and password are required' });
    }

    // Query the database to find the user by username
    const query = 'SELECT User_ID,Username, CONVERT(AES_DECRYPT(Password,SHA1(?)) USING utf8) AS Password ,Display_Name,Profile_Pic,Register_Date,Email FROM user WHERE Username = ?';
    db.query(query, [process.env.PASS_AES_KEY, username], (err, results) => {
        if (err) {
            console.error('Error executing query: ' + err);
            return res.json({ error: 'Database error' });
        }

        if (results.length === 0) {
            return res.json({ message: 'User not found' });
        }

        const user = results[0];
        if (user.Password === password) {
            return res.json(results[0]);
        }

        else {
            return res.json({ message: 'Password incorrect' });
        }
    });
});


// Configure Multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join('commicweb-app 2','public','profile_pictures'));
    },
    filename: (req, file, cb) => {
        if (req.params.id) {
            // If an ID is provided, it's an edit operation
            const userId = req.params.id;
            cb(null, 'profile_pic-' + userId + '-' + file.originalname);
        } else {
            // If no ID is provided, it's a registration
            cb(null, 'profile_pic-' + file.originalname);
        }
    }
});


const upload = multer({ storage: storage });


// User register endpoint
router.post('/register', upload.single('profilePicture'), (req, res) => {
    const { username, password, display_name, email } = req.body;

    let imageUrl = null; // Default to null if no image is uploaded

    if (!username || !password || !display_name || !email) {
        return res.json({ message: 'Information not complete' });
    }

    if (req.file) {
        imageUrl = path.join('commicweb-app 2','public','profile_pictures', req.file.filename);
    }

    // Use placeholders and pass values as an array to prevent SQL injection
    let query = 'INSERT INTO user (username, password, display_name, profile_pic, email) VALUES (?, AES_ENCRYPT(?, SHA1(?)), ?, ?, ?)';
    const values = [username, password, process.env.PASS_AES_KEY, display_name, imageUrl, email];

    db.query(query, values, (err, result) => {
        if (err) {
            console.error('Error inserting new user: ' + err);

            // Delete profile picture if an error occurs
            if (imageUrl) {
                const filePath = path.join(__dirname, imageUrl);
                fs.unlink(filePath, (err) => {
                    if (err) {
                        console.error('Error deleting profile picture: ' + err);
                    }
                });
            }

            return res.json({ error: 'Database error: ' + err });
        }

        const insertedUserId = result.insertId; // Get the ID of the newly inserted user

        // If a profile picture was uploaded, handle it
        if (imageUrl) {
            const newFileName = 'profile_pic-' + insertedUserId + '-' + req.file.originalname;
            const newPathRelative = path.join('profile_pictures', newFileName);
            const newPath = path.join('commicweb-app 2','public',newPathRelative);


            fs.rename(req.file.path, newPath, (err) => {
                if (err) {
                    console.error('Error renaming profile picture file: ' + err);

                    // Delete the uploaded file if an error occurs
                    fs.unlink(req.file.path, (err) => {
                        if (err) {
                            console.error('Error deleting profile picture: ' + err);
                        }
                    });

                    return res.json({ error: 'File upload error' });
                }

                // Update user record with the profile picture path
                query = 'UPDATE user SET profile_pic = ? WHERE user_id = ?';
                db.query(query, [newPathRelative, insertedUserId], (err) => {
                    if (err) {
                        console.error('Error updating profile picture path: ' + err);
                        return res.json({ error: 'Database error: ' + err });
                    }

                    return res.json({ message: 'Registered new user successfully' });
                });
            });
        } else {
            // If no profile picture was uploaded, directly return success message
            return res.json({ message: 'Registered new user successfully' });
        }
    });
});



// User edit endpoint
router.put('/edit/:id', upload.single('profilePicture'), (req, res) => {
    const userId = req.params.id;
    const { username, password, display_name, email } = req.body;
    let imageUrl = null;

    if (!username || !display_name || !email) {
        return res.json({ message: 'Information not complete' });
    }

    // Check if a new profile picture was uploaded
    if (req.file) {
        imageUrl = path.join('profile_pictures', req.file.filename);

        // Get the current profile picture URL from the database
        const getCurrentProfilePicQuery = 'SELECT profile_pic FROM user WHERE user_id = ?';
        db.query(getCurrentProfilePicQuery, [userId], (err, results) => {
            if (err) {
                console.error('Error getting current profile picture: ' + err);
                return res.json({ error: 'Database error' });
            }

            const currentProfilePic = results[0].profile_pic;

            // Delete the old image file (if it exists)
            if (currentProfilePic != imageUrl && currentProfilePic) {
                const filePath = path.join(__dirname, '..', 'commicweb-app 2', 'public', currentProfilePic);
                fs.unlink(filePath, (err) => {
                    if (err) {
                        console.error('Error deleting old profile picture: ' + err);
                    }
                });
            }

            // Update the user's profile picture in the database
            const updateUserQuery = 'UPDATE user SET username = ?, password= AES_ENCRYPT(?,SHA1(?)), display_name = ?, profile_pic = ?, email = ? WHERE user_id = ?';
            const updateUserValues = [username, password, process.env.PASS_AES_KEY, display_name, imageUrl, email, userId];

            db.query(updateUserQuery, updateUserValues, (err) => {
                if (err) {
                    console.error('Error updating user: ' + err);
                    return res.json({ error: 'Database error' });
                }

                return res.json({ message: 'User updated successfully' });
            });
        });
    } else {
        // If no new profile picture is uploaded, update the user's information without changing the profile picture
        const updateUserQuery = 'UPDATE user SET username = ?, password= AES_ENCRYPT(?,SHA1(?)), display_name = ?, email = ? WHERE user_id = ?';
        const updateUserValues = [username, password, process.env.PASS_AES_KEY, display_name, email, userId];

        db.query(updateUserQuery, updateUserValues, (err) => {
            if (err) {
                console.error('Error updating user: ' + err);
                return res.json({ error: 'Database error' });
            }

            return res.json({ message: 'User updated successfully' });
        });
    }
});

router.put('/updateview', (req, res) => {
    const { userId, bookId, chapter_num } = req.body;

    // Insert or update the "view" table
    let query = `
        INSERT INTO view (user_id, book_id, chapter_num)
        VALUES (?, ?, ?)
        ON DUPLICATE KEY UPDATE chapter_num = VALUES(chapter_num), view_time = CURRENT_TIMESTAMP;
    `;

    db.query(query, [userId, bookId, chapter_num], (err, results) => {
        if (err) {
            console.error('Error updating view table: ' + err);
            return res.json({ error: 'Database error' });
        }

        // Update the view count on the chapter
        query = `UPDATE book_chapter SET view_count = view_count+1 WHERE book_id = ? AND chapter_num = ?;`
        db.query(query, [bookId, chapter_num], (err) => {
            if (err) {
                console.error('Error updating view count of chapter: ' + err);
                return res.json({ error: 'Database error' });
            }


            // Update the view count of book
            query = `SELECT SUM(view_count) AS total_view_count FROM book_chapter WHERE book_id = ?;`
            db.query(query, [bookId], (err, results) => {
                if (err) {
                    console.error('Error getting view count of all chapters: ' + err);
                    return res.json({ error: 'Database error' });
                }

                const totalChapterViewCount = results[0].total_view_count;
                query = `UPDATE book SET view_count = ? WHERE book_id = ?;`;

                db.query(query, [totalChapterViewCount, bookId], (err) => {
                    if (err) {
                        console.error('Error updating book view count: ' + err);
                        return res.json({ error: 'Database error' });
                    }
                    res.json({ message: 'View updated successfully' });
                });
            })
        })
    });
})

router.get('/history', (req,res) => {
    const { userId } = req.query;

    let query = `SELECT book.*, view.chapter_num FROM view JOIN book ON book.book_id=view.book_id WHERE user_id = ?`;
    db.query(query, [userId], (err, results) => {
        if (err) {
            console.error('Error getting view history: ' + err);
            return res.json({ error: 'Database error' });
        }
        return res.json(results);
    })
})

router.put('/bookmark', (req, res) => {
    const { userId, bookId } = req.body;

    let query = `SELECT * from bookmark WHERE book_id = ? AND user_id = ?`;

    db.query(query, [bookId, userId], (err, results) => {
        if (results.length === 0) {
            // Insert or update the "view" table
            query = `INSERT INTO bookmark (book_id, user_id) VALUES (?, ?)`;

            db.query(query, [bookId, userId], (err, results) => {
                if (err) {
                    console.error('Error executing INSERT/UPDATE query: ' + err);
                    return res.json({ error: 'Database error' });
                }
            });
            return res.json({ message: 'Book bookmarked!' });
        }
        else {
            // The record already existed, and you can delete it
            query = 'DELETE FROM bookmark WHERE book_id = ? AND user_id = ?';

            db.query(query, [bookId, userId], (err, deleteResults) => {
                if (err) {
                    console.error('Error executing DELETE query: ' + err);
                    return res.json({ error: 'Database error' });
                }

                if (deleteResults.affectedRows === 1) {
                    return res.json({ message: 'Book unbookmarked!' });
                }
            });
        }
    });
});

router.get('/getBookmark', (req,res) => {
    const { userId, queryTitle } = req.query;

    let query = 'SELECT book.* FROM bookmark JOIN book ON bookmark.book_id=book.book_id WHERE user_id = ? AND book.title LIKE ?';

    db.query(query, [userId, `%${queryTitle}%`], (err, results) => {
        if (err) {
            console.error('Error getting the bookmarks: ' + err);
            return res.json({ error: 'Database error' });
        }

        return res.json(results);
    })
})

// Add rating to a book
router.post('/rate', (req,res) => {
    const { bookId, userId, rating } = req.body;

    let query = 'INSERT INTO rate (book_id,user_id,rating) VALUES (?,?,?) ON DUPLICATE KEY UPDATE rating = ?';

    db.query(query, [bookId,userId,rating,rating], (err) => {
        if (err) {
            console.error('Error inserting into rate table: ' + err);
            return res.json({ error: 'Database error' });
        }

        // Update the rating of book
        query = `SELECT AVG(rating) AS total_rating FROM rate WHERE book_id = ?;`
        db.query(query, [bookId], (err, results) => {
            if (err) {
                console.error('Error getting rating of all users: ' + err);
                return res.json({ error: 'Database error' });
            }

            const totalBookRating = results[0].total_rating;
            query = `UPDATE book SET total_rating = ? WHERE book_id = ?;`;

            db.query(query, [totalBookRating, bookId], (err) => {
                if (err) {
                    console.error('Error updating book rating: ' + err);
                    return res.json({ error: 'Database error' });
                }
                res.json({ message: 'Rating updated successfully' });
            });
        })
    })
})

router.get('/getRating', (req,res) => {
    const { userId, bookId } = req.query;

    let query = 'SELECT rating FROM rate WHERE user_id = ? AND book_id = ?';

    db.query(query, [userId, bookId], (err, results) => {
        if (err) {
            console.error('Error getting the rating: ' + err);
            return res.json({ error: 'Database error' });
        }
        else if (results.length === 0) {
            return res.json({ message: 'User have not rated this book.' });
        } else {
            return res.json(results[0]);
        }
    })
})


module.exports = router;
