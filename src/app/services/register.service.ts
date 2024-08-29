import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RegisterService {
  selectedOrgId: any;

  constructor(private http: HttpClient) { }
  private BaseUrl = environment.hostName + "api/OrgDetails/";
  private SAUrl = environment.hostName + "api/SuperAdminDetails/";

  setOrgId(id) {
    localStorage.setItem("organizationId", id);
  }

  getOrgId() {
    return this.selectedOrgId;
  }

  createClientDetails(createClient):Observable<any> {
    return this.http.post(`${this.BaseUrl}create`, createClient);
  }

  updateOrg(details): Observable<any>{
    return this.http.put(`${this.BaseUrl}update`, details);
  }

  updateDefaultLeaveTyeStatus(id): Observable<any>{
    return this.http.put(`${this.BaseUrl}updateDefaultLeaveTyeStatus/${id}`, id);
  }

  getAllOrgDetails():Observable<any>{
    return this.http.get(`${this.BaseUrl}getAllOrgDetails`);
  }

  getActiveOrgDetails():Observable<any>{
    return this.http.get(`${this.BaseUrl}getActiveOrgDetails`);
  }

  getInactiveOrgDetails():Observable<any>{
    return this.http.get(`${this.BaseUrl}getInactiveOrgDetails`);
  }

  getOrgDetailsById(id):Observable<any>{
    return this.http.get(`${this.BaseUrl}getorgDetailsById/${id}`,id);
  }

  deleteOrg(data: any): Observable<any>{
    return this.http.put(`${this.BaseUrl}delete/`,data);
  }
  /// SA details
  getSADetailsById(id):Observable<any>{
    return this.http.get(`${this.SAUrl}getSuperAdminDetailsById/${id}`,id);
  }

  // Trail details
  getTrialDetails():Observable<any>{
    return this.http.get(`${this.BaseUrl}trailDetails`);
  }

  // resend the mail to new org while mail is invalid
  resendMailToOrg(data): Observable<any> {
    return this.http.post(`${this.BaseUrl}resendMailToOrgById`, data);
  }

}
