import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SuperAdminDashboardService {

  constructor(private http: HttpClient) { }

  private BaseUrl = environment.hostName + "api/OrgDetails/";
  
  getTotalOrgCount():Observable<any>{
    return this.http.get(`${this.BaseUrl}getTotalOrgDetailsCount`);
  }
  
}
