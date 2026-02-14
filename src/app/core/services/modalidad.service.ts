import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Modalidad } from '../models/modalidad.model';

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  count?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ModalidadService {
  private apiUrl = `${environment.apiUrl}/modalidades`;  // /api/modalidades

  constructor(private http: HttpClient) {}

  // GET /api/modalidades - Listar todas
  getAll(): Observable<ApiResponse<Modalidad[]>> {
    return this.http.get<ApiResponse<Modalidad[]>>(this.apiUrl)
      .pipe(catchError(this.handleError));
  }

  // GET /api/modalidades/:id - Obtener por ID
  getById(id: number): Observable<ApiResponse<Modalidad>> {
    return this.http.get<ApiResponse<Modalidad>>(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }

  // POST /api/modalidades - Crear
  create(modalidad: Partial<Modalidad>): Observable<ApiResponse<Modalidad>> {
    return this.http.post<ApiResponse<Modalidad>>(this.apiUrl, modalidad)
      .pipe(catchError(this.handleError));
  }

  // PUT /api/modalidades/:id - Actualizar
  update(id: number, modalidad: Partial<Modalidad>): Observable<ApiResponse<Modalidad>> {
    return this.http.put<ApiResponse<Modalidad>>(`${this.apiUrl}/${id}`, modalidad)
      .pipe(catchError(this.handleError));
  }

  // DELETE /api/modalidades/:id - Eliminar
  delete(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }

  private handleError(error: any) {
    console.error('Error en modalidad service:', error);
    return throwError(() => error);
  }
}