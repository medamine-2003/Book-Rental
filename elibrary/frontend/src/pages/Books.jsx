import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import './Books.css';

const Books = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchBooks();
  }, [category]);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const response = await api.get('/books');
      setBooks(response.data);
    } catch (error) {
      console.error('Error fetching books:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      let filtered = books;
      if (searchTerm) {
        filtered = filtered.filter(book => 
          book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          book.author.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      if (category) {
        filtered = filtered.filter(book => book.category === category);
      }
      setBooks(filtered);
    } catch (error) {
      console.error('Error searching books:', error);
    }
  };

  const handleRent = async (bookId) => {
    if (!user) {
      alert('Please login to rent books');
      navigate('/login');
      return;
    }
    
    const days = prompt('How many days do you want to rent this book?', '7');
    if (!days || isNaN(days) || parseInt(days) <= 0) {
      alert('Please enter a valid number of days');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await api.post('/rentals', { 
        bookId, 
        rentalDays: parseInt(days) 
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Book rented successfully!');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to rent book');
    }
  };

  const handleBuy = async (bookId, title) => {
    if (!user) {
      alert('Please login to purchase books');
      navigate('/login');
      return;
    }

    if (!window.confirm(`Do you want to buy "${title}"?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await api.post('/rentals/buy', { 
        bookId 
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Book purchased successfully!');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to purchase book');
    }
  };

  const categories = ['Fiction', 'Non-Fiction', 'Science', 'Technology', 'History', 'Biography'];

  return (
    <div className="books-page">
      <div className="books-header">
        <h1>Browse Our Collection</h1>
        
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            placeholder="Search by title or author..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <select 
            value={category} 
            onChange={(e) => setCategory(e.target.value)}
            className="category-select"
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <button type="submit" className="btn-search">Search</button>
        </form>
      </div>

      {loading ? (
        <div className="loading">Loading books...</div>
      ) : (
        <div className="books-grid">
          {books.length === 0 ? (
            <p className="no-books">No books found</p>
          ) : (
            books.map((book) => (
              <div key={book._id} className="book-card">
                <div className="book-cover">
                  <div className="book-placeholder">📚</div>
                </div>
                <div className="book-info">
                  <h3>{book.title}</h3>
                  <p className="book-author">by {book.author}</p>
                  <p className="book-category">{book.category}</p>
                  {book.description && (
                    <p className="book-description">{book.description.substring(0, 100)}...</p>
                  )}
                  <div className="book-prices">
                    <span className="rent-price">Rent: ${book.rentalPrice}/day</span>
                    <span className="buy-price">Buy: ${book.price}</span>
                  </div>
                  <div className="book-stock">
                    Stock: {book.stock}
                  </div>
                  <div className="book-actions">
                    <button 
                      onClick={() => handleRent(book._id)}
                      disabled={book.stock <= 0}
                      className={`btn-rent ${book.stock <= 0 ? 'btn-disabled' : ''}`}
                    >
                      {book.stock <= 0 ? 'Not Available' : 'Rent Now'}
                    </button>
                    <button 
                      onClick={() => handleBuy(book._id, book.title)}
                      className="btn-buy"
                    >
                      Buy Now
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default Books;
