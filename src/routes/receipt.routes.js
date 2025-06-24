// src/routes/receipt.routes.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth.middleware');
const {
  createReceipt,
  getAllReceipts,
  getReceiptsByDate,
  getReceiptById,
  updateReceipt,
  deleteReceipt
} = require('../controllers/receipt.controller');

// Create a new receipt
router.post('/', auth, createReceipt);
// Récupérer la liste (avec filtres query ?from=&to=)
router.get('/',      auth, getAllReceipts);
// Récupérer tous les reçus d'une date précise YYYY-MM-DD
router.get('/date/:date', auth, getReceiptsByDate);
// Retrieve a single receipt
router.get('/:id', auth, getReceiptById);
// Update a receipt
router.put('/:id', auth, updateReceipt);
// Delete a receipt
router.delete('/:id', auth, deleteReceipt);

module.exports = router;
