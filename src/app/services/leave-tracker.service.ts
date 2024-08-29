import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
// import * as moment from 'moment-timezone';
import { Observable } from "rxjs";
import { environment } from "../../environments/environment";
import * as moment from "moment-timezone";
// import * as moment from 'moment-timezone';

@Injectable({
  providedIn: "root",
})
export class LeaveTrackerService {
  constructor(private http: HttpClient) { }

  private BaseUrl = environment.hostName + "api/LeaveTrackerDetails/";
  private IntegrationUrl = environment.hostName + "api/AppsIntegrationDetails/";

  createLeaveDetails(create): Observable<any> {
    return this.http.post(`${this.BaseUrl}create`, create);
  }

  updateLeaveStatus(update): Observable<any> {
    return this.http.put(`${this.BaseUrl}updateStatus`, update);
  }

  getActiveleaveByEmpIdAndYearByOrgid(data): Observable<any> {
    return this.http.put(`${this.BaseUrl}getLeaveByEmpIdAndYear`, data);
  }
  getActiveleaveByEmpIdAndYearPendingAndApprovedByOrgid(data): Observable<any> {
    return this.http.put(`${this.BaseUrl}getLeaveByEmpIdAndYearPendingAndApprovedLeave`, data);
  }

  // getActiveleaveByReporterIdAndYearByOrgid(data): Observable<any> {

  getActiveleaveByReporterIdAndYearByOrgid(data): Observable<any> {
    return this.http.put(`${this.BaseUrl}getLeaveByReporterIdAndYear`, data);
  }

  // getTodayLeavesbyOrg_id
  getTodayLeavesByOrgid(data): Observable<any> {
    return this.http.put(`${this.BaseUrl}getLeavesByOrgId`, data);
  }

  cancelLeave(id): Observable<any> {
    return this.http.put(`${this.BaseUrl}delete/${id}`, id);
  }
  // cancelLeaveComments(data): Observable<any> {
  //   return this.http.put(`${this.BaseUrl}deleteLeaveComments`, data);
  // }
  getAllLeaveType(details): Observable<any> {
    return this.http.put(`${this.BaseUrl}getAllLeave`, details);
  }

  cancelLeaveComments(data): Observable<any> {
    return this.http.put(`${this.BaseUrl}deleteLeaveComments`, data);
  }
  getLeavebyEmpIdAndYearAndOrgIdforleavetype(data): Observable<any> {
    return this.http.put(`${this.BaseUrl}getstartDateEndDate`, data);
  }
  // getAllLeaveType(data):Observable<any>{
  //   return this.http.put(`${this.BaseUrl}getAllLeave`,data);
  // }

  // for leave report
  getActiveleaveByEmpIdAndYearByOrgid1(data): Observable<any> {
    return this.http.put(`${this.BaseUrl}getEmpLeaveDetailsReports`, data);
  }

  // slack

