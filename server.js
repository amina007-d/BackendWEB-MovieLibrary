const express = require('express');
const path = require('path');
const fs = require('fs');
//const sqlite3 = require('sqlite3').verbose();

const app = express();
const PORT = 3000;

const { ObjectId } = require('mongodb');
const connectDB = require('../database/mongo');

const router = express.Router();
const COLLECTION = 'items';

/* GET all items (filtering, sorting, projection) */
router.get('/', async (req, res) => {
  try {
    const db = await connectDB();

    const filter = {};
    if (req.query.genre) filter.genre = req.query.genre;
    if (req.query.year) filter.year = Number(req.query.year);

    const projection = req.query.fields
      ? req.query.fields.split(',').reduce((acc, f) => {
          acc[f] = 1;
          return acc;
        }, {})
      : {};

    const sort = req.query.sort
      ? { [req.query.sort]: req.query.order === 'desc' ? -1 : 1 }
      : {};

    const items = await db
      .collection(COLLECTION)
      .find(filter)
      .project(projection)
      .sort(sort)
      .toArray();

    res.status(200).json(items);
  } catch {
    res.status(500).json({ error: 'Database error' });
  }
});

/* GET by id */
router.get('/:id', async (req, res) => {
  try {
    const db = await connectDB();
    const item = await db
      .collection(COLLECTION)
      .findOne({ _id: new ObjectId(req.params.id) });

    if (!item) return res.status(404).json({ error: 'Record not found' });
    res.status(200).json(item);
  } catch {
    res.status(400).json({ error: 'Invalid id' });
  }
});

/* CREATE */
router.post('/', async (req, res) => {
  const { title, genre, year } = req.body;

  if (!title || !genre || !year)
    return res.status(400).json({ error: 'Missing fields' });

  try {
    const db = await connectDB();
    const result = await db.collection(COLLECTION).insertOne({
      title,
      genre,
      year,
    });

    res.status(201).json({ _id: result.insertedId, title, genre, year });
  } catch {
    res.status(500).json({ error: 'Database error' });
  }
});

/* UPDATE */
router.put('/:id', async (req, res) => {
  const { title, genre, year } = req.body;

  if (!title || !genre || !year)
    return res.status(400).json({ error: 'Missing fields' });

  try {
    const db = await connectDB();
    const result = await db.collection(COLLECTION).updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: { title, genre, year } }
    );

    if (!result.matchedCount)
      return res.status(404).json({ error: 'Record not found' });

    res.status(200).json({ message: 'Updated' });
  } catch {
    res.status(400).json({ error: 'Invalid id' });
  }
});

/* DELETE */
router.delete('/:id', async (req, res) => {
  try {
    const db = await connectDB();
    const result = await db
      .collection(COLLECTION)
      .deleteOne({ _id: new ObjectId(req.params.id) });

    if (!result.deletedCount)
      return res.status(404).json({ error: 'Record not found' });

    res.status(200).json({ message: 'Deleted' });
  } catch {
    res.status(400).json({ error: 'Invalid id' });
  }
});

module.exports = router;






















































/*
// Database setup (SQLite)
const db = new sqlite3.Database('./movies.db', (err) => {
  if (err) {
    console.error(err.message);
  } else {
    console.log('Connected to SQLite database');
  }
});
*/
/*
// Create table automatically on server start
db.run(`
  CREATE TABLE IF NOT EXISTS movies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    genre TEXT NOT NULL,
    year INTEGER NOT NULL
  )
`);
*/

// Nazerke's part "Custom logger middleware (HTTP method + URL)"
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());


app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views/index.html'));
});

app.get('/about', (req, res) => {
  res.sendFile(path.join(__dirname, 'views/about.html'));
});

app.get('/contact', (req, res) => {
  res.sendFile(path.join(__dirname, 'views/contact.html'));
});

/*
// Amina's part "returns project information in JSON format"
app.get('/api/info', (req, res) => {
  fs.readFile('project-info.json', 'utf8', (err, data) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to load project info' });
    }

    res.json(JSON.parse(data));
  });
});


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

//Almat
app.get('/item/:id', (req, res) => {
  const itemId = req.params.id;

  // Checking validation
  if (!itemId || isNaN(itemId)) {
    return res.status(400).send('<h2>400 - Invalid item ID</h2>');
  }

  res.send(`
    <h1>Item Page</h1>
    <p>You requested item with ID: <strong>${itemId}</strong></p>
    <a href="/">Go back home</a>
  `);
});


// Yerassyl's part "Search route using query parameter"
app.get('/search', (req, res) => {
  const q = req.query.q;

  // validation
  if (!q) {
    return res.status(400).send('<h2>400 - Search query missing</h2><p>Use /search?q=movieName</p>');
  }

  res.send(`
    <h1>Search Results</h1>
    <p>You searched for: <strong>${q}</strong></p>
    <a href="/">Back to Home</a>
  `);
});

// GET all movies (Amina)
app.get('/api/movies', (req, res) => {
  db.all('SELECT * FROM movies ORDER BY id ASC', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.status(200).json(rows);
  });
});

// GET movie by id (Amina)
app.get('/api/movies/:id', (req, res) => {
  const id = parseInt(req.params.id);

  if (isNaN(id)) {
    return res.status(400).json({ error: 'Invalid id' });
  }

  db.get('SELECT * FROM movies WHERE id = ?', [id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (!row) {
      return res.status(404).json({ error: 'Movie not found' });
    }
    res.status(200).json(row);
  });
});

// CREATE movie (Yerassyl)
app.post('/api/movies', (req, res) => {
  const { title, genre, year } = req.body;

  if (!title || !genre || !year) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  db.run(
    'INSERT INTO movies (title, genre, year) VALUES (?, ?, ?)',
    [title, genre, year],
    function (err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.status(201).json({ id: this.lastID, title, genre, year });
    }
  );
});

// UPDATE movie (Nazerke)
app.put('/api/movies/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const { title, genre, year } = req.body;

  if (isNaN(id)) {
    return res.status(400).json({ error: 'Invalid id' });
  }

  if (!title || !genre || !year) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  db.run(
    'UPDATE movies SET title = ?, genre = ?, year = ? WHERE id = ?',
    [title, genre, year, id],
    function (err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Movie not found' });
      }
      res.status(200).json({ message: 'Movie updated' });
    }
  );
});

// DELETE movie (Almat)
app.delete('/api/movies/:id', (req, res) => {
  const id = parseInt(req.params.id);

  if (isNaN(id)) {
    return res.status(400).json({ error: 'Invalid id' });
  }

  db.run('DELETE FROM movies WHERE id = ?', [id], function (err) {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Movie not found' });
    }
    res.status(200).json({ message: 'Movie deleted' });
  });
});

// 404 Handler
app.use((req, res) => {
  if (req.originalUrl.startsWith('/api')) {
    res.status(404).json({ error: 'API route not found' });
  } else {
    res.status(404).sendFile(path.join(__dirname, 'views/404.html'));
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
*/