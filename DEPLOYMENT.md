# Guide de Déploiement - Team Task Manager API

## 🚀 Déploiement en Production

### 1. Configuration MongoDB Atlas

#### 1.1 Créer un compte MongoDB Atlas
1. Aller sur [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Créer un compte gratuit
3. Choisir le plan "Free" (M0)

#### 1.2 Créer un cluster
1. Cliquer sur "Build a Database"
2. Choisir "FREE" tier
3. Sélectionner un provider (AWS, Google Cloud, Azure)
4. Choisir la région la plus proche
5. Cliquer sur "Create"

#### 1.3 Configurer la sécurité
1. **Créer un utilisateur de base de données** :
   - Username : `team-task-manager-user`
   - Password : `[Mot de passe sécurisé]`
   - Role : `Read and write to any database`

2. **Configurer l'accès réseau** :
   - Cliquer sur "Network Access"
   - Cliquer sur "Add IP Address"
   - Choisir "Allow Access from Anywhere" (0.0.0.0/0)
   - Cliquer sur "Confirm"

#### 1.4 Obtenir la chaîne de connexion
1. Cliquer sur "Connect"
2. Choisir "Connect your application"
3. Copier la chaîne de connexion

### 2. Configuration des Variables d'Environnement

#### 2.1 Fichier .env (Développement local)
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

#### 2.2 Utiliser le script de configuration
```bash
node setup-atlas.js
```

### 3. Déploiement sur Render

#### 3.1 Créer un compte Render
1. Aller sur [Render](https://render.com)
2. Créer un compte (peut utiliser GitHub)

#### 3.2 Créer un nouveau service
1. Cliquer sur "New +"
2. Choisir "Web Service"
3. Connecter votre repository GitHub

#### 3.3 Configuration du service
- **Name** : `team-task-manager-api`
- **Environment** : `Node`
- **Build Command** : `npm install`
- **Start Command** : `npm start`
- **Plan** : `Free` (pour commencer)

#### 3.4 Variables d'environnement sur Render
Ajouter ces variables dans l'onglet "Environment" :
```
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/team-task-manager?retryWrites=true&w=majority
JWT_SECRET=votre_secret_jwt_tres_securise
JWT_EXPIRES_IN=7d
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
CORS_ORIGIN=*
```

### 4. Test du Déploiement

#### 4.1 Vérifier la santé de l'API
```bash
curl https://votre-api.onrender.com/api/health
```

#### 4.2 Tester l'authentification
```bash
# Inscription
curl -X POST https://votre-api.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"password123"}'

# Connexion
curl -X POST https://votre-api.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### 5. Monitoring et Maintenance

#### 5.1 Logs sur Render
- Aller dans l'onglet "Logs" de votre service
- Surveiller les erreurs et performances

#### 5.2 MongoDB Atlas Monitoring
- Dashboard avec métriques de performance
- Alertes configurables
- Sauvegardes automatiques

#### 5.3 Mise à jour de l'API
1. Pousser les changements sur GitHub
2. Render redéploiera automatiquement
3. Vérifier la santé après déploiement

### 6. Sécurité en Production

#### 6.1 Variables d'environnement
- Ne jamais commiter le fichier `.env`
- Utiliser des secrets sécurisés
- Rotation régulière des clés JWT

#### 6.2 MongoDB Atlas
- Limiter l'accès réseau aux IPs nécessaires
- Utiliser des mots de passe forts
- Activer l'authentification à deux facteurs

#### 6.3 API
- Rate limiting activé
- Headers de sécurité (Helmet)
- Validation des données
- Gestion d'erreurs sécurisée

### 7. Dépannage

#### 7.1 Erreurs de connexion MongoDB
- Vérifier l'URL de connexion
- Vérifier les identifiants
- Vérifier l'accès réseau

#### 7.2 Erreurs de déploiement Render
- Vérifier les logs de build
- Vérifier les variables d'environnement
- Vérifier la commande de démarrage

#### 7.3 Performance
- Monitorer les temps de réponse
- Optimiser les requêtes MongoDB
- Utiliser la pagination

## 🎯 Prochaines Étapes

1. **Tests automatisés** : Implémenter Jest et Supertest
2. **CI/CD** : GitHub Actions pour tests automatiques
3. **Monitoring** : Intégration avec des outils comme Sentry
4. **Documentation API** : Swagger/OpenAPI
5. **Frontend** : Interface utilisateur React/Vue.js
