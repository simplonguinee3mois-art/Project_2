const express = require('express');
const router = express.Router();
const memberController = require('../controllers/memberController');
const { validateData, validatePagination, validateMemberFilters, validateObjectId } = require('../middleware/validation');
const { memberValidation } = require('../utils/validation');
const { authenticate, requireMember, requireAdmin } = require('../middleware/auth');

/**
 * Routes de gestion des membres
 * Base: /api/members
 */

// Toutes les routes nécessitent une authentification
router.use(authenticate);

// GET /api/members - Récupérer tous les membres avec pagination et filtres
router.get('/', 
  validatePagination,
  validateMemberFilters,
  memberController.getAllMembers
);

// GET /api/members/search - Rechercher des membres
router.get('/search', 
  validateMemberFilters,
  memberController.searchMembers
);

// GET /api/members/stats - Obtenir les statistiques des membres
router.get('/stats', 
  requireAdmin,
  memberController.getMemberStats
);

// GET /api/members/:id - Récupérer un membre par son ID
router.get('/:id', 
  validateObjectId('id'),
  memberController.getMemberById
);

// POST /api/members - Créer un nouveau membre
router.post('/', 
  requireMember,
  validateData(memberValidation.create),
  memberController.createMember
);

// PUT /api/members/:id - Mettre à jour un membre
router.put('/:id', 
  requireMember,
  validateObjectId('id'),
  validateData(memberValidation.update),
  memberController.updateMember
);

// DELETE /api/members/:id - Supprimer un membre
router.delete('/:id', 
  requireAdmin,
  validateObjectId('id'),
  memberController.deleteMember
);

module.exports = router;
