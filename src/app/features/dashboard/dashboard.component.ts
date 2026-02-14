import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, CardModule],
  template: `
    <div class="p-4">
      <h1 class="text-3xl font-bold mb-4">Dashboard</h1>
      <div class="grid">
        <div class="col-12 md:col-6 lg:col-3">
          <p-card header="Becados" subheader="Total">
            <p class="text-4xl font-bold text-center">0</p>
          </p-card>
        </div>
        <div class="col-12 md:col-6 lg:col-3">
          <p-card header="Universidades" subheader="Total">
            <p class="text-4xl font-bold text-center">0</p>
          </p-card>
        </div>
        <div class="col-12 md:col-6 lg:col-3">
          <p-card header="Modalidades" subheader="Total">
            <p class="text-4xl font-bold text-center">0</p>
          </p-card>
        </div>
        <div class="col-12 md:col-6 lg:col-3">
          <p-card header="Usuarios" subheader="Total">
            <p class="text-4xl font-bold text-center">0</p>
          </p-card>
        </div>
      </div>
    </div>
  `
})
export class DashboardComponent {}