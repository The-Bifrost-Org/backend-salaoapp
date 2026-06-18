import { IsDateString, IsOptional, IsString } from 'class-validator';

export class UpdateAgendamentoDto {
  @IsString()
  @IsOptional()
  clienteId?: string;

  @IsString()
  @IsOptional()
  funcionariaId?: string;

  @IsString()
  @IsOptional()
  servicoId?: string;

  @IsDateString({}, { message: 'Data/hora de início inválida' })
  @IsOptional()
  dataHoraInicio?: string;

  @IsString()
  @IsOptional()
  observacao?: string;
}
