import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AnioService {
  private anioSubject = new BehaviorSubject<number>(new Date().getFullYear());
  anio$ = this.anioSubject.asObservable();

  getAnioActual(): number {
    return this.anioSubject.value;
  }

  setAnio(anio: number): void {
    this.anioSubject.next(anio);
  }

  getAniosDisponibles(): number[] {
    const anioActual = new Date().getFullYear();
    const anios = [];
    for (let i = anioActual - 3; i <= anioActual + 2; i++) {
      anios.push(i);
    }
    return anios;
  }
}