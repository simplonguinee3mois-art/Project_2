/**
 * Middleware de gestion d'erreurs global
 * Gère toutes les erreurs non capturées par l'application
 */

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log de l'erreur pour le débogage
  console.error('❌ Erreur API:', {
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString()
  });

  // Erreur de validation Mongoose
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = {
      message: `Données invalides: ${message}`,
      statusCode: 400,
      error: 'VALIDATION_ERROR'
    };
  }

  // Erreur de duplication Mongoose
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    error = {
      message: `${field === 'email' ? 'Cet email' : 'Ce nom'} est déjà utilisé`,
      statusCode: 400,
      error: 'DUPLICATE_FIELD'
    };
  }

  // Erreur de cast Mongoose (ObjectId invalide)
  if (err.name === 'CastError') {
    error = {
      message: 'ID invalide',
      statusCode: 400,
      error: 'INVALID_ID'
    };
  }

  // Erreur JWT
  if (err.name === 'JsonWebTokenError') {
    error = {
      message: 'Token JWT invalide',
      statusCode: 401,
      error: 'INVALID_JWT'
    };
  }

  // Erreur d'expiration JWT
  if (err.name === 'TokenExpiredError') {
    error = {
      message: 'Token JWT expiré',
      statusCode: 401,
      error: 'JWT_EXPIRED'
    };
  }

  // Erreur de syntaxe JSON
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    error = {
      message: 'Format JSON invalide',
      statusCode: 400,
      error: 'INVALID_JSON'
    };
  }

  // Erreur de limite de taille de fichier
  if (err.code === 'LIMIT_FILE_SIZE') {
    error = {
      message: 'Fichier trop volumineux',
      statusCode: 400,
      error: 'FILE_TOO_LARGE'
    };
  }

  // Erreur de limite de requêtes
  if (err.status === 429) {
    error = {
      message: 'Trop de requêtes, veuillez réessayer plus tard',
      statusCode: 429,
      error: 'RATE_LIMIT_EXCEEDED'
    };
  }

  // Erreur de base de données
  if (err.name === 'MongoError' || err.name === 'MongoServerError') {
    error = {
      message: 'Erreur de base de données',
      statusCode: 500,
      error: 'DATABASE_ERROR'
    };
  }

  // Erreur de connexion à la base de données
  if (err.name === 'MongoNetworkError') {
    error = {
      message: 'Impossible de se connecter à la base de données',
      statusCode: 503,
      error: 'DATABASE_CONNECTION_ERROR'
    };
  }

  // Erreur de timeout
  if (err.code === 'ETIMEDOUT') {
    error = {
      message: 'Délai d\'attente dépassé',
      statusCode: 408,
      error: 'TIMEOUT'
    };
  }

  // Erreur de connexion refusée
  if (err.code === 'ECONNREFUSED') {
    error = {
      message: 'Connexion refusée',
      statusCode: 503,
      error: 'CONNECTION_REFUSED'
    };
  }

  // Erreur de mémoire insuffisante
  if (err.code === 'ENOMEM') {
    error = {
      message: 'Mémoire insuffisante',
      statusCode: 500,
      error: 'OUT_OF_MEMORY'
    };
  }

  // Définir le code de statut par défaut
  const statusCode = error.statusCode || err.statusCode || 500;
  const message = error.message || 'Erreur interne du serveur';
  const errorCode = error.error || 'INTERNAL_SERVER_ERROR';

  // Réponse d'erreur
  res.status(statusCode).json({
    success: false,
    message,
    error: errorCode,
    ...(process.env.NODE_ENV === 'development' && {
      stack: err.stack,
      details: err
    })
  });
};

module.exports = errorHandler;
