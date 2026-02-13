import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { routes } from './app.routes';

// PrimeNG
import { MessageService } from 'primeng/api';
import { ConfirmationService } from 'primeng/api';

// PrimeNG Modules (si necesitas importarlos globalmente)
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { CardModule } from 'primeng/card';
import { ToastModule } from 'primeng/toast';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { PanelMenuModule } from 'primeng/panelmenu';
import { SplitButtonModule } from 'primeng/splitbutton';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(),
    provideAnimations(),
    
    // PrimeNG Services
    MessageService,
    ConfirmationService,
    
    // Si quieres importar módulos de PrimeNG globalmente
    importProvidersFrom(
      ButtonModule,
      InputTextModule,
      CardModule,
      ToastModule,
      TableModule,
      DialogModule,
      ConfirmDialogModule,
      PanelMenuModule,
      SplitButtonModule
    )
  ]
};