export interface Universidad {
  id?: number;
  nombre: string;
  ciudad?: string;
  pais?: string;
  fechaCreacion?: Date;
  activo?: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  count?: number;
}