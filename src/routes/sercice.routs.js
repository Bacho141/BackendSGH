const express = require('express');
const router = express.Router();
// const authMw = require('../middleware/auth.middleware');
const { createService, getAllServices, getServiceById, updateService, bulkCreateServices, getByCategory, search } = require('../controllers/service.controller');

// Toutes les routes produits sont protégées
// router.use(authMw);

// GET
router.get('/', getAllServices);
router.get('/:id', getServiceById);

// POST
router.post('/', createService);

//UPDATE
router.put('/update/:id', updateService)


// route bulk
router.post('/bulk', bulkCreateServices);

// Filtrer par catégorie
router.get('/category/:cat', getByCategory);

// Recherche par nom
router.get('/search/:term', search);

module.exports = router;
