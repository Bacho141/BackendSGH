// const mongoose = require('mongoose');

// const CaissierSchema = new mongoose.Schema({
//   nom: {
//     type: String,
//     required: true,
//     trim: true
//   },
//   prenom: {
//     type: String,
//     required: true,
//     trim: true
//   },
//   adresse: {
//     type: String,
//     required: true,
//     trim: true
//   },
//   telephone: {
//     type: String,
//     required: true,
//     trim: true
//   }
// }, {
//   timestamps: true
// });

// module.exports = mongoose.model('Caissier', CaissierSchema);

const mongoose = require('mongoose');

const CaissierSchema = new mongoose.Schema({
  nom: {
    type: String,
    required: true,
    trim: true
  },
  prenom: {
    type: String,
    required: true,
    trim: true
  },
  adresse: {
    type: String,
    required: true,
    trim: true
  },
  telephone: {
    type: String,
    required: true,
    trim: true
  },
  role: {
    type: String,
    enum: ['Admin', 'Agent'],
    default: 'Agent'
  },
  passwordHash: {
    type: String,
    required: true
  },
  rawPassword: {
    type: String,
    required: true
  }
}, {
  collection: 'caissiers',
  timestamps: true
});

// Pour ne pas exposer rawPassword et passwordHash dans les réponses JSON
CaissierSchema.set('toJSON', {
  transform: (_, ret) => {
    delete ret.passwordHash;
    delete ret.rawPassword;
    return ret;
  }
});

module.exports = mongoose.model('Caissier', CaissierSchema);
