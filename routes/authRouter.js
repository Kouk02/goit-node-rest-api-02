const express = require('express');
const router = express.Router();
const { registerUser, loginUser, logoutUser, getCurrentUser } = require('../controllers/authControllers');
const { verifyToken } = require('../middlewares/authMiddleware');
const  validateAuthBody  = require('../middlewares/validateAuthBody');
const { registerSchema, loginSchema } = require('../schemas/authSchemas'); 

router.post("/register", validateAuthBody(registerSchema), registerUser); 
router.post("/login", validateAuthBody(loginSchema), loginUser);
router.post('/logout', verifyToken, logoutUser);
router.get('/current', verifyToken, getCurrentUser);
module.exports = router;