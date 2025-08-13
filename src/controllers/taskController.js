const Task = require('../models/Task');
const Member = require('../models/Member');

/**
 * Contrôleur de gestion des tâches
 * Gère le CRUD des tâches avec pagination et filtres
 */
class TaskController {
  
  /**
   * Récupérer toutes les tâches avec pagination et filtres
   * GET /api/tasks
   */
  async getAllTasks(req, res) {
    try {
      const { page = 1, limit = 10, search, sort = 'createdAt', order = 'desc' } = req.query;
      const filters = req.taskFilters || {};
      const pagination = req.pagination || { page: 1, limit: 10, sort: 'createdAt', order: 'desc' };

      // Construire la requête de recherche
      let query = {};
      
      if (search) {
        query = Task.searchTasks(search, filters).getQuery();
      } else {
        // Appliquer les filtres sans recherche textuelle
        if (filters.status) query.status = filters.status;
        if (filters.priority) query.priority = filters.priority;
        if (filters.assignedTo) query.assignedTo = filters.assignedTo;
        if (filters.createdBy) query.createdBy = filters.createdBy;
        if (filters.dueDateFrom || filters.dueDateTo) {
          query.dueDate = {};
          if (filters.dueDateFrom) query.dueDate.$gte = filters.dueDateFrom;
          if (filters.dueDateTo) query.dueDate.$lte = filters.dueDateTo;
        }
        if (filters.tags) query.tags = { $in: filters.tags };
      }

      // Calculer la pagination
      const skip = (parseInt(page) - 1) * parseInt(limit);
      const sortOrder = order === 'asc' ? 1 : -1;

      // Récupérer les tâches avec pagination
      const tasks = await Task.find(query)
        .populate('assignedTo', 'firstName lastName email')
        .populate('createdBy', 'username email')
        .sort({ [sort]: sortOrder })
        .skip(skip)
        .limit(parseInt(limit));

      // Compter le total des résultats
      const total = await Task.countDocuments(query);
      const totalPages = Math.ceil(total / parseInt(limit));

      // Construire la réponse
      const response = {
        success: true,
        data: {
          tasks: tasks.map(task => ({
            ...task.toObject(),
            isOverdue: task.isOverdue,
            timeRemaining: task.timeRemaining
          })),
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
      console.error('Erreur lors de la récupération des tâches:', error);
      
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des tâches',
        error: 'TASKS_FETCH_ERROR'
      });
    }
  }

