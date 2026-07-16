const { BrevoClient } = require("@getbrevo/brevo");

const brevo = new BrevoClient({ apiKey: process.env.BREVO_API_KEY });

async function sendOtpEmail(toEmail, otpCode) {
  await brevo.transactionalEmails.sendTransacEmail({
    subject: "Tu código de verificación - Streets of Lima",
    htmlContent: `
      <div style="font-family: monospace; background:#0a0a0a; color:#fff; padding:24px;">
        <h2 style="color:#facc15;">STREETS OF LIMA</h2>
        <p>Tu código de acceso es:</p>
        <p style="font-size: 28px; letter-spacing: 4px; color:#facc15;"><b>${otpCode}</b></p>
        <p style="color:#999; font-size: 12px;">Expira en ${process.env.OTP_EXPIRES_MINUTES || 5} minutos. Si no fuiste tú, ignora este correo.</p>
      </div>
    `,
    // El remitente debe ser un correo verificado en tu cuenta de Brevo
    sender: { name: "Streets of Lima", email: process.env.BREVO_SENDER_EMAIL },
    to: [{ email: toEmail }],
  });
}

module.exports = { sendOtpEmail };
