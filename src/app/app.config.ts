import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';
import { MessageService } from 'primeng/api';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { ConfirmationService } from 'primeng/api';

// Temas
import Aura from '@primeng/themes/aura';
import { definePreset } from '@primeng/themes';

const CustomPreset = definePreset(Aura, {
  primitive: {
    borderRadius: {
      none: "0",
      xs: "2px",
      sm: "4px",
      md: "6px",
      lg: "8px",
      xl: "12px"
    }
  },
  semantic: {
    primary: {
      50: "#e6eaf0",
      100: "#cdd5e1",
      200: "#9aabc4",
      300: "#6882a6",
      400: "#355888",
      500: "#1f3d66",
      600: "#193152",
      700: "#13253d",
      800: "#0c1929",
      900: "#060c14"
    }
  }
});

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptorsFromDi()),
    provideAnimationsAsync(),
    providePrimeNG({
      theme: {
        preset: CustomPreset,
        options: {
          darkModeSelector: false,
          cssLayer: {
            name: 'primeng',
            order: 'theme, base, primeng'
          }
        }
      },
      ripple: true
    }),
    MessageService,
    ConfirmationService
  ]
};