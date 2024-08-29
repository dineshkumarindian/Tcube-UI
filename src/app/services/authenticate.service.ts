import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthenticateService {
  private BaseUrl = environment.hostName + "api/login/";
  constructor(private http: HttpClient) { }

  authenticateSA(logindetails):Observable<any> {
    return this.http.post(this.BaseUrl + 'authenticateSA',logindetails)
  }

  authenticateOrgadmin(logindetails):Observable<any> {
    return this.http.post(this.BaseUrl + 'authenticateorg',logindetails)
  }

  authenticateEmployee(logindetails):Observable<any> {
    return this.http.post(this.BaseUrl + 'authenticateEmployee',logindetails)
  }

  commonAuthentication(logindetails):Observable<any> {
    return this.http.post(this.BaseUrl + 'authenticate',logindetails)
  }

  getauthenticatedUser(userdetails):Observable<any> {
    return this.http.post(this.BaseUrl + 'getauthenticatedUser',userdetails);
  }
}
