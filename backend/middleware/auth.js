const jwt = require('jsonwebtoken');

const authMiddleware = (roles = []) => {
  return (req, res, next) => {
    try {
      const token = req.header('Authorization')?.replace('Bearer ', '');
      if (!token) return res.status(401).json({ error: 'Access denied. No token provided.' });

      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_for_hackathon');
      req.user = decoded;

      if (roles.length && !roles.includes(req.user.role)) {
        return res.status(403).json({ error: 'Access denied. Insufficient permissions.' });
      }

      next();
    } catch (ex) {
      res.status(400).json({ error: 'Invalid token.' });
    }
  };
};

module.exports = authMiddleware;
