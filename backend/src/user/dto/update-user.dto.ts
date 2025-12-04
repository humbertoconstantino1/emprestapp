export class UpdateUserDto {
  name?: string;
  photo?: string;
  meta?: number;
}

export class ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
}

