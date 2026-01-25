# Movie Library - Full Stack Application

A modern, full-stack movie management application built with Node.js, Express, MongoDB, and vanilla JavaScript. Features a beautiful dark-themed UI with complete CRUD operations, movie posters, trailer previews, and advanced filtering.

## Features

### Frontend
- Modern Dark Theme - Ink wash inspired color palette with glassmorphism effects
- Real-time Search - Debounced search with instant results
- Advanced Filtering - Filter by genre, year, and custom sorting
- Movie Posters - Display movie posters with hover-to-play trailer functionality
- Detail Modal - Click posters to view full movie details with embedded trailers
- Add/Edit Movies - Full modal interface for creating and updating movies
- Delete Functionality - Safe deletion with confirmation dialogs
- Fully Responsive - Works perfectly on desktop, tablet, and mobile
- Smooth Animations - Polished transitions and hover effects
- Toast Notifications - User-friendly success/error messages
- Movie Cards - Beautiful card design with genre tags and ratings

### Backend API
- Full CRUD Operations - Create, Read, Update, Delete movies
- MongoDB Integration - Native MongoDB driver (no Mongoose)
- Advanced Querying - Filtering, sorting, projection, and pagination
- Input Validation - Comprehensive data validation
- Error Handling - Proper HTTP status codes and error messages
- Logging Middleware - Custom request logging
- RESTful Design - Clean, standard API endpoints

## Team Members

| Name | Role | Contribution |
|------|------|-------------|
| Amina Dossan | Backend Developer | GET routes, filtering, and MongoDB queries |
| Yerassyl Alimbek | Backend Developer | POST route, validation, and data creation |
| Nazerke Abdizhamal | Full Stack Developer | PUT route, middleware, and form handling |
| Almat Zhamsat | Frontend Developer | DELETE route, styling, and UI/UX design |

## Technologies

### Backend
- Node.js (v18+) - JavaScript runtime
- Express.js (v4.18) - Web framework
- MongoDB (v7.0) - NoSQL database
- dotenv - Environment variable management

### Frontend
- HTML5 - Semantic markup
- CSS3 - Modern styling with dark theme, gradients, animations
- JavaScript (ES6+) - Vanilla JavaScript for interactivity
- Fetch API - AJAX requests

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v18 or higher)
- MongoDB (v7.0 or higher)
- npm (comes with Node.js)

## Quick Start

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd movielibrary
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Set Up Environment Variables
Create a `.env` file in the root directory:
```env
MONGO_URI=mongodb://localhost:27017
PORT=3000
NODE_ENV=development
```

### 4. Start MongoDB

**Windows:**
```bash
"C:\Program Files\MongoDB\Server\7.0\bin\mongod.exe" --dbpath="C:\data\db"
```

**macOS (with Homebrew):**
```bash
brew services start mongodb-community
```

**Linux:**
```bash
sudo systemctl start mongod
```

### 5. Start the Application
```bash
npm start
```

The server will start at: **http://localhost:3000**

## Project Structure

```
movielibrary/
├── database/
│   └── db.js                 # MongoDB connection and utilities
├── routes/
│   └── movies.js             # Movie CRUD API routes
├── views/
│   ├── index.html            # Main movie library page
│   ├── about.html            # About page
│   ├── contact.html          # Contact form page
│   └── 404.html              # 404 error page
├── public/
│   ├── client.js             # Frontend JavaScript
│   └── style.css             # Dark theme styles and animations
├── .env                      # Environment variables (create this)
├── server.js                 # Express server setup
├── package.json              # Dependencies and scripts
├── messages.json             # Contact form submissions
├── project-info.json         # API info endpoint data
└── README.md                 # This file
```

## API Documentation

### Base URL
```
http://localhost:3000/api/movies
```

### Endpoints

#### 1. GET `/api/movies`
Retrieve all movies with optional filtering, sorting, and projection.

**Query Parameters:**
| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `title` | string | Search by title (case-insensitive) | `?title=matrix` |
| `genre` | string | Filter by genre | `?genre=Sci-Fi` |
| `year` | number | Filter by year | `?year=2023` |
| `sortBy` | string | Field to sort by | `?sortBy=rating` |
| `order` | string | Sort order (`asc` or `desc`) | `?order=desc` |
| `fields` | string | Select specific fields | `?fields=title,year` |

**Example Request:**
```bash
GET /api/movies?genre=Action&sortBy=rating&order=desc
```

