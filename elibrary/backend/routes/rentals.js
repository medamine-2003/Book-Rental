const express = require('express');
const router = express.Router();
const Rental = require('../models/Rental');
const Book = require('../models/Book');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

// Create rental (authenticated users)
router.post('/', auth, async (req, res) => {
  try {
    const { bookId, rentalDays } = req.body;

    if (!bookId || !rentalDays) {
      return res.status(400).json({ message: 'Book ID and rental days are required' });
    }

    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    if (book.stock <= 0) {
      return res.status(400).json({ message: 'Book not available for rent' });
    }

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + rentalDays);

    const totalAmount = book.rentalPrice * rentalDays;

    const rental = new Rental({
      user: req.user.userId,
      book: bookId,
      dueDate,
      totalAmount,
      status: 'active'
    });

    await rental.save();

    // Decrease stock
    book.stock -= 1;
    await book.save();

    const populatedRental = await Rental.findById(rental._id)
      .populate('book', 'title author')
      .populate('user', 'name email');
    
    res.status(201).json(populatedRental);
  } catch (error) {
    console.error('Rental error:', error);
    res.status(500).json({ message: 'Server error creating rental' });
  }
});

// Buy book (authenticated users)
router.post('/buy', auth, async (req, res) => {
  try {
    const { bookId } = req.body;

    if (!bookId) {
      return res.status(400).json({ message: 'Book ID is required' });
    }

    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    if (book.stock <= 0) {
      return res.status(400).json({ message: 'Book not available for purchase' });
    }

    // Create a rental record with status 'purchased'
    const rental = new Rental({
      user: req.user.userId,
      book: bookId,
      dueDate: new Date(),
      totalAmount: book.price,
      status: 'purchased'
    });

    await rental.save();

    // Decrease stock
    book.stock -= 1;
    await book.save();

    res.status(201).json({ message: 'Book purchased successfully', rental });
  } catch (error) {
    console.error('Purchase error:', error);
    res.status(500).json({ message: 'Server error purchasing book' });
  }
});

// Get user's rentals (authenticated users)
router.get('/my-rentals', auth, async (req, res) => {
  try {
    const rentals = await Rental.find({ user: req.user.userId })
      .populate('book', 'title author')
      .sort({ rentalDate: -1 });
    res.json(rentals);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching rentals' });
  }
});

// Return a book (authenticated users)
router.put('/:id/return', auth, async (req, res) => {
  try {
    const rental = await Rental.findById(req.params.id);

    if (!rental) {
      return res.status(404).json({ message: 'Rental not found' });
    }

    if (rental.user.toString() !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    rental.returnDate = new Date();
    rental.status = 'returned';
    await rental.save();

    // Increase stock
    const book = await Book.findById(rental.book);
    if (book) {
      book.stock += 1;
      await book.save();
    }

    res.json({ message: 'Book returned successfully', rental });
  } catch (error) {
    res.status(500).json({ message: 'Server error returning book' });
  }
});

// Get all rentals (admin only)
router.get('/', auth, admin, async (req, res) => {
  try {
    const rentals = await Rental.find()
      .populate('user', 'name email')
      .populate('book', 'title author')
      .sort({ rentalDate: -1 });
    res.json(rentals);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching rentals' });
  }
});

module.exports = router;
