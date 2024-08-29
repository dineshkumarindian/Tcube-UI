import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TimesheetService {

  private BaseUrl = environment.hostName + "api/TimesheetApprovalDetails/";
  constructor(private http: HttpClient) { }

  getbyempid(id):Observable<any>{
    return this.http.get(`${this.BaseUrl}getActiveTimesheetByEmpId/${encodeURIComponent(id)}`, id);
  }

  getbyreporterid(id):Observable<any>{
    return this.http.get(`${this.BaseUrl}getActiveTimesheetByApproverId/${encodeURIComponent(id)}`, id);
  }

  getTimesheetById(id):Observable<any>{
    return this.http.get(`${this.BaseUrl}getTimesheetById/${id}`, id);
  }

  getactivependingtimesheetsbyreporterid(id):Observable<any>{
    return this.http.get(`${this.BaseUrl}getActivePendingTimesheetByApproverId/${encodeURIComponent(id)}`, id);
  }
  getactiveapprovedtimesheetsbyreporterid(id):Observable<any>{
    return this.http.get(`${this.BaseUrl}getActiveApprovedTimesheetByApproverId/${encodeURIComponent(id)}`, id);
  }
  getactiverejectedtimesheetsbyreporterid(id):Observable<any>{
    return this.http.get(`${this.BaseUrl}getActiveRejectedTimesheetByApproverId/${encodeURIComponent(id)}`, id);
  }
  getTimesheetDetailsByDate(data):Observable<any>{
    return this.http.put(`${this.BaseUrl}getTimesheetDetailsByDate`, data);
  }
}
