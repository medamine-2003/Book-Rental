import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('books');
  const [books, setBooks] = useState([]);
  const [rentals, setRentals] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    isbn: '',
    category: '',
    price: '',
    rentalPrice: '',
    stock: '',
    description: ''
  });

  useEffect(() => {
    fetchBooks();
    fetchRentals();
  }, []);

  const fetchBooks = async () => {
    try {
      const response = await api.get('/books');
      setBooks(response.data);
    } catch (error) {
      console.error('Error fetching books:', error);
    }
  };

  const fetchRentals = async () => {
    try {
      const response = await api.get('/rentals', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setRentals(response.data);
    } catch (error) {
      console.error('Error fetching rentals:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const openAddModal = () => {
    setEditingBook(null);
    setFormData({
      title: '',
      author: '',
      isbn: '',
      category: '',
      price: '',
      rentalPrice: '',
      stock: '',
      description: ''
    });
    setShowModal(true);
  };

  const openEditModal = (book) => {
    setEditingBook(book);
    setFormData({
      title: book.title,
      author: book.author,
      isbn: book.isbn,
      category: book.category,
      price: book.price,
      rentalPrice: book.rentalPrice,
      stock: book.stock,
      description: book.description || ''
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (editingBook) {
        await api.put(`/books/${editingBook._id}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await api.post('/books', formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      setShowModal(false);
      fetchBooks();
    } catch (error) {
      console.error('Error saving book:', error);
      alert('Error saving book');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this book?')) return;
    try {
      const token = localStorage.getItem('token');
      await api.delete(`/books/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchBooks();
    } catch (error) {
      console.error('Error deleting book:', error);
      alert('Error deleting book');
    }
  };

  const handleReturn = async (rentalId) => {
    try {
      const token = localStorage.getItem('token');
      await api.put(`/rentals/${rentalId}/return`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchRentals();
    } catch (error) {
      console.error('Error processing return:', error);
      alert('Error processing return');
    }
  };

  if (!user || user.role !== 'admin') {
    return <div className="access-denied">Access Denied. Admin only.</div>;
  }

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h1>Admin Dashboard</h1>
        <p>Welcome, {user?.name}</p>
      </div>

      <div className="dashboard-tabs">
        <button 
          className={activeTab === 'books' ? 'active' : ''}
          onClick={() => setActiveTab('books')}
        >
          Manage Books
        </button>
        <button 
          className={activeTab === 'rentals' ? 'active' : ''}
          onClick={() => setActiveTab('rentals')}
        >
          Manage Rentals
        </button>
      </div>

      {activeTab === 'books' && (
        <div className="dashboard-content">
          <div className="content-header">
            <h2>Book Inventory</h2>
            <button className="btn-add" onClick={openAddModal}>+ Add New Book</button>
          </div>
          
          <div className="books-table-container">
            <table className="books-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Author</th>
                  <th>ISBN</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Rental Price</th>
                  <th>Stock</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {books.map(book => (
                  <tr key={book._id}>
                    <td>{book.title}</td>
                    <td>{book.author}</td>
                    <td>{book.isbn}</td>
                    <td>{book.category}</td>
                    <td>${book.price}</td>
                    <td>${book.rentalPrice}/day</td>
                    <td>{book.stock}</td>
                    <td className="actions">
                      <button 
                        className="btn-edit"
                        onClick={() => openEditModal(book)}
                      >
                        Edit
                      </button>
                      <button 
                        className="btn-delete"
                        onClick={() => handleDelete(book._id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'rentals' && (
        <div className="dashboard-content">
          <div className="content-header">
            <h2>All Rentals</h2>
          </div>
          
          <div className="rentals-list">
            {rentals.map(rental => (
              <div key={rental._id} className="rental-card">
                <div className="rental-info">
                  <h3>{rental.book?.title || 'Unknown Book'}</h3>
                  <p><strong>User:</strong> {rental.user?.name || 'Unknown'}</p>
                  <p><strong>Email:</strong> {rental.user?.email || 'N/A'}</p>
                  <p><strong>Rented:</strong> {new Date(rental.rentalDate).toLocaleDateString()}</p>
                  <p><strong>Due:</strong> {new Date(rental.dueDate).toLocaleDateString()}</p>
                  <p><strong>Status:</strong> 
                    <span className={`status-badge ${rental.status}`}>
                      {rental.status}
                    </span>
                  </p>
                </div>
                {rental.status === 'active' && (
                  <button 
                    className="btn-return"
                    onClick={() => handleReturn(rental._id)}
                  >
                    Mark as Returned
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2>{editingBook ? 'Edit Book' : 'Add New Book'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Author *</label>
                <input
                  type="text"
                  name="author"
                  value={formData.author}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>ISBN *</label>
                <input
                  type="text"
                  name="isbn"
                  value={formData.isbn}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Category *</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select Category</option>
                  <option value="Fiction">Fiction</option>
                  <option value="Non-Fiction">Non-Fiction</option>
                  <option value="Science">Science</option>
                  <option value="Technology">Technology</option>
                  <option value="History">History</option>
                  <option value="Biography">Biography</option>
                </select>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Buy Price ($) *</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    step="0.01"
                    min="0"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Rental Price ($/day) *</label>
                  <input
                    type="number"
                    name="rentalPrice"
                    value={formData.rentalPrice}
                    onChange={handleInputChange}
                    step="0.01"
                    min="0"
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Stock *</label>
                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleInputChange}
                  min="0"
                  required
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="4"
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-submit">
                  {editingBook ? 'Update Book' : 'Add Book'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
