import { Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import moment from 'moment-timezone';
import { MatTableDataSource } from '@angular/material/table';
import { ActionComponent } from '../attendance/action/action.component';

import { AttendanceServiceService } from '../services/attendance-service.service';
import { Subscription, timer } from 'rxjs';
import { NgxSpinnerService } from 'ngx-spinner';
import { DatePipe } from '@angular/common';
import { DomSanitizer } from '@angular/platform-browser';
import { ManageattendanceService } from '../services/manageattendance.service';
import { SettingsService } from '../services/settings.service';
import { Router } from '@angular/router';
import { NoactionComponent } from '../attendance/action/noaction/noaction.component';
import { OfferLetterService } from 'src/app/services/offer-letter.service';
import { InternshipletterService } from 'src/app/services/businessletter.service';
import { WelcomeComponent } from '../dashboard/welcome/welcome.component';
import { RegisterService } from '../services/register.service';
import { DayPlannerService } from '../services/day-planner/day-planner.service';
import { ReminderDetailsService } from '../services/reminder-details/reminder-details.service';
import { DpCommonDialogComponent } from '../day-planner/dp-common-dialog/dp-common-dialog.component';
import { UtilService } from '../services/util.service';
import { ManageIntegrationService } from '../services/app-integration/manage-integration-service/manage-integration.service';
// import { access } from 'fs';


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.less'],
  encapsulation: ViewEncapsulation.None
})
export class DashboardComponent implements OnInit, OnDestroy {
  subscriptions: Subscription[] = [];
  detail: any;
  actiontype: string;
  lastaction: any;
  nextaction: string;
  activeHours: string;
  subscribe: any;
  totalTime: number;
  min: number;
  sec: number;
  hrs: number;
  Activetime: any = 0;
  activetime: boolean = false;
  email: string;
  currentActivetime: number = 0;
  startOfYear: any;
  todaydate: any;
  endOfYear: any;
  tommorrow: any;
  day_after_tommorrow: any;
  clockTimer: string = '00 Hrs : 00 Min : 00 Sec';
  isFirstTime: boolean = false;
  Detail: any;
  lettercountloader: boolean = true;
  projectandclientcountloader: boolean = true;
  ReporterLoader: boolean = false;
  ReportingToLoader: boolean = true;
  clientDashboardCount: number = 0;
  projectDashboardCount: number = 0;
  jobsDashboardCount: number = 0;
  offerlettercount: number = 0;
  businesslettercount: number = 0;
  orgAttendanceCards = [];
  isShown: boolean = false;
  isHide: boolean = true;
  role: string;
  slackIntegrationDetails: any = [];
  whatsappIntegrationDetails: any = [];
  profileurl: any;
  profilename: string;
  org_id: any;
  showBillSection = false;
  showProjectJobTimeLogSection = false;
  showAttendanceSection = false;
  showLeaveSection = false;
  showHrLetterSection = false;
  planForTheDay: boolean = false;
  updatesForTheDay: boolean = false;
  submitReminderDetails: any = [];
  updateReminderDetails: any = [];
  attendanceReminderDetails: any = [];
  reminderDialogAccess: Boolean = false;
  timerRefresh: Boolean = false;
  showCompanyPolicy: boolean = false;

  todayLeaveDialog: Boolean = false;
  isNotify: string = "No";
  constructor(public dialog: MatDialog, public router: Router,
    private attendanceService: AttendanceServiceService,
    private spinner: NgxSpinnerService,
    public datepipe: DatePipe,
    private domSanitizer: DomSanitizer,
    private manageattendanceService: ManageattendanceService,
    private settingsService: SettingsService,
    private offerLetterService: OfferLetterService, private internshipService: InternshipletterService,
    private RegisterService: RegisterService,
    private dayPlannerService: DayPlannerService,
    private reminderDetailsService: ReminderDetailsService,
    private utilsService: UtilService,
    private manageIntegrationService: ManageIntegrationService) {

  }

  ngOnDestroy() {
    this.subscriptions.forEach(x => {
      if (!x.closed) {
        x.unsubscribe();
      }
    });
  }
  async ngOnInit() {
    this.role = localStorage.getItem("Role");
    this.org_id = localStorage.getItem("OrgId");
    this.ActionCard();
    this.getEmpDetailsById(localStorage.getItem("Id"));
    this.email = localStorage.getItem("Email");
    this.actiontype = "In"
    this.Detail;
    this.getCurrentStatus();
    let url = (window.location.href).split("/");
    localStorage.setItem('backBtn', "/" + url[url.length - 1]);
    if (this.role === "org_admin") {
      this.isShown = true;
      this.isHide = true;
      this.WelcomeMessage();
      // this.getOfferLetterCount();
      this.getTotalCPJCountInOrgDashboard();
    } else {
      this.isShown = false;
      this.isHide = true;
    }
    this.hrs = 0
    this.min = 0;
    this.sec = 1;
    this.hrs = this.hrs * 3600;
    this.min = this.min * 60;
    this.sec = this.sec % 60;
    this.totalTime = this.hrs + this.min + this.sec;
    this.startOfYear = moment().startOf('year').toDate();
    this.todaydate = moment().toDate();
    this.endOfYear = moment().endOf('year').toDate();
    this.tommorrow = moment().add(1, 'days').format("YYYY-MM-DD").toString();
    this.day_after_tommorrow = moment().add(2, 'days').toDate();
    this.getslackDetails();
    this.getWhatsappDetails();
    this.getDayTaskDetails();
    this.getReminderDetails();
    await this.accessModule();
    window.addEventListener("visibilitychange", (evt) => {
      this.timerRefresh = true;
      this.getCurrentStatusForTimer();
    });
  }

  //************ Access modules ****************/
  access: any = [];
  accessModule() {
    this.access = localStorage.getItem("emp_access");
    if (this.access == null) {
      this.settingsService.getActiveEmpDetailsById(localStorage.getItem("Id")).subscribe(
        (data) => {
          if (data.map.statusMessage == "Success") {
            let response = JSON.parse(data.map.data);
            this.access = JSON.parse(response.roleDetails.access_to);
            if (this.access.includes("project/jobs")) {
              this.showProjectJobTimeLogSection = true;
            }
            if (this.access.includes("time-tracker")) {
              this.showBillSection = true;
            }
            if (this.access.includes("attendance")) {
              this.showAttendanceSection = true;
            }
            if (this.access.includes("leave-tracker")) {
              this.showLeaveSection = true;
            }
            if (this.access.includes("HR-letters")) {
              this.showHrLetterSection = true;
            }
            if (this.access.includes("company-policy")) {
              this.showCompanyPolicy = true;
            }
          }
        })
    }
    if (this.access.includes("project/jobs")) {
      this.showProjectJobTimeLogSection = true;
    }
    if (this.access.includes("time-tracker")) {
      this.showBillSection = true;
    }
    if (this.access.includes("attendance")) {
      this.showAttendanceSection = true;
    }
    if (this.access.includes("leave-tracker")) {
      this.showLeaveSection = true;
    }
    if (this.access.includes("HR-letters")) {
      this.showHrLetterSection = true;
    }
    if (this.access.includes("company-policy")) {
      this.showCompanyPolicy = true;
    }
  }
  //***********************************************Org action card************************************************* *//
  ActionCard() {
    this.spinner.show();
    let subscription = this.manageattendanceService.getAllActionCardByOrgId(this.org_id).subscribe(async data => {

      if (data.map.statusMessage == "Success") {
        // let response: any[] = JSON.parse(data.map.data);
        let response: any[] = data.map.data.myArrayList;
        if (response.length != 0) {
          for (var i = 0; i < response.length; i++) {
            let stringArray = new Uint8Array(response[i].map.action_image.myArrayList);

            const STRING_CHAR = stringArray.reduce((data, byte) => {
              return data + String.fromCharCode(byte);
            }, '');
            let base64String = btoa(STRING_CHAR);
            response[i].map.action_image = this.domSanitizer.bypassSecurityTrustUrl("data:image/jpeg;base64," + base64String);
          }
          this.orgAttendanceCards = response;
        }
        this.spinner.hide();
      }
      else {
        this.spinner.hide();
      }

    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
    })
    this.subscriptions.push(subscription);
  }

