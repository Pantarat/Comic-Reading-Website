// History.jsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../components/AuthContext';
import '../styles/History.css';

const History = () => {
    const [page, setPage] = useState(1);
    const total = 99;
    const [chapters, setChapters] = useState([]);
    const { user } = useAuth();

    const backendPort = process.env.REACT_APP_BACKEND_PORT || 3000;

    const fetchHistory = async () => {
        try {
            const response = await fetch(`http://localhost:${backendPort}/user/history?userId=${user.User_ID}`);
            const data = await response.json();
            console.log(data);
            setChapters(data);
        } catch (error) {
            console.error('Error fetching book data:', error);
        }

    }

    useEffect(() => {
        fetchHistory();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
        <div>
            <div className="history-container">
                <div className="history-list">
                    {chapters.length > 0 && chapters.slice(6 * (page - 1), 6 * page - 1).map((chapter, i) => (
                        <Link to={`/chapter?bookId=${chapter.Book_ID}&chapterNum=${chapter.chapter_num}`} key={i}>
                            <div key={i} className="history-item">
                                <div className="book-display">
                                    {/* You can add an image or any other visual representation here */}
                                    <img className="history-image" src={chapter.Book_Cover} alt="History" />
                                    <div className="book-info">
                                        <h2>{chapter.Title}</h2>
                                        <p>Chapter number: {chapter.chapter_num}</p>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
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

export default History;
