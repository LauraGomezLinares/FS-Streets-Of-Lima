// Genera un código numérico de 6 dígitos
function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function getOtpExpiry() {
  const minutes = parseInt(process.env.OTP_EXPIRES_MINUTES || "5", 10);
  return new Date(Date.now() + minutes * 60 * 1000);
}

function isOtpExpired(expiresAt) {
  if (!expiresAt) return true;
  return new Date() > new Date(expiresAt);
}

module.exports = { generateOtp, getOtpExpiry, isOtpExpired };
