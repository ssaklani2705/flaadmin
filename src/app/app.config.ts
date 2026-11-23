import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { HTTP_INTERCEPTORS, provideHttpClient, withFetch, withInterceptorsFromDi } from '@angular/common/http';
import { AuthInterceptor } from './auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),

    // 🚀 Router (no prerendering, just normal SPA)
    provideRouter(routes),

    // 🚀 Client hydration (only needed if SSR/Universal is used, safe to keep)
    provideClientHydration(withEventReplay()),

    // 🚀 HttpClient setup
    provideHttpClient(
      withInterceptorsFromDi(),
      withFetch()
    ),

    // 🚀 Global AuthInterceptor
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    }
  ]
};