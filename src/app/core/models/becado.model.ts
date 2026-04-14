export interface Becado {
  id_becado?: number;
  nombre: string;
  apellido_p: string;
  apellido_m?: string | null;
  estatus: number;
  tipo_inactivo?: string;
  carrera: string;
  id_universidad: number;
  id_modalidad: number;
  monto_autorizado: number;
  pagos?: Pago[];
  erogado: number;
  pendiente_erogar: number;
  
  // Campos de JOIN
  universidad_nombre?: string;
  modalidad_tipo?: string;
  nombre_completo?: string;
}

export interface Pago {
  id?: number;
  concepto: string;
  monto: number;
  fecha?: Date;
}

// ← ESTO ES LO QUE FALTA
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  count?: number;
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
  tipo_inactivo?: string;
}

export interface ResumenFinanciero {
  bolsaTotal: number;
  erogadoTotal: number;
  pendienteTotal: number;
  perdidoInactivos: number;
  activos: number;
  inactivos: number;
}

export interface TablaInactivos {
  tipo: string;
  cantidad: number;
  montoPerdido: number;
  becados: BecadoResumen[];
}