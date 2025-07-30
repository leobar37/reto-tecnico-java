import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
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

  getClaims(): Observable<ClaimResponse[]> {
    return this.http.get<ClaimResponse[]>(this.baseUrl);
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