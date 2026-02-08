const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { getDB, ObjectId } = require('../database/db');

// --- Validation helpers ---
function isValidEmail(email) {
    // Simple pragmatic email check
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(String(email || '').trim());
}

function normalizePhone(phone) {
    const raw = String(phone || '').trim();
    const digits = raw.replace(/\D/g, '');
    return { raw, digits };
}

function validateRegisterInput({ name, email, password, phone }) {
    const fieldErrors = {};

    const cleanName = String(name || '').trim();
    const cleanEmail = String(email || '').trim();

    if (!cleanName) {
        fieldErrors.name = 'Name is required';
    } else {
        if (cleanName.length < 2 || cleanName.length > 50) {
            fieldErrors.name = 'Name must be 2–50 characters long';
        }
        // Must contain at least one Unicode letter (supports Cyrillic + Kazakh + etc.)
        // and must not be digits-only.
        const hasLetter = /\p{L}/u.test(cleanName);
        if (!hasLetter) fieldErrors.name = 'Name must contain at least one letter';
        if (/^\d+$/u.test(cleanName)) fieldErrors.name = 'Name cannot consist of digits only';

        // Optional: block “name” that is only symbols/spaces (e.g., "----")
        const hasDigitOrLetter = /[\p{L}\d]/u.test(cleanName);
        if (!hasDigitOrLetter) fieldErrors.name = 'Name is not valid';
    }

    if (!cleanEmail) {
        fieldErrors.email = 'Email is required';
    } else if (!isValidEmail(cleanEmail)) {
        fieldErrors.email = 'Please enter a valid email address';
    }

    const cleanPassword = String(password || '');
    if (!cleanPassword) {
        fieldErrors.password = 'Password is required';
    } else if (cleanPassword.length < 6) {
        fieldErrors.password = 'Password must be at least 6 characters long';
    }

    if (phone !== undefined && String(phone).trim() !== '') {
        const { digits } = normalizePhone(phone);
        // Allow 10–15 digits (covers most intl formats)
        if (digits.length < 10 || digits.length > 15) {
            fieldErrors.phone = 'Phone number must contain 10–15 digits';
        }
    }

    return { fieldErrors, cleanName, cleanEmail };
}

// Register
router.post('/register', async (req, res) => {
    try {
        const { email, password, name, phone } = req.body;

        const { fieldErrors, cleanName, cleanEmail } = validateRegisterInput({ name, email, password, phone });
        if (Object.keys(fieldErrors).length > 0) {
            return res.status(400).json({ error: 'Validation failed', fieldErrors });
        }

        const db = getDB();
        const users = db.collection('users');

        const existingUser = await users.findOne({ email: cleanEmail });
        if (existingUser) {
            return res.status(400).json({ error: 'Validation failed', fieldErrors: { email: 'This email is already registered' } });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = {
            name: cleanName,
            email: cleanEmail,
            phone: phone ? String(phone).trim() : '',
            password: hashedPassword,
            role: 'user',
            createdAt: new Date()
        };

        const result = await users.insertOne(newUser);

        // Auto login after register
        req.session.userId = result.insertedId;
        req.session.role = newUser.role; // Store role in session

        res.status(201).json({ message: 'User registered' });
    } catch (err) {
        console.error('Register error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const cleanEmail = String(email || '').trim();
        const cleanPassword = String(password || '');

        const fieldErrors = {};
        if (!cleanEmail) fieldErrors.email = 'Email is required';
        else if (!isValidEmail(cleanEmail)) fieldErrors.email = 'Please enter a valid email address';
        if (!cleanPassword) fieldErrors.password = 'Password is required';

        if (Object.keys(fieldErrors).length > 0) {
            return res.status(400).json({ error: 'Validation failed', fieldErrors });
        }

        const db = getDB();
        const users = db.collection('users');

        const user = await users.findOne({ email: cleanEmail });
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(cleanPassword, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        req.session.userId = user._id;
        req.session.role = user.role; // Store role in session
        res.json({ message: 'Logged in successfully' });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Logout
router.post('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).json({ error: 'Could not log out' });
        }
        res.clearCookie('connect.sid');
        res.json({ message: 'Logged out successfully' });
    });
});

// Status check
router.get('/status', async (req, res) => {
    if (req.session.userId) {
        try {
            const db = getDB();
            const user = await db.collection('users').findOne(
                { _id: new ObjectId(req.session.userId) },
                { projection: { password: 0 } }
            );
            return res.json({
                isAuthenticated: true,
                user: user ? {
                    email: user.email,
                    role: user.role,
                    name: user.name,
                    phone: user.phone || ''
                } : null
            });
        } catch (err) {
            console.error('Status check error:', err);
            return res.json({ isAuthenticated: false });
        }
    }
    res.json({ isAuthenticated: false });
});

module.exports = router;
