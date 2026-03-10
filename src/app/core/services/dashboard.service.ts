import { Injectable } from '@angular/core';
import { Observable, forkJoin, map, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { BecadoService } from './becado.service';
import { UniversidadService } from './universidad.service';
import { ModalidadService } from './modalidad.service';
import { UsuarioService } from './usuario.service';
import { 
  DashboardStats, 
  BecadoResumen, 
  TablaActivos, 
  TablaInactivos, 
  TipoInactivo,
  UniversidadResumen 
} from '../models/dashboard.model'; // ← IMPORTACIÓN CORREGIDA
@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  
  // Tipos de inactivos para clasificación
  private tiposInactivo: TipoInactivo[] = [
    'Renuncia parcial',
    'Renuncia tácita',
    'Baja por terminación',
    'Baja por reporte de universidad'
  ];

  constructor(
    private becadoService: BecadoService,
    private universidadService: UniversidadService,
    private modalidadService: ModalidadService,
    private usuarioService: UsuarioService
  ) {}

  getDashboardStats(): Observable<DashboardStats> {
    return forkJoin({
      becados: this.becadoService.getAll().pipe(catchError(() => of({ data: [] }))),
      universidades: this.universidadService.getAll().pipe(catchError(() => of({ data: [] }))),
      modalidades: this.modalidadService.getAll().pipe(catchError(() => of({ data: [] }))),
      usuarios: this.usuarioService.getAll().pipe(catchError(() => of({ data: [] })))
    }).pipe(
      map(({ becados, universidades, modalidades, usuarios }) => {
        const becadosData = (becados as any).data || [];
        const universidadesData = (universidades as any).data || [];
        const modalidadesData = (modalidades as any).data || [];
        const usuariosData = (usuarios as any).data || [];
        
        // Filtrar activos e inactivos
        const becadosActivos = becadosData.filter((b: any) => b.estatus === true);
        const becadosInactivos = becadosData.filter((b: any) => b.estatus === false);
        
        // Cálculos financieros
        const bolsaTotal = this.calcularBolsaTotal(becadosData);
        const dineroErogado = this.calcularDineroErogado(becadosData);
        const dineroFaltante = bolsaTotal - dineroErogado;
        
        // Calcular faltantes por tipo
        const dineroFaltanteActivos = this.calcularPendienteActivos(becadosActivos);
        const dineroFaltanteInactivos = this.calcularPendienteInactivos(becadosInactivos);
        
        // Últimos becados
        const ultimosBecados = this.obtenerUltimosBecados(becadosData, universidadesData, modalidadesData);
        
        // Universidades de Morelia
        const universidadesMorelia = this.obtenerUniversidadesMorelia(universidadesData, becadosData);
        
        // Gráfica de distribución
        const distribucionEstatus = {
          activos: becadosActivos.length,
          inactivos: becadosInactivos.length
        };
        
        // Datos para gráfica de montos por mes
        const montosPorMes = this.generarMontosPorMes(becadosData);
        
        return {
          totalBecados: becadosData.length,
          totalUniversidades: universidadesData.length,
          totalModalidades: modalidadesData.length,
          totalUsuarios: usuariosData.length,
          becadosActivos: becadosActivos.length,
          becadosInactivos: becadosInactivos.length,
          bolsaTotal,
          dineroErogado,
          dineroFaltante,
          dineroFaltanteActivos,
          dineroFaltanteInactivos,
          ultimosBecados,
          universidadesMorelia,
          distribucionEstatus,
          montosPorMes,
          loading: false
        };
      })
    );
  }

  // ============== FUNCIONES DE CÁLCULO ==============

  private calcularBolsaTotal(becados: any[]): number {
    return becados.reduce((sum, b) => sum + (b.monto_autorizado || 0), 0);
  }

  private calcularDineroErogado(becados: any[]): number {
    return becados.reduce((sum, b) => {
      // Sumar montos 1-6 si existen
      const montosPeriodos = (b.monto_1 || 0) + (b.monto_2 || 0) + (b.monto_3 || 0) + 
                            (b.monto_4 || 0) + (b.monto_5 || 0) + (b.monto_6 || 0);
      // Usar el campo erogado si existe, sino la suma de periodos
      return sum + (b.erogado || montosPeriodos || 0);
    }, 0);
  }

  private calcularPendienteActivos(activos: any[]): number {
    return activos.reduce((sum, b) => {
      const autorizado = b.monto_autorizado || 0;
      const erogado = b.erogado || 0;
      return sum + (autorizado - erogado);
    }, 0);
  }

  private calcularPendienteInactivos(inactivos: any[]): number {
    return inactivos.reduce((sum, b) => {
      const autorizado = b.monto_autorizado || 0;
      const erogado = b.erogado || 0;
      return sum + (autorizado - erogado);
    }, 0);
  }

  private obtenerUltimosBecados(becados: any[], universidades: any[], modalidades: any[]): BecadoResumen[] {
    return becados
      .sort((a, b) => {
        const fechaA = a.fechaCreacion ? new Date(a.fechaCreacion).getTime() : 0;
        const fechaB = b.fechaCreacion ? new Date(b.fechaCreacion).getTime() : 0;
        return fechaB - fechaA;
      })
      .slice(0, 10)
      .map(b => ({
        id_becado: b.id_becado,
        nombre_completo: `${b.apellido_p || ''} ${b.apellido_m || ''} ${b.nombre || ''}`.trim(),
        carrera: b.carrera || 'N/A',
        universidad: universidades.find((u: any) => u.id_universidad === b.id_universidad)?.nombre || 'N/A',
        modalidad: modalidades.find((m: any) => m.id_modalidad === b.id_modalidad)?.tipo || 'N/A',
        monto_autorizado: b.monto_autorizado || 0,
        erogado: b.erogado || 0,
        pendiente: (b.monto_autorizado || 0) - (b.erogado || 0),
        estatus: b.estatus === true,
        estatusTexto: b.estatus === true ? 'Activo' : 'Inactivo',
        tipoInactivo: b.estatus === false ? this.asignarTipoInactivo(b) : undefined
      }));
  }

  private asignarTipoInactivo(becado: any): TipoInactivo {
    // Lógica para asignar tipo de inactivo basado en algún campo
    // Por ahora asignamos aleatorio para demostración
    const random = Math.floor(Math.random() * this.tiposInactivo.length);
    return this.tiposInactivo[random];
  }

  private obtenerUniversidadesMorelia(universidades: any[], becados: any[]): UniversidadResumen[] {
    // Filtrar universidades de Morelia (ciudad)
    const universidadesMorelia = universidades.filter(u => 
      u.ciudad?.toLowerCase().includes('morelia') || 
      u.nombre?.toLowerCase().includes('morelia')
    );
    
    return universidadesMorelia.map(u => {
      const becadosUniversidad = becados.filter(b => b.id_universidad === u.id_universidad);
      const montoTotal = becadosUniversidad.reduce((sum, b) => sum + (b.monto_autorizado || 0), 0);
      const erogadoTotal = becadosUniversidad.reduce((sum, b) => {
        const montosPeriodos = (b.monto_1 || 0) + (b.monto_2 || 0) + (b.monto_3 || 0) + 
                              (b.monto_4 || 0) + (b.monto_5 || 0) + (b.monto_6 || 0);
        return sum + (b.erogado || montosPeriodos || 0);
      }, 0);
      
      return {
        id_universidad: u.id_universidad,
        nombre: u.nombre,
        ciudad: u.ciudad,
        pais: u.pais,
        totalBecados: becadosUniversidad.length,
        montoTotal,
        erogadoTotal
      };
    });
  }

  private generarMontosPorMes(becados: any[]): any {
    // Crear datos para gráfica de montos por mes (últimos 6 meses)
    const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const hoy = new Date();
    const labels: string[] = [];
    const datos: number[] = [];
    
    for (let i = 5; i >= 0; i--) {
      const mes = new Date(hoy.getFullYear(), hoy.getMonth() - i, 1);
      labels.push(`${meses[mes.getMonth()]} ${mes.getFullYear()}`);
      
      // Filtrar becados creados en ese mes
      const becadosMes = becados.filter(b => {
        if (!b.fechaCreacion) return false;
        const fecha = new Date(b.fechaCreacion);
        return fecha.getMonth() === mes.getMonth() && fecha.getFullYear() === mes.getFullYear();
      });
      
      const montoMes = this.calcularBolsaTotal(becadosMes);
      datos.push(montoMes);
    }
    
    return {
      labels,
      datasets: [{
        label: 'Montos Autorizados',
        data: datos,
        borderColor: '#1f3d66',
        backgroundColor: 'rgba(31, 61, 102, 0.1)',
        tension: 0.4,
        fill: true
      }]
    };
  }

  // ============== FUNCIONES PARA TABLAS SEPARADAS ==============

  getTablaActivos(): Observable<TablaActivos> {
    return this.becadoService.getAll().pipe(
      map((response) => {
        const becados = (response as any).data || [];
        const activos = becados.filter((b: any) => b.estatus === true);
        
        const becadosResumen = activos.map((b: any) => this.mapearABecadoResumen(b));
        const montoPorErogarse = activos.reduce((sum: number, b: any) => {
          return sum + ((b.monto_autorizado || 0) - (b.erogado || 0));
        }, 0);
        
        return {
          total: activos.length,
          montoPorErogarse,
          becados: becadosResumen
        };
      })
    );
  }

  getTablaInactivos(): Observable<TablaInactivos[]> {
    return this.becadoService.getAll().pipe(
      map((response) => {
        const becados = (response as any).data || [];
        const inactivos = becados.filter((b: any) => b.estatus === false);
        
        // Agrupar por tipo de inactivo
        const inactivosPorTipo = this.tiposInactivo.map(tipo => {
          const becadosTipo = inactivos.filter((b: any) => 
            this.asignarTipoInactivo(b) === tipo
          );
          
          const montoPerdido = becadosTipo.reduce((sum: number, b: any) => {
            return sum + ((b.monto_autorizado || 0) - (b.erogado || 0));
          }, 0);
          
          const becadosResumen = becadosTipo.map((b: any) => this.mapearABecadoResumen(b, tipo));
          
          return {
            tipo,
            cantidad: becadosTipo.length,
            montoPerdido,
            becados: becadosResumen
          };
        });
        
        return inactivosPorTipo;
      })
    );
  }

  getUniversidadesMoreliaExport(): Observable<any[]> {
    return forkJoin({
      universidades: this.universidadService.getAll(),
      becados: this.becadoService.getAll()
    }).pipe(
      map(({ universidades, becados }) => {
        const universidadesData = (universidades as any).data || [];
        const becadosData = (becados as any).data || [];
        
        // Filtrar universidades de Morelia
        const universidadesMorelia = universidadesData.filter((u: any) => 
          u.ciudad?.toLowerCase().includes('morelia')
        );
        
        return universidadesMorelia.map((u: any) => {
          const becadosUniversidad = becadosData.filter((b: any) => b.id_universidad === u.id_universidad);
          const montoTotal = becadosUniversidad.reduce((sum: number, b: any) => sum + (b.monto_autorizado || 0), 0);
          const erogadoTotal = becadosUniversidad.reduce((sum: number, b: any) => sum + (b.erogado || 0), 0);
          
          return {
            ...u,
            totalBecados: becadosUniversidad.length,
            montoTotal,
            erogadoTotal,
            becados: becadosUniversidad.map((b: any) => ({
              nombre: `${b.nombre} ${b.apellido_p || ''}`,
              montoAutorizado: b.monto_autorizado,
              erogado: b.erogado,
              estatus: b.estatus ? 'Activo' : 'Inactivo'
            }))
          };
        });
      })
    );
  }

  private mapearABecadoResumen(becado: any, tipoInactivo?: TipoInactivo): BecadoResumen {
    return {
      id_becado: becado.id_becado,
      nombre_completo: `${becado.apellido_p || ''} ${becado.apellido_m || ''} ${becado.nombre || ''}`.trim(),
      carrera: becado.carrera || 'N/A',
      universidad: becado.universidad_nombre || 'N/A',
      modalidad: becado.modalidad_tipo || 'N/A',
      monto_autorizado: becado.monto_autorizado || 0,
      erogado: becado.erogado || 0,
      pendiente: (becado.monto_autorizado || 0) - (becado.erogado || 0),
      estatus: becado.estatus === true,
      estatusTexto: becado.estatus === true ? 'Activo' : 'Inactivo',
      tipoInactivo
    };
  }
}