import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Becado } from '../models/becado.model';

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  count?: number;
}

@Injectable({
  providedIn: 'root'
})
export class BecadoService {
  private apiUrl = `${environment.apiUrl}/becados`;  // /api/becados

  constructor(private http: HttpClient) {}

  // GET /api/becados - Listar todos
  getAll(): Observable<ApiResponse<Becado[]>> {
    return this.http.get<ApiResponse<Becado[]>>(this.apiUrl)
      .pipe(catchError(this.handleError));
  }

  // GET /api/becados/:id - Obtener por ID
  getById(id: number): Observable<ApiResponse<Becado>> {
    return this.http.get<ApiResponse<Becado>>(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }

  // POST /api/becados - Crear
  create(becado: Partial<Becado>): Observable<ApiResponse<Becado>> {
    return this.http.post<ApiResponse<Becado>>(this.apiUrl, becado)
      .pipe(catchError(this.handleError));
  }

  // PUT /api/becados/:id - Actualizar
  update(id: number, becado: Partial<Becado>): Observable<ApiResponse<Becado>> {
    return this.http.put<ApiResponse<Becado>>(`${this.apiUrl}/${id}`, becado)
      .pipe(catchError(this.handleError));
  }

  // DELETE /api/becados/:id - Eliminar
  delete(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }

  private handleError(error: any) {
    console.error('Error en becado service:', error);
    return throwError(() => error);
  }
}