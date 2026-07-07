const jwt = require("jsonwebtoken");

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

    //  Un jugador (P1) envía una invitación a un amigo
    socket.on("lobby:invite:send", ({ targetUserId }) => {
      if (!socket.user) return; // Solo usuarios logueados pueden invitar

      // Emitimos a la room del amigo usando tu prefijo "user:"
      io.to(`user:${targetUserId}`).emit("lobby:invite:receive", {
        senderId: socket.user.id,
        senderUsername: socket.user.username // Sacado de forma segura del JWT
      });
    });

    // El amigo (P2) responde a la invitación (Aceptar/Rechazar)
    socket.on("lobby:invite:respond", ({ senderId, accepted }) => {
      if (!socket.user) return;

      // Le devolvemos la respuesta al creador del lobby (P1)
      io.to(`user:${senderId}`).emit("lobby:invite:response", {
        targetId: socket.user.id,
        targetUsername: socket.user.username,
        accepted: accepted
      });
    });

    socket.on("disconnect", () => {
      console.log(`❌ Desconectado: ${socket.id}`);
    });
  });
}

module.exports = setupSocket;