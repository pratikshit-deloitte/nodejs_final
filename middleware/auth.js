const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  const token = req.header('Authorization');

  if (!token) {
    return res.status(401).json({ message: 'No token provided. Access denied.' });
  }

  jwt.verify(token, process.env.SECRET_KEY, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid token. Access denied.' });
    }

    // Set the authenticated user information in the request object
    req.user = user;
    next();
  });
};

module.exports = authenticateToken;
