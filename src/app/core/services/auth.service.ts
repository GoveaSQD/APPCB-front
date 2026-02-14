import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, map, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LoginRequest, RegisterRequest, AuthResponse, Usuario, LoginResponse } from '../models/usuario.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;
  private tokenKey = 'auth_token';
  private userKey = 'auth_user';

  constructor(private http: HttpClient) {}

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, credentials).pipe(
      map(response => ({
        success: response.success,
        message: response.message,
        token: response.data.token,
        usuario: response.data.user
      })),
      tap(response => {
        if (response.success && response.token) {
          this.setSession(response);
        }
      }),
      catchError(this.handleError)
    );
  }

  register(userData: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/register`, userData).pipe(
      map(response => ({
        success: response.success,
        message: response.message,
        token: response.data.token,
        usuario: response.data.user
      })),
      tap(response => {
        if (response.success && response.token) {
          this.setSession(response);
        }
      }),
      catchError(this.handleError)
    );
  }

  getProfile(): Observable<{ success: boolean; data: Usuario }> {
    return this.http.get<{ success: boolean; data: Usuario }>(`${this.apiUrl}/profile`).pipe(
      tap(response => {
        if (response.success) {
          localStorage.setItem(this.userKey, JSON.stringify(response.data));
        }
      }),
      catchError(this.handleError)
    );
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
  }

  private setSession(authResult: AuthResponse): void {
    localStorage.setItem(this.tokenKey, authResult.token);
    localStorage.setItem(this.userKey, JSON.stringify(authResult.usuario));
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  getUser(): Usuario | null {
    const userStr = localStorage.getItem(this.userKey);
    return userStr ? JSON.parse(userStr) : null;
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  isAdmin(): boolean {
    const user = this.getUser();
    return user?.rol === 'admin';
  }

  private handleError(error: any) {
    console.error('Error en auth service:', error);
    return throwError(() => error);
  }
}