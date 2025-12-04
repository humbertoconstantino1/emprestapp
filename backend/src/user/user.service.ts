import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import * as bcrypt from 'bcrypt';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(@InjectRepository(User) private repo: Repository<User>) {}

  create(user: Partial<User>) {
    const newUser = this.repo.create(user);
    return this.repo.save(newUser);
  }

  findAll() {
    return this.repo.find({ relations: ['loans'] });
  }

  findOne(id: number) {
    return this.repo.findOne({ where: { id }, relations: ['loans'] });
  }

  findByEmail(email: string) {
    return this.repo.findOne({ where: { email } });
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.findOne(id);
    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    Object.assign(user, updateUserDto);
    const savedUser = await this.repo.save(user);
    const { password, ...result } = savedUser;
    return result;
  }

  async changePassword(
    id: number,
    currentPassword: string,
    newPassword: string,
  ) {
    const user = await this.findOne(id);
    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      throw new BadRequestException('Senha atual incorreta');
    }

    if (newPassword.length < 6) {
      throw new BadRequestException(
        'A nova senha deve ter pelo menos 6 caracteres',
      );
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await this.repo.save(user);

    return { message: 'Senha alterada com sucesso' };
  }
}
