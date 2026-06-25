const { PrismaClient } = require("@prisma/client");

// Patrón singleton para no abrir múltiples conexiones en desarrollo
const prisma = new PrismaClient();

module.exports = prisma;
