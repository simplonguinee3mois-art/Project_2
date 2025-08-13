const { validate } = require('../utils/validation');

/**
 * Middleware de validation des données d'entrée
 * @param {Object} schema - Le schéma Joi à utiliser pour la validation
 * @param {string} source - La source des données ('body', 'query', 'params')
 */
const validateData = (schema, source = 'body') => {
  return (req, res, next) => {
    try {
      const data = req[source];
      const validatedData = validate(schema, data);
      
      // Remplacer les données originales par les données validées
      req[source] = validatedData;
      next();
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: 'Données invalides',
        error: 'VALIDATION_ERROR',
        details: error.message
      });
    }
  };
};

/**
 * Middleware de validation des paramètres de pagination
 */
const validatePagination = (req, res, next) => {
  try {
    const { page, limit, sort, order } = req.query;
    
    // Validation des paramètres de pagination
    const paginationData = {
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 10,
      sort: sort || 'createdAt',
      order: order || 'desc'
    };

    // Vérifications supplémentaires
    if (paginationData.page < 1) {
      return res.status(400).json({
        success: false,
        message: 'Le numéro de page doit être supérieur à 0',
        error: 'INVALID_PAGE'
      });
    }

    if (paginationData.limit < 1 || paginationData.limit > 100) {
      return res.status(400).json({
        success: false,
        message: 'La limite doit être comprise entre 1 et 100',
        error: 'INVALID_LIMIT'
      });
    }

    // Champs de tri autorisés
    const allowedSortFields = ['createdAt', 'dueDate', 'priority', 'status', 'title', 'firstName', 'lastName'];
    if (!allowedSortFields.includes(paginationData.sort)) {
      return res.status(400).json({
        success: false,
        message: 'Champ de tri non autorisé',
        error: 'INVALID_SORT_FIELD'
      });
    }

    // Ordres autorisés
    if (!['asc', 'desc'].includes(paginationData.order)) {
      return res.status(400).json({
        success: false,
        message: 'Ordre de tri invalide',
        error: 'INVALID_SORT_ORDER'
      });
    }

    // Ajouter les données validées à la requête
    req.pagination = paginationData;
    next();

  } catch (error) {
    return res.status(400).json({
      success: false,
      message: 'Paramètres de pagination invalides',
      error: 'PAGINATION_ERROR',
      details: error.message
    });
  }
};

/**
 * Middleware de validation des filtres de tâches
 */
const validateTaskFilters = (req, res, next) => {
  try {
    const filters = {};
    
    // Filtres autorisés
    if (req.query.status) {
      const allowedStatuses = ['pending', 'in_progress', 'completed', 'cancelled'];
      if (!allowedStatuses.includes(req.query.status)) {
        return res.status(400).json({
          success: false,
          message: 'Statut de tâche invalide',
          error: 'INVALID_STATUS'
        });
      }
      filters.status = req.query.status;
    }

    if (req.query.priority) {
      const allowedPriorities = ['low', 'medium', 'high', 'urgent'];
      if (!allowedPriorities.includes(req.query.priority)) {
        return res.status(400).json({
          success: false,
          message: 'Priorité invalide',
          error: 'INVALID_PRIORITY'
        });
      }
      filters.priority = req.query.priority;
    }

    if (req.query.assignedTo) {
      // Vérifier que c'est un ObjectId valide
      if (!/^[0-9a-fA-F]{24}$/.test(req.query.assignedTo)) {
        return res.status(400).json({
          success: false,
          message: 'ID de membre invalide',
          error: 'INVALID_MEMBER_ID'
        });
      }
      filters.assignedTo = req.query.assignedTo;
    }

    if (req.query.createdBy) {
      if (!/^[0-9a-fA-F]{24}$/.test(req.query.createdBy)) {
        return res.status(400).json({
          success: false,
          message: 'ID d\'utilisateur invalide',
          error: 'INVALID_USER_ID'
        });
      }
      filters.createdBy = req.query.createdBy;
    }

    if (req.query.dueDateFrom) {
      const date = new Date(req.query.dueDateFrom);
      if (isNaN(date.getTime())) {
        return res.status(400).json({
          success: false,
          message: 'Date de début invalide',
          error: 'INVALID_START_DATE'
        });
      }
      filters.dueDateFrom = date;
    }

    if (req.query.dueDateTo) {
      const date = new Date(req.query.dueDateTo);
      if (isNaN(date.getTime())) {
        return res.status(400).json({
          success: false,
          message: 'Date de fin invalide',
          error: 'INVALID_END_DATE'
        });
      }
      filters.dueDateTo = date;
    }

    if (req.query.tags) {
      filters.tags = req.query.tags.split(',').map(tag => tag.trim());
    }

    // Ajouter les filtres validés à la requête
    req.taskFilters = filters;
    next();

  } catch (error) {
    return res.status(400).json({
      success: false,
      message: 'Filtres de tâches invalides',
      error: 'TASK_FILTERS_ERROR',
      details: error.message
    });
  }
};

/**
 * Middleware de validation des filtres de membres
 */
const validateMemberFilters = (req, res, next) => {
  try {
    const filters = {};
    
    if (req.query.department) {
      filters.department = req.query.department;
    }

    if (req.query.isActive !== undefined) {
      if (req.query.isActive === 'true') {
        filters.isActive = true;
      } else if (req.query.isActive === 'false') {
        filters.isActive = false;
      } else {
        return res.status(400).json({
          success: false,
          message: 'Valeur isActive invalide',
          error: 'INVALID_ISACTIVE'
        });
      }
    }

    if (req.query.position) {
      filters.position = req.query.position;
    }

    // Ajouter les filtres validés à la requête
    req.memberFilters = filters;
    next();

  } catch (error) {
    return res.status(400).json({
      success: false,
      message: 'Filtres de membres invalides',
      error: 'MEMBER_FILTERS_ERROR',
      details: error.message
    });
  }
};

/**
 * Middleware de validation des ObjectIds
 */
const validateObjectId = (paramName) => {
  return (req, res, next) => {
    const id = req.params[paramName];
    
    if (!id || !/^[0-9a-fA-F]{24}$/.test(id)) {
      return res.status(400).json({
        success: false,
        message: `ID invalide: ${paramName}`,
        error: 'INVALID_OBJECT_ID'
      });
    }
    
    next();
  };
};

module.exports = {
  validateData,
  validatePagination,
  validateTaskFilters,
  validateMemberFilters,
  validateObjectId
};
