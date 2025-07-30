import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';

import { ClaimApiService } from '../../core/services/claim-api.service';
import { CreateClaimRequest } from '../../core/models';

@Component({
  selector: 'app-new-claim',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatDividerModule
  ],
  templateUrl: './new-claim.component.html',
  styleUrls: ['./new-claim.component.scss']
})
export class NewClaimComponent {
  claimForm: FormGroup;
  loading = signal(false);
  selectedFiles = signal<File[]>([]);
  maxFileSize = 10 * 1024 * 1024; // 10MB
  allowedFileTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

  constructor(
    private fb: FormBuilder,
    private claimService: ClaimApiService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.claimForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      description: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(1000)]],
      customerId: ['', [Validators.required, Validators.pattern(/^\d+$/)]]
    });
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      const newFiles = Array.from(input.files);
      const validFiles: File[] = [];
      const errors: string[] = [];

      newFiles.forEach(file => {
        if (!this.allowedFileTypes.includes(file.type)) {
          errors.push(`${file.name}: Tipo de archivo no permitido`);
          return;
        }

        if (file.size > this.maxFileSize) {
          errors.push(`${file.name}: El tamaño del archivo excede el límite de 10MB`);
          return;
        }

        validFiles.push(file);
      });

      if (errors.length > 0) {
        this.snackBar.open(errors.join(', '), 'Cerrar', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      }

      if (validFiles.length > 0) {
        const currentFiles = this.selectedFiles();
        this.selectedFiles.set([...currentFiles, ...validFiles]);
      }

      // Reset input
      input.value = '';
    }
  }

  removeFile(index: number) {
    const files = this.selectedFiles();
    files.splice(index, 1);
    this.selectedFiles.set([...files]);
  }

  getFileIcon(fileType: string): string {
    if (fileType.startsWith('image/')) return 'image';
    if (fileType === 'application/pdf') return 'picture_as_pdf';
    if (fileType.includes('word')) return 'description';
    return 'insert_drive_file';
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  getFieldError(fieldName: string): string {
    const field = this.claimForm.get(fieldName);
    const fieldLabels: { [key: string]: string } = {
      'title': 'Título',
      'description': 'Descripción', 
      'customerId': 'ID de Cliente'
    };
    const fieldLabel = fieldLabels[fieldName] || fieldName;
    
    if (field && field.invalid && field.touched) {
      if (field.errors?.['required']) return `${fieldLabel} es requerido`;
      if (field.errors?.['minlength']) return `${fieldLabel} debe tener al menos ${field.errors['minlength'].requiredLength} caracteres`;
      if (field.errors?.['maxlength']) return `${fieldLabel} no debe exceder ${field.errors['maxlength'].requiredLength} caracteres`;
      if (field.errors?.['pattern']) return `${fieldLabel} debe ser un número válido`;
    }
    return '';
  }

  async onSubmit() {
    if (this.claimForm.valid) {
      this.loading.set(true);
      
      try {
        const formData: CreateClaimRequest = {
          title: this.claimForm.value.title,
          description: this.claimForm.value.description,
          customerId: parseInt(this.claimForm.value.customerId)
        };

        const createdClaim = await firstValueFrom(this.claimService.createClaim(formData));
        
        if (createdClaim && this.selectedFiles().length > 0) {
          // Upload files for the created claim
          const uploadPromises = this.selectedFiles().map(file => 
            firstValueFrom(this.claimService.uploadAttachment(createdClaim.id, file))
          );
          
          try {
            await Promise.all(uploadPromises);
            this.showSuccess('Reclamación creada exitosamente con adjuntos!');
          } catch (uploadError) {
            this.showSuccess('Reclamación creada exitosamente, pero algunos adjuntos no se pudieron cargar.');
          }
        } else {
          this.showSuccess('Reclamación creada exitosamente!');
        }

        // Navigate to the created claim detail page
        if (createdClaim) {
          this.router.navigate(['/claims', createdClaim.id]);
        } else {
          this.router.navigate(['/dashboard']);
        }

      } catch (error) {
        this.showError('Error al crear la reclamación. Por favor inténtalo de nuevo.');
      } finally {
        this.loading.set(false);
      }
    } else {
      // Mark all fields as touched to show validation errors
      Object.keys(this.claimForm.controls).forEach(key => {
        this.claimForm.get(key)?.markAsTouched();
      });
      
      this.showError('Por favor completa todos los campos requeridos correctamente.');
    }
  }

  showSuccess(message: string) {
    this.snackBar.open(message, 'Cerrar', {
      duration: 5000,
      panelClass: ['success-snackbar']
    });
  }

  showError(message: string) {
    this.snackBar.open(message, 'Cerrar', {
      duration: 5000,
      panelClass: ['error-snackbar']
    });
  }

  onCancel() {
    this.router.navigate(['/dashboard']);
  }
}