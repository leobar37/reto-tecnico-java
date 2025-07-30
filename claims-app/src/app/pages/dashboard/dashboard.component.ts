import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
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

import { ClaimApiService } from '../../core/services/claim-api.service';
import { ClaimResponse, ClaimStatusEnum } from '../../core/models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
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
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  displayedColumns: string[] = ['codigo', 'titulo', 'clienteId', 'estadoActual', 'fechaCreacion', 'actions'];
  claims = signal<ClaimResponse[]>([]);
  filteredClaims = signal<ClaimResponse[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  
  filterForm: FormGroup;
  statusOptions = Object.values(ClaimStatusEnum);
  
  pageSize = 10;
  pageIndex = 0;
  totalItems = 0;
  pagedClaims = signal<ClaimResponse[]>([]);

  constructor(
    private claimService: ClaimApiService,
    private fb: FormBuilder
  ) {
    this.filterForm = this.fb.group({
      empresa: [''],
      estado: [''],
      fechaInicio: [''],
      fechaFin: [''],
      searchText: ['']
    });
  }

  ngOnInit() {
    this.loadClaims();
    this.setupFilters();
  }

  loadClaims() {
    this.loading.set(true);
    this.error.set(null);
    
    this.claimService.getClaims().subscribe({
      next: (claims) => {
        this.claims.set(claims);
        this.filteredClaims.set(claims);
        this.totalItems = claims.length;
        this.updatePagedClaims();
        this.loading.set(false);
      },
      error: (error) => {
        this.error.set('Error loading claims');
        this.loading.set(false);
      }
    });
  }

  setupFilters() {
    this.filterForm.valueChanges.subscribe(() => {
      this.applyFilters();
    });
  }

  applyFilters() {
    const filters = this.filterForm.value;
    let filtered = this.claims();

    if (filters.estado) {
      filtered = filtered.filter(claim => claim.estadoActual === filters.estado);
    }

    if (filters.empresa) {
      filtered = filtered.filter(claim => 
        claim.clienteId.toString().includes(filters.empresa)
      );
    }

    if (filters.searchText) {
      const searchLower = filters.searchText.toLowerCase();
      filtered = filtered.filter(claim => 
        claim.titulo.toLowerCase().includes(searchLower) ||
        claim.descripcion.toLowerCase().includes(searchLower) ||
        claim.codigo.toLowerCase().includes(searchLower)
      );
    }

    if (filters.fechaInicio) {
      const startDate = new Date(filters.fechaInicio);
      filtered = filtered.filter(claim => 
        new Date(claim.fechaCreacion) >= startDate
      );
    }

    if (filters.fechaFin) {
      const endDate = new Date(filters.fechaFin);
      filtered = filtered.filter(claim => 
        new Date(claim.fechaCreacion) <= endDate
      );
    }

    this.filteredClaims.set(filtered);
    this.totalItems = filtered.length;
    this.pageIndex = 0;
    this.updatePagedClaims();
  }

  onPageChange(event: PageEvent) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.updatePagedClaims();
  }

  updatePagedClaims() {
    const startIndex = this.pageIndex * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.pagedClaims.set(this.filteredClaims().slice(startIndex, endIndex));
  }

  clearFilters() {
    this.filterForm.reset();
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
}