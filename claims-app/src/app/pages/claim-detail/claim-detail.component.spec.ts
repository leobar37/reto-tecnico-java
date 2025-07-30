import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatListModule } from '@angular/material/list';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { of, throwError } from 'rxjs';

import { ClaimDetailComponent } from './claim-detail.component';
import { ClaimApiService } from '../../core/services/claim-api.service';
import { ClaimDetailResponse, ClaimStatusEnum, ClaimStatusRequest, ClaimStatusHistory, ClaimAttachment } from '../../core/models';

describe('ClaimDetailComponent', () => {
  let component: ClaimDetailComponent;
  let fixture: ComponentFixture<ClaimDetailComponent>;
  let mockClaimApiService: jasmine.SpyObj<ClaimApiService>;
  let mockActivatedRoute: any;
  let mockSnackBar: jasmine.SpyObj<MatSnackBar>;

  const mockClaimDetail: ClaimDetailResponse = {
    id: 1,
    title: 'Test Claim',
    description: 'Test Description',
    customerId: 123,
    currentStatus: ClaimStatusEnum.CREADO,
    createdAt: '2024-01-01T00:00:00Z',
    lastUpdated: '2024-01-01T00:00:00Z',
    statusHistory: [
      {
        id: 1,
        status: ClaimStatusEnum.CREADO,
        notes: 'Claim created',
        createdAt: '2024-01-01T00:00:00Z'
      }
    ],
    attachments: [
      {
        id: 1,
        fileName: 'test.pdf',
        fileType: 'application/pdf',
        fileSize: 1024,
        uploadedAt: '2024-01-01T00:00:00Z'
      }
    ]
  };

  beforeEach(async () => {
    const claimServiceSpy = jasmine.createSpyObj('ClaimApiService', ['getClaimById', 'addStatusToClaim']);
    const snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);
    mockActivatedRoute = {
      params: of({ id: '1' })
    };

    await TestBed.configureTestingModule({
      imports: [
        ClaimDetailComponent,
        CommonModule,
        ReactiveFormsModule,
        NoopAnimationsModule,
        MatCardModule,
        MatButtonModule,
        MatIconModule,
        MatProgressSpinnerModule,
        MatChipsModule,
        MatDividerModule,
        MatExpansionModule,
        MatListModule,
        MatFormFieldModule,
        MatSelectModule,
        MatInputModule,
        MatTabsModule
      ],
      providers: [
        { provide: ClaimApiService, useValue: claimServiceSpy },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: MatSnackBar, useValue: snackBarSpy },
        FormBuilder
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ClaimDetailComponent);
    component = fixture.componentInstance;
    mockClaimApiService = TestBed.inject(ClaimApiService) as jasmine.SpyObj<ClaimApiService>;
    mockSnackBar = TestBed.inject(MatSnackBar) as jasmine.SpyObj<MatSnackBar>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should load claim detail on init', () => {
      mockClaimApiService.getClaimById.and.returnValue(of(mockClaimDetail));
      spyOn(component, 'loadClaimDetail');

      component.ngOnInit();

      expect(component.claimId()).toBe(1);
      expect(component.loadClaimDetail).toHaveBeenCalled();
    });
  });

  describe('loadClaimDetail', () => {
    it('should load claim detail successfully', () => {
      mockClaimApiService.getClaimById.and.returnValue(of(mockClaimDetail));

      component.claimId.set(1);
      component.loadClaimDetail();

      expect(mockClaimApiService.getClaimById).toHaveBeenCalledWith(1);
      expect(component.claim()).toEqual(mockClaimDetail);
      expect(component.loading()).toBe(false);
      expect(component.error()).toBeNull();
    });

    it('should handle error when loading claim detail fails', () => {
      mockClaimApiService.getClaimById.and.returnValue(throwError(() => new Error('API Error')));

      component.claimId.set(1);
      component.loadClaimDetail();

      expect(component.loading()).toBe(false);
      expect(component.error()).toBe('Failed to load claim details');
      expect(component.claim()).toBeNull();
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

  describe('toggleStatusForm', () => {
    it('should toggle status form visibility', () => {
      expect(component.showStatusForm()).toBe(false);

      component.toggleStatusForm();
      expect(component.showStatusForm()).toBe(true);

      component.toggleStatusForm();
      expect(component.showStatusForm()).toBe(false);
    });

    it('should reset form when showing', () => {
      component.statusForm.patchValue({
        estado: ClaimStatusEnum.EN_PROCESO,
        notas: 'Test notes'
      });

      component.toggleStatusForm();

      expect(component.statusForm.value).toEqual({
        estado: null,
        notas: null
      });
    });
  });

  describe('onStatusUpdate', () => {
    beforeEach(() => {
      component.claimId.set(1);
      component.statusForm.patchValue({
        estado: ClaimStatusEnum.EN_PROCESO,
        notas: 'Processing the claim'
      });
    });

    it('should update status successfully', async () => {
      mockClaimApiService.addStatusToClaim.and.returnValue(of(void 0));
      mockClaimApiService.getClaimById.and.returnValue(of(mockClaimDetail));

      await component.onStatusUpdate();

      const expectedStatusData: ClaimStatusRequest = {
        estado: ClaimStatusEnum.EN_PROCESO,
        notas: 'Processing the claim'
      };

      expect(mockClaimApiService.addStatusToClaim).toHaveBeenCalledWith(1, expectedStatusData);
      expect(mockSnackBar.open).toHaveBeenCalledWith('Status updated successfully!', 'Close', jasmine.any(Object));
      expect(component.showStatusForm()).toBe(false);
      expect(component.updatingStatus()).toBe(false);
    });

    it('should handle undefined notas', async () => {
      component.statusForm.patchValue({
        estado: ClaimStatusEnum.EN_PROCESO,
        notas: ''
      });

      mockClaimApiService.addStatusToClaim.and.returnValue(of(void 0));
      mockClaimApiService.getClaimById.and.returnValue(of(mockClaimDetail));

      await component.onStatusUpdate();

      const expectedStatusData: ClaimStatusRequest = {
        estado: ClaimStatusEnum.EN_PROCESO,
        notas: undefined
      };

      expect(mockClaimApiService.addStatusToClaim).toHaveBeenCalledWith(1, expectedStatusData);
    });

    it('should handle status update error', async () => {
      mockClaimApiService.addStatusToClaim.and.returnValue(throwError(() => new Error('API Error')));

      await component.onStatusUpdate();

      expect(mockSnackBar.open).toHaveBeenCalledWith('Failed to update status. Please try again.', 'Close', jasmine.any(Object));
      expect(component.updatingStatus()).toBe(false);
    });

    it('should not update if form is invalid', async () => {
      component.statusForm.patchValue({
        estado: '',
        notas: 'Notes without status'
      });

      await component.onStatusUpdate();

      expect(mockClaimApiService.addStatusToClaim).not.toHaveBeenCalled();
    });
  });

  describe('downloadAttachment', () => {
    it('should show info message for download', () => {
      const attachment = {
        fileName: 'test.pdf',
        fileType: 'application/pdf'
      };

      component.downloadAttachment(attachment);

      expect(mockSnackBar.open).toHaveBeenCalledWith(
        'Download would start for: test.pdf',
        'Close',
        jasmine.any(Object)
      );
    });
  });

  describe('File Utilities', () => {
    it('should return correct file icon', () => {
      expect(component.getFileIcon('image/jpeg')).toBe('image');
      expect(component.getFileIcon('application/pdf')).toBe('picture_as_pdf');
      expect(component.getFileIcon('application/msword')).toBe('description');
      expect(component.getFileIcon('text/plain')).toBe('insert_drive_file');
      expect(component.getFileIcon(undefined as any)).toBe('insert_drive_file');
    });

    it('should format file size correctly', () => {
      expect(component.formatFileSize(0)).toBe('0 Bytes');
      expect(component.formatFileSize(1024)).toBe('1 KB');
      expect(component.formatFileSize(1048576)).toBe('1 MB');
      expect(component.formatFileSize(1073741824)).toBe('1 GB');
    });

    it('should format date correctly', () => {
      const dateString = '2024-01-01T10:30:00Z';
      const result = component.formatDate(dateString);
      
      expect(result).toContain('2024');
      expect(typeof result).toBe('string');
    });
  });

  describe('Navigation', () => {
    it('should go back in history', () => {
      spyOn(window.history, 'back');

      component.onBack();

      expect(window.history.back).toHaveBeenCalled();
    });
  });

  describe('Snackbar Messages', () => {
    it('should show success message', () => {
      component.showSuccess('Test success');

      expect(mockSnackBar.open).toHaveBeenCalledWith('Test success', 'Close', {
        duration: 5000,
        panelClass: ['success-snackbar']
      });
    });

    it('should show error message', () => {
      component.showError('Test error');

      expect(mockSnackBar.open).toHaveBeenCalledWith('Test error', 'Close', {
        duration: 5000,
        panelClass: ['error-snackbar']
      });
    });

    it('should show info message', () => {
      component.showInfo('Test info');

      expect(mockSnackBar.open).toHaveBeenCalledWith('Test info', 'Close', {
        duration: 3000,
        panelClass: ['info-snackbar']
      });
    });
  });
});