const jwt = require("jsonwebtoken");

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Acceso denegado. Token no proporcionado o formato inválido." });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; 
    next();
  } catch (err) {
    console.error("Error de autenticación JWT:", err.message);
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Tu sesión ha expirado. Por favor, inicia sesión nuevamente." });
    }
    return res.status(403).json({ error: "Token inválido o alterado. Acceso denegado." });
  }
}

function adminMiddleware(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: "No autenticado. Operación no permitida." });
  }

  if (req.user.role !== "ADMIN") {
    return res.status(403).json({ 
      error: "Acceso denegado. Se requieren privilegios de administrador." 
    });
  }

  next();
}

// 🚨 ESTA ES LA LÍNEA CLAVE: Asegúrate de exportar un objeto con ambas funciones
module.exports = { authMiddleware, adminMiddleware };