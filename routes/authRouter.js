// authRouter.js
const express = require('express');
const router = express.Router();
const { registerUser, loginUser, logoutUser, getCurrentUser } = require('../controllers/authControllers');
const { verifyToken } = require('../middlewares/authMiddleware');

// Ендпоінт для реєстрації користувача
router.post('/register', registerUser);

// Ендпоінт для логіну користувача
router.post('/login', loginUser);

// Ендпоінт для виходу користувача (logout)
router.post('/logout', verifyToken, logoutUser);

// Ендпоінт для отримання даних поточного користувача
router.get('/current', verifyToken, getCurrentUser);

// Приклад захищеного маршруту
router.get('/protected-route', verifyToken, (req, res) => {
  res.json({ message: 'This route is protected!' });
});

module.exports = router;