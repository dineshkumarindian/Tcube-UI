import { Injectable } from '@angular/core';
import { HttpHandler, HttpHeaders, HttpInterceptor, HttpRequest, HTTP_INTERCEPTORS } from '@angular/common/http';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class ApiAuthService {

  constructor(
    private router: Router
  ) { }
  intercept(req: HttpRequest<any>, next: HttpHandler) {
    if (req.url.includes('hooks.slack.com')) {
      return next.handle(req);
    } else {
      const authReq = req.clone({
        headers: req.headers.set('Authorization', 'Basic ' + btoa('tcube-web-admin' + ':' + 'd[7%G+N66u:hXxn'))
      });
      return next.handle(authReq);
    }
  }
  
}

export const authInterceptorProviders = [
  { provide: HTTP_INTERCEPTORS, useClass: ApiAuthService, multi: true }
];
