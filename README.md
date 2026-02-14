# SistemaBecasFrontend

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 19.2.19.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.


🎓 Sistema de Gestión de Becas - Frontend
Aplicación frontend para gestión de becas universitarias desarrollada con Angular 19 + PrimeNG 19

📋 Tabla de Contenidos
Stack Tecnológico

Versiones

Estructura del Proyecto

Instalación

Configuración

Ejecución

Módulos PrimeNG

Backend API

Estructura de Carpetas

Comandos Útiles

🛠️ Stack Tecnológico
Frontend Stack
Tecnología	Versión	Propósito
Angular	19.2.18	Framework principal
Angular CLI	19.2.19	Herramientas de desarrollo
PrimeNG	19.1.3	Componentes UI
PrimeIcons	7.0.0	Iconos
PrimeFlex	3.3.1	Sistema de grid CSS
TypeScript	5.7.3	Lenguaje
RxJS	7.8.2	Programación reactiva
Node.js	22.17.0	Runtime
npm	11.6.0	Package manager
Arquitectura
✅ Standalone Components (Angular 19+)

✅ Lazy Loading

✅ HTTP Interceptors

✅ Guards

✅ Reactive Forms

📦 Versiones
Versiones Instaladas (Confirmadas)
bash
Angular CLI:          19.2.19
Angular Framework:    19.2.18
Node:                 22.17.0
npm:                  11.6.0
PrimeNG:              19.1.3
PrimeIcons:           7.0.0
PrimeFlex:            3.3.1
TypeScript:           5.7.3
RxJS:                 7.8.2
Backend (Referencia)
bash
Node.js:              v22.17.0
Express:              4.18.x
MySQL:                8.0.x
JWT:                  Para autenticación
API URL:              http://localhost:3000/api
🚀 Instalación
Requisitos Previos
bash
node --version    # >= 22.17.0
npm --version     # >= 11.6.0
Pasos de Instalación
bash
# 1. Clonar repositorio (o crear proyecto nuevo)
git clone [url-del-repositorio]
cd sistema-becas-frontend

# 2. Instalar dependencias (ya ejecutado)
npm install

# 3. Instalar PrimeNG y dependencias (ya ejecutado)
npm install primeng@19.1.3 primeicons@7.0.0 primeflex@3.3.1

# 4. Verificar instalación
ng version
npm list primeng primeicons primeflex
⚙️ Configuración
1. angular.json
json
{
  "projects": {
    "sistema-becas-frontend": {
      "architect": {
        "build": {
          "options": {
            "styles": [
              "node_modules/primeng/resources/themes/lara-light-blue/theme.css",
              "node_modules/primeng/resources/primeng.min.css",
              "node_modules/primeicons/primeicons.css",
              "node_modules/primeflex/primeflex.css",
              "src/styles.css"
            ]
          }
        }
      }
    }
  }
}
2. app.config.ts
typescript
import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { routes } from './app.routes';

// PrimeNG Services
import { MessageService } from 'primeng/api';
import { ConfirmationService } from 'primeng/api';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(),
    provideAnimations(),
    MessageService,
    ConfirmationService
  ]
};
3. environments/environment.ts
typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api'
};
🎨 Módulos PrimeNG Instalados
Componentes Disponibles
Módulo	Uso	Estado
ButtonModule	Botones	✅
InputTextModule	Campos de texto	✅
PasswordModule	Campos contraseña	✅
CardModule	Tarjetas	✅
ToastModule	Notificaciones	✅
TableModule	Tablas de datos	✅
DialogModule	Modales	✅
ConfirmDialogModule	Diálogos de confirmación	✅
PanelMenuModule	Menú lateral	✅
SplitButtonModule	Botones con menú	✅
DropdownModule	Selectores	✅
CalendarModule	Calendario/fechas	✅
InputNumberModule	Números	✅
InputTextareaModule	Áreas de texto	✅
ProgressSpinnerModule	Loaders	✅
RippleModule	Efectos	✅
Temas Disponibles
lara-light-blue (actual)

lara-dark-blue

bootstrap4-light-blue

md-light-indigo

fluent-light

📁 Estructura del Proyecto
text
sistema-becas-frontend/
├── src/
│   ├── app/
│   │   ├── core/
│   │   │   ├── guards/
│   │   │   ├── interceptors/
│   │   │   ├── models/
│   │   │   └── services/
│   │   ├── features/
│   │   │   ├── auth/
│   │   │   ├── dashboard/
│   │   │   ├── universidades/
│   │   │   ├── modalidades/
│   │   │   ├── becados/
│   │   │   └── usuarios/
│   │   ├── shared/
│   │   │   ├── components/
│   │   │   └── pipes/
│   │   ├── layout/
│   │   │   ├── menu/
│   │   │   └── header/
│   │   ├── app.component.ts
│   │   ├── app.config.ts
│   │   └── app.routes.ts
│   ├── assets/
│   └── environments/
│       ├── environment.ts
│       └── environment.prod.ts
├── angular.json
├── package.json
└── README.md
🔌 Backend API
Endpoints Disponibles
Recurso	Método	Endpoint	Auth
Auth	POST	/api/auth/login	❌
POST	/api/auth/register	❌
GET	/api/auth/profile	✅
Universidades	CRUD	/api/universidades	✅
Modalidades	CRUD	/api/modalidades	✅
Becados	CRUD	/api/becados	✅
Usuarios	CRUD	/api/usuarios	✅
🚀 Ejecución
bash
# Desarrollo
ng serve
# http://localhost:4200

# Desarrollo con host específico
ng serve --host 0.0.0.0 --port 4200

# Build de producción
ng build --prod

# Tests
ng test
ng e2e