/**
 * Test simple et ciblé de l'API Team Task Manager
 * Pour identifier et résoudre les problèmes spécifiques
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
let memberId = '';

// Test simple d'authentification et création de membre
async function runSimpleTest() {
  console.log('🚀 Test simple et ciblé de l\'API\n');

  try {
    // 1. Création d'un utilisateur de test
    console.log('🔐 1. Création d\'un utilisateur de test...');
    const timestamp = Date.now();
    const userData = {
      username: `testuser_${timestamp}`,
      email: `test_${timestamp}@example.com`,
      password: 'password123',
      role: 'member'
    };

    const registerResponse = await api.post('/auth/register', userData);
    authToken = registerResponse.data.data.token;
    console.log('✅ Utilisateur créé et connecté, token reçu\n');

         // 2. Création d'un membre avec email unique
     console.log('👥 2. Création d\'un membre...');
     const memberTimestamp = Date.now();
     const memberData = {
       firstName: `John_${memberTimestamp}`,
       lastName: `Doe_${memberTimestamp}`,
       email: `john.doe.${memberTimestamp}@example.com`,
      position: 'Développeur Full Stack',
      department: 'Développement',
      skills: ['JavaScript', 'Node.js', 'MongoDB']
    };

         const memberResponse = await api.post('/members', memberData, {
       headers: { 'Authorization': `Bearer ${authToken}` }
     });
     
     console.log('🔍 Réponse complète de création de membre:', JSON.stringify(memberResponse.data, null, 2));
     
     memberId = memberResponse.data.data.member._id;
     console.log(`✅ Membre créé: ${memberResponse.data.data.member.firstName} ${memberResponse.data.data.member.lastName}`);
     console.log(`✅ ID: ${memberId}\n`);

    // 3. Création d'une tâche
    console.log('📋 3. Création d\'une tâche...');
    const taskData = {
      title: 'Test de création de tâche',
      description: 'Description de test pour vérifier la création de tâches dans l\'API Team Task Manager.',
      assignedTo: memberId,
      priority: 'high',
      status: 'in_progress',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    };

         const taskResponse = await api.post('/tasks', taskData, {
       headers: { 'Authorization': `Bearer ${authToken}` }
     });
     
     console.log('🔍 Réponse complète de création de tâche:', JSON.stringify(taskResponse.data, null, 2));
     
     const taskId = taskResponse.data.data._id;
     console.log(`✅ Tâche créée: ${taskResponse.data.data.title}`);
     console.log(`✅ ID: ${taskId}\n`);

    // 4. Test de mise à jour de la tâche
    console.log('🔄 4. Test de mise à jour de la tâche...');
    const updateData = {
      status: 'completed',
      completedAt: new Date().toISOString()
    };

    const updateResponse = await api.put(`/tasks/${taskId}`, updateData, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    
    console.log(`✅ Tâche mise à jour: ${updateResponse.data.data.status}\n`);

    // 5. Vérification finale
    console.log('🔍 5. Vérification finale...');
    const finalTaskResponse = await api.get(`/tasks/${taskId}`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    
    console.log(`✅ Tâche finale: ${finalTaskResponse.data.data.title}`);
    console.log(`✅ Statut: ${finalTaskResponse.data.data.status}`);
    console.log(`✅ Assignée à: ${finalTaskResponse.data.data.assignedTo}`);

    console.log('\n🎉 Tous les tests sont passés avec succès !');
    console.log('✅ Authentification');
    console.log('✅ Création de membre');
    console.log('✅ Création de tâche');
    console.log('✅ Mise à jour de tâche');
    console.log('✅ Récupération de données');

  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
    if (error.response) {
      console.error(`   Status: ${error.response.status}`);
      console.error(`   Message: ${error.response.data?.message || 'Aucun message'}`);
      console.error(`   Données:`, error.response.data);
    }
  }
}

// Lancer le test
runSimpleTest();
