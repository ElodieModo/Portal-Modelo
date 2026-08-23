import readline from 'readline';
import { PrismaClient, Role } from '@prisma/client';
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
  const email = (await ask('Email administrateur : ')).toLowerCase();
  const name = await ask('Nom : ');
  const password = await askSecret('Mot de passe : ');

  if (!email || !name || password.length < 8) {
    throw new Error('Email, nom et mot de passe d’au moins 8 caractères requis.');
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new Error('Un compte existe déjà avec cet email.');
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  await prisma.user.create({
    data: {
      email,
      name,
      password: hashedPassword,
      role: Role.ADMIN
    }
  });

  console.log(`Compte administrateur créé pour ${email}.`);
}

main()
  .catch(error => {
    console.error(`Erreur : ${error instanceof Error ? error.message : 'création impossible'}`);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });