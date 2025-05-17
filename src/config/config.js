module.exports = {
    jwtSecret: process.env.JWT_SECRET || 'changeme',
    jwtExpiresIn: '7d'
  };