import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Modalidad } from '../models/modalidad.model';

@Injectable({
  providedIn: 'root'
})
export class ModalidadService {
  private apiUrl = `${environment.apiUrl}/modalidades`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Modalidad[]> {
    return this.http.get<Modalidad[]>(this.apiUrl);
  }

  getById(id: number): Observable<Modalidad> {
    return this.http.get<Modalidad>(`${this.apiUrl}/${id}`);
  }

  create(modalidad: Modalidad): Observable<Modalidad> {
    return this.http.post<Modalidad>(this.apiUrl, modalidad);
  }

  update(id: number, modalidad: Modalidad): Observable<Modalidad> {
    return this.http.put<Modalidad>(`${this.apiUrl}/${id}`, modalidad);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}