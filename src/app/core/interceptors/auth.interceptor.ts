import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.authService.getToken();
    
    // Excluir rutas públicas si es necesario
    const isPublicRoute = req.url.includes('/auth/login') || req.url.includes('/auth/register');
    
    if (token && !isPublicRoute) {
      req = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }

    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          // Token expirado o inválido
          this.authService.logout();
          this.router.navigate(['/auth/login'], {
            queryParams: { session: 'expired' }
          });
        }
        
        // Error 403 - Prohibido (sin permisos)
        if (error.status === 403) {
          this.router.navigate(['/dashboard']);
        }
        
        return throwError(() => error);
      })
    );
  }
}