**Response (200 OK):**
```json
{
  "count": 2,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "title": "Inception",
      "genre": "Sci-Fi",
      "year": 2010,
      "rating": 8.8,
      "director": "Christopher Nolan",
      "description": "A mind-bending thriller about dream invasion",
      "posterUrl": "https://example.com/inception-poster.jpg",
      "trailerUrl": "https://www.youtube.com/watch?v=YoHD9XEInc0",
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

#### 2. GET `/api/movies/:id`
Retrieve a single movie by ID.

**Example Request:**
```bash
GET /api/movies/507f1f77bcf86cd799439011
```

**Response (200 OK):**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "title": "Inception",
  "genre": "Sci-Fi",
  "year": 2010,
  "rating": 8.8,
  "director": "Christopher Nolan",
  "description": "A mind-bending thriller",
  "posterUrl": "https://example.com/inception-poster.jpg",
  "trailerUrl": "https://www.youtube.com/watch?v=YoHD9XEInc0"
}
```

**Error Responses:**
- `400 Bad Request` - Invalid ID format
- `404 Not Found` - Movie not found

#### 3. POST `/api/movies`
Create a new movie.

**Request Body:**
```json
{
  "title": "The Matrix",
  "genre": "Sci-Fi",
  "year": 1999,
  "rating": 8.7,
  "director": "The Wachowskis",
  "description": "A computer hacker learns about the true nature of reality",
  "posterUrl": "https://example.com/matrix-poster.jpg",
  "trailerUrl": "https://www.youtube.com/watch?v=vKQi3bBA1y8"
}
```

**Required Fields:** `title`, `genre`, `year`

**Response (201 Created):**
```json
{
  "message": "Movie created successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439012",
    "title": "The Matrix",
    "genre": "Sci-Fi",
    "year": 1999,
    "rating": 8.7,
    "director": "The Wachowskis",
    "description": "A computer hacker learns about the true nature of reality",
    "posterUrl": "https://example.com/matrix-poster.jpg",
    "trailerUrl": "https://www.youtube.com/watch?v=vKQi3bBA1y8",
    "createdAt": "2024-01-15T11:00:00.000Z"
  }
}
```

**Error Responses:**
- `400 Bad Request` - Missing required fields or invalid data

#### 4. PUT `/api/movies/:id`
Update an existing movie.

**Request Body:**
```json
{
  "title": "The Matrix Reloaded",
  "genre": "Sci-Fi",
  "year": 2003,
  "rating": 7.2,
  "director": "The Wachowskis",
  "description": "Updated description",
  "posterUrl": "https://example.com/matrix-reloaded-poster.jpg",
  "trailerUrl": "https://www.youtube.com/watch?v=kYzz0FSgpSU"
}
```

**Response (200 OK):**
```json
{
  "message": "Movie updated successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "title": "The Matrix Reloaded",
    "genre": "Sci-Fi",
    "year": 2003,
    "rating": 7.2,
    "updatedAt": "2024-01-15T12:00:00.000Z"
  }
}
```

**Error Responses:**
- `400 Bad Request` - Invalid ID or missing required fields
- `404 Not Found` - Movie not found

#### 5. DELETE `/api/movies/:id`
Delete a movie.

**Example Request:**
```bash
DELETE /api/movies/507f1f77bcf86cd799439011
```

**Response (200 OK):**
```json
{
  "message": "Movie deleted successfully",
  "deletedId": "507f1f77bcf86cd799439011"
}
```

**Error Responses:**
- `400 Bad Request` - Invalid ID format
- `404 Not Found` - Movie not found

## Data Model

```javascript
{
  _id: ObjectId,           // Auto-generated by MongoDB
  title: String,           // Required (movie title)
  genre: String,           // Required (e.g., "Sci-Fi", "Action")
  year: Number,            // Required (1800 - current year + 5)
  rating: Number,          // Optional (0-10, can be decimal)
  director: String,        // Optional (director name)
  description: String,     // Optional (movie description)
  posterUrl: String,       // Optional (URL to movie poster image)
  trailerUrl: String,      // Optional (YouTube URL for trailer)
  createdAt: Date,         // Auto-generated on creation
  updatedAt: Date          // Auto-generated on update
}
```

## Testing the API

