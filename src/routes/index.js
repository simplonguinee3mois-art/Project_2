const express = require('express');
const router = express.Router();

// Importer les routes
const authRoutes = require('./authRoutes');
const memberRoutes = require('./memberRoutes');
const taskRoutes = require('./taskRoutes');

/**
 * Routes principales de l'API
 * Base: /api
 */

// Route de santé de l'API
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API Team Task Manager - Opérationnelle',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Route d'informations sur l'API
router.get('/info', (req, res) => {
  res.json({
    success: true,
    data: {
      name: 'Team Task Manager API',
      version: '1.0.0',
      description: 'API de gestion des tâches d\'équipe avec authentification JWT',
      endpoints: {
        auth: '/auth',
        members: '/members',
        tasks: '/tasks'
      },
      features: [
        'Authentification JWT',
        'Gestion des membres d\'équipe',
        'CRUD des tâches',
        'Pagination et filtres',
        'Commentaires sur les tâches',
        'Statistiques et rapports'
      ]
    }
  });
});

// Monter les routes
router.use('/auth', authRoutes);
router.use('/members', memberRoutes);
router.use('/tasks', taskRoutes);

// Route 404 pour les endpoints non trouvés
router.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint non trouvé',
    error: 'ENDPOINT_NOT_FOUND',
    requestedUrl: req.originalUrl,
    availableEndpoints: [
      'GET /api/health',
      'GET /api/info',
      'POST /api/auth/register',
      'POST /api/auth/login',
      'GET /api/auth/profile',
      'GET /api/members',
      'POST /api/members',
      'GET /api/tasks',
      'POST /api/tasks'
    ]
  });
});

module.exports = router;
