import { Injectable } from '@angular/core';
import { Observable, of, map } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ModalidadService } from './modalidad.service';

export interface DashboardStats {
  totalBecados: number;
  totalUniversidades: number;
  totalModalidades: number;
  totalUsuarios: number;
  becadosActivos: number;
  universidadesPorPais: { pais: string; cantidad: number }[];
  ultimosBecados: any[];
  loading: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  constructor(
    private modalidadService: ModalidadService
  ) {}

  getDashboardStats(): Observable<DashboardStats> {
    // Por ahora solo obtenemos modalidades, el resto en 0
    return this.modalidadService.getAll().pipe(
      map((response) => {
        const modalidadesData = response.data || [];
        
        return {
          totalBecados: 0,
          totalUniversidades: 0,
          totalModalidades: modalidadesData.length,
          totalUsuarios: 0,
          becadosActivos: 0,
          universidadesPorPais: [],
          ultimosBecados: [],
          loading: false
        };
      }),
      catchError(() => of({
        totalBecados: 0,
        totalUniversidades: 0,
        totalModalidades: 0,
        totalUsuarios: 0,
        becadosActivos: 0,
        universidadesPorPais: [],
        ultimosBecados: [],
        loading: false
      }))
    );
  }
}