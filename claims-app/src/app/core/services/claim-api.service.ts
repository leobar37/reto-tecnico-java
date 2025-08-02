import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { 
  ClaimDetailResponse, 
  CreateClaimRequest, 
  ClaimResponse,
  ClaimStatusRequest
} from '../models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ClaimApiService {
  private readonly baseUrl = `${environment.apiUrl}/api/claims`;
  
  constructor(private http: HttpClient) {}

  getClaims(status?: string, search?: string): Observable<ClaimResponse[]> {
    let params = new HttpParams();
    
    if (status) {
      params = params.set('status', status);
    }
    
    if (search) {
      params = params.set('search', search);
    }
    
    return this.http.get<any[]>(this.baseUrl, { params }).pipe(
      map(claims => claims.map(claim => ({
        id: claim.id,
        codigo: claim.codigo,
        titulo: claim.titulo,
        descripcion: claim.description,
        clienteId: claim.customerId,
        estadoActual: claim.currentStatus,
        fechaCreacion: claim.createdAt,
        fechaActualizacion: claim.lastUpdated
      })))
    );
  }

  getClaimById(id: number): Observable<ClaimDetailResponse> {
    return this.http.get<ClaimDetailResponse>(`${this.baseUrl}/${id}`);
  }

  createClaim(claimData: CreateClaimRequest): Observable<ClaimResponse> {
    return this.http.post<ClaimResponse>(this.baseUrl, claimData, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    });
  }

  addStatusToClaim(id: number, statusData: ClaimStatusRequest): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/${id}/status`, statusData, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    });
  }

  uploadAttachment(id: number, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
  
    return this.http.post<any>(`${this.baseUrl}/${id}/attachments`, formData);
  }
}