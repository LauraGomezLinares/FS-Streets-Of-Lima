// Requerimiento 7: el rol se valida en el backend, nunca confiando en el frontend
function adminMiddleware(req, res, next) {
  if (!req.user || req.user.role !== "ADMIN") {
    return res.status(403).json({ error: "Acceso denegado: se requiere rol de administrador." });
  }
  next();
}

module.exports = adminMiddleware;
