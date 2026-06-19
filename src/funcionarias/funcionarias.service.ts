import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFuncionariaDto } from './dto/create-funcionaria.dto';
import { UpdateFuncionariaDto } from './dto/update-funcionaria.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class FuncionariasService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateFuncionariaDto) {
    // verifica se e-mail já existe
    const emailExiste = await this.prisma.usuario.findUnique({
      where: { email: dto.email },
    });

    if (emailExiste) {
      throw new ConflictException('E-mail já cadastrado');
    }

    const senhaHash = await bcrypt.hash(dto.senha, 12);

    const usuario = await this.prisma.usuario.create({
      data: {
        nome: dto.nome,
        email: dto.email,
        senhaHash,
        role: 'FUNCIONARIA',
        funcionaria: {
          create: {
            telefone: dto.telefone,
            fotoPerfil: dto.fotoPerfil,
          },
        },
      },
      include: {
        funcionaria: true,
      },
    });

    return usuario;
  }

  async findAll() {
    return this.prisma.funcionaria.findMany({
      where: { ativo: true },
      include: {
        usuario: {
          select: {
            id: true,
            nome: true,
            email: true,
            role: true,
            ativo: true,
          },
        },
      },
    });
  }

  async findOne(id: string) {
    const funcionaria = await this.prisma.funcionaria.findUnique({
      where: { id },
      include: {
        usuario: {
          select: {
            id: true,
            nome: true,
            email: true,
            role: true,
            ativo: true,
          },
        },
        horarios: { where: { ativo: true } },
        servicos: { include: { servico: true } },
      },
    });

    if (!funcionaria) {
      throw new NotFoundException('Funcionária não encontrada');
    }

    return funcionaria;
  }

  async update(id: string, dto: UpdateFuncionariaDto) {
    await this.findOne(id); // garante que existe

    return this.prisma.funcionaria.update({
      where: { id },
      data: {
        telefone: dto.telefone,
        fotoPerfil: dto.fotoPerfil,
        ativo: dto.ativo,
        usuario: {
          update: {
            ...(dto.nome && { nome: dto.nome }),
            ...(dto.ativo !== undefined && { ativo: dto.ativo }),
          },
        },
      },
      include: {
        usuario: {
          select: {
            id: true,
            nome: true,
            email: true,
            role: true,
            ativo: true,
          },
        },
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id); // garante que existe

    // soft delete
    return this.prisma.funcionaria.update({
      where: { id },
      data: {
        ativo: false,
        usuario: { update: { ativo: false } },
      },
    });
  }

  async findHorarios(id: string) {
    await this.findOne(id);

    return this.prisma.horarioTrabalho.findMany({
      where: { funcionariaId: id, ativo: true },
      orderBy: { diaSemana: 'asc' },
    });
  }

  async atualizarServicos(id: string, servicoIds: string[]) {
    await this.findOne(id);

    const existentes = await this.prisma.funcionariaServico.findMany({
      where: { funcionariaId: id },
      select: { servicoId: true },
    });

    const idsExistentes = existentes.map((e) => e.servicoId);

    const adicionar = servicoIds.filter((s) => !idsExistentes.includes(s));

    const remover = idsExistentes.filter((s) => !servicoIds.includes(s));

    await this.prisma.$transaction([
      this.prisma.funcionariaServico.deleteMany({
        where: {
          funcionariaId: id,
          servicoId: { in: remover },
        },
      }),
      this.prisma.funcionariaServico.createMany({
        data: adicionar.map((servicoId) => ({
          funcionariaId: id,
          servicoId,
        })),
      }),
    ]);

    return this.findOne(id);
  }

  async atualizarHorarios(
    id: string,
    horarios: {
      diaSemana: number;
      horaInicio: string;
      horaFim: string;
      inicioAlmoco?: string;
      fimAlmoco?: string;
    }[],
  ) {
    await this.findOne(id);

    await this.prisma.horarioTrabalho.deleteMany({
      where: { funcionariaId: id },
    });

    if (horarios.length > 0) {
      await this.prisma.horarioTrabalho.createMany({
        data: horarios.map((h) => ({
          funcionariaId: id,
          diaSemana: h.diaSemana,
          horaInicio: h.horaInicio,
          horaFim: h.horaFim,
          inicioAlmoco: h.inicioAlmoco || null,
          fimAlmoco: h.fimAlmoco || null,
          ativo: true,
        })),
      });
    }

    return this.findHorarios(id);
  }
}