  //****************Get current Status of user****************//
  // getCurrentStatus() {
  //   this.spinner.show();
  //   let subscription = this.attendanceService.getCurrentstatusattendance(this.email).subscribe(data => {
  //     if (data.map.statusMessage == "Success") {
  //       // var details = JSON.parse((data.map.data));
  //       var details = data.map.data;
  //       this.currentActivetime = details.activeHours / 1000;
  //       this.activetime = true;
  //       this.Activetime = this.currentActivetime;
  //       this.totalTime = this.Activetime;
  //       this.lastaction = details;
  //       this.nextaction = details.next_section;
  //       this.activeHours = details.activeHours;
  //       if (details.actionType === "in") {
  //         this.actiontype = "Out";
  //         this.timerClock();
  //         setTimeout(() => {
  //           /** spinner ends after 3 seconds */
  //           this.spinner.hide();
  //         }, 3000);
  //       }
  //       else {
  //         this.actiontype = "In";
  //         this.stopBtnClicked();
  //         setTimeout(() => {
  //           /** spinner ends after 3 seconds */
  //           this.spinner.hide();
  //         }, 3000);
  //       }
  //     }
  //     else {
  //       setTimeout(() => {
  //         /** spinner ends after 3 seconds */
  //         this.spinner.hide();
  //       }, 3000);
  //     }
  //   }, (error) => {
  //     this.router.navigate(["/404"]);
  //     this.spinner.hide();
  //   })
  //   this.subscriptions.push(subscription);
  // }
  getCurrentStatus() {
    this.spinner.show();
    this.attendanceService.getCurrentstatusattendance(this.email).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        // var details = JSON.parse((data.map.data));
        var details = (data.map.data);
        this.lastaction = details;
        this.activeHours = details.activeHours;
        this.currentActivetime = details.activeHours / 1000;
        this.nextaction = details.next_section;
        this.activetime = true;
        this.Activetime = this.currentActivetime;
        this.totalTime = this.Activetime;
        if (details.actionType === "in") {
          this.actiontype = "Out";
          // this.basicTimer.startTime=this.currentActivetime;
          this.timerClock();
        }
        else {
          this.actiontype = "In";
          this.stopBtnClicked();
        }
        // console.log(this.actiontype);
        // console.log(this.Activetime);
      }
      else {
        // console.log(data);
      }
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
    })
    setTimeout(() => {
      /** spinner ends after 3 seconds */
      this.spinner.hide();
    }, 3000);

  }
  currentUrlRouterLink: any;
  getCurrentStatusForTimer() {
    this.currentUrlRouterLink = window.location.href.split("/")[4];
    if (localStorage.getItem("LoggedInStatus") == "true" && this.currentUrlRouterLink == "dashboard") {
      this.spinner.show();
      this.attendanceService.getCurrentstatusattendance(this.email).subscribe(data => {
        if (data.map.statusMessage == "Success") {
          // var details = JSON.parse((data.map.data));
          var details = (data.map.data);
          this.lastaction = details;
          this.activeHours = details.activeHours;
          this.currentActivetime = details.activeHours / 1000;
          this.nextaction = details.next_section;
          this.activetime = true;
          this.Activetime = this.currentActivetime;
          this.totalTime = this.Activetime;
          if (details.actionType === "in") {

            this.actiontype = "Out";
            // this.basicTimer.startTime=this.currentActivetime;
            this.stopBtnClickedForTimer();
            this.timerClock();
          }
          // console.log(this.actiontype);
          // console.log(this.Activetime);
        }
        else {
          // console.log(data);
        }
      }, (error) => {
        this.router.navigate(["/404"]);
        this.spinner.hide();
      })
      this.spinner.hide();
      this.timerRefresh = false;
    }

  }

  //**************** Welcome message for org admin ********************************************************************************
  WelcomeMessage() {
    let subscription = this.RegisterService.getOrgDetailsById(this.org_id).subscribe(data => {

      let response = JSON.parse(data.map.data);
      this.detail = response;
      if (this.detail.first_time) {
        const dialogRef = this.dialog.open(WelcomeComponent, { panelClass: 'custom-viewdialogstyle' });
        let formdata = {
          "id": this.detail.org_id,
          "firstname": this.detail.firstname,
          "lastname": this.detail.lastname,
          "email": this.detail.email,
          "company_name": this.detail.company_name,
          // "password": this.detail.password,
          "first_time": false,

        }

        dialogRef.afterClosed().subscribe(res => {
          if (res != undefined && res != "") {
            if (res.data == true && (localStorage.getItem("settingAccess") === "true") && (localStorage.getItem("attendaceAccess") === "true")) {
              const dialogRef = this.dialog.open(NoactionComponent, { width: '50%', panelClass: 'custom-viewdialogstyle', });
              dialogRef.afterClosed().subscribe(res => {
                this.ActionCard();
              });
            }
          }
          this.RegisterService.updateOrg(formdata).subscribe(result => {

          })
        })
      } else {
        this.ActionCardsavailable();
        // console.log(this.detail.first_time);

      }
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
    })
    this.subscriptions.push(subscription);
  }

  //***********************************************Org Total Hr Letter's Count************************************************* *//
  // getOfferLetterCount() {
  //   this.lettercountloader = true;
  //   let orgId = localStorage.getItem("OrgId");
  //   let subscription1 = this.offerLetterService.getOfferLetterLength(orgId).subscribe(data => {
  //     let res = JSON.parse(data.map.data);
  //     this.offerlettercount = res;
  //   }, (error) => {
  //     this.router.navigate(["/404"]);
  //     this.spinner.hide();
  //   })
  //   let subscription2 = this.internshipService.getBusinessLetterLength(orgId).subscribe(data => {
  //     let res = JSON.parse(data.map.data);
  //     this.businesslettercount = res;
  //   }, (error) => {
  //     this.router.navigate(["/404"]);
  //     this.spinner.hide();
  //   })
  //   this.lettercountloader = false;
  //   this.subscriptions.push(subscription1);
  //   this.subscriptions.push(subscription2);
  // }

  //***********************************************Org Total clients,project, jobs  Count************************************************* *//
  getTotalCPJCountInOrgDashboard() {
    let orgId = localStorage.getItem("OrgId");
    let subscription = this.settingsService.getTotalCountCPJOrgDashboard(orgId).subscribe(data => {
      this.projectandclientcountloader = true;
      if (data.map.statusMessage == "Success") {
        const response = data.map;
        this.clientDashboardCount = response.clientCountDetails;
        this.projectDashboardCount = response.projectCountdetails;
        this.jobsDashboardCount = response.jobCountdetails;
        this.projectandclientcountloader = false;
      }
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
    })
    this.subscriptions.push(subscription);
  }

  //*************************************** ActionCardsavailable function ***************************************** */
  ActionCardsavailable() {
    this.spinner.show();
    this.manageattendanceService.getAllActionCardByOrgId(this.org_id).subscribe(async data => {

      if (data.map.statusMessage == "Success") {
        // let response: any[] = JSON.parse(data.map.data);
        let response: any[] = data.map.data;
        if (response.length == 0) {
          if ((localStorage.getItem("settingAccess") === "true") && (localStorage.getItem("attendaceAccess") === "true")) {
            const dialogRef = this.dialog.open(NoactionComponent, { width: '50%', panelClass: 'custom-viewdialogstyle', });
            dialogRef.afterClosed().subscribe(result => {
              if (result == true) {
                this.ActionCard();
              }

            });
          }
        }
        this.spinner.hide();
      }
      else {
        this.spinner.hide();
      }

    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
    })

  }

  ///****************** URL to file function***************///
  async getFileFromUrl(url, name, defaultType = 'image/jpeg') {
    const response = await fetch(url);
    const data = await response.blob();
    return new File([data], name, {
      type: data.type || defaultType,
    });
  }

  //****************************************************Attendance Action post method integration********************************************//
  DoAction(action) {
    this.spinner.show();
    let zone = moment.tz.guess();
    let formdata = {
      "email": this.email,
      "org_id": +this.org_id,
      "action": action.action,
      "actionType": action.action_type,
      "timezone": zone,
      "next_action_section": action.next_section
    }
    this.attendanceService.createAttendanceDetails(formdata).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        // ? ************************** Post attendance message in slack integration ************************ //
        if (this.slackIntegrationDetails.is_paused == false && this.isNotify === "Yes") {
          this.attendanceService.attendanceSendToSlack(this.slackIntegrationDetails.url, data.map.data, localStorage.getItem("Name")).subscribe();
        }

        // ? ************************** Post attendance message in Whatsapp integration ************************ //
        if (this.whatsappIntegrationDetails.is_paused == false) {
          let tempData = JSON.parse(this.whatsappIntegrationDetails.numbers);
          for (let i = 0; i < tempData.length; i++) {
            let templateData = this.attendanceService.sendWhatsAppTemplate(data.map.data, this.profilename, tempData[i].code + tempData[i].number)
            this.attendanceService.sendToWhatsApp(this.whatsappIntegrationDetails.url, this.whatsappIntegrationDetails.whatsapp_access_token, JSON.stringify(templateData)).subscribe();
          }
        }
        this.getCurrentStatus();
        //for call the reminder dialog for submit the day planner tasks
        if (this.reminderDialogAccess) {
          if (this.planForTheDay) {
            if (action.action.toLowerCase() == 'i am in from office' || action.action.toLowerCase() == 'i am in from home'
              || action.action.toLowerCase() == 'i am in' || action.action.toLowerCase() == 'i\'m in' || action.action.toLowerCase() == 'in') {
              if (this.attendanceReminderDetails != null) {
                if (this.attendanceReminderDetails.is_active == true) {
                  let isActive = false;
                  if (this.submitReminderDetails != null) {
                    if (this.submitReminderDetails.is_active == true) {
                      if (this.submitReminderDetails.reminder_type == 'Once') {
                        if (moment().toDate() < moment(this.submitReminderDetails.reminder_date).toDate()) {
                          isActive = true;
                        }
                      } else if (this.submitReminderDetails.reminder_type == 'Daily') {
                        let date = moment().format('YYYY-MM-DD') + " " + this.submitReminderDetails.reminder_time_str;
                        if (moment().toDate() < moment(date).toDate()) {
                          isActive = true;
                        }
                      }
                    }
                  }
                  const dialogRef = this.dialog.open(DpCommonDialogComponent, { width: '30%', panelClass: 'custom-viewdialogstyle', data: { component: 'Day Planner Tasks', key: 'attendanceSubmit', key2: isActive } });
                  dialogRef.afterClosed().subscribe(result => {
                    if (result.data == true) {
                      this.updateEmpDetails('attendanceSubmit');
                    }
                  });
                }
              }
            }
            //for call the reminder dialog for update the day planner tasks
          }

          if (this.updatesForTheDay) {
            if (action.action.toLowerCase() == 'i am out' || action.action.toLowerCase() == 'i\'m out' || action.action.toLowerCase() == 'out') {
              if (this.attendanceReminderDetails != null) {
                if (this.attendanceReminderDetails.is_active == true) {
                  let isActive = false;
                  if (this.updateReminderDetails != null) {
                    if (this.updateReminderDetails.is_active == true) {
                      if (this.updateReminderDetails.reminder_type == 'Once') {
                        if (moment().toDate() < moment(this.updateReminderDetails.reminder_date).toDate()) {
                          isActive = true;
                        }
                      } else if (this.updateReminderDetails.reminder_type == 'Daily') {
                        let date = moment().format('YYYY-MM-DD') + " " + this.updateReminderDetails.reminder_time_str;
                        if (moment().toDate() < moment(date).toDate()) {
                          isActive = true;
                        }
                      }
                    }
                  }
                  const dialogRef = this.dialog.open(DpCommonDialogComponent, { width: '30%', panelClass: 'custom-viewdialogstyle', data: { component: 'Day Planner Tasks', key: 'attendanceUpdate', key2: isActive } });
                  dialogRef.afterClosed().subscribe(result => {
                    if (result.data == true) {
                      this.updateEmpDetails('attendanceUpdate');
                    }
                  });
                }
              }
            }
          }
        }
      }
      else {
        // console.log(data);
      }
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
    })
  }

  //************** */ update the emp details in reminder details ************************//
  reminderEmpList: any = [];
  updateEmpDetails(keyData) {
    if (keyData == 'attendanceSubmit') {
      if (this.submitReminderDetails != null) {
        if (this.submitReminderDetails.key_secondary) {
          this.reminderEmpList = JSON.parse(this.submitReminderDetails.key_secondary);
        }
      }
      if (!(this.reminderEmpList.find(emp => emp == localStorage.getItem("Id")))) {
        this.reminderEmpList.push(localStorage.getItem("Id"));
        let data: Object = {
          "id": this.submitReminderDetails.id,
          "emps_arr": JSON.stringify(this.reminderEmpList)
        }
        this.reminderDetailsService.updateReminderEmpDetails(data).subscribe(details => {
          if (details.map.statusMessage == "Success") {
            this.utilsService.openSnackBarAC("Reminder updated successfully", "OK");
          } else {
            this.utilsService.openSnackBarMC("Failed to update reminder", "OK");
          }
        })
      } else {
        this.utilsService.openSnackBarAC("Reminder updated successfully", "OK");
      }
    } else if (keyData == 'attendanceUpdate') {
      if (this.updateReminderDetails != null) {
        if (this.updateReminderDetails.key_secondary) {
          this.reminderEmpList = JSON.parse(this.updateReminderDetails.key_secondary);
        }
      }
      if (!(this.reminderEmpList.find(emp => emp == localStorage.getItem("Id")))) {
        this.reminderEmpList.push(localStorage.getItem("Id"));
        let data: Object = {
          "id": this.updateReminderDetails.id,
          "emps_arr": JSON.stringify(this.reminderEmpList)
        }
        this.reminderDetailsService.updateReminderEmpDetails(data).subscribe(details => {
          if (details.map.statusMessage == "Success") {
            this.utilsService.openSnackBarAC("Reminder updated successfully", "OK");
          } else {
            this.utilsService.openSnackBarMC("Failed to update reminder", "OK");
          }
        });
      } else {
        this.utilsService.openSnackBarAC("Reminder updated successfully", "OK");
      }
    }

  }

  // get the current day task details
  getDayTaskDetails() {
    this.spinner.show();
    let data = {
      "org_id": localStorage.getItem("OrgId"),
      "emp_id": localStorage.getItem("Id"),
      "date": moment().format("YYYY-MM-DD"),
    }
    this.dayPlannerService.getDayTaskDetailsByEmpIdAndOrgIdAndDate(data).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        let response = JSON.parse(data.map.data);
        this.planForTheDay = !(response.find(dayTask => dayTask.is_submitted == true));
        this.updatesForTheDay = !(response.find(dayTask => dayTask.is_updated == true));
      }
      this.spinner.hide();
    });
  }

  //get reminder details
  getReminderDetails() {
    this.spinner.show();
    let data: Object = {
      "org_id": localStorage.getItem("OrgId"),
      "module_name": "day-planner"
    }
    this.reminderDetailsService.getReminderByOrgIdAndModule(data).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        let response = JSON.parse(data.map.data);
        this.submitReminderDetails = response.find(r => r.key_primary == 'submit-tasks');
        this.updateReminderDetails = response.find(r => r.key_primary == 'update-tasks');
        this.attendanceReminderDetails = response.find(r => r.key_primary == 'attendance');
      } else if (data.map.statusMessage == "Error") {
      }
      this.spinner.hide();
    })
  }

  //***************************Stop checkin button function *************************** */
  stopBtnClicked() {
    if (this.clockTimer != "00 Hrs : 00 Min : 00 Sec") {
      this.subscribe.unsubscribe();
    }
    let minutes, seconds, hours, formatedMinutes, formatedSeconds, formatedHours;
    hours = Math.floor(this.totalTime / 3600) % 24;
    minutes = Math.floor(this.totalTime / 60) % 60;
    seconds = Math.floor((this.totalTime % 60));
    formatedHours = hours > 9 ? hours : '0' + hours;
    formatedMinutes = minutes > 9 ? minutes : '0' + minutes;
    formatedSeconds = seconds > 9 ? seconds : '0' + seconds;

    this.clockTimer = `${formatedHours} Hrs : ${formatedMinutes} Min : ${formatedSeconds} Sec`;
    // console.log(this.clockTimer, this.totalTime)
  }
  stopBtnClickedForTimer() {
    if (this.clockTimer != "00 Hrs : 00 Min : 00 Sec") {
      this.subscribe.unsubscribe();
    }
  }

  //***************************checkin button time running function *************************** */
  timerClock() {
    let minutes, seconds, hours, formatedMinutes, formatedSeconds, formatedHours;
    let nTime = this.totalTime;
    const source = timer(1, 1000);
    this.subscribe = source.subscribe((val) => {
      hours = Math.floor(this.totalTime / 3600) % 24;
      minutes = Math.floor(this.totalTime / 60) % 60;
      seconds = Math.floor((this.totalTime % 60));
      formatedHours = hours > 9 ? hours : '0' + hours;
      formatedMinutes = minutes > 9 ? minutes : '0' + minutes;
      formatedSeconds = seconds > 9 ? seconds : '0' + seconds;
      this.totalTime = nTime + val;

      this.clockTimer = `${formatedHours} Hrs : ${formatedMinutes} Min : ${formatedSeconds} Sec`;
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
    });
  }

  //***************************Check in check out action dialog call function ************************ */
  // openDialog(type: string) {
  //   let screenWidth = screen.availWidth;
  //   if (screenWidth <= 750) {
  //     const dialogRef = this.dialog.open(ActionComponent, { width: '90%', panelClass: 'custom-viewdialogstyle', data: { actiontype: type, action: this.lastaction, actioncards: this.orgAttendanceCards, actionsection: this.nextaction }, });

  //     dialogRef.afterClosed().subscribe(result => {
  //       // this.ActionCard();
  //       if (result != undefined && result != "") {
  //         let data = result.data;
  //         let type = result.type;
  //         this.DoAction(data);
  //       }

  //     }, (error) => {
  //       this.router.navigate(["/404"]);
  //       this.spinner.hide();
  //     });
  //   }
  //   else {
  //     const dialogRef = this.dialog.open(ActionComponent, { width: '50%', panelClass: 'custom-viewdialogstyle', data: { actiontype: type, action: this.lastaction, actioncards: this.orgAttendanceCards, actionsection: this.nextaction }, });

  //     dialogRef.afterClosed().subscribe(result => {
  //       // this.ActionCard();
  //       if (result != undefined && result != "") {
  //         let data = result.data;
  //         let type = result.type;
  //         this.DoAction(data);
  //       }

  //     }, (error) => {
  //       this.router.navigate(["/404"]);
  //       this.spinner.hide();
  //     });
  //   }

  // }
  openDialog(type: string) {
    let screenWidth = screen.availWidth;
    if (screenWidth <= 750) {
      const dialogRef = this.dialog.open(ActionComponent, { width: '90%', panelClass: 'custom-viewdialogstyle', data: { actiontype: type, action: this.lastaction, actioncards: this.orgAttendanceCards, actionsection: this.nextaction }, });
      dialogRef.afterClosed().subscribe(result => {
        this.ActionCard();
        if (result != undefined) {
          let data = result.data;
          let type = result.type;
          // this.DoAction(data, type);
          this.DoAction(data);
        }
      });
    } else {
      const dialogRef = this.dialog.open(ActionComponent, { width: '50%', panelClass: 'custom-viewdialogstyle', data: { actiontype: type, action: this.lastaction, actioncards: this.orgAttendanceCards, actionsection: this.nextaction }, });
      dialogRef.afterClosed().subscribe(result => {
        this.ActionCard();
        if (result != undefined) {
          let data = result.data;
          let type = result.type;
          // this.DoAction(data, type);
          this.DoAction(data);
        }
      });
    }
    // const dialogRef = this.dialog.open(ActionComponent, { data: { actiontype: type, action: this.lastaction, activeHours: this.activeHours }, });

  }

  //********************* To convert milliseconds to string function *********************************/
  millisecondsToStr(milliseconds) {
    // TIP: to find current time in milliseconds, use:
    // var  current_time_milliseconds = new Date().getTime();

    var value = "";

    var temp = Math.floor(milliseconds / 1000);
    var years = Math.floor(temp / 31536000);
    if (years) {
      value += years + ' year ';
    }
    //TODO: Months! Maybe weeks? 
    var days = Math.floor((temp %= 31536000) / 86400);
    if (days) {
      value += days + ' day ';
    }
    var hours = Math.floor((temp %= 86400) / 3600);
    if (hours) {
      value += hours + ' hour ';
    }
    var minutes = Math.floor((temp %= 3600) / 60);
    if (minutes) {
      value += minutes + ' minutes ';
    }
    var seconds = temp % 60;
    if (seconds) {
      value += seconds + ' second';
      // console.log(seconds );
    }
    if (value == "") {
      value = 'less than a second'  //'just now' //or other string you like;
    }
    return value;
  }

  // ? ************************** get slack details ************************ //
  getslackDetails() {
    this.spinner.show();
    let data: Object = {
      "org_id": localStorage.getItem("OrgId"),
      "module_name": "attendance",
      "reason": "check-in",
      "app_name": "slack"
    }
    let subscription = this.attendanceService.getslackDetails(data).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        // let response = JSON.parse(data.map.data);
        let response = data.map.data;
        this.slackIntegrationDetails = response;
      } else if (data.map.statusMessage == "Error") {
      }
      this.spinner.hide();
      this.getSlackConfig();
    })
    this.subscriptions.push(subscription);
  }

  getSlackConfig() {
    this.spinner.show();
    let OrgId = localStorage.getItem("OrgId");
    let data: Object = {
      org_id: OrgId,
      app: "slack",
      module: "all",
    };
    this.manageIntegrationService.getIntegrationAccessData(data).subscribe(
      (data) => {
        if (data.map.statusMessage == "Success") {
          let out = data.map.data;
          if (out.isActive == true) {
            this.isNotify = "Yes";
          } else {
            this.isNotify = "No";
          }
        } else {
          this.isNotify = "No";
        }
        this.spinner.hide();
      },
      (error) => {
        this.router.navigate(["/404"]);
        this.spinner.hide();
      }
    );
  }

  // ? ************************** get employee information ************************************************//
  getEmpDetailsById(id) {
    this.spinner.show();
    let subscription = this.settingsService.getActiveEmpDetailsById(id).subscribe(data => {
      this.ReporterLoader = false;
      this.ReportingToLoader = true;
      if (data.map.statusMessage == "Success") {
        let response = JSON.parse(data.map.data);
        // let accessModule = JSON.parse(response.roleDetails.access_to);
        // console.log(response);
        if (JSON.parse(response.roleDetails.access_to).find(access => access == 'my-day-planner')) {
          this.reminderDialogAccess = true;

        } else {
          this.reminderDialogAccess = false;

        }
        // console.log(this.todayLeaveDialog);
        if (response.reporting_manager) {
          this.Detail = response.reporter_name;
        }
        else {
          this.Detail = '-';
        }
        this.ReportingToLoader = false;
        this.ReporterLoader = true;
        this.profilename = response.firstname + " " + response.lastname;
        if (response.profile_image != undefined) {
          let stringArray = new Uint8Array(response.profile_image);
          const STRING_CHAR = stringArray.reduce((data, byte) => {
            return data + String.fromCharCode(byte);
          }, '');
          let base64String = btoa(STRING_CHAR);
          // this.profileurl = this.domSanitizer.bypassSecurityTrustUrl("data:image/jpeg;base64," + base64String);
          // this.profileurl =  base64String;
          this.profileurl = "https://uat.tcube.io/assets/images/user_person.png";
          this.spinner.hide();
        } else {
          this.profileurl = "https://uat.tcube.io/assets/images/user_person.png";
          this.spinner.hide();
        }
      }
    })
    this.subscriptions.push(subscription);
  }

  //get Whatsapp details
  getWhatsappDetails() {
    this.spinner.show();
    let data: Object = {
      "org_id": localStorage.getItem("OrgId"),
      "module_name": "attendance",
      "reason": "check-in",
      "app_name": "whatsapp"
    }
    let subscription = this.attendanceService.getslackDetails(data).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        // let response = JSON.parse(data.map.data);
        let response = data.map.data;
        this.whatsappIntegrationDetails = response;
      } else if (data.map.statusMessage == "Error") {
      }
      this.spinner.hide();
    })
    this.subscriptions.push(subscription);
  }

}




