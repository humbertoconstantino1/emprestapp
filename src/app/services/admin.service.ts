import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface AdminUser {
  id: number;
  email: string;
  name: string;
  photo?: string;
  blocked: boolean;
  loans?: any[];
}

export interface AdminResetPasswordDto {
  userId: number;
  newPassword: string;
}

export interface AdminUpdateUserDto {
  name?: string;
  photo?: string;
  blocked?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  constructor(private api: ApiService) {}

  getAllUsers(): Observable<AdminUser[]> {
    return this.api.get<AdminUser[]>('/users/admin/all');
  }

  getUserById(id: number): Observable<AdminUser> {
    return this.api.get<AdminUser>(`/users/admin/${id}`);
  }

  resetPassword(userId: number, newPassword: string): Observable<{ message: string }> {
    return this.api.post<{ message: string }>('/users/admin/reset-password', {
      userId,
      newPassword,
    });
  }

  updateUser(userId: number, data: AdminUpdateUserDto): Observable<AdminUser> {
    return this.api.put<AdminUser>(`/users/admin/${userId}`, data);
  }
}

