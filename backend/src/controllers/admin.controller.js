const prisma = require("../lib/prisma");

// GET /admin/users
async function listUsers(req, res) {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      username: true,
      email: true,
      role: true,
      isBanned: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });
  return res.json(users);
}

// PATCH /admin/users/:id/ban
async function banUser(req, res) {
  const { id } = req.params;

  const target = await prisma.user.findUnique({ where: { id } });
  if (!target) return res.status(404).json({ error: "Usuario no encontrado." });
  if (target.role === "ADMIN") {
    return res.status(400).json({ error: "No puedes banear a otro administrador." });
  }

  const updated = await prisma.user.update({
    where: { id },
    data: { isBanned: !target.isBanned },
  });

  // Avisamos en tiempo real si el socket está disponible (Requerimiento 8)
  const io = req.app.get("io");
  if (io) {
    io.to(`user:${id}`).emit("account:banned", { isBanned: updated.isBanned });
  }

  return res.json({ id: updated.id, isBanned: updated.isBanned });
}

// GET /admin/stats  (Requerimiento 6: Dashboard)
async function getStats(req, res) {
  const [totalUsers, totalBanned, totalPurchases, totalAdmins] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { isBanned: true } }),
    prisma.purchase.count(),
    prisma.user.count({ where: { role: "ADMIN" } }),
  ]);

  const recentLogins = await prisma.loginLog.findMany({
    take: 10,
    orderBy: { createdAt: "desc" },
    include: { user: { select: { username: true, email: true } } },
  });

  return res.json({
    totalUsers,
    totalBanned,
    totalPurchases,
    totalAdmins,
    recentLogins,
  });
}

module.exports = { listUsers, banUser, getStats };
