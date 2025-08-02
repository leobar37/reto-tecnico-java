import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
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
import { MatTooltipModule } from '@angular/material/tooltip';
import jsPDF from 'jspdf';

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
    MatChipsModule,
    MatTooltipModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {
  displayedColumns: string[] = ['titulo', 'clienteId', 'estadoActual', 'fechaCreacion', 'actions'];
  
  loading = signal(false);
  error = signal<string | null>(null);
  exportingPdf = signal(false);
  
  filterForm: FormGroup;
  statusOptions = Object.values(ClaimStatusEnum);
  
  pageSize = 10;
  pageIndex = 0;
  
  claims: ClaimResponse[] = [];
  filteredClaims: ClaimResponse[] = [];
  pagedClaims: ClaimResponse[] = [];
  totalItems = 0;
  
  private subscription: Subscription = new Subscription();

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
    this.setupFilterWatcher();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  private setupFilterWatcher() {
    const filterSub = this.filterForm.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr))
    ).subscribe(() => {
      this.applyFilters();
      this.updatePagination();
    });
    
    this.subscription.add(filterSub);
  }

  private loadClaims() {
    this.loading.set(true);
    this.error.set(null);
    
    const claimsSub = this.claimService.getClaims().subscribe({
      next: (claims) => {
        this.claims = claims;
        this.applyFilters();
        this.updatePagination();
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading claims:', error);
        this.error.set(`Error loading claims: ${error.message || 'Unknown error'}`);
        this.loading.set(false);
        this.claims = [];
        this.filteredClaims = [];
        this.pagedClaims = [];
        this.totalItems = 0;
      }
    });
    
    this.subscription.add(claimsSub);
  }

  private applyFilters() {
    const filters = this.filterForm.value;
    let filtered = [...this.claims];

    if (filters.searchText) {
      const searchText = filters.searchText.toLowerCase();
      filtered = filtered.filter(claim => 
        claim.titulo?.toLowerCase().includes(searchText) ||
        claim.descripcion?.toLowerCase().includes(searchText) ||
        claim.codigo?.toLowerCase().includes(searchText)
      );
    }

    if (filters.estado) {
      filtered = filtered.filter(claim => claim.estadoActual === filters.estado);
    }

    if (filters.empresa) {
      filtered = filtered.filter(claim => 
        claim.clienteId?.toString().includes(filters.empresa)
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

    this.filteredClaims = filtered;
    this.totalItems = filtered.length;
  }

  private updatePagination() {
    const startIndex = this.pageIndex * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.pagedClaims = this.filteredClaims.slice(startIndex, endIndex);
  }


  onPageChange(event: PageEvent) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.updatePagination();
  }

  clearFilters() {
    this.filterForm.reset();
    this.pageIndex = 0;
    this.applyFilters();
    this.updatePagination();
  }

  refreshClaims() {
    this.loadClaims();
  }

  getStatusColor(status: string): string {
    switch (status) {
      case ClaimStatusEnum.INGRESADO: return 'primary';
      case ClaimStatusEnum.EN_PROCESO: return 'accent';
      case ClaimStatusEnum.RESUELTO: return 'primary';
      case ClaimStatusEnum.CERRADO: return '';
      case ClaimStatusEnum.RECHAZADO: return 'warn';
      default: return '';
    }
  }

  exportToPdf() {
    this.exportingPdf.set(true);
    
    try {
      const pdf = this.generatePdf(this.filteredClaims);
      const fileName = `reclamaciones_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);
      
      this.exportingPdf.set(false);
    } catch (error) {
      console.error('Error exporting PDF:', error);
      this.exportingPdf.set(false);
      this.error.set('Error al generar el PDF. Inténtalo de nuevo.');
    }
  }

  private generatePdf(claims: ClaimResponse[]): jsPDF {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(20);
    doc.text('Reporte de Reclamaciones', 20, 20);
    
    // Add date
    doc.setFontSize(12);
    doc.text(`Fecha de generación: ${new Date().toLocaleDateString()}`, 20, 35);
    doc.text(`Total de reclamaciones: ${claims.length}`, 20, 45);
    
    // Add table headers
    const headers = ['Título', 'Empresa', 'Estado', 'Fecha'];
    const startY = 60;
    let currentY = startY;
    
    // Header styling
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    
    const colWidths = [60, 30, 40, 40];
    const colX = [20, 80, 110, 150];
    
    // Draw headers
    headers.forEach((header, index) => {
      doc.text(header, colX[index], currentY);
    });
    
    // Draw header line
    doc.line(20, currentY + 2, 190, currentY + 2);
    currentY += 10;
    
    // Add data rows
    doc.setFont('helvetica', 'normal');
    claims.forEach((claim, index) => {
      if (currentY > 270) { // New page if near bottom
        doc.addPage();
        currentY = 20;
      }
      
      const rowData = [
        this.truncateText(claim.titulo, 25),
        claim.clienteId?.toString() || '',
        claim.estadoActual || '',
        claim.fechaCreacion ? new Date(claim.fechaCreacion).toLocaleDateString() : ''
      ];
      
      rowData.forEach((data, colIndex) => {
        doc.text(data, colX[colIndex], currentY);
      });
      
      currentY += 8;
    });
    
    return doc;
  }
  
  private truncateText(text: string | undefined | null, maxLength: number): string {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  }
}