  getslackDetails(details): Observable<any> {
    return this.http.put(
      `${this.IntegrationUrl}getIntegrationByOrgIdAndModule`,
      details
    );
  }
  halfAndFullDay: any;
  // Template creation for leave tracker msg to slack
  createLeaveTemplate(empDetails, status) {
    // console.log(empDetails);
    // let st_date = moment(empDetails.start_date).format("DD/MM/YYYY");
    // let ed_date = moment(empDetails.end_date).format("DD/MM/YYYY");
    let fullAndHalfDay = JSON.parse(empDetails.half_full_day);
    let empName = empDetails.emp_name.trim();
    let approval_name: string = "";
    if (status == "Approved") {
      approval_name = "Approved Date";
    } else {
      approval_name = "Cancellation Date";
    }
    this.halfAndFullDay = "";
    let dayandhalf = "";
    for (let i = 0; i < fullAndHalfDay.length; i++) {
      if (fullAndHalfDay[i].full_half == "Half Day") {
        let date = new Date(fullAndHalfDay[i].date);
        let dayOne = moment(date).format('dddd');
        dayandhalf += dayOne + "-" + fullAndHalfDay[i].first_second;
      } else {
        let date = new Date(fullAndHalfDay[i].date);
        let dayOne = moment(date).format('dddd');
        dayandhalf += dayOne + "-" + fullAndHalfDay[i].full_half;
      }
      if (i != fullAndHalfDay.length - 1) {
        dayandhalf += ", ";
      }
    }
    this.halfAndFullDay = dayandhalf;
    let details: Object = {
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text:
              "*" + empName + " : " + "* " + "`" + empDetails.leave_type + "`",
          },
        },
        {
          "type": "section",
          "text": {
            "type": "mrkdwn",
            "text": "*Leave Date :* " + moment(empDetails.start_date).format("DD/MM/YYYY").toString() + " to " + moment(empDetails.end_date).format("DD/MM/YYYY").toString() + "\n" + "*" + approval_name + " :* " + moment(new Date()).format("DD/MM/YYYY").toString() + "\n" + "*Days :* " + "(*" + empDetails.total_days + "*)" + " (" + this.halfAndFullDay + ")\n" + "*Status :* " + "`" + status + "`"
          },

          accessory: {
            type: "image",
            image_url: "https://uat.tcube.io/assets/images/App_slack_logo1.png",
            alt_text: "Tcube logo",
          },
        },
        {
          type: "divider",
        },
      ],
      // "blocks": [
      //   {
      //     "type": "header",
      //     "text": {
      //       "type": "plain_text",
      //       "text": "Today leave list :",
      //       "emoji": true
      //     }
      //   },
      //   {
      //     "type": "divider"
      //   },
      //   {
      //     "type": "section",
      //     "text": {
      //       "type": "mrkdwn",
      //       "text": "*Dineshkumar*" + "\t\t\t\t\t" + "`" + "casual leave" + "`" + "\t\t\t\t\t\t" + "*Full-day*"
      //     },

      //   },
      //   {
      //     "type": "section",
      //     "text": {
      //       "type": "mrkdwn",
      //       "text": "*Harikrishnan*" + "\t\t\t\t\t" + "`" + "casual leave" + "`" + "\t\t\t\t\t\t" + "*Full-day*"
      //     },

      //   },
      //   {
      //     "type": "section",
      //     "text": {
      //       "type": "mrkdwn",
      //       "text": "*Guhan*" + "\t\t\t\t\t" + "`" + "casual leave" + "`" + "\t\t\t\t\t\t" + "*Full-day*"
      //     },

      //   },
      //   {
      //     "type": "divider"
      //   }

      // "accessory": {
      //   "type": "image",
      //   "image_url": "https://uat.tcube.io/assets/images/App_slack_logo1.png",
      //   "alt_text": "cute cat"
      // }

      // {
      //   "type":"section",
      //   "text":{
      //     "type":"mrkdwn",
      //     "text":"*Dineshkumar*"+"\t"+ "`" + "casual leave" + "`"
      //   },
      //   "accessory": {
      //           "type": "image",
      //           "image_url": "https://uat.tcube.io/assets/images/App_slack_logo1.png",
      //           "alt_text": "Tcube logo"
      //         }
      //       },
      //       {
      //         "type": "divider"
      //       }

      // "blocks": [
      //   {
      //     "type": "header",
      //     "text": {
      //       "type": "plain_text",
      //       "text": "This is a header block",
      //       "emoji": true
      //     }
      //   },
      //   {
      //     "type": "section",
      //     "text": {
      //       "type": "mrkdwn",
      //       "text": "*No one take leave Today!*"
      //     },
      //     "accessory": {
      //       "type": "image",
      //       "image_url": "https://uat.tcube.io/assets/images/App_slack_logo1.png",
      //       "alt_text": "Tcube logo"
      //     }
      //   }
      // ]
    };

    return details;
  }

  // Whatsapp msg template  https://uat.tcube.io/assets/images/final-logo-Tcube.png
  createWAMsgTemplate(empDetails, status, no) {
    let st_date = moment(empDetails.start_date).format("DD/MM/YYYY");
    let ed_date = moment(empDetails.end_date).format("DD/MM/YYYY");
    let Str =
      "Who : " +
      empDetails.emp_name +
      "\nLeave Type : " +
      empDetails.leave_type +
      "\nDate : " +
      st_date +
      " - " +
      ed_date +
      "\nDays Taken : " +
      empDetails.total_days +
      "\nStatus : " +
      status;
    let data: Object = {
      messaging_product: "whatsapp",
      to: no,
      type: "text",
      text: {
        body: Str,
      },
    };
    return data;
  }

  // webhook url to send msg to slack
  sendToSlack(url, details) {
    return this.http.post(`${url}`, details, { responseType: "text" });
  }

  sendToWhatsApp(url, token, details) {
    let headers = new HttpHeaders({
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    });
    let options = { headers: headers };
    return this.http.post(`${url}`, details, options);
  }
  //https://hooks.slack.com/services/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

  // ? To get Approved leave details for employee based on emp Id and date range
  getEmpDateRangeApprovedLeaves(data): Observable<any> {
    return this.http.put(`${this.BaseUrl}getEmpDateRangeApprovedLeaves`, data);
  }

  updateSlackNotificationStatus(data): Observable<any> {
    return this.http.put(`${this.BaseUrl}updateSlackNotificationStatus`, data);
  }

  getRequestApproveLeaveCount(details: any): Observable<any> {
    return this.http.put(`${this.BaseUrl}getRequestApproveLeaveCount`, details);
  }

  getRequestLeaveDetailsCount(details: any): Observable<any> {
    return this.http.put(`${this.BaseUrl}getRequestLeaveDetailsCount`, details);
  }

  getRequestLeaveDetailsPaginationCount(details: any): Observable<any> {
    return this.http.put(`${this.BaseUrl}getLeaveRequestPagination`, details);
  }

  createLeaveApprovalsPayload(approve, reject, empData, choosenDates, bookedDays, leave_applied_date) {
    let currentUrl = window.location.href;
    let updatedStr = currentUrl.slice(0, currentUrl.length - 13);
    let LeaveUrl = updatedStr.concat("/#/leave-tracker");
    const leaveApplication = {
      applicantName: `${empData.firstname} ${empData.lastname}`,
      leaveDetails: choosenDates,
      numberOfDays: bookedDays,
      approver: empData.reporter_name ? `${empData.reporter_name}` : `${empData.orgDetails.firstname} ${empData.orgDetails.lastname}`,
    };

    const template = {
      text: "Leave Application",
      attachments: [
        {
          fallback: "You are unable to interact with this button.",
          callback_id: "button_click",
          color: "#3AA3E3",
          attachment_type: "default",
          fields: [
            {
              title: "Applicant",
              value: leaveApplication.applicantName,
              short: true,
            },
            {
              title: "Approver",
              value: leaveApplication.approver,
              short: true,
            },
            {
              title: "Applied Date",
              value: moment(leave_applied_date).format("DD/MM/YYYY").toString(),
              short: true,
            },
            {
              title: "Leave Date",
              value: `${moment(leaveApplication.leaveDetails[0].date).format("DD/MM/YYYY").toString()} to ${moment(leaveApplication.leaveDetails[leaveApplication.leaveDetails.length - 1].date).format("DD/MM/YYYY").toString()}`,
              short: true,
            },
            {
              title: "Leave Details",
              value: leaveApplication.leaveDetails
                .map(
                  (leave) =>
                    `${moment(leave.date).format("DD/MM/YYYY").toString()} : ${leave.first_second === "" ? "Full Day" : leave.first_second
                    }`
                )
                .join("\n"),
              short: true,
            },
            {
              title: "Number of Days",
              value: leaveApplication.numberOfDays.toString(),
              short: true,
            }
          ],
          actions: [
            {
              name: "button",
              text: "Approve",
              type: "button",
              style: "primary",
              value: JSON.stringify(approve),
            },
            {
              name: "button",
              text: "Reject",
              type: "button",
              style: "danger",
              value: JSON.stringify(reject),
            },
          ],
          footer: `<${LeaveUrl}|View Leave Application>`,
        },
      ],
    };
    return template;
  }

  sendToSlackForApprovals(url, details) {
    return this.http.post(`${url}`, details, { responseType: "text" });
  }
  sendApprovalResponse(buttonValue: string): Observable<any> {
    const payload = { event: { value: buttonValue } };
    return this.http.post(`${this.BaseUrl}sendApprovalResponse`, payload);
  }

  getLeaveDetailsAvaiableAndTakenDays(details): Observable<any> {
    return this.http.put(`${this.BaseUrl}get-leave-type-Taken-and-avaiable_days`, details);
  }

  getUpcomingLeaveDays(details): Observable<any> {
    return this.http.put(`${this.BaseUrl}get-up-coming-one-week-leaves`, details);
  }

}
