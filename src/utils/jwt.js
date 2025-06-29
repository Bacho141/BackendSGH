// const jwt = require('jsonwebtoken');
// const { jwtSecret, jwtExpiresIn } = require('../config/config');

// exports.sign = payload => jwt.sign(payload, jwtSecret, { expiresIn: jwtExpiresIn });

// exports.verify = token => jwt.verify(token, jwtSecret);

// server/src/utils/jwt.js
const jwt = require('jsonwebtoken');
const { jwtSecret, jwtExpiresIn } = require('../config/config');

/**
 * Génère un JWT avec le payload complet
 * @param {Object} payload - Le payload complet à inclure dans le token
 */
exports.signToken = (payload) => {
  return jwt.sign(
    payload,
    jwtSecret,
    { expiresIn: jwtExpiresIn }
  );
};
