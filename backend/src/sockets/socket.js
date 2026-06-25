const jwt = require("jsonwebtoken");

// Requerimiento 8: WebSockets para notificaciones en tiempo real
function setupSocket(io) {
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(); // permite conexiones anónimas (ej. guests viendo el lobby)

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = decoded;
    } catch (err) {
      // token inválido: igual deja conectar como invitado, simplemente sin "room" de usuario
    }
    next();
  });

  io.on("connection", (socket) => {
    if (socket.user?.id) {
      // Cada usuario tiene su propia "room" para recibir notificaciones dirigidas
      socket.join(`user:${socket.user.id}`);
      console.log(`🔌 Usuario conectado: ${socket.user.username} (${socket.id})`);
    } else {
      console.log(`🔌 Invitado conectado (${socket.id})`);
    }

    // Ejemplo: notificación de solicitud de amistad
    socket.on("friend:request", ({ toUserId, fromUsername }) => {
      io.to(`user:${toUserId}`).emit("notification", {
        type: "friend_request",
        message: `${fromUsername} te envió una solicitud de amistad.`,
      });
    });

    socket.on("disconnect", () => {
      console.log(`❌ Desconectado: ${socket.id}`);
    });
  });
}

module.exports = setupSocket;
