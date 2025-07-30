import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { 
    path: 'dashboard', 
    loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  { 
    path: 'claims', 
    loadComponent: () => import('./pages/new-claim/new-claim.component').then(m => m.NewClaimComponent)
  },
  { 
    path: 'claims/:id', 
    loadComponent: () => import('./pages/claim-detail/claim-detail.component').then(m => m.ClaimDetailComponent)
  },
  { 
    path: 'summary', 
    loadComponent: () => import('./pages/summary/summary.component').then(m => m.SummaryComponent)
  },
  { path: '**', redirectTo: '/dashboard' }
];
