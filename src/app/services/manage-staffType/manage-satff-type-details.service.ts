import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ManageSatffTypeDetailsService {
  private BaseUrl = environment.hostName + "api/manageStaffType/";
  constructor(private http: HttpClient) { }

  createStaffTypeDetails(data):Observable<any> {
    return this.http.post(`${this.BaseUrl}create`, data);
  }

  deleteStaffTypeDetails(data):Observable<any> {
    return this.http.put(`${this.BaseUrl}deleteStaffType`, data);
  }

  getStaffTypesByOrgId(id): Observable<any> {
    return this.http.get(`${this.BaseUrl}getAllStaffTypesbyOrgId/${id}`,id);
  }
}
