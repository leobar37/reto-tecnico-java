import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatSidenavModule,
    MatToolbarModule,
    MatListModule,
    MatIconModule,
    MatButtonModule
  ],
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.scss']
})
export class MainLayoutComponent {
  menuItems = [
    { label: 'Panel de Control', route: '/dashboard', icon: 'dashboard' },
    { label: 'Nueva Reclamación', route: '/claims', icon: 'add_circle' },
    { label: 'Resumen', route: '/summary', icon: 'summarize' },
    { label: 'Gráficos', route: '/charts', icon: 'bar_chart' }
  ];
}