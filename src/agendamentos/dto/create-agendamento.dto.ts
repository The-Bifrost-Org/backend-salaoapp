import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateAgendamentoDto {
  @IsString()
  @IsNotEmpty({ message: 'Cliente é obrigatório' })
  clienteId: string;

  @IsString()
  @IsNotEmpty({ message: 'Funcionária é obrigatória' })
  funcionariaId: string;

  @IsString()
  @IsNotEmpty({ message: 'Serviço é obrigatório' })
  servicoId: string;

  @IsDateString({}, { message: 'Data/hora de início inválida' })
  @IsNotEmpty({ message: 'Data/hora de início é obrigatória' })
  dataHoraInicio: string;

  @IsString()
  @IsOptional()
  observacao?: string;
}
