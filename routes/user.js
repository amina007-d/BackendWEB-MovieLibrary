const express = require('express');
const router = express.Router();
const { getDB, ObjectId } = require('../database/db');
const { isAdmin } = require('../middleware/admin');

// GET all users (Admin only)
router.get('/', isAdmin, async (req, res) => {
    try {
        const db = getDB();
        const users = await db.collection('users').find({}, { projection: { password: 0 } }).toArray();
        res.json(users);
    } catch (err) {
        console.error('Get users error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// DELETE user (Admin only)
router.delete('/:id', isAdmin, async (req, res) => {
    try {
        const userId = req.params.id;

        if (!ObjectId.isValid(userId)) {
            return res.status(400).json({ error: 'Invalid user ID' });
        }

        const db = getDB();
        const result = await db.collection('users').deleteOne({ _id: new ObjectId(userId) });

        if (result.deletedCount === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ message: 'User deleted successfully' });
    } catch (err) {
        console.error('Delete user error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// UPDATE user profile (Self)
router.put('/profile', async (req, res) => {
    try {
        if (!req.session.userId) {
            return res.status(401).json({ error: 'Not authenticated' });
        }

        const { name, phone, password } = req.body;
        const db = getDB();
        const users = db.collection('users');

        const updateData = {};
        if (name) updateData.name = name;
        if (phone) updateData.phone = phone;

        if (password) {
            const bcrypt = require('bcryptjs');
            updateData.password = await bcrypt.hash(password, 10);
        }

        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({ error: 'No fields to update' });
        }

        const result = await users.updateOne(
            { _id: new ObjectId(req.session.userId) },
            { $set: updateData }
        );

        res.json({ message: 'Profile updated successfully' });
    } catch (err) {
        console.error('Update profile error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
