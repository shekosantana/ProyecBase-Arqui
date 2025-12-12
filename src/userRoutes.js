// userRoutes.js
const express = require('express');
const router = express.Router();
const User = require('./UserModel'); // ⬅️ ¡CORREGIDO! Usa UserModel.js

// === A G R E G A R (C - Create) ===
router.post('/', async (req, res) => {
  try {
    // Validar datos mínimos
    if (!req.body.username || !req.body.email || !req.body.passwordHash) {
        return res.status(400).json({ message: 'Faltan campos requeridos: username, email y passwordHash.' });
    }
    const newUser = new User(req.body);
    const savedUser = await newUser.save();
    res.status(201).json(savedUser);
  } catch (err) {
    // Manejar error de validación o duplicidad
    res.status(400).json({ message: err.message });
  }
});

// === L E E R (R - Read) - Todos los usuarios ===
router.get('/', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// === L E E R (R - Read) - Un usuario por ID ===
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Error al buscar el usuario.' });
  }
});

// === E L I M I N A R (D - Delete) ===
router.delete('/:id', async (req, res) => {
  try {
    const result = await User.findByIdAndDelete(req.params.id);
    if (!result) return res.status(404).json({ message: 'Usuario no encontrado' });
    res.json({ message: 'Usuario eliminado correctamente' });
  } catch (err) {
    res.status(500).json({ message: 'Error al eliminar el usuario.' });
  }
});

module.exports = router;