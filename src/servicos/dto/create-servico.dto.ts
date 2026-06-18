import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsOptional,
  IsPositive,
  Min,
} from 'class-validator';

export class CreateServicoDto {
  @IsString()
  @IsNotEmpty({ message: 'Nome é obrigatório' })
  nome: string;

  @IsString()
  @IsOptional()
  descricao?: string;

  @IsNumber()
  @IsPositive({ message: 'Duração deve ser positiva' })
  @Min(1, { message: 'Duração mínima é 1 minuto' })
  duracaoMinutos: number;

  @IsNumber()
  @IsPositive({ message: 'Preço deve ser positivo' })
  preco: number;
}
