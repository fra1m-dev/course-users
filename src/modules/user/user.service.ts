import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from './entities/user.entity';
import { CreateUserDto } from './dto/createUser.dto';
import { UpdateUserDto } from './dto/updateUser.dto';
import { DeleteUserDto } from './dto/deleteUser.dto';
import { UserListItemDto } from './dto/userListItem.dto';
import { JwtPayload, Role } from '@fra1m-dev/contracts-auth';
import { AuthUserDto } from './dto/authUser.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
  ) {}

  private async validateNewUser(email: string) {
    const candidate = await this.getUserByEmail(email);

    if (candidate) {
      throw new HttpException(
        'Пользователь с таким email существует!',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
  private toListItem(u: UserEntity) {
    // Форма, совместимая с IUserListItem на фронте (без пароля)
    const { id, email, name, role } = u;
    return { id, email, name, role } as const;
  }

  async getAllUsers(user: JwtPayload): Promise<UserListItemDto[]> {
    // Если у password стоит select:false — переключитесь на QB и .addSelect('u.password')
    const users = await this.userRepository.find({
      select: ['id', 'name', 'role', 'email'],
      order: { id: 'ASC' },
    });

    return users.map<UserListItemDto>((u) => {
      // email админам показываем ТОЛЬКО если это сам запрашивающий админ
      const emailForRole =
        u.role === Role.ADMIN && u.id !== Number(user.id) ? '' : u.email;

      // пароль отдаём только для role=user (и это будет хэш, если храните хэш)
      if (u.role === Role.USER) {
        return {
          id: u.id,
          name: u.name,
          role: u.role,
          email: emailForRole,
        };
      }

      // для остальных ролей — без пароля
      return {
        id: u.id,
        name: u.name,
        role: u.role,
        email: emailForRole,
      };
    });
  }

  async deleteUserById(dto: DeleteUserDto) {
    const user = await this.userRepository.findOne({
      where: { id: dto.id },
    });
    if (!user) throw new NotFoundException('Пользователь не найден');

    return { message: `Пользователь с ID ${dto.id} удалён.` };
  }

  async getUserByEmail(email: string) {
    const user = await this.userRepository.findOne({
      where: { email },
    });
    return user;
  }

  async getUserById(userId: number) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new HttpException(
        'Пользователь не найден!',
        HttpStatus.BAD_REQUEST,
      );
    }
    return user;
  }

  isUser(user: UserEntity) {
    return user.role === Role.USER ? user : null;
  }

  async createUser(createUserDto: CreateUserDto) {
    await this.validateNewUser(createUserDto.email);

    const user = await this.userRepository.save(createUserDto);

    return user;
  }

  async authUser(authUserDto: AuthUserDto) {
    const candidate = await this.getUserByEmail(authUserDto.email);

    if (!candidate) {
      throw new HttpException(
        'Пользователь с таким email не существует',
        HttpStatus.BAD_REQUEST,
      );
    }

    //FIXME: Исправить авторизацию - костыль, правильное решение ниже
    const user = this.isUser(candidate) ?? '';
    // TODO: (АВТОРИЗАЦИЯ): убрать генерацию токена и проверку пароля - это в микросервис auth
    // (await this.authService.auth(authUserDto, candidate));
    // const tokens = await this.authService.generateToken(candidate);
    // await this.authService.saveToken(user ?? candidate, tokens.refreshToken);

    return { user };
  }

  async updateUser(userId: number, dto: UpdateUserDto) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('Пользователь не найден');

    // Разрешённые поля — имя, роль (если уже проверено), возможно email (с пересчётом emailLower)
    if (dto.name !== undefined) {
      const name = dto.name.trim();
      if (name.length < 2 || name.length > 50) {
        throw new BadRequestException('Имя: от 2 до 50 символов');
      }
      user.name = name;
    }

    if (dto.email !== undefined) {
      const email = dto.email.trim();
      if (!email) throw new BadRequestException('Email пуст');
      user.email = email;
    }

    if (dto.role !== undefined) {
      user.role = dto.role;
    }

    try {
      const saved = await this.userRepository.save(user);
      // можно эмитить user.updated
      return this.toListItem(saved);
    } catch (e: any) {
      if (e?.code === '23505') {
        throw new BadRequestException('Email уже занят');
      }
      throw e;
    }
  }
  //TODO: Добавить обновление имени/email и тд
  //   // Нечего обновлять?
  //   if (
  //     updateUserDto.role === undefined &&
  //     updateUserDto.specializationId === undefined
  //   ) {
  //     throw new BadRequestException('Нет полей для обновления');
  //   }

  //   // Имя — всем можно править себя, админ — любого
  //   // if (updateUserDto.name !== undefined) {
  //   //   const name = updateUserDto.name.trim();
  //   //   if (name.length < 2 || name.length > 50) {
  //   //     throw new BadRequestException('Имя: от 2 до 50 символов');
  //   //   }
  //   //   user.name = name;
  //   // }

  //   // Роль — только админ
  //   if (updateUserDto.role !== undefined) {
  //     if (!isAdmin) {
  //       throw new ForbiddenException('Недостаточно прав для смены роли');
  //     }
  //     user.role = updateUserDto.role;
  //   }
}
