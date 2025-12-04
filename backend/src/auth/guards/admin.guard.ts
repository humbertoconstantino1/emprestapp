import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.email) {
      return false;
    }

    // Apenas o email específico tem acesso admin
    // O email já vem no payload do JWT
    return user.email === 'humbertoconstantino73@gmail.com';
  }
}

