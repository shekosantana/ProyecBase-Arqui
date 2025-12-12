require('dotenv').config();
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const mongoose = require('mongoose');
const path = require('path');
const User = require('./UserModel');

// Configuración de gRPC
const PROTO_PATH = path.join(__dirname, 'minecraft.proto');
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
});
const minecraftProto = grpc.loadPackageDefinition(packageDefinition).minecraft;

// --- Conexión a MongoDB ---
const DB_URI = process.env.DB_URI || 'mongodb://mongo_db:27017/minecraft_server';

mongoose.connect(DB_URI)
  .then(() => console.log('✅ (gRPC) Conectado a MongoDB'))
  .catch(err => console.error('❌ Error de conexión a MongoDB:', err));

// --- Implementación del CRUD ---

// 1. Crear Usuario (Create)
const createUser = async (call, callback) => {
    try {
        const userData = call.request;
        const newUser = new User(userData);
        const savedUser = await newUser.save();
        
        // Convertimos el documento de Mongoose a objeto plano para gRPC
        const userObj = savedUser.toObject();
        userObj.id = savedUser._id.toString(); // Importante: convertir _id a string
        userObj.registroFecha = savedUser.registroFecha.toISOString(); // Fechas a string
        
        callback(null, userObj);
    } catch (err) {
        callback({
            code: grpc.status.INTERNAL,
            details: "Error al crear usuario: " + err.message
        });
    }
};

// 2. Leer Usuario por ID (Read)
const getUser = async (call, callback) => {
    try {
        const user = await User.findById(call.request.id);
        if (!user) {
            return callback({
                code: grpc.status.NOT_FOUND,
                details: "Usuario no encontrado"
            });
        }
        
        const userObj = user.toObject();
        userObj.id = user._id.toString();
        userObj.registroFecha = user.registroFecha.toISOString();
        
        callback(null, userObj);
    } catch (err) {
        callback({
            code: grpc.status.INTERNAL,
            details: "Error al buscar usuario"
        });
    }
};

// 3. Eliminar Usuario (Delete)
const deleteUser = async (call, callback) => {
    try {
        const result = await User.findByIdAndDelete(call.request.id);
        if (!result) {
            return callback({
                code: grpc.status.NOT_FOUND,
                details: "Usuario no encontrado para eliminar"
            });
        }
        callback(null, { message: "Usuario eliminado correctamente" });
    } catch (err) {
        callback({
            code: grpc.status.INTERNAL,
            details: "Error al eliminar usuario"
        });
    }
};

// --- Iniciar Servidor ---
const server = new grpc.Server();
server.addService(minecraftProto.UserService.service, {
    CreateUser: createUser,
    GetUser: getUser,
    DeleteUser: deleteUser
});

const PORT = '0.0.0.0:50051'; // Puerto estándar gRPC
server.bindAsync(PORT, grpc.ServerCredentials.createInsecure(), () => {
    console.log(`🚀 Servidor gRPC corriendo en ${PORT}`);
    server.start();
});