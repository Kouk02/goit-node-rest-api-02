const jwt = require('jsonwebtoken');
const User = require('../models/userModel');


const JWT_SECRET = process.env.TOKEN_SECRET || 'default_secret_key';

exports.verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: "Not authorized" });
    }

    const token = authHeader.slice(7);
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.sub);

    if (!user || user.token !== token) {
      return res.status(401).json({ message: "Not authorized" });
    }

    req.user = user;
    next();
  } catch (err) {
    if (err instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ message: "Invalid token" });
    } else if (err instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ message: "Token expired" });
    } else {
      return res.status(401).json({ message: "Not authorized" });
    }
  }
};