import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '..//..//..//environments/environment';
import { Observable } from 'rxjs';
import * as moment from 'moment-timezone';

@Injectable({
  providedIn: 'root'
})
export class DayPlannerService {
  selectedSayTaskId: any;

  constructor(private http: HttpClient) { }

  private dayPlannerUrl = environment.hostName + "api/DayPlannerDetails/";
  setDayTaskId(id) {
    localStorage.setItem("dayTaskId", id);
  }

  getEmpId() {
    return this.selectedSayTaskId;
  }

  createDayTask(details): Observable<any> {
    return this.http.post(`${this.dayPlannerUrl}create`, details);
  }

  updateDayTask(details): Observable<any> {
    return this.http.put(`${this.dayPlannerUrl}update`, details);
  }

  getDayTaskDetailsByEmpIdAndOrgIdAndDate(details): Observable<any> {
    return this.http.put(`${this.dayPlannerUrl}getDayTask`, details);
  }

  getDayTaskDetailsByOrgIdAndDate(details): Observable<any> {
    return this.http.put(`${this.dayPlannerUrl}getDayTaskByOrgid`, details);
  }

  updateDayTaskStatus(details): Observable<any> {
    return this.http.put(`${this.dayPlannerUrl}updateDayTaskStatus`, details);
  }

  bulkUpdateDayTaskStatus(details): Observable<any> {
    return this.http.put(`${this.dayPlannerUrl}bulkUpdateDayTaskStatus`, details);
  }

  updateDayTaskDate(details): Observable<any> {
    return this.http.put(`${this.dayPlannerUrl}updateDayTaskDate`, details);
  }
  updateDayTaskSubmitStatus(details): Observable<any> {
    return this.http.put(`${this.dayPlannerUrl}updateDayTaskSubmitStatus`, details);
  }

  deleteDayTask(id): Observable<any> {
    return this.http.put(`${this.dayPlannerUrl}delete/${id}`, id);
  }

  bulkDeleteDayTask(details): Observable<any> {
    return this.http.put(`${this.dayPlannerUrl}bulkDelete`, details);
  }

  getTaskSubmissionStatus(details): Observable<any> {
    return this.http.post(`${this.dayPlannerUrl}getTaskSubmissionStatus`, details);
  }

  getDayPlannerReportsDetails(details):Observable<any>{
    return this.http.put(`${this.dayPlannerUrl}get-day-planner-reports`,details);
  }

  headerStr: any;
  listString: any;
  // projectString:any;
  createTemplate(empDetails, overallData: any[], type) {
    this.listString = "";
    let st_date = moment(overallData[0].data[0].date).format("DD/MM/YYYY");

    if (type == 'planForTheDay') {
      this.headerStr = "Plan for the day - (" + st_date + ")";
      for (let j = 0; j < overallData.length; j++) {
        let taskDetails: any[] = overallData[j].data;
        // console.log(taskdetails);
        // let taskDetails = JSON.parse(JSON.stringify(taskdetails));
        // console.log(taskDetails);
        // taskDetails = taskDetails.reverse();
        // console.log(taskDetails);
        let projectString = overallData[j].key;
        projectString = projectString.charAt(0).toUpperCase() + projectString.slice(1);
        this.listString = this.listString + ">*Project : " + "`" + projectString +  "`" + "*\n     • ";
        // first adding status done task
        for (let i = 0; i < taskDetails.length; i++) {
          if (taskDetails[i].status == 'Done') {
            this.listString = this.listString + taskDetails[i].day_task + "\n     • "
          }
        }
        for (let i = 0; i < taskDetails.length; i++) {
          if (taskDetails[i].status == 'Inprogress') {
            this.listString = this.listString + taskDetails[i].day_task + "\n     • "
          }
        }
        for (let i = 0; i < taskDetails.length; i++) {
          if (taskDetails[i].status == 'Todo') {
            if(taskDetails[i].description){
              this.listString = this.listString + taskDetails[i].day_task + "\n       " +"Description : "+taskDetails[i].description + "\n     • ";
            }
            else{
              this.listString = this.listString + taskDetails[i].day_task + "\n     • ";
            }
          }
        }
        // console.log(this.listString);
        this.listString = this.listString.substring(0, this.listString.length - 7);
      }
    } else if (type == 'updatesForTheDay') {
      this.headerStr = "Updates for the day - (" + st_date + ")";
      for (let j = 0; j < overallData.length; j++) {
        // let taskDetails: any[] = overallData[j].data;
        let taskdetails: any[] = overallData[j].data;
        let taskDetails = JSON.parse(JSON.stringify(taskdetails));
        taskDetails = taskDetails.reverse();
        let projectString = overallData[j].key;
        projectString = projectString.charAt(0).toUpperCase() + projectString.slice(1);
        this.listString = this.listString + ">*Project : "+ "`" + projectString + "`" + "*\n     • ";
        // first adding status done task
        for (let i = 0; i < taskDetails.length; i++) {
          if (taskDetails[i].status == 'Done') {
            this.listString = this.listString + taskDetails[i].day_task + " - *Done*\n     • "
          }
        }
        //next adding inprogress tasks
        for (let i = 0; i < taskDetails.length; i++) {
          if (taskDetails[i].status == 'Inprogress') {
            this.listString = this.listString + taskDetails[i].day_task + " - *In-progress*\n     • "
          }
        }
        //then add todo tasks
        for (let i = 0; i < taskDetails.length; i++) {
          if (taskDetails[i].status == 'Todo') {
            this.listString = this.listString + taskDetails[i].day_task + " - *Todo*\n     • "
          }
        }
        this.listString = this.listString.substring(0, this.listString.length - 7);
      }
    }

    this.listString = this.listString.substring(0, this.listString.length - 1);

    let details: any = {
      "blocks": [
        {
          "type": "header",
          "text": {
            "type": "plain_text",
            "text": empDetails.firstname + " " + empDetails.lastname,
            "emoji": true
          }
        },
        {
          "type": "divider"
        },
        {
          "type": "section",
          "text": {
            "type": "mrkdwn",
            "text": "*" + this.headerStr + "*"
          }
        },
        {
          "type": "section",
          "text": {
            "type": "mrkdwn",
            "text": this.listString
          },
          "accessory": {
            "type": "image",
            "image_url": "https://uat.tcube.io/assets/images/App_slack_logo1.png",
            "alt_text": "Tcube"
          }
        },
        {
          "type": "divider"
        }
      ]
    }
    return details;
  }

  // webhook url to send msg to slack
  sendToSlack(url, details) {
    return this.http.post(`${url}`, details, {responseType: 'text'});
  }

}
