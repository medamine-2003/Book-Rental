# 📚 E-Library - Book Rental & Buying Platform

A full-stack MVP for an E-library platform where users can rent or buy books, and admins can manage the inventory.

## Features

### User Portal
- 🔐 JWT Authentication (Login/Register)
- 📖 Browse books by category
- 🔍 Search books by title or author
- 📅 Rent books for specified days
- 💰 Purchase books outright
- 📋 View rental history and purchases
- ✅ Return rented books

### Admin Dashboard
- 📊 Manage book inventory (CRUD operations)
- 👥 View all user rentals
- ✅ Process book returns
- 📈 Track rental status

## Tech Stack

### Backend
- Node.js + Express
- MongoDB + Mongoose
- JWT Authentication
- CORS enabled

### Frontend
- React 18 + Vite
- React Router DOM
- Axios for API calls
- Context API for state management
- CSS3 with red/white color scheme

## Project Structure

```
elibrary/
├── backend/
│   ├── models/
│   │   ├── User.js
│   │   ├── Book.js
│   │   └── Rental.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── books.js
│   │   └── rentals.js
│   ├── middleware/
│   │   ├── auth.js
│   │   └── admin.js
│   ├── .env
│   └── server.js
└── frontend/
    └── src/
        ├── components/
        │   └── Navbar.jsx
        ├── pages/
        │   ├── Login.jsx
        │   ├── Register.jsx
        │   ├── Books.jsx
        │   ├── MyRentals.jsx
        │   └── AdminDashboard.jsx
        ├── context/
        │   └── AuthContext.jsx
        ├── services/
        │   └── api.js
        └── App.jsx
```

## Setup Instructions

### Prerequisites
- Node.js (v16+)
- MongoDB (local or Atlas)
- npm or yarn

### Backend Setup

1. Navigate to backend folder:
```bash
cd elibrary/backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file with:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/elibrary
JWT_SECRET=your-secret-key-here
```

4. Start the server:
```bash
npm start
```

### Frontend Setup

1. Navigate to frontend folder:
```bash
cd elibrary/frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start development server:
```bash
npm run dev
```

4. Open browser at `http://localhost:5173`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Books
- `GET /api/books` - Get all books (public)
- `GET /api/books/:id` - Get single book
- `POST /api/books` - Create book (admin only)
- `PUT /api/books/:id` - Update book (admin only)
- `DELETE /api/books/:id` - Delete book (admin only)

### Rentals
- `POST /api/rentals` - Create rental (authenticated)
- `POST /api/rentals/buy` - Purchase book (authenticated)
- `GET /api/rentals/my-rentals` - Get user's rentals
- `PUT /api/rentals/:id/return` - Return book
- `GET /api/rentals` - Get all rentals (admin only)

## Default Admin Account

To create an admin account, register normally then manually update the user's role in MongoDB:

```javascript
db.users.updateOne(
  { email: "admin@example.com" },
  { $set: { role: "admin" } }
)
```

## Color Scheme

- Primary Red: `#e63946`
- Dark Red: `#c1121f`
- White: `#ffffff`
- Light Gray: `#f8f9fa`
- Dark Blue: `#1d3557`

## License

MIT
