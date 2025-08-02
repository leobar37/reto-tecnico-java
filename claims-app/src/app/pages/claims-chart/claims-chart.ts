import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { Chart, registerables } from 'chart.js';
import { ClaimApiService } from '../../core/services/claim-api.service';
import { ClaimStatusEnum } from '../../core/models/claim-status.model';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-claims-chart',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  templateUrl: './claims-chart.html',
  styleUrls: ['./claims-chart.scss']
})
export class ClaimsChartComponent implements OnInit {
  public barChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: 'top',
      },
      title: {
        display: true,
        text: 'Claims by Status'
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1
        }
      }
    }
  };

  public barChartData: ChartData<'bar'> = {
    labels: [],
    datasets: [
      {
        data: [],
        label: 'Number of Claims',
        backgroundColor: [
          'rgba(33, 150, 243, 0.8)',  // INGRESADO - Blue
          'rgba(255, 152, 0, 0.8)',   // EN_PROCESO - Orange
          'rgba(76, 175, 80, 0.8)',   // RESUELTO - Green
          'rgba(158, 158, 158, 0.8)', // CERRADO - Grey
          'rgba(244, 67, 54, 0.8)',   // RECHAZADO - Red
          'rgba(156, 39, 176, 0.8)',  // ESCALADO - Purple
          'rgba(255, 193, 7, 0.8)'    // PENDIENTE_INFORMACION - Yellow
        ],
        borderColor: [
          'rgba(33, 150, 243, 1)',
          'rgba(255, 152, 0, 1)',
          'rgba(76, 175, 80, 1)',
          'rgba(158, 158, 158, 1)',
          'rgba(244, 67, 54, 1)',
          'rgba(156, 39, 176, 1)',
          'rgba(255, 193, 7, 1)'
        ],
        borderWidth: 1
      }
    ]
  };

  public barChartType: ChartType = 'bar';
  public isLoading = true;
  public error: string | null = null;

  constructor(private claimApiService: ClaimApiService) {}

  ngOnInit(): void {
    this.loadChartData();
  }

  private loadChartData(): void {
    this.isLoading = true;
    this.error = null;

    this.claimApiService.getClaims().subscribe({
      next: (claims) => {
        this.processClaimsData(claims);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading claims:', error);
        this.error = 'Failed to load claims data';
        this.isLoading = false;
      }
    });
  }

  private processClaimsData(claims: any[]): void {
    const statusCounts = new Map<string, number>();
    
    // Initialize all status counts to 0
    Object.values(ClaimStatusEnum).forEach(status => {
      statusCounts.set(status, 0);
    });

    // Count claims by status
    claims.forEach(claim => {
      const currentCount = statusCounts.get(claim.estadoActual) || 0;
      statusCounts.set(claim.estadoActual, currentCount + 1);
    });

    // Update chart data
    this.barChartData.labels = Array.from(statusCounts.keys());
    this.barChartData.datasets[0].data = Array.from(statusCounts.values());
  }

  public refreshChart(): void {
    this.loadChartData();
  }
}