//*********************************** Old Code ********************************** */
// export class DashboardComponent implements OnInit, OnDestroy  {

//   subscriptions : Subscription[] = [];
//   detail: any;
//   actiontype: string;
//   lastaction: any;
//   nextaction: string;
//   activeHours: string;
//   subscribe: any;
//   totalTime: number;
//   min: number;
//   sec: number;
//   hrs: number;
//   Activetime: any = 0;
//   activetime: boolean = false;
//   email: string;
//   currentActivetime: number = 0;
//   newLeaveTypeDetails: any[] = [];
//   holidayDetails: any[] = [];
//   LeaveTypeArr: any[] = [];
//   image_url: any;
//   startOfYear: any;
//   todaydate: any;
//   endOfYear: any;
//   tommorrow: any;
//   day_after_tommorrow: any;
//   approvedCounts: any = [];
//   clockTimer: string = '00 Hrs : 00 Min :00 Sec';
//   Today_leaves: any[];
//   dataSourceleave: MatTableDataSource<any>;
//   todayleavesloader: boolean = true;
//   leaveontoday: boolean = true;
//   myleavesdata: boolean = false;
//   isFirstTime: boolean = false;
//   Detail: any;
//   constructor(public dialog: MatDialog, public router: Router,
//     private attendanceService: AttendanceServiceService,
//     private spinner: NgxSpinnerService,
//     private timetrackerservice: TimeTrackerService,
//     public datepipe: DatePipe,
//     private jobsService: JobsService,
//     private domSanitizer: DomSanitizer,
//     private manageattendanceService: ManageattendanceService,
//     private settingsService: SettingsService, private projectsService: ProjectsService, private leavetrackerService: LeaveTrackerService,
//     private offerLetterService: OfferLetterService, private internshipService: InternshipletterService,
//     private approvedLeaveDetailsService: ApprovedLeaveDetailsService,
//     private RegisterService: RegisterService,) {

