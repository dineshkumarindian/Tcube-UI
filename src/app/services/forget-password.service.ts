import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
@Injectable({
  providedIn: 'root'
})
export class ForgetPasswordService {

  private BaseUrl = environment.hostName + "api/ForgetPassword/";
  constructor(private http: HttpClient) { }

  sendMailToEmployee(emailId: any): Observable<any> {
    return this.http.post(`${this.BaseUrl}sendingMailToEmployee`, emailId)
  }

  sendMailToSA(emailId: any): Observable<any> {
    return this.http.post(`${this.BaseUrl}sendingMailToSA`, emailId)
  }

  userOtpVerification(otpDetails: any): Observable<any> {
    return this.http.post(`${this.BaseUrl}userOtpVerification`,otpDetails);
  }

  superadminOtpVerification(otpDetails: any): Observable<any> {
    return this.http.post(`${this.BaseUrl}superadminOtpVerification`,otpDetails);
  }

  updateNewpassword(password:any): Observable<any> {
    return this.http.put(`${this.BaseUrl}updateNewpassword`,password);
  }

  // sendMailToOrgAdmin(emailId:any): Observable<any> {
  //   return this.http.post(`${this.BaseUrl}sendMailToOrgAdmin`,emailId);
  // }
}
