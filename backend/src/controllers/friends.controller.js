const prisma = require("../lib/prisma");

// Buscar usuarios (Excluyendo al usuario actual)
async function searchUsers(req, res) {
  try {
    const { q } = req.query;
    if (!q) return res.json([]);

    const users = await prisma.user.findMany({
      where: {
        username: {
          contains: q,
          mode: 'insensitive', // Búsqueda sin importar mayúsculas/minúsculas
        },
        id: {
          not: req.user.id,
        },
      },
      select: { id: true, username: true },
      take: 5, // Límite de resultados para el frontend
    });

    return res.json(users);
  } catch (error) {
    console.error("Error en searchUsers:", error);
    return res.status(500).json({ error: "Error al buscar usuarios." });
  }
}

// Enviar solicitud de amistad
async function sendRequest(req, res) {
  try {
    const { targetUserId } = req.body;

    if (targetUserId === req.user.id) {
      return res.status(400).json({ error: "No puedes enviarte una solicitud a ti mismo." });
    }

    // Verificar si ya existe una relación (en cualquier dirección)
    const existing = await prisma.friendship.findFirst({
      where: {
        OR: [
          { userId: req.user.id, friendId: targetUserId },
          { userId: targetUserId, friendId: req.user.id },
        ],
      },
    });

    if (existing) {
      return res.status(400).json({ error: "Ya existe una solicitud o amistad con este usuario." });
    }

    // Crear la solicitud en estado PENDING (por defecto en schema)
    const friendship = await prisma.friendship.create({
      data: {
        userId: req.user.id,
        friendId: targetUserId,
        status: "PENDING",
      },
    });

    return res.status(201).json({ message: "Solicitud enviada.", friendship });
  } catch (error) {
    console.error("Error en sendRequest:", error);
    return res.status(500).json({ error: "Error al enviar la solicitud." });
  }
}

// Obtener solicitudes PENDIENTES recibidas
async function getPendingRequests(req, res) {
  try {
    const requests = await prisma.friendship.findMany({
      where: {
        friendId: req.user.id, // El receptor es el usuario actual
        status: "PENDING",
      },
      include: {
        user: { // Traemos los datos del usuario que ENVIÓ la solicitud
          select: { id: true, username: true }
        }
      },
    });

    return res.json(requests);
  } catch (error) {
    console.error("Error en getPendingRequests:", error);
    return res.status(500).json({ error: "Error al obtener solicitudes." });
  }
}

// Responder a una solicitud (Aceptar / Rechazar)
async function respondRequest(req, res) {
  try {
    const { friendshipId } = req.params;
    const { status } = req.body; // Debe ser 'ACCEPTED' o 'REJECTED'

    if (!['ACCEPTED', 'REJECTED'].includes(status)) {
      return res.status(400).json({ error: "Estado no válido." });
    }

    const friendship = await prisma.friendship.findUnique({
      where: { id: friendshipId },
    });

    // Validar que la solicitud existe y que el usuario actual es el receptor
    if (!friendship || friendship.friendId !== req.user.id) {
      return res.status(404).json({ error: "Solicitud no encontrada o no autorizada." });
    }

    // Si se rechaza, es mejor eliminar el registro para que puedan volver a intentarlo en el futuro
    if (status === 'REJECTED') {
      await prisma.friendship.delete({
        where: { id: friendshipId },
      });
      return res.json({ message: "Solicitud rechazada y eliminada." });
    }

    const updatedFriendship = await prisma.friendship.update({
      where: { id: friendshipId },
      data: { status: "ACCEPTED" },
    });

    return res.json({ message: "Solicitud aceptada.", updatedFriendship });
  } catch (error) {
    console.error("Error en respondRequest:", error);
    return res.status(500).json({ error: "Error al responder la solicitud." });
  }
}

// Obtener lista de amigos (ACCEPTED)
async function getFriendsList(req, res) {
  try {
    // Como una amistad puede ser iniciada por ti o por el otro, buscamos en ambas direcciones
    const friendships = await prisma.friendship.findMany({
      where: {
        status: "ACCEPTED",
        OR: [
          { userId: req.user.id },
          { friendId: req.user.id },
        ],
      },
      include: {
        user: { select: { id: true, username: true } },
        friend: { select: { id: true, username: true } },
      },
    });

    // Formatear la respuesta para que el frontend siempre vea la info del "otro" usuario en un campo `friend`
    const formattedFriends = friendships.map((f) => {
      if (f.userId === req.user.id) {
        return { id: f.id, friend: f.friend }; // Yo envié la solicitud
      } else {
        return { id: f.id, friend: f.user };   // El otro envió la solicitud
      }
    });

    return res.json(formattedFriends);
  } catch (error) {
    console.error("Error en getFriendsList:", error);
    return res.status(500).json({ error: "Error al obtener lista de amigos." });
  }
}

module.exports = {
  searchUsers,
  sendRequest,
  getPendingRequests,
  respondRequest,
  getFriendsList
};