import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface User {
  id: number;
  email: string;
  name: string;
  photo?: string;
  meta?: number;
}

export interface UpdateUserDto {
  name?: string;
  photo?: string;
}

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
}

@Injectable({
  providedIn: 'root',
})
export class UserService {
  constructor(private api: ApiService) {}

  getMe(): Observable<User> {
    return this.api.get<User>('/users/me');
  }

  updateMe(data: UpdateUserDto): Observable<User> {
    return this.api.put<User>('/users/me', data);
  }

  changePassword(data: ChangePasswordDto): Observable<{ message: string }> {
    return this.api.post<{ message: string }>('/users/me/change-password', data);
  }
}

