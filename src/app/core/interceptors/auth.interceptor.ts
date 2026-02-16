import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  console.log('✅ Interceptor funcionando - URL:', req.url);
  
  const token = localStorage.getItem('auth_token');
  
  // Headers base
  let headers: any = {
    'ngrok-skip-browser-warning': 'true',
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
    console.log('🔑 Token añadido');
  }
  
  // Clonar request con headers
  const authReq = req.clone({
    setHeaders: headers
  });
  
  return next(authReq).pipe(
    catchError((error) => {
      console.error('Error en petición:', error);
      if (error.status === 401) {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
        window.location.href = '/auth/login';
      }
      return throwError(() => error);
    })
  );
};