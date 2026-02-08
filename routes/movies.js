const express = require('express');
const router = express.Router();
const { getDB, ObjectId } = require('../database/db');
const { isAuthenticated } = require('../middleware/auth');
const { isAdmin } = require('../middleware/admin');

// GET all movies with filtering, sorting, and projection
// Amina's part
router.get('/', async (req, res) => {
  try {
    const db = getDB();
    const collection = db.collection('movies');

    // Build filter object from query parameters
    const filter = {};
    if (req.query.genre) {
      filter.genre = req.query.genre;
    }
    if (req.query.year) {
      filter.year = parseInt(req.query.year);
    }
    if (req.query.title) {
      // Case-insensitive search
      filter.title = { $regex: req.query.title, $options: 'i' };
    }

    // Build projection object
    const projection = {};
    if (req.query.fields) {
      const fields = req.query.fields.split(',');
      fields.forEach(field => {
        projection[field.trim()] = 1;
      });
    }

    // Hide movieLink if not logged in
    if (!req.session.userId) {
      if (Object.keys(projection).length > 0) {
        delete projection.movieLink;
      } else {
        projection.movieLink = 0;
      }
    }

    // Build sort object (default: sort by title ascending)
    let sort = { title: 1 };
    if (req.query.sortBy) {
      const sortField = req.query.sortBy;
      const sortOrder = req.query.order === 'desc' ? -1 : 1;
      sort = { [sortField]: sortOrder };
    }

    const movies = await collection
      .find(filter, { projection: Object.keys(projection).length > 0 ? projection : undefined })
      .sort(sort)
      .toArray();

    res.status(200).json({
      count: movies.length,
      data: movies
    });
  } catch (err) {
    console.error('Error fetching movies:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET movie by id
// Amina's part
router.get('/:id', async (req, res) => {
  try {
    const db = getDB();
    const collection = db.collection('movies');

    // Validate ObjectId
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid id format' });
    }

    const movie = await collection.findOne({ _id: new ObjectId(req.params.id) });

    if (!movie) {
      return res.status(404).json({ error: 'Movie not found' });
    }

    // Hide movieLink if not logged in
    if (!req.session.userId && movie.movieLink) {
      delete movie.movieLink;
    }

    if (!movie) {
      return res.status(404).json({ error: 'Movie not found' });
    }

    res.status(200).json(movie);
  } catch (err) {
    console.error('Error fetching movie:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// CREATE movie
// Yerassyl's part
// CREATE movie
// Use isAdmin
router.post('/', isAdmin, async (req, res) => {
  try {
    const { title, genre, year, rating, director, description, posterUrl, trailerUrl, movieLink } = req.body;

    // Validation
    if (!title || !genre || !year) {
      return res.status(400).json({ error: 'Missing required fields: title, genre, year' });
    }

    if (typeof year !== 'number' || year < 1800 || year > new Date().getFullYear() + 5) {
      return res.status(400).json({ error: 'Invalid year' });
    }

    if (rating && (typeof rating !== 'number' || rating < 0 || rating > 10)) {
      return res.status(400).json({ error: 'Rating must be between 0 and 10' });
    }

    const db = getDB();
    const collection = db.collection('movies');

    const newMovie = {
      title,
      genre,
      year,
      rating: rating || null,
      director: director || null,
      description: description || null,
      posterUrl: posterUrl || null,
      trailerUrl: trailerUrl || null,
      posterUrl: posterUrl || null,
      trailerUrl: trailerUrl || null,
      movieLink: movieLink || null,
      createdAt: new Date()
    };

    const result = await collection.insertOne(newMovie);

    res.status(201).json({
      message: 'Movie created successfully',
      data: {
        _id: result.insertedId,
        ...newMovie
      }
    });
  } catch (err) {
    console.error('Error creating movie:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// UPDATE movie
// Nazerke's part
// UPDATE movie
// Use isAdmin
router.put('/:id', isAdmin, async (req, res) => {
  try {
    const { title, genre, year, rating, director, description, posterUrl, trailerUrl, movieLink } = req.body;

    // Validate ObjectId
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid id format' });
    }

    // Validation
    if (!title || !genre || !year) {
      return res.status(400).json({ error: 'Missing required fields: title, genre, year' });
    }

    if (typeof year !== 'number' || year < 1800 || year > new Date().getFullYear() + 5) {
      return res.status(400).json({ error: 'Invalid year' });
    }

    if (rating && (typeof rating !== 'number' || rating < 0 || rating > 10)) {
      return res.status(400).json({ error: 'Rating must be between 0 and 10' });
    }

    const db = getDB();
    const collection = db.collection('movies');

    const updateData = {
      title,
      genre,
      year,
      rating: rating || null,
      director: director || null,
      description: description || null,
      posterUrl: posterUrl || null,
      trailerUrl: trailerUrl || null,
      posterUrl: posterUrl || null,
      trailerUrl: trailerUrl || null,
      movieLink: movieLink || null,
      updatedAt: new Date()
    };

    const result = await collection.updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Movie not found' });
    }

    res.status(200).json({
      message: 'Movie updated successfully',
      data: {
        _id: req.params.id,
        ...updateData
      }
    });
  } catch (err) {
    console.error('Error updating movie:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE movie
// Almat's part
// DELETE movie
// Use isAdmin
router.delete('/:id', isAdmin, async (req, res) => {
  try {
    // Validate ObjectId
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid id format' });
    }

    const db = getDB();
    const collection = db.collection('movies');

    const result = await collection.deleteOne({ _id: new ObjectId(req.params.id) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Movie not found' });
    }

    res.status(200).json({
      message: 'Movie deleted successfully',
      deletedId: req.params.id
    });
  } catch (err) {
    console.error('Error deleting movie:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;