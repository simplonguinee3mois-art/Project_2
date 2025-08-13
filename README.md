# 🚀 Team Task Manager API

API complète de gestion des tâches d'équipe avec authentification JWT, construite avec Node.js, Express et MongoDB Atlas.

## ✨ Fonctionnalités

- 🔐 **Authentification JWT** complète (inscription, connexion, profil)
- 👥 **Gestion des membres** d'équipe avec CRUD complet
- 📋 **Gestion des tâches** avec pagination, filtres et commentaires
- 🔍 **Recherche avancée** avec filtres multiples
- 📊 **Statistiques** et rapports détaillés
- 🛡️ **Sécurité renforcée** (Helmet, CORS, Rate Limiting)
- 📱 **API RESTful** avec validation des données
- 🚀 **Prêt pour le déploiement** (MongoDB Atlas + Render)

## 🛠️ Technologies Utilisées

- **Backend** : Node.js, Express.js
- **Base de données** : MongoDB Atlas (Cloud)
- **ORM** : Mongoose
- **Authentification** : JWT, bcryptjs
- **Validation** : Joi
- **Sécurité** : Helmet, CORS, Rate Limiting
- **Tests** : Jest, Supertest
- **Déploiement** : Render

## 📋 Prérequis

- Node.js (version 16.0.0 ou supérieure)
- npm ou yarn
- Compte MongoDB Atlas (gratuit)
- Compte Render (gratuit)

## 🚀 Installation et Configuration

### 1. Cloner le projet
```bash
git clone <votre-repo>
cd team-task-manager
```

### 2. Installer les dépendances
```bash
npm install
```

### 3. Configuration MongoDB Atlas

#### Option A : Script automatique (Recommandé)
```bash
node setup-atlas.js
```

