const mongoose = require('mongoose');
const config = require('./config');

const connectDB = async () => {
  try {
    // Options de connexion optimisées pour MongoDB Atlas
    const options = {
      // Options de performance et de stabilité
      maxPoolSize: 10, // Nombre maximum de connexions dans le pool
      serverSelectionTimeoutMS: 5000, // Timeout pour la sélection du serveur
      socketTimeoutMS: 45000, // Timeout pour les opérations socket
      // Options de sécurité
      ssl: true, // Activer SSL pour Atlas
      retryWrites: true, // Réessayer les écritures en cas d'échec
      w: 'majority' // Attendre la majorité des réplicas
    };

    const conn = await mongoose.connect(config.mongoUri, options);

    console.log(`✅ MongoDB Atlas connecté: ${conn.connection.host}`);
    console.log(`📊 Base de données: ${conn.connection.name}`);
    console.log(`🔗 URL: ${config.mongoUri.replace(/\/\/.*@/, '//***:***@')}`);

    // Gestion des événements de connexion
    mongoose.connection.on('connected', () => {
      console.log('🟢 Connexion MongoDB établie');
    });

    mongoose.connection.on('error', (err) => {
      console.error('🔴 Erreur de connexion MongoDB:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('🟡 Connexion MongoDB perdue');
    });

    // Gestion gracieuse de la fermeture
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('📴 Connexion MongoDB fermée gracieusement');
      process.exit(0);
    });

  } catch (error) {
    console.error(`❌ Erreur de connexion MongoDB Atlas: ${error.message}`);
    
    // Vérifier si c'est un problème de configuration
    if (error.message.includes('ENOTFOUND')) {
      console.error('💡 Vérifiez que l\'URL du cluster MongoDB Atlas est correcte');
    } else if (error.message.includes('Authentication failed')) {
      console.error('💡 Vérifiez vos identifiants MongoDB Atlas (username/password)');
    } else if (error.message.includes('ECONNREFUSED')) {
      console.error('💡 Vérifiez que votre IP est autorisée dans MongoDB Atlas');
    }
    
    // En mode développement, continuer sans MongoDB
    if (process.env.NODE_ENV === 'development') {
      console.log('⚠️  Mode développement : continuation sans MongoDB');
      return;
    }
    
    process.exit(1);
  }
};

module.exports = connectDB;
