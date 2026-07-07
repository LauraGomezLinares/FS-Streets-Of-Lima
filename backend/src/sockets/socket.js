const jwt = require("jsonwebtoken");

function setupSocket(io) {
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next();
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = decoded;
    } catch (err) {}
    next();
  });

  io.on("connection", (socket) => {
    if (socket.user?.id) {
      socket.join(`user:${socket.user.id}`);
      socket.join(`lobby:${socket.user.id}`);
      socket.currentLobby = socket.user.id; // Rastreamos en qué lobby está metido
      console.log(`Usuario conectado: ${socket.user.username}`);
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
      if (!socket.user) return;
      io.to(`user:${targetUserId}`).emit("lobby:invite:receive", {
        senderId: socket.user.id,
        senderUsername: socket.user.username
      });
    });

    socket.on("lobby:invite:respond", ({ senderId, accepted }) => {
      if (!socket.user) return;

      if (accepted) {
        // 🔥 NUEVO: Si acepta, lo sacamos de su propio lobby y lo metemos al del líder (P1)
        if (socket.currentLobby) socket.leave(`lobby:${socket.currentLobby}`);
        socket.join(`lobby:${senderId}`);
        socket.currentLobby = senderId;
      }

      io.to(`user:${senderId}`).emit("lobby:invite:response", {
        targetId: socket.user.id,
        targetUsername: socket.user.username,
        accepted: accepted
      });
    });

    socket.on("game:move", (data) => {
        // Le mandamos el movimiento a todos en la sala EXCEPTO al que lo envió (broadcast)
        socket.to(`lobby:${socket.currentLobby}`).emit("game:player_moved", data);
    });

    socket.on("disconnect", () => {
      if (socket.user && socket.currentLobby) {
        // Le avisamos a todos los que sigan en esa sala que este usuario se voló
        io.to(`lobby:${socket.currentLobby}`).emit("lobby:member_left", {
          userId: socket.user.id,
          username: socket.user.username,
          isHost: socket.user.id === socket.currentLobby // ¿El que se fue era el líder?
        });
      }
      console.log(`❌ Desconectado: ${socket.id}`);
    });
  });
}

module.exports = setupSocket;