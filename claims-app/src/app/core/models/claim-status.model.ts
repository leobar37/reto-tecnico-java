export interface ClaimStatus {
  id: number;
  reclamoId: number;
  estado: string;
  notas?: string;
  fechaCreacion: string;
}

export interface ClaimStatusRequest {
  estado: string;
  notas?: string;
}

export enum ClaimStatusEnum {
  CREADO = 'CREADO',
  EN_PROCESO = 'EN_PROCESO',
  RESUELTO = 'RESUELTO',
  CERRADO = 'CERRADO',
  CANCELADO = 'CANCELADO'
}