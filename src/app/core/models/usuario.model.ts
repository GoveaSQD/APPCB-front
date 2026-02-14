export interface Usuario {
  id_usuario?: number;
  nombre: string;
  ap_paterno?: string;
  ap_materno?: string;
  email: string;
  password?: string;  // Solo para creación/actualización
  rol?: 'admin' | 'usuario';
  fechaCreacion?: Date;
  activo?: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  nombre: string;
  email: string;
  password: string;
  rol?: string;  // Opcional, por defecto 'usuario'
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    user: Usuario;
    token: string;
  };
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  token: string;
  usuario: Usuario;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  count?: number;  // Para listados con paginación
}