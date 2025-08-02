import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import {
  ClaimDetailResponse,
  ClaimResponse,
  ClaimStatusEnum,
  ClaimStatusRequest,
  CreateClaimRequest
} from '../models';
import { ClaimApiService } from './claim-api.service';

describe('ClaimApiService', () => {
  let service: ClaimApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ClaimApiService]
    });
    service = TestBed.inject(ClaimApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getClaims', () => {
    it('should fetch all claims', () => {
      const mockClaims: ClaimResponse[] = [
        {
          id: 1,
          codigo: 'CLAIM001',
          titulo: 'Test Claim',
          descripcion: 'Test Description',
          clienteId: 123,
          estadoActual: ClaimStatusEnum.INGRESADO,
          fechaCreacion: '2024-01-01T00:00:00Z',
          fechaActualizacion: '2024-01-01T00:00:00Z'
        }
      ];

      service.getClaims().subscribe((claims) => {
        expect(claims).toEqual(mockClaims);
        expect(claims.length).toBe(1);
      });

      const req = httpMock.expectOne('/api/claims');
      expect(req.request.method).toBe('GET');
      req.flush(mockClaims);
    });
  });

  describe('getClaimById', () => {
    it('should fetch a claim by id', () => {
      const mockClaim: ClaimDetailResponse = {
        id: 1,
        title: 'Test Claim',
        description: 'Test Description',
        customerId: 123,
        currentStatus: ClaimStatusEnum.INGRESADO,
        createdAt: '2024-01-01T00:00:00Z',
        lastUpdated: '2024-01-01T00:00:00Z',
        statusHistory: [],
        attachments: []
      };

      service.getClaimById(1).subscribe((claim) => {
        expect(claim).toEqual(mockClaim);
      });

      const req = httpMock.expectOne('/api/claims/1');
      expect(req.request.method).toBe('GET');
      req.flush(mockClaim);
    });
  });

  describe('createClaim', () => {
    it('should create a new claim', () => {
      const createRequest: CreateClaimRequest = {
        title: 'New Claim',
        description: 'New Description',
        customerId: 456
      };

      const mockResponse: ClaimResponse = {
        id: 2,
        codigo: 'CLAIM002',
        titulo: 'New Claim',
        descripcion: 'New Description',
        clienteId: 456,
        estadoActual: ClaimStatusEnum.INGRESADO,
        fechaCreacion: '2024-01-02T00:00:00Z',
        fechaActualizacion: '2024-01-02T00:00:00Z'
      };

      service.createClaim(createRequest).subscribe((claim) => {
        expect(claim).toEqual(mockResponse);
      });

      const req = httpMock.expectOne('/api/claims');
      expect(req.request.method).toBe('POST');
      expect(req.request.headers.get('Content-Type')).toBe('application/json');
      expect(req.request.body).toEqual(createRequest);
      req.flush(mockResponse);
    });
  });

  describe('addStatusToClaim', () => {
    it('should add status to claim', () => {
      const statusRequest: ClaimStatusRequest = {
        status: ClaimStatusEnum.EN_PROCESO,
        notas: 'Processing claim'
      };

      service.addStatusToClaim(1, statusRequest).subscribe((response) => {
        expect(response).toBeNull();
      });

      const req = httpMock.expectOne('/api/claims/1/status');
      expect(req.request.method).toBe('POST');
      expect(req.request.headers.get('Content-Type')).toBe('application/json');
      expect(req.request.body).toEqual(statusRequest);
      req.flush(null);
    });
  });

  describe('uploadAttachment', () => {
    it('should upload file attachment', () => {
      const mockFile = new File(['file content'], 'test.pdf', { type: 'application/pdf' });
      const mockResponse = { success: true, fileId: 'file123' };

      service.uploadAttachment(1, mockFile).subscribe((response) => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne('/api/claims/1/attachments');
      expect(req.request.method).toBe('POST');
      expect(req.request.body instanceof FormData).toBeTruthy();
      
      const formData = req.request.body as FormData;
      expect(formData.get('file')).toBe(mockFile);
      
      req.flush(mockResponse);
    });
  });
});