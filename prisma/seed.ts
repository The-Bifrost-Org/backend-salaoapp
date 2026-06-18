import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed...');

  // Admin (dona do salão)
  const senhaHash = await bcrypt.hash('admin123', 12);

  const admin = await prisma.usuario.upsert({
    where: { email: 'admin@salaoappp.com' },
    update: {},
    create: {
      nome: 'Dona do Salão',
      email: 'admin@salaoappp.com',
      senhaHash,
      role: 'ADMIN',
    },
  });

  console.log(`✅ Admin criado: ${admin.email}`);

  // Funcionária de exemplo
  const senhaFunc = await bcrypt.hash('func123', 12);

  const funcionaria = await prisma.usuario.upsert({
    where: { email: 'ana@salaoappp.com' },
    update: {},
    create: {
      nome: 'Ana Silva',
      email: 'ana@salaoappp.com',
      senhaHash: senhaFunc,
      role: 'FUNCIONARIA',
      funcionaria: {
        create: {
          telefone: '(16) 99999-0001',
        },
      },
    },
  });

  console.log(`✅ Funcionária criada: ${funcionaria.email}`);

  // Serviços
  const servicos = await Promise.all([
    prisma.servico.upsert({
      where: { id: 'servico-corte' },
      update: {},
      create: {
        id: 'servico-corte',
        nome: 'Corte de Cabelo',
        descricao: 'Corte feminino ou masculino',
        duracaoMinutos: 60,
        preco: 80.0,
      },
    }),
    prisma.servico.upsert({
      where: { id: 'servico-coloracao' },
      update: {},
      create: {
        id: 'servico-coloracao',
        nome: 'Coloração',
        descricao: 'Tintura completa',
        duracaoMinutos: 120,
        preco: 180.0,
      },
    }),
    prisma.servico.upsert({
      where: { id: 'servico-manicure' },
      update: {},
      create: {
        id: 'servico-manicure',
        nome: 'Manicure',
        descricao: 'Unhas das mãos',
        duracaoMinutos: 45,
        preco: 45.0,
      },
    }),
  ]);

  console.log(`✅ ${servicos.length} serviços criados`);

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
