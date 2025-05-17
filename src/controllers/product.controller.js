const Product = require('../models/product.model');

/**
 * GET /api/products
 * Retourne la liste de tous les produits.
 * Si query ?since=ISODate, ne renvoie que ceux modifiés après cette date (pour le sync).
 */
// exports.getAll = async (req, res) => {
//   try {
//     const { since } = req.query;
//     const filter = since
//       ? { updatedAt: { $gt: new Date(since) } }
//       : {};
//     const products = await Product.find(filter).sort({ name: 1 });
//     res.json({ products });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

// server/src/controllers/product.controller.js

// exports.getAll = async (req, res) => {
//     try {
//       const { since } = req.query;
//       const filter = since
//         ? { updatedAt: { $gt: new Date(since) } }
//         : {};
  
//       // 1) Récupère les produits
//       const products = await Product.find(filter).sort({ name: 1 });
  
//       // 2) Formate la réponse selon ApiHandler
//       res.json({
//         count: products.length,
//         next: null,        // ou ton URL pour la page suivante si pagination
//         previous: null,    // idem pour la page précédente
//         results: products, // array of product docs
//       });
//     } catch (err) {
//       res.status(500).json({ message: err.message });
//     }
//   };
  

/**
 * POST /api/products
 * Crée ou met à jour un produit (upsert).
 * Si l'objet reçu contient un _id existant, on update ; sinon on insert.
 */
// exports.upsert = async (req, res) => {
//   try {
//     const p = req.body;
//     p.updatedAt = new Date();
//     const prod = p._id
//         ? await Product.findByIdAndUpdate(p._id, p, { new: true })
//         : await Product.create(p);

//     res.json({ success: true, data: prod });
//   } catch (err) {
//     res.status(400).json({ success: false, message: err.message });
//   }
// };



/**
 * GET /api/products
 * Récupère tous les produits, ou si ?since=ISODate renvoie ceux mis à jour depuis cette date
 */
exports.getAll = async (req, res) => {
  try {
    const { since } = req.query;
    const filter = since
      ? { updatedAt: { $gt: new Date(since) } }
      : {};
    const products = await Product.find(filter).sort({ name: 1 });
    res.json({ results: products });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * POST /api/products
 * Crée un nouveau produit ou met à jour l’existant si `id` (=_id) est fourni
 */
exports.upsert = async (req, res) => {
  try {
    const body = req.body;
    body.updatedAt = new Date();

    let product;
    if (body.id) {
      // Mise à jour
      product = await Product.findByIdAndUpdate(
        body.id,
        {
          name:         body.name,
          description:  body.description,
          category:     body.category,
          price:        body.price,
          sellingPrice: body.sellingPrice,
          stockAmount:  body.stockAmount,
          url:          body.url,
          image:        body.image,
          updatedAt:    body.updatedAt,
        },
        { new: true }
      );
    } else {
      // Création
      product = new Product({
        name:         body.name,
        description:  body.description,
        category:     body.category,
        price:        body.price,
        sellingPrice: body.sellingPrice,
        stockAmount:  body.stockAmount,
        url:          body.url,
        image:        body.image,
        updatedAt:    body.updatedAt,
      });
      await product.save();
    }

    res.json({ success: true, data: product });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};
