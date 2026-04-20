import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError, map, tap } from 'rxjs'; // Añade 'tap' aquí
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
 // En becado.service.ts
getAll(): Observable<ApiResponse<Becado[]>> {
  return this.http.get<ApiResponse<Becado[]>>(this.apiUrl)
    .pipe(
      map(response => {
        if (response.data) {
          response.data = response.data.map((becado: Becado) => {
            // Asegurar que pagos sea un array
            const pagos = (becado.pagos || []).map(pago => ({
              ...pago,
              monto: this.parseNumber(pago.monto)
            }));
            
            return {
              ...becado,
              nombre_completo: `${becado.apellido_p} ${becado.apellido_m || ''} ${becado.nombre}`.trim(),
              monto_autorizado: this.parseNumber(becado.monto_autorizado),
              erogado: this.parseNumber(becado.erogado),
              pendiente_erogar: this.parseNumber(becado.pendiente_erogar),
              pagos: pagos
            };
          });
        }
        return response;
      }),
      catchError(this.handleError)
    );
}

private parseNumber(value: any): number {
  if (value === null || value === undefined || value === '') return 0;
  if (typeof value === 'number') return isNaN(value) ? 0 : value;
  if (typeof value === 'string') {
    // Limpiar el string
    let cleanValue = value.replace(/[^0-9.-]/g, '');
    
    // Si hay múltiples puntos decimales, tomar solo el primero
    const parts = cleanValue.split('.');
    if (parts.length > 2) {
      cleanValue = parts[0] + '.' + parts.slice(1).join('');
    }
    
    const parsed = parseFloat(cleanValue);
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
}

  // GET /api/becados/:id - Obtener por ID
  getById(id: number): Observable<ApiResponse<Becado>> {
    return this.http.get<ApiResponse<Becado>>(`${this.apiUrl}/${id}`)
      .pipe(
        map(response => {
          if (response.data) {
            response.data.nombre_completo = `${response.data.apellido_p} ${response.data.apellido_m || ''} ${response.data.nombre}`.trim();
            // Asegurar que los montos sean números
            response.data.monto_autorizado = Number(response.data.monto_autorizado);
            response.data.erogado = Number(response.data.erogado);
            response.data.pendiente_erogar = Number(response.data.pendiente_erogar);
          }
          return response;
        }),
        catchError(this.handleError)
      );
  }

  // POST /api/becados - Crear
  create(becado: Partial<Becado>): Observable<ApiResponse<Becado>> {
    console.log('Service - Creando becado:', becado);
    return this.http.post<ApiResponse<Becado>>(this.apiUrl, becado)
      .pipe(
        tap(response => console.log('Service - Respuesta create:', response)),
        catchError(this.handleError)
      );
  }

  // PUT /api/becados/:id - Actualizar
 // En becado.service.ts - método update
  update(id: number, becado: Partial<Becado>): Observable<ApiResponse<Becado>> {
  console.log('Service - Actualizando becado ID:', id);
  console.log('Service - Datos a enviar:', JSON.stringify(becado, null, 2));
  
  // Asegurar que no haya undefined en los datos
  const cleanData: any = {};
  Object.keys(becado).forEach(key => {
    if (becado[key as keyof Partial<Becado>] !== undefined) {
      cleanData[key] = becado[key as keyof Partial<Becado>];
    }
  });
  
  return this.http.put<ApiResponse<Becado>>(`${this.apiUrl}/${id}`, cleanData)
    .pipe(
      tap(response => console.log('Service - Respuesta update:', response)),
      catchError(this.handleError)
    );
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
        
        const activos = becados.filter((b: Becado) => b.estatus === 1);
        const inactivos = becados.filter((b: Becado) => b.estatus === 0);
        
        const bolsaTotal = becados.reduce((sum: number, b: Becado) => sum + (Number(b.monto_autorizado) || 0), 0);
        const erogadoTotal = becados.reduce((sum: number, b: Becado) => sum + (Number(b.erogado) || 0), 0);
        const pendienteTotal = bolsaTotal - erogadoTotal;
        const perdidoInactivos = inactivos.reduce((sum: number, b: Becado) => {
          return sum + ((Number(b.monto_autorizado) || 0) - (Number(b.erogado) || 0));
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
        const inactivos = becados.filter((b: Becado) => b.estatus === 0);
        
        const tipos = [
          'Renuncia parcial',
          'Renuncia tácita', 
          'Baja por terminación',
          'Baja por reporte de universidad'
        ];
        
        return tipos.map(tipo => {
          const becadosTipo = inactivos.filter((b: Becado) => b.tipo_inactivo === tipo);
          const montoPerdido = becadosTipo.reduce((sum: number, b: Becado) => {
            return sum + ((Number(b.monto_autorizado) || 0) - (Number(b.erogado) || 0));
          }, 0);
          
          const becadosResumen: BecadoResumen[] = becadosTipo.map((b: Becado) => ({
            id_becado: b.id_becado!,
            nombre_completo: `${b.apellido_p} ${b.apellido_m || ''} ${b.nombre}`.trim(),
            carrera: b.carrera,
            universidad: b.universidad_nombre || 'N/A',
            modalidad: b.modalidad_tipo || 'N/A',
            monto_autorizado: Number(b.monto_autorizado),
            erogado: Number(b.erogado),
            pendiente: (Number(b.monto_autorizado) || 0) - (Number(b.erogado) || 0),
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