import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-becados',
  standalone: true,
  imports: [CommonModule, CardModule, ButtonModule],
  template: `
    <div class="p-4">
      <div class="flex justify-content-between align-items-center mb-4">
        <h1 class="text-3xl font-bold">Becados</h1>
        <p-button label="Nuevo Becado" icon="pi pi-plus"></p-button>
      </div>
      <p-card>
        <p class="text-center text-gray-500">Módulo de Becados - En construcción</p>
      </p-card>
    </div>
  `
})
export class BecadosComponent {}