import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import './MyRentals.css';

const MyRentals = () => {
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchRentals();
  }, []);

  const fetchRentals = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await api.get('/rentals/my-rentals', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRentals(response.data);
    } catch (error) {
      console.error('Error fetching rentals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReturn = async (rentalId) => {
    if (!window.confirm('Are you sure you want to return this book?')) return;

    try {
      const token = localStorage.getItem('token');
      await api.put(`/rentals/${rentalId}/return`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Book returned successfully!');
      fetchRentals();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to return book');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active': return 'status-active';
      case 'returned': return 'status-returned';
      case 'purchased': return 'status-purchased';
      case 'overdue': return 'status-overdue';
      default: return '';
    }
  };

  if (loading) {
    return <div className="loading">Loading your rentals...</div>;
  }

  return (
    <div className="my-rentals-page">
      <div className="rentals-header">
        <h1>My Rentals & Purchases</h1>
      </div>

      {rentals.length === 0 ? (
        <div className="no-rentals">
          <p>You haven't rented or purchased any books yet.</p>
          <button onClick={() => navigate('/books')} className="btn-browse">
            Browse Books
          </button>
        </div>
      ) : (
        <div className="rentals-grid">
          {rentals.map((rental) => (
            <div key={rental._id} className={`rental-card ${getStatusBadge(rental.status)}`}>
              <div className="rental-cover">
                📚
              </div>
              <div className="rental-details">
                <h3>{rental.book?.title || 'Unknown Book'}</h3>
                <p className="book-author">by {rental.book?.author || 'Unknown'}</p>
                
                <div className="rental-info">
                  <div className="info-row">
                    <span className="label">Rented:</span>
                    <span>{new Date(rental.rentalDate).toLocaleDateString()}</span>
                  </div>
                  {rental.status !== 'purchased' && (
                    <div className="info-row">
                      <span className="label">Due:</span>
                      <span>{new Date(rental.dueDate).toLocaleDateString()}</span>
                    </div>
                  )}
                  {rental.returnDate && (
                    <div className="info-row">
                      <span className="label">Returned:</span>
                      <span>{new Date(rental.returnDate).toLocaleDateString()}</span>
                    </div>
                  )}
                  <div className="info-row">
                    <span className="label">Amount:</span>
                    <span className="amount">${rental.totalAmount.toFixed(2)}</span>
                  </div>
                </div>

                <div className="rental-status">
                  <span className={`status-badge ${getStatusBadge(rental.status)}`}>
                    {rental.status.toUpperCase()}
                  </span>
                </div>

                {rental.status === 'active' && (
                  <button 
                    onClick={() => handleReturn(rental._id)}
                    className="btn-return"
                  >
                    Return Book
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyRentals;
