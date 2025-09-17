import { IsInt, IsOptional, IsString, Min } from 'class-validator';
import { Role } from '@fra1m-dev/contracts-auth';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiPropertyOptional({
    example: Role.USER,
    description: 'Роль пользователя (опционально)',
  })
  @IsString({ message: 'Должно быть строкой' })
  @IsOptional()
  role?: Role;

  @ApiPropertyOptional({
    example: 'Антон',
    description: 'Имя пользователя (опционально)',
  })
  @IsString({ message: 'Должно быть строкой' })
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({
    example: 'example@asd.com',
    description: 'Почта пользователя (опционально)',
  })
  @IsString({ message: 'Должно быть строкой' })
  @IsOptional()
  email: string;

  @ApiPropertyOptional({
    example: 3,
    description: 'ID специализации (опционально)',
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  specializationId?: number;
}
