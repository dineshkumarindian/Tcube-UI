import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TimeTrackerService {
  private BaseUrl = environment.hostName + "api/TimeTrackerDetails/";
  constructor(private http: HttpClient) { }

  createTaskDetails(taksDetails):Observable<any> {
    return this.http.post(`${this.BaseUrl}create`, taksDetails);
  }

  getTaskDetailsByActive(empid):Observable<any>{
    return this.http.get(`${this.BaseUrl}gettaskdetailsbyactive/${encodeURIComponent(empid)}`,empid);
  }

  updatEndTime(data):Observable<any>{
    return this.http.put(`${this.BaseUrl}updateendtime`, data);
  }

  getbyempidanddate(data):Observable<any>{
    return this.http.put(`${this.BaseUrl}gettaskbyempiddate`, data);
  }

  getsubmittedbyempidanddate(data):Observable<any>{
    return this.http.put(`${this.BaseUrl}getsubmittedtaskbyempiddate`, data);
  }

  getbyempid(id):Observable<any>{
    return this.http.put(`${this.BaseUrl}gettasksbyempid/${encodeURIComponent(id)}`, id);
  }

  deleteById(id: any):Observable<any>{
    return this.http.put(`${this.BaseUrl}delete/${encodeURIComponent(id)}`, id);
  }

  updateNewTime(data):Observable<any>{
    return this.http.put(`${this.BaseUrl}updatenewtimeinterval`, data);
  }

  updateTaskDetails(data):Observable<any>{
    return this.http.put(`${this.BaseUrl}updateTaskDetails`, data);
  }

  bulkDelete(details): Observable<any>{
    return this.http.put(`${this.BaseUrl}bulkDelete`, details);
  }

  getFilterdata(data):Observable<any>{
    return this.http.put(`${this.BaseUrl}getfilterdata`, data);
  }

  getbillingchartdata(data):Observable<any>{
    return this.http.put(`${this.BaseUrl}getbilchartemp`,data);
  }

  getbillingchartmonth(data):Observable<any>{
    return this.http.put(`${this.BaseUrl}getbilchartempmonth`,data);
  }

  updateReporterandtaskstatus(data):Observable<any>{
    return this.http.put(`${this.BaseUrl}updatereporter`,data);
  }
  updateApprovalStatus(data):Observable<any>{
    return this.http.put(`${this.BaseUrl}updateapprovalstatus`,data);
  }
  getprojectjobdropdown(data):Observable<any>{
    return this.http.put(`${this.BaseUrl}getprojectjobdetails`,data);
  }
  QuickAddTaskDetails(taksDetails):Observable<any>{
    return this.http.post(`${this.BaseUrl}createQuickAdd`,taksDetails);
  }
  getBillAndNonBillHoursByOrgIdAndProjects(data):Observable<any>{
    return this.http.put(`${this.BaseUrl}getHoursByOrgIdAndProject`,data);
  }
  getProjectAndJobNames(data):Observable<any> {
    return this.http.put(`${this.BaseUrl}getProjectAndJobNames`,data);
  }
  updateResubmittedTimesheetsbyTimesheetid(id: any):Observable<any>{
    return this.http.put(`${this.BaseUrl}rejectedtimelogresubmit/${id}`, id);
  }

  getTaskDetails(data):Observable<any>{
    return this.http.put(`${this.BaseUrl}getTaskDetails`, data);
  }
  getProjectAndJobsReports(data):Observable<any>{
    return this.http.put(`${this.BaseUrl}getProjectJobLoggedDetails`, data);
  }
  // getTimesheetByDate(data):Observable<any>{
  //   return this.http.put(`${this.BaseUrl}getTimesheetByDate`, data);
  // }  
  getAllTimesheetsByDate(data):Observable<any>{
    return this.http.put(`${this.BaseUrl}getAllTimesheetsByDate`, data);
  }
  getTaskDetailsForTimeTrackerReport(data):Observable<any>{
    return this.http.put(`${this.BaseUrl}getTaskDetailsForTimeTrackerReport`, data);
  }
  getAllTimesheetsByStatus(data):Observable<any> {
    return this.http.put(`${this.BaseUrl}getAllTimesheetsByStatus`, data);
  }
}
