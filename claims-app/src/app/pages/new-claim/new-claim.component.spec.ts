import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { of, throwError } from 'rxjs';

import { NewClaimComponent } from './new-claim.component';
import { ClaimApiService } from '../../core/services/claim-api.service';
import { CreateClaimRequest, ClaimResponse, ClaimStatusEnum } from '../../core/models';

describe('NewClaimComponent', () => {
  let component: NewClaimComponent;
  let fixture: ComponentFixture<NewClaimComponent>;
  let mockClaimApiService: jasmine.SpyObj<ClaimApiService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockSnackBar: jasmine.SpyObj<MatSnackBar>;

  const mockClaimResponse: ClaimResponse = {
    id: 1,
    codigo: 'CLAIM001',
    titulo: 'Test Claim',
    descripcion: 'Test Description',
    clienteId: 123,
    estadoActual: ClaimStatusEnum.CREADO,
    fechaCreacion: '2024-01-01T00:00:00Z',
    fechaActualizacion: '2024-01-01T00:00:00Z'
  };

  beforeEach(async () => {
    const claimServiceSpy = jasmine.createSpyObj('ClaimApiService', ['createClaim', 'uploadAttachment']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);

    await TestBed.configureTestingModule({
      imports: [
        NewClaimComponent,
        CommonModule,
        ReactiveFormsModule,
        NoopAnimationsModule,
        MatCardModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatIconModule,
        MatProgressSpinnerModule,
        MatChipsModule,
        MatDividerModule
      ],
      providers: [
        { provide: ClaimApiService, useValue: claimServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: MatSnackBar, useValue: snackBarSpy },
        FormBuilder
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(NewClaimComponent);
    component = fixture.componentInstance;
    mockClaimApiService = TestBed.inject(ClaimApiService) as jasmine.SpyObj<ClaimApiService>;
    mockRouter = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    mockSnackBar = TestBed.inject(MatSnackBar) as jasmine.SpyObj<MatSnackBar>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Form Validation', () => {
    it('should initialize with invalid form', () => {
      expect(component.claimForm.valid).toBeFalsy();
    });

    it('should validate required fields', () => {
      const titleControl = component.claimForm.get('title');
      const descriptionControl = component.claimForm.get('description');
      const customerIdControl = component.claimForm.get('customerId');

      expect(titleControl?.hasError('required')).toBeTruthy();
      expect(descriptionControl?.hasError('required')).toBeTruthy();
      expect(customerIdControl?.hasError('required')).toBeTruthy();
    });

    it('should validate minimum length for title and description', () => {
      component.claimForm.patchValue({
        title: 'ab',
        description: 'short'
      });

      const titleControl = component.claimForm.get('title');
      const descriptionControl = component.claimForm.get('description');

      expect(titleControl?.hasError('minlength')).toBeTruthy();
      expect(descriptionControl?.hasError('minlength')).toBeTruthy();
    });

    it('should validate customerId pattern', () => {
      component.claimForm.patchValue({
        customerId: 'abc'
      });

      const customerIdControl = component.claimForm.get('customerId');
      expect(customerIdControl?.hasError('pattern')).toBeTruthy();
    });

    it('should be valid with correct data', () => {
      component.claimForm.patchValue({
        title: 'Valid Title',
        description: 'This is a valid description with more than 10 characters',
        customerId: '123'
      });

      expect(component.claimForm.valid).toBeTruthy();
    });
  });

  describe('File Handling', () => {
    it('should add valid files to selectedFiles', () => {
      const mockFile = new File(['content'], 'test.pdf', { type: 'application/pdf' });
      Object.defineProperty(mockFile, 'size', { value: 1024 });

      const mockEvent = {
        target: {
          files: [mockFile],
          value: ''
        }
      } as any;

      component.onFileSelected(mockEvent);

      expect(component.selectedFiles().length).toBe(1);
      expect(component.selectedFiles()[0]).toBe(mockFile);
    });

    it('should reject files with invalid type', () => {
      const mockFile = new File(['content'], 'test.exe', { type: 'application/exe' });
      Object.defineProperty(mockFile, 'size', { value: 1024 });

      const mockEvent = {
        target: {
          files: [mockFile],
          value: ''
        }
      } as any;

      component.onFileSelected(mockEvent);

      expect(component.selectedFiles().length).toBe(0);
      expect(mockSnackBar.open).toHaveBeenCalled();
    });

    it('should reject files that are too large', () => {
      const mockFile = new File(['content'], 'test.pdf', { type: 'application/pdf' });
      Object.defineProperty(mockFile, 'size', { value: 15 * 1024 * 1024 }); // 15MB

      const mockEvent = {
        target: {
          files: [mockFile],
          value: ''
        }
      } as any;

      component.onFileSelected(mockEvent);

      expect(component.selectedFiles().length).toBe(0);
      expect(mockSnackBar.open).toHaveBeenCalled();
    });

    it('should remove file by index', () => {
      const mockFile1 = new File(['content1'], 'test1.pdf', { type: 'application/pdf' });
      const mockFile2 = new File(['content2'], 'test2.pdf', { type: 'application/pdf' });
      component.selectedFiles.set([mockFile1, mockFile2]);

      component.removeFile(0);

      expect(component.selectedFiles().length).toBe(1);
      expect(component.selectedFiles()[0]).toBe(mockFile2);
    });
  });

  describe('File Utilities', () => {
    it('should return correct file icon', () => {
      expect(component.getFileIcon('image/jpeg')).toBe('image');
      expect(component.getFileIcon('application/pdf')).toBe('picture_as_pdf');
      expect(component.getFileIcon('application/msword')).toBe('description');
      expect(component.getFileIcon('text/plain')).toBe('insert_drive_file');
    });

    it('should format file size correctly', () => {
      expect(component.formatFileSize(0)).toBe('0 Bytes');
      expect(component.formatFileSize(1024)).toBe('1 KB');
      expect(component.formatFileSize(1048576)).toBe('1 MB');
    });
  });

  describe('Form Submission', () => {
    beforeEach(() => {
      component.claimForm.patchValue({
        title: 'Test Title',
        description: 'Test description with enough characters',
        customerId: '123'
      });
    });

    it('should create claim successfully without files', async () => {
      mockClaimApiService.createClaim.and.returnValue(of(mockClaimResponse));

      await component.onSubmit();

      expect(mockClaimApiService.createClaim).toHaveBeenCalledWith({
        title: 'Test Title',
        description: 'Test description with enough characters',
        customerId: 123
      });
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/claims', 1]);
      expect(component.loading()).toBe(false);
    });

    it('should create claim successfully with files', async () => {
      const mockFile = new File(['content'], 'test.pdf', { type: 'application/pdf' });
      component.selectedFiles.set([mockFile]);
      
      mockClaimApiService.createClaim.and.returnValue(of(mockClaimResponse));
      mockClaimApiService.uploadAttachment.and.returnValue(of({ success: true }));

      await component.onSubmit();

      expect(mockClaimApiService.createClaim).toHaveBeenCalled();
      expect(mockClaimApiService.uploadAttachment).toHaveBeenCalledWith(1, mockFile);
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/claims', 1]);
    });

    it('should handle create claim error', async () => {
      mockClaimApiService.createClaim.and.returnValue(throwError(() => new Error('API Error')));

      await component.onSubmit();

      expect(mockSnackBar.open).toHaveBeenCalledWith(
        'Error al crear la reclamación. Por favor inténtalo de nuevo.',
        'Cerrar',
        jasmine.any(Object)
      );
      expect(component.loading()).toBe(false);
    });

    it('should not submit invalid form', async () => {
      component.claimForm.patchValue({
        title: '',
        description: '',
        customerId: ''
      });

      await component.onSubmit();

      expect(mockClaimApiService.createClaim).not.toHaveBeenCalled();
      expect(mockSnackBar.open).toHaveBeenCalledWith(
        'Por favor completa todos los campos requeridos correctamente.',
        'Cerrar',
        jasmine.any(Object)
      );
    });
  });

  describe('Field Error Messages', () => {
    it('should return correct error messages', () => {
      const titleControl = component.claimForm.get('title');
      titleControl?.markAsTouched();
      titleControl?.setErrors({ required: true });
      
      expect(component.getFieldError('title')).toBe('Título es requerido');

      titleControl?.setErrors({ minlength: { requiredLength: 3, actualLength: 1 } });
      expect(component.getFieldError('title')).toBe('Título debe tener al menos 3 caracteres');
    });

    it('should return empty string for valid fields', () => {
      component.claimForm.patchValue({ title: 'Valid Title' });
      const titleControl = component.claimForm.get('title');
      titleControl?.markAsTouched();
      
      expect(component.getFieldError('title')).toBe('');
    });
  });

  describe('Navigation', () => {
    it('should navigate to dashboard on cancel', () => {
      component.onCancel();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/dashboard']);
    });
  });
});