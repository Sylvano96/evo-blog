import { mergeApplicationConfig, ApplicationConfig } from '@angular/core';
import { provideServerRendering } from '@angular/platform-server';
import { provideServerRouting } from '@angular/ssr';
import { appConfig } from './app.config';
import { serverRoutes } from './app.routes.server';
import { API_BASE_URL } from './core/api.config';

const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering(),
    provideServerRouting(serverRoutes),
    // During server-side rendering the API is called directly (in Docker: http://api:8080).
    { provide: API_BASE_URL, useValue: process.env['API_INTERNAL_URL'] || 'http://localhost:8080' },
  ]
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