### Using the Web Interface
1. Visit `http://localhost:3000`
2. Use the "Add New Movie" button to create movies
3. Search, filter, and sort movies using the controls
4. Click movie posters to view details and watch trailers
5. Hover over posters to preview trailers
6. Click "Edit" to update movie details
7. Click "Delete" to remove movies

### Using curl

**Get all movies:**
```bash
curl http://localhost:3000/api/movies
```

**Create a movie:**
```bash
curl -X POST http://localhost:3000/api/movies \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Inception",
    "genre": "Sci-Fi",
    "year": 2010,
    "rating": 8.8,
    "director": "Christopher Nolan",
    "description": "A mind-bending thriller",
    "posterUrl": "https://example.com/inception.jpg",
    "trailerUrl": "https://www.youtube.com/watch?v=YoHD9XEInc0"
  }'
```

**Update a movie:**
```bash
curl -X PUT http://localhost:3000/api/movies/YOUR_MOVIE_ID \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Inception",
    "genre": "Sci-Fi",
    "year": 2010,
    "rating": 9.0,
    "director": "Christopher Nolan",
    "description": "Updated description",
    "posterUrl": "https://example.com/inception.jpg",
    "trailerUrl": "https://www.youtube.com/watch?v=YoHD9XEInc0"
  }'
```

**Delete a movie:**
```bash
curl -X DELETE http://localhost:3000/api/movies/YOUR_MOVIE_ID
```

## UI Features

### Design Elements
- Dark Theme - Ink wash inspired color palette with professional aesthetics
- Smooth Animations - Card hover effects, modal transitions
- Toast Notifications - Success/error feedback
- Loading States - Spinner animation while fetching data
- Empty States - Helpful messages when no movies found
- Responsive Design - Works on all screen sizes
- Movie Posters - Visual representation of each movie
- Trailer Preview - Hover to play trailers automatically
- Detail Modal - Full movie information with embedded trailers

### User Experience
- Debounced Search - 500ms delay to reduce API calls
- Instant Filters - Real-time filtering and sorting
- Modal Forms - Add/edit movies without page refresh
- Confirmation Dialogs - Prevent accidental deletions
- Error Handling - User-friendly error messages
- Poster Display - Visual movie library experience
- Trailer Integration - Watch trailers without leaving the page

## Validation Rules

### Movie Creation/Update
- **Title:** Required, must be a non-empty string
- **Genre:** Required, must be a non-empty string
- **Year:** Required, must be a number between 1800 and (current year + 5)
- **Rating:** Optional, must be between 0 and 10 if provided
- **Director:** Optional, string
- **Description:** Optional, string
- **Poster URL:** Optional, must be a valid URL if provided
- **Trailer URL:** Optional, must be a valid URL if provided (YouTube recommended)

## Troubleshooting

### MongoDB Connection Issues
```bash
# Check if MongoDB is running
mongosh

# If not running, start it:
# Windows
net start MongoDB

# macOS
brew services start mongodb-community

# Linux
sudo systemctl start mongod
```

### Port Already in Use
If port 3000 is already in use, change it in `.env`:
```env
PORT=3001
```

### Module Not Found Errors
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

## Assignment Checklist

- Node.js + Express project setup
- MongoDB native driver integration (no Mongoose)
- Clear folder structure (routes/, database/, views/, public/)
- express.json() middleware for parsing JSON
- Custom logger middleware
- All CRUD operations implemented
- Filtering by multiple fields
- Sorting (ascending/descending)
- Field projection
- Input validation with proper error messages
- Proper HTTP status codes
- Beautiful, functional web interface with dark theme
- Real-time search and filtering
- Add/Edit/Delete functionality in UI
- Movie poster display
- Trailer preview on hover
- Detail modal with embedded trailers
- Global 404 handler
- Comprehensive README.md

## Future Enhancements

- User authentication and authorization
- Movie poster image uploads to cloud storage
- Pagination for large datasets
- Advanced search (multiple criteria)
- Rating system with user reviews
- Export data to CSV/JSON
- Light/Dark mode toggle
- Movie recommendations based on preferences
- Watch later / favorites list
- Integration with external movie APIs (TMDB, OMDB)
- Auto-fetch posters and trailers from external APIs

## License

This project is created for educational purposes as part of a Backend Web Development course.

## Contributing

This is a student project. For any suggestions or improvements, please contact the team members.

## Contact

For questions or feedback, use the contact form at `/contact` or reach out to any team member.

---

Made with care by the MovieLib Team