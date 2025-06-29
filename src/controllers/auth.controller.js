// const jwt = require('../utils/jwt');
const { signToken } = require('../utils/jwt');
const User = require('../models/admin.model');

exports.signup = async (req, res) => {
  try {
    const { firstname, name, email, password } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email déjà utilisé' });

    const user = new User({ firstname, name, email, password });
    await user.save();

    console.log('--- Admin Signup: user.role =', user.role);

    // const token = jwt.sign({ id: user._id });
    const token = signToken({ 
      id: user._id, 
      role: user.role,
      firstname: user.firstname,
      name: user.name,
      email: user.email
    });

    console.log('--- Admin Signup: token payload =', require('jsonwebtoken').decode(token));

    res.status(201).json({ 
      user: { 
        id: user._id, 
        firstname, 
        name, 
        email, 
        role: user.role 
      }, 
      token 
    });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });

    const match = await user.comparePassword(password);
    if (!match) return res.status(401).json({ message: 'Mot de passe incorrect' });

    console.log('--- Admin Login: user.role =', user.role);

    // const token = jwt.sign({ id: user._id });
    const token = signToken({ 
      id: user._id, 
      role: user.role,
      firstname: user.firstname,
      name: user.name,
      email: user.email
    });

    console.log('--- Admin Login: token payload =', require('jsonwebtoken').decode(token));
    
    res.json({ 
      user: { 
        id: user._id, 
        firstname: user.firstname,
        name: user.name, 
        email: user.email,
        role: user.role
      }, 
      token 
    });
  } catch (err) {
    console.log("ERROR : ", err)
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};

// Récupérer le profil de l'utilisateur connecté
exports.getProfile = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    res.json({
      success: true,
      data: {
        id: user._id,
        firstname: user.firstname,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    console.error('Erreur récupération profil:', err);
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};

// Modifier le profil de l'utilisateur connecté
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.userId;
    const { firstname, name, email } = req.body;

    // Validation des données
    if (!firstname || !name || !email) {
      return res.status(400).json({ message: 'Tous les champs sont requis' });
    }

    // Vérifier si l'email existe déjà (sauf pour l'utilisateur actuel)
    const existingUser = await User.findOne({ email, _id: { $ne: userId } });
    if (existingUser) {
      return res.status(400).json({ message: 'Cet email est déjà utilisé' });
    }

    // Mettre à jour le profil
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { firstname, name, email },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    res.json({
      success: true,
      message: 'Profil mis à jour avec succès',
      data: {
        id: updatedUser._id,
        firstname: updatedUser.firstname,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role
      }
    });
  } catch (err) {
    console.error('Erreur mise à jour profil:', err);
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};

// Changer le mot de passe
exports.changePassword = async (req, res) => {
  try {
    const userId = req.userId;
    const { oldPassword, newPassword } = req.body;

    // Validation des données
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: 'Ancien et nouveau mot de passe requis' });
    }

    // Récupérer l'utilisateur avec le mot de passe
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    // Vérifier l'ancien mot de passe
    const isOldPasswordValid = await user.comparePassword(oldPassword);
    if (!isOldPasswordValid) {
      return res.status(401).json({ message: 'Mot de passe incorrect' });
    }

    // Mettre à jour le mot de passe
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Mot de passe changé avec succès'
    });
  } catch (err) {
    console.error('Erreur changement mot de passe:', err);
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};