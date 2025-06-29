const express = require('express');
const router = express.Router();
const { signup, login, getProfile, updateProfile, changePassword } = require('../controllers/auth.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.post('/signup', signup);
router.post('/login', login);

// Routes protégées nécessitant une authentification
router.get('/profile', authMiddleware, getProfile);
router.put('/profile', authMiddleware, updateProfile);
router.put('/change-password', authMiddleware, changePassword);

module.exports = router