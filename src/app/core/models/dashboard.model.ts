import { Becado } from './becado.model';
import { Universidad } from './universidad.model';

export interface DashboardStats {
  // Totales generales
  totalBecados: number;
  totalUniversidades: number;
  totalModalidades: number;
  totalUsuarios: number;
  
  // Estadísticas de becados
  becadosActivos: number;
  becadosInactivos: number;
  
  // Finanzas
  bolsaTotal: number;
  dineroErogado: number;
  dineroFaltante: number;
  dineroFaltanteActivos: number;
  dineroFaltanteInactivos: number;
  
  // Últimos registros
  ultimosBecados: BecadoResumen[];
  universidadesMorelia: UniversidadResumen[];
  
  // Gráficas
  distribucionEstatus: { activos: number; inactivos: number };
  montosPorMes: any;
  
  // Loading
  loading: boolean;

  bolsaAsignada: number;  
}

export interface BecadoResumen {
  id_becado: number;
  nombre_completo: string;
  carrera: string;
  universidad: string;
  modalidad: string;
  monto_autorizado: number;
  erogado: number;
  pendiente: number;
  estatus: boolean;
  estatusTexto: string;
  tipoInactivo?: TipoInactivo;
}

export interface UniversidadResumen {
  id_universidad: number;
  nombre: string;
  ciudad: string;
  pais: string;
  totalBecados: number;
  montoTotal: number;
  erogadoTotal: number;
}

export type TipoInactivo = 
  | 'Renuncia parcial'
  | 'Renuncia tácita'
  | 'Baja por terminación'
  | 'Baja por reporte de universidad';

export interface TablaActivos {
  total: number;
  montoPorErogarse: number;
  becados: BecadoResumen[];
}

export interface TablaInactivos {
  tipo: TipoInactivo;
  cantidad: number;
  montoPerdido: number;
  becados: BecadoResumen[];
}