#### Option B : Configuration manuelle
1. Créer un compte sur [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Créer un cluster gratuit (M0)
3. Créer un utilisateur de base de données
4. Configurer l'accès réseau (Allow access from anywhere)
5. Obtenir la chaîne de connexion
6. Créer un fichier `.env` avec vos informations

### 4. Fichier .env
```env
# Configuration du serveur
PORT=3000
NODE_ENV=development

# Configuration MongoDB Atlas
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/team-task-manager?retryWrites=true&w=majority

# Configuration JWT
JWT_SECRET=votre_secret_jwt_tres_securise
JWT_EXPIRES_IN=7d

# Configuration de sécurité
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Configuration CORS
CORS_ORIGIN=*
```

## 🏃‍♂️ Lancement

### Développement
```bash
npm run dev
```

### Production
```bash
npm start
```

L'API sera accessible sur `http://localhost:3000`

## 🧪 Tests

### Tests manuels
```bash
node test-api.js
```

### Tests automatisés (Jest)
```bash
npm test
npm run test:watch
```

## 📚 Endpoints de l'API

### 🔐 Authentification
- `POST /api/auth/register` - Inscription d'un utilisateur
- `POST /api/auth/login` - Connexion d'un utilisateur
- `GET /api/auth/profile` - Récupérer le profil (authentifié)
- `PUT /api/auth/profile` - Mettre à jour le profil (authentifié)
- `POST /api/auth/logout` - Déconnexion

### 👥 Membres d'équipe
- `GET /api/members` - Liste des membres (avec pagination et filtres)
- `GET /api/members/:id` - Détails d'un membre
- `POST /api/members` - Créer un membre (authentifié)
- `PUT /api/members/:id` - Mettre à jour un membre (authentifié)
- `DELETE /api/members/:id` - Supprimer un membre (admin)
- `GET /api/members/search` - Rechercher des membres
- `GET /api/members/stats` - Statistiques des membres (admin)

### 📋 Tâches
- `GET /api/tasks` - Liste des tâches (avec pagination et filtres)
- `GET /api/tasks/:id` - Détails d'une tâche
- `POST /api/tasks` - Créer une tâche (authentifié)
- `PUT /api/tasks/:id` - Mettre à jour une tâche (authentifié)
- `DELETE /api/tasks/:id` - Supprimer une tâche (authentifié)
- `PATCH /api/tasks/:id/complete` - Marquer une tâche comme terminée
- `POST /api/tasks/:id/comments` - Ajouter un commentaire
- `GET /api/tasks/stats` - Statistiques des tâches

### 📊 Informations générales
- `GET /api/health` - Santé de l'API
- `GET /api/info` - Informations sur l'API

## 🚀 Déploiement

### Déploiement sur Render

1. **Connecter votre repository GitHub** sur Render
2. **Créer un nouveau Web Service**
3. **Configurer les variables d'environnement** :
   - `NODE_ENV=production`
   - `MONGODB_URI` (votre chaîne MongoDB Atlas)
   - `JWT_SECRET` (secret sécurisé)
   - Autres variables selon vos besoins
4. **Déployer** - Render redéploiera automatiquement à chaque push

### Variables d'environnement de production
```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/team-task-manager?retryWrites=true&w=majority
JWT_SECRET=secret_tres_securise_en_production
JWT_EXPIRES_IN=7d
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
CORS_ORIGIN=*
```

## 📁 Structure du Projet

```
src/
├── config/          # Configuration (DB, app)
├── controllers/     # Contrôleurs métier
├── middleware/      # Middleware (auth, validation, erreurs)
├── models/          # Modèles Mongoose
├── routes/          # Routes de l'API
├── utils/           # Utilitaires (JWT, validation)
└── server.js        # Point d'entrée de l'application
```

## 🔒 Sécurité

- **Authentification JWT** avec expiration
- **Hachage des mots de passe** avec bcrypt
- **Validation des données** avec Joi
- **Headers de sécurité** avec Helmet
- **Rate limiting** pour prévenir les abus
- **CORS configuré** pour la sécurité
- **Gestion d'erreurs** sécurisée

## 📊 Base de Données

### Collections MongoDB
- **users** : Utilisateurs et authentification
- **members** : Membres de l'équipe
- **tasks** : Tâches et commentaires

### Index recommandés
```javascript
// Users
db.users.createIndex({ "email": 1 }, { unique: true })
db.users.createIndex({ "username": 1 }, { unique: true })

// Members
db.members.createIndex({ "email": 1 }, { unique: true })
db.members.createIndex({ "department": 1 })
db.members.createIndex({ "isActive": 1 })

// Tasks
db.tasks.createIndex({ "status": 1 })
db.tasks.createIndex({ "priority": 1 })
db.tasks.createIndex({ "assignedTo": 1 })
db.tasks.createIndex({ "dueDate": 1 })
```

## 🧪 Tests et Qualité

### Tests unitaires
- Tests des modèles
- Tests des contrôleurs
- Tests des utilitaires

### Tests d'intégration
- Tests des routes
- Tests de l'authentification
- Tests de la base de données

### Qualité du code
- Validation des données
- Gestion d'erreurs
- Logs structurés

## 📈 Monitoring et Maintenance

### Logs
- Logs structurés avec timestamps
- Niveaux de log (info, warn, error)
- Rotation des logs

### Métriques
- Temps de réponse des endpoints
- Utilisation de la base de données
- Erreurs et exceptions

### Alertes
- Surveillance de la santé de l'API
- Alertes sur les erreurs critiques
- Monitoring de la base de données

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 🆘 Support

Pour toute question ou problème :
1. Vérifier la documentation
2. Consulter les issues GitHub
3. Créer une nouvelle issue si nécessaire

## 🎯 Roadmap

- [ ] Interface utilisateur React/Vue.js
- [ ] Tests automatisés complets
- [ ] CI/CD avec GitHub Actions
- [ ] Documentation API avec Swagger
- [ ] Monitoring avancé
- [ ] Notifications en temps réel
- [ ] API GraphQL
- [ ] Mobile app

---

**Développé avec ❤️ pour la gestion d'équipe moderne**
