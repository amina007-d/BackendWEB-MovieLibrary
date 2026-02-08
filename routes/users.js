const express = require('express');
const router = express.Router();
const { getDB, ObjectId } = require('../database/db');
const { isAuthenticated } = require('../middleware/auth');

// Get Watchlist
router.get('/', isAuthenticated, async (req, res) => {
    try {
        const db = getDB();
        const watchlist = await db.collection('watchlist')
            .find({ userId: new ObjectId(req.session.userId) })
            .toArray();

        if (watchlist.length === 0) {
            return res.json([]);
        }

        const movieIds = watchlist.map(item => item.movieId);
        const movies = await db.collection('movies')
            .find({ _id: { $in: movieIds } })
            .toArray();

        res.json(movies);
    } catch (err) {
        console.error('Get watchlist error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Add to Watchlist
router.post('/', isAuthenticated, async (req, res) => {
    try {
        const { movieId } = req.body;
        if (!movieId) {
            return res.status(400).json({ error: 'Movie ID required' });
        }

        const db = getDB();

        // check if already added
        const exists = await db.collection('watchlist').findOne({
            userId: new ObjectId(req.session.userId),
            movieId: new ObjectId(movieId)
        });

        if (exists) {
            return res.status(400).json({ error: 'Movie already in watchlist' });
        }

        await db.collection('watchlist').insertOne({
            userId: new ObjectId(req.session.userId),
            movieId: new ObjectId(movieId),
            addedAt: new Date()
        });

        res.status(201).json({ message: 'Added to watchlist' });
    } catch (err) {
        console.error('Add watchlist error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Remove from Watchlist
router.delete('/:movieId', isAuthenticated, async (req, res) => {
    try {
        const movieId = req.params.movieId;
        const db = getDB();

        const result = await db.collection('watchlist').deleteOne({
            userId: new ObjectId(req.session.userId),
            movieId: new ObjectId(movieId)
        });

        if (result.deletedCount === 0) {
            return res.status(404).json({ error: 'Not found in watchlist' });
        }

        res.json({ message: 'Removed from watchlist' });
    } catch (err) {
        console.error('Remove watchlist error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
