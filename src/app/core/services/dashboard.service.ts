// dashboard.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { BecadoService } from './becado.service';
import { UniversidadService } from './universidad.service';
import { ModalidadService } from './modalidad.service';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  constructor(
    private http: HttpClient,
    private becadoService: BecadoService,
    private universidadService: UniversidadService,
    private modalidadService: ModalidadService
  ) {}

  getDashboardStats(): Observable<any> {
    // Obtener todos los datos necesarios en paralelo
    return new Observable((observer) => {
      Promise.all([
        this.becadoService.getAll().toPromise(),
        this.universidadService.getAll().toPromise(),
        this.modalidadService.getAll().toPromise()
      ]).then(([becadosResp, universidadesResp, modalidadesResp]) => {
        const becados = becadosResp?.data || [];
        const universidades = universidadesResp?.data || [];
        const modalidades = modalidadesResp?.data || [];
        
        // Calcular estadísticas
        const becadosActivos = becados.filter((b: any) => b.estatus === 1).length;
        const becadosInactivos = becados.filter((b: any) => b.estatus === 0).length;
        
        const bolsaTotal = becados.reduce((sum: number, b: any) => sum + (Number(b.monto_autorizado) || 0), 0);
        const erogadoTotal = becados.reduce((sum: number, b: any) => sum + (Number(b.erogado) || 0), 0);
        const pendienteTotal = bolsaTotal - erogadoTotal;
        
        // Perdido: solo lo pendiente de los inactivos
        const perdidoInactivos = becados
          .filter((b: any) => b.estatus === 0)
          .reduce((sum: number, b: any) => {
            const pendiente = (Number(b.monto_autorizado) || 0) - (Number(b.erogado) || 0);
            return sum + (pendiente > 0 ? pendiente : 0);
          }, 0);
        
        observer.next({
          bolsaTotal,
          erogadoTotal,
          pendienteTotal,
          perdidoInactivos,
          totalBecados: becados.length,
          totalUniversidades: universidades.length,
          totalModalidades: modalidades.length,
          becadosActivos,
          becadosInactivos
        });
        observer.complete();
      }).catch(error => {
        observer.error(error);
      });
    });
  }
}