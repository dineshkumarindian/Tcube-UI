import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '..//..//..//environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ReminderDetailsService {

  private URL = environment.hostName + "api/ReminderDetails/";

  constructor(private http: HttpClient) { }

  createReminder(details): Observable<any> {
    return this.http.post(`${this.URL}create`, details);
  }

  createReminderWithoutZone(details): Observable<any> {
    return this.http.post(`${this.URL}createReminderWithoutZone`, details);
  }
  
  updateReminder(details): Observable<any> {
    return this.http.put(`${this.URL}update`, details);
  }
  
  updateAttendanceReminder(details): Observable<any> {
    return this.http.put(`${this.URL}updateAttendanceReminder`, details);
  }
  
  updateReminderActiveStatus(details): Observable<any> {
    return this.http.put(`${this.URL}updateReminderStatus`, details);
  }

  updateReminderEmpDetails(details): Observable<any> {
    return this.http.put(`${this.URL}updateReminderEmpDetails`, details);
  }

  getReminderByOrgIdAndModule(details): Observable<any> {
    return this.http.put(`${this.URL}getReminderByOrgIdAndModule`, details);
  }

  getReminderById(id): Observable<any> {
    return this.http.get(`${this.URL}getReminderById/${id}`, id);
  }

}
