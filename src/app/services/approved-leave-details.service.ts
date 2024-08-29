import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApprovedLeaveDetailsService {

  constructor(private http: HttpClient) { }

  private BaseUrl = environment.hostName + "api/ApprovedLeaveDetails/";

  getActiveleaveByEmpIdAndYearByOrgid(data):Observable<any>{
    return this.http.put(`${this.BaseUrl}getapprovedLeaveCountsByEmpIdAndLTId`, data);
  }
  
}
