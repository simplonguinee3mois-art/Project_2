/**
 * Test avancé de l'API Team Task Manager
 * Teste tous les endpoints : authentification, membres, tâches
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3002/api';

// Configuration axios
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
});

let authToken = '';
let userId = '';
let memberId = '';
let taskId = '';

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

// Tests d'authentification
async function runAuthTests() {
  console.log('🔐 Tests d\'authentification\n');

  // Test d'inscription
  await testEndpoint('Inscription d\'utilisateur', async () => {
    const timestamp = Date.now();
    const userData = {
      username: `testuser_${timestamp}`,
      email: `test_${timestamp}@example.com`,
      password: 'password123',
      role: 'member'
    };

    const response = await api.post('/auth/register', userData);
    if (response.data.success !== true) {
      throw new Error('L\'inscription a échoué');
    }
    
    userId = response.data.data.user._id;
    authToken = response.data.data.token;
    console.log(`   ✅ Utilisateur créé: ${response.data.data.user.username}`);
    console.log(`   ✅ Token reçu: Oui`);
  });

  // Test de connexion
  await testEndpoint('Connexion d\'utilisateur', async () => {
    const timestamp = Date.now();
    const loginData = {
      email: `test_${timestamp}@example.com`,
      password: 'password123'
    };

    const response = await api.post('/auth/login', loginData);
    if (response.data.success !== true) {
      throw new Error('La connexion a échoué');
    }
    
    authToken = response.data.data.token;
    console.log(`   ✅ Connexion réussie: ${response.data.data.user.username}`);
    console.log(`   ✅ Token reçu: Oui`);
  });
}

// Tests des membres
async function runMemberTests() {
  console.log('👥 Tests de gestion des membres\n');

  // Test de création d'un membre
  await testEndpoint('Création d\'un membre', async () => {
    const memberData = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      position: 'Développeur Full Stack',
      department: 'Développement',
      skills: ['JavaScript', 'Node.js', 'MongoDB']
    };

    const response = await api.post('/members', memberData, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    
    if (response.data.success !== true) {
      throw new Error('La création du membre a échoué');
    }
    
    memberId = response.data.data._id;
    console.log(`   ✅ Membre créé: ${response.data.data.firstName} ${response.data.data.lastName}`);
    console.log(`   ✅ ID: ${memberId}`);
    console.log(`   🔍 Réponse complète:`, JSON.stringify(response.data.data, null, 2));
  });

  // Test de récupération des membres
  await testEndpoint('Récupération des membres', async () => {
    const response = await api.get('/members', {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    
    if (response.data.success !== true) {
      throw new Error('La récupération des membres a échoué');
    }
    
    console.log(`   ✅ Membres récupérés: ${response.data.data.length}`);
  });

  // Test de récupération d'un membre spécifique
  await testEndpoint('Récupération d\'un membre spécifique', async () => {
    const response = await api.get(`/members/${memberId}`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    
    if (response.data.success !== true) {
      throw new Error('La récupération du membre a échoué');
    }
    
    console.log(`   ✅ Membre récupéré: ${response.data.data.firstName} ${response.data.data.lastName}`);
  });
}

// Tests des tâches
async function runTaskTests() {
  console.log('📋 Tests de gestion des tâches\n');

  // Test de création d'une tâche
  await testEndpoint('Création d\'une tâche', async () => {
    const taskData = {
      title: 'Développer l\'API REST',
      description: 'Créer une API REST complète avec Node.js et Express. Inclure l\'authentification JWT, la gestion des membres et des tâches avec validation des données.',
      assignedTo: memberId,
      priority: 'high',
      status: 'in_progress',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    };

    const response = await api.post('/tasks', taskData, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    
    if (response.data.success !== true) {
      throw new Error('La création de la tâche a échoué');
    }
    
    taskId = response.data.data._id;
    console.log(`   ✅ Tâche créée: ${response.data.data.title}`);
    console.log(`   ✅ ID: ${taskId}`);
  });

  // Test de récupération des tâches
  await testEndpoint('Récupération des tâches', async () => {
    const response = await api.get('/tasks', {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    
    if (response.data.success !== true) {
      throw new Error('La récupération des tâches a échoué');
    }
    
    console.log(`   ✅ Tâches récupérées: ${response.data.data.length}`);
  });

  // Test de récupération d'une tâche spécifique
  await testEndpoint('Récupération d\'une tâche spécifique', async () => {
    const response = await api.get(`/tasks/${taskId}`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    
    if (response.data.success !== true) {
      throw new Error('La récupération de la tâche a échoué');
    }
    
    console.log(`   ✅ Tâche récupérée: ${response.data.data.title}`);
  });

  // Test de mise à jour d'une tâche
  await testEndpoint('Mise à jour d\'une tâche', async () => {
    const updateData = {
      status: 'completed',
      completionDate: new Date().toISOString()
    };

    const response = await api.put(`/tasks/${taskId}`, updateData, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    
    if (response.data.success !== true) {
      throw new Error('La mise à jour de la tâche a échoué');
    }
    
    console.log(`   ✅ Tâche mise à jour: ${response.data.data.status}`);
  });
}

// Tests de recherche et filtres
async function runSearchTests() {
  console.log('🔍 Tests de recherche et filtres\n');

  // Test de recherche de membres
  await testEndpoint('Recherche de membres par compétence', async () => {
    const response = await api.get('/members?skills=JavaScript', {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    
    if (response.data.success !== true) {
      throw new Error('La recherche de membres a échoué');
    }
    
    console.log(`   ✅ Membres trouvés avec JavaScript: ${response.data.data.length}`);
  });

  // Test de filtrage des tâches
  await testEndpoint('Filtrage des tâches par statut', async () => {
    const response = await api.get('/tasks?status=completed', {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    
    if (response.data.success !== true) {
      throw new Error('Le filtrage des tâches a échoué');
    }
    
    console.log(`   ✅ Tâches complétées: ${response.data.data.length}`);
  });
}

// Tests de gestion d'erreurs
async function runErrorTests() {
  console.log('⚠️ Tests de gestion d\'erreurs\n');

  // Test d'accès sans token
  await testEndpoint('Accès sans token (401)', async () => {
    try {
      await api.get('/members');
      throw new Error('Devrait retourner une erreur 401');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log(`   ✅ Accès refusé sans token (401)`);
      } else {
        throw error;
      }
    }
  });

  // Test d'accès à une ressource inexistante
  await testEndpoint('Accès à une ressource inexistante (404)', async () => {
    try {
      await api.get('/members/123456789012345678901234', {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      throw new Error('Devrait retourner une erreur 404');
    } catch (error) {
      if (error.response?.status === 404) {
        console.log(`   ✅ Ressource non trouvée (404)`);
      } else {
        throw error;
      }
    }
  });
}

// Fonction principale
async function runAllTests() {
  console.log('🚀 Démarrage des tests avancés de l\'API Team Task Manager\n');

  try {
    await runAuthTests();
    await runMemberTests();
    await runTaskTests();
    await runSearchTests();
    await runErrorTests();

    console.log('🎉 Tous les tests avancés sont terminés !');
    console.log('\n📋 Résumé des tests :');
    console.log('   - Authentification : Testée');
    console.log('   - Gestion des membres : Testée');
    console.log('   - Gestion des tâches : Testée');
    console.log('   - Recherche et filtres : Testés');
    console.log('   - Gestion d\'erreurs : Testée');

  } catch (error) {
    console.error('❌ Erreur lors des tests:', error.message);
  }
}

// Lancer les tests
runAllTests();
