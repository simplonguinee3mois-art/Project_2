const User = require('../models/User');
const { generateToken } = require('../utils/jwt');

/**
 * Contrôleur d'authentification
 * Gère l'inscription et la connexion des utilisateurs
 */
class AuthController {
  
  /**
   * Inscription d'un nouvel utilisateur
   * POST /api/auth/register
   */
  async register(req, res) {
    try {
      const { username, email, password, role } = req.body;

      // Vérifier si l'utilisateur existe déjà
      const existingUser = await User.findOne({
        $or: [{ email }, { username }]
      });

      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: existingUser.email === email 
            ? 'Cet email est déjà utilisé' 
            : 'Ce nom d\'utilisateur est déjà pris',
          error: 'USER_ALREADY_EXISTS'
        });
      }

      // Créer le nouvel utilisateur
      const user = new User({
        username,
        email,
        password,
        role: role || 'member'
      });

      await user.save();

      // Générer le token JWT
      const token = generateToken(user);

      // Réponse de succès
      res.status(201).json({
        success: true,
        message: 'Utilisateur créé avec succès',
        data: {
          user: user.toPublicJSON(),
          token
        }
      });

    } catch (error) {
      console.error('Erreur lors de l\'inscription:', error);
      
      // Gestion des erreurs de validation Mongoose
      if (error.name === 'ValidationError') {
        const validationErrors = Object.values(error.errors).map(err => err.message);
        return res.status(400).json({
          success: false,
          message: 'Données invalides',
          error: 'VALIDATION_ERROR',
          details: validationErrors
        });
      }

      // Gestion des erreurs de duplication
      if (error.code === 11000) {
        const field = Object.keys(error.keyPattern)[0];
        return res.status(400).json({
          success: false,
          message: `${field === 'email' ? 'Cet email' : 'Ce nom d\'utilisateur'} est déjà utilisé`,
          error: 'DUPLICATE_FIELD'
        });
      }

      res.status(500).json({
        success: false,
        message: 'Erreur lors de l\'inscription',
        error: 'REGISTRATION_ERROR'
      });
    }
  }

  /**
   * Connexion d'un utilisateur
   * POST /api/auth/login
   */
  async login(req, res) {
    try {
      const { email, password } = req.body;

      // Vérifier que l'utilisateur existe
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Email ou mot de passe incorrect',
          error: 'INVALID_CREDENTIALS'
        });
      }

      // Vérifier que le compte est actif
      if (!user.isActive) {
        return res.status(401).json({
          success: false,
          message: 'Compte utilisateur désactivé',
          error: 'ACCOUNT_DISABLED'
        });
      }

      // Vérifier le mot de passe
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Email ou mot de passe incorrect',
          error: 'INVALID_CREDENTIALS'
        });
      }

      // Générer le token JWT
      const token = generateToken(user);

      // Réponse de succès
      res.json({
        success: true,
        message: 'Connexion réussie',
        data: {
          user: user.toPublicJSON(),
          token
        }
      });

    } catch (error) {
      console.error('Erreur lors de la connexion:', error);
      
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la connexion',
        error: 'LOGIN_ERROR'
      });
    }
  }

  /**
   * Récupérer le profil de l'utilisateur connecté
   * GET /api/auth/profile
   */
  async getProfile(req, res) {
    try {
      // L'utilisateur est déjà disponible via le middleware d'authentification
      res.json({
        success: true,
        data: {
          user: req.user
        }
      });

    } catch (error) {
      console.error('Erreur lors de la récupération du profil:', error);
      
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération du profil',
        error: 'PROFILE_ERROR'
      });
    }
  }

  /**
   * Mettre à jour le profil de l'utilisateur connecté
   * PUT /api/auth/profile
   */
  async updateProfile(req, res) {
    try {
      const { username, email, currentPassword, newPassword } = req.body;
      const userId = req.user._id;

      // Récupérer l'utilisateur avec le mot de passe pour la vérification
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Utilisateur non trouvé',
          error: 'USER_NOT_FOUND'
        });
      }

      // Vérifier le mot de passe actuel si un nouveau mot de passe est fourni
      if (newPassword) {
        if (!currentPassword) {
          return res.status(400).json({
            success: false,
            message: 'Le mot de passe actuel est requis pour changer le mot de passe',
            error: 'CURRENT_PASSWORD_REQUIRED'
          });
        }

        const isCurrentPasswordValid = await user.comparePassword(currentPassword);
        if (!isCurrentPasswordValid) {
          return res.status(400).json({
            success: false,
            message: 'Mot de passe actuel incorrect',
            error: 'INVALID_CURRENT_PASSWORD'
          });
        }
      }

      // Mettre à jour les champs autorisés
      if (username && username !== user.username) {
        // Vérifier que le nouveau nom d'utilisateur n'est pas déjà pris
        const existingUser = await User.findOne({ username });
        if (existingUser) {
          return res.status(400).json({
            success: false,
            message: 'Ce nom d\'utilisateur est déjà pris',
            error: 'USERNAME_TAKEN'
          });
        }
        user.username = username;
      }

      if (email && email !== user.email) {
        // Vérifier que le nouvel email n'est pas déjà utilisé
        const existingUser = await User.findOne({ email });
        if (existingUser) {
          return res.status(400).json({
            success: false,
            message: 'Cet email est déjà utilisé',
            error: 'EMAIL_TAKEN'
          });
        }
        user.email = email;
      }

      if (newPassword) {
        user.password = newPassword;
      }

      await user.save();

      // Générer un nouveau token si les informations ont changé
      const token = generateToken(user);

      res.json({
        success: true,
        message: 'Profil mis à jour avec succès',
        data: {
          user: user.toPublicJSON(),
          token
        }
      });

    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil:', error);
      
      if (error.name === 'ValidationError') {
        const validationErrors = Object.values(error.errors).map(err => err.message);
        return res.status(400).json({
          success: false,
          message: 'Données invalides',
          error: 'VALIDATION_ERROR',
          details: validationErrors
        });
      }

      res.status(500).json({
        success: false,
        message: 'Erreur lors de la mise à jour du profil',
        error: 'PROFILE_UPDATE_ERROR'
      });
    }
  }

  /**
   * Déconnexion (optionnel - côté client)
   * POST /api/auth/logout
   */
  async logout(req, res) {
    try {
      // En JWT, la déconnexion se fait côté client en supprimant le token
      // Cette route peut être utilisée pour la journalisation
      res.json({
        success: true,
        message: 'Déconnexion réussie'
      });

    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la déconnexion',
        error: 'LOGOUT_ERROR'
      });
    }
  }
}

module.exports = new AuthController();
