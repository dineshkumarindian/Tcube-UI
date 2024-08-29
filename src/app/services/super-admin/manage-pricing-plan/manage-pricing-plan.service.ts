import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ManagePricingPlanService {

  constructor(private http: HttpClient) { }

  private BaseUrl = environment.hostName + "api/plandetails/";

  createPlan(data): Observable<any> {
    return this.http.post(`${this.BaseUrl}create`, data);
  }

  updatePlan(data): Observable<any> {
    return this.http.put(`${this.BaseUrl}updateplan`, data);
  }

  getAllPlanDetails(): Observable<any> {
    return this.http.get(`${this.BaseUrl}getall`);
  }

  getPlanById(id): Observable<any> {
    return this.http.get(`${this.BaseUrl}getplan/${id}`, id);
  }

  delteById(id): Observable<any> {
    return this.http.put(`${this.BaseUrl}softdelete/${id}`, id);
  }

  bulkDeleteByIds(data): Observable<any> {
    return this.http.put(`${this.BaseUrl}bulkdelete`, data);
  }
}
