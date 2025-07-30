import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { of, throwError } from 'rxjs';

import { DashboardComponent } from './dashboard.component';
import { ClaimApiService } from '../../core/services/claim-api.service';
import { ClaimResponse, ClaimStatusEnum } from '../../core/models';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let mockClaimApiService: jasmine.SpyObj<ClaimApiService>;

  const mockClaims: ClaimResponse[] = [
    {
      id: 1,
      codigo: 'CLAIM001',
      titulo: 'First Claim',
      descripcion: 'First claim description',
      clienteId: 123,
      estadoActual: ClaimStatusEnum.CREADO,
      fechaCreacion: '2024-01-01T00:00:00Z',
      fechaActualizacion: '2024-01-01T00:00:00Z'
    },
    {
      id: 2,
      codigo: 'CLAIM002',
      titulo: 'Second Claim',
      descripcion: 'Second claim description',
      clienteId: 456,
      estadoActual: ClaimStatusEnum.EN_PROCESO,
      fechaCreacion: '2024-01-02T00:00:00Z',
      fechaActualizacion: '2024-01-02T00:00:00Z'
    }
  ];

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('ClaimApiService', ['getClaims']);

    await TestBed.configureTestingModule({
      imports: [
        DashboardComponent,
        CommonModule,
        RouterModule.forRoot([]),
        ReactiveFormsModule,
        NoopAnimationsModule,
        MatTableModule,
        MatPaginatorModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatButtonModule,
        MatIconModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatCardModule,
        MatProgressSpinnerModule,
        MatChipsModule
      ],
      providers: [
        { provide: ClaimApiService, useValue: spy },
        FormBuilder
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    mockClaimApiService = TestBed.inject(ClaimApiService) as jasmine.SpyObj<ClaimApiService>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should load claims and setup filters', () => {
      mockClaimApiService.getClaims.and.returnValue(of(mockClaims));
      spyOn(component, 'setupFilters');

      component.ngOnInit();

      expect(mockClaimApiService.getClaims).toHaveBeenCalled();
      expect(component.setupFilters).toHaveBeenCalled();
    });
  });

  describe('loadClaims', () => {
    it('should load claims successfully', () => {
      mockClaimApiService.getClaims.and.returnValue(of(mockClaims));

      component.loadClaims();

      expect(component.loading()).toBe(false);
      expect(component.claims()).toEqual(mockClaims);
      expect(component.filteredClaims()).toEqual(mockClaims);
      expect(component.totalItems).toBe(2);
      expect(component.error()).toBeNull();
    });

    it('should handle error when loading claims fails', () => {
      mockClaimApiService.getClaims.and.returnValue(throwError(() => new Error('API Error')));

      component.loadClaims();

      expect(component.loading()).toBe(false);
      expect(component.error()).toBe('Error loading claims');
    });
  });

  describe('applyFilters', () => {
    beforeEach(() => {
      component.claims.set(mockClaims);
    });

    it('should filter by status', () => {
      component.filterForm.patchValue({ estado: ClaimStatusEnum.CREADO });

      component.applyFilters();

      expect(component.filteredClaims().length).toBe(1);
      expect(component.filteredClaims()[0].estadoActual).toBe(ClaimStatusEnum.CREADO);
    });

    it('should filter by empresa (clienteId)', () => {
      component.filterForm.patchValue({ empresa: '123' });

      component.applyFilters();

      expect(component.filteredClaims().length).toBe(1);
      expect(component.filteredClaims()[0].clienteId).toBe(123);
    });

    it('should filter by search text', () => {
      component.filterForm.patchValue({ searchText: 'first' });

      component.applyFilters();

      expect(component.filteredClaims().length).toBe(1);
      expect(component.filteredClaims()[0].titulo).toBe('First Claim');
    });

    it('should reset page index when filtering', () => {
      component.pageIndex = 2;
      component.filterForm.patchValue({ searchText: 'first' });

      component.applyFilters();

      expect(component.pageIndex).toBe(0);
    });
  });

  describe('onPageChange', () => {
    it('should update page index and size', () => {
      const pageEvent: PageEvent = {
        pageIndex: 1,
        pageSize: 5,
        length: 10
      };

      spyOn(component, 'updatePagedClaims');

      component.onPageChange(pageEvent);

      expect(component.pageIndex).toBe(1);
      expect(component.pageSize).toBe(5);
      expect(component.updatePagedClaims).toHaveBeenCalled();
    });
  });

  describe('updatePagedClaims', () => {
    it('should update paged claims correctly', () => {
      component.filteredClaims.set(mockClaims);
      component.pageIndex = 0;
      component.pageSize = 1;

      component.updatePagedClaims();

      expect(component.pagedClaims().length).toBe(1);
      expect(component.pagedClaims()[0]).toEqual(mockClaims[0]);
    });
  });

  describe('clearFilters', () => {
    it('should reset the filter form', () => {
      component.filterForm.patchValue({ 
        empresa: '123',
        estado: ClaimStatusEnum.CREADO,
        searchText: 'test'
      });

      component.clearFilters();

      expect(component.filterForm.value).toEqual({
        empresa: null,
        estado: null,
        fechaInicio: null,
        fechaFin: null,
        searchText: null
      });
    });
  });

  describe('getStatusColor', () => {
    it('should return correct colors for different statuses', () => {
      expect(component.getStatusColor(ClaimStatusEnum.CREADO)).toBe('primary');
      expect(component.getStatusColor(ClaimStatusEnum.EN_PROCESO)).toBe('accent');
      expect(component.getStatusColor(ClaimStatusEnum.RESUELTO)).toBe('primary');
      expect(component.getStatusColor(ClaimStatusEnum.CERRADO)).toBe('');
      expect(component.getStatusColor(ClaimStatusEnum.CANCELADO)).toBe('warn');
      expect(component.getStatusColor('UNKNOWN')).toBe('');
    });
  });
});