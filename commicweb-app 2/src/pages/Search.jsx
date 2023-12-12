import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../styles/Search.css';

const Search = () => {
  const [searchText, setSearchText] = useState('');
  const [books, setBooks] = useState([]); // State to hold the retrieved books
  const [page, setPage] = useState(1);
  const total = 99;

  const backendPort = process.env.REACT_APP_BACKEND_PORT || 3000;

  const handleSearchChange = (e) => {
    setSearchText(e.target.value);
  };

  const handleSearch = async () => {
    try {
      const response = await fetch(`http://localhost:${backendPort}/search?title=${searchText}`);
      const data = await response.json();

      // Update the state with the retrieved books
      setBooks(data);

    } catch (error) {
      console.error('Error searching for comic:', error);
      // Handle errors, such as displaying an error message to the user
    }
  };

  useEffect(() => {
    handleSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div>
      <div className="search-box">
        <input
          type="text"
          placeholder="Search Comic..."
          value={searchText}
          onChange={handleSearchChange}
        />
        <button onClick={handleSearch}>Search</button>
      </div>
      <div className="big-box-container">
        <div className="top-box">
          {/* Display the books in the big box content */}

        </div>
        <div className="left-big-box">
          {books.length > 0 && books.slice(10 * (page - 1), 10 * page - 1).map((book, i) => (
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

export default Search;
