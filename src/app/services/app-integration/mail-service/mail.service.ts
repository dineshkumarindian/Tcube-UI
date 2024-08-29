import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/internal/Observable';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MailService {

  constructor(private http: HttpClient) { }

  private mailConfigUrl = environment.hostName + "api/MailConfigDetails/";
 

  createMailConfig(details): Observable<any> {
    return this.http.post(`${this.mailConfigUrl}create`, details);
  }

  updateMailConfig(details): Observable<any> {
    return this.http.put(`${this.mailConfigUrl}update`, details);
  }

  getMailConfigByOrg(orgId): Observable<any> {
    return this.http.get(`${this.mailConfigUrl}getMailConfigByOrgId/${orgId}`);
  }

  deleteMailConfig(id): Observable<any> {
    return this.http.delete(`${this.mailConfigUrl}delete/${id}`);
  }
}
