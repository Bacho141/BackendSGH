// const { verify } = require('../utils/jwt');

// module.exports = (req, res, next) => {
//   const header = req.headers.authorization;
//   if (!header) return res.status(401).json({ message: 'Token manquant' });

//   const [, token] = header.split(' ');
//   try {
//     const decoded = verify(token);
//     req.userId = decoded.id;
//     next();
//   } catch (err) {
//     res.status(401).json({ message: 'Token invalide' });
//   }
// };

const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config/config');

module.exports = (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token manquant' });
  }

  const token = auth.split(' ')[1];
  try {
    const payload = jwt.verify(token, jwtSecret);
    console.log('🔍 Auth Middleware - JWT payload complet:', payload);

    // Ici on doit injecter :
    req.userId   = payload.id;     // ← ID MongoDB
    console.log('🔍 Auth Middleware - Injected userId:', req.userId);
    
    req.userRole = payload.role;   // ← 'Admin' ou 'Agent'
    console.log('🔍 Auth Middleware - Injected userRole:', req.userRole);
    
    // Ajouter le nomComplet si disponible
    if (payload.nomComplet) {
      req.userNomComplet = payload.nomComplet;
      console.log('🔍 Auth Middleware - Injected userNomComplet:', req.userNomComplet);
    } else {
      console.log('⚠️ Auth Middleware - nomComplet non trouvé dans le payload');
    }
    
    return next();
  } catch (err) {
    console.error('❌ Auth Middleware - Erreur de vérification token:', err);
    return res.status(401).json({ message: 'Token invalide' });
  }
};
