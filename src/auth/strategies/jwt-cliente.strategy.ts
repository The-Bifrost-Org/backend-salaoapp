import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class JwtClienteStrategy extends PassportStrategy(
  Strategy,
  'jwt-cliente',
) {
  constructor(
    private config: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('JWT_SECRET')!,
    });
  }

  async validate(payload: any) {
    const cliente = await this.prisma.clienteAuth.findUnique({
      where: { id: payload.sub },
      select: { id: true, email: true, nome: true, ativo: true },
    });

    if (!cliente || !cliente.ativo) {
      throw new UnauthorizedException('Cliente inativo ou não encontrado');
    }

    return cliente;
  }
}
