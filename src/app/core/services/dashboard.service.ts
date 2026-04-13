import { Injectable } from '@angular/core';
import { Observable, forkJoin, map, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { BecadoService } from './becado.service';
import { UniversidadService } from './universidad.service';
import { ModalidadService } from './modalidad.service';

export interface DashboardStats {
  bolsaTotal: number;
  erogadoTotal: number;
  pendienteTotal: number;
  perdidoInactivos: number;
  totalBecados: number;
  totalUniversidades: number;
  totalModalidades: number;
  becadosActivos: number;
  becadosInactivos: number;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  constructor(
    private becadoService: BecadoService,
    private universidadService: UniversidadService,
    private modalidadService: ModalidadService
  ) {}

  
  getDashboardStats(): Observable<DashboardStats> {
    return forkJoin({
      becados: this.becadoService.getAll().pipe(catchError(() => of({ data: [] }))),
      universidades: this.universidadService.getAll().pipe(catchError(() => of({ data: [] }))),
      modalidades: this.modalidadService.getAll().pipe(catchError(() => of({ data: [] })))
    }).pipe(
      map(({ becados, universidades, modalidades }) => {
        const becadosData = (becados as any).data || [];
        const universidadesData = (universidades as any).data || [];
        const modalidadesData = (modalidades as any).data || [];

        const activos = becadosData.filter((b: any) => b.estatus === true);
        const inactivos = becadosData.filter((b: any) => b.estatus === false);

        const bolsaTotal = becadosData.reduce((sum: number, b: any) => sum + (b.monto_autorizado || 0), 0);
        const erogadoTotal = becadosData.reduce((sum: number, b: any) => sum + (b.erogado || 0), 0);
        const pendienteTotal = bolsaTotal - erogadoTotal;
        
        const perdidoInactivos = inactivos.reduce((sum: number, b: any) => {
          return sum + ((b.monto_autorizado || 0) - (b.erogado || 0));
        }, 0);

        return {
          bolsaTotal,
          erogadoTotal,
          pendienteTotal,
          perdidoInactivos,
          totalBecados: becadosData.length,
          totalUniversidades: universidadesData.length,
          totalModalidades: modalidadesData.length,
          becadosActivos: activos.length,
          becadosInactivos: inactivos.length
        };
      })
    );
  }
}