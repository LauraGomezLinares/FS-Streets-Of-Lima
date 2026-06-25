const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false, // true si usas el puerto 465
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

async function sendOtpEmail(toEmail, otpCode) {
  await transporter.sendMail({
    from: `"Streets of Lima" <${process.env.SMTP_USER}>`,
    to: toEmail,
    subject: "Tu código de verificación - Streets of Lima",
    html: `
      <div style="font-family: monospace; background:#0a0a0a; color:#fff; padding:24px;">
        <h2 style="color:#facc15;">STREETS OF LIMA</h2>
        <p>Tu código de acceso es:</p>
        <p style="font-size: 28px; letter-spacing: 4px; color:#facc15;"><b>${otpCode}</b></p>
        <p style="color:#999; font-size: 12px;">Expira en ${process.env.OTP_EXPIRES_MINUTES || 5} minutos. Si no fuiste tú, ignora este correo.</p>
      </div>
    `,
  });
}

module.exports = { sendOtpEmail };
