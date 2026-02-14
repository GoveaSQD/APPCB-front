import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-universidades',
  standalone: true,
  imports: [CommonModule, CardModule],
  template: `
    <p-card header="Universidades">
      <p class="text-center text-gray-500 py-5">
        <i class="pi pi-building text-4xl block mb-3"></i>
        Módulo de Universidades - En construcción
      </p>
    </p-card>
  `
})
export class UniversidadesComponent {}