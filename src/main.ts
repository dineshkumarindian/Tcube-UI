import 'hammerjs';
import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

// import * as Sentry from "@sentry/angular";
// import { instrumentAngularRouting } from '@sentry/angular';
// import { Integrations as TracingIntegrations } from '@sentry/tracing';

// if(environment.name == 'UAT' || environment.name == 'Production'){
//   Sentry.init({
//     dsn: "https://4db0c31f0b774c9eab0d564c273c2797@o4504610077671424.ingest.sentry.io/4504671294652416",
//     integrations: [
//       new TracingIntegrations.BrowserTracing({
//         tracingOrigins: [],
//         routingInstrumentation: instrumentAngularRouting,
//       }),
//     ],
//   environment: environment.name,  
//     // Set tracesSampleRate to 1.0 to capture 100%
//     // of transactions for performance monitoring.
//     // We recommend adjusting this value in production
//     tracesSampleRate: 1.0,
//   });  
// }

if (environment.production) {
  enableProdMode();
}

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));
