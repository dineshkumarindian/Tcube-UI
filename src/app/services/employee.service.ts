import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../src/environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {

  //*************************************** To Set Base path for API integratrion**********************************************************//
  private BaseUrl = environment.hostName + "api/EmployeeDetails/";

  constructor(private http: HttpClient) { }

  //******************* For Organization eployee list with name and id details *************************//
  getOrgEmployees(Id:any): Observable<any> {
    return this.http.get(`${this.BaseUrl}getOrgUsers/` + `${Id}`);
  }
  getEmployeeDetails(email:any):Observable<any>{
    return this.http.get(`${this.BaseUrl}getEmployeeByEmail/` + `${email}`);
  } 
}
