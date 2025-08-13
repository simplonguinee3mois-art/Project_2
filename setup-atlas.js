#!/usr/bin/env node

/**
 * Script de configuration MongoDB Atlas
 * Ce script aide à configurer la connexion MongoDB Atlas
 */

const readline = require('readline');
const fs = require('fs');
const path = require('path');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🚀 Configuration MongoDB Atlas pour Team Task Manager\n');

// Fonction pour poser une question
function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
}

// Fonction pour créer le fichier .env
function createEnvFile(config) {
  const envContent = `# Configuration du serveur
PORT=3000
NODE_ENV=development

# Configuration MongoDB Atlas (Cloud)
MONGODB_URI=${config.mongoUri}

# Configuration JWT
JWT_SECRET=${config.jwtSecret}
JWT_EXPIRES_IN=7d

# Configuration de sécurité
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Configuration CORS (pour le déploiement)
CORS_ORIGIN=*
`;

  try {
    fs.writeFileSync('.env', envContent);
    console.log('✅ Fichier .env créé avec succès !');
    return true;
  } catch (error) {
    console.error('❌ Erreur lors de la création du fichier .env:', error.message);
    return false;
  }
}

// Fonction principale
async function main() {
  try {
    console.log('📋 Étapes de configuration MongoDB Atlas :\n');
    console.log('1. Créez un compte sur https://www.mongodb.com/atlas');
    console.log('2. Créez un cluster gratuit (M0)');
    console.log('3. Créez un utilisateur de base de données');
    console.log('4. Configurez l\'accès réseau (Allow access from anywhere)');
    console.log('5. Obtenez la chaîne de connexion\n');

    // Demander les informations de configuration
    const username = await askQuestion('👤 Nom d\'utilisateur MongoDB Atlas : ');
    const password = await askQuestion('🔒 Mot de passe MongoDB Atlas : ');
    const clusterUrl = await askQuestion('🌐 URL du cluster (ex: cluster0.xxxxx.mongodb.net) : ');
    const databaseName = await askQuestion('📊 Nom de la base de données (défaut: team-task-manager) : ') || 'team-task-manager';

    // Construire l'URI MongoDB
    const mongoUri = `mongodb+srv://${username}:${password}@${clusterUrl}/${databaseName}?retryWrites=true&w=majority`;

    // Générer un secret JWT sécurisé
    const jwtSecret = Math.random().toString(36).substring(2, 15) + 
                     Math.random().toString(36).substring(2, 15) + 
                     Math.random().toString(36).substring(2, 15);

    const config = {
      mongoUri,
      jwtSecret,
      databaseName
    };

    console.log('\n📝 Configuration générée :');
    console.log(`   Base de données : ${databaseName}`);
    console.log(`   Cluster : ${clusterUrl}`);
    console.log(`   Utilisateur : ${username}`);
    console.log(`   JWT Secret : ${jwtSecret.substring(0, 20)}...`);

    // Demander confirmation
    const confirm = await askQuestion('\n❓ Voulez-vous créer le fichier .env avec cette configuration ? (y/N) : ');
    
    if (confirm.toLowerCase() === 'y' || confirm.toLowerCase() === 'yes') {
      if (createEnvFile(config)) {
        console.log('\n🎉 Configuration terminée !');
        console.log('\n📋 Prochaines étapes :');
        console.log('1. Vérifiez que MongoDB Atlas est accessible');
        console.log('2. Lancez l\'API avec : npm run dev');
        console.log('3. Testez la connexion avec : node test-api.js');
      }
    } else {
      console.log('\n❌ Configuration annulée');
    }

  } catch (error) {
    console.error('💥 Erreur lors de la configuration:', error.message);
  } finally {
    rl.close();
  }
}

// Exécuter le script
if (require.main === module) {
  main();
}

module.exports = { createEnvFile };
