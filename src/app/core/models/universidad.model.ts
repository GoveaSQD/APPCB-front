export interface Universidad {
  id_universidad?: number;
  nombre: string;
  ciudad: string;        // Ahora es NOT NULL
  pais: string;          // Ahora es NOT NULL
  estado?: string;       // Opcional
  estatus: number;      // Cambió de 'activo' a 'estatus'
  fechaCreacion?: Date;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  count?: number;
}