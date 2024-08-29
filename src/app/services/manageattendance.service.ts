import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ManageattendanceService {
  //*************************************** To Set Base path for API integratrion**********************************************************//
  private BaseUrl = environment.hostName + "api/manageAttendance/";
  constructor(private http: HttpClient) { }

  //****************************For Get All Action card Details by orgId************************************//
  getAllActionCardByOrgId(id): Observable<any> {
    return this.http.get(`${this.BaseUrl}getAllActionCardDetailsByOrgId/` + `${id}`);
  }

  //****************************For Create Action card Details ************************************//
  createActionCard(data): Observable<any> {
    return this.http.post(`${this.BaseUrl}create`, data);
  }

  //****************************For Update Action card Details ************************************//
  updateActionCard(data): Observable<any> {
    return this.http.put(`${this.BaseUrl}update`, data);
  }

  //****************************For Delete Action card Details ************************************//
  deleteActionCard(id): Observable<any> {
    return this.http.put(`${this.BaseUrl}delete/` + `${id}`, id);
  }

  //****************************For get  Action card Details by id ************************************//
  getActionCardByid(id): Observable<any> {
    return this.http.get(`${this.BaseUrl}getactioncardsbyid/` + `${id}`, id);
  }
}