//   }

//   timelogtabs = [];
//   timetab = [];
//   displayedColumnstimelog = ['task', 'time', 'status'];
//   transactions: any[] = [
//     { item: 'Beach ball', cost: 4 },
//     { item: 'Towel', cost: 5 },
//     { item: 'Frisbee', cost: 2 },
//     { item: 'Sunscreen', cost: 4 },
//     { item: 'Cooler', cost: 25 },
//     { item: 'Swim suit', cost: 15 },
//   ];

//   isShownbilchart: boolean;

//   myjobColumns: string[] = ['Job', 'Estimated_hours', 'logged_hours', 'started_date', 'end_date'];


//   data: string[] = ['one', 'two', 'three', 'four', 'five'];
//   today: string;
//   billable_time: string = "0";
//   non_billable_time: string = "0";
//   billable: number = 0;
//   non_billable: number = 0;
//   options: any;
//   displayedColumns: string[] = ['date', 'firstIn', 'lastout', 'activehrs', 'timediff', 'Status'];
//   displayedColumnsforholidays: string[] = ['leavetype', 'date'];
//   displayedactiveEmpColumns: string[] = ['image', 'email', 'name', 'designation', 'time', 'Status'];
//   displayedactiveLeaveColumns: string[] = ['image', 'name', 'Leavetype', 'Status'];
//   displayedColumnsOffer: string[] = ['name', 'dob'];
//   displayedColumnsBusiness: string[] = ['name', 'program_title'];
//   dataSource: MatTableDataSource<any>;
//   dataSource2: MatTableDataSource<any>;
//   dataSource3: MatTableDataSource<any>;
//   dataSource4: MatTableDataSource<any>;
//   dataSource5: MatTableDataSource<any>;
//   dataSource6: MatTableDataSource<any>;
//   dataSource_up: MatTableDataSource<any>;
//   expand_details: any[];
//   alldetails: any;
//   startdates: any;
//   enddates: any;
//   yearofmonth: string;
//   todaystatuscheck: string;
//   j: any;
//   timesheet: boolean = true;
//   timesheetloder: boolean = true;
//   activeemp: boolean = true;
//   holiday: boolean = true;
//   activeemploader: boolean = true;
//   myjobsdata: boolean = true;
//   myjobsdataloader: boolean = true;
//   tabactvive: boolean = false;
//   timetabloder: boolean = true;
//   lettercountloader: boolean = true;
//   projectandclientcountloader: boolean = true;
//   ReporterLoader: boolean = false;
//   myleavedataloader: boolean = true;
//   upcomingholidaysloader: boolean = true;
//   clientcount: number = 0;
//   clientcount1: number = 0;
//   projectcount: number = 0;
//   projectcount1: number = 0;
//   jobscount: number = 0;
//   jobscount1: number = 0;
//   clientDashboardCount: number = 0;
//   projectDashboardCount: number = 0;
//   jobsDashboardCount: number = 0;
//   offerlettercount: number = 0;
//   businesslettercount: number = 0;
//   orgAttendanceCards = [];
//   monthChartProjects = [];
//   monthChartBillableMS: any = [];
//   monthChartBillable: any = [];
//   monthChartNonBillableMS: any = [];
//   monthChartNonBillable: any = [];
//   actioncards: any[] = [
//     {
//       "action": "I am in from office",
//       "action_type": "in",
//       "action_image": "../../../assets/images/punch-cards-icon/office-white.png",
//       "current_section": "in",
//       "next_section": "out"
//     },
//     {
//       "action": "I am in from home",
//       "action_type": "in",
//       "action_image": "../../../assets/images/punch-cards-icon/home-white.png",
//       "current_section": "in",
//       "next_section": "out"
//     },
//     {
//       "action": "Off today",
//       "action_type": "out",
//       "action_image": "../../../assets/images/punch-cards-icon/leave-white.png",
//       "current_section": "in",
//       "next_section": "in"
//     },
//     {
//       "action": "Commuting",
//       "action_type": "in",
//       "action_image": "../../../assets/images/punch-cards-icon/travel-white.png",
//       "current_section": "in",
//       "next_section": "out"
//     },
//     {
//       "action": "Out now will connect later",
//       "action_type": "out",
//       "action_image": "../../../assets/images/punch-cards-icon/cf-white.png",
//       "current_section": "out",
//       "next_section": "back"
//     },
//     {
//       "action": "Out for personal work",
//       "action_type": "out",
//       "action_image": "../../../assets/images/punch-cards-icon/pwrk-white.png",
//       "current_section": "out",
//       "next_section": "back"
//     },
//     {
//       "action": "Out for official work",
//       "action_type": "out",
//       "action_image": "../../../assets/images/punch-cards-icon/officialwork-white.png",
//       "current_section": "out",
//       "next_section": "back"
//     },
//     {
//       "action": "Feeling sick will take rest",
//       "action_type": "out",
//       "action_image": "../../../assets/images/punch-cards-icon/sick-white.png",
//       "current_section": "out",
//       "next_section": "back"
//     },
//     {
//       "action": "I am out",
//       "action_type": "out",
//       "action_image": "../../../assets/images/punch-cards-icon/out-sign-white.png",
//       "current_section": "out",
//       "next_section": "in"
//     },
//     {
//       "action": "Out for break",
//       "action_type": "out",
//       "action_image": "../../../assets/images/punch-cards-icon/out_for_break.png",
//       "current_section": "out",
//       "next_section": "back"
//     },
//     {
//       "action": "Out for Lunch",
//       "action_type": "out",
//       "action_image": "../../../assets/images/punch-cards-icon/out_for_lunch.png",
//       "current_section": "out",
//       "next_section": "back"
//     },
//     {
//       "action": "Back to work",
//       "action_type": "in",
//       "action_image": "../../../assets/images/punch-cards-icon/back-work-white.png",
//       "current_section": "back",
//       "next_section": "out"
//     }
//   ];
//   dashtable: boolean;
//   isShown: boolean = false;
//   isHide: boolean = true;
//   role: string;
//   slackIntegrationDetails: any = [];
//   whatsappIntegrationDetails: any = [];
//   profileurl: any;
//   profilename: string;
//   org_id:any;
//   ngOnDestroy() {
//     this.subscriptions.forEach(x => {
//       if(!x.closed) {
//         x.unsubscribe();
//       }
//     });
//   }
//   ngOnInit() {
//     this.role = localStorage.getItem("Role");
//     this.org_id = localStorage.getItem("OrgId");
//     this.ActionCard();
//     this.email = localStorage.getItem("Email");
//     this.actiontype = "In"
//     this.today = moment().format("YYYY-MM-DD");
//     // this.j = 1;
//     this.Detail;
//     // this.gettimelogs();
//     this.getCurrentStatus();
//     let url = (window.location.href).split("/");
//     localStorage.setItem('backBtn', "/" + url[url.length - 1]);
//     if (this.role === "org_admin") {
//       this.isShown = true;
//       this.dashtable = true;
//       this.isHide = false;
//       // this.getActiveClientDetailsByOrgId();
//       this.WelcomeMessage();
//       this.getOfferLetterCount();
//       this.getTotalCPJCountInOrgDashboard();
//       // this.getRecentlyAddedOfferLetter();
//     } else {
//       this.isShown = false;
//       this.dashtable = false;
//       this.isHide = true;

//     }
//     this.getProjectDetails();

//     this.timetabloder = true;
//     this.getActiveJobDetailsByOrgId();
//     // this.getactiveemployeebydate();
//     this.hrs = 0
//     this.min = 0;
//     this.sec = 1;
//     this.hrs = this.hrs * 3600;
//     this.min = this.min * 60;
//     this.sec = this.sec % 60;
//     this.totalTime = this.hrs + this.min + this.sec;

//     // this.todaystatuscheck = moment().format("DD-MM-YYYY");

//     // let formdata = {
//     //   "empid": localStorage.getItem("Id"),
//     //   "date": this.today
//     // }
//     // let formdata = {
//     //   "empid": localStorage.getItem("Id"),
//     //   "startdate": moment().format("01-MM-YYYY"),
//     //   "enddate": moment().daysInMonth() + moment().format("-MM-YYYY"),
//     // }
//     // let subscription1 = this.timetrackerservice.getbillingchartmonth(formdata).subscribe(data => {
//     //   if (data.map.statusMessage == "Success") {
//     //     let response: any = data.map.data.map;
//     //     this.billable = Number(response.billable_time);
//     //     this.non_billable = Number(response.non_billable_time);
//     //   }

//     //   setTimeout(() => {
//     //     Highcharts.chart('bill_status', this.setchartoption());

//     //   }, 1000);
//     // }, (error) => {
//     //   this.router.navigate(["/404"]);
//     //   this.spinner.hide();
//     // })

//     // let data: Object = {
//     //   "org_id": this.org_id,
//     //   "sd_date": moment().startOf('month').format("YYYY-MM-DD").toString(),
//     //   "ed_date": moment().endOf('month').format("YYYY-MM-DD").toString(),
//     // }
//     // let subscription = this.timetrackerservice.getBillAndNonBillHoursByOrgIdAndProjects(data).subscribe(details => {
//     //   if (details.map.statusMessage == "Success") {
//     //     let projects = details.map.projects.myArrayList;
//     //     this.monthChartProjects = projects;
//     //     this.monthChartBillableMS = details.map.billable.myArrayList;
//     //     // let billable = details.map.billable.myArrayList;
//     //     this.monthChartNonBillableMS = details.map.non_billable.myArrayList;
//     //     // let nonbillable = details.map.non_billable.myArrayList;
//     //     for (let i = 0; i < this.monthChartBillableMS.length; i++) {
//     //       var hrsValue = this.millisToMinutesAndSeconds(this.monthChartBillableMS[i]);
//     //       // let tempData:any = parseInt(hrsValue);
//     //       this.monthChartBillable.push(hrsValue);
//     //     }
//     //     // console.log(this.monthChartBillable);
//     //     for (let i = 0; i < this.monthChartNonBillableMS.length; i++) {
//     //       let hrsValue = this.millisToMinutesAndSeconds(this.monthChartNonBillableMS[i]);
//     //       // let tempData = parseFloat(hrsValue);
//     //       this.monthChartNonBillable.push(hrsValue);
//     //     }
//     //     // console.log(this.monthChartNonBillable);
//     //   }
//     //   setTimeout(() => {
//     //     Highcharts.chart('monthly_bill_hours', this.setMonthlychartoption());
//     //   }, 1000);

