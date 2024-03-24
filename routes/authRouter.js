const express = require('express');
const router = express.Router();
const { registerUser, loginUser, logoutUser, getCurrentUser, updateUserAvatar } = require('../controllers/authControllers');
const { verifyToken } = require('../middlewares/authMiddleware');
const  validateAuthBody  = require('../middlewares/validateAuthBody');
const { registerSchema, loginSchema } = require('../schemas/authSchemas'); 
const configureMulter = require('../middlewares/multer');
const { verifyEmail } = require('../controllers/authControllers');
const upload = configureMulter();


router.post("/register", validateAuthBody(registerSchema), registerUser); 
router.post("/login", validateAuthBody(loginSchema), loginUser);
router.post('/logout', verifyToken, logoutUser);
router.get('/current', verifyToken, getCurrentUser);

router.patch('/avatars', verifyToken, upload.single('avatar'), updateUserAvatar);
router.get('/verify/:verificationToken', verifyEmail);

module.exports = router;