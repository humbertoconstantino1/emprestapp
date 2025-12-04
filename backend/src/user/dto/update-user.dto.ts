export class UpdateUserDto {
  name?: string;
  photo?: string;
}

export class ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
}

