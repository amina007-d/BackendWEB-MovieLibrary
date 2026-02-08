const isAdmin = (req, res, next) => {
    if (req.session && req.session.userId && req.session.role === 'admin') {
        return next();
    }
    return res.status(403).json({ error: 'Access denied. Admin privileges required.' });
};

module.exports = { isAdmin };
