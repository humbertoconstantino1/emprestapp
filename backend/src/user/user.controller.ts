import {
  Controller,
  Get,
  Param,
  Put,
  Post,
  Body,
  UseGuards,
  Request,
  BadRequestException,
} from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdateUserDto, ChangePasswordDto, AdminResetPasswordDto, AdminUpdateUserDto } from './dto/update-user.dto';
import { AdminGuard } from '../auth/guards/admin.guard';

@UseGuards(JwtAuthGuard)
@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  @Get()
  findAll() {
    return this.userService.findAll();
  }

  @Get('me')
  async getMe(@Request() req) {
    const user = await this.userService.findOne(req.user.userId);
    if (!user) {
      throw new BadRequestException('Usuário não encontrado');
    }
    const { password, ...result } = user;
    return result;
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(+id);
  }

  @Put('me')
  async updateMe(@Request() req, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(req.user.userId, updateUserDto);
  }

  @Post('me/change-password')
  async changePassword(
    @Request() req,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    return this.userService.changePassword(
      req.user.userId,
      changePasswordDto.currentPassword,
      changePasswordDto.newPassword,
    );
  }

  // Endpoints administrativos
  @UseGuards(JwtAuthGuard, AdminGuard)
  @Get('admin/all')
  async getAllUsers() {
    return this.userService.findAllUsers();
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Get('admin/:id')
  async getUserById(@Param('id') id: string) {
    return this.userService.findUserById(+id);
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Post('admin/reset-password')
  async adminResetPassword(@Body() resetPasswordDto: AdminResetPasswordDto) {
    return this.userService.adminResetPassword(
      resetPasswordDto.userId,
      resetPasswordDto.newPassword,
    );
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Put('admin/:id')
  async adminUpdateUser(
    @Param('id') id: string,
    @Body() updateUserDto: AdminUpdateUserDto,
  ) {
    return this.userService.adminUpdateUser(+id, updateUserDto);
  }
}
