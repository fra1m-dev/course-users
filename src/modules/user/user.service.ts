// TODO: убрать JwtPayload - вместо него юзать нужный дто, JwtPayload тольо в оркестраторе. Все запросы через микросервис gateway
// TODO: удалить коммиты
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
// import * as uuid from 'uuid';
// import { UserStatsEntity } from './entities/user-stats.entity';
// import { SpecializationService } from '../specialization/specialization.service';
// import { NotificationsGateway } from '../realtime/notifications.gateway';
import { JwtPayload, Role } from '@fra1m-dev/contracts-auth';
import { AuthUserDto } from './dto/authUser.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    // @InjectRepository(UserStatsEntity)
    // private useruserStatsRepositorysitory: Repository<UserStatsEntity>,
    // private readonly notifications: NotificationsGateway,
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
        //FIXME: исправить костыль - id в JwtPayload на number (библиотека @fra1m-dev)
        u.role === Role.ADMIN && u.id !== Number(user.id) ? '' : u.email;

      // пароль отдаём только для role=user (и это будет хэш, если храните хэш)
      if (u.role === Role.USER) {
        return {
          id: u.id,
          name: u.name,
          role: u.role,
          email: emailForRole,

          //TODO: статус может тут выкидывать, а вот специализация должна быть отдельно, так же пароль для роли user нужно тоже чтобы возращался в своем месте (мб отдельный ендпоинт)
          // stats: u.stats || null,
          // specialization: u.specialization,
        };
      }

      // для остальных ролей — без пароля
      return {
        id: u.id,
        name: u.name,
        role: u.role,
        email: emailForRole,
        // stats: u.stats || null,
        // specialization: u.specialization,
      };
    });
  }

  async deleteUserById(dto: DeleteUserDto) {
    //FIXME: исправить удаление пользователя - сейчас удаляется только из этой БД, а в других микросервисах остаются данные
    const user = await this.userRepository.findOne({
      where: { id: dto.id },
      //FIXME: удалить лишние связи, при удалении пользователя в других микросервиса тоже удалять связанные данные (курсы, попытки и тд)
      // relations: [
      //   'enrolledCourses',
      //   'authoredCourses',
      //   'quizzes',
      //   'token',
      //   'stats',
      // ],
    });
    if (!user) throw new NotFoundException('Пользователь не найден');

    // await this.userRepository.manager.transaction(async (em: EntityManager) => {
    //   // 1) Чистим M2M user_courses через .remove([...ids])
    //   const enrolledIds = (user.enrolledCourses ?? []).map((c) => c.id);
    //   if (enrolledIds.length > 0) {
    //     await em
    //       .createQueryBuilder()
    //       .relation(UserEntity, 'enrolledCourses')
    //       .of(user.id) // владелец связи
    //       .remove(enrolledIds); // удаляем связи с этими курсами
    //   }

    //   // 2) (Опционально) если в CourseEntity у поля teacher НЕ стоит onDelete: 'SET NULL' / CASCADE,
    //   //    и БД не даст удалить пользователя из-за FK — тогда обнуляем teacher:
    //   // await em.getRepository(CourseEntity).update(
    //   //   { teacher: { id: user.id } },
    //   //   { teacher: null },
    //   // );

    //   // 3) Удаляем пользователя. Если на TokenEntity/QuizEntity стоят onDelete: 'CASCADE',
    //   //    БД сама удалит связанные записи; иначе добавьте явные delete().
    //   await em.delete(UserEntity, user.id);
    // });

    return { message: `Пользователь с ID ${dto.id} удалён.` };
  }

  async getUserByEmail(email: string) {
    if (!email) {
      return null;
    }

    const user = await this.userRepository.findOne({
      where: { email },
    });

    return user;
  }
  //FIXME: все что связано со статистикой юзера перенести в отдельный микросервис по статистике
  // async getUserStatsById(userId: number) {
  //   const user = await this.userRepository.findOne({
  //     where: { id: userId },
  //   });

  //   if (!user) {
  //     throw new HttpException(
  //       'Пользователь не найден!',
  //       HttpStatus.BAD_REQUEST,
  //     );
  //   }
  //   return user.stats;
  // }

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
    //FIXME: оставить только нужную логику для этого микросервиса, пароль храниться в микросервисе auth
    await this.validateNewUser(createUserDto.email);

    // if (createUserDto.role !== Role.USER) {
    //   createUserDto.password = await this.authService.hashPassword(
    //     createUserDto.password, // всё по дефолту = 0/null
    //   );
    // }

    const user$ = await this.userRepository.save({
      ...createUserDto,
      //FIXME: добавить в микросервис статистики юзера "пустую статискику" при регистрации пользователя
      // stats: this.useruserStatsRepositorysitory.create({}), // всё по дефолту = 0/null
    });

    // FIXME: (РЕГИСТРАЦИЯ): убрать генерацию токена и хеширование пароля - это в микросервис auth
    // const { password: _, ...user } = user$;
    // const tokens = await this.authService.generateToken(user$);
    // await this.authService.saveToken(user$, tokens.refreshToken);

    return { user$ };
  }

  async authUser(authUserDto: AuthUserDto) {
    const candidate = await this.getUserByEmail(authUserDto.email);

    if (!candidate) {
      throw new HttpException(
        'Пользователь с таким email не существует',
        HttpStatus.BAD_REQUEST,
      );
    }

    // FIXME: костыль, правильное решение ниже
    const user = this.isUser(candidate) ?? '';
    // FIXME: (АВТОРИЗАЦИЯ): убрать генерацию токена и проверку пароля - это в микросервис auth
    // (await this.authService.auth(authUserDto, candidate));

    // const tokens = await this.authService.generateToken(candidate);
    // await this.authService.saveToken(user ?? candidate, tokens.refreshToken);

    return { user };
  }

  //FIXME: удалить логику выхода - это в микросервисе auth
  // async logout(refreshToken: string) {
  //   const token = await this.authService.removeToken(refreshToken);

  //   return token;
  // }

  //FIXME: удалить логику обновления токена - это в микросервисе auth
  // async refresh(refreshToken: string) {
  //   if (!refreshToken) {
  //     throw new HttpException(
  //       'Вам необходимо заново авторизоваться',
  //       HttpStatus.UNAUTHORIZED,
  //     );
  //   }

  //   const userData = await this.authService.validateRefreshToken(refreshToken);
  //   const tokenFromDb = await this.authService.findToken(refreshToken);

  //   if (!userData || !tokenFromDb) {
  //     throw new HttpException(
  //       'Пользователь не авторизован',
  //       HttpStatus.UNAUTHORIZED,
  //     );
  //   }

  //   const user = await this.getUserById(userData.id);

  //   if (!user) {
  //     throw new HttpException(
  //       'Пользователь не существует',
  //       HttpStatus.BAD_REQUEST,
  //     );
  //   }

  //   const tokens = await this.authService.generateToken(user);
  //   await this.authService.saveToken(user, tokens.refreshToken);

  //   return { user, tokens };
  // }

  //FIXME: удалить логику смены пароля - это в микросервисе auth
  // async changePasswordUser(
  //   updateUserDto: ResetPasswordDto,
  //   userJwtf: JwtPayload,
  // ) {
  //   const user = await this.getUserByEmail(userJwtf.email);

  //   if (!user) throw new NotFoundException('Пользователь не найден');

  //   const newPassword = await this.authService.newHashPassword(
  //     user,
  //     updateUserDto.newPassword,
  //     updateUserDto.currentPassword,
  //   );

  //   user.password = newPassword;
  //   user.role = Role.STUDENT;
  //   await this.userRepository.save(user);

  //   return newPassword ? true : false;
  // }

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

  //FIXME: исправить костыль - id в JwtPayload на number (библиотека @fra1m-dev)
  // async updateUser1(updateUserDto: UpdateUserDto, userId: number) {
  //   const user = await this.getUserById(userId);

  //   if (!user) {
  //     throw new NotFoundException('Пользователь не найден');
  //   }

  //   const isAdmin = userJwtf.role === Role.ADMIN;
  //   const isSelf = Number(userJwtf.id) === userId;

  //   // USER может править только себя
  //   if (!isAdmin && !isSelf) {
  //     throw new ForbiddenException('Нельзя редактировать другого пользователя');
  //   }
  //TODO: добавить обновление имени/email и тд
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
  //FIXME: удалить логику смены пароля - это в микросервисе auth
  //   // Пароль
  //   // if (updateUserDto.newPassword !== undefined) {
  //   //   const newPass = updateUserDto.newPassword;

  //   //   if (!isAdmin || isSelf) {
  //   //     // Пользователь меняет свой пароль (или админ меняет СЕБЕ) — требуется currentPassword
  //   //     if (!updateUserDto.currentPassword) {
  //   //       throw new BadRequestException('Требуется текущий пароль');
  //   //     }
  //   //     const ok = await bcrypt.compare(
  //   //       updateUserDto.currentPassword,
  //   //       user.password,
  //   //     );
  //   //     if (!ok) {
  //   //       throw new UnauthorizedException('Старый пароль неверный');
  //   //     }
  //   //   }
  //   //   // Нельзя поставить прежний
  //   //   const same = await bcrypt.compare(newPass, target.password);
  //   //   if (same) {
  //   //     throw new BadRequestException(
  //   //       'Пароль не должен совпадать с предыдущим',
  //   //     );
  //   //   }
  //   //   target.password = await this.hashPassword(newPass);
  //   // }

  //FIXME: удалить специализацию - это в микросервисе специализаций
  //   // const prevSpecId = user.specialization?.id ?? null;

  //   // if (updateUserDto.specializationId !== undefined) {
  //   //   if (!isAdmin)
  //   //     throw new ForbiddenException(
  //   //       'Недостаточно прав для смены специализации',
  //   //     );

  //   //   const spec = await this.specializationService.findSpecById(
  //   //     updateUserDto.specializationId,
  //   //   );
  //   //   if (!spec) throw new BadRequestException('Специализация не найдена');
  //   //   user.specialization = spec;
  //   // }

  //   await this.userRepository.save(user);

  //   // const newSpecId = user.specialization?.id ?? null;
  //   // if (prevSpecId !== newSpecId) {
  //FIXME: удалить нотификации - это в микросервисе веб сокета (нотификаций)
  //   //   this.notifications.notifyUserSpecializationChanged(user.id, newSpecId);
  //   // }

  //   return this.toListItem(user);
  // }

  //FIXME: удалить статистику юзера - это в отдельном микросервисе статистики
  /**
   * Обновить агрегаты статистики пользователя (upsert).
   * averageScore — число 0..100 (мы храним как numeric -> string).
   */
  // async applyQuizStats(
  //   user: UserEntity,
  //   patch: {
  //     quizzesTotal: number;
  //     quizzesPassed: number;
  //     averageScore: number;
  //     lessonsTotal: number;
  //     lessonsCompleted: number;
  //     lastActiveAt?: Date;
  //   },
  // ) {
  //   const stats = await this.getUserStatsById(user.id);

  //   if (!stats) {
  //     user.stats = this.useruserStatsRepositorysitory.create({});
  //   }

  //   stats.quizzesTotal = patch.quizzesTotal;
  //   stats.quizzesPassed = patch.quizzesPassed;
  //   stats.lessonsTotal = patch.lessonsTotal;
  //   stats.lessonsCompleted = patch.lessonsCompleted;

  //   const avg = Math.min(100, Math.max(0, Number(patch.averageScore) || 0));
  //   stats.averageScore = String(Math.round(avg * 100) / 100);

  //   if (patch.lastActiveAt) stats.lastActiveAt = patch.lastActiveAt;

  //   const stats$ = await this.useruserStatsRepositorysitory.save(stats);

  //   return {
  //     quizzesTotal: stats$.quizzesTotal,
  //     quizzesPassed: stats$.quizzesPassed,
  //     averageScore: Number(stats$.averageScore),
  //     coursesEnrolled: stats$.coursesEnrolled,
  //     coursesAuthored: stats$.coursesAuthored,
  //     lessonsTotal: stats$.lessonsTotal,
  //     lessonsCompleted: stats$.lessonsCompleted,
  //     streakDays: stats$.streakDays,
  //     lastActiveAt: stats$.lastActiveAt?.toISOString() ?? null,
  //   };
  // }
}
