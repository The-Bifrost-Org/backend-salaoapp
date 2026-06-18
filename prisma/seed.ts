import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de produção...');

  // Admin (dona do salão)
  const senhaHash = await bcrypt.hash('admin123', 12);

  const admin = await prisma.usuario.upsert({
    where: { email: 'admin@salaoappp.com' },
    update: {},
    create: {
      nome: 'Administrador',
      email: 'admin@salaoappp.com',
      senhaHash,
      role: 'ADMIN',
    },
  });

  console.log(`✅ Admin criado: ${admin.email}`);
  console.log(`⚠️  Lembre-se de trocar a senha após o primeiro login!`);

  console.log('🎉 Seed concluído!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
