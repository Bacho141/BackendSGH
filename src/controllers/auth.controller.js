// const jwt = require('../utils/jwt');
const { signToken } = require('../utils/jwt');
const User = require('../models/admin.model');

exports.signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email déjà utilisé' });

    const user = new User({ name, email, password });
    await user.save();

    console.log('--- Admin Signup: user.role =', user.role);

    // const token = jwt.sign({ id: user._id });
    const token = signToken({ id: user._id, role: user.role });

    console.log('--- Admin Signup: token payload =', require('jsonwebtoken').decode(token));

    res.status(201).json({ user: { id: user._id, name, email, role }, token });
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
    const token = signToken({ id: user._id, role: user.role });

    console.log('--- Admin Login: token payload =', require('jsonwebtoken').decode(token));
    
    res.json({ user: { id: user._id, name: user.name, email }, token });
  } catch (err) {
    console.log("ERROR : ", err)
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};