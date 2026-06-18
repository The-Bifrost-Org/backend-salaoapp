import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateServicoDto } from './dto/create-servico.dto';
import { UpdateServicoDto } from './dto/update-servico.dto';

@Injectable()
export class ServicosService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateServicoDto) {
    return this.prisma.servico.create({
      data: {
        nome: dto.nome,
        descricao: dto.descricao,
        duracaoMinutos: dto.duracaoMinutos,
        preco: dto.preco,
      },
    });
  }

  async findAll() {
    return this.prisma.servico.findMany({
      where: { ativo: true },
      orderBy: { nome: 'asc' },
    });
  }

  async findOne(id: string) {
    const servico = await this.prisma.servico.findUnique({
      where: { id },
      include: {
        funcionarias: {
          include: {
            funcionaria: {
              include: {
                usuario: {
                  select: { id: true, nome: true, email: true },
                },
              },
            },
          },
        },
      },
    });

    if (!servico) {
      throw new NotFoundException('Serviço não encontrado');
    }

    return servico;
  }

  async update(id: string, dto: UpdateServicoDto) {
    await this.findOne(id); // garante que existe

    return this.prisma.servico.update({
      where: { id },
      data: {
        nome: dto.nome,
        descricao: dto.descricao,
        duracaoMinutos: dto.duracaoMinutos,
        preco: dto.preco !== undefined ? dto.preco : undefined,
        ativo: dto.ativo,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id); // garante que existe

    // soft delete
    return this.prisma.servico.update({
      where: { id },
      data: { ativo: false },
    });
  }
}
