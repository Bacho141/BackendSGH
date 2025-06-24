// const jwt = require('jsonwebtoken');
// const { jwtSecret, jwtExpiresIn } = require('../config/config');

// exports.sign = payload => jwt.sign(payload, jwtSecret, { expiresIn: jwtExpiresIn });

// exports.verify = token => jwt.verify(token, jwtSecret);

// server/src/utils/jwt.js
const jwt = require('jsonwebtoken');
const { jwtSecret, jwtExpiresIn } = require('../config/config');

/**
 * Génère un JWT avec id et role dans le payload
 * @param {{ id: ObjectId|string, role: string }} payload 
 */
exports.signToken = (payload) => {
  return jwt.sign(
    { id: payload.id, role: payload.role },
    jwtSecret,
    { expiresIn: jwtExpiresIn }
  );
};
