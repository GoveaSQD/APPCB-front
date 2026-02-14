import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Becado } from '../models/becado.model';

@Injectable({
  providedIn: 'root'
})
export class BecadoService {
  private apiUrl = `${environment.apiUrl}/becados`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Becado[]> {
    return this.http.get<Becado[]>(this.apiUrl);
  }

  getById(id: number): Observable<Becado> {
    return this.http.get<Becado>(`${this.apiUrl}/${id}`);
  }

  create(becado: Becado): Observable<Becado> {
    return this.http.post<Becado>(this.apiUrl, becado);
  }

  update(id: number, becado: Becado): Observable<Becado> {
    return this.http.put<Becado>(`${this.apiUrl}/${id}`, becado);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}