//     // }, (error) => {
//     //   this.router.navigate(["/404"]);
//     //   this.spinner.hide();
//     // })


//     // this.alldetails = [];
//     this.startdates = new Date();
//     const date = new Date(this.startdates);
//     this.startdates = new Date(date.getFullYear(), date.getMonth(), 1);
//     this.enddates = new Date(date.getFullYear(), date.getMonth() + 1, 0);
//     // this.getmonthlyReport();
//     // this.ActionCard();
//     // setTimeout(() => {
//     //   this.timelogtabs = this.timelogtabs.sort(this.sortByProperty("value"));
//     //   this.timetab = this.timelogtabs;
//     //   this.timetab = this.timetab.reverse();
//     //   this.tabactvive = true;
//     //   this.timetabloder = false;
//     //   // console.log(this.timelogtabs)
//     // }, 1000);
//     // for my leaves and upcoming holiday
//     this.startOfYear = moment().startOf('year').toDate();
//     this.todaydate = moment().toDate();
//     this.endOfYear = moment().endOf('year').toDate();
//     this.tommorrow = moment().add(1, 'days').format("YYYY-MM-DD").toString();
//     this.day_after_tommorrow = moment().add(2, 'days').toDate();
//     // this.LeaveTypeByOrgIdAndDates();
//     // this.getHolidaysByOrgId();
//     // this.TodayLeaves();
//     this.getslackDetails();
//     this.getWhatsappDetails();
//     this.getEmpDetailsById(localStorage.getItem("Id"));
//     // this.getHoursByOrgIdAndProjects();

//     // this.subscriptions.push(subscription);
//     // this.subscriptions.push(subscription1);
//   }

//   //***********************************************Org Total clients,project, jobs  Count************************************************* *//
//   getTotalCPJCountInOrgDashboard() {
//     let orgId = localStorage.getItem("OrgId");
//     let subscription =this.settingsService.getTotalCountCPJOrgDashboard(orgId).subscribe(data => {
//       this.projectandclientcountloader = true;
//       if (data.map.statusMessage == "Success") {
//         const response = data.map;
//         this.clientDashboardCount = response.clientCountDetails;
//         this.projectDashboardCount = response.projectCountdetails;
//         this.jobsDashboardCount = response.jobCountdetails;
//         this.projectandclientcountloader = false;
//       }
//     }, (error) => {
//       this.router.navigate(["/404"]);
//       this.spinner.hide();
//     })
//     this.subscriptions.push(subscription);
//   }

//   //***********************************************Org Total Hr Letter's Count************************************************* *//
//   getOfferLetterCount() {
//     this.lettercountloader = true;
//     let orgId = localStorage.getItem("OrgId");
//     let subscription1 = this.offerLetterService.getOfferLetterLength(orgId).subscribe(data => {
//       let res = JSON.parse(data.map.data);
//       this.offerlettercount = res;
//     }, (error) => {
//       this.router.navigate(["/404"]);
//       this.spinner.hide();
//     })
//     let subscription2 = this.internshipService.getBusinessLetterLength(orgId).subscribe(data => {
//       let res = JSON.parse(data.map.data);
//       this.businesslettercount = res;
//     }, (error) => {
//       this.router.navigate(["/404"]);
//       this.spinner.hide();
//     })
//     this.lettercountloader = false;
//     this.subscriptions.push(subscription1);
//     this.subscriptions.push(subscription2);
//   }
//   // getRecentlyAddedOfferLetter() {
//   //   let orgId = localStorage.getItem("OrgId");
//   //   this.offerLetterService.getNewlyAddedOfferLetter(orgId).subscribe(data => {
//   //     this.addedofferletterloader = true;
//   //     let response = JSON.parse(data.map.data);
//   //     this.addedofferletterloader = false;
//   //     this.dataSource5 = new MatTableDataSource(response);
//   //     if (response.length > 0) {
//   //       this.addedofferletterdata = false;
//   //     }
//   //   })
//   //   this.internshipService.getNewlyAddedBusinessLetter(orgId).subscribe(data => {
//   //     this.addedbusinessletterloader =true;
//   //     let response = JSON.parse(data.map.data);
//   //     this.addedbusinessletterloader = false;
//   //     this.dataSource6 = new MatTableDataSource(response);
//   //     if (response.length > 0) {
//   //       this.addedbusinessletterdata = false;
//   //     }
//   //   })
//   // }

//   ////Welcome message for org-admin first time login////

//   WelcomeMessage() {
//     let subscription= this.RegisterService.getOrgDetailsById(this.org_id).subscribe(data => {

//       let response = JSON.parse(data.map.data);

//       this.detail = response;
//       if (this.detail.first_time) {
//         const dialogRef = this.dialog.open(WelcomeComponent, { panelClass: 'custom-viewdialogstyle' });
//         let formdata = {
//           "id": this.detail.org_id,
//           "firstname": this.detail.firstname,
//           "lastname": this.detail.lastname,
//           "email": this.detail.email,
//           "company_name": this.detail.company_name,
//           "password": this.detail.password,
//           "first_time": false,

//         }

//         dialogRef.afterClosed().subscribe(res => {
//           if (res != undefined && res != "") {
//             if (res.data == true && (localStorage.getItem("settingAccess") === "true") && (localStorage.getItem("attendaceAccess") === "true")) {
//               const dialogRef = this.dialog.open(NoactionComponent, { width: '50%', panelClass: 'custom-viewdialogstyle', });
//             }
//           }
//           this.RegisterService.updateOrg(formdata).subscribe(result => {

//           })
//         })
//       } else {
//         this.ActionCardsavailable();
//         // console.log(response);

//       }
//     }, (error) => {
//       this.router.navigate(["/404"]);
//       this.spinner.hide();
//     })
//     this.subscriptions.push(subscription);
//   }

//   //***********************************************Org action card************************************************* *//
//   ActionCard() {
//     this.spinner.show();
//     let subscription = this.manageattendanceService.getAllActionCardByOrgId(this.org_id).subscribe(async data => {

//       if (data.map.statusMessage == "Success") {
//         let response: any[] = JSON.parse(data.map.data);
//         if (response.length != 0) {
//           let response: any[] = JSON.parse(data.map.data);
//           for (var i = 0; i < response.length; i++) {
//             let stringArray = new Uint8Array(response[i].action_image);
//             const STRING_CHAR = stringArray.reduce((data, byte) => {
//               return data + String.fromCharCode(byte);
//             }, '');
//             let base64String = btoa(STRING_CHAR);
//             response[i].action_image = this.domSanitizer.bypassSecurityTrustUrl("data:image/jpeg;base64," + base64String);

//           }
//           this.orgAttendanceCards = response;
//         }
//         this.spinner.hide();
//       }
//       else {
//         this.spinner.hide();
//       }

//     }, (error) => {
//       this.router.navigate(["/404"]);
//       this.spinner.hide();
//     })
//     this.subscriptions.push(subscription);
//   }

//   ActionCardsavailable() {
//     this.spinner.show();
//     this.manageattendanceService.getAllActionCardByOrgId(this.org_id).subscribe(async data => {

//       if (data.map.statusMessage == "Success") {
//         let response: any[] = JSON.parse(data.map.data);
//         if (response.length == 0) {
//           if ((localStorage.getItem("settingAccess") === "true") && (localStorage.getItem("attendaceAccess") === "true")) {
//             const dialogRef = this.dialog.open(NoactionComponent, { width: '50%', panelClass: 'custom-viewdialogstyle', });
//             dialogRef.afterClosed().subscribe(result => {
//               if (result == true) {
//                 this.ActionCard();
//               }

//             });
//           }
//         }
//         this.spinner.hide();
//       }
//       else {
//         this.spinner.hide();
//       }

//     }, (error) => {
//       this.router.navigate(["/404"]);
//       this.spinner.hide();
//     })

//   }

//   ///****************** URL to file function***************///
//   async getFileFromUrl(url, name, defaultType = 'image/jpeg') {
//     const response = await fetch(url);
//     const data = await response.blob();
//     return new File([data], name, {
//       type: data.type || defaultType,
//     });
//   }

//   //****************************************************Attendance Action post method integration********************************************//
//   DoAction(action) {
//     this.spinner.show();
//     // console.log(action);
//     this.timetab = [];
//     var aType = '';
//     // if (this.actiontype === "In") {
//     //   aType = "in";
//     // }
//     // else {
//     //   aType = "out";
//     // }

//     // if (action == "Off today") {
//     //   type = "out";
//     // }

//     let zone = moment.tz.guess();
//     let formdata = {
//       "email": this.email,
//       "org_id": +this.org_id,
//       "action": action.action,
//       "actionType": action.action_type,
//       "timezone": zone,
//       "next_action_section": action.next_section
//     }
//     this.attendanceService.createAttendanceDetails(formdata).subscribe(data => {
//       if (data.map.statusMessage == "Success") {
//         // ? ************************** Post attendance message in slack integration ************************ //
//         if (this.slackIntegrationDetails.is_paused == false) {
//           this.attendanceService.attendanceSendToSlack(this.slackIntegrationDetails.url, data.map.data, this.profilename).subscribe();
//         }

//         // ? ************************** Post attendance message in Whatsapp integration ************************ //
//         if (this.whatsappIntegrationDetails.is_paused == false) {
//           // let templateData = this.attendanceService.sendWhatsAppTemplate(data.map.data, this.profilename, this.whatsappIntegrationDetails.country_code_1 + this.whatsappIntegrationDetails.mobile_number_1)
//           // this.attendanceService.sendToWhatsApp(this.whatsappIntegrationDetails.url, this.whatsappIntegrationDetails.whatsapp_access_token, JSON.stringify(templateData)).subscribe();
//           // if (this.whatsappIntegrationDetails.mobile_number_2 != undefined) {
//           //   let templateData = this.attendanceService.sendWhatsAppTemplate(data.map.data, this.profilename, this.whatsappIntegrationDetails.country_code_2 + this.whatsappIntegrationDetails.mobile_number_2)
//           //   this.attendanceService.sendToWhatsApp(this.whatsappIntegrationDetails.url, this.whatsappIntegrationDetails.whatsapp_access_token, JSON.stringify(templateData)).subscribe();
//           // }
//           let tempData = JSON.parse(this.whatsappIntegrationDetails.numbers);
//           for(let i=0; i<tempData.length; i++) {
//             let templateData = this.attendanceService.sendWhatsAppTemplate(data.map.data, this.profilename, tempData[i].code+tempData[i].number)
//             this.attendanceService.sendToWhatsApp(this.whatsappIntegrationDetails.url, this.whatsappIntegrationDetails.whatsapp_access_token, JSON.stringify(templateData)).subscribe();
//           }
//         }
//         this.getCurrentStatus();
//         // this.ngOnInit();
//         this.timelogtabs = this.timelogtabs.sort(this.sortByProperty("value"));
//         this.timetab = this.timelogtabs;
//         this.timetab = this.timetab.reverse();
//         this.tabactvive = true;
//       }
//       else {
//         // console.log(data);
//       }
//     }, (error) => {
//       this.router.navigate(["/404"]);
//       this.spinner.hide();
//     })
//   }

