const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

// Configuration et base de données
const config = require('./config/config');
const connectDB = require('./config/database');

// Routes
const apiRoutes = require('./routes');

// Middleware de gestion d'erreurs
const errorHandler = require('./middleware/errorHandler');

// Initialiser l'application Express
const app = express();

// Connexion OBLIGATOIRE à MongoDB Atlas
console.log('🔗 Tentative de connexion à MongoDB Atlas...');
connectDB().then(() => {
  console.log('✅ MongoDB Atlas connecté avec succès !');
  
  // Démarrer le serveur seulement après la connexion MongoDB
  startServer();
}).catch(err => {
  console.error('❌ Impossible de démarrer sans MongoDB Atlas:', err.message);
  console.log('💡 Vérifiez votre configuration MongoDB Atlas dans le fichier .env');
  process.exit(1);
});

// Fonction pour démarrer le serveur
function startServer() {
  // Middleware de sécurité et configuration
  app.use(helmet()); // Sécurité des en-têtes HTTP
  app.use(cors({
    origin: config.corsOrigin,
    credentials: true
  }));

  // Rate limiting pour prévenir les abus
  const limiter = rateLimit({
    windowMs: config.rateLimitWindowMs,
    max: config.rateLimitMaxRequests,
    message: {
      success: false,
      message: 'Trop de requêtes, veuillez réessayer plus tard',
      error: 'RATE_LIMIT_EXCEEDED'
    },
    standardHeaders: true,
    legacyHeaders: false
  });
  app.use('/api/', limiter);

  // Middleware de logging
  if (config.nodeEnv === 'development') {
    app.use(morgan('dev'));
  } else {
    app.use(morgan('combined'));
  }

  // Middleware pour parser le JSON
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Middleware de sécurité supplémentaire
  app.use((req, res, next) => {
    // Désactiver l'affichage de la technologie utilisée
    res.removeHeader('X-Powered-By');
    
    // Headers de sécurité supplémentaires
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    
    next();
  });

  // Routes de l'API
  app.use('/api', apiRoutes);

  // Route racine
  app.get('/', (req, res) => {
    res.json({
      success: true,
      message: 'Bienvenue sur l\'API Team Task Manager',
      version: '1.0.0',
      documentation: '/api/info',
      health: '/api/health',
      mode: process.env.NODE_ENV || 'development',
      database: 'MongoDB Atlas (Cloud)'
    });
  });

  // Middleware de gestion d'erreurs 404
  app.use('*', (req, res) => {
    res.status(404).json({
      success: false,
      message: 'Route non trouvée',
      error: 'ROUTE_NOT_FOUND',
      requestedUrl: req.originalUrl
    });
  });

  // Middleware de gestion d'erreurs global
  app.use(errorHandler);

  // Gestion des erreurs non capturées
  process.on('unhandledRejection', (err, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', err);
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  });

  process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  });

  // Démarrer le serveur
  const PORT = config.port;
  app.listen(PORT, () => {
    console.log(`🚀 Serveur démarré sur le port ${PORT}`);
    console.log(`📱 Mode: ${config.nodeEnv}`);
    console.log(`🌐 URL: http://localhost:${PORT}`);
    console.log(`📚 API: http://localhost:${PORT}/api`);
    console.log(`❤️  Santé: http://localhost:${PORT}/api/health`);
    console.log(`ℹ️  Info: http://localhost:${PORT}/api/info`);
    console.log(`🗄️  Base de données: MongoDB Atlas (Cloud)`);
  });
}

module.exports = app;
