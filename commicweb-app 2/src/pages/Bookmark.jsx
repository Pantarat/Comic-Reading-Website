import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../components/AuthContext';
import '../styles/Bookmark.css';

const Bookmark = () => {
    const [searchText, setSearchText] = useState('');
    const [page, setPage] = useState(1);
    const [books, setBooks] = useState([]);
    const total = 99;
    const { user } = useAuth();

    const backendPort = process.env.REACT_APP_BACKEND_PORT || 3000;

    const handleSearchChange = (e) => {
        setSearchText(e.target.value);
    };

    const getBookMarks = async () => {
        try {
            const response = await fetch(`http://localhost:${backendPort}/user/getBookmark?userId=${user.User_ID}&queryTitle=${searchText}`);

            const data = await response.json();
            if (response.ok) {
                setBooks(data);
            } else {
                console.error(data.error);
            }
        } catch (error) {
            console.error('Error during fetch:', error);
        }
    }

    useEffect(() => {
        getBookMarks();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
        <div>
            <div className="search-box">
                <input
                    type="text"
                    placeholder="Search Bookmarks..."
                    value={searchText}
                    onChange={handleSearchChange}
                />
                <button onClick={() => console.log(searchText)}>Search</button>
            </div>
            <div className="left-big-box">
                {books.slice(10 * (page - 1), 10 * page - 1).map((book, i) => (
                    <Link to={{
                        pathname: '/bookpage',
                        search: `?bookId=${book.Book_ID}`,
                    }} key={i} className="book-link">
                        <div className="book-item">
                            <img
                                src={book.Book_Cover}
                                alt={`Cover of ${book.Title}`}
                                className="book-cover"
                            />
                            <p style={{ padding: 0, margin: 0 }}>{book.Title}</p>
                        </div>
                    </Link>
                ))}
            </div>
            <div>
                <button onClick={() => setPage(1)} disabled={page === 1}>
                    First
                </button>
                <button onClick={() => setPage(page - 1)} disabled={page === 1}>
                    Prev
                </button>
                <button onClick={() => setPage(page + 1)} disabled={page === total}>
                    Next
                </button>
                <button onClick={() => setPage(total)} disabled={page === total}>
                    Last
                </button>
                <span>Page: {page} / {total}</span>
            </div>
        </div>
    );
};

export default Bookmark;
