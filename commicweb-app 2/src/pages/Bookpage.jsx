import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../components/AuthContext';
import { Rating } from 'react-simple-star-rating'
import '../styles/Bookpage.css';

const Bookpage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    let bookId = searchParams.get('bookId');
    const { user } = useAuth();
    const [bookData, setBookData] = useState({
        Book_ID: '',
        Title: '',
        Book_Cover: '',
        Last_Updated: '',
        Release_Date: '',
        Status: '',
        Summary: '',
        Total_Rating: '',
        View_Count: '',
        author_names: []
    });
    const [isBookmarked, setBookmarked] = useState(false);

    const toggleBookmark = () => {
        setBookmarked(!isBookmarked);
        // You can also perform additional actions, like sending a request to update the bookmark status on the server.
    };

    const handleBookMarkDB = async () => {
        // Implement logic to delete the book with the specified bookId
        try {
            // Use the appropriate API endpoint to delete the book
            const response = await fetch(`http://localhost:${backendPort}/user/bookmark`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: user.User_ID,
                    bookId: bookId
                }),
            });

            const data = await response.json();

            if (response.ok) {
                // Update the state after successful deletion
                toggleBookmark();
            } else {
                console.error(data.error);
                // Handle the error, e.g., display an error message to the user
            }
        } catch (error) {
            console.error('Error deleting book:', error);
            // Handle errors, such as displaying an error message to the user
        }
    };

    const [chapterList, setChapterList] = useState([]);

    const backendPort = process.env.REACT_APP_BACKEND_PORT || 3000;

    const fetchBookData = async () => {
        try {
            const response = await fetch(`http://localhost:${backendPort}/book/getBook?bookId=${bookId}`);
            const data = await response.json();
            setBookData(data);
            fetchBookMarkChapter(data);
        } catch (error) {
            console.error('Error fetching book data:', error);
        }
    };

    const fetchBookChapter = async () => {
        try {
            const response = await fetch(`http://localhost:${backendPort}/book/getChapters?bookId=${bookId}`);
            const data = await response.json();
            setChapterList(data);
        } catch (error) {
            console.error('Error fetching book data:', error);
        }
    };

    const fetchBookMarkChapter = async (dt) => {
        try {
            const response = await fetch(`http://localhost:${backendPort}/user/getBookmark?userId=${user.User_ID}&queryTitle=${dt.Title}`);
            const data = await response.json();
            if (data.find(book => book.Title === dt.Title)) {
                setBookmarked(true);
            }
            else {
                setBookmarked(false);
            }
        } catch (error) {
            console.error('Error fetching book data:', error);
        }
    };

    const [rating, setRating] = useState(0); // Initialize the rating state
    const [ratingMsg, setRatingMsg] = useState('');

    const handleRatingChange = (newRating) => {
        setRating(newRating);
        handleRateBook(newRating);
    };

    const handleRateBook = async (newRating) => {
        try {
            // Send a request to the server to update the book rating
            const response = await fetch(`http://localhost:${backendPort}/user/rate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: user.User_ID,
                    bookId: bookId,
                    rating: newRating,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                // Handle success, e.g., display a success message to the user
                setRatingMsg(`Rated the book ${newRating}/5`);
            } else {
                console.error(data.error);
                // Handle the error, e.g., display an error message to the user
                setRatingMsg(`Rate book error: ${data.error}`);
            }
        } catch (error) {
            console.error('Error rating book:', error);
            // Handle errors, such as displaying an error message to the user
        }
    };

    const fetchRating = async () => {
        try {
            const response = await fetch(`http://localhost:${backendPort}/user/getRating?userId=${user.User_ID}&bookId=${bookId}`);
            const data = await response.json();
            if (data.rating) {
                setRatingMsg(`Rated the book ${data.rating}/5`);
                setRating(data.rating);
            }
            else {
                setRatingMsg(`You have not rated this book`);
            }
        } catch (error) {
            console.error('Error fetching book data:', error);
        }
    };

    useEffect(() => {
        fetchBookData();
        fetchBookChapter();
        fetchRating();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // useEffect(() => {
    //     handleRateBook();
    //     // eslint-disable-next-line react-hooks/exhaustive-deps
    // }, [rating])

    if (!bookData.Book_ID) {
        return <div>Loading...</div>;
    }

    const handleChapterClick = (chapterNum) => {
        navigate(`/chapter?bookId=${bookId}&chapterNum=${chapterNum}`);
    };

    return (
        <div className="container">
            <div className="left-half">
                <label>
                    {bookData.Book_Cover && <img className="book-cover-img" src={bookData.Book_Cover} alt="Book Cover" />}
                </label>
            </div>
            <div className="right-half">
                <div>
                    <label>
                        Title: {bookData.Title}
                    </label>
                </div>
                <div>
                    <label>
                        Author(s): {bookData.author_names.join(', ')}
                    </label>
                </div>
                <div>
                    <label>
                        Status: {bookData.Status}
                    </label>
                </div>
                <div>
                    <label>
                        Rating: {bookData.Total_Rating}
                    </label>
                </div>
                <div>
                    <label>
                        Last Updated: {new Intl.DateTimeFormat('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: 'numeric',
                            minute: 'numeric',
                            second: 'numeric',
                            timeZone: 'Asia/Bangkok', // Assuming the date is in UTC
                        }).format(new Date(bookData.Last_Updated))}
                    </label>
                </div>
                <div>
                    <label>
                        Release Date: {new Intl.DateTimeFormat('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                        }).format(new Date(bookData.Release_Date))}
                    </label>
                </div>
                <div>
                    <label>
                        Chapter:
                        <ul>
                            {chapterList.map((chapter, index) => (
                                <li key={index}>
                                    <Link
                                        to={`/chapter?bookId=${bookId}&chapterNum=${chapter.Chapter_Num}`}
                                        onClick={() => handleChapterClick(chapter.Chapter_Num)}
                                    >
                                        {chapter.Chapter_Name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </label>
                </div>
                <div>
                    <button onClick={handleBookMarkDB}>
                        {isBookmarked ? 'Remove Bookmark' : 'Add Bookmark'}
                    </button>
                </div>
                <div className="rating-div">
                    <label>
                        <p>Rate This Book:</p>
                        {/* <input
                            className="rate-book-slider"
                            type="range"
                            min="1"
                            max="5"
                            value={rating}
                            onChange={handleRatingChange}
                            step="1"
                        /> */}
                        <Rating
                            initialValue={rating}
                            value={rating}
                            onClick={handleRatingChange}
                            disableHover={true}  // Disable hover effect
                            allowHalf={false}     // Disable half-star selection
                            totalStars={5}        // Set the total number of stars
                            
                        /* Available Props */
                        />
                        <p><span className="rating-num">{rating}</span></p>
                        <p>{ratingMsg}</p>
                    </label>
                </div>
            </div>
            <div className="bottom-section">
                <h2>Book Summary</h2>
                <div className="summary-box">
                    <p>{bookData.Summary}</p>
                </div>
            </div>
        </div>
    );
};

export default Bookpage;
