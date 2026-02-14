import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Universidad } from '../models/universidad.model';

@Injectable({
  providedIn: 'root'
})
export class UniversidadService {
  private apiUrl = `${environment.apiUrl}/universidades`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Universidad[]> {
    return this.http.get<Universidad[]>(this.apiUrl);
  }

  getById(id: number): Observable<Universidad> {
    return this.http.get<Universidad>(`${this.apiUrl}/${id}`);
  }

  create(universidad: Universidad): Observable<Universidad> {
    return this.http.post<Universidad>(this.apiUrl, universidad);
  }

  update(id: number, universidad: Universidad): Observable<Universidad> {
    return this.http.put<Universidad>(`${this.apiUrl}/${id}`, universidad);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}