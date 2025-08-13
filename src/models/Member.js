const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'Le prénom est requis'],
    trim: true,
    minlength: [2, 'Le prénom doit contenir au moins 2 caractères'],
    maxlength: [50, 'Le prénom ne peut pas dépasser 50 caractères']
  },
  lastName: {
    type: String,
    required: [true, 'Le nom de famille est requis'],
    trim: true,
    minlength: [2, 'Le nom de famille doit contenir au moins 2 caractères'],
    maxlength: [50, 'Le nom de famille ne peut pas dépasser 50 caractères']
  },
  email: {
    type: String,
    required: [true, 'L\'email est requis'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Format d\'email invalide']
  },
  phone: {
    type: String,
    trim: true,
    match: [/^[\+]?[1-9][\d]{0,15}$/, 'Format de téléphone invalide']
  },
  position: {
    type: String,
    required: [true, 'Le poste est requis'],
    trim: true,
    maxlength: [100, 'Le poste ne peut pas dépasser 100 caractères']
  },
  department: {
    type: String,
    trim: true,
    maxlength: [100, 'Le département ne peut pas dépasser 100 caractères']
  },
  skills: [{
    type: String,
    trim: true,
    maxlength: [50, 'Une compétence ne peut pas dépasser 50 caractères']
  }],
  avatar: {
    type: String,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  hireDate: {
    type: Date,
    default: Date.now
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index pour améliorer les performances
memberSchema.index({ email: 1 });
memberSchema.index({ firstName: 1, lastName: 1 });
memberSchema.index({ department: 1 });
memberSchema.index({ isActive: 1 });

// Virtual pour le nom complet
memberSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Méthode pour obtenir les informations publiques du membre
memberSchema.methods.toPublicJSON = function() {
  const member = this.toObject();
  delete member.createdBy;
  return member;
};

// Méthode statique pour rechercher des membres
memberSchema.statics.searchMembers = function(query, filters = {}) {
  const searchQuery = {};
  
  if (query) {
    searchQuery.$or = [
      { firstName: { $regex: query, $options: 'i' } },
      { lastName: { $regex: query, $options: 'i' } },
      { email: { $regex: query, $options: 'i' } },
      { position: { $regex: query, $options: 'i' } },
      { department: { $regex: query, $options: 'i' } }
    ];
  }
  
  if (filters.department) {
    searchQuery.department = filters.department;
  }
  
  if (filters.isActive !== undefined) {
    searchQuery.isActive = filters.isActive;
  }
  
  return this.find(searchQuery).sort({ createdAt: -1 });
};

module.exports = mongoose.model('Member', memberSchema);
