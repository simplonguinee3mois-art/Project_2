const Joi = require('joi');
const config = require('../config/config');

// Schémas de validation pour l'authentification
const authValidation = {
  register: Joi.object({
    username: Joi.string()
      .min(3)
      .max(30)
      .required()
      .messages({
        'string.min': 'Le nom d\'utilisateur doit contenir au moins 3 caractères',
        'string.max': 'Le nom d\'utilisateur ne peut pas dépasser 30 caractères',
        'any.required': 'Le nom d\'utilisateur est requis'
      }),
    email: Joi.string()
      .email()
      .required()
      .messages({
        'string.email': 'Format d\'email invalide',
        'any.required': 'L\'email est requis'
      }),
    password: Joi.string()
      .min(6)
      .required()
      .messages({
        'string.min': 'Le mot de passe doit contenir au moins 6 caractères',
        'any.required': 'Le mot de passe est requis'
      }),
    role: Joi.string()
      .valid('admin', 'member')
      .default('member')
  }),

  login: Joi.object({
    email: Joi.string()
      .email()
      .required()
      .messages({
        'string.email': 'Format d\'email invalide',
        'any.required': 'L\'email est requis'
      }),
    password: Joi.string()
      .required()
      .messages({
        'any.required': 'Le mot de passe est requis'
      })
  })
};

// Schémas de validation pour les membres
const memberValidation = {
  create: Joi.object({
    firstName: Joi.string()
      .min(2)
      .max(50)
      .required()
      .messages({
        'string.min': 'Le prénom doit contenir au moins 2 caractères',
        'string.max': 'Le prénom ne peut pas dépasser 50 caractères',
        'any.required': 'Le prénom est requis'
      }),
    lastName: Joi.string()
      .min(2)
      .max(50)
      .required()
      .messages({
        'string.min': 'Le nom de famille doit contenir au moins 2 caractères',
        'string.max': 'Le nom de famille ne peut pas dépasser 50 caractères',
        'any.required': 'Le nom de famille est requis'
      }),
    email: Joi.string()
      .email()
      .required()
      .messages({
        'string.email': 'Format d\'email invalide',
        'any.required': 'L\'email est requis'
      }),
    phone: Joi.string()
      .pattern(/^[\+]?[1-9][\d]{0,15}$/)
      .optional()
      .messages({
        'string.pattern.base': 'Format de téléphone invalide'
      }),
    position: Joi.string()
      .max(100)
      .required()
      .messages({
        'string.max': 'Le poste ne peut pas dépasser 100 caractères',
        'any.required': 'Le poste est requis'
      }),
    department: Joi.string()
      .max(100)
      .optional()
      .messages({
        'string.max': 'Le département ne peut pas dépasser 100 caractères'
      }),
    skills: Joi.array()
      .items(Joi.string().max(50))
      .optional()
      .messages({
        'array.items': 'Une compétence ne peut pas dépasser 50 caractères'
      }),
    avatar: Joi.string()
      .uri()
      .optional()
      .messages({
        'string.uri': 'URL d\'avatar invalide'
      })
  }),

  update: Joi.object({
    firstName: Joi.string()
      .min(2)
      .max(50)
      .optional(),
    lastName: Joi.string()
      .min(2)
      .max(50)
      .optional(),
    email: Joi.string()
      .email()
      .optional(),
    phone: Joi.string()
      .pattern(/^[\+]?[1-9][\d]{0,15}$/)
      .optional(),
    position: Joi.string()
      .max(100)
      .optional(),
    department: Joi.string()
      .max(100)
      .optional(),
    skills: Joi.array()
      .items(Joi.string().max(50))
      .optional(),
    avatar: Joi.string()
      .uri()
      .optional(),
    isActive: Joi.boolean()
      .optional()
  })
};

