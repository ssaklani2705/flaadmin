import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { provideHttpClient } from '@angular/common/http';
import { importProvidersFrom } from '@angular/core';
import { provideRouter, RouterModule } from '@angular/router';
import { routes } from './app/app.routes'; // make sure this file exports routes

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));

//DONE BY ME
//   bootstrapApplication(AppComponent, {
//   providers: [provideHttpClient()]
// });
// bootstrapApplication(AppComponent, {
//   providers: [
//     importProvidersFrom(RouterModule.forRoot(routes))
//   ]
// });

// bootstrapApplication(AppComponent, {
//   providers: [
//     provideRouter(routes)
//   ]
// });