//   //****************Get current Status of user****************//
//   getCurrentStatus() {
//     this.spinner.show();
//     let subscription = this.attendanceService.getCurrentstatusattendance(this.email).subscribe(data => {
//       if (data.map.statusMessage == "Success") {
//         var details = JSON.parse((data.map.data));
//         this.currentActivetime = details.activeHours / 1000;
//         this.activetime = true;
//         this.Activetime = this.currentActivetime;
//         this.totalTime = this.Activetime;
//         this.lastaction = details;
//         this.nextaction = details.next_section;
//         this.activeHours = details.activeHours;
//         if (details.actionType === "in") {
//           this.actiontype = "Out";
//           // this.basicTimer.startTime=this.currentActivetime;
//           this.timerClock();
//           setTimeout(() => {
//             /** spinner ends after 3 seconds */
//             this.spinner.hide();
//           }, 3000);
//         }
//         else {
//           this.actiontype = "In";
//           this.stopBtnClicked();
//           setTimeout(() => {
//             /** spinner ends after 3 seconds */
//             this.spinner.hide();
//           }, 3000);
//         }
//         // console.log(this.actiontype);
//         // console.log(this.Activetime);
//       }
//       else {
//         setTimeout(() => {
//           /** spinner ends after 3 seconds */
//           this.spinner.hide();
//         }, 3000);
//       }
//     }, (error) => {
//       this.router.navigate(["/404"]);
//       this.spinner.hide();
//     })
//     this.subscriptions.push(subscription);
//   }

//   getactiveemployeebydate() {
//     this.spinner.show();
//     let datefm = this.datepipe.transform(new Date(), 'dd-MM-yyyy');
//     let formdata = {
//       "org_id": localStorage.getItem("OrgId"),
//       "date": datefm,
//     }
//    let subscription = this.attendanceService.getActiveEmployeeDetails(formdata).subscribe(data => {
//       this.activeemploader = true;
//       if (data.map.statusMessage == "Success") {
//         let response: any[] = JSON.parse(data.map.data);
//         for (var i = 0; i < response.length; i++) {
//           if (response[i].image != undefined) {
//             // debugger
//             let stringArray = new Uint8Array(response[i].image);
//             const STRING_CHAR = stringArray.reduce((data, byte) => {
//               return data + String.fromCharCode(byte);
//             }, '');
//             let base64String = btoa(STRING_CHAR);
//             response[i].image = this.domSanitizer.bypassSecurityTrustUrl("data:image/jpeg;base64," + base64String);
//           }
//           else {
//             response[i].image = "assets/images/profile.png";
//           }
//         }
//         this.activeemploader = false;
//         // response = [];
//         this.dataSource3 = new MatTableDataSource(response);

//         if (response.length > 0) {
//           this.activeemp = false;
//         }
//         setTimeout(() => {
//           this.spinner.hide();
//         }, 2000);
//       }
//       else {
//         this.activeemploader = false;
//         setTimeout(() => {
//           this.spinner.hide();
//         }, 2000);
//       }

//     }, (error) => {
//       this.router.navigate(["/404"]);
//       this.spinner.hide();
//     })
//     this.subscriptions.push(subscription);


//   }


//   stopBtnClicked() {
//     if (this.clockTimer != "00 Hrs : 00 Min :00 Sec") {
//       this.subscribe.unsubscribe();
//     }
//     let minutes, seconds, hours, formatedMinutes, formatedSeconds, formatedHours;
//     hours = Math.floor(this.totalTime / 3600) % 24;
//     minutes = Math.floor(this.totalTime / 60) % 60;
//     seconds = Math.floor((this.totalTime % 60));
//     formatedHours = hours > 9 ? hours : '0' + hours;
//     formatedMinutes = minutes > 9 ? minutes : '0' + minutes;
//     formatedSeconds = seconds > 9 ? seconds : '0' + seconds;

//     this.clockTimer = `${formatedHours} Hrs : ${formatedMinutes} Min : ${formatedSeconds} Sec`;
//     // console.log(this.clockTimer, this.totalTime)
//   }

//   timerClock() {
//     let minutes, seconds, hours, formatedMinutes, formatedSeconds, formatedHours;
//     let nTime = this.totalTime;
//     const source = timer(1, 1000);
//     this.subscribe = source.subscribe((val) => {
//       hours = Math.floor(this.totalTime / 3600) % 24;
//       minutes = Math.floor(this.totalTime / 60) % 60;
//       seconds = Math.floor((this.totalTime % 60));
//       formatedHours = hours > 9 ? hours : '0' + hours;
//       formatedMinutes = minutes > 9 ? minutes : '0' + minutes;
//       formatedSeconds = seconds > 9 ? seconds : '0' + seconds;
//       this.totalTime = nTime + val;

//       this.clockTimer = `${formatedHours} Hrs : ${formatedMinutes} Min : ${formatedSeconds} Sec`;
//     }, (error) => {
//       this.router.navigate(["/404"]);
//       this.spinner.hide();
//     });
//   }
//   openDialog(type: string) {
//     let screenWidth = screen.availWidth;
//     if (screenWidth <= 750) {
//       const dialogRef = this.dialog.open(ActionComponent, { width: '90%', panelClass: 'custom-viewdialogstyle', data: { actiontype: type, action: this.lastaction, actioncards: this.orgAttendanceCards, actionsection: this.nextaction }, });

//       dialogRef.afterClosed().subscribe(result => {
//         // this.ActionCard();
//         if (result != undefined && result!="") {
//           let data = result.data;
//           let type = result.type;
//           this.DoAction(data);
//         }
//         this.monthChartProjects = [];
//         this.monthChartBillable = [];
//         this.monthChartNonBillable = [];

//       }, (error) => {
//         this.router.navigate(["/404"]);
//         this.spinner.hide();
//       });
//     }
//     else {
//       const dialogRef = this.dialog.open(ActionComponent, { width: '50%', panelClass: 'custom-viewdialogstyle', data: { actiontype: type, action: this.lastaction, actioncards: this.orgAttendanceCards, actionsection: this.nextaction }, });

//       dialogRef.afterClosed().subscribe(result => {
//         // this.ActionCard();
//         if (result != undefined && result!="") {
//           let data = result.data;
//           let type = result.type;
//           this.DoAction(data);
//         }
//         this.monthChartProjects = [];
//         this.monthChartBillable = [];
//         this.monthChartNonBillable = [];

//       }, (error) => {
//         this.router.navigate(["/404"]);
//         this.spinner.hide();
//       });
//     }

//   }

//   numberEnding(number) {
//     return (number > 1) ? 's' : '';
//   }
//   millisecondsToStr(milliseconds) {
//     // TIP: to find current time in milliseconds, use:
//     // var  current_time_milliseconds = new Date().getTime();

//     var value = "";

//     var temp = Math.floor(milliseconds / 1000);
//     var years = Math.floor(temp / 31536000);
//     if (years) {
//       // value+= years + ' year' + this.numberEnding(years);
//       value += years + ' year ';
//     }
//     //TODO: Months! Maybe weeks? 
//     var days = Math.floor((temp %= 31536000) / 86400);
//     if (days) {
//       // value+=  days + ' day ' + this.numberEnding(days);
//       value += days + ' day ';
//     }
//     var hours = Math.floor((temp %= 86400) / 3600);
//     if (hours) {
//       // value+=  hours + ' hour ' + this.numberEnding(hours);
//       value += hours + ' hour ';
//     }
//     var minutes = Math.floor((temp %= 3600) / 60);
//     if (minutes) {
//       // value+= minutes + ' minute ' + this.numberEnding(minutes);
//       value += minutes + ' minute ';
//     }
//     var seconds = temp % 60;
//     if (seconds) {
//       // value+= seconds + ' second' + this.numberEnding(seconds);
//       value += seconds + ' second';
//       // console.log(seconds );
//     }
//     if (value == "") {
//       value = 'less than a second'  //'just now' //or other string you like;
//     }
//     return value;
//   }

//   setchartoption() {
//     //pie chart
//     this.options = {
//       chart: {
//         plotBackgroundColor: null,
//         plotBorderWidth: null,
//         type: 'pie'
//       },
//       credits: {
//         enabled: false
//       },
//       title: {
//         text: 'Current Month Billable/Non Billable Status',
//         style: {
//           fontSize: '16px'
//         }
//       },
//       tooltip: {
//         pointFormat: '{series.name}: {point.percentage:.1f}% ({point.time})'
//       },
//       accessibility: {
//         point: {
//           valueSuffix: '%'
//         }
//       },
//       plotOptions: {
//         pie: {
//           // size: '200px',
//           allowPointSelect: true,
//           cursor: 'pointer',

//           dataLabels: {
//             enabled: true,
//             format: '{point.name}: {point.percentage:.1f} % ({point.time})'
//           },
//           showInLegend: true
//         }
//       },
//       series: [{
//         name: 'Hours',
//         colorByPoint: true,
//         data: [{
//           name: 'Billable',
//           y: this.billable,
//           color: '#ff6e40',
//           sliced: true,
//           selected: true,
//           // time: this.billable_time
//           time: this.millisecondsToStr(this.billable)
//         }, {
//           name: 'Non Billable',
//           color: '#6FB2D2',
//           y: this.non_billable,
//           // time: this.non_billable_time
//           time: this.millisecondsToStr(this.non_billable)
//         }]
//       }]
//     }
//     return this.options;
//   }
//   setMonthlychartoption() {
//     this.options = {
//       chart: {
//         type: 'column'
//       },
//       title: {
//         text: 'Current Month Billable/Non Billable Hours Based On Projects',
//         style: {
//           fontSize: '16px'
//         }
//       },
//       xAxis: {
//         categories: this.monthChartProjects,
//         crosshair: true
//       },
//       yAxis: {
//         title: {
//           useHTML: true,
//           text: 'Hours'
//           // text: 'Million tonnes CO<sub>2</sub>-equivalents'
//         }
//       },
//       tooltip: {
//         headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
//         pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
//           '<td style="padding:0"><b>{point.y:.1f}Hrs</b></td></tr>',
//         footerFormat: '</table>',
//         shared: true,
//         useHTML: true
//       },
//       plotOptions: {
//         column: {
//           pointPadding: 0.2,
//           borderWidth: 0
//         },
//         series: {
//           borderWidth: 0,
//           dataLabels: {
//             enabled: true,
//             format: '{point.y:.1f}Hrs',
//           }
//         }
//       },
//       series: [{
//         name: 'Billable',
//         color: '#ff6e40',
//         data: this.monthChartBillable

//       }, {
//         name: 'Non Billable',
//         color: '#6FB2D2',
//         data: this.monthChartNonBillable
//       }]
//     }
//     return this.options;
//   }
//   getmonthlyReport() {
//     this.spinner.show();
//     let formdata = {
//       "email": this.email,
//       "startdate": this.formatedate(this.startdates),
//       "enddate": this.formatedate(this.enddates),
//     }
//     this.attendanceService.getMonthreportdata(formdata).subscribe(data => {
//       this.timesheetloder = true;
//       if (data.map.statusMessage == "Success") {
//         // console.log(data);

