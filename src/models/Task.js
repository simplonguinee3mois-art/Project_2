const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Le titre de la tâche est requis'],
    trim: true,
    minlength: [3, 'Le titre doit contenir au moins 3 caractères'],
    maxlength: [200, 'Le titre ne peut pas dépasser 200 caractères']
  },
  description: {
    type: String,
    required: [true, 'La description est requise'],
    trim: true,
    minlength: [10, 'La description doit contenir au moins 10 caractères'],
    maxlength: [1000, 'La description ne peut pas dépasser 1000 caractères']
  },
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'completed', 'cancelled'],
    default: 'pending',
    required: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium',
    required: true
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Member',
    required: [true, 'Un membre doit être assigné à la tâche']
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  dueDate: {
    type: Date,
    required: [true, 'La date d\'échéance est requise']
  },
  completedAt: {
    type: Date,
    default: null
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [30, 'Un tag ne peut pas dépasser 30 caractères']
  }],
  attachments: [{
    filename: String,
    url: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  comments: [{
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: [500, 'Un commentaire ne peut pas dépasser 500 caractères']
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  estimatedHours: {
    type: Number,
    min: [0, 'Les heures estimées ne peuvent pas être négatives'],
    max: [1000, 'Les heures estimées ne peuvent pas dépasser 1000']
  },
  actualHours: {
    type: Number,
    min: [0, 'Les heures réelles ne peuvent pas être négatives'],
    default: 0
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index pour améliorer les performances
taskSchema.index({ status: 1 });
taskSchema.index({ priority: 1 });
taskSchema.index({ assignedTo: 1 });
taskSchema.index({ dueDate: 1 });
taskSchema.index({ createdBy: 1 });
taskSchema.index({ createdAt: -1 });

// Virtual pour vérifier si la tâche est en retard
taskSchema.virtual('isOverdue').get(function() {
  if (this.status === 'completed' || this.status === 'cancelled') {
    return false;
  }
  return this.dueDate < new Date();
});

// Virtual pour le temps restant
taskSchema.virtual('timeRemaining').get(function() {
  if (this.status === 'completed' || this.status === 'cancelled') {
    return 0;
  }
  const now = new Date();
  const timeDiff = this.dueDate.getTime() - now.getTime();
  return Math.max(0, Math.ceil(timeDiff / (1000 * 3600 * 24))); // Jours restants
});

// Méthode pour marquer une tâche comme terminée
taskSchema.methods.complete = function() {
  this.status = 'completed';
  this.completedAt = new Date();
  return this.save();
};

// Méthode statique pour rechercher des tâches avec pagination et filtres
taskSchema.statics.searchTasks = function(query, filters = {}, page = 1, limit = 10) {
  const searchQuery = {};
  
  // Recherche textuelle
  if (query) {
    searchQuery.$or = [
      { title: { $regex: query, $options: 'i' } },
      { description: { $regex: query, $options: 'i' } },
      { tags: { $in: [new RegExp(query, 'i')] } }
    ];
  }
  
  // Filtres
  if (filters.status) {
    searchQuery.status = filters.status;
  }
  
  if (filters.priority) {
    searchQuery.priority = filters.priority;
  }
  
  if (filters.assignedTo) {
    searchQuery.assignedTo = filters.assignedTo;
  }
  
  if (filters.createdBy) {
    searchQuery.createdBy = filters.createdBy;
  }
  
  if (filters.dueDateFrom) {
    searchQuery.dueDate = { $gte: new Date(filters.dueDateFrom) };
  }
  
  if (filters.dueDateTo) {
    if (searchQuery.dueDate) {
      searchQuery.dueDate.$lte = new Date(filters.dueDateTo);
    } else {
      searchQuery.dueDate = { $lte: new Date(filters.dueDateTo) };
    }
  }
  
  // Pagination
  const skip = (page - 1) * limit;
  
  return this.find(searchQuery)
    .populate('assignedTo', 'firstName lastName email')
    .populate('createdBy', 'username email')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
};

// Méthode statique pour compter le total des résultats
taskSchema.statics.countTasks = function(query, filters = {}) {
  const searchQuery = {};
  
  if (query) {
    searchQuery.$or = [
      { title: { $regex: query, $options: 'i' } },
      { description: { $regex: query, $options: 'i' } },
      { tags: { $in: [new RegExp(query, 'i')] } }
    ];
  }
  
  if (filters.status) searchQuery.status = filters.status;
  if (filters.priority) searchQuery.priority = filters.priority;
  if (filters.assignedTo) searchQuery.assignedTo = filters.assignedTo;
  if (filters.createdBy) searchQuery.createdBy = filters.createdBy;
  
  return this.countDocuments(searchQuery);
};

module.exports = mongoose.model('Task', taskSchema);
