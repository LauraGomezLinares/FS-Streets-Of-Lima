const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const prisma = require("../lib/prisma");
const { generateOtp, getOtpExpiry, isOtpExpired } = require("../utils/otp");
const { sendOtpEmail } = require("../utils/mailer");

// Generación de JWT firmados con expiraciones según el Rol (Requerimiento 3 y 7)
function signToken(user) {
  const expiresIn = user.role === "ADMIN"
    ? process.env.ADMIN_JWT_EXPIRES_IN || "30m"
    : process.env.JWT_EXPIRES_IN || "2h";

  return jwt.sign(
    { id: user.id, email: user.email, username: user.username, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn }
  );
}

// Log de Auditoría de Accesos en Base de Datos (Requerimiento 7)
async function logAttempt({ userId, req, success, isAdminLogin = false }) {
  try {
    await prisma.loginLog.create({
      data: {
        userId,
        success,
        isAdminLogin,
        ipAddress: req.ip || req.headers["x-forwarded-for"] || "127.0.0.1",
        userAgent: req.headers["user-agent"] || null,
      },
    });
  } catch (e) {
    console.error("No se pudo guardar el log de login:", e.message);
  }
}

async function savePlaytime(req, res) {
  try {
    const { secondsToAdd } = req.body;
    if (!secondsToAdd || secondsToAdd <= 0) return res.json({ success: true });

    await prisma.user.update({
      where: { id: req.user.id },
      data: { totalPlaySeconds: { increment: secondsToAdd } }
    });
    return res.json({ success: true });
  } catch (err) {
    console.error("Error guardando tiempo:", err);
    return res.status(500).json({ error: "Error al guardar el tiempo." });
  }
}

// No olvides agregar 'savePlaytime' al module.exports al final del archivo

// POST /auth/register -> Crea usuario y solicita OTP directo (Garantiza Requerimiento 4)
async function register(req, res) {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: "Completa todos los campos." });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: "La contraseña debe tener al menos 6 caracteres." });
    }

    const existing = await prisma.user.findFirst({
      where: { OR: [{ email }, { username }] },
    });
    if (existing) {
      return res.status(409).json({ error: "Email o username ya registrado." });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const otpCode = generateOtp();

    // Transacción/Creación del usuario con su progreso inicial y OTP listo
    const user = await prisma.user.create({
      data: {
        username,
        email,
        passwordHash,
        role: "PLAYER",
        otpCode,
        otpExpiresAt: getOtpExpiry(),
        otpVerified: false,
        battlePass: { create: { level: 1, xp: 0 } }, // Mapeado al cascade schema
      },
    });

    // Envío del correo con el código OTP
    await sendOtpEmail(user.email, otpCode);

    return res.status(201).json({
      message: "Usuario registrado con éxito. Código OTP enviado a tu correo.",
      otpRequired: true,
      userId: user.id, // El frontend redirige al paso OTP inmediatamente
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Error interno al registrar." });
  }
}

// POST /auth/login -> Valida credenciales y despacha OTP (Requerimiento 4)
async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Completa todos los campos." });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: "Credenciales incorrectas." });
    }
    if (user.isBanned) {
      return res.status(403).json({ error: "Esta cuenta ha sido suspendida por la administración." });
    }

    const validPassword = await bcrypt.compare(password, user.passwordHash);
    if (!validPassword) {
      await logAttempt({ userId: user.id, req, success: false });
      return res.status(401).json({ error: "Credenciales incorrectas." });
    }

    const otpCode = generateOtp();
    await prisma.user.update({
      where: { id: user.id },
      data: { otpCode, otpExpiresAt: getOtpExpiry(), otpVerified: false },
    });

    await sendOtpEmail(user.email, otpCode);

    return res.status(200).json({
      message: "Código OTP enviado a tu correo.",
      otpRequired: true,
      userId: user.id,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Error interno al iniciar sesión." });
  }
}

// POST /auth/verify-otp -> Valida el código y libera el Token JWT definitivo (Requerimiento 3)
async function verifyOtp(req, res) {
  try {
    const { userId, code } = req.body;
    if (!userId || !code) {
      return res.status(400).json({ error: "Faltan parámetros obligatorios." });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ error: "Usuario no encontrado." });

    if (isOtpExpired(user.otpExpiresAt)) {
      return res.status(400).json({ error: "El código OTP ha expirado. Solicita uno nuevo." });
    }
    if (user.otpCode !== code) {
      await logAttempt({ userId: user.id, req, success: false, isAdminLogin: user.role === "ADMIN" });
      return res.status(400).json({ error: "Código OTP incorrecto." });
    }

    // Limpieza de campos OTP y verificación exitosa
    await prisma.user.update({
      where: { id: user.id },
      data: { otpCode: null, otpExpiresAt: null, otpVerified: true },
    });

    await logAttempt({ userId: user.id, req, success: true, isAdminLogin: user.role === "ADMIN" });

    const token = signToken(user);
    return res.status(200).json({
      token,
      user: { id: user.id, username: user.username, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Error interno al verificar OTP." });
  }
}

// POST /auth/resend-otp -> Regeneración dinámica en caso de expiración
async function resendOtp(req, res) {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: "ID de usuario requerido." });

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ error: "Usuario no encontrado." });

    const otpCode = generateOtp();
    await prisma.user.update({
      where: { id: user.id },
      data: { otpCode, otpExpiresAt: getOtpExpiry(), otpVerified: false },
    });
    
    await sendOtpEmail(user.email, otpCode);

    return res.status(200).json({ message: "Nuevo código enviado a tu correo." });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Error al reenviar el código OTP." });
  }
}

// GET /users/me -> Recuperación de perfil en sesión (Requiere JWT válido previo)
async function me(req, res) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { battlePassProgress: true }, // Consistente con el modelo cascade
    });
    if (!user) return res.status(404).json({ error: "Usuario no encontrado." });

    return res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      battlePass: user.battlePassProgress,
      sunnys: user.sunnys,
      skillPoints: user.skillPoints,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Error al obtener perfil." });
  }
}

async function checkRole(req, res) {
  try {
    // Buscamos al usuario en la base de datos usando el ID de su sesión
    const userDb = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { role: true } // Solo traemos la columna 'role' para que sea súper rápido
    });

    if (!userDb) return res.status(404).json({ error: "Usuario no encontrado." });

    res.json({ role: userDb.role });
  } catch (error) {
    console.error("Error consultando el rol:", error);
    res.status(500).json({ error: "Error interno del servidor." });
  }
}

module.exports = { register, login, verifyOtp, resendOtp, me, savePlaytime, checkRole };