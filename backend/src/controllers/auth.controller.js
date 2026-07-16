const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const prisma = require("../lib/prisma");
const { generateOtp, getOtpExpiry, isOtpExpired } = require("../utils/otp");
const { sendOtpEmail } = require("../utils/mailer");

// Generación de JWT
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

// Log de Auditoría
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

async function register(req, res) {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) return res.status(400).json({ error: "Completa todos los campos." });
    if (password.length < 6) return res.status(400).json({ error: "La contraseña debe tener al menos 6 caracteres." });

    const existing = await prisma.user.findFirst({
      where: { OR: [{ email }, { username }] },
    });
    if (existing) return res.status(409).json({ error: "Email o username ya registrado." });

    const passwordHash = await bcrypt.hash(password, 10);
    const otpCode = generateOtp();

    const user = await prisma.user.create({
      data: {
        username,
        email,
        passwordHash,
        role: "PLAYER",
        otpCode,
        otpExpiresAt: getOtpExpiry(),
        otpVerified: false,
        battlePass: { create: { level: 1, xp: 0 } }, 
      },
    });

    await sendOtpEmail(user.email, otpCode);

    return res.status(201).json({
      message: "Usuario registrado con éxito. Código OTP enviado a tu correo.",
      otpRequired: true,
      userId: user.id,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Error interno al registrar." });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "Completa todos los campos." });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ error: "Credenciales incorrectas." });
    if (user.isBanned) return res.status(403).json({ error: "Esta cuenta ha sido suspendida." });

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

    return res.status(200).json({ message: "Código OTP enviado a tu correo.", otpRequired: true, userId: user.id });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Error interno al iniciar sesión." });
  }
}

async function verifyOtp(req, res) {
  try {
    const { userId, code } = req.body;
    if (!userId || !code) return res.status(400).json({ error: "Faltan parámetros obligatorios." });

    // 🔥 AHORA: Incluimos el battlePass para que el inicio de sesión devuelva todo
    const user = await prisma.user.findUnique({ 
        where: { id: userId },
        include: { battlePassProgress: true } 
    });
    if (!user) return res.status(404).json({ error: "Usuario no encontrado." });

    if (isOtpExpired(user.otpExpiresAt)) return res.status(400).json({ error: "El código OTP ha expirado." });
    
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
    
    // 🔥 AHORA: Retornamos el objeto COMPLETO del usuario al Frontend
    return res.status(200).json({
      token,
      user: { 
          id: user.id, 
          username: user.username, 
          email: user.email, 
          role: user.role,
          battlePass: user.battlePassProgress,
          totalPlaySeconds: user.totalPlaySeconds, 
          sunnys: user.sunnys,
          skillPoints: user.skillPoints,           
          unlockedSkills: user.unlockedSkills      
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Error interno al verificar OTP." });
  }
}

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

// GET /users/me -> Recuperación de perfil en sesión
async function me(req, res) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { battlePassProgress: true },
    });
    if (!user) return res.status(404).json({ error: "Usuario no encontrado." });

    // Enviamos la data completa en los refrescos de pantalla
    return res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      battlePass: user.battlePassProgress,
      totalPlaySeconds: user.totalPlaySeconds, 
      sunnys: user.sunnys,
      skillPoints: user.skillPoints,           
      unlockedSkills: user.unlockedSkills      
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Error al obtener perfil." });
  }
}

async function checkRole(req, res) {
  try {
    const userDb = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { role: true } 
    });
    if (!userDb) return res.status(404).json({ error: "Usuario no encontrado." });
    res.json({ role: userDb.role });
  } catch (error) {
    console.error("Error consultando el rol:", error);
    res.status(500).json({ error: "Error interno del servidor." });
  }
}

// Función para comprar habilidades
async function buySkill(req, res) {
    try {
      const { skillId, cost } = req.body;
      const user = await prisma.user.findUnique({ where: { id: req.user.id } });
  
      if (user.skillPoints < cost) return res.status(400).json({ error: "Puntos insuficientes." });
      if (user.unlockedSkills.includes(skillId)) return res.status(400).json({ error: "Ya tienes esta habilidad." });
  
      const updatedUser = await prisma.user.update({
        where: { id: req.user.id },
        data: {
          skillPoints: { decrement: cost },
          unlockedSkills: { push: skillId }
        },
        select: { id: true, username: true, email: true, role: true, sunnys: true, skillPoints: true, unlockedSkills: true, totalPlaySeconds: true }
      });
  
      res.json(updatedUser);
    } catch (error) {
      console.error("Error comprando habilidad:", error);
      res.status(500).json({ error: "Error interno." });
    }
}

module.exports = { register, login, verifyOtp, resendOtp, me, savePlaytime, checkRole, buySkill };