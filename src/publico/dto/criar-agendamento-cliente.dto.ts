import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CriarAgendamentoClienteDto {
  @IsString()
  @IsNotEmpty({ message: 'Funcionária é obrigatória' })
  funcionariaId: string;

  @IsString()
  @IsNotEmpty({ message: 'Serviço é obrigatório' })
  servicoId: string;

  @IsDateString({}, { message: 'Data/hora inválida' })
  @IsNotEmpty({ message: 'Data/hora de início é obrigatória' })
  dataHoraInicio: string;

  @IsString()
  @IsOptional()
  observacao?: string;
}
