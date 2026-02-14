export interface Becado {
  id?: number;
  nombre: string;
  apellido: string;
  email: string;
  telefono?: string;
  universidadId: number;
  universidad?: string;
  modalidadId: number;
  modalidad?: string;
  fechaInicio: Date;
  fechaFin?: Date;
  activo: boolean;
  observaciones?: string;
  fechaCreacion?: Date;
}