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

// TODO: мб потом надо
// @ApiProperty({
//   example: 'vdas32-asdasd-213asd-23-sd',
//   description: 'Ссылка подтверждения',
// })
// @IsOptional()
// @IsString({ message: 'Должно быть строкой' })
// activationLink?: string;

// TODO: вынести в оркестратор на едпоинт регистрации
// @ApiProperty({
//   example: 'pass123',
//   description: 'Пароль пользователя',
//   minLength: 6,
//   maxLength: 16,
// })
// @IsString({ message: 'Должно быть строкой' })
// @Length(6, 16, {
//   message: 'Длинна пароля должна быть не меньше 6 и не больше 16',
// })
// password: string;
