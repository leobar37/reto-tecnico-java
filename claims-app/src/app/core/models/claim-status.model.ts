export interface ClaimStatus {
  id: number;
  reclamoId: number;
  estado: string;
  notas?: string;
  fechaCreacion: string;
  asesor_email?: string;
}

export interface ClaimStatusRequest {
  status: string;
  notas?: string;
  asesor_email?: string;
}

export enum ClaimStatusEnum {
  INGRESADO = 'Ingresado',
  EN_PROCESO = 'En Proceso',
  RESUELTO = 'Resuelto',
  CERRADO = 'Cerrado',
  RECHAZADO = 'Rechazado',
  ESCALADO = 'Escalado',
  PENDIENTE_INFORMACION = 'Pendiente Información'
}