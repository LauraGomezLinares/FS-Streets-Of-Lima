require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const authRoutes = require("./routes/auth.routes");
const adminRoutes = require("./routes/admin.routes");
const friendsRoutes = require('../routes/friends.routes');
const setupSocket = require("./sockets/socket");

const app = express();
const server = http.createServer(app);

// Configuración de WebSockets con soporte CORS dinámico (Requerimiento Tiempo Real)
const io = new Server(server, {
  cors: { 
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true
  },
});

// Guardar la instancia de socket.io en el app context para controladores
app.set("io", io);

// Inicializar la lógica de los sockets (Salas, eventos de juego, etc.)
setupSocket(io);

// ==========================================
// MIDDLEWARES GLOBALES
// ==========================================

// Configuración robusta de CORS para comunicación limpia con tu React Frontend
app.use(
  cors({ 
    origin: process.env.FRONTEND_URL || "http://localhost:3000", 
    credentials: true 
  })
);

// Middleware para parsear cuerpos JSON en las solicitudes HTTP
app.use(express.json());

// ==========================================
// RUTAS DE LA API
// ==========================================

// Ruta base de diagnóstico para healthcheck
app.get("/", (req, res) => {
  res.json({ status: "ok", service: "Streets of Lima API 🎮" });
});

app.use("/auth", authRoutes);
app.use("/admin", adminRoutes);
app.use('/api/friends', friendsRoutes);
// ==========================================
// CONTROL DE ERRORES Y RUTAS NO ENCONTRADAS
// ==========================================

// Manejador 404 para endpoints inexistentes
app.use((req, res) => {
  res.status(404).json({ error: "La ruta solicitada no existe." });
});

// Middleware global de manejo de errores (Evita que el servidor colapse)
app.use((err, req, res, next) => {
  console.error("❌ Error interno del servidor:", err.stack);
  res.status(500).json({ 
    error: "Ocurrió un error interno en el servidor. Por favor, inténtalo más tarde." 
  });
});

// ==========================================
// ARRANQUE DEL SERVIDOR HTTP + WS
// ==========================================
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`==================================================`);
  console.log(`🚀 Servidor e hilos de Sockets corriendo en el puerto: ${PORT}`);
  console.log(`==================================================`);
});