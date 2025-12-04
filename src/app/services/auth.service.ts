import { Injectable, NgZone } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  user: {
    id: number;
    email: string;
    name: string;
  };
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly API_URL = 'https://api.emprestapp.cloud';
  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'auth_user';

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(
    this.hasToken()
  );
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router,
    private ngZone: NgZone
  ) {}

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${this.API_URL}/auth/login`, credentials)
      .pipe(
        tap((response) => {
          this.setToken(response.access_token);
          this.setUser(response.user);
          this.isAuthenticatedSubject.next(true);
        })
      );
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.isAuthenticatedSubject.next(false);
    this.ngZone.run(() => {
      this.router.navigateByUrl('/login', { replaceUrl: true });
    });
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  isAdmin(): boolean {
    const user = this.getUser();
    if (!user || !user.email) {
      return false;
    }
    // Comparação case-insensitive para garantir que funcione
    return user.email.toLowerCase() === 'humbertoconstantino73@gmail.com';
  }

  getUser(): any {
    const user = localStorage.getItem(this.USER_KEY);
    if (!user || user === 'undefined' || user === 'null') {
      return null;
    }
    try {
      return JSON.parse(user);
    } catch {
      return null;
    }
  }

  isAuthenticated(): boolean {
    return this.hasToken();
  }

  private hasToken(): boolean {
    return !!localStorage.getItem(this.TOKEN_KEY);
  }

  private setToken(token: string): void {
    if (token) {
      localStorage.setItem(this.TOKEN_KEY, token);
    }
  }

  private setUser(user: any): void {
    if (user) {
      localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    }
  }
}