//         let response: any[] = JSON.parse(data.map.report);
//         this.alldetails = JSON.parse(data.map.details);
//         this.dataSource = new MatTableDataSource(response.reverse());
//         this.timesheetloder = false;
//         if (this.alldetails.length > 0) {
//           this.timesheet = false;
//         }

//         setTimeout(() => {
//           this.spinner.hide();
//         }, 2000);
//       }
//       else {
//         this.timesheetloder = false;
//         setTimeout(() => {
//           this.spinner.hide();
//         }, 2000);
//         // console.log(data);
//       }
//     }, (error) => {
//       this.router.navigate(["/404"]);
//       this.spinner.hide();
//     })
//   }

//   formatedate(string: string) {
//     var date = new Date(string),
//       mnth = ("0" + (date.getMonth() + 1)).slice(-2),
//       day = ("0" + date.getDate()).slice(-2);
//     // this.yearofmonth=mnth+' '+date.getFullYear();
//     this.yearofmonth = date.getMonth() + " " + date.getFullYear();
//     return [day, mnth, date.getFullYear()].join("-");
//   }
//   formatedate2(string: string) {
//     var date = new Date(string),
//       mnth = ("0" + (date.getMonth() + 1)).slice(-2),
//       day = ("0" + date.getDate()).slice(-2);
//     // this.yearofmonth=mnth+' '+date.getFullYear();
//     this.yearofmonth = date.getMonth() + " " + date.getFullYear();
//     return [date.getFullYear(), mnth, day].join("-");
//   }
//   sortByProperty(property) {
//     return function (a, b) {
//       if (a[property] > b[property])
//         return 1;
//       else if (a[property] < b[property])
//         return -1;

//       return 0;
//     }
//   }
//   gettimelogs() {
//     this.timelogtabs = [];
//     var date1, date2, date3, date4, date5;
//     var v1, v2, v3, v4, v5;
//     this.j -= 1;
//     date1 = moment().add(this.j, 'days').format("YYYY-MM-DD");
//     v1 = this.gettimesheetbydate(date1, 1);
//     this.j -= 1;
//     date2 = moment().add(this.j, 'days').format("YYYY-MM-DD");
//     v2 = this.gettimesheetbydate(date2, 2);
//     this.j -= 1;
//     date3 = moment().add(this.j, 'days').format("YYYY-MM-DD");
//     v3 = this.gettimesheetbydate(date3, 3);
//     this.j -= 1;
//     date4 = moment().add(this.j, 'days').format("YYYY-MM-DD");
//     v4 = this.gettimesheetbydate(date4, 4);
//     this.j -= 1;
//     date5 = moment().add(this.j, 'days').format("YYYY-MM-DD");
//     v5 = this.gettimesheetbydate(date5, 5);

//   }
//   gettimesheetbydate(date, order) {
//     this.spinner.show();
//     let formdata = {
//       "emp_id": localStorage.getItem('Id'),
//       "date_of_request": date
//     }

//    let subscription = this.timetrackerservice.getbyempidanddate(formdata).subscribe(data => {
//       var details;
//       // console.log(formdata.date_of_request)
//       if (data.map.statusMessage == "Success") {
//         var ms = data.map.total_time;
//         var data1 = JSON.parse(data.map.details);
//         var seconds: any = Math.floor((ms / 1000) % 60);
//         var minutes: any = Math.floor((ms / (1000 * 60)) % 60);
//         var hours: any = Math.floor((ms / (1000 * 60 * 60)) % 24);

//         hours = (hours < 10) ? "0" + hours : hours;
//         minutes = (minutes < 10) ? "0" + minutes : minutes;
//         seconds = (seconds < 10) ? "0" + seconds : seconds;

//         details = {
//           date: this.datepipe.transform(new Date(formdata.date_of_request), 'dd EEE'), data: data1,
//           value: order,
//           total_time: hours + ":" + minutes + ":" + seconds
//         }
//         this.timelogtabs.push(details);
//         setTimeout(() => {
//           this.spinner.hide();
//         }, 2000);
//       }
//       else {
//         details = {
//           date: this.datepipe.transform(new Date(formdata.date_of_request), 'dd EEE'), data: [],
//           value: order
//         }
//         this.timelogtabs.push(details);
//         setTimeout(() => {
//           this.spinner.hide();
//         }, 2000);
//       }

//     }, (error) => {
//       this.router.navigate(["/404"]);
//       this.spinner.hide();
//     })
//     // this.j-=1;           
//     this.subscriptions.push(subscription);
//   }
//   ///***** */ get the job details for table ****///
//   myJob: any[] = [];
//   myJobactive: any[] = [];
//   totalJob: any[] = [];
//   totalJobactive: any[] = [];
//   getActiveJobDetailsByOrgId() {
//     this.spinner.show();
//     let orgId = localStorage.getItem("OrgId");
//     let myId = localStorage.getItem("Id");
//     let role = localStorage.getItem("Role");
//     let subscription = this.jobsService.getActiveJobDetailsByOrgIdnew(orgId).subscribe(data => {
//       this.myjobsdataloader = true;
//       if (data.map.statusMessage == "Success") {
//         let response: any[] = JSON.parse(data.map.data);
//         // console.log(response);
//         let jobDetails = response;
//         if (role == "org_admin") {
//           let projectlist = [];
//           let mydata = [];

//           for (let mpj = 0; mpj < jobDetails.length; mpj++) {
//             // && jobDetails[mpj].is_activated == true

//             if (!projectlist.includes(jobDetails[mpj].project_id) && jobDetails[mpj].is_deleted == false) {
//               projectlist.push(jobDetails[mpj].project_Id);
//             }
//             for (let pd = 0; pd < jobDetails[mpj].jobAssigneeDetails.length; pd++) {
//               if (jobDetails[mpj].jobAssigneeDetails[pd].map.id == myId) {
//                 this.myJob.push(jobDetails[mpj]);
//                 //  continue;
//               }
//               if (jobDetails[mpj].jobAssigneeDetails[pd].map.id == myId && jobDetails[mpj].is_activated == true) {
//                 this.myJobactive.push(jobDetails[mpj]);
//                 //  continue;
//               }
//             }
//             if (jobDetails[mpj].jobAssigneeDetails) {
//               this.totalJob.push(jobDetails[mpj]);
//             }
//             if (jobDetails[mpj].jobAssigneeDetails && jobDetails[mpj].is_activated == true) {
//               this.totalJobactive.push(jobDetails[mpj]);
//             }
//           }
//           this.jobscount = this.totalJobactive.length;
//           this.jobscount1 = this.myJobactive.length;
//         } else {
//           // let mydata = [];
//           let projectlist = [];
//           let clientcount = [];
//           for (let mpj = 0; mpj < jobDetails.length; mpj++) {
//             for (let pd = 0; pd < jobDetails[mpj].jobAssigneeDetails.length; pd++) {
//               if (!projectlist.includes(jobDetails[mpj].project_id) && jobDetails[mpj].is_deleted == false) {
//                 projectlist.push(jobDetails[mpj].project_id);
//               }
//               if (jobDetails[mpj].jobAssigneeDetails[pd].map.id == myId) {
//                 this.myJob.push(jobDetails[mpj]);
//                 // continue;
//               }
//               if (jobDetails[mpj].jobAssigneeDetails[pd].map.id == myId && jobDetails[mpj].is_activated == true) {
//                 this.myJobactive.push(jobDetails[mpj]);
//               }
//             }
//           }
//           this.jobscount = this.myJobactive.length;
//           // console.log(this.totalJob);

//         }
//         this.myjobsdataloader = false;
//         this.dataSource2 = new MatTableDataSource(this.myJob);
//         this.dataSource4 = new MatTableDataSource(this.totalJob);
//         if (this.myJob.length > 0) {
//           this.myjobsdata = false;
//         }
//         setTimeout(() => {
//           this.spinner.hide();
//         }, 2000);
//       }
//       else {
//         this.myjobsdataloader = false;
//         setTimeout(() => {
//           this.spinner.hide();
//         }, 2000);
//       }

//     }, (error) => {
//       this.router.navigate(["/404"]);
//       this.spinner.hide();
//     })
//     this.subscriptions.push(subscription);
//   }

//   //*****************client data***************************** */
//   getActiveClientDetailsByOrgId() {
//     // this.spinner.show();
//     let OrgId = localStorage.getItem("OrgId");
//     let role = localStorage.getItem("Role");
//     this.settingsService.getActiveClientDetailsByOrgId(OrgId).subscribe(data => {
//       if (data.map.statusMessage == "Success") {
//         let response: any[] = JSON.parse(data.map.data);
//         // console.log(response);
//         this.clientcount = response.length;
//       }

//     }, (error) => {
//       this.router.navigate(["/404"]);
//       this.spinner.hide();
//     })
//   }

//   getProjectDetails() {
//     this.spinner.show();
//     let client_details = [];
//     let orgId = localStorage.getItem("OrgId");
//     let myId = localStorage.getItem("Id");
//     let role = localStorage.getItem("Role");
//     let subscription= this.projectsService.getActiveProjectDetailsByOrgId(orgId).subscribe(data => {
//       if (data.map.statusMessage == "Success") {
//         let response: any[] = JSON.parse(data.map.data);
//         // console.log(response);
//         let projectlist = [];
//         let projectmylist = [];
//         for (var i = 0; i < response.length; i++) {
//           for (var j = 0; j < response[i].resourceDetails.length; j++) {
//             if (response[i].resourceDetails[j].employeeDetails.id == myId && role != "org_admin") {
//               client_details.push(response[i].clientDetails.id)
//             }
//             if (!projectmylist.includes(response[i].id) && response[i].resourceDetails[j].employeeDetails.id == myId) {
//               projectmylist.push(response[i].id);
//             }
//           }
//           //for get all project count
//           if (!projectlist.includes(response[i].id)) {
//             projectlist.push(response[i].id);
//           }
//         }
//         if (role == "org_admin") {
//           this.projectcount = projectlist.length;
//           this.getActiveClientDetailsByOrgId();
//           this.projectcount1 = projectmylist.length;
//           // if ((this.projectcount | this.clientcount) == 0) {
//           //   this.projectcount = 0;
//           //   this.clientcount = 0;
//           // }
//         } else {
//           this.projectcount = projectmylist.length;
//         }
//         // console.log(client_details)
//         client_details = client_details.reduce((accumalator, current) => {
//           if (
//             !accumalator.some(
//               (item) => item === current
//             )
//           ) {
//             accumalator.push(current);
//           }
//           return accumalator;
//         }, []);
//         // console.log(client_details)
//       }
//       else {

//       }
//       if (role != "org_admin") {
//         this.clientcount = client_details.length;
//       }
//       else if (role = "org_admin") {
//         this.clientcount1 = client_details.length;
//       }
//     })
//     this.subscriptions.push(subscription);
//     this.spinner.hide();
//   }
//   // for my leaves 
//   LeaveTypeByOrgIdAndDates() {
//     this.LeaveTypeArr = [];
//     let zone = moment.tz.guess();
//     this.spinner.show();
//     let data: Object = {
//       "org_id": localStorage.getItem("OrgId"),
//       "start_date": this.startOfYear,
//       "end_date": this.endOfYear,
//       "timezone": zone,
//     }

