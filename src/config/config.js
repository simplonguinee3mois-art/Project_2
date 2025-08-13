require('dotenv').config();

// Debug: Vérifier que les variables sont chargées
console.log('🔍 Variables d\'environnement chargées:');
console.log('   PORT:', process.env.PORT);
console.log('   NODE_ENV:', process.env.NODE_ENV);
console.log('   MONGODB_URI:', process.env.MONGODB_URI ? '✅ Chargée' : '❌ Manquante');
console.log('   JWT_SECRET:', process.env.JWT_SECRET ? '✅ Chargée' : '❌ Manquante');

module.exports = {
  // Configuration du serveur
  port: process.env.PORT || 3002,
  nodeEnv: process.env.NODE_ENV || 'development',

  // Configuration MongoDB Atlas (OBLIGATOIRE)
  mongoUri: process.env.MONGODB_URI || 'mongodb+srv://simplonguinee3mois:Alpha.o.b5@cluster0.zx9kzel.mongodb.net/team-task-manager?retryWrites=true&w=majority&appName=Cluster0',

  // Configuration JWT
  jwtSecret: process.env.JWT_SECRET || 'team_task_manager_jwt_secret_2024_secure',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',

  // Configuration de sécurité
  bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS) || 12,
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000, // 15 minutes
  rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,

  // Configuration CORS
  corsOrigin: process.env.CORS_ORIGIN || '*',

  // Validation des données
  validationOptions: {
    abortEarly: false,
    allowUnknown: true,
    stripUnknown: true
  }
};
