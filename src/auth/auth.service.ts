import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  // chamado pela LocalStrategy
  async validarCredenciais(email: string, senha: string) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { email },
    });

    if (!usuario || !usuario.ativo) return null;

    const senhaValida = await bcrypt.compare(senha, usuario.senhaHash);
    if (!senhaValida) return null;

    return usuario;
  }

  // chamado pelo controller após LocalStrategy validar
  async login(usuario: any) {
    const payload = {
      sub: usuario.id,
      email: usuario.email,
      role: usuario.role,
    };

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

  async refresh(refreshToken: string) {
    try {
      const payload = this.jwt.verify(refreshToken, {
        secret: this.config.get('JWT_REFRESH_SECRET'),
      });

      const usuario = await this.prisma.usuario.findUnique({
        where: { id: payload.sub },
        select: { id: true, email: true, role: true, ativo: true },
      });

      if (!usuario || !usuario.ativo) {
        throw new UnauthorizedException('Usuário inativo ou não encontrado');
      }

      const newPayload = {
        sub: usuario.id,
        email: usuario.email,
        role: usuario.role,
      };

      const accessToken = this.jwt.sign(newPayload, {
        secret: this.config.get('JWT_SECRET'),
        expiresIn: this.config.get('JWT_EXPIRES_IN'),
      });

      return { accessToken };
    } catch {
      throw new UnauthorizedException('Refresh token inválido ou expirado');
    }
  }
}
