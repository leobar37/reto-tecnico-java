import { ClaimStatus } from './claim-status.model';
import { Attachment } from './attachment.model';

export interface Claim {
  id: number;
  codigo: string;
  titulo: string;
  descripcion: string;
  clienteId: number;
  fechaCreacion: string;
  fechaActualizacion: string;
  estados?: ClaimStatus[];
  adjuntos?: Attachment[];
}

export interface ClaimDetailResponse {
  id: number;
  title: string;
  description: string;
  customerId: number;
  currentStatus: string;
  createdAt: string;
  lastUpdated: string;
  statusHistory: ClaimStatusHistory[];
  attachments: ClaimAttachment[];
}

export interface ClaimStatusHistory {
  id: number;
  status: string;
  notes: string;
  createdAt: string;
}

export interface ClaimAttachment {
  id: number;
  fileName: string;
  fileType: string;
  fileSize: number;
  uploadedAt: string;
}

export interface CreateClaimRequest {
  title: string;
  description: string;
  customerId: number;
}

export interface ClaimResponse {
  id: number;
  codigo: string;
  titulo: string;
  descripcion: string;
  clienteId: number;
  estadoActual: string;
  fechaCreacion: string;
  fechaActualizacion: string;
}