import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class IntegrationsService {

  private AppIntegrationUrl = environment.hostName + "api/AppsIntegrationDetails/";
  constructor(
    private http: HttpClient
  ) { }

  //App integrations

  createSlackIntegration(details): Observable<any> {
    return this.http.post(`${this.AppIntegrationUrl}create`, details);

  }

  updateSlackIntegration(details): Observable<any> {
    return this.http.put(`${this.AppIntegrationUrl}update`, details);
  }

  getActiveIntegrationByOrgId(id): Observable<any> {
    return this.http.get(`${this.AppIntegrationUrl}getActiveIntegrationByOrgId/${id}`, id);
  }

  getActiveIntegrationByOrgIdAndModule(details): Observable<any> {
    return this.http.put(`${this.AppIntegrationUrl}getIntegrationByOrgIdAndModule`, details);
  }

  deleteIntegration(id): Observable<any> {
    return this.http.put(`${this.AppIntegrationUrl}delete/${id}`, id);
  }

  pauseResumeIntegration(details): Observable<any> {
    return this.http.put(`${this.AppIntegrationUrl}pauseOrResume`, details);
  }

  getIntegrationById(id): Observable<any> {
    return this.http.get(`${this.AppIntegrationUrl}getIntegrationById/${id}`, id);
  }

  getslackDetails(details): Observable<any> {
    return this.http.put(`${this.AppIntegrationUrl}getIntegrationByOrgIdAndModule`, details);
  }

}
