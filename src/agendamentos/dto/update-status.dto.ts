import { IsEnum, IsNotEmpty } from 'class-validator';
import { StatusAgendamento } from '@prisma/client';

export class UpdateStatusDto {
  @IsEnum(StatusAgendamento, { message: 'Status inválido' })
  @IsNotEmpty({ message: 'Status é obrigatório' })
  status: StatusAgendamento;
}
