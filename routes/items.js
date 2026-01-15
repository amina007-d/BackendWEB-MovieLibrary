const express = require('express');
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
