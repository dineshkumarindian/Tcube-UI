import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ManageBranchDetailsService {
  private BaseUrl = environment.hostName + "api/managebranch/";
  constructor(private http: HttpClient) { }

  createBranchDetails(data):Observable<any> {
    return this.http.post(`${this.BaseUrl}create`, data);
  }

  DeleteBranchDetails(data):Observable<any> {
    return this.http.put(`${this.BaseUrl}Deletebranch`, data);
  }

  getBranchesByOrgId(id): Observable<any> {
    return this.http.get(`${this.BaseUrl}getallbranchesbyorgid/${id}`,id);
  }
}
