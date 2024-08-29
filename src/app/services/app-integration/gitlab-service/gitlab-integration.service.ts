import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/internal/Observable';
import { environment } from '..//..//..//../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class GitlabIntegrationService {

  constructor(private http: HttpClient) { }
  private gitlabConfigUrl = environment.hostName + "api/gitlabintegration/";
 

  createGitLabConfig(details): Observable<any> {
    return this.http.post(`${this.gitlabConfigUrl}create`, details);
  }

  updateGitLabConfig(details): Observable<any> {
    return this.http.put(`${this.gitlabConfigUrl}update`, details);
  }

  updateGitLabIntegration(details): Observable<any> {
    return this.http.put(`${this.gitlabConfigUrl}updateGitLabIntegration`, details);
  }

  getGitLabDetailsByOrgid(orgId): Observable<any> {
    return this.http.get(`${this.gitlabConfigUrl}getgitlabdetailsbyorgid/${orgId}`);
  }

  getGitLabDetailsDeleteByid(details): Observable<any> {
    return this.http.put(`${this.gitlabConfigUrl}getGitLabDetailsDeleteByid`,details);
  }

  getgitlabdetailsbyid(id): Observable<any> {
    return this.http.get(`${this.gitlabConfigUrl}getgitlabdetailsbyid/${id}`);
  }
}
