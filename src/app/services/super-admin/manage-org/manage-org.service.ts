import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ManageOrgService {
  selectedOrgId: any;
  constructor(private http: HttpClient) { }

  private BaseUrl = environment.hostName + "api/OrgDetails/";
  setOrgId(id) {
    localStorage.setItem("organizationId", id);
  }

  getOrgId() {
    return this.selectedOrgId;
  }

  createOrg(data): Observable<any> {
    return this.http.post(`${this.BaseUrl}create`, data);
  }

  updateOrg(details): Observable<any> {
    return this.http.put(`${this.BaseUrl}update`, details);
  }

  updateDefaultLeaveTyeStatus(id): Observable<any> {
    return this.http.put(`${this.BaseUrl}updateDefaultLeaveTyeStatus/${id}`, id);
  }

  getAllOrgDetails(): Observable<any> {
    return this.http.get(`${this.BaseUrl}getAllOrgDetails`);
  }

  getActiveOrgDetails(): Observable<any> {
    return this.http.get(`${this.BaseUrl}getActiveOrgDetails`);
  }

  getInactiveOrgDetails(): Observable<any> {
    return this.http.get(`${this.BaseUrl}getInactiveOrgDetails`);
  }

  getOrgDetailsById(id): Observable<any> {
    return this.http.get(`${this.BaseUrl}getorgDetailsById/${id}`, id);
  }

  deleteOrg(data: any): Observable<any> {
    return this.http.put(`${this.BaseUrl}delete/`, data);
  }

  deactivateOrg(data: any): Observable<any> {
    return this.http.put(`${this.BaseUrl}deactivateOrg/`, data);
  }

  activateOrg(data: any): Observable<any> {
    return this.http.put(`${this.BaseUrl}activateOrg/`, data);
  }

  bulkdeleteOrg(data): Observable<any> {
    return this.http.put(`${this.BaseUrl}bulkDelete`, data);
  }
  bulkDeactivateOrg(data): Observable<any> {
    return this.http.put(`${this.BaseUrl}bulkDeactivate`, data);
  }
  bulkActivateOrg(data): Observable<any> {
    return this.http.put(`${this.BaseUrl}bulkActivate`, data);
  }
  updateStatus(data): Observable<any> {
    return this.http.put(`${this.BaseUrl}updatestatus`, data);
  }
  updatePlan(data): Observable<any> {
    return this.http.put(`${this.BaseUrl}updateplan`, data);
  }
  deleteOrgRejected(data): Observable<any> {
    return this.http.put(`${this.BaseUrl}deleteRejectOrgDelete`, data);
  }
  bulkDeleteOrgRejected(data): Observable<any> {
    return this.http.put(`${this.BaseUrl}bulkDeleteRejectedOrgs`, data);

  }
  getAllpendingDetails(): Observable<any> {
    return this.http.get(`${this.BaseUrl}getAllPendingDetails`);
  }
  getAllRejectDetails(): Observable<any> {
    return this.http.get(`${this.BaseUrl}getAllRejectDetails`);
  }

  updateplanupgradestatus(data:any): Observable<any> {
    return this.http.post(`${this.BaseUrl}updateplanupgradestatus`,data);
  }

  updateplanrenewalstatus(id:any): Observable<any> {
    return this.http.put(`${this.BaseUrl}updateplanrenewalstatus/${id}`, id);
  }

  /* ------- update the working days in orgdetails ------ */
  updateWorkingDays(data):Observable<any>{
    return this.http.put(`${this.BaseUrl}update-working-days`,data);
  }

}
