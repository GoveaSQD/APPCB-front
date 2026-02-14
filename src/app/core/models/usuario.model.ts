export interface Usuario {
  id?: number;
  nombre: string;
  email: string;
  password?: string;
  rol?: 'admin' | 'usuario';
  fechaCreacion?: Date;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  nombre: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  usuario: Usuario;
}