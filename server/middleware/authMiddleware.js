const jwt = require('jsonwebtoken');

const verifyToken = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        req.user = decoded; // { uid, email, role }
        next();
    } catch (error) {
        console.error('DEBUG: Token verification failed:', error.message);
        return res.status(403).json({ error: 'Unauthorized: Invalid token', details: error.message });
    }
};

module.exports = verifyToken;
