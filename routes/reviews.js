const express = require('express');
const router = express.Router();
const { getDB, ObjectId } = require('../database/db');
const { isAuthenticated } = require('../middleware/auth');

// GET all reviews for a specific movie
router.get('/:movieId', async (req, res) => {
    try {
        const { movieId } = req.params;

        // Validate ObjectId
        if (!ObjectId.isValid(movieId)) {
            return res.status(400).json({ error: 'Invalid movie ID format' });
        }

        const db = getDB();

        // Get all reviews for this movie with user information
        const reviews = await db.collection('reviews')
            .aggregate([
                { $match: { movieId: new ObjectId(movieId) } },
                {
                    $lookup: {
                        from: 'users',
                        localField: 'userId',
                        foreignField: '_id',
                        as: 'user'
                    }
                },
                { $unwind: '$user' },
                {
                    $project: {
                        rating: 1,
                        comment: 1,
                        createdAt: 1,
                        updatedAt: 1,
                        'user.email': 1,
                        userId: 1
                    }
                },
                { $sort: { createdAt: -1 } }
            ])
            .toArray();

        // Calculate average rating
        const averageRating = reviews.length > 0
            ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
            : 0;

        res.json({
            reviews,
            averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
            reviewCount: reviews.length
        });
    } catch (err) {
        console.error('Get reviews error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// POST - Add a new review
router.post('/', isAuthenticated, async (req, res) => {
    try {
        const { movieId, rating, comment } = req.body;

        // Validation
        if (!movieId || !rating) {
            return res.status(400).json({ error: 'Movie ID and rating are required' });
        }

        if (!ObjectId.isValid(movieId)) {
            return res.status(400).json({ error: 'Invalid movie ID format' });
        }

        if (typeof rating !== 'number' || rating < 1 || rating > 5) {
            return res.status(400).json({ error: 'Rating must be between 1 and 5' });
        }

        const db = getDB();
        const userId = new ObjectId(req.session.userId);
        const movieObjectId = new ObjectId(movieId);

        // Check if user already reviewed this movie
        const existingReview = await db.collection('reviews').findOne({
            userId,
            movieId: movieObjectId
        });

        if (existingReview) {
            return res.status(400).json({
                error: 'You have already reviewed this movie. Please edit your existing review instead.',
                existingReviewId: existingReview._id
            });
        }

        // Verify movie exists
        const movie = await db.collection('movies').findOne({ _id: movieObjectId });
        if (!movie) {
            return res.status(404).json({ error: 'Movie not found' });
        }

        // Create review
        const newReview = {
            userId,
            movieId: movieObjectId,
            rating,
            comment: comment || '',
            createdAt: new Date(),
            updatedAt: new Date()
        };

        const result = await db.collection('reviews').insertOne(newReview);

        // Get user email for response
        const user = await db.collection('users').findOne({ _id: userId });

        res.status(201).json({
            message: 'Review added successfully',
            review: {
                _id: result.insertedId,
                ...newReview,
                user: { email: user.email }
            }
        });
    } catch (err) {
        console.error('Add review error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// PUT - Update own review
router.put('/:reviewId', isAuthenticated, async (req, res) => {
    try {
        const { reviewId } = req.params;
        const { rating, comment } = req.body;

        // Validate ObjectId
        if (!ObjectId.isValid(reviewId)) {
            return res.status(400).json({ error: 'Invalid review ID format' });
        }

        // Validation
        if (rating && (typeof rating !== 'number' || rating < 1 || rating > 5)) {
            return res.status(400).json({ error: 'Rating must be between 1 and 5' });
        }

        const db = getDB();
        const userId = new ObjectId(req.session.userId);
        const reviewObjectId = new ObjectId(reviewId);

        // Check if review exists and belongs to user
        const review = await db.collection('reviews').findOne({ _id: reviewObjectId });

        if (!review) {
            return res.status(404).json({ error: 'Review not found' });
        }

        if (!review.userId.equals(userId)) {
            return res.status(403).json({ error: 'You can only edit your own reviews' });
        }

        // Build update object
        const updateData = {
            updatedAt: new Date()
        };

        if (rating !== undefined) updateData.rating = rating;
        if (comment !== undefined) updateData.comment = comment;

        // Update review
        await db.collection('reviews').updateOne(
            { _id: reviewObjectId },
            { $set: updateData }
        );

        res.json({
            message: 'Review updated successfully',
            review: {
                _id: reviewObjectId,
                ...review,
                ...updateData
            }
        });
    } catch (err) {
        console.error('Update review error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// DELETE - Delete own review
router.delete('/:reviewId', isAuthenticated, async (req, res) => {
    try {
        const { reviewId } = req.params;

        // Validate ObjectId
        if (!ObjectId.isValid(reviewId)) {
            return res.status(400).json({ error: 'Invalid review ID format' });
        }

        const db = getDB();
        const userId = new ObjectId(req.session.userId);
        const reviewObjectId = new ObjectId(reviewId);

        // Check if review exists and belongs to user
        const review = await db.collection('reviews').findOne({ _id: reviewObjectId });

        if (!review) {
            return res.status(404).json({ error: 'Review not found' });
        }

        if (!review.userId.equals(userId)) {
            return res.status(403).json({ error: 'You can only delete your own reviews' });
        }

        // Delete review
        await db.collection('reviews').deleteOne({ _id: reviewObjectId });

        res.json({ message: 'Review deleted successfully' });
    } catch (err) {
        console.error('Delete review error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
