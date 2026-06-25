const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const prisma = require("../lib/prisma");
const { generateOtp, getOtpExpiry, isOtpExpired } = require("../utils/otp");
const { sendOtpEmail } = require("../utils/mailer");

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

async function logAttempt({ userId, req, success, isAdminLogin = false }) {
  try {
    await prisma.loginLog.create({
      data: {
        userId,
        success,
        isAdminLogin,
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"] || null,
      },
    });
  } catch (e) {
    console.error("No se pudo guardar el log de login:", e.message);
  }
}

// POST /auth/register
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

    const user = await prisma.user.create({
      data: {
        username,
        email,
        passwordHash,
        role: "PLAYER",
        battlePass: { create: { level: 1, xp: 0 } }, // crea su progreso inicial
      },
    });

    // Login directo tras registro (puedes forzar OTP aquí también si prefieres)
    const token = signToken(user);
    await logAttempt({ userId: user.id, req, success: true });

    return res.status(201).json({
      token,
      user: { id: user.id, username: user.username, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Error interno al registrar." });
  }
}

// POST /auth/login  -> valida credenciales y envía OTP (no entrega JWT todavía)
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
      return res.status(403).json({ error: "Esta cuenta ha sido suspendida." });
    }

    const validPassword = await bcrypt.compare(password, user.passwordHash);
    if (!validPassword) {
      await logAttempt({ userId: user.id, req, success: false });
      return res.status(401).json({ error: "Credenciales incorrectas." });
    }

    // Genera y envía OTP (Requerimiento 4)
    const otpCode = generateOtp();
    await prisma.user.update({
      where: { id: user.id },
      data: { otpCode, otpExpiresAt: getOtpExpiry(), otpVerified: false },
    });

    await sendOtpEmail(user.email, otpCode);

    return res.status(200).json({
      message: "Código OTP enviado a tu correo.",
      otpRequired: true,
      userId: user.id, // el frontend lo necesita para el siguiente paso
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Error interno al iniciar sesión." });
  }
}

// POST /auth/verify-otp -> valida el código y AHÍ SÍ entrega el JWT
async function verifyOtp(req, res) {
  try {
    const { userId, code } = req.body;
    if (!userId || !code) {
      return res.status(400).json({ error: "Faltan datos." });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ error: "Usuario no encontrado." });

    if (isOtpExpired(user.otpExpiresAt)) {
      return res.status(400).json({ error: "El código OTP ha expirado, solicita uno nuevo." });
    }
    if (user.otpCode !== code) {
      await logAttempt({ userId: user.id, req, success: false, isAdminLogin: user.role === "ADMIN" });
      return res.status(400).json({ error: "Código OTP incorrecto." });
    }

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

// POST /auth/resend-otp
async function resendOtp(req, res) {
  try {
    const { userId } = req.body;
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ error: "Usuario no encontrado." });

    const otpCode = generateOtp();
    await prisma.user.update({
      where: { id: user.id },
      data: { otpCode, otpExpiresAt: getOtpExpiry() },
    });
    await sendOtpEmail(user.email, otpCode);

    return res.status(200).json({ message: "Nuevo código enviado." });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Error al reenviar OTP." });
  }
}

// GET /users/me
async function me(req, res) {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    include: { battlePass: true },
  });
  if (!user) return res.status(404).json({ error: "Usuario no encontrado." });

  return res.json({
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
    battlePass: user.battlePass,
  });
}

module.exports = { register, login, verifyOtp, resendOtp, me };
