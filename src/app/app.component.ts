import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

// PrimeNG Components (IMPORTACIÓN DIRECTA - standalone)
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-root',
  standalone: true,  // ✅ Importante: standalone
  imports: [
    RouterOutlet,
    // PrimeNG components standalone
    ButtonModule,
    ToastModule,
    CardModule
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'sistema-becas-frontend';
}