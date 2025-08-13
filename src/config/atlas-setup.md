# Configuration MongoDB Atlas

## 1. Créer un compte MongoDB Atlas

1. Aller sur [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Cliquer sur "Try Free" ou "Get Started Free"
3. Créer un compte ou se connecter

## 2. Créer un cluster

1. **Choisir un plan** : 
   - Plan gratuit (M0) : 512MB, partagé
   - Plan payant (M2+) : Plus de ressources

2. **Choisir un provider** :
   - AWS, Google Cloud, ou Azure
   - Sélectionner la région la plus proche

3. **Nommer le cluster** : `team-task-manager-cluster`

## 3. Configurer la sécurité

### 3.1 Créer un utilisateur de base de données
- Username : `team-task-manager-user`
- Password : `[Mot de passe sécurisé]`
- Role : `Read and write to any database`

### 3.2 Configurer l'accès réseau
- **Option 1 (Développement)** : `Allow access from anywhere` (0.0.0.0/0)
- **Option 2 (Production)** : Ajouter l'IP de votre serveur

## 4. Obtenir la chaîne de connexion

La chaîne ressemble à :
```
mongodb+srv://team-task-manager-user:<password>@cluster0.xxxxx.mongodb.net/team-task-manager?retryWrites=true&w=majority
```

## 5. Variables d'environnement

Mettre à jour le fichier `.env` :
```env
MONGODB_URI=mongodb+srv://team-task-manager-user:<password>@cluster0.xxxxx.mongodb.net/team-task-manager?retryWrites=true&w=majority
```

## 6. Test de connexion

Lancer l'API et vérifier la connexion dans les logs.
