import { Role } from '@fra1m-dev/contracts-auth';
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

// import { Role } from '../entities/user.entity';

export class CreateUserDto {
  @ApiProperty({
    example: 'user_uf3h4u@example.com',
    description: 'Почта пользователя',
  })
  @IsString({ message: 'Должно быть строкой' })
  @IsEmail({}, { message: 'Не корректный email' })
  email: string;

  @ApiProperty({ example: 'Антон', description: 'Имя пользователя' })
  @IsString({ message: 'Должно быть строкой' })
  name: string;

  @ApiProperty({
    enum: Role,
    example: Role.USER,
    description: 'Роль пользователя',
  })
  @IsString({ message: 'Должно быть строкой' })
  role: Role;
}