// Schémas de validation pour les tâches
const taskValidation = {
  create: Joi.object({
    title: Joi.string()
      .min(3)
      .max(200)
      .required()
      .messages({
        'string.min': 'Le titre doit contenir au moins 3 caractères',
        'string.max': 'Le titre ne peut pas dépasser 200 caractères',
        'any.required': 'Le titre de la tâche est requis'
      }),
    description: Joi.string()
      .min(10)
      .max(1000)
      .required()
      .messages({
        'string.min': 'La description doit contenir au moins 10 caractères',
        'string.max': 'La description ne peut pas dépasser 1000 caractères',
        'any.required': 'La description est requise'
      }),
    status: Joi.string()
      .valid('pending', 'in_progress', 'completed', 'cancelled')
      .default('pending'),
    priority: Joi.string()
      .valid('low', 'medium', 'high', 'urgent')
      .default('medium'),
    assignedTo: Joi.string()
      .hex()
      .length(24)
      .required()
      .messages({
        'string.hex': 'ID de membre invalide',
        'string.length': 'ID de membre invalide',
        'any.required': 'Un membre doit être assigné à la tâche'
      }),
    dueDate: Joi.date()
      .greater('now')
      .required()
      .messages({
        'date.greater': 'La date d\'échéance doit être dans le futur',
        'any.required': 'La date d\'échéance est requise'
      }),
    tags: Joi.array()
      .items(Joi.string().max(30))
      .optional(),
    estimatedHours: Joi.number()
      .min(0)
      .max(1000)
      .optional()
      .messages({
        'number.min': 'Les heures estimées ne peuvent pas être négatives',
        'number.max': 'Les heures estimées ne peuvent pas dépasser 1000'
      })
  }),

  update: Joi.object({
    title: Joi.string()
      .min(3)
      .max(200)
      .optional(),
    description: Joi.string()
      .min(10)
      .max(1000)
      .optional(),
    status: Joi.string()
      .valid('pending', 'in_progress', 'completed', 'cancelled')
      .optional(),
    priority: Joi.string()
      .valid('low', 'medium', 'high', 'urgent')
      .optional(),
    assignedTo: Joi.string()
      .hex()
      .length(24)
      .optional(),
    dueDate: Joi.date()
      .greater('now')
      .optional(),
    tags: Joi.array()
      .items(Joi.string().max(30))
      .optional(),
    estimatedHours: Joi.number()
      .min(0)
      .max(1000)
      .optional(),
    actualHours: Joi.number()
      .min(0)
      .max(1000)
      .optional()
  }),

  // Validation pour les commentaires
  addComment: Joi.object({
    content: Joi.string()
      .min(1)
      .max(500)
      .required()
      .messages({
        'string.min': 'Le commentaire ne peut pas être vide',
        'string.max': 'Le commentaire ne peut pas dépasser 500 caractères',
        'any.required': 'Le contenu du commentaire est requis'
      })
  })
};

// Schémas de validation pour les paramètres de requête
const queryValidation = {
  pagination: Joi.object({
    page: Joi.number()
      .integer()
      .min(1)
      .default(1),
    limit: Joi.number()
      .integer()
      .min(1)
      .max(100)
      .default(10),
    sort: Joi.string()
      .valid('createdAt', 'dueDate', 'priority', 'status', 'title')
      .default('createdAt'),
    order: Joi.string()
      .valid('asc', 'desc')
      .default('desc')
  }),

  taskFilters: Joi.object({
    status: Joi.string()
      .valid('pending', 'in_progress', 'completed', 'cancelled'),
    priority: Joi.string()
      .valid('low', 'medium', 'high', 'urgent'),
    assignedTo: Joi.string()
      .hex()
      .length(24),
    createdBy: Joi.string()
      .hex()
      .length(24),
    dueDateFrom: Joi.date(),
    dueDateTo: Joi.date(),
    tags: Joi.string()
  }),

  memberFilters: Joi.object({
    department: Joi.string(),
    isActive: Joi.boolean(),
    position: Joi.string()
  })
};

// Fonction de validation générique
const validate = (schema, data, options = {}) => {
  const validationOptions = {
    ...config.validationOptions,
    ...options
  };

  const { error, value } = schema.validate(data, validationOptions);
  
  if (error) {
    const errorMessage = error.details
      .map(detail => detail.message)
      .join(', ');
    throw new Error(errorMessage);
  }

  return value;
};

module.exports = {
  authValidation,
  memberValidation,
  taskValidation,
  queryValidation,
  validate
};
