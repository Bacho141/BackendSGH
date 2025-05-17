const { verify } = require('../utils/jwt');

module.exports = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ message: 'Token manquant' });

  const [, token] = header.split(' ');
  try {
    const decoded = verify(token);
    req.userId = decoded.id;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token invalide' });
  }
};