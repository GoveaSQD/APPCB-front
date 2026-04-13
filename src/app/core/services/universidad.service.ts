import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Universidad, ApiResponse } from '../models/universidad.model';
import { UNIVERSIDADES_MORELIA } from '../data/universidades-morelia';

@Injectable({
  providedIn: 'root'
})
export class UniversidadService {
  private apiUrl = `${environment.apiUrl}/universidades`;

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

   // NUEVO: Obtener lista de universidades de Morelia
  getUniversidadesMorelia(): string[] {
    return UNIVERSIDADES_MORELIA;
  }

  // NUEVO: Buscar universidades por nombre (para autocompletado)
  buscarUniversidades(query: string): string[] {
  console.log('🔍 Buscando:', query); // Para depuración
  if (!query) return [];
  const queryLower = query.toLowerCase();
  const resultados = UNIVERSIDADES_MORELIA.filter(uni => 
    uni.toLowerCase().includes(queryLower)
  ).slice(0, 10);
  console.log('Resultados:', resultados);
  return resultados;
}

  private handleError(error: any) {
    console.error('Error en universidad service:', error);
    return throwError(() => error);
  }
}