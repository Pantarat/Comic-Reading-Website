// BookListModal.jsx
import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';

const BookListModal = ({ isOpen, onRequestClose, onSelectBook, onAddBook }) => {
    const [books, setBooks] = useState([]);

    const backendPort = process.env.REACT_APP_BACKEND_PORT || 3000;

    const handleSearch = async () => {
        try {
            const response = await fetch(`http://localhost:${backendPort}/search?title=`);
            const data = await response.json();

            // Update the state with the retrieved books
            setBooks(data);

        } catch (error) {
            console.error('Error searching for comic:', error);
            // Handle errors, such as displaying an error message to the user
        }
    };

    // Fetch the list of books when the modal is opened
    useEffect(() => {
        handleSearch();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onRequestClose}
            contentLabel="Book List Modal"
            appElement={document.getElementById('root') || undefined}
        >
            <h2>Book List</h2>
            <ul>
                {books.length > 0 && books.map((book, index) => (
                    <li key={index} onClick={() => {
                        onSelectBook(book);
                    }}>
                        {book.Title}
                    </li>
                ))}
            </ul>
        </Modal>
    );
};

export default BookListModal;
