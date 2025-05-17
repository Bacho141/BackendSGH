const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  // Note : Mongo gère automatiquement _id, on mappera id <→ _id côté client si besoin
  name:          { type: String, required: true },
  description:   { type: String, default: '' },
  category:      { type: String, default: '' },
  price:         { type: String, required: true },  // stocké en string pour correspondre au front
  sellingPrice:  { type: String, default: '' },
  stockAmount:   { type: Number, default: 0 },
  url:           { type: String, default: '' },
  image:         { type: String, default: '' },
  updatedAt:     { type: Date,   default: Date.now }
}, { timestamps: true });

// Pour renvoyer "id" au lieu de "_id" et supprimer __v
ProductSchema.method('toJSON', function() {
  const { __v, _id, ...object } = this.toObject();
  object.id = _id.toString();
  return object;
});

module.exports = mongoose.model('Product', ProductSchema);
