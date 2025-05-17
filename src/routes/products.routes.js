const express = require('express');
const router = express.Router();
// const authMw = require('../middleware/auth.middleware');
const { getAll, upsert } = require('../controllers/product.controller');

// Toutes les routes produits sont protégées
// router.use(authMw);

// Récupérer tous les produits (optionnel ?since pour sync)
router.get('/', getAll);

// Créer ou mettre à jour un produit
router.post('/', upsert);

module.exports = router;
