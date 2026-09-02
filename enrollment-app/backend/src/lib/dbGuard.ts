import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

export async function ensureDatabaseGuard(prisma: PrismaClient) {
  const userCount = await prisma.user.count();
  const studentCount = await prisma.student.count();

  const bootstrapAdminEmail = process.env.BOOTSTRAP_ADMIN_EMAIL;
  const bootstrapAdminPassword = process.env.BOOTSTRAP_ADMIN_PASSWORD;
  const allowEmptyDb = process.env.ALLOW_EMPTY_DB === 'true';
  const canBootstrapAdmin = Boolean(bootstrapAdminEmail && bootstrapAdminPassword);

  if (userCount === 0 || studentCount === 0) {
    console.warn('⚠️ Database guard: no admin and/or student data detected.');
    console.warn(`- users: ${userCount}`);
    console.warn(`- students: ${studentCount}`);
    console.warn(`- database: ${process.env.DATABASE_URL ? 'configured' : 'missing'}`);

    if (process.env.NODE_ENV === 'production' && !allowEmptyDb && !canBootstrapAdmin) {
      throw new Error(
        'Production startup blocked: the connected database is empty or points to the wrong database. ' +
        'Set the correct DATABASE_URL or allow a safe bootstrap via BOOTSTRAP_ADMIN_EMAIL / BOOTSTRAP_ADMIN_PASSWORD.'
      );
    }

    if (bootstrapAdminEmail && bootstrapAdminPassword) {
      const existingAdmin = await prisma.user.findUnique({
        where: { email: bootstrapAdminEmail.toLowerCase() }
      });

      if (!existingAdmin) {
        await prisma.user.create({
          data: {
            email: bootstrapAdminEmail.toLowerCase(),
            name: 'Bootstrap Admin',
            password: await bcrypt.hash(bootstrapAdminPassword, 10),
            role: 'ADMIN'
          }
        });
        console.log('✅ Bootstrap admin created from environment variables.');
      }
    }
  }
}
