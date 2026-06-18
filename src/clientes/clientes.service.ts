import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';

@Injectable()
export class ClientesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateClienteDto) {
    return this.prisma.cliente.create({
      data: {
        nome: dto.nome,
        telefone: dto.telefone,
        email: dto.email,
      },
    });
  }

  async findAll() {
    return this.prisma.cliente.findMany({
      orderBy: { nome: 'asc' },
    });
  }

  async findOne(id: string) {
    const cliente = await this.prisma.cliente.findUnique({
      where: { id },
      include: {
        agendamentos: {
          orderBy: { dataHoraInicio: 'desc' },
          take: 10, // últimos 10 agendamentos
          include: {
            servico: {
              select: { id: true, nome: true, preco: true },
            },
            funcionaria: {
              include: {
                usuario: {
                  select: { id: true, nome: true },
                },
              },
            },
          },
        },
      },
    });

    if (!cliente) {
      throw new NotFoundException('Cliente não encontrado');
    }

    return cliente;
  }

  async update(id: string, dto: UpdateClienteDto) {
    await this.findOne(id); // garante que existe

    return this.prisma.cliente.update({
      where: { id },
      data: {
        nome: dto.nome,
        telefone: dto.telefone,
        email: dto.email,
      },
    });
  }
}
