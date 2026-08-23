import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '.env') });

async function testConnection() {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : undefined;
  const secure = process.env.SMTP_SECURE === 'true';
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !port) {
    console.log("Erreur : configuration SMTP_HOST ou SMTP_PORT manquante.");
    process.exit(1);
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: user && pass ? {
      user: user,
      pass: pass
    } : undefined,
  });

  try {
    await transporter.verify();
    console.log("Succès : Connexion SMTP établie avec succès.");
  } catch (error: any) {
    // Safeguard to not show the password or API key in the error message
    let errorMessage = error.message;
    if (pass && errorMessage.includes(pass)) {
      errorMessage = errorMessage.replace(pass, '[SECRET]');
    }
    if (user && errorMessage.includes(user)) {
      errorMessage = errorMessage.replace(user, '[USER]');
    }
    console.log(`Erreur : ${errorMessage}`);
  }
}

testConnection();
