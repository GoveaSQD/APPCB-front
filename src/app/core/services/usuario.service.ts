import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Usuario } from '../models/usuario.model';

// Definición local temporal para evitar errores
export interface ApiResponseAny {
  success: boolean;
  message?: string;
  data?: any;
  count?: number;
}

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private apiUrl = `${environment.apiUrl}/usuarios`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<ApiResponseAny> {
    return this.http.get<ApiResponseAny>(this.apiUrl)
      .pipe(catchError(this.handleError));
  }

  getById(id: number): Observable<ApiResponseAny> {
    return this.http.get<ApiResponseAny>(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }

  update(id: number, usuario: Partial<Usuario>): Observable<ApiResponseAny> {
    return this.http.put<ApiResponseAny>(`${this.apiUrl}/${id}`, usuario)
      .pipe(catchError(this.handleError));
  }

  delete(id: number): Observable<ApiResponseAny> {
    return this.http.delete<ApiResponseAny>(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }

  private handleError(error: any) {
    console.error('Error en usuario service:', error);
    return throwError(() => error);
  }
}