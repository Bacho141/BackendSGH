const jwt = require('jsonwebtoken');
const { jwtSecret, jwtExpiresIn } = require('../config/config');

exports.sign = payload => jwt.sign(payload, jwtSecret, { expiresIn: jwtExpiresIn });

exports.verify = token => jwt.verify(token, jwtSecret);