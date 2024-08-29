import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class JobsService {
  selectedJobId: any;
  assigneeIds:any[]=[];
  assigneeRph:any[]=[];
  assigneeDetails:any[]=[];

  constructor(private http: HttpClient) { }
  private BaseUrl = environment.hostName + "api/JobDetails/";

  
  setJobId(id) {
    localStorage.setItem("jobId", id);
  }

  getJobId() {
    return this.selectedJobId;
  }

  setAssigneesIds(ids,rph,cost,hours){
    localStorage.setItem("assigneeIds", JSON.stringify(ids));
    localStorage.setItem("assigneeRph", JSON.stringify(rph));
    localStorage.setItem("assignee_cost", JSON.stringify(cost));
    localStorage.setItem("assignee_hours", JSON.stringify(hours));
    this.assigneeIds =ids;
    this.assigneeRph =rph;
  }
  getAssigneesIds(){
    return this.assigneeIds;
    // return this.assigneeDetails.push({ids: this.assigneeIds , rph : this.assigneeRph});
  }
  getAssigneesRph(){
    return this.assigneeRph;
    // return this.assigneeDetails.push({ids: this.assigneeIds , rph : this.assigneeRph});
  }

  createJobDetails(create):Observable<any> {
    return this.http.post(`${this.BaseUrl}create`, create);
  }

  updateJob(update):Observable<any> {
    return this.http.put(`${this.BaseUrl}update`, update);
  }

  getActiveJobDetailsByOrgId(id): Observable<any> {
    return this.http.get(`${this.BaseUrl}getActiveJobDetailsByOrgId/${id}`,id);
  }

  getActiveJobDetailsByOrgIdnew(id): Observable<any> {
    return this.http.get(`${this.BaseUrl}getActiveJobDetailsByOrgIdnew/${id}`,id);
  }

  getActiveJobDetailsByProjectId(id): Observable<any> {
    return this.http.get(`${this.BaseUrl}getActiveJobDetailsByProjectId/${id}`,id);
  }

  getInactiveJobsDetailsByProjectId(id): Observable<any> {
    return this.http.get(`${this.BaseUrl}getActiveJobDetailsByProjectId/${id}`,id);
  }

  getJobDetailsById(id): Observable<any> {
    return this.http.get(`${this.BaseUrl}getJobById/${id}`,id);
  }

  updateJobStatus(status,id): Observable<any> {
    return this.http.put(`${this.BaseUrl}updateJobStatus/${id}`,status);
  }

  deleteJob(id) :Observable<any> {
    return this.http.put(`${this.BaseUrl}delete/${id}`,id);
  }
  bulkDeleteJob(data) :Observable<any> {
    return this.http.put(`${this.BaseUrl}bulkDelete`,data);
  }

  bulkAssignees(update):Observable<any> {
    return this.http.put(`${this.BaseUrl}bulkAssignee`, update);
  }

  getActiveJobNameWithProject_idName(orgId):Observable<any> {
    return this.http.get(`${this.BaseUrl}getActiveJobNameListWithProjectByOrgId/${orgId}`,orgId);
  }
  getAllJobsByStatusByOrgId(data): Observable<any> {
    return this.http.put(`${this.BaseUrl}getAllJobsByStatusByOrgId`,data);
  }

  getJobsNameListWithProjectIds(data) :Observable<any> {
    return this.http.put(`${this.BaseUrl}getJobsNameListWithProjectIds`,data);
  }
}
