const jwt = require('jsonwebtoken');
const config = require('../config/config');

/**
 * Génère un token JWT pour un utilisateur
 * @param {Object} user - L'objet utilisateur
 * @returns {string} Le token JWT
 */
const generateToken = (user) => {
  const payload = {
    id: user._id,
    username: user.username,
    email: user.email,
    role: user.role
  };

  return jwt.sign(payload, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn
  });
};

/**
 * Vérifie et décode un token JWT
 * @param {string} token - Le token JWT à vérifier
 * @returns {Object} Les données décodées du token
 */
const verifyToken = (token) => {
  try {
    return jwt.verify(token, config.jwtSecret);
  } catch (error) {
    throw new Error('Token invalide ou expiré');
  }
};

/**
 * Extrait le token du header Authorization
 * @param {string} authHeader - Le header Authorization
 * @returns {string|null} Le token extrait ou null
 */
const extractTokenFromHeader = (authHeader) => {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7); // Enlève "Bearer "
};

/**
 * Vérifie si un token est expiré
 * @param {string} token - Le token JWT
 * @returns {boolean} True si expiré, false sinon
 */
const isTokenExpired = (token) => {
  try {
    const decoded = jwt.decode(token);
    if (!decoded || !decoded.exp) return true;
    
    const currentTime = Math.floor(Date.now() / 1000);
    return decoded.exp < currentTime;
  } catch (error) {
    return true;
  }
};

/**
 * Rafraîchit un token (créer un nouveau avec les mêmes données)
 * @param {string} token - L'ancien token
 * @returns {string|null} Le nouveau token ou null si invalide
 */
const refreshToken = (token) => {
  try {
    const decoded = verifyToken(token);
    return generateToken(decoded);
  } catch (error) {
    return null;
  }
};

module.exports = {
  generateToken,
  verifyToken,
  extractTokenFromHeader,
  isTokenExpired,
  refreshToken
};
