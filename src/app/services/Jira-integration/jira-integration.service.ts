import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class JiraIntegrationService {
  private BaseUrl = environment.hostName + "api/jiraintegration/";
  constructor(private http: HttpClient) { }

  getJiraIssues(data): Observable<any>{
    return this.http.post(`${this.BaseUrl}getjiraissues`, data);
  }

  createJiraCredentials(data): Observable<any>{
    return this.http.post(`${this.BaseUrl}create`, data);
  }

  getJiraCredByOrgId(id): Observable<any>{
    return this.http.get(`${this.BaseUrl}getjiracredbyorgid/${id}`);
  }

  getJiraCredById(id): Observable<any>{
    return this.http.get(`${this.BaseUrl}getjiracredbyid/${id}`);
  }

  update(data): Observable<any>{
    return this.http.put(`${this.BaseUrl}update`,data);
  }

  deleteJiraConfig(id): Observable<any>{
    return this.http.put(`${this.BaseUrl}delete/${id}`,id);
  }

  getjiraProjectsByOrgid(id): Observable<any>{
    return this.http.get(`${this.BaseUrl}getjiraprojectsbyorgid/${id}`);
  }

  getAllBoardDetails(data):Observable<any> {
    return this.http.post(`${this.BaseUrl}getAllboardId`,data);
  }

  getBacklogDetails(data):Observable<any>{
    return this.http.post(`${this.BaseUrl}getBacklogDetails`,data);
  }
}
