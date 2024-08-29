import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ChangePasswordService {
  private BaseUrl = environment.hostName + "api/";
  constructor(private http: HttpClient) { }

  changePasswordForSA(password: any): Observable<any> {
    return this.http.put(`${this.BaseUrl}SuperAdminDetails/ChangePasswordSA`, password)
  }

  changePasswordEmp(password: any): Observable<any> {
    return this.http.put(`${this.BaseUrl}EmployeeDetails/ChangePasswordEmployee`, password)
  }
}