//     let subscription = this.settingsService.getActiveLeaveTypeByOrgIdAndDates(data).subscribe(async data => {
//       this.myleavedataloader = true;
//       if (data.map.statusMessage == "Success") {
//         let response = JSON.parse(data.map.data);
//         this.newLeaveTypeDetails = response;
//         for (var i = 0; i < this.newLeaveTypeDetails.length; i++) {
//           this.LeaveTypeArr.push(this.newLeaveTypeDetails[i].id);
//           if (this.newLeaveTypeDetails[i].image != undefined) {
//             let stringArray = new Uint8Array(this.newLeaveTypeDetails[i].image);
//             const STRING_CHAR = stringArray.reduce((data, byte) => {
//               return data + String.fromCharCode(byte);
//             }, '');
//             let base64String = btoa(STRING_CHAR);
//             this.image_url = this.domSanitizer.bypassSecurityTrustUrl("data:image/jpeg;base64," + base64String);
//             this.newLeaveTypeDetails[i].image = this.image_url;
//           }
//         }
//         this.myleavedataloader = false;
//         if (this.newLeaveTypeDetails.length > 0) {
//           this.myleavesdata = true;
//         }
//         this.getapprovedLeaveCountsByEmpIdAndLTId();
//       }
//     })
//     this.subscriptions.push(subscription);
//   }
//   tempData: any;
//   getapprovedLeaveCountsByEmpIdAndLTId() {
//     this.spinner.show();
//     // console.log("this.LeaveTypeArr");
//     // console.log(this.LeaveTypeArr);
//     // console.log("2 -->" + this.LeaveTypeArr);
//     for (let i = 0; i < this.LeaveTypeArr.length; i++) {
//       let data: Object = {
//         "org_id": localStorage.getItem("OrgId"),
//         "emp_id": localStorage.getItem("Id"),
//         "leave_type_id": this.LeaveTypeArr[i]
//       }
//       this.approvedLeaveDetailsService.getActiveleaveByEmpIdAndYearByOrgid(data).subscribe(async data => {
//         if (data.map.statusMessage == "Success") {
//           let response = JSON.parse(data.map.data);
//           this.tempData = response;
//           this.approvedCounts.push({ "id": this.LeaveTypeArr[i], "count": this.tempData });
//           this.getActiveLeaveTypeByOrgIdAndDates();
//         }
//         this.spinner.hide();
//       })
//     }
//   }
//   getActiveLeaveTypeByOrgIdAndDates() {
//     // console.log("3 -->" + this.newLeaveTypeDetails);
//     for (let x = 0; x < this.newLeaveTypeDetails.length; x++) {
//       for (let y = 0; y < this.approvedCounts.length; y++) {
//         if (this.newLeaveTypeDetails[x].id == this.approvedCounts[y].id) {
//           this.newLeaveTypeDetails[x].counts = this.approvedCounts[y].count;
//         }
//       }
//       // console.log(this.newLeaveTypeDetails);

//     }
//   }
//   // for upcoming holiday
//   getHolidaysByOrgId() {
//     let zone = moment.tz.guess();
//     let data: Object = {
//       "org_id": localStorage.getItem("OrgId"),
//       "start_date": moment(this.todaydate).format("YYYY-MM-DD"),
//       "end_date": moment(this.endOfYear).format("YYYY-MM-DD"),
//       "timezone": zone,
//     }
//     let subscription = this.settingsService.getActiveHolidayByOrgIdAndDates(data).subscribe(data => {
//       if (data.map.statusMessage == "Success") {
//         let response = JSON.parse(data.map.data);
//         this.upcomingholidaysloader = true;
//         this.holidayDetails = response;
//         for (let i = 0; i < this.holidayDetails.length; i++) {
//           if (this.holidayDetails[i].leave_date_str == this.tommorrow) {
//             this.holidayDetails[i].leave_date_str = "Tommorrow";
//           }
//         }
//         this.upcomingholidaysloader = false;
//         this.dataSource_up = new MatTableDataSource(response);
//         if (response.length > 0) {
//           this.holiday = false;
//         }
//       }
//     })
//     this.subscriptions.push(subscription);
//   }

//   // Today leaves details
//   TodayData: any = [];
//   TodayLeaves() {
//     this.spinner.show();
//     let todaydate = moment().format("DD-MM-YYYY");
//     let zone = moment.tz.guess();
//     let data: Object = {
//       "org_id": localStorage.getItem("OrgId"),
//       "start_date": moment().startOf('day').toDate(),
//       "timezone": zone,
//     }
//     let subscription = this.leavetrackerService.getTodayLeavesByOrgid(data).subscribe(data => {
//       if (data.map.statusMessage == "Success") {
//         let response: any[] = JSON.parse(data.map.data);
//         for (var i = 0; i < response.length; i++) {
//           if (response[i].emp_img != undefined) {
//             let stringArray = new Uint8Array(response[i].emp_img);
//             const STRING_CHAR = stringArray.reduce((data, byte) => {
//               return data + String.fromCharCode(byte);
//             }, '');
//             let base64String = btoa(STRING_CHAR);
//             response[i].emp_img = this.domSanitizer.bypassSecurityTrustUrl("data:image/jpeg;base64," + base64String);
//           }
//           else {
//             response[i].emp_img = "assets/images/profile.png";
//           }
//         }
//         this.todayleavesloader = true;
//         this.Today_leaves = response;
//         this.dataSourceleave = new MatTableDataSource(response.reverse());
//         this.todayleavesloader = false;
//         if (response.length > 0) {
//           this.leaveontoday = false;
//         }
//         // for to show half day or full day in dashboard today leave section
//         let tempDate = moment().format('YYYY-MM-DD');
//         for (let i=0; i < response.length; i++) {
//           this.TodayData = JSON.parse((response[i]).half_full_day);
//           for (let j = 0; j < this.TodayData.length; j++) {
//             if (tempDate == this.TodayData[j].date) {
//               response[i].half_full_day = this.TodayData[j].full_half;
//             }
//           }
//         }
//       }
//     }, (error) => {
//       this.router.navigate(["/404"]);
//       this.spinner.hide();
//     })
//     this.subscriptions.push(subscription);
//   }

//   // ? ************************** get slack details ************************ //
//   getslackDetails() {
//     this.spinner.show();
//     let data: Object = {
//       "org_id": localStorage.getItem("OrgId"),
//       "module_name": "attendance",
//       "reason": "check-in",
//       "app_name": "slack"
//     }
//     let subscription = this.attendanceService.getslackDetails(data).subscribe(data => {
//       if (data.map.statusMessage == "Success") {
//         let response = JSON.parse(data.map.data);
//         this.slackIntegrationDetails = response;
//       } else if (data.map.statusMessage == "Error") {
//       }
//       this.spinner.hide();
//     })
//     this.subscriptions.push(subscription);
//   }

//   // ? ************************** get employee information ************************************************//
//   getEmpDetailsById(id) {
//     let subscription = this.settingsService.getActiveEmpDetailsById(id).subscribe(data => {
//       this.ReporterLoader= false;
//       if (data.map.statusMessage == "Success") {
//         let response = JSON.parse(data.map.data);
//         if(response.reporterDetails){
//           this.Detail = response.reporterDetails.firstname;
//         }

//         this.ReporterLoader=true;
//         this.profilename = response.firstname + " " + response.lastname;
//         if (response.profile_image != undefined) {
//           let stringArray = new Uint8Array(response.profile_image);
//           const STRING_CHAR = stringArray.reduce((data, byte) => {
//             return data + String.fromCharCode(byte);
//           }, '');
//           let base64String = btoa(STRING_CHAR);
//           // this.profileurl = this.domSanitizer.bypassSecurityTrustUrl("data:image/jpeg;base64," + base64String);
//           // this.profileurl =  base64String;
//           this.profileurl = "https://uat.tcube.io/assets/images/profile.png";

//         } else {
//           this.profileurl = "https://uat.tcube.io/assets/images/profile.png";
//         }
//       }
//     })
//     this.subscriptions.push(subscription);
//   }

//   millisToMinutesAndSeconds(ms) {
//     var minutes: any = Math.floor((ms / (1000 * 60)) % 60);
//     var hours: any = Math.floor((ms / (1000 * 60 * 60)) % 24);
//     // hours = (hours < 10) ? + 0 + hours : hours;
//     minutes = (minutes < 10) ? "0" + minutes : minutes;
//     var days: any = Math.floor((ms / (1000 * 60 * 60 * 24)));
//     if (days > 0) {
//       hours = (days * 24) + hours;
//     }
//     let str: string = hours + "." + minutes;
//     let tempHrs: Number = parseFloat(str);
//     return tempHrs;
//   }

//   //get Whatsapp details
//   getWhatsappDetails() {
//     this.spinner.show();
//     let data: Object = {
//       "org_id": localStorage.getItem("OrgId"),
//       "module_name": "attendance",
//       "reason": "check-in",
//       "app_name": "whatsapp"
//     }
//     let subscription = this.attendanceService.getslackDetails(data).subscribe(data => {
//       if (data.map.statusMessage == "Success") {
//         let response = JSON.parse(data.map.data);
//         this.whatsappIntegrationDetails = response;
//       } else if (data.map.statusMessage == "Error") {
//       }
//       this.spinner.hide();
//     })
//     this.subscriptions.push(subscription);
//   }

// }

export interface PeriodicElement {
  name: string;
  image: string;

}

// const ELEMENT_DATA: PeriodicElement[] = [
//   { image: '../../assets/images/dot.png', name: 'Explore angular material for developing dashboard' },
//   { image: '../../assets/images/dot.png', name: 'T-cubr: Dashboard design and developement' },
//   { image: '../../assets/images/dot.png', name: 'Wire framing today tasks section' },
//   { image: '../../assets/images/dot.png', name: 'Explore about Angular material and its components.' },
//   { image: '../../assets/images/dot.png', name: 'Remove Unwanted sections from landing page.' },
//   { image: '../../assets/images/dot.png', name: ' Components Navigation in landing page.' },
//   { image: '../../assets/images/dot.png', name: 'how to find an already purchased customer in shopify website' },
//   { image: '../../assets/images/dot.png', name: 'Collecting images from Ref sites and split into separate folders upload into akrti folder' },
//   { image: '../../assets/images/dot.png', name: ' Creating Graphic Material for banner' },
//   { image: '../../assets/images/dot.png', name: 'work on screen mock up for day planner' },
//   { image: '../../assets/images/dot.png', name: 'Sync up with team' },
//   { image: '../../assets/images/dot.png', name: ' Create  api for Batch Details' },
//   { image: '../../assets/images/dot.png', name: 'Aluminum' },
//   { image: '../../assets/images/dot.png', name: 'Silicon' },
//   { image: '../../assets/images/dot.png', name: 'Phosphorus' },
//   { image: '../../assets/images/dot.png', name: 'Sulfur' },
//   { image: '../../assets/images/dot.png', name: 'Chlorine' },
//   { image: '../../assets/images/dot.png', name: 'Argon' },
//   { image: '../../assets/images/dot.png', name: 'Potassium' },
//   { image: '../../assets/images/dot.png', name: 'Calcium' },
// ];
