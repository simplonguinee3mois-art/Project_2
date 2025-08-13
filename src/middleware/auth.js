const { verifyToken, extractTokenFromHeader } = require('../utils/jwt');
const User = require('../models/User');

/**
 * Middleware d'authentification JWT
 * Vérifie le token et ajoute les informations utilisateur à req.user
 */
const authenticate = async (req, res, next) => {
  try {
    // Extraire le token du header Authorization
    const authHeader = req.headers.authorization;
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token d\'authentification manquant',
        error: 'AUTH_TOKEN_MISSING'
      });
    }

    // Vérifier et décoder le token
    const decoded = verifyToken(token);

    // Récupérer l'utilisateur depuis la base de données
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Utilisateur non trouvé',
        error: 'USER_NOT_FOUND'
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Compte utilisateur désactivé',
        error: 'USER_INACTIVE'
      });
    }

    // Ajouter l'utilisateur à la requête
    req.user = user;
    next();

  } catch (error) {
    console.error('Erreur d\'authentification:', error.message);
    
    if (error.message === 'Token invalide ou expiré') {
      return res.status(401).json({
        success: false,
        message: 'Token invalide ou expiré',
        error: 'INVALID_TOKEN'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Erreur d\'authentification',
      error: 'AUTH_ERROR'
    });
  }
};

/**
 * Middleware de vérification des rôles
 * Vérifie si l'utilisateur a le rôle requis
 */
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentification requise',
        error: 'AUTH_REQUIRED'
      });
    }

    // Convertir en tableau si c'est une seule chaîne
    const requiredRoles = Array.isArray(roles) ? roles : [roles];

    if (!requiredRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Permissions insuffisantes',
        error: 'INSUFFICIENT_PERMISSIONS'
      });
    }

    next();
  };
};

/**
 * Middleware de vérification de propriétaire
 * Vérifie si l'utilisateur est le propriétaire de la ressource ou un admin
 */
const requireOwnershipOrAdmin = (resourceModel) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentification requise',
          error: 'AUTH_REQUIRED'
        });
      }

      // Les admins peuvent tout faire
      if (req.user.role === 'admin') {
        return next();
      }

      const resourceId = req.params.id;
      const resource = await resourceModel.findById(resourceId);

      if (!resource) {
        return res.status(404).json({
          success: false,
          message: 'Ressource non trouvée',
          error: 'RESOURCE_NOT_FOUND'
        });
      }

      // Vérifier si l'utilisateur est le propriétaire
      if (resource.createdBy && resource.createdBy.toString() === req.user._id.toString()) {
        return next();
      }

      // Vérifier si l'utilisateur est assigné à la tâche (pour les tâches)
      if (resource.assignedTo && resource.assignedTo.toString() === req.user._id.toString()) {
        return next();
      }

      return res.status(403).json({
        success: false,
        message: 'Permissions insuffisantes',
        error: 'INSUFFICIENT_PERMISSIONS'
      });

    } catch (error) {
      console.error('Erreur de vérification de propriétaire:', error);
      return res.status(500).json({
        success: false,
        message: 'Erreur de vérification des permissions',
        error: 'PERMISSION_CHECK_ERROR'
      });
    }
  };
};

/**
 * Middleware de vérification d'admin
 * Vérifie si l'utilisateur est un administrateur
 */
const requireAdmin = requireRole('admin');

/**
 * Middleware de vérification de membre
 * Vérifie si l'utilisateur est au moins un membre
 */
const requireMember = requireRole(['admin', 'member']);

module.exports = {
  authenticate,
  requireRole,
  requireAdmin,
  requireMember,
  requireOwnershipOrAdmin
};
