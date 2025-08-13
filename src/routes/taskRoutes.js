const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const { validateData, validatePagination, validateTaskFilters, validateObjectId } = require('../middleware/validation');
const { taskValidation } = require('../utils/validation');
const { authenticate, requireMember, requireOwnershipOrAdmin } = require('../middleware/auth');
const Task = require('../models/Task');

/**
 * Routes de gestion des tâches
 * Base: /api/tasks
 */

// Toutes les routes nécessitent une authentification
router.use(authenticate);

// GET /api/tasks - Récupérer toutes les tâches avec pagination et filtres
router.get('/', 
  validatePagination,
  validateTaskFilters,
  taskController.getAllTasks
);

// GET /api/tasks/stats - Obtenir les statistiques des tâches
router.get('/stats', 
  requireMember,
  taskController.getTaskStats
);

// GET /api/tasks/:id - Récupérer une tâche par son ID
router.get('/:id', 
  validateObjectId('id'),
  taskController.getTaskById
);

// POST /api/tasks - Créer une nouvelle tâche
router.post('/', 
  requireMember,
  validateData(taskValidation.create),
  taskController.createTask
);

// PUT /api/tasks/:id - Mettre à jour une tâche
router.put('/:id', 
  requireMember,
  validateObjectId('id'),
  validateData(taskValidation.update),
  requireOwnershipOrAdmin(Task),
  taskController.updateTask
);

// DELETE /api/tasks/:id - Supprimer une tâche
router.delete('/:id', 
  requireMember,
  validateObjectId('id'),
  requireOwnershipOrAdmin(Task),
  taskController.deleteTask
);

// PATCH /api/tasks/:id/complete - Marquer une tâche comme terminée
router.patch('/:id/complete', 
  requireMember,
  validateObjectId('id'),
  requireOwnershipOrAdmin(Task),
  taskController.completeTask
);

// POST /api/tasks/:id/comments - Ajouter un commentaire à une tâche
router.post('/:id/comments', 
  requireMember,
  validateObjectId('id'),
  validateData(taskValidation.addComment),
  taskController.addComment
);

module.exports = router;
