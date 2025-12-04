export class UpdateUserDto {
  name?: string;
  photo?: string;
}

export class ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
}

export class AdminResetPasswordDto {
  userId: number;
  newPassword: string;
}

export class AdminUpdateUserDto {
  name?: string;
  photo?: string;
  blocked?: boolean;
}

