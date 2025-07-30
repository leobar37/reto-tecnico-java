import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
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

import { ClaimApiService } from '../../core/services/claim-api.service';
import { ClaimDetailResponse, ClaimStatusEnum, ClaimStatusRequest } from '../../core/models';

@Component({
  selector: 'app-claim-detail',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
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
  templateUrl: './claim-detail.component.html',
  styleUrls: ['./claim-detail.component.scss']
})
export class ClaimDetailComponent implements OnInit {
  claimId = signal<number>(0);
  claim = signal<ClaimDetailResponse | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);
  updatingStatus = signal(false);
  
  statusForm: FormGroup;
  statusOptions = Object.values(ClaimStatusEnum);
  showStatusForm = signal(false);

  constructor(
    private route: ActivatedRoute,
    private claimService: ClaimApiService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
  ) {
    this.statusForm = this.fb.group({
      estado: ['', Validators.required],
      notas: ['']
    });
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      const id = parseInt(params['id']);
      if (id) {
        this.claimId.set(id);
        this.loadClaimDetail();
      }
    });
  }

  loadClaimDetail() {
    this.loading.set(true);
    this.error.set(null);
    
    this.claimService.getClaimById(this.claimId()).subscribe({
      next: (claim) => {
        this.claim.set(claim);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load claim details');
        this.loading.set(false);
      }
    });
  }

  getStatusColor(status: string): string {
    switch (status) {
      case ClaimStatusEnum.CREADO: return 'primary';
      case ClaimStatusEnum.EN_PROCESO: return 'accent';
      case ClaimStatusEnum.RESUELTO: return 'primary';
      case ClaimStatusEnum.CERRADO: return '';
      case ClaimStatusEnum.CANCELADO: return 'warn';
      default: return '';
    }
  }

  toggleStatusForm() {
    this.showStatusForm.set(!this.showStatusForm());
    if (this.showStatusForm()) {
      this.statusForm.reset();
    }
  }

  async onStatusUpdate() {
    if (this.statusForm.valid) {
      this.updatingStatus.set(true);
      
      try {
        const statusData: ClaimStatusRequest = {
          estado: this.statusForm.value.estado,
          notas: this.statusForm.value.notas || undefined
        };

        await firstValueFrom(this.claimService.addStatusToClaim(this.claimId(), statusData));
        
        this.showSuccess('Status updated successfully!');
        this.loadClaimDetail(); // Reload to get updated status history
        this.showStatusForm.set(false);
        
      } catch (error) {
        this.showError('Failed to update status. Please try again.');
      } finally {
        this.updatingStatus.set(false);
      }
    }
  }

  downloadAttachment(attachment: any) {
    // In a real application, this would trigger a download from the backend
    // For now, we'll show a placeholder message
    this.showInfo(`Download would start for: ${attachment.fileName}`);
  }

  getFileIcon(fileType: string): string {
    if (fileType?.startsWith('image/')) return 'image';
    if (fileType === 'application/pdf') return 'picture_as_pdf';
    if (fileType?.includes('word')) return 'description';
    return 'insert_drive_file';
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleString();
  }

  showSuccess(message: string) {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      panelClass: ['success-snackbar']
    });
  }

  showError(message: string) {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      panelClass: ['error-snackbar']
    });
  }

  showInfo(message: string) {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      panelClass: ['info-snackbar']
    });
  }

  onBack() {
    window.history.back();
  }
}