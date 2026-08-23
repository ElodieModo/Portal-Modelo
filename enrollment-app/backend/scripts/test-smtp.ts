import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import path from 'path';

// Load .env
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const host = process.env.SMTP_HOST;
const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : undefined;
const secure = process.env.SMTP_SECURE === 'true' || process.env.SMTP_SECURE === '1';
const user = process.env.SMTP_USER;
const pass = process.env.SMTP_PASS;

console.log('Verifying SMTP configuration (non-sensitive details):');
console.log(`SMTP_HOST: ${host}`);
console.log(`SMTP_PORT: ${port}`);
console.log(`SMTP_SECURE: ${secure}`);
console.log(`SMTP_USER configured: ${user ? 'Yes' : 'No'}`);
console.log(`SMTP_PASS configured: ${pass ? 'Yes' : 'No'}`);

if (!host || !port) {
  console.error('Error: SMTP_HOST and SMTP_PORT are required in .env');
  process.exit(1);
}

const transporter = nodemailer.createTransport({
  host,
  port,
  secure,
  auth: {
    user,
    pass,
  },
});

transporter.verify((error, success) => {
  if (error) {
    console.error('SMTP Connection/Authentication Failed:');
    console.error(`Error Code: ${(error as any).code || 'N/A'}`);
    console.error(`Error Message: ${error.message}`);
    process.exit(1);
  } else {
    console.log('SMTP Connection/Authentication Succeeded!');
    process.exit(0);
  }
});
