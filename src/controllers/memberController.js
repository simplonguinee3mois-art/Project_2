const Member = require('../models/Member');

/**
 * Contrôleur de gestion des membres
 * Gère le CRUD des membres d'équipe
 */
class MemberController {
  
  /**
   * Récupérer tous les membres avec pagination et filtres
   * GET /api/members
   */
  async getAllMembers(req, res) {
    try {
      const { page = 1, limit = 10, search, sort = 'createdAt', order = 'desc' } = req.query;
      const filters = req.memberFilters || {};

      // Construire la requête de recherche
      let query = {};
      
      if (search) {
        query = Member.searchMembers(search, filters).getQuery();
      } else {
        // Appliquer les filtres sans recherche textuelle
        if (filters.department) query.department = filters.department;
        if (filters.isActive !== undefined) query.isActive = filters.isActive;
        if (filters.position) query.position = filters.position;
      }

      // Calculer la pagination
      const skip = (parseInt(page) - 1) * parseInt(limit);
      const sortOrder = order === 'asc' ? 1 : -1;

      // Récupérer les membres avec pagination
      const members = await Member.find(query)
        .populate('createdBy', 'username email')
        .sort({ [sort]: sortOrder })
        .skip(skip)
        .limit(parseInt(limit));

      // Compter le total des résultats
      const total = await Member.countDocuments(query);
      const totalPages = Math.ceil(total / parseInt(limit));

      // Construire la réponse
      const response = {
        success: true,
        data: {
          members: members.map(member => member.toPublicJSON()),
          pagination: {
            currentPage: parseInt(page),
            totalPages,
            totalItems: total,
            itemsPerPage: parseInt(limit),
            hasNextPage: parseInt(page) < totalPages,
            hasPrevPage: parseInt(page) > 1
          }
        }
      };

      res.json(response);

    } catch (error) {
      console.error('Erreur lors de la récupération des membres:', error);
      
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des membres',
        error: 'MEMBERS_FETCH_ERROR'
      });
    }
  }

  /**
   * Récupérer un membre par son ID
   * GET /api/members/:id
   */
  async getMemberById(req, res) {
    try {
      const { id } = req.params;

      const member = await Member.findById(id)
        .populate('createdBy', 'username email');

      if (!member) {
        return res.status(404).json({
          success: false,
          message: 'Membre non trouvé',
          error: 'MEMBER_NOT_FOUND'
        });
      }

      res.json({
        success: true,
        data: {
          member: member.toPublicJSON()
        }
      });

    } catch (error) {
      console.error('Erreur lors de la récupération du membre:', error);
      
      if (error.name === 'CastError') {
        return res.status(400).json({
          success: false,
          message: 'ID de membre invalide',
          error: 'INVALID_MEMBER_ID'
        });
      }

      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération du membre',
        error: 'MEMBER_FETCH_ERROR'
      });
    }
  }

  /**
   * Créer un nouveau membre
   * POST /api/members
   */
  async createMember(req, res) {
    try {
      const memberData = {
        ...req.body,
        createdBy: req.user._id
      };

      // Vérifier si l'email est déjà utilisé
      const existingMember = await Member.findOne({ email: memberData.email });
      if (existingMember) {
        return res.status(400).json({
          success: false,
          message: 'Cet email est déjà utilisé par un autre membre',
          error: 'EMAIL_ALREADY_EXISTS'
        });
      }

      const member = new Member(memberData);
      await member.save();

      // Populate les références
      await member.populate('createdBy', 'username email');

      res.status(201).json({
        success: true,
        message: 'Membre créé avec succès',
        data: {
          member: member.toPublicJSON()
        }
      });

    } catch (error) {
      console.error('Erreur lors de la création du membre:', error);
      
      if (error.name === 'ValidationError') {
        const validationErrors = Object.values(error.errors).map(err => err.message);
        return res.status(400).json({
          success: false,
          message: 'Données invalides',
          error: 'VALIDATION_ERROR',
          details: validationErrors
        });
      }

      if (error.code === 11000) {
        const field = Object.keys(error.keyPattern)[0];
        return res.status(400).json({
          success: false,
          message: `${field === 'email' ? 'Cet email' : 'Ce nom'} est déjà utilisé`,
          error: 'DUPLICATE_FIELD'
        });
      }

      res.status(500).json({
        success: false,
        message: 'Erreur lors de la création du membre',
        error: 'MEMBER_CREATION_ERROR'
      });
    }
  }

  /**
   * Mettre à jour un membre
   * PUT /api/members/:id
   */
  async updateMember(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      // Vérifier que le membre existe
      const member = await Member.findById(id);
      if (!member) {
        return res.status(404).json({
          success: false,
          message: 'Membre non trouvé',
          error: 'MEMBER_NOT_FOUND'
        });
      }

      // Vérifier l'email si il est modifié
      if (updateData.email && updateData.email !== member.email) {
        const existingMember = await Member.findOne({ email: updateData.email });
        if (existingMember) {
          return res.status(400).json({
            success: false,
            message: 'Cet email est déjà utilisé par un autre membre',
            error: 'EMAIL_ALREADY_EXISTS'
          });
        }
      }

      // Mettre à jour le membre
      const updatedMember = await Member.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      ).populate('createdBy', 'username email');

      res.json({
        success: true,
        message: 'Membre mis à jour avec succès',
        data: {
          member: updatedMember.toPublicJSON()
        }
      });

    } catch (error) {
      console.error('Erreur lors de la mise à jour du membre:', error);
      
      if (error.name === 'CastError') {
        return res.status(400).json({
          success: false,
          message: 'ID de membre invalide',
          error: 'INVALID_MEMBER_ID'
        });
      }

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
        message: 'Erreur lors de la mise à jour du membre',
        error: 'MEMBER_UPDATE_ERROR'
      });
    }
  }

  /**
   * Supprimer un membre
   * DELETE /api/members/:id
   */
  async deleteMember(req, res) {
    try {
      const { id } = req.params;

      // Vérifier que le membre existe
      const member = await Member.findById(id);
      if (!member) {
        return res.status(404).json({
          success: false,
          message: 'Membre non trouvé',
          error: 'MEMBER_NOT_FOUND'
        });
      }

      // Vérifier s'il y a des tâches assignées à ce membre
      const Task = require('../models/Task');
      const assignedTasks = await Task.findOne({ assignedTo: id });
      
      if (assignedTasks) {
        return res.status(400).json({
          success: false,
          message: 'Impossible de supprimer ce membre car il a des tâches assignées',
          error: 'MEMBER_HAS_TASKS'
        });
      }

      // Supprimer le membre
      await Member.findByIdAndDelete(id);

      res.json({
        success: true,
        message: 'Membre supprimé avec succès'
      });

    } catch (error) {
      console.error('Erreur lors de la suppression du membre:', error);
      
      if (error.name === 'CastError') {
        return res.status(400).json({
          success: false,
          message: 'ID de membre invalide',
          error: 'INVALID_MEMBER_ID'
        });
      }

      res.status(500).json({
        success: false,
        message: 'Erreur lors de la suppression du membre',
        error: 'MEMBER_DELETION_ERROR'
      });
    }
  }

  /**
   * Rechercher des membres
   * GET /api/members/search
   */
  async searchMembers(req, res) {
    try {
      const { q: query, department, isActive, position } = req.query;
      const filters = {};

      if (department) filters.department = department;
      if (isActive !== undefined) filters.isActive = isActive === 'true';
      if (position) filters.position = position;

      const members = await Member.searchMembers(query, filters);

      res.json({
        success: true,
        data: {
          members: members.map(member => member.toPublicJSON()),
          total: members.length
        }
      });

    } catch (error) {
      console.error('Erreur lors de la recherche des membres:', error);
      
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la recherche des membres',
        error: 'MEMBER_SEARCH_ERROR'
      });
    }
  }

  /**
   * Obtenir les statistiques des membres
   * GET /api/members/stats
   */
  async getMemberStats(req, res) {
    try {
      const totalMembers = await Member.countDocuments();
      const activeMembers = await Member.countDocuments({ isActive: true });
      const inactiveMembers = await Member.countDocuments({ isActive: false });

      // Statistiques par département
      const departmentStats = await Member.aggregate([
        { $group: { _id: '$department', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]);

      // Statistiques par position
      const positionStats = await Member.aggregate([
        { $group: { _id: '$position', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]);

      res.json({
        success: true,
        data: {
          total: totalMembers,
          active: activeMembers,
          inactive: inactiveMembers,
          departments: departmentStats,
          positions: positionStats
        }
      });

    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des statistiques',
        error: 'MEMBER_STATS_ERROR'
      });
    }
  }
}

module.exports = new MemberController();
