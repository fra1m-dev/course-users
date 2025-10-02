import { Controller } from '@nestjs/common';
import { MessagePattern, Payload, RpcException } from '@nestjs/microservices';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/createUser.dto';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { USERS_PATTERNS } from 'src/contracts/auth.patterns';
import { AuthUserDto } from './dto/authUser.dto';
// import { DeleteUserDto } from './dto/deleteUser.dto';
// import { UpdateUserDto } from './dto/updateUser.dto';

@Controller()
export class UserController {
  constructor(
    @InjectPinoLogger(UserController.name) private readonly logger: PinoLogger,
    private readonly userService: UserService,
  ) {}

  @MessagePattern(USERS_PATTERNS.USERS_GET_BY_EMAIL)
  async getByEmail(
    @Payload() data: { meta: { requestId: string }; authUserDto: AuthUserDto },
  ) {
    this.logger.info(
      {
        rid: data.meta?.requestId,
        dto: { ...data.authUserDto },
      },
      `${USERS_PATTERNS.USERS_GET_BY_EMAIL} received`,
    );

    try {
      const user = await this.userService.getUserByEmail(
        data.authUserDto.email,
      );
      return user;
    } catch (e: any) {
      this.logger.error(
        { rid: data.meta?.requestId, err: e },
        `${USERS_PATTERNS.USERS_GET_BY_EMAIL} failed`,
      );
      throw new RpcException({ message: e?.message ?? 'Get user failed' });
    }
  }

  @MessagePattern(USERS_PATTERNS.USERS_CREATE)
  async create(
    @Payload()
    data: {
      meta: { requestId: string };
      createUserDto: CreateUserDto;
    },
  ) {
    this.logger.info(
      {
        rid: data.meta?.requestId,
        dto: { ...data.createUserDto, password: '[REDACTED]' },
      },
      `${USERS_PATTERNS.USERS_CREATE} received`,
    );

    try {
      // data.createUserDto.role = Role.USER;
      const user = await this.userService.createUser(data.createUserDto);

      return user;
    } catch (e: any) {
      this.logger.error(
        { rid: data.meta?.requestId, err: e },
        `${USERS_PATTERNS.USERS_CREATE} failed`,
      );
      throw new RpcException({ message: e?.message ?? 'Create users failed' });
    }
  }

  // @MessagePattern('user.update') update(
  //   @Payload() { id, ...dto }: { id: number } & UpdateUserDto,
  // ) {
  //   return this.userService.updateUser(id, dto);
  // }

  // @MessagePattern('user.delete') del(@Payload() dto: DeleteUserDto) {
  //   return this.userService.deleteUserById(dto);
  // }

  // @MessagePattern('user.by_id') byId(@Payload() id: number) {
  //   return this.userService.getUserById(id);
  // }

  // @MessagePattern('user.by_email') byEmail(@Payload() email: string) {
  //   return this.userService.getUserByEmail(email);
  // }

  //TODO: Добавить пагинацию и исправить getAllUsers
  // @MessagePattern('user.list') list(
  //   @Payload() p: { limit?: number; offset?: number },
  // ) {
  //   return this.userService.getAllUsers(p);
  // }
}
