import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private BaseUrl = environment.hostName + "api/notification/";

  constructor(private http: HttpClient) { }

  postNotification(details):Observable<any> {
    return this.http.post(`${this.BaseUrl}create`, details);
  }

  getByTonotifyid(id):Observable<any>{
    return this.http.get(`${this.BaseUrl}getnotificationsbyempid/${encodeURIComponent(id)}`,id);
  }
  getUnreadCountByTonotifyid(id):Observable<any>{
    return this.http.get(`${this.BaseUrl}getunreadnotificationcountsbyempid/${encodeURIComponent(id)}`,id);
  }

  getNotificationById(data):Observable<any>{
    return this.http.put(`${this.BaseUrl}getnotificationbyid`,data);
  }

  updateMarkAsRead(data):Observable<any>{
    return this.http.put(`${this.BaseUrl}updatemarkasread`,data)
  }

  getNotificationsByEmpidAndDate(details): Observable<any> {
    return this.http.put(`${this.BaseUrl}getNotificationByEmpIdAndDate`, details);
  }

}
