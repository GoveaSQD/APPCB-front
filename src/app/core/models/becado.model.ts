export interface Becado {
  id_becado?: number;
  nombre: string;
  apellido_p: string;
  apellido_m?: string | null;
  estatus: boolean;  // 1 = activo, 0 = inactivo
  carrera: string;
  id_universidad: number;
  id_modalidad: number;
  monto_autorizado: number;
  monto_1?: number | null;
  monto_2?: number | null;
  monto_3?: number | null;
  monto_4?: number | null;
  monto_5?: number | null;
  monto_6?: number | null;
  erogado: number;
  pendiente_erogar: number;
  
  // Campos de JOIN (vienen del backend)
  universidad_nombre?: string;
  modalidad_tipo?: string;
  
  // Campos calculados
  nombre_completo?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  count?: number;
}