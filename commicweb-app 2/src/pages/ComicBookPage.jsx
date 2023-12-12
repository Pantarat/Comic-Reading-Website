// ComicBookPage.jsx

import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../components/AuthContext';
import '../styles/ComicBookPage.css';

const ComicBookPage = () => {
  const [currentChapter, setCurrentChapter] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [chapterList, setChapterList] = useState([]);
  const [pages, setPages] = useState([]);
  const [searchParams] = useSearchParams();
  const [totalPages, setTotalPages] = useState(50);
  const bookId = searchParams.get('bookId');
  const chapterNum = searchParams.get('chapterNum');
  const navigate = useNavigate();
  const { user } = useAuth();

  const backendPort = process.env.REACT_APP_BACKEND_PORT || 3000;

  const handleChapterChange = (e) => {
    setCurrentChapter(e.target.value);
    setCurrentPage(1);
    navigate(`/chapter?bookId=${bookId}&chapterNum=${e.target.value}`);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      window.scrollTo(0, 0);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      window.scrollTo(0, 0);
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

  const fetchChapterPages = async () => {
    try {
      const response = await fetch(`http://localhost:${backendPort}/chapter/getPages?bookId=${bookId}&chapter_num=${chapterNum}`);
      const data = await response.json();
      setPages(data);
      setTotalPages(data.length);
    } catch (error) {
      console.error('Error fetching book data:', error);
    }
  };

  const addToView = async () => {
    try {
      const response = await fetch(`http://localhost:${backendPort}/user/updateview`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          "userId": user.User_ID,
          "bookId": bookId,
          "chapter_num": chapterNum
        })
      })
      const data = await response.json();

      if (response.ok) {
        // Update the state after successful deletion
      } else {
        console.error(data.error);
        // Handle the error, e.g., display an error message to the user
      }
    }
    catch (error) {
      console.error('Error updating view', error);
    }
  }

  useEffect(() => {
    setCurrentChapter(chapterNum);
    setCurrentPage(1);
    addToView();
    fetchBookChapter();
    fetchChapterPages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookId, chapterNum]);

  useEffect(() => {
    setCurrentChapter(chapterNum);
    setCurrentPage(1);
    addToView();
    fetchChapterPages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div>
      <div className="updated-comic-content">
        {/* Updated position */}
        <div>
          <p>Page {currentPage} of Chapter {currentChapter}</p>
        </div>
      </div>
      <div className="chapter-page">
        {pages.length > 0 && (
          <img className="page-img" src={pages[currentPage - 1].Page_Path} alt={`Page ${currentPage} of chapter ${currentChapter}`} />
        )}
      </div>
      <label>
        Select Chapter:
        <div>
          <select
            className="updated-navigation-dropdown"
            value={currentChapter}
            onChange={(e) => handleChapterChange(e)}
          >
            {chapterList.map((chapter, index) => (
              <option key={index} className="chapter-options" value={chapter.Chapter_Num}>
                {chapter.Chapter_Name}
              </option>
            ))}
          </select>
        </div>
      </label>

      <div className="updated-navigation-container">
        <div className="navigation-buttons">
          <button className="updated-navigation-button" onClick={handlePrevPage}>
            Previous Page
          </button>
          <button className="updated-navigation-button" onClick={handleNextPage}>
            Next Page
          </button>
        </div>
      </div>
    </div>
  );
};

export default ComicBookPage;
