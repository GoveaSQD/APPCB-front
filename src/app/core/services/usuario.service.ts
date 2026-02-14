import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Usuario, ApiResponse } from '../models/usuario.model';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private apiUrl = `${environment.apiUrl}/usuarios`;  // /api/usuarios

  constructor(private http: HttpClient) {}

  // GET /api/usuarios - Listar todos
  getAll(): Observable<ApiResponse & { data: Usuario[] }> {
    return this.http.get<ApiResponse & { data: Usuario[] }>(this.apiUrl)
      .pipe(catchError(this.handleError));
  }

  // GET /api/usuarios/:id - Obtener por ID
  getById(id: number): Observable<ApiResponse & { data: Usuario }> {
    return this.http.get<ApiResponse & { data: Usuario }>(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }

  // PUT /api/usuarios/:id - Actualizar
  update(id: number, usuario: Partial<Usuario>): Observable<ApiResponse & { data: Usuario }> {
    return this.http.put<ApiResponse & { data: Usuario }>(`${this.apiUrl}/${id}`, usuario)
      .pipe(catchError(this.handleError));
  }

  // DELETE /api/usuarios/:id - Eliminar
  delete(id: number): Observable<ApiResponse> {
    return this.http.delete<ApiResponse>(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }

  private handleError(error: any) {
    console.error('Error en usuario service:', error);
    return throwError(() => error);
  }
}