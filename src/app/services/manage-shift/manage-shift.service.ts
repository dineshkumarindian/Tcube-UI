import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ManageShiftService {
  private BaseUrl = environment.hostName + "api/manageshift/";
  constructor(private http: HttpClient) { }

  create(data):Observable<any> {
    return this.http.post(`${this.BaseUrl}create`, data);
  }

  getById(id):Observable<any>{
    return this.http.get(`${this.BaseUrl}getbyid/${id}`,id);
  }

  getShiftDetailsByOrgId(id):Observable<any>{
    return this.http.get(`${this.BaseUrl}getshiftsbyorgid/${id}`,id);
  }

  update(data):Observable<any>{
    return this.http.put(`${this.BaseUrl}update`, data);
  }

  delete(data):Observable<any>{
    return this.http.put(`${this.BaseUrl}delete`, data);
  }

  checkDuplicate(data):Observable<any>{
    return this.http.put(`${this.BaseUrl}checkduplicate`, data);
  }
}
