# 🚀 Guide de Déploiement sur Render

## 📋 Prérequis
- Compte GitHub avec votre projet
- Compte Render (gratuit)
- MongoDB Atlas configuré

## 🔧 Étapes de Déploiement

### 1. Préparer le Repository GitHub
```bash
git add .
git commit -m "Préparation du déploiement sur Render"
git push origin main
```

### 2. Se connecter sur Render
- Aller sur [render.com](https://render.com)
- Se connecter avec GitHub
- Cliquer sur "New +" → "Web Service"

### 3. Configurer le Service
- **Name**: `team-task-manager-api`
- **Environment**: `Node`
- **Region**: Choisir la plus proche
- **Branch**: `main`
- **Build Command**: `npm install`
- **Start Command**: `npm start`

### 4. Variables d'Environnement
```
NODE_ENV=production
PORT=10000
MONGODB_URI=mongodb+srv://simplonguinee3mois:Alpha.o.b5@cluster0.zx9kzel.mongodb.net/team-task-manager?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=secret_jwt_production_tres_securise_2024
JWT_EXPIRES_IN=7d
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
CORS_ORIGIN=*
```

### 5. Déployer
- Cliquer sur "Create Web Service"
- Attendre le déploiement (2-3 minutes)
- Votre API sera accessible sur : `https://team-task-manager-api.onrender.com`

## 🌐 Test du Déploiement
```bash
# Test de santé
curl https://team-task-manager-api.onrender.com/api/health

# Test d'information
curl https://team-task-manager-api.onrender.com/api/info
```

## 🔄 Déploiement Automatique
- Chaque push sur `main` déclenchera un redéploiement automatique
- Les logs sont disponibles dans l'interface Render

## 📊 Monitoring
- Santé du service
- Logs en temps réel
- Métriques de performance
- Alertes automatiques

## 🆘 Support
- Documentation Render : [docs.render.com](https://docs.render.com)
- Logs d'erreur dans l'interface Render
- Redémarrage manuel si nécessaire