  /**
   * Récupérer une tâche par son ID
   * GET /api/tasks/:id
   */
  async getTaskById(req, res) {
    try {
      const { id } = req.params;

      const task = await Task.findById(id)
        .populate('assignedTo', 'firstName lastName email')
        .populate('createdBy', 'username email')
        .populate('comments.author', 'username email');

      if (!task) {
        return res.status(404).json({
          success: false,
          message: 'Tâche non trouvée',
          error: 'TASK_NOT_FOUND'
        });
      }

      res.json({
        success: true,
        data: {
          task: {
            ...task.toObject(),
            isOverdue: task.isOverdue,
            timeRemaining: task.timeRemaining
          }
        }
      });

    } catch (error) {
      console.error('Erreur lors de la récupération de la tâche:', error);
      
      if (error.name === 'CastError') {
        return res.status(400).json({
          success: false,
          message: 'ID de tâche invalide',
          error: 'INVALID_TASK_ID'
        });
      }

      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération de la tâche',
        error: 'TASK_FETCH_ERROR'
      });
    }
  }

  /**
   * Créer une nouvelle tâche
   * POST /api/tasks
   */
  async createTask(req, res) {
    try {
      const taskData = {
        ...req.body,
        createdBy: req.user._id
      };

      // Vérifier que le membre assigné existe
      const assignedMember = await Member.findById(taskData.assignedTo);
      if (!assignedMember) {
        return res.status(400).json({
          success: false,
          message: 'Le membre assigné n\'existe pas',
          error: 'ASSIGNED_MEMBER_NOT_FOUND'
        });
      }

      // Vérifier que le membre est actif
      if (!assignedMember.isActive) {
        return res.status(400).json({
          success: false,
          message: 'Le membre assigné n\'est pas actif',
          error: 'ASSIGNED_MEMBER_INACTIVE'
        });
      }

      const task = new Task(taskData);
      await task.save();

      // Populate les références
      await task.populate('assignedTo', 'firstName lastName email');
      await task.populate('createdBy', 'username email');

      res.status(201).json({
        success: true,
        message: 'Tâche créée avec succès',
        data: {
          task: {
            ...task.toObject(),
            isOverdue: task.isOverdue,
            timeRemaining: task.timeRemaining
          }
        }
      });

    } catch (error) {
      console.error('Erreur lors de la création de la tâche:', error);
      
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
        message: 'Erreur lors de la création de la tâche',
        error: 'TASK_CREATION_ERROR'
      });
    }
  }

  /**
   * Mettre à jour une tâche
   * PUT /api/tasks/:id
   */
  async updateTask(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      // Vérifier que la tâche existe
      const task = await Task.findById(id);
      if (!task) {
        return res.status(404).json({
          success: false,
          message: 'Tâche non trouvée',
          error: 'TASK_NOT_FOUND'
        });
      }

      // Vérifier le membre assigné si il est modifié
      if (updateData.assignedTo && updateData.assignedTo !== task.assignedTo.toString()) {
        const assignedMember = await Member.findById(updateData.assignedTo);
        if (!assignedMember) {
          return res.status(400).json({
            success: false,
            message: 'Le membre assigné n\'existe pas',
            error: 'ASSIGNED_MEMBER_NOT_FOUND'
          });
        }
        if (!assignedMember.isActive) {
          return res.status(400).json({
            success: false,
            message: 'Le membre assigné n\'est pas actif',
            error: 'ASSIGNED_MEMBER_INACTIVE'
          });
        }
      }

      // Mettre à jour la tâche
      const updatedTask = await Task.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      )
        .populate('assignedTo', 'firstName lastName email')
        .populate('createdBy', 'username email');

      res.json({
        success: true,
        message: 'Tâche mise à jour avec succès',
        data: {
          task: {
            ...updatedTask.toObject(),
            isOverdue: updatedTask.isOverdue,
            timeRemaining: updatedTask.timeRemaining
          }
        }
      });

    } catch (error) {
      console.error('Erreur lors de la mise à jour de la tâche:', error);
      
      if (error.name === 'CastError') {
        return res.status(400).json({
          success: false,
          message: 'ID de tâche invalide',
          error: 'INVALID_TASK_ID'
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
        message: 'Erreur lors de la mise à jour de la tâche',
        error: 'TASK_UPDATE_ERROR'
      });
    }
  }

  /**
   * Supprimer une tâche
   * DELETE /api/tasks/:id
   */
  async deleteTask(req, res) {
    try {
      const { id } = req.params;

      // Vérifier que la tâche existe
      const task = await Task.findById(id);
      if (!task) {
        return res.status(404).json({
          success: false,
          message: 'Tâche non trouvée',
          error: 'TASK_NOT_FOUND'
        });
      }

      // Supprimer la tâche
      await Task.findByIdAndDelete(id);

      res.json({
        success: true,
        message: 'Tâche supprimée avec succès'
      });

    } catch (error) {
      console.error('Erreur lors de la suppression de la tâche:', error);
      
      if (error.name === 'CastError') {
        return res.status(400).json({
          success: false,
          message: 'ID de tâche invalide',
          error: 'INVALID_TASK_ID'
        });
      }

      res.status(500).json({
        success: false,
        message: 'Erreur lors de la suppression de la tâche',
        error: 'TASK_DELETION_ERROR'
      });
    }
  }

  /**
   * Marquer une tâche comme terminée
   * PATCH /api/tasks/:id/complete
   */
  async completeTask(req, res) {
    try {
      const { id } = req.params;
      const { actualHours } = req.body;

      const task = await Task.findById(id);
      if (!task) {
        return res.status(404).json({
          success: false,
          message: 'Tâche non trouvée',
          error: 'TASK_NOT_FOUND'
        });
      }

      if (task.status === 'completed') {
        return res.status(400).json({
          success: false,
          message: 'Cette tâche est déjà terminée',
          error: 'TASK_ALREADY_COMPLETED'
        });
      }

      // Mettre à jour la tâche
      task.status = 'completed';
      task.completedAt = new Date();
      if (actualHours !== undefined) {
        task.actualHours = actualHours;
      }

      await task.save();

      // Populate les références
      await task.populate('assignedTo', 'firstName lastName email');
      await task.populate('createdBy', 'username email');

      res.json({
        success: true,
        message: 'Tâche marquée comme terminée',
        data: {
          task: {
            ...task.toObject(),
            isOverdue: task.isOverdue,
            timeRemaining: task.timeRemaining
          }
        }
      });

    } catch (error) {
      console.error('Erreur lors de la finalisation de la tâche:', error);
      
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la finalisation de la tâche',
        error: 'TASK_COMPLETION_ERROR'
      });
    }
  }

  /**
   * Ajouter un commentaire à une tâche
   * POST /api/tasks/:id/comments
   */
  async addComment(req, res) {
    try {
      const { id } = req.params;
      const { content } = req.body;

      const task = await Task.findById(id);
      if (!task) {
        return res.status(404).json({
          success: false,
          message: 'Tâche non trouvée',
          error: 'TASK_NOT_FOUND'
        });
      }

      // Ajouter le commentaire
      task.comments.push({
        author: req.user._id,
        content
      });

      await task.save();

      // Populate les références
      await task.populate('assignedTo', 'firstName lastName email');
      await task.populate('createdBy', 'username email');
      await task.populate('comments.author', 'username email');

      res.status(201).json({
        success: true,
        message: 'Commentaire ajouté avec succès',
        data: {
          task: {
            ...task.toObject(),
            isOverdue: task.isOverdue,
            timeRemaining: task.timeRemaining
          }
        }
      });

    } catch (error) {
      console.error('Erreur lors de l\'ajout du commentaire:', error);
      
      res.status(500).json({
        success: false,
        message: 'Erreur lors de l\'ajout du commentaire',
        error: 'COMMENT_ADDITION_ERROR'
      });
    }
  }

  /**
   * Obtenir les statistiques des tâches
   * GET /api/tasks/stats
   */
  async getTaskStats(req, res) {
    try {
      const totalTasks = await Task.countDocuments();
      const pendingTasks = await Task.countDocuments({ status: 'pending' });
      const inProgressTasks = await Task.countDocuments({ status: 'in_progress' });
      const completedTasks = await Task.countDocuments({ status: 'completed' });
      const cancelledTasks = await Task.countDocuments({ status: 'cancelled' });

      // Statistiques par priorité
      const priorityStats = await Task.aggregate([
        { $group: { _id: '$priority', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]);

      // Statistiques par statut
      const statusStats = await Task.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]);

      // Tâches en retard
      const overdueTasks = await Task.countDocuments({
        dueDate: { $lt: new Date() },
        status: { $nin: ['completed', 'cancelled'] }
      });

      res.json({
        success: true,
        data: {
          total: totalTasks,
          pending: pendingTasks,
          inProgress: inProgressTasks,
          completed: completedTasks,
          cancelled: cancelledTasks,
          overdue: overdueTasks,
          priorities: priorityStats,
          statuses: statusStats
        }
      });

    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des statistiques',
        error: 'TASK_STATS_ERROR'
      });
    }
  }
}

module.exports = new TaskController();
