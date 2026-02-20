import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Becado, ApiResponse } from '../models/becado.model';

@Injectable({
  providedIn: 'root'
})
export class BecadoService {
  private apiUrl = `${environment.apiUrl}/becados`;

  constructor(private http: HttpClient) {}

  // GET /api/becados - Listar todos
  getAll(): Observable<ApiResponse<Becado[]>> {
    return this.http.get<ApiResponse<Becado[]>>(this.apiUrl)
      .pipe(
        map(response => {
          // Añadir nombre_completo a cada becado
          if (response.data) {
            response.data = response.data.map(b => ({
              ...b,
              nombre_completo: `${b.apellido_p} ${b.apellido_m || ''} ${b.nombre}`.trim()
            }));
          }
          return response;
        }),
        catchError(this.handleError)
      );
  }

  // GET /api/becados/:id - Obtener por ID
  getById(id: number): Observable<ApiResponse<Becado>> {
    return this.http.get<ApiResponse<Becado>>(`${this.apiUrl}/${id}`)
      .pipe(
        map(response => {
          if (response.data) {
            response.data.nombre_completo = `${response.data.apellido_p} ${response.data.apellido_m || ''} ${response.data.nombre}`.trim();
          }
          return response;
        }),
        catchError(this.handleError)
      );
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