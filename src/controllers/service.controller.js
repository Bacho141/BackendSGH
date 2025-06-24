const Service = require('../models/service.model');

exports.createService = async (req, res) => {
  try {
    const { category, label, tarif, unite = 'Fcfa', icon } = req.body;

    // Vérification minimale des champs obligatoires
    if (category == null || !label || tarif == null) {
      return res.status(400).json({ message: 'Category, label et tarif sont requis.' });
    }

    // Création et sauvegarde du document
    const service = new Service({ category, label, tarif, icon });
    const saved = await service.save();

    return res.status(201).json(saved);
  } catch (err) {
    console.error('Erreur création service :', err);
    return res.status(500).json({ message: 'Impossible de créer le service.' });
  }
};


// Récupérer tous les services
exports.getAllServices = async (req, res) => {
  try {
    const services = await Service.find().sort({ numero: 1 });
    return res.status(200).json({ data: services });
  } catch (err) {
    console.error('Erreur récupération services :', err);
    return res.status(500).json({ message: 'Impossible de récupérer les services.' });
  }
};

// Récupérer un service par son ID
exports.getServiceById = async (req, res) => {
  try {
    const { id } = req.params;
    const service = await Service.findById(id);
    if (!service) {
      return res.status(404).json({ message: 'Service non trouvé.' });
    }
    return res.status(200).json(service);
  } catch (err) {
    console.error('Erreur récupération service :', err);
    return res.status(500).json({ message: 'Impossible de récupérer le service.' });
  }
};

// Mettre à jour un service existant
exports.updateService = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const options = { new: true, runValidators: true };
    const updated = await Service.findByIdAndUpdate(id, updates, options);
    if (!updated) {
      return res.status(404).json({ message: 'Service à mettre à jour non trouvé.' });
    }
    return res.status(200).json(updated);
  } catch (err) {
    console.error('Erreur mise à jour service :', err);
    return res.status(500).json({ message: 'Impossible de mettre à jour le service.' });
  }
};


exports.bulkCreateServices = async (req, res) => {
  try {
    // votre fichier JSON arrive sous la clé "resuts"
    const raw = req.body.resuts;
    if (!Array.isArray(raw) || raw.length === 0) {
      return res.status(400).json({ message: 'Aucun service à insérer.' });
    }

    // on prépare les objets pour Mongoose
    const docs = raw.map(item => ({
      label:  item.label,
      tarif:  String(item.tarif),              // s’assure que c’est une string
      icon:   item.icon,
      category: item.category.toLowerCase()    // "Type_prestation" → "type_prestation"
    }));

    // insertion bulk
    const inserted = await Service.insertMany(docs, { ordered: false });
    return res.status(201).json({
      insertedCount: inserted.length,
      services: inserted
    });
  } catch (err) {
    console.error('bulkCreateServices error', err);
    return res.status(500).json({ message: 'Erreur lors de l’insertion en bulk.' });
  }
};



/**
 * GET /api/service/category/:cat
 * Renvoie tous les services dont category == :cat
 */
exports.getByCategory = async (req, res) => {
  try {
    const { cat } = req.params;
    // Vérifier la validité de la catégorie
    if (!Service.schema.path('category').enumValues.includes(cat)) {
      return res.status(400).json({ success: false, message: 'Catégorie invalide.' });
    }
    const services = await Service.find({ category: cat });
    res.json({ success: true, data: services });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * GET /api/service/search/:term
 * Renvoie tous les services dont le label contient :term (insensible à la casse)
 */
exports.search = async (req, res) => {
  try {
    const { term } = req.params;
    // Construction d'une regex "contains", insensible à la casse
    const regex = new RegExp(term, 'i');
    const services = await Service.find({ label: regex });
    res.json({ success: true, data: services });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

