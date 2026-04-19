import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Usuario, ApiResponse, RegisterRequest } from '../models/usuario.model';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private apiUrl = `${environment.apiUrl}/usuarios`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<ApiResponse<Usuario[]>> {
    return this.http.get<ApiResponse<Usuario[]>>(this.apiUrl)
      .pipe(catchError(this.handleError));
  }

  getById(id: number): Observable<ApiResponse<Usuario>> {
    return this.http.get<ApiResponse<Usuario>>(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }

  create(usuario: RegisterRequest): Observable<ApiResponse<Usuario>> {
    return this.http.post<ApiResponse<Usuario>>(this.apiUrl, usuario)
      .pipe(catchError(this.handleError));
  }

  update(id: number, usuario: Partial<Usuario>): Observable<ApiResponse<Usuario>> {
    return this.http.put<ApiResponse<Usuario>>(`${this.apiUrl}/${id}`, usuario)
      .pipe(catchError(this.handleError));
  }

  delete(id: number): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }

  cambiarEstado(id: number, activo: boolean): Observable<ApiResponse<any>> {
    return this.http.patch<ApiResponse<any>>(`${this.apiUrl}/${id}/estado`, { activo })
      .pipe(catchError(this.handleError));
  }

  private handleError(error: any) {
    console.error('Error en usuario service:', error);
    return throwError(() => error);
  }
}