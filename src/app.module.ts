import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { FuncionariasModule } from './funcionarias/funcionarias.module';
import { ServicosModule } from './servicos/servicos.module';
import { ClientesModule } from './clientes/clientes.module';
import { AgendamentosModule } from './agendamentos/agendamentos.module';
import { PublicoModule } from './publico/publico.module';
import { ConfiguracoesModule } from './configuracoes/configuracoes.module';
import { GaleriaModule } from './galeria/galeria.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    FuncionariasModule,
    ServicosModule,
    ClientesModule,
    AgendamentosModule,
    PublicoModule,
    ConfiguracoesModule,
    GaleriaModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
