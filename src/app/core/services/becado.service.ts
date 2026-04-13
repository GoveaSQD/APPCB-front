import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { 
  Becado, 
  ApiResponse, 
  ResumenFinanciero, 
  TablaInactivos,
  BecadoResumen 
} from '../models/becado.model';

@Injectable({
  providedIn: 'root'
})
export class BecadoService {
  private apiUrl = `${environment.apiUrl}/becados`;

  constructor(private http: HttpClient) {}

  // GET /api/becados - Listar todos
  getAll(): Observable<ApiResponse<Becado[]>> {
    return this.http.get<ApiResponse<Becado[]>>(this.apiUrl)
      .pipe(
        map(response => {
          if (response.data) {
            response.data = response.data.map((becado: Becado) => ({
              ...becado,
              nombre_completo: `${becado.apellido_p} ${becado.apellido_m || ''} ${becado.nombre}`.trim()
            }));
          }
          return response;
        }),
        catchError(this.handleError)
      );
  }

  // GET /api/becados/:id - Obtener por ID
  getById(id: number): Observable<ApiResponse<Becado>> {
    return this.http.get<ApiResponse<Becado>>(`${this.apiUrl}/${id}`)
      .pipe(
        map(response => {
          if (response.data) {
            response.data.nombre_completo = `${response.data.apellido_p} ${response.data.apellido_m || ''} ${response.data.nombre}`.trim();
          }
          return response;
        }),
        catchError(this.handleError)
      );
  }

  // POST /api/becados - Crear
  create(becado: Partial<Becado>): Observable<ApiResponse<Becado>> {
    return this.http.post<ApiResponse<Becado>>(this.apiUrl, becado)
      .pipe(catchError(this.handleError));
  }

  // PUT /api/becados/:id - Actualizar
  update(id: number, becado: Partial<Becado>): Observable<ApiResponse<Becado>> {
    return this.http.put<ApiResponse<Becado>>(`${this.apiUrl}/${id}`, becado)
      .pipe(catchError(this.handleError));
  }

  // DELETE /api/becados/:id - Eliminar
  delete(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }

  // Obtener resumen financiero
  getResumenFinanciero(): Observable<ResumenFinanciero> {
    return this.getAll().pipe(
      map(response => {
        const becados = response.data || [];
        
        const activos = becados.filter((b: Becado) => b.estatus === true);
        const inactivos = becados.filter((b: Becado) => b.estatus === false);
        
        const bolsaTotal = becados.reduce((sum: number, b: Becado) => sum + (b.monto_autorizado || 0), 0);
        const erogadoTotal = becados.reduce((sum: number, b: Becado) => sum + (b.erogado || 0), 0);
        const pendienteTotal = bolsaTotal - erogadoTotal;
        const perdidoInactivos = inactivos.reduce((sum: number, b: Becado) => {
          return sum + ((b.monto_autorizado || 0) - (b.erogado || 0));
        }, 0);
        
        return {
          bolsaTotal,
          erogadoTotal,
          pendienteTotal,
          perdidoInactivos,
          activos: activos.length,
          inactivos: inactivos.length
        };
      })
    );
  }

  // Obtener tabla de inactivos agrupados por tipo
  getInactivosPorTipo(): Observable<TablaInactivos[]> {
    return this.getAll().pipe(
      map(response => {
        const becados = response.data || [];
        const inactivos = becados.filter((b: Becado) => b.estatus === false);
        
        // Tipos de inactivos
        const tipos = [
          'Renuncia parcial',
          'Renuncia tácita', 
          'Baja por terminación',
          'Baja por reporte de universidad'
        ];
        
        return tipos.map(tipo => {
          const becadosTipo = inactivos.filter((b: Becado) => b.tipo_inactivo === tipo);
          const montoPerdido = becadosTipo.reduce((sum: number, b: Becado) => {
            return sum + ((b.monto_autorizado || 0) - (b.erogado || 0));
          }, 0);
          
          const becadosResumen: BecadoResumen[] = becadosTipo.map((b: Becado) => ({
            id_becado: b.id_becado!,
            nombre_completo: `${b.apellido_p} ${b.apellido_m || ''} ${b.nombre}`.trim(),
            carrera: b.carrera,
            universidad: b.universidad_nombre || 'N/A',
            modalidad: b.modalidad_tipo || 'N/A',
            monto_autorizado: b.monto_autorizado,
            erogado: b.erogado,
            pendiente: (b.monto_autorizado || 0) - (b.erogado || 0),
            estatus: false,
            estatusTexto: 'Inactivo',
            tipo_inactivo: tipo
          }));
          
          return {
            tipo,
            cantidad: becadosTipo.length,
            montoPerdido,
            becados: becadosResumen
          };
        });
      })
    );
  }

  private handleError(error: any) {
    console.error('Error en becado service:', error);
    return throwError(() => error);
  }
}