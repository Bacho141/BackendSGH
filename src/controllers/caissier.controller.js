const Agent = require('../models/caissier.model');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
// const jwt = require('jsonwebtoken');
const { signToken } = require('../utils/jwt');
const Admin = require('../models/admin.model');

// Génère un mot de passe aléatoire de 8 caractères alphanumériques
function generatePassword() {
  return crypto.randomBytes(4).toString('hex'); // 8 hex = 8 caractères
}


/** Créer un caissier/agent */
// exports.create = async (req, res) => {
//   try {
//     const caissier = new Caissier(req.body);
//     await caissier.save();
//     res.status(201).json({ success: true, data: caissier });
//   } catch (err) {
//     res.status(400).json({ success: false, message: err.message });
//   }
// };

/** Créer un caissier/agent */
exports.create = async (req, res) => {
  try {
    // 1) Génération du mot de passe
    const raw = generatePassword();
    const hash = await bcrypt.hash(raw, 10);

    // 2) Construction du document
    const caissier = new Agent({
      ...req.body,
      passwordHash: hash,
      rawPassword: raw,
      role: 'Agent' // par défaut
    });

    await caissier.save();

    // 3) On renvoie le nouveau agent **+** le mot de passe brut
    return res.status(201).json({
      success: true,
      data: {
        ...caissier.toObject(),
        rawPassword: raw
      }
    });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
};

/** POST /api/caissiers/login */
exports.login = async (req, res) => {
  try {
    const { telephone, password } = req.body;
    const user = await Agent.findOne({ telephone });
    if (!user) {
      return res.status(401).json({ message: 'Téléphone inconnu' });
    }
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return res.status(401).json({ message: 'Mot de passe incorrect' });
    }
    // Génère un token avec payload id + role
    // const token = jwt.sign(
    //   { id: user._id, role: user.role },
    //   jwtSecret,
    //   { expiresIn: jwtExpiresIn }
    // );
    const role = user.role || 'Agent';

    console.log('--- Agent Login: user.role =', user.role);

    const token = signToken({ id: user._id, role });
    console.log('--- Agent Login: token payload =', require('jsonwebtoken').decode(token));
    
    return res.json({ success: true, data: { token } });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

/** POST /api/agent/:id/reveal */
exports.reveal = async (req, res) => {
  try {
    const adminId = req.userId;   // your JWT middleware must set req.userId
    console.log("AdminId: ",adminId)   
    const admin = await Admin.findById(adminId);
    if (!admin || admin.role !== 'Admin') {
      return res.status(403).json({ message: 'Accès refusé' });
    }
    // Vérification du mot de passe admin fourni
    const { adminPassword } = req.body;
    console.log("Password Admin: ",adminPassword) 
    const valid = await bcrypt.compare(adminPassword, admin.password);
    if (!valid) {
      return res.status(401).json({ message: 'Mot de passe admin incorrect' });
    }
    // Récupérer l'agent cible
    const agent = await Agent.findById(req.params.id);
    if (!agent) {
      return res.status(404).json({ message: 'Agent non trouvé' });
    }
    return res.json({ success: true, data: { rawPassword: agent.rawPassword } });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

/** POST /api/caissiers/:id/reset */
exports.reset = async (req, res) => {
  try {
    const adminId = req.userId;
    const admin = await Admin.findById(adminId);
    if (!admin || admin.role !== 'Admin') {
      return res.status(403).json({ message: 'Accès refusé' });
    }
    const { adminPassword } = req.body;
    const valid = await bcrypt.compare(adminPassword, admin.passwordHash);
    if (!valid) {
      return res.status(401).json({ message: 'Mot de passe admin incorrect' });
    }
    // Génération d'un nouveau mot de passe
    const raw = generatePassword();
    const hash = await bcrypt.hash(raw, 10);

    // Mise à jour
    const agent = await Agent.findByIdAndUpdate(
      req.params.id,
      { rawPassword: raw, passwordHash: hash },
      { new: true }
    );
    if (!agent) {
      return res.status(404).json({ message: 'Agent non trouvé' });
    }
    return res.json({ success: true, data: { rawPassword: raw } });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};


/** Lister tous les caissiers/agents */
exports.getAll = async (req, res) => {
  try {
    const list = await Agent.find().sort({ createdAt: -1 });
    res.json({ success: true, data: list });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getAllAgents = async (req, res) => {
  try {
    const agents = await Agent.find({}); // ne renvoie que nom+prenom
    return res.status(200).json({ data: agents });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Impossible de récupérer les agents.' });
  }
};

/** Récupérer un caissier par ID */
exports.getById = async (req, res) => {
  try {
    const caissier = await Agent.findById(req.params.id);
    if (!caissier) {
      return res.status(404).json({ success: false, message: 'Non trouvé' });
    }
    res.json({ success: true, data: caissier });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/** Mettre à jour un caissier */
exports.update = async (req, res) => {
  try {
    const caissier = await Agent.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!caissier) {
      return res.status(404).json({ success: false, message: 'Non trouvé' });
    }
    res.json({ success: true, data: caissier });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

/** Supprimer un caissier */
exports.remove = async (req, res) => {
  try {
    const caissier = await Agent.findByIdAndDelete(req.params.id);
    if (!caissier) {
      return res.status(404).json({ success: false, message: 'Non trouvé' });
    }
    res.json({ success: true, message: 'Supprimé avec succès' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
