import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Universidad } from '../models/universidad.model';

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  count?: number;
}

@Injectable({
  providedIn: 'root'
})
export class UniversidadService {
  private apiUrl = `${environment.apiUrl}/universidades`;  // /api/universidades

  constructor(private http: HttpClient) {}

  // GET /api/universidades - Listar todas
  getAll(): Observable<ApiResponse<Universidad[]>> {
    return this.http.get<ApiResponse<Universidad[]>>(this.apiUrl)
      .pipe(catchError(this.handleError));
  }

  // GET /api/universidades/:id - Obtener por ID
  getById(id: number): Observable<ApiResponse<Universidad>> {
    return this.http.get<ApiResponse<Universidad>>(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }

  // POST /api/universidades - Crear
  create(universidad: Partial<Universidad>): Observable<ApiResponse<Universidad>> {
    return this.http.post<ApiResponse<Universidad>>(this.apiUrl, universidad)
      .pipe(catchError(this.handleError));
  }

  // PUT /api/universidades/:id - Actualizar
  update(id: number, universidad: Partial<Universidad>): Observable<ApiResponse<Universidad>> {
    return this.http.put<ApiResponse<Universidad>>(`${this.apiUrl}/${id}`, universidad)
      .pipe(catchError(this.handleError));
  }

  // DELETE /api/universidades/:id - Eliminar
  delete(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }

  private handleError(error: any) {
    console.error('Error en universidad service:', error);
    return throwError(() => error);
  }
}