// BookPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Bookpage.css';

const AddBook = () => {
    const [bookData, setBookData] = useState({
        title: '',
        book_cover: '',
        release_date: '',
        status: '',
        summary: '',
        authors: [],
        book_cover_path: ''
    });

    const backendPort = process.env.REACT_APP_BACKEND_PORT || 3000;

    const navigate = useNavigate();

    // Function to handle form submission
    const handleAddBook = async (e) => {
        e.preventDefault();

        if (!bookData.title) {
            alert('Please insert Title');
        } else if (!bookData.status) {
            alert('Please insert status');
        } else {
            try {
                const sendData = new FormData();
                sendData.append('title', bookData.title);
                sendData.append('release_date', bookData.release_date);
                sendData.append('status', bookData.status);
                sendData.append('summary', bookData.summary);
                sendData.append('authors', JSON.stringify(bookData.authors));

                if (bookData.book_cover) {
                    sendData.append('book_cover', bookData.book_cover);
                }

                const response = await fetch(`http://localhost:${backendPort}/book/add`, {
                    method: 'POST',
                    body: sendData
                });

                if (!response.ok) {
                    throw new Error('Add book failed');
                }

                const data = await response.json();
                // Handle the response from the server
                if (data.error) {
                    console.error(data.error);
                }

                else {
                    console.log("New book added successfully")
                    navigate('/admin');
                }

                // Optionally, you can redirect the user or perform other actions based on the response
            } catch (error) {
                console.error('Error during registration:', error);
                // Handle errors, such as displaying an error message to the user
            }
        }
    };


    const handleCancel = () => {
        navigate('/admin');
    };

    const handleInputChange = (e) => {
        const { name, value, files } = e.target;

        if (name === 'book_cover') {
            const reader = new FileReader();
            reader.onload = () => {
                setBookData({
                    ...bookData,
                    book_cover_path: reader.result,
                    book_cover: files[0]
                });
            };
            reader.readAsDataURL(files[0]);
        } else if (name === 'authors') {
            try {
                let authors = value.split(",");
                setBookData({ ...bookData, authors: authors });
            } catch (error) {
                console.error("Author names separated by ','", error);
            }
        } else {
            setBookData({ ...bookData, [name]: value });
        }
    };

    return (
        <form onSubmit={handleAddBook}>
            <div className="container">
                <div className="left-half">
                    <label>
                        Book Cover:
                        <input
                            type="file"
                            accept="image/*"
                            name="book_cover"
                            onChange={(e) => handleInputChange(e)}
                        />
                        {bookData.book_cover_path && <img src={bookData.book_cover_path} alt="Book Cover" />}
                    </label>
                </div>
                <div className="right-half">
                    <div>
                        <label>
                            Book Title:
                            <input
                                type="text"
                                name="title"
                                value={bookData.title}
                                onChange={handleInputChange}
                            />
                        </label>
                    </div>
                    <div>
                        <label>
                            Author(s):
                            <input
                                type="text"
                                name="authors"
                                value={bookData.authors}
                                onChange={handleInputChange}
                            />
                        </label>
                    </div>
                    <div>
                        <label>
                            Status:
                            <input
                                type="text"
                                name="status"
                                value={bookData.status}
                                onChange={handleInputChange}
                            />
                        </label>
                    </div>
                    <div>
                        <label>
                            Release Date:
                            <input
                                type="date"
                                name="release_date"
                                value={bookData.release_date}
                                onChange={handleInputChange}
                            />
                        </label>
                    </div>
                </div>
                <div className="bottom-section">
                    <h2>Book Summary</h2>
                    <div className="summary-box">
                        <textarea
                            name="summary"
                            value={bookData.summary}
                            onChange={handleInputChange}
                            rows={5}
                            cols={50}
                        />
                    </div>
                </div>
                <div className="button-container">
                    <button type="submit">Add Book</button>
                    <button type="button" onClick={handleCancel}>Cancel</button>
                </div>
            </div>
        </form>
    );
};

export default AddBook;
