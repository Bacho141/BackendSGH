const express = require('express');
const router  = express.Router();
const authMw  = require('../middleware/auth.middleware');
const ctrl    = require('../controllers/caissier.controller');

// Login agent (pas de token nécessaire)
 // À déplacer **avant** router.use(authMw) si tu veux qu'il soit public
 // NOTE : si tu veux que /login soit public, déplace ces 2 lignes ci-dessous
// juste **au-dessus** de `router.use(authMw);`
router.post('/login', ctrl.login);

// Toutes ces routes sont protégées
router.use(authMw);

// POST   /api/caissiers        → create()
router.post('/', ctrl.create);

// GET    /api/caissiers        → getAll()
router.get('/', ctrl.getAllAgents);

// GET    /api/caissiers/:id    → getById()
router.get('/:id', ctrl.getById);

// PUT    /api/caissiers/:id    → update()
router.put('/:id', ctrl.update);

// DELETE /api/caissiers/:id    → remove()
router.delete('/:id', ctrl.remove);

// Reveal mot de passe (Admin uniquement)
router.post('/:id/reveal', ctrl.reveal);

// Réinitialiser mot de passe (Admin uniquement)
router.post('/:id/reset',  ctrl.reset);

module.exports = router;
