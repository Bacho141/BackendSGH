const mongoose = require('mongoose');

const ServiceSchema = new mongoose.Schema({
  category: {
    type: String,
    required: true,
    enum: ['type_prestation', 'examens_de_laboratoire', 'actes_medico_chirurgicaux']
  },
  label: {
    type: String,
    required: true
  },
  tarif: {
    type: String,
    required: true
  },
  icon: {
    type: String
  }
}, {
  collection: 'services',
  timestamps: true
});

module.exports = mongoose.model('Service', ServiceSchema);
