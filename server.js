const express = require('express');
const path = require('path');
const fs = require('fs');
const { connectDB, mongoURI } = require('./database/db');
const moviesRouter = require('./routes/movies');
const authRouter = require('./routes/auth');
const watchlistRouter = require('./routes/watchlist');
const reviewsRouter = require('./routes/reviews');
const usersRouter = require('./routes/users');
const session = require('express-session');
const { MongoStore } = require('connect-mongo');

const app = express();
const PORT = process.env.PORT || 3000;

// Custom logger middleware (Nazerke's part)
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Built-in middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Session Middleware with MongoDB store
app.use(session({
  secret: process.env.SESSION_SECRET || 'secret_key_assignment4',
  resave: false,
  saveUninitialized: false,
  store: new MongoStore({
    mongoUrl: mongoURI,
    touchAfter: 24 * 3600 // lazy session update
  }),
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 1000 * 60 * 60 * 24 // 1 day
  }
}));

// Home page route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views/index.html'));
});

// About page
app.get('/about', (req, res) => {
  res.sendFile(path.join(__dirname, 'views/about.html'));
});

// Watchlist page
app.get('/watchlist', (req, res) => {
  res.sendFile(path.join(__dirname, 'views/watchlist.html'));
});

// Contact page (GET)
app.get('/contact', (req, res) => {
  res.sendFile(path.join(__dirname, 'views/contact.html'));
});

// Admin page
const { isAdmin } = require('./middleware/admin'); // Import here or at top
app.get('/admin', (req, res, next) => {
  // Basic auth check for page load, actual data is protected by API
  if (req.session && req.session.role === 'admin') {
    res.sendFile(path.join(__dirname, 'views/admin.html'));
  } else {
    res.status(403).send('<h2>Access Denied</h2><a href="/">Go Home</a>');
  }
});

// API info endpoint (Amina's part)
app.get('/api/info', (req, res) => {
  fs.readFile('project-info.json', 'utf8', (err, data) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to load project info' });
    }
    res.json(JSON.parse(data));
  });
});

// Contact form submission
app.post('/contact', (req, res) => {
  const data = {
    name: req.body.name,
    email: req.body.email,
    message: req.body.message,
    time: new Date().toISOString()
  };

  fs.readFile('messages.json', 'utf8', (err, content) => {
    const messages = content ? JSON.parse(content) : [];
    messages.push(data);

    fs.writeFile('messages.json', JSON.stringify(messages, null, 2), () => {
      res.send(`<h2>Thanks, ${data.name}! Your message has been received.</h2>`);
    });
  });
});

// Item route (Almat's part)
app.get('/item/:id', (req, res) => {
  const itemId = req.params.id;

  if (!itemId || isNaN(itemId)) {
    return res.status(400).send('<h2>400 - Invalid item ID</h2>');
  }

  res.send(`
    <h1>Item Page</h1>
    <p>You requested item with ID: <strong>${itemId}</strong></p>
    <a href="/">Go back home</a>
  `);
});

// Search route (Yerassyl's part)
app.get('/search', (req, res) => {
  const q = req.query.q;

  if (!q) {
    return res.status(400).send('<h2>400 - Search query missing</h2><p>Use /search?q=movieName</p>');
  }

  res.send(`
    <h1>Search Results</h1>
    <p>You searched for: <strong>${q}</strong></p>
    <a href="/">Back to Home</a>
  `);
});

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/movies', moviesRouter);
app.use('/api/watchlist', watchlistRouter);
app.use('/api/watchlist', watchlistRouter);
app.use('/api/reviews', reviewsRouter);
app.use('/api/users', usersRouter);

// Global 404 handler for API routes
app.use((req, res) => {
  if (req.originalUrl.startsWith('/api')) {
    res.status(404).json({ error: 'API route not found' });
  } else {
    res.status(404).sendFile(path.join(__dirname, 'views/404.html'));
  }
});

// Start server after database connection
async function startServer() {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

startServer();