export interface Modalidad {
  id_modalidad?: number; 
  tipo: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  count?: number;
}