import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CloudinaryService,
  UploadFile,
} from '../cloudinary/cloudinary.service';

@Injectable()
export class GaleriaService {
  constructor(
    private prisma: PrismaService,
    private cloudinary: CloudinaryService,
  ) {}

  async findAll(categoria?: string) {
    return this.prisma.imagemGaleria.findMany({
      where: categoria ? { categoria } : undefined,
      orderBy: { criadoEm: 'desc' },
    });
  }

  async upload(file: UploadFile, titulo?: string, categoria?: string) {
    const url = await this.cloudinary.uploadImagem(file, 'galeria');

    return this.prisma.imagemGaleria.create({
      data: {
        url,
        titulo: titulo ?? null,
        categoria: categoria ?? 'geral',
      },
    });
  }

  async remove(id: string) {
    const imagem = await this.prisma.imagemGaleria.findUnique({
      where: { id },
    });

    if (!imagem) {
      throw new NotFoundException('Imagem não encontrada');
    }

    await this.cloudinary.deletarImagem(imagem.url);

    return this.prisma.imagemGaleria.delete({
      where: { id },
    });
  }
}
