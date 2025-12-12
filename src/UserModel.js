// UserModel.js (Crea este archivo, o renombra User.js a UserModel.js)
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  rol: { type: String, default: 'jugador' },
  minecraftUUID: { type: String, unique: true },
  serverStats: {
    horasJugadas: { type: Number, default: 0 },
    kills: { type: Number, default: 0 },
    deaths: { type: Number, default: 0 }
  },
  registroFecha: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);