const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { validateData } = require('../middleware/validation');
const { authValidation } = require('../utils/validation');
const { authenticate } = require('../middleware/auth');

/**
 * Routes d'authentification
 * Base: /api/auth
 */

// POST /api/auth/register - Inscription d'un nouvel utilisateur
router.post('/register', 
  validateData(authValidation.register), 
  authController.register
);

// POST /api/auth/login - Connexion d'un utilisateur
router.post('/login', 
  validateData(authValidation.login), 
  authController.login
);

// POST /api/auth/logout - Déconnexion (optionnel)
router.post('/logout', authController.logout);

// GET /api/auth/profile - Récupérer le profil de l'utilisateur connecté
router.get('/profile', 
  authenticate, 
  authController.getProfile
);

// PUT /api/auth/profile - Mettre à jour le profil de l'utilisateur connecté
router.put('/profile', 
  authenticate, 
  authController.updateProfile
);

module.exports = router;
