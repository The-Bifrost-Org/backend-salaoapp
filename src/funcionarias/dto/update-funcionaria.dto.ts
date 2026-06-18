import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateFuncionariaDto {
  @IsString()
  @IsOptional()
  nome?: string;

  @IsString()
  @IsOptional()
  telefone?: string;

  @IsString()
  @IsOptional()
  fotoPerfil?: string;

  @IsBoolean()
  @IsOptional()
  ativo?: boolean;
}
