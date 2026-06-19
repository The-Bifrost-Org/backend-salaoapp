import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CloudinaryService,
  UploadFile,
} from '../cloudinary/cloudinary.service';

@Injectable()
export class ConfiguracoesService {
  constructor(
    private prisma: PrismaService,
    private cloudinary: CloudinaryService,
  ) {}

  async buscar() {
    let config = await this.prisma.configuracaoSalao.findFirst();

    // cria configuração padrão se não existir
    if (!config) {
      config = await this.prisma.configuracaoSalao.create({
        data: { nomeSalao: 'SalãoApp' },
      });
    }

    return config;
  }

  async atualizar(dados: {
    nomeSalao?: string;
    telefone?: string;
    endereco?: string;
    cidade?: string;
  }) {
    const config = await this.buscar();

    return this.prisma.configuracaoSalao.update({
      where: { id: config.id },
      data: dados,
    });
  }

  async uploadLogo(file: UploadFile) {
    const config = await this.buscar();

    const url = await this.cloudinary.uploadImagem(file, 'logo');

    return this.prisma.configuracaoSalao.update({
      where: { id: config.id },
      data: { logoUrl: url },
    });
  }
}
