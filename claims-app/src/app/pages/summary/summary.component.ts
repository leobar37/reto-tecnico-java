import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatDividerModule } from '@angular/material/divider';

import { ClaimApiService } from '../../core/services/claim-api.service';
import { ClaimResponse, ClaimStatusEnum } from '../../core/models';

interface DashboardStats {
  totalClaims: number;
  claimsByStatus: { [key: string]: number };
  recentClaims: ClaimResponse[];
  averageResolutionDays: number;
  topCustomers: { customerId: number; count: number }[];
}

interface ChartData {
  labels: string[];
  values: number[];
  colors: string[];
}

@Component({
  selector: 'app-summary',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    MatChipsModule,
    MatGridListModule,
    MatDividerModule
  ],
  templateUrl: './summary.component.html',
  styleUrls: ['./summary.component.scss']
})
export class SummaryComponent implements OnInit {
  loading = signal(false);
  error = signal<string | null>(null);
  stats = signal<DashboardStats | null>(null);
  statusChartData = signal<ChartData | null>(null);

  constructor(private claimService: ClaimApiService) {}

  ngOnInit() {
    this.loadSummaryData();
  }

  loadSummaryData() {
    this.loading.set(true);
    this.error.set(null);
    
    this.claimService.getClaims().subscribe({
      next: (claims) => {
        const stats = this.calculateStats(claims);
        this.stats.set(stats);
        this.generateChartData(stats);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load summary data');
        this.loading.set(false);
      }
    });
  }

  calculateStats(claims: ClaimResponse[]): DashboardStats {
    const totalClaims = claims.length;
    
    // Claims by status
    const claimsByStatus: { [key: string]: number } = {};
    Object.values(ClaimStatusEnum).forEach(status => {
      claimsByStatus[status] = claims.filter(claim => claim.estadoActual === status).length;
    });

    // Recent claims (last 5)
    const recentClaims = claims
      .sort((a, b) => new Date(b.fechaCreacion).getTime() - new Date(a.fechaCreacion).getTime())
      .slice(0, 5);

    // Average resolution days (simplified calculation)
    const resolvedClaims = claims.filter(claim => 
      claim.estadoActual === ClaimStatusEnum.RESUELTO || 
      claim.estadoActual === ClaimStatusEnum.CERRADO
    );
    
    let totalDays = 0;
    resolvedClaims.forEach(claim => {
      const created = new Date(claim.fechaCreacion);
      const updated = new Date(claim.fechaActualizacion);
      const diffTime = Math.abs(updated.getTime() - created.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      totalDays += diffDays;
    });
    
    const averageResolutionDays = resolvedClaims.length > 0 ? 
      Math.round(totalDays / resolvedClaims.length) : 0;

    // Top customers by claim count
    const customerCounts: { [key: number]: number } = {};
    claims.forEach(claim => {
      customerCounts[claim.clienteId] = (customerCounts[claim.clienteId] || 0) + 1;
    });
    
    const topCustomers = Object.entries(customerCounts)
      .map(([customerId, count]) => ({ customerId: parseInt(customerId), count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      totalClaims,
      claimsByStatus,
      recentClaims,
      averageResolutionDays,
      topCustomers
    };
  }

  generateChartData(stats: DashboardStats) {
    const labels = Object.keys(stats.claimsByStatus);
    const values = Object.values(stats.claimsByStatus);
    const colors = labels.map(status => this.getStatusColor(status));

    this.statusChartData.set({
      labels,
      values,
      colors
    });
  }

  getStatusColor(status: string): string {
    switch (status) {
      case ClaimStatusEnum.CREADO: return '#2196F3';
      case ClaimStatusEnum.EN_PROCESO: return '#FF9800';
      case ClaimStatusEnum.RESUELTO: return '#4CAF50';
      case ClaimStatusEnum.CERRADO: return '#9E9E9E';
      case ClaimStatusEnum.CANCELADO: return '#F44336';
      default: return '#607D8B';
    }
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case ClaimStatusEnum.CREADO: return 'fiber_new';
      case ClaimStatusEnum.EN_PROCESO: return 'pending';
      case ClaimStatusEnum.RESUELTO: return 'check_circle';
      case ClaimStatusEnum.CERRADO: return 'lock';
      case ClaimStatusEnum.CANCELADO: return 'cancel';
      default: return 'help';
    }
  }

  getPercentage(value: number, total: number): number {
    return total > 0 ? Math.round((value / total) * 100) : 0;
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }

  refresh() {
    this.loadSummaryData();
  }

  // Helper method to access Object.keys in template
  getObjectKeys(obj: any): string[] {
    return Object.keys(obj || {});
  }

  // Helper method to safely get status count
  getStatusCount(status: string): number {
    return (this.stats()?.claimsByStatus && this.stats()?.claimsByStatus[status]) || 0;
  }

  // Helper methods for specific calculations
  getActiveClaims(): number {
    return this.getStatusCount('EN_PROCESO') + this.getStatusCount('CREADO');
  }

  getResolvedClaims(): number {
    return this.getStatusCount('RESUELTO') + this.getStatusCount('CERRADO');
  }
}