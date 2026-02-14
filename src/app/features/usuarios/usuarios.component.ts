import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule, CardModule, ButtonModule],
  template: `
    <div class="p-4">
      <div class="flex justify-content-between align-items-center mb-4">
        <h1 class="text-3xl font-bold">Usuarios</h1>
        <p-button label="Nuevo Usuario" icon="pi pi-plus"></p-button>
      </div>
      <p-card>
        <p class="text-center text-gray-500">Módulo de Usuarios - En construcción (Solo admin)</p>
      </p-card>
    </div>
  `
})
export class UsuariosComponent {}