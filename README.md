# MovieLib - Movie Library Management System

A full-stack web application for managing and discovering movies, built with Node.js, Express, and MongoDB. Features include user authentication, role-based access control, personal watchlists, and movie reviews.

## Table of Contents

- [Features](#features)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [API Documentation](#api-documentation)
- [Security Implementation](#security-implementation)
- [Database Design](#database-design)
- [Team Members](#team-members)
- [Assignment Requirements](#assignment-requirements)

---

## Features

### Core Functionality
- **Movie Management**: Full CRUD operations for movies (Admin only)
- **User Authentication**: Secure login/register with session-based authentication
- **Role-Based Access Control**: Distinct permissions for `admin` and `user` roles
- **Personal Watchlist**: Users can save movies to their personal watchlist
- **Review System**: Users can rate and review movies (1-5 stars)
- **Advanced Search & Filtering**: Search by title, filter by genre/year, sort by various criteria
- **Responsive UI**: Modern, mobile-friendly interface with dark theme

### User Roles
- **Admin**:
  - Create, edit, and delete movies
  - Manage users (view all users, delete users)
  - Access admin dashboard
  - All user permissions

- **Regular User**:
  - View all movies
  - Add/remove movies from personal watchlist
  - Write, edit, and delete their own reviews
  - Update their profile information

---

## Technology Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **express-session** - Session management
- **connect-mongo** - MongoDB session store
- **bcryptjs** - Password hashing
- **dotenv** - Environment variable management

### Frontend
- **Vanilla JavaScript** - Client-side logic
- **HTML5/CSS3** - Structure and styling
- **Fetch API** - Asynchronous requests

---

## Project Structure

```
BackendWEB-MovieLibrary/
├── database/
│   └── db.js                 # MongoDB connection configuration
├── middleware/
│   ├── admin.js              # Admin role authorization middleware
│   └── auth.js               # Authentication middleware
├── public/
│   ├── client.js             # Frontend JavaScript logic
│   └── style.css             # Application styling
├── routes/
│   ├── auth.js               # Authentication routes (login, register, logout)
│   ├── movies.js             # Movie CRUD routes
│   ├── reviews.js            # Review management routes
│   ├── users.js              # User management routes
│   └── watchlist.js          # Watchlist management routes
├── views/
│   ├── 404.html              # Error page
│   ├── about.html            # About page
│   ├── admin.html            # Admin dashboard
│   ├── contact.html          # Contact page
│   ├── index.html            # Home page
│   └── watchlist.html        # User watchlist page
├── .env                      # Environment variables (not in repo)
├── .gitignore               # Git ignore file
├── package.json             # Project dependencies
├── server.js                # Application entry point
└── README.md                # Project documentation
```

---

## Installation

### Prerequisites
- **Node.js** (v14 or higher)
- **MongoDB Atlas account** (or local MongoDB instance)
- **npm** or **yarn**

### Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd BackendWEB-MovieLibrary
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create `.env` file**
   ```bash
   cp .env.example .env
   ```

4. **Configure environment variables** (see [Configuration](#configuration))

5. **Start the server**
   ```bash
   # Development mode
   npm run dev

   # Production mode
   npm start
   ```

6. **Access the application**
   ```
   http://localhost:3000
   ```

---

## Configuration

Create a `.env` file in the root directory:

```env
# MongoDB Connection
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/movieLibraryDB?retryWrites=true&w=majority

# Session Secret (change in production!)
SESSION_SECRET=your_super_secret_session_key_change_this_in_production

# Environment
NODE_ENV=development
# Set to 'production' when deploying
```

### Security Notes
- **Never commit `.env` to version control**
- Change `SESSION_SECRET` to a random, strong key in production
- Set `NODE_ENV=production` when deploying to enable secure cookies

---

## Usage

### For Regular Users

1. **Register an Account**
   - Click "Register" in the navigation
   - Fill in name, email, phone (optional), and password
   - Password must be at least 6 characters

2. **Browse Movies**
   - View all movies on the home page
   - Use search bar to find specific titles
   - Filter by genre or year
   - Sort by title, year, or rating

3. **Manage Watchlist**
   - Click "Watchlist" button on any movie card
   - Access "My Watchlist" from navigation
   - Remove movies from watchlist as needed

4. **Write Reviews**
   - Click on a movie poster to open details
   - Rate from 1-5 stars
   - Write a comment (optional)
   - Edit or delete your own reviews

5. **Update Profile**
   - Click your name in the navigation
   - Update name, phone, or password
   - Save changes

### For Administrators

1. **Access Admin Dashboard**
   - Log in with admin credentials
   - Navigate to "Admin" in the menu

2. **Manage Movies**
   - **Add Movie**: Click "Add New Movie" button
   - **Edit Movie**: Click "Edit" on any movie
   - **Delete Movie**: Click "Delete" (requires confirmation)

3. **Manage Users**
   - View all registered users
   - Delete user accounts (except admins)

---

## API Documentation

### Hosted URL

https://movielibrary-3w4z.onrender.com

### Base URL
```
http://localhost:3000/api
```

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "password": "securepassword"
}

Response: 201 Created
{
  "message": "User registered"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securepassword"
}

Response: 200 OK
{
  "message": "Logged in successfully"
}
```

#### Logout
```http
POST /api/auth/logout

Response: 200 OK
{
  "message": "Logged out successfully"
}
```

#### Check Auth Status
```http
GET /api/auth/status

Response: 200 OK
{
  "isAuthenticated": true,
  "user": {
    "email": "john@example.com",
    "role": "user",
    "name": "John Doe"
  }
}
```

---

### Movie Endpoints

#### Get All Movies (with filters)
```http
GET /api/movies?genre=Action&year=2023&sortBy=rating&order=desc

Response: 200 OK
{
  "count": 15,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "title": "The Matrix",
      "genre": "Sci-Fi",
      "year": 1999,
      "rating": 8.7,
      "director": "Wachowski Brothers",
      "description": "A computer hacker learns...",
      "posterUrl": "https://...",
      "trailerUrl": "https://youtube.com/...",
      "movieLink": "https://...",
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

**Query Parameters:**
- `title` - Search by title (case-insensitive)
- `genre` - Filter by genre
- `year` - Filter by year
- `sortBy` - Sort field (title, year, rating)
- `order` - Sort order (asc, desc)
- `fields` - Projection (comma-separated field names)

#### Get Single Movie
```http
GET /api/movies/:id

Response: 200 OK
{
  "_id": "507f1f77bcf86cd799439011",
  "title": "The Matrix",
  ...
}
```

#### Create Movie (Admin Only)
```http
POST /api/movies
Authorization: Required (Admin)
Content-Type: application/json

{
  "title": "Inception",
  "genre": "Sci-Fi",
  "year": 2010,
  "rating": 8.8,
  "director": "Christopher Nolan",
  "description": "A thief who steals...",
  "posterUrl": "https://...",
  "trailerUrl": "https://...",
  "movieLink": "https://..."
}

Response: 201 Created
{
  "message": "Movie created successfully",
  "data": { ... }
}
```

#### Update Movie (Admin Only)
```http
PUT /api/movies/:id
Authorization: Required (Admin)
Content-Type: application/json

{
  "title": "Inception",
  "rating": 9.0
}

Response: 200 OK
{
  "message": "Movie updated successfully"
}
```

#### Delete Movie (Admin Only)
```http
DELETE /api/movies/:id
Authorization: Required (Admin)

Response: 200 OK
{
  "message": "Movie deleted successfully",
  "deletedId": "507f1f77bcf86cd799439011"
}
```

---

### Watchlist Endpoints

#### Get User Watchlist
```http
GET /api/watchlist
Authorization: Required

Response: 200 OK
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "title": "The Matrix",
    ...
  }
]
```

#### Add to Watchlist
```http
POST /api/watchlist
Authorization: Required
Content-Type: application/json

{
  "movieId": "507f1f77bcf86cd799439011"
}

Response: 201 Created
{
  "message": "Added to watchlist"
}
```

#### Remove from Watchlist
```http
DELETE /api/watchlist/:movieId
Authorization: Required

Response: 200 OK
{
  "message": "Removed from watchlist"
}
```

---

### Review Endpoints

#### Get Movie Reviews
```http
GET /api/reviews/:movieId

Response: 200 OK
{
  "reviews": [
    {
      "_id": "...",
      "rating": 5,
      "comment": "Amazing movie!",
      "createdAt": "2024-02-08T10:00:00Z",
      "user": {
        "email": "john@example.com"
      }
    }
  ],
  "averageRating": 4.5,
  "reviewCount": 10
}
```

#### Add Review
```http
POST /api/reviews
Authorization: Required
Content-Type: application/json

{
  "movieId": "507f1f77bcf86cd799439011",
  "rating": 5,
  "comment": "Absolutely brilliant!"
}

Response: 201 Created
{
  "message": "Review added successfully"
}
```

#### Update Review
```http
PUT /api/reviews/:reviewId
Authorization: Required (Owner only)
Content-Type: application/json

{
  "rating": 4,
  "comment": "Updated review"
}

Response: 200 OK
{
  "message": "Review updated successfully"
}
```

#### Delete Review
```http
DELETE /api/reviews/:reviewId
Authorization: Required (Owner only)

Response: 200 OK
{
  "message": "Review deleted successfully"
}
```

---

### User Endpoints

#### Get All Users (Admin Only)
```http
GET /api/users
Authorization: Required (Admin)

Response: 200 OK
[
  {
    "_id": "...",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "createdAt": "2024-01-15T10:30:00Z"
  }
]
```

#### Update Profile
```http
PUT /api/users/profile
Authorization: Required
Content-Type: application/json

{
  "name": "John Smith",
  "phone": "+9876543210",
  "password": "newpassword"
}

Response: 200 OK
{
  "message": "Profile updated successfully"
}
```

#### Delete User (Admin Only)
```http
DELETE /api/users/:id
Authorization: Required (Admin)

Response: 200 OK
{
  "message": "User deleted successfully"
}
```

---

## Security Implementation

### Authentication
- **Session-based authentication** using `express-session`
- Sessions stored in MongoDB via `connect-mongo`
- Session IDs transmitted via secure cookies

### Password Security
- **bcrypt hashing** with salt rounds (10)
- Passwords never stored in plain text
- Generic error messages to prevent user enumeration

### Cookie Security
```javascript
cookie: {
    httpOnly: true,    // Prevents XSS attacks
    secure: true,      // HTTPS only (production)
    maxAge: 86400000   // 24 hours
}
```

- **HttpOnly**: Prevents JavaScript access to cookies
- **Secure**: Cookies only sent over HTTPS
- **SameSite**: CSRF protection (default: Lax)

### Authorization Middleware

#### `isAuthenticated` - Protects user-specific routes
```javascript
const isAuthenticated = (req, res, next) => {
    if (req.session && req.session.userId) {
        return next();
    }
    return res.status(401).json({ error: 'Unauthorized access' });
};
```

#### `isAdmin` - Protects admin-only routes
```javascript
const isAdmin = (req, res, next) => {
    if (req.session && req.session.role === 'admin') {
        return next();
    }
    return res.status(403).json({ error: 'Admin privileges required' });
};
```

### Input Validation
- Email format validation using regex
- Password minimum length (6 characters)
- Name validation (2-50 characters, must contain letters)
- Phone number validation (10-15 digits)
- MongoDB ObjectId validation
- Year range validation (1800-2030)
- Rating range validation (0-10)

### Error Handling
- Proper HTTP status codes
- Safe error messages (no sensitive information leaked)
- Try-catch blocks on all async operations
- Validation errors returned with field-specific messages

---

## Database Design

### Collections

#### 1. **users**
```javascript
{
  _id: ObjectId,
  name: String,              // Required, 2-50 chars
  email: String,             // Required, unique, valid email
  phone: String,             // Optional, 10-15 digits
  password: String,          // Required, bcrypt hashed
  role: String,              // "user" or "admin"
  createdAt: Date
}
```

#### 2. **movies**
```javascript
{
  _id: ObjectId,
  title: String,             // Required
  genre: String,             // Required
  year: Number,              // Required, 1800-2030
  rating: Number,            // Optional, 0-10
  director: String,          // Optional
  description: String,       // Optional
  posterUrl: String,         // Optional, image URL
  trailerUrl: String,        // Optional, YouTube URL
  movieLink: String,         // Optional, watch link (hidden if not logged in)
  createdAt: Date,
  updatedAt: Date
}
```

#### 3. **watchlist**
```javascript
{
  _id: ObjectId,
  userId: ObjectId,          // Ref: users._id
  movieId: ObjectId,         // Ref: movies._id
  addedAt: Date
}
```

#### 4. **reviews**
```javascript
{
  _id: ObjectId,
  userId: ObjectId,          // Ref: users._id
  movieId: ObjectId,         // Ref: movies._id
  rating: Number,            // Required, 1-5
  comment: String,           // Optional
  createdAt: Date,
  updatedAt: Date
}
```

### Relationships
```
users (1) ──────< (N) watchlist (N) >────── (1) movies
users (1) ──────< (N) reviews   (N) >────── (1) movies
```

### Indexes (Recommended)
```javascript
// Unique email for users
db.users.createIndex({ email: 1 }, { unique: true });

// Movie search optimization
db.movies.createIndex({ title: "text" });
db.movies.createIndex({ genre: 1, year: -1 });

// Watchlist composite index
db.watchlist.createIndex({ userId: 1, movieId: 1 }, { unique: true });

// Reviews composite index
db.reviews.createIndex({ userId: 1, movieId: 1 }, { unique: true });
db.reviews.createIndex({ movieId: 1, createdAt: -1 });
```

---

## Team Members

- **Amina Dossan** - Backend routes (GET endpoints, filtering, sorting, projection)
- **Nazerke Abdizhamal** - HTML pages and UI structure
- **Yerassyl Alimbek** - Search functionality and page routing
- **Almat Zhamsat** - Styling, layout, and responsive design


#### 1. **Project Base**
- Node.js + Express backend from Assignment 3 Part 2
- MongoDB database
- No removal of existing CRUD functionality
- Deployed application with public URL

#### 2. **Domain Data**
- Main entity: `movies` (not generic "items")
- 8+ meaningful fields per movie
- 20+ realistic records in database
- Logical data structure

#### 3. **Production Web Interface**
- All CRUD operations via Web UI
- Data displayed in grid layout
- CREATE via modal form
- UPDATE via edit modal
- DELETE with confirmation
- Dynamic data loading from API

#### 4. **Sessions-based Authentication**
- Login via Web UI
- Server creates session after login
- Session ID stored in cookie
- Session persists between requests

#### 5. **Authentication & Authorization**
- Middleware protection implemented
- Write operations protected
- Unauthorized users cannot modify data

#### 6. **Cookies Security**
- HttpOnly flag enabled
- Secure flag in production
- No sensitive data in cookies

#### 7. **Password Security**
- bcrypt hashing with 10 salt rounds
- No plain-text storage
- Generic error messages

#### 8. **Validation & Error Handling**
- Input validation on all endpoints
- Correct HTTP status codes
- Safe error handling

#### 1. **Project Base**
- Same project from Assignment 4
- Node.js + Express
- MongoDB
- Modular structure (routes, middleware, database)

#### 2. **Database Logic & Domain Data**
- **Four collections**: users, movies, watchlist, reviews
- **Realistic domain**: Movie library system
- **Logical relations**: userId ↔ movieId
- **Pagination**: Can be added (see recommendations below)

#### 3. **Authentication**
- Sessions-based authentication
- Login/logout functionality
- bcrypt password hashing

#### 4. **Authorization & Roles**
- **Two roles**: `user` and `admin`
- **Role-based middleware**: `isAdmin` middleware
- **Owner access**: Users modify only their own watchlist/reviews
- **Admin permissions**: CRUD movies, delete users

#### 5. **API Endpoint Security**
- All write endpoints protected
- No public update/delete operations
- Validation and error handling

#### 6. **Deployment & Environment**
- Environment variables for secrets
- No hardcoded secrets
- Production-ready configuration

---

## Deployment

### Deploying to Render/Railway/Heroku

1. **Set Environment Variables**
   ```
   MONGO_URI=<your-mongodb-connection-string>
   SESSION_SECRET=<random-strong-secret>
   NODE_ENV=production
   ```

2. **Update `package.json`**
   ```json
   "scripts": {
     "start": "node server.js",
     "dev": "nodemon server.js"
   }
   ```

3. **Push to Git**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

4. **Deploy**
   - Follow platform-specific instructions
   - Ensure `NODE_ENV=production` is set

---

## Development

### Running Locally
```bash
npm install
npm run dev
```

### Environment Setup
1. Create MongoDB Atlas cluster
2. Get connection string
3. Add to `.env` file
4. Create admin user manually in database:

```javascript
// Run this in MongoDB shell or Compass
db.users.insertOne({
  name: "Admin User",
  email: "admin@movielib.com",
  password: "$2a$10$...", // bcrypt hash of "admin123"
  role: "admin",
  phone: "",
  createdAt: new Date()
});
```

### Testing
- **Manual testing**: Use the Web UI
- **API testing**: Use Postman or Thunder Client
- **Auth testing**: Try accessing protected routes without login

---

## Future Enhancements

### Planned Features
- [ ] Pagination for large datasets
- [ ] Advanced search with multiple filters
- [ ] Movie recommendations based on watchlist
- [ ] Social features (follow users, share lists)
- [ ] Email verification
- [ ] Password reset functionality
- [ ] Movie API integration (TMDB, OMDB)
- [ ] Export watchlist to CSV
- [ ] Dark/Light theme toggle
- [ ] Multi-language support

### Pagination Implementation (Recommended)
```javascript
// Add to routes/movies.js
router.get('/', async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  const movies = await collection
    .find(filter)
    .sort(sort)
    .skip(skip)
    .limit(limit)
    .toArray();

  const total = await collection.countDocuments(filter);

  res.json({
    data: movies,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  });
});
```

---


## License
This project is created for educational purposes as part of the Backend Web Development course.
