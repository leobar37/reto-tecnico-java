export interface Attachment {
  id: number;
  reclamoId: number;
  nombreArchivo: string;
  tipoContenido?: string;
  tamanoBytes?: number;
  urlArchivo: string;
  fechaSubida: string;
}

export interface AttachmentUploadRequest {
  file: File;
  reclamoId: number;
}

export interface AttachmentUploadResponse {
  id: number;
  nombreArchivo: string;
  tipoContenido: string;
  tamanoBytes: number;
  urlArchivo: string;
  fechaSubida: string;
}