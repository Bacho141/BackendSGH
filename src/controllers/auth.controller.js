const jwt = require('../utils/jwt');
const User = require('../models/user.model');

exports.signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email déjà utilisé' });

    const user = new User({ name, email, password });
    await user.save();

    const token = jwt.sign({ id: user._id });
    res.status(201).json({ user: { id: user._id, name, email }, token });
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

    const token = jwt.sign({ id: user._id });
    res.json({ user: { id: user._id, name: user.name, email }, token });
  } catch (err) {
    console.log("ERROR : ", err)
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};