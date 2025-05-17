const express = require('express');
const router = express.Router();
// const authMw = require('../middleware/auth.middleware');
const { createService, getAllServices, getServiceById, updateService, bulkCreateServices } = require('../controllers/service.controller');

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

module.exports = router;
