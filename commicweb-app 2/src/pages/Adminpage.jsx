import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../components/AuthContext';
import '../styles/Adminpage.css';
import BookListModal from '../components/BookListModal';

const AdminPage = () => {
  const [searchText, setSearchText] = useState('');
  const [books, setBooks] = useState([]);
  const [page, setPage] = useState(1);
  const [isBookListModalOpen, setIsBookListModalOpen] = useState(false);
  const total = 99;
  const { user } = useAuth();
  const navigate = useNavigate();

  const backendPort = process.env.REACT_APP_BACKEND_PORT || 3000;

  const handleSearchChange = (e) => {
    setSearchText(e.target.value);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= total) {
      setPage(newPage);
    }
  };

  const handleAddToListButton = () => {
    setIsBookListModalOpen(true);
  };

  const handleSelectBook = (selectedBook) => {
    // Handle the selected book, e.g., add it to the list of books
    handleAddEditBook(selectedBook.Book_ID);
    // Close the modal
    setIsBookListModalOpen(false);
  };

  const handleAddEditBook = async (bookId) => {
    // Implement logic to delete the book with the specified bookId
    try {
      // Use the appropriate API endpoint to delete the book
      const response = await fetch(`http://localhost:${backendPort}/admin/addEdit`, {
        method: 'POST',
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
        handleSearch();
      } else {
        console.error(data.error);
        // Handle the error, e.g., display an error message to the user
      }
    } catch (error) {
      console.error('Error deleting book:', error);
      // Handle errors, such as displaying an error message to the user
    }
  };

  const handleAddBookButton = () => {
    navigate('/addbook');
  }

  const handleDeleteBook = async (bookId) => {
    // Implement logic to delete the book with the specified bookId
    try {
      // Use the appropriate API endpoint to delete the book
      const response = await fetch(`http://localhost:${backendPort}/admin/deleteEdit`, {
        method: 'DELETE',
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
        handleSearch();
      } else {
        console.error(data.error);
        // Handle the error, e.g., display an error message to the user
      }
    } catch (error) {
      console.error('Error deleting book:', error);
      // Handle errors, such as displaying an error message to the user
    }
  };

  const handleSearch = async () => {
    try {
      const response = await fetch(`http://localhost:${backendPort}/admin/getEdit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.User_ID,
          title: searchText,
        }),
      });
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
  }, []);

  return (
    <div>
      <BookListModal
        isOpen={isBookListModalOpen}
        onRequestClose={() => setIsBookListModalOpen(false)}
        onSelectBook={handleSelectBook}
      />
      <div className="button-container">
        <button onClick={handleAddToListButton}>Add to Edit List</button>
        <button onClick={handleAddBookButton}>Add New Book</button>
      </div>
      <div className="search-box">
        <input
          type="text"
          placeholder="Search Admin Content by Title..."
          value={searchText}
          onChange={handleSearchChange}
        />
        <button onClick={handleSearch}>Search</button>
      </div>
      <div className="big-box">
        {books.length > 0 && books.slice(10 * (page - 1), 10 * page - 1).map((book, i) => (
          <div key={i} className="book-item">
            <button
              className="delete-button"
              onClick={() => handleDeleteBook(book.Book_ID)}
            >
              &#10006;
            </button>
            <Link
              to={{
                pathname: '/editbook',
                search: `?bookId=${book.Book_ID}`,
              }}
              className="book-link"
            >
              <img
                src={book.Book_Cover}
                alt={`Cover of ${book.Title}`}
                className="book-cover"
              />
              <p style={{ padding: 0, margin: 0 }}>{book.Title}</p>
            </Link>
          </div>
        ))}
      </div>
      <div>
        <button onClick={() => handlePageChange(1)} disabled={page === 1}>
          First
        </button>
        <button onClick={() => handlePageChange(page - 1)} disabled={page === 1}>
          Prev
        </button>
        <button onClick={() => handlePageChange(page + 1)} disabled={page === total}>
          Next
        </button>
        <button onClick={() => handlePageChange(total)} disabled={page === total}>
          Last
        </button>
        <span>
          Page: {page} / {total}
        </span>
      </div>
    </div>
  );
};

export default AdminPage;
