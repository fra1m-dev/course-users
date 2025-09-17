import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/createUser.dto';
import { DeleteUserDto } from './dto/deleteUser.dto';
import { UpdateUserDto } from './dto/updateUser.dto';

@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @MessagePattern('user.create') create(@Payload() dto: CreateUserDto) {
    return this.userService.createUser(dto);
  }

  @MessagePattern('user.update') update(
    @Payload() { id, ...dto }: { id: number } & UpdateUserDto,
  ) {
    return this.userService.updateUser(id, dto);
  }

  @MessagePattern('user.delete') del(@Payload() dto: DeleteUserDto) {
    return this.userService.deleteUserById(dto);
  }

  @MessagePattern('user.by_id') byId(@Payload() id: number) {
    return this.userService.getUserById(id);
  }

  @MessagePattern('user.by_email') byEmail(@Payload() email: string) {
    return this.userService.getUserByEmail(email);
  }

  //FIXME: добавить пагинацию и исправить getAllUsers
  // @MessagePattern('user.list') list(
  //   @Payload() p: { limit?: number; offset?: number },
  // ) {
  //   return this.userService.getAllUsers(p);
  // }
}
