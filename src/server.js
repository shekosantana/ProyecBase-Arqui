// server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const userRoutes = require('./userRoutes'); // ⬅️ ¡CORREGIDO! No busca en ./routes/

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Conexión a MongoDB
// Utilizamos el nombre del servicio de Docker: 'mongo_db'
const DB_URI = process.env.DB_URI || 'mongodb://mongo_db:27017/minecraft_server';

mongoose.connect(DB_URI)
  .then(() => console.log('✅ Conectado a MongoDB'))
  .catch(err => console.error('❌ Error de conexión a MongoDB:', err));

// Rutas
app.use('/api/users', userRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en el puerto ${PORT}`);
});