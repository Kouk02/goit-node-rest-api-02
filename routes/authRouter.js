const express = require('express');
const router = express.Router();
const { registerUser, loginUser, logoutUser, getCurrentUser } = require('../controllers/authControllers');
const { verifyToken } = require('../middlewares/authMiddleware');


router.post('/register',  registerUser);
router.post('/login',   loginUser);
router.post('/logout', verifyToken, logoutUser);
router.get('/current', verifyToken, getCurrentUser);

module.exports = router;