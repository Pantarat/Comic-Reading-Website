// BookPage.jsx
import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, NavLink } from 'react-router-dom';
import '../styles/Bookpage.css';
import '../styles/EditBook.css';

const EditBook = () => {
  const [searchParams] = useSearchParams();
  const bookId = searchParams.get('bookId');
  const navigate = useNavigate();
  const [error,setError] = useState(false);
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
    author_names: [],
    BookCoverFile: null
  });

  const [chapterList, setChapterList] = useState([]);

  const backendPort = process.env.REACT_APP_BACKEND_PORT || 3000;

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;

    if (name === 'Book_Cover') {
      // Handle file upload for book cover
      const reader = new FileReader();
      reader.onload = () => {
        setBookData({
          ...bookData,
          Book_Cover: reader.result,
          BookCoverFile: files[0]
        });
      };
      reader.readAsDataURL(files[0]);
    } else if (name === 'author_names') {
      try {
        let authors = value.split(",").map(item=>item.trim());
        setBookData({ ...bookData, author_names: authors });
      } catch (error) {
        console.error("Author names separated by ','", error);
      }
    }
    else {
      setBookData({ ...bookData, [name]: value });
    }
  };

  function formatDate(dateString) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  const fetchBookData = async () => {
    try {
      const response = await fetch(`http://localhost:${backendPort}/book/getBook?bookId=${bookId}`);
      const data = await response.json();
      const releaseDate = data.Release_Date;
      setBookData({ ...data, Release_Date: formatDate(releaseDate) });
    } catch (error) {
      console.error('Error fetching book data:', error);
      setError(true);
    }
  };

  const fetchBookChapter = async () => {
    try {
      const response = await fetch(`http://localhost:${backendPort}/book/getChapters?bookId=${bookId}`);
      const data = await response.json();
      setChapterList(data);
    } catch (error) {
      console.error('Error fetching book data:', error);
      setError(true);
    }
  };

  const handleConfirmEdit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('title', bookData.Title);
    formData.append('status', bookData.Status);
    formData.append('summary', bookData.Summary);
    formData.append('release_date', bookData.Release_Date);
    formData.append('authors', JSON.stringify(bookData.author_names))
    if (bookData.BookCoverFile) {
      formData.append('book_cover', bookData.BookCoverFile);
    }

    try {
      const response = await fetch(`http://localhost:${backendPort}/book/edit/${bookId}`, {
        method: 'PUT',
        body: formData, // Use the FormData object as the body
      });

      if (!response.ok) {
        throw new Error('Edit book failed');
      }

      const data = await response.json();
      // Handle the response from the server
      if (data.error) {
        console.error(data.error);
      } else {
        console.log("Book edited successfully");
        navigate('/admin');
        // Optionally, you can redirect the user or perform other actions based on the response
      }
    } catch (error) {
      console.error('Error during book edit:', error);
      // Handle errors, such as displaying an error message to the user
    }
  };

  const handleCancel = () => {
    navigate('/admin');
  }

  const [isAddChapterPopupOpen, setAddChapterPopupOpen] = useState(false);
  const [newChapterName, setNewChapterName] = useState('');
  const [newChapterNum, setNewChapterNum] = useState(0);
  const [newChapterFiles, setNewChapterFiles] = useState([]);

  const openAddChapterPopup = () => {
    setAddChapterPopupOpen(true);
  };

  const closeAddChapterPopup = () => {
    setAddChapterPopupOpen(false);
    setNewChapterName('');
    setNewChapterNum(0);
    setNewChapterFiles([]);
  };

  const handleChapterFileChange = (e) => {
    // Handle file input for new chapter pages
    const files = e.target.files;
    setNewChapterFiles([...files]);
  };

  const handleAddChapter = async (e) => {
    e.preventDefault();

    // TODO: Add logic to send a request to the server to add a new chapter
    // You can use fetch or your preferred method to send the request
    if (newChapterName.length > 0) {
      try {
        const response = await fetch(`http://localhost:${backendPort}/chapter/add`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            bookId: bookId,
            chapter_num: newChapterNum,
            chapter_name: newChapterName
          })
        })

        if (!response.ok) {
          throw new Error('Add chapter failed');
        }

        const data = await response.json();
        // Handle the response from the server
        if (data.error) {
          console.error(data.error);
        }

        else {
          fetchBookChapter();
          setAddChapterPopupOpen(false);
          console.log("New book chapter added successfully")

          const chapNum = await data.chapter_num;
          for (const file of newChapterFiles) {
            const pageFormData = new FormData();
            pageFormData.append('bookId', bookId);
            pageFormData.append('chapter_num', chapNum); // Use the chapter number from the previous response
            pageFormData.append('page', file);

            try {
              const pageResponse = await fetch(`http://localhost:${backendPort}/page/upload`, {
                method: 'POST',
                body: pageFormData,
              });

              if (!pageResponse.ok) {
                throw new Error('Add page failed');
              }

              const pageData = await pageResponse.json();
              // Handle the response from the server for adding a page
              if (pageData.error) {
                console.error(pageData.error);
              } else {
                console.log("New page added successfully");
              }
            } catch (pageError) {
              console.error('Error during adding page:', pageError);
              // Handle errors, such as displaying an error message to the user
            }
            // After successfully adding the chapter, close the popup
            navigate('/admin');
            closeAddChapterPopup();
          }

        }
      }
      catch (err) {
        console.error(err);
      }
    }
    else {
      alert("Please insert new chapter's name");
    }
  };

  const handleDeleteChapter = async (chapterNum) => {
    try {
      const response = await fetch(`http://localhost:${backendPort}/chapter/delete/`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookId: bookId,
          chapter_num: chapterNum,
        })
      });

      if (!response.ok) {
        throw new Error('Delete chapter failed');
      }

      const data = await response.json();
      // Handle the response from the server
      if (data.error) {
        console.error(data.error);
      } else {
        console.log("Chapter deleted successfully");
        // Update the chapterList state or refetch the chapters
        fetchBookChapter();
      }
    } catch (error) {
      console.error('Error during chapter deletion:', error);
      // Handle errors, such as displaying an error message to the user
    }
  }

  const [isDeleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);

  // Function to open the delete confirmation popup
  const openDeleteConfirmationPopup = () => {
    setDeleteConfirmationOpen(true);
  };

  // Function to close the delete confirmation popup
  const closeDeleteConfirmationPopup = () => {
    setDeleteConfirmationOpen(false);
  };

  // Function to handle the actual book deletion
  const handleDeleteBook = async () => {
    try {
      // Perform the book deletion logic here
      // ...
      const response = await fetch(`http://localhost:${backendPort}/book/delete/${bookId}`, {
        method: 'DELETE'
      })
      if (!response.ok) {
        throw new Error('Delete book failed');
      }

      const data = await response.json();
      // Handle the response from the server
      if (data.error) {
        console.error(data.error);
        setError(true);
      } else {
        console.log("Book deleted successfully");
        // After successful deletion, close the popup and navigate or perform other actions
        closeDeleteConfirmationPopup();
        navigate('/admin'); // Update this line as needed
      }

    } catch (error) {
      console.error('Error during book deletion:', error);
      // Handle errors, such as displaying an error message to the user
    }
  };

  useEffect(() => {
    fetchBookData();
    fetchBookChapter();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookId]);

  if (error) {
    return (<div>There seems to be a problem<br/><NavLink to="/search">Click here to return to home page.</NavLink></div>)
  }

  if (!bookData.Book_ID) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <form onSubmit={handleConfirmEdit}>
        <div className="container">
          <div className="left-half">
            <label>
              Book Cover:
              <input
                type="file"
                accept="image/*"
                name="Book_Cover"
                onChange={handleInputChange}
              />
              {bookData.Book_Cover && <img src={bookData.Book_Cover} alt="Book Cover" />}
            </label>
          </div>
          <div className="right-half">
            <div>
              <label>
                Book Name:
                <input
                  type="text"
                  name="Title"
                  value={bookData.Title}
                  onChange={handleInputChange}
                />
              </label>
            </div>
            <div>
              <label>
                Author(s):
                <input
                  type="text"
                  name="author_names"
                  value={bookData.author_names}
                  onChange={handleInputChange}
                />
              </label>
            </div>
            <div>
              <label>
                Status:
                <input
                  type="text"
                  name="Status"
                  value={bookData.Status}
                  onChange={handleInputChange}
                />
              </label>
            </div>
            <div>
              <label>
                Release Date:
                <input
                  type="date"
                  name="Release_Date"
                  value={bookData.Release_Date}
                  onChange={handleInputChange}
                />
              </label>
            </div>
            <div>
              <div>
                <label>
                  Chapter:
                  <ul>
                    {chapterList.map((chapter, index) => (
                      <p key={index} className="chapter-container">
                        <li key={index}>
                          {chapter.Chapter_Name}
                          <button type="button" className="chapter-delete-button" onClick={() => { handleDeleteChapter(chapter.Chapter_Num) }}>X</button>
                        </li>
                      </p>
                    ))}
                  </ul>
                </label>
              </div>
            </div>
          </div>
          <div className="bottom-section">
            <h2>Book Summary</h2>
            <div className="summary-box">
              <textarea
                name="Summary"
                value={bookData.Summary}
                onChange={handleInputChange}
                rows={5}
                cols={50}
              />
            </div>
          </div>
        </div>
        <div className="button-container">
          <button type="submit">Confirm Edit</button>
          <button type="button" onClick={openAddChapterPopup}>Add Chapter</button>
          <button type="button" style={{ "backgroundColor": "red" }} onClick={openDeleteConfirmationPopup}>Delete Book</button>
          <button type="button" onClick={handleCancel}>Cancel</button>
        </div>
      </form>

      {/* Delete Confirmation Popup */}
      {isDeleteConfirmationOpen && (
        <div className="popup">
          <p style={{ "fontSize": "20px", "marginBottom": "10px" }}>Are you sure you want to delete this book?</p>
          <button type="button" onClick={handleDeleteBook}>Confirm</button>
          <button type="button" onClick={closeDeleteConfirmationPopup}>Cancel</button>
        </div>
      )}

      {isAddChapterPopupOpen && (
        <div className="popup">
          <form onSubmit={handleAddChapter}>
            <label>
              New Chapter Name:
              <input
                type="text"
                value={newChapterName}
                onChange={(e) => setNewChapterName(e.target.value)}
              />
            </label>
            <label>
              New Chapter Number:
              <p>*0 means auto chapter number*</p>
              <input
                type="number"
                value={newChapterNum < 0 ? 0 : newChapterNum}
                min="0"
                onChange={(e) => setNewChapterNum(e.target.value)}
              />
            </label>
            <label>
              Chapter Pages (Images):
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleChapterFileChange}
              />
            </label>
            <button type="submit">Add Chapter</button>
            <button type="button" onClick={closeAddChapterPopup}>Cancel</button>
          </form>
        </div>
      )}
    </div>
  );
};

export default EditBook;
