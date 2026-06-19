import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAgendamentoDto } from './dto/create-agendamento.dto';
import { UpdateAgendamentoDto } from './dto/update-agendamento.dto';
import { UpdateStatusDto } from './dto/update-status.dto';

@Injectable()
export class AgendamentosService {
  constructor(private prisma: PrismaService) {}

  private async verificarConflito(
    funcionariaId: string,
    dataHoraInicio: Date,
    dataHoraFim: Date,
    ignorarId?: string,
  ) {
    const conflito = await this.prisma.agendamento.findFirst({
      where: {
        funcionariaId,
        id: { not: ignorarId },
        status: { notIn: ['CANCELADO'] },
        OR: [
          {
            dataHoraInicio: { lt: dataHoraFim },
            dataHoraFim: { gt: dataHoraInicio },
          },
        ],
      },
    });

    if (conflito) {
      throw new ConflictException(
        'Funcionária já possui agendamento nesse horário',
      );
    }
  }

  async create(dto: CreateAgendamentoDto) {
    // busca duração do serviço para calcular dataHoraFim
    const servico = await this.prisma.servico.findUnique({
      where: { id: dto.servicoId },
    });

    if (!servico) {
      throw new NotFoundException('Serviço não encontrado');
    }

    const dataHoraInicio = new Date(dto.dataHoraInicio);
    const dataHoraFim = new Date(
      dataHoraInicio.getTime() + servico.duracaoMinutos * 60000,
    );

    await this.verificarConflito(
      dto.funcionariaId,
      dataHoraInicio,
      dataHoraFim,
    );

    return this.prisma.agendamento.create({
      data: {
        clienteId: dto.clienteId,
        funcionariaId: dto.funcionariaId,
        servicoId: dto.servicoId,
        dataHoraInicio,
        dataHoraFim,
        observacao: dto.observacao,
      },
      include: this.includeCompleto(),
    });
  }

  async findAll(funcionariaId?: string, data?: string) {
    const where: any = {};

    if (funcionariaId) where.funcionariaId = funcionariaId;

    if (data) {
      const inicio = new Date(data);
      inicio.setHours(0, 0, 0, 0);
      const fim = new Date(data);
      fim.setHours(23, 59, 59, 999);
      where.dataHoraInicio = { gte: inicio, lte: fim };
    }

    // busca agendamentos internos
    const agendamentosInternos = await this.prisma.agendamento.findMany({
      where,
      orderBy: { dataHoraInicio: 'asc' },
      include: this.includeCompleto(),
    });

    // busca agendamentos do portal do cliente
    const agendamentosCliente = await this.prisma.agendamentoCliente.findMany({
      where,
      orderBy: { dataHoraInicio: 'asc' },
      include: {
        cliente: { select: { id: true, nome: true, telefone: true } },
        funcionaria: {
          include: {
            usuario: { select: { id: true, nome: true } },
          },
        },
        servico: {
          select: { id: true, nome: true, duracaoMinutos: true, preco: true },
        },
      },
    });

    // normaliza os agendamentos do cliente para o mesmo formato
    const clienteNormalizados = agendamentosCliente.map((a) => ({
      ...a,
      origem: 'cliente',
    }));

    const internosNormalizados = agendamentosInternos.map((a) => ({
      ...a,
      origem: 'interno',
    }));

    // junta e ordena por hora
    return [...internosNormalizados, ...clienteNormalizados].sort(
      (a, b) =>
        new Date(a.dataHoraInicio).getTime() -
        new Date(b.dataHoraInicio).getTime(),
    );
  }

  async findOne(id: string) {
    const agendamento = await this.prisma.agendamento.findUnique({
      where: { id },
      include: this.includeCompleto(),
    });

    if (!agendamento) {
      throw new NotFoundException('Agendamento não encontrado');
    }

    return agendamento;
  }

  async update(id: string, dto: UpdateAgendamentoDto) {
    const agendamento = await this.findOne(id);

    const servicoId = dto.servicoId ?? agendamento.servicoId;
    const servico = await this.prisma.servico.findUnique({
      where: { id: servicoId },
    });

    if (!servico) throw new NotFoundException('Serviço não encontrado');

    const dataHoraInicio = dto.dataHoraInicio
      ? new Date(dto.dataHoraInicio)
      : agendamento.dataHoraInicio;

    const dataHoraFim = new Date(
      dataHoraInicio.getTime() + servico.duracaoMinutos * 60000,
    );

    const funcionariaId = dto.funcionariaId ?? agendamento.funcionariaId;

    await this.verificarConflito(
      funcionariaId,
      dataHoraInicio,
      dataHoraFim,
      id,
    );

    return this.prisma.agendamento.update({
      where: { id },
      data: {
        clienteId: dto.clienteId,
        funcionariaId: dto.funcionariaId,
        servicoId: dto.servicoId,
        dataHoraInicio,
        dataHoraFim,
        observacao: dto.observacao,
      },
      include: this.includeCompleto(),
    });
  }

  async updateStatus(id: string, dto: UpdateStatusDto) {
    await this.findOne(id);

    return this.prisma.agendamento.update({
      where: { id },
      data: { status: dto.status },
      include: this.includeCompleto(),
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.agendamento.update({
      where: { id },
      data: { status: 'CANCELADO' },
      include: this.includeCompleto(),
    });
  }

  private includeCompleto() {
    return {
      cliente: { select: { id: true, nome: true, telefone: true } },
      funcionaria: {
        include: {
          usuario: { select: { id: true, nome: true } },
        },
      },
      servico: {
        select: { id: true, nome: true, duracaoMinutos: true, preco: true },
      },
    };
  }
}
