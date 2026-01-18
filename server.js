const express = require('express');
const path = require('path');
const fs = require('fs');
const { connectDB } = require('./database/db');
const moviesRouter = require('./routes/movies');

const app = express();
const PORT = 3000;

// Custom logger middleware (Nazerke's part)
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Built-in middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Home page route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views/index.html'));
});

// About page
app.get('/about', (req, res) => {
  res.sendFile(path.join(__dirname, 'views/about.html'));
});

// Contact page (GET)
app.get('/contact', (req, res) => {
  res.sendFile(path.join(__dirname, 'views/contact.html'));
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

// API Routes - Movies CRUD
app.use('/api/movies', moviesRouter);

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