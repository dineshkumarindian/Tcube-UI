import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import * as moment from 'moment-timezone';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AttendanceServiceService {

  //*************************************** To Set Base path for API integratrion**********************************************************//
  private BaseUrl = environment.hostName + "api/AttendanceDetails/";
  private IntegrationUrl = environment.hostName + "api/AppsIntegrationDetails/";

  constructor(private http: HttpClient) { }

  //******************* For Attendance Action post method integration *************************//

  createAttendanceDetails(data): Observable<any> {
    return this.http.post(`${this.BaseUrl}create`, data);
  }

  //****************************For Get current status of user attendance status************************************//

  getCurrentstatusattendance(mail): Observable<any> {
    let zone = moment.tz.guess();
    let formdata = {
      "timezone": zone
    }
    return this.http.put(`${this.BaseUrl}getCurrentStatusByEmail/` + `${mail}`, formdata);
  }

  //****************************For Get attendance Date report************************************//

  getdatereportdata(date, mail): Observable<any> {
    return this.http.get(`${this.BaseUrl}getAttendanceDateReport/` + `${date}/` + `${mail}`)
  }

  //****************************For Get attendance Month report************************************//

  getMonthreportdata(data): Observable<any> {
    return this.http.put(`${this.BaseUrl}getAttendanceMonthReport`, data);
  }

  //****************************For Get active Employee Details************************************//

  getActiveEmployeeDetails(data): Observable<any> {
    return this.http.put(`${this.BaseUrl}getallemployeebydatestatus`, data);
  }

  //****************************For Get Employee date attendance report************************************//

  getEmployeeDateAttendance(data): Observable<any> {
    return this.http.put(`${this.BaseUrl}getDateAttendanceReport`, data);
  }

  //****************************For Get attendance Action Date report************************************//

  getactiondatereportdata(date, mail): Observable<any> {
    return this.http.get(`${this.BaseUrl}getAttendanceactionReportsByDate/` + `${date}/` + `${mail}`)
  }

  getUserInActionCount(details):Observable<any>{
    return this.http.put(`${this.BaseUrl}get-user-In-action-count`,details);
  }

  // getAttendanceUserlist():Observable<any>{
  //   return this.http.get(`${this.BaseUrl}getActiveEmployeesTodayAttendanceList`);
  // }


  // ! **************************** Slack integration for attendance message ****************************//
  attendanceSendToSlack(url, details, name) {
    let actives = details.activeHours / 1000;
    let hours = Math.floor(actives / 3600) % 24;
    let minutes = Math.floor(actives / 60) % 60;
    let seconds = Math.floor((actives % 60));
    let formatedHours = hours > 9 ? hours : '0' + hours;
    let formatedMinutes = minutes > 9 ? minutes : '0' + minutes;
    let formatedSeconds = seconds > 9 ? seconds : '0' + seconds;

    // let logged_Hours = `${formatedHours} Hrs : ${formatedMinutes} Min : ${formatedSeconds} Sec`;
    let logged_Hours = `${formatedHours} Hrs : ${formatedMinutes} Min`;
    let bodydata: Object = {
      //! New attendance slack integration template
        "blocks": [
          {
            "type": "section",
            "text": {
              "type": "mrkdwn",
              "text": "> *"+name+"*  \t ``` "+details.action+"  ``` "
            },
            "accessory": {
              "type": "image",
            "image_url": "https://uat.tcube.io/assets/images/App_slack_logo1.png",
              "alt_text": "Tcube logo"
            }
          },
          {
            "type": "divider"
          }
        ]
      

      //! Old attendance Slack integration template https://uat.tcube.io/assets/images/final-logo-Tcube.png
      // "blocks": [
      //   {
      //     "type": "header",
      //     "text": {
      //       "type": "plain_text",
      //       "text": name ,
      //       "emoji": true
      //     }
      //   }, 
      //   {
      //     "type": "divider"
      //   },
      //   {
      //     "type": "section",
      //     "fields": [
      //       {
      //         "type": "mrkdwn",
      //         "text": "*Action* \n" + details.action,
      //       }
      //       ,
      //       {
      //         "type": "mrkdwn",
      //         "text": "*When* \n" + details.timeOfAction,
      //       },
      //       {
      //         "type": "mrkdwn",
      //         "text": "*Active Status* \n" + details.actionType ,
      //       },
      //       {
      //         "type": "mrkdwn",
      //         "text": "*Active Hours* \n" + logged_Hours,
      //       },
      //       {
      //         "type": "mrkdwn",
      //         "text": " \n" ,
      //       }
      //     ],
      //     "accessory": {
      //       "type": "image",
      //       "image_url": "https://uat.tcube.io/assets/images/App_slack_logo.png",
      //       "alt_text": "Tcube"
      //     },
      //   } 
      //   ,{
      //     "type": "divider"
      //   }
      // ]
    };
    return this.http.post(`${url}`, JSON.stringify(bodydata));
  }

  // ! ********************** get Slack and whatsapp integration details ************************ //
  getslackDetails(details): Observable<any> {
    return this.http.put(`${this.IntegrationUrl}getIntegrationByOrgIdAndModule`, details);
  }

  // !  ****************** Whatsapp msg template for attendance ******************** //
 sendWhatsAppTemplate(details , name, no) {
  let actives = details.activeHours / 1000;
    let hours = Math.floor(actives / 3600) % 24;
    let minutes = Math.floor(actives / 60) % 60;
    let seconds = Math.floor((actives % 60));
    let formatedHours = hours > 9 ? hours : '0' + hours;
    let formatedMinutes = minutes > 9 ? minutes : '0' + minutes;
    let formatedSeconds = seconds > 9 ? seconds : '0' + seconds;

    // let logged_Hours = `${formatedHours} Hrs : ${formatedMinutes} Min : ${formatedSeconds} Sec`;
    let logged_Hours = `${formatedHours} Hrs : ${formatedMinutes} Min`;
    let Str = "Who : " + name +"\n Action : "+details.action + "\n Action Status : "+details.actionType + "\n When : "+details.timeOfAction+"\n Active hours : " + logged_Hours;
    let data: Object = {
      "messaging_product": "whatsapp",
      "to": no,
      "type": "text",
      "text": {
        "body": Str
      }
    }
    return data ;
  }
// ! **************************** Whatsapp integration for attendance message ****************************//
  sendToWhatsApp(url, token, details) {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
    let options = { headers: headers };
    return this.http.post(`${url}`, details, options);
  }


  //******************* Get date bar chart report API ******************************** */
  getDateBarChartReport(data): Observable<any> {
    return this.http.put(`${this.BaseUrl}getUserAttendanceBarchartData`, data);
  }

}
