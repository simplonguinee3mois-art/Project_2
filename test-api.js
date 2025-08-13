/**
 * Test simple de l'API Team Task Manager
 * Ce fichier permet de tester rapidement les endpoints de base
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3002/api'; // Changé de 3001 à 3002

// Configuration axios
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Fonction de test avec gestion d'erreurs
async function testEndpoint(name, testFn) {
  try {
    console.log(`🧪 Test: ${name}`);
    await testFn();
    console.log(`✅ ${name} - SUCCÈS\n`);
  } catch (error) {
    console.log(`❌ ${name} - ÉCHEC`);
    if (error.response) {
      console.log(`   Status: ${error.response.status}`);
      console.log(`   Message: ${error.response.data?.message || 'Aucun message'}`);
    } else {
      console.log(`   Erreur: ${error.message}`);
    }
    console.log('');
  }
}

// Tests des endpoints de base
async function runBasicTests() {
  console.log('🚀 Démarrage des tests de l\'API Team Task Manager\n');

  // Test de santé de l'API
  await testEndpoint('Santé de l\'API', async () => {
    const response = await api.get('/health');
    if (response.data.success !== true) {
      throw new Error('La réponse de santé n\'est pas valide');
    }
    console.log(`   ✅ API opérationnelle - ${response.data.message}`);
  });

  // Test des informations de l'API
  await testEndpoint('Informations de l\'API', async () => {
    const response = await api.get('/info');
    if (response.data.success !== true) {
      throw new Error('Les informations de l\'API ne sont pas valides');
    }
    console.log(`   ✅ Version: ${response.data.data.version}`);
    console.log(`   ✅ Nom: ${response.data.data.name}`);
  });

  // Test de la route racine
  await testEndpoint('Route racine', async () => {
    const response = await axios.get('http://localhost:3002/'); // Changé de 3001 à 3002
    if (response.data.success !== true) {
      throw new Error('La route racine ne fonctionne pas');
    }
    console.log(`   ✅ Message: ${response.data.message}`);
  });

  // Test d'un endpoint inexistant (404)
  await testEndpoint('Endpoint inexistant (404)', async () => {
    try {
      await api.get('/endpoint-inexistant');
      throw new Error('Devrait retourner une erreur 404');
    } catch (error) {
      if (error.response?.status === 404) {
        console.log(`   ✅ Erreur 404 correctement gérée`);
      } else {
        throw error;
      }
    }
  });
}

// Tests d'authentification
async function runAuthTests() {
  console.log('🔐 Tests d\'authentification\n');

  // Test d'inscription
  await testEndpoint('Inscription d\'utilisateur', async () => {
    const userData = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
      role: 'member'
    };

    const response = await api.post('/auth/register', userData);
    if (response.data.success !== true) {
      throw new Error('L\'inscription a échoué');
    }
    console.log(`   ✅ Utilisateur créé: ${response.data.data.user.username}`);
    console.log(`   ✅ Token reçu: ${response.data.data.token ? 'Oui' : 'Non'}`);
  });

  // Test de connexion
  await testEndpoint('Connexion d\'utilisateur', async () => {
    const loginData = {
      email: 'test@example.com',
      password: 'password123'
    };

    const response = await api.post('/auth/login', loginData);
    if (response.data.success !== true) {
      throw new Error('La connexion a échoué');
    }
    console.log(`   ✅ Connexion réussie: ${response.data.data.user.username}`);
    console.log(`   ✅ Token reçu: ${response.data.data.token ? 'Oui' : 'Non'}`);
  });

  // Test d'accès au profil sans token
  await testEndpoint('Accès au profil sans token (401)', async () => {
    try {
      await api.get('/auth/profile');
      throw new Error('Devrait retourner une erreur 401');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log(`   ✅ Accès refusé sans token`);
      } else {
        throw error;
      }
    }
  });
}

// Fonction principale
async function main() {
  try {
    await runBasicTests();
    await runAuthTests();
    
    console.log('🎉 Tous les tests sont terminés !');
    console.log('\n📋 Résumé des tests :');
    console.log('   - Endpoints de base : Testés');
    console.log('   - Authentification : Testée');
    console.log('   - Gestion d\'erreurs : Testée');
    
  } catch (error) {
    console.error('💥 Erreur lors des tests:', error.message);
  }
}

// Exécuter les tests si le fichier est appelé directement
if (require.main === module) {
  main();
}

module.exports = { runBasicTests, runAuthTests };
