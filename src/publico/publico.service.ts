import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { RegistrarClienteDto } from './dto/registrar-cliente.dto';
import { LoginClienteDto } from './dto/login-cliente.dto';
import { CriarAgendamentoClienteDto } from './dto/criar-agendamento-cliente.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class PublicoService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  // ─── AUTH ────────────────────────────────────────────────

  async registrar(dto: RegistrarClienteDto) {
    const emailExiste = await this.prisma.clienteAuth.findUnique({
      where: { email: dto.email },
    });

    if (emailExiste) {
      throw new ConflictException('E-mail já cadastrado');
    }

    const senhaHash = await bcrypt.hash(dto.senha, 12);

    const cliente = await this.prisma.clienteAuth.create({
      data: {
        nome: dto.nome,
        email: dto.email,
        telefone: dto.telefone,
        senhaHash,
      },
      select: {
        id: true,
        nome: true,
        email: true,
        telefone: true,
        criadoEm: true,
      },
    });

    const tokens = this.gerarTokens(cliente.id, cliente.email);
    return { cliente, ...tokens };
  }

  async login(dto: LoginClienteDto) {
    const cliente = await this.prisma.clienteAuth.findUnique({
      where: { email: dto.email },
    });

    if (!cliente || !cliente.ativo) {
      throw new UnauthorizedException('E-mail ou senha inválidos');
    }

    const senhaValida = await bcrypt.compare(dto.senha, cliente.senhaHash);
    if (!senhaValida) {
      throw new UnauthorizedException('E-mail ou senha inválidos');
    }

    const tokens = this.gerarTokens(cliente.id, cliente.email);
    return {
      cliente: { id: cliente.id, nome: cliente.nome, email: cliente.email },
      ...tokens,
    };
  }

  private gerarTokens(clienteId: string, email: string) {
    const payload = { sub: clienteId, email, role: 'CLIENTE' };

    const accessToken = this.jwt.sign(payload, {
      secret: this.config.get('JWT_SECRET'),
      expiresIn: this.config.get('JWT_EXPIRES_IN'),
    });

    const refreshToken = this.jwt.sign(payload, {
      secret: this.config.get('JWT_REFRESH_SECRET'),
      expiresIn: this.config.get('JWT_REFRESH_EXPIRES_IN'),
    });

    return { accessToken, refreshToken };
  }

  // ─── CATÁLOGO ─────────────────────────────────────────────

  async listarServicos() {
    return this.prisma.servico.findMany({
      where: { ativo: true },
      orderBy: { nome: 'asc' },
      select: {
        id: true,
        nome: true,
        descricao: true,
        duracaoMinutos: true,
        preco: true,
        imagemUrl: true,
      },
    });
  }

  async listarFuncionariasPorServico(servicoId: string) {
    const resultado = await this.prisma.funcionariaServico.findMany({
      where: { servicoId },
      include: {
        funcionaria: {
          include: {
            usuario: { select: { id: true, nome: true } },
          },
        },
      },
    });

    return resultado.filter((r) => r.funcionaria.ativo);
  }

  // ─── HORÁRIOS DISPONÍVEIS ────────────────────────────────

  async horariosDisponiveis(
    funcionariaId: string,
    data: string,
    servicoId: string,
  ) {
    const servico = await this.prisma.servico.findUnique({
      where: { id: servicoId },
    });

    if (!servico) throw new NotFoundException('Serviço não encontrado');

    const diaSemana = new Date(data + 'T12:00:00').getDay();

    const horario = await this.prisma.horarioTrabalho.findFirst({
      where: { funcionariaId, diaSemana, ativo: true },
    });

    if (!horario) return { disponiveis: [], ocupados: [] };

    const inicioDia = new Date(data + 'T00:00:00');
    const fimDia = new Date(data + 'T23:59:59');

    // busca agendamentos internos E do portal público
    const [agendamentosInternos, agendamentosCliente] = await Promise.all([
      this.prisma.agendamento.findMany({
        where: {
          funcionariaId,
          status: { notIn: ['CANCELADO'] },
          dataHoraInicio: { gte: inicioDia, lte: fimDia },
        },
        select: { dataHoraInicio: true, dataHoraFim: true },
      }),
      this.prisma.agendamentoCliente.findMany({
        where: {
          funcionariaId,
          status: { notIn: ['CANCELADO'] },
          dataHoraInicio: { gte: inicioDia, lte: fimDia },
        },
        select: { dataHoraInicio: true, dataHoraFim: true },
      }),
    ]);

    const todosAgendamentos = [...agendamentosInternos, ...agendamentosCliente];

    const [hIni, mIni] = horario.horaInicio.split(':').map(Number);
    const [hFim, mFim] = horario.horaFim.split(':').map(Number);

    const inicioExpediente = hIni * 60 + mIni;
    const fimExpediente = hFim * 60 + mFim;
    const duracao = servico.duracaoMinutos;

    const disponiveis: string[] = [];
    const ocupados: string[] = [];

    for (
      let min = inicioExpediente;
      min + duracao <= fimExpediente;
      min += 30
    ) {
      const hh = String(Math.floor(min / 60)).padStart(2, '0');
      const mm = String(min % 60).padStart(2, '0');

      if (horario.inicioAlmoco && horario.fimAlmoco) {
        const [hAlmIni, mAlmIni] = horario.inicioAlmoco.split(':').map(Number);
        const [hAlmFim, mAlmFim] = horario.fimAlmoco.split(':').map(Number);
        const almocIni = hAlmIni * 60 + mAlmIni;
        const almocFim = hAlmFim * 60 + mAlmFim;
        const slotFimMin = min + duracao;

        if (min < almocFim && slotFimMin > almocIni) {
          continue;
        }
      }

      const slotInicio = new Date(`${data}T${hh}:${mm}:00-03:00`);
      const slotFim = new Date(slotInicio.getTime() + duracao * 60000);

      const ocupado = todosAgendamentos.some(
        (a) => slotInicio < a.dataHoraFim && slotFim > a.dataHoraInicio,
      );

      if (ocupado) {
        ocupados.push(slotInicio.toISOString());
      } else {
        disponiveis.push(slotInicio.toISOString());
      }
    }

    return { disponiveis, ocupados };
  }

  // ─── AGENDAMENTOS ─────────────────────────────────────────

  async criarAgendamento(clienteId: string, dto: CriarAgendamentoClienteDto) {
    const servico = await this.prisma.servico.findUnique({
      where: { id: dto.servicoId },
    });

    if (!servico) throw new NotFoundException('Serviço não encontrado');

    const dataHoraInicio = new Date(dto.dataHoraInicio);
    const dataHoraFim = new Date(
      dataHoraInicio.getTime() + servico.duracaoMinutos * 60000,
    );

    // verifica conflito
    const conflito = await this.prisma.agendamentoCliente.findFirst({
      where: {
        funcionariaId: dto.funcionariaId,
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
      throw new ConflictException('Horário não disponível');
    }

    return this.prisma.agendamentoCliente.create({
      data: {
        clienteId,
        funcionariaId: dto.funcionariaId,
        servicoId: dto.servicoId,
        dataHoraInicio,
        dataHoraFim,
        observacao: dto.observacao,
      },
      include: {
        funcionaria: { include: { usuario: { select: { nome: true } } } },
        servico: { select: { nome: true, duracaoMinutos: true, preco: true } },
      },
    });
  }

  async meusAgendamentos(clienteId: string) {
    return this.prisma.agendamentoCliente.findMany({
      where: { clienteId },
      orderBy: { dataHoraInicio: 'desc' },
      include: {
        funcionaria: { include: { usuario: { select: { nome: true } } } },
        servico: { select: { nome: true, duracaoMinutos: true, preco: true } },
      },
    });
  }

  async cancelarAgendamento(agendamentoId: string, clienteId: string) {
    const agendamento = await this.prisma.agendamentoCliente.findUnique({
      where: { id: agendamentoId },
    });

    if (!agendamento || agendamento.clienteId !== clienteId) {
      throw new NotFoundException('Agendamento não encontrado');
    }

    return this.prisma.agendamentoCliente.update({
      where: { id: agendamentoId },
      data: { status: 'CANCELADO' },
    });
  }
}
