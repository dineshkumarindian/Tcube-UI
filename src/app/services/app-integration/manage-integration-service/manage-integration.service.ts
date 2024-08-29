import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/internal/Observable';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ManageIntegrationService {

  constructor(private http: HttpClient) { }
  
  private ManageIntegration = environment.hostName + "api/ManageIntegration/";

  createIntegrationAcess(details): Observable<any> {
    return this.http.post(`${this.ManageIntegration}create`, details);
  }

  updateIntegrationAcess(details): Observable<any> {
    return this.http.put(`${this.ManageIntegration}update`, details);
  }

  getIntegrationAccessData(details): Observable<any> {
    return this.http.put(`${this.ManageIntegration}getOrgAMdetails`,details);
  }
  updateGetAllSlackConfig(details):Observable<any>{
    return this.http.put(`${this.ManageIntegration}updategetallslack`,details);
  }
}
