// src/models/receipt.model.js
const mongoose = require('mongoose');

// Schéma pour un patient (embedded document)
const PatientSchema = new mongoose.Schema({
  name:    { type: String, required: true },
  firstname: { type: String, required: true },
  phone:   { type: String},
  address: { type: String}
}, { _id: false });

// Schéma principal pour le reçu
const ReceiptSchema = new mongoose.Schema({
  receiptNumber: { type: String, required: true, unique: true },
  dateTime:      { type: Date,   required: true, default: Date.now },
  client:        { type: PatientSchema, required: true },
  produits: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },
    label:     { type: String, required: true },
    tarif:     { type: Number, required: true },
    quantity:  { type: Number, required: true },
    amount:    { type: Number, required: true }
  }],
  total:         { type: Number, required: true },
  totalInWords:  { type: String, required: true },
  paid:          { type: Number, required: true },
  due:           { type: Number, required: true },

  // Infos de la société (fixes)
  companyName: { type: String, required: true },
  nif:         { type: String, required: true },
  rccm:        { type: String, required: true },
  address:     { type: String, required: true },
  contact:     { type: String, required: true },

  nomCaissier: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Receipt', ReceiptSchema);


// src/controllers/receipt.controller.js
