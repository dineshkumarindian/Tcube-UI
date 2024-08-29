import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CompanyPolicyService {


  constructor(private http: HttpClient) { }
  private BaseUrl = environment.hostName + "api/PolicyDetails/";

  setPolicyId(id) {
    localStorage.setItem("policyDeleteId", id);
  }

  createPolicyDetails(details): Observable<any> {
    return this.http.post(`${this.BaseUrl}create`, details);
  }
  getActivePolicyByOrgId(id): Observable<any> {
    return this.http.get(`${this.BaseUrl}getActivePolicyByOrgId/${id}`,id);
  }
  getPolicybyId(id): Observable<any> {
    return this.http.get(`${this.BaseUrl}getPolicyById/${id}`,id);
  }
  updatePolicy(details): Observable<any> {
    return this.http.put(`${this.BaseUrl}updatePolicy`, details);
  }
  deletePolicy(id): Observable<any> {
    return this.http.put(`${this.BaseUrl}deletePolicy/${id}`, id);
  }
  createPolicyAsPdf(details): Observable<any> {
    return this.http.post(`${this.BaseUrl}createPolicyPdf`, details);
  }
  bulkdelete(formdata): Observable<any> {
    return this.http.put(`${this.BaseUrl}bulkPolicydelete`, formdata);
  }
  getActivePolicytNameListByOrgId(id): Observable<any> {
    return this.http.get(`${this.BaseUrl}getActivePolicytNameListByOrgId/${id}`,id);
  }
}
