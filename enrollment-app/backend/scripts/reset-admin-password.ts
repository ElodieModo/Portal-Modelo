import readline from 'readline';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

function ask(question: string): Promise<string> {
  const terminal = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise(resolve => {
    terminal.question(question, answer => {
      terminal.close();
      resolve(answer.trim());
    });
  });
}

function askSecret(question: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const input = process.stdin;
    let answer = '';

    process.stdout.write(question);
    input.setRawMode?.(true);
    input.resume();

    const onData = (chunk: Buffer) => {
      const character = chunk.toString();

      if (character === '\u0003') {
        cleanup();
        reject(new Error('Cancelled'));
      } else if (character === '\r' || character === '\n') {
        cleanup();
        process.stdout.write('\n');
        resolve(answer);
      } else if (character === '\u007f') {
        answer = answer.slice(0, -1);
      } else {
        answer += character;
      }
    };

    const cleanup = () => {
      input.setRawMode?.(false);
      input.pause();
      input.removeListener('data', onData);
    };

    input.on('data', onData);
  });
}

async function main() {
  const email = (await ask('Email administrateur existant : ')).toLowerCase();
  const password = await askSecret('Nouveau mot de passe : ');

  if (!email || password.length < 8) {
    throw new Error('Email requis et mot de passe d’au moins 8 caractères requis.');
  }

  const admin = await prisma.user.findUnique({ where: { email } });
  if (!admin || admin.role !== 'ADMIN') {
    throw new Error('Aucun compte administrateur trouvé avec cet email.');
  }

  await prisma.user.update({
    where: { id: admin.id },
    data: { password: await bcrypt.hash(password, 10) }
  });

  console.log(`Mot de passe réinitialisé pour ${email}.`);
}

main()
  .catch(error => {
    console.error(`Erreur : ${error instanceof Error ? error.message : 'réinitialisation impossible'}`);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
