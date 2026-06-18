import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Min,
} from 'class-validator';

export class UpdateServicoDto {
  @IsString()
  @IsOptional()
  nome?: string;

  @IsString()
  @IsOptional()
  descricao?: string;

  @IsNumber()
  @IsPositive()
  @Min(1)
  @IsOptional()
  duracaoMinutos?: number;

  @IsNumber()
  @IsPositive()
  @IsOptional()
  preco?: number;

  @IsBoolean()
  @IsOptional()
  ativo?: boolean;
}
