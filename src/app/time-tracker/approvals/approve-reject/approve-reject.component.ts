import { Component, HostListener, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
// import * as moment from 'moment';
import moment from 'moment-timezone';
import { NgxSpinnerService } from 'ngx-spinner';
import { ExportService } from 'src/app/services/export.service';
import { NotificationService } from 'src/app/services/notification.service';
import { TimeTrackerService } from 'src/app/services/time-tracker.service';
import { UtilService } from 'src/app/services/util.service';
import { DatePipe } from '@angular/common';
import { TimesheetService } from 'src/app/services/timesheet.service';
import { AttendanceServiceService } from 'src/app/services/attendance-service.service';

@Component({
  selector: 'app-approve-reject',
  templateUrl: './approve-reject.component.html',
  styleUrls: ['./approve-reject.component.less']
})
export class ApproveRejectComponent implements OnInit {

  isRefereshing = false;
  approveClicked: Boolean = false;
  rejectClicked: Boolean = false;
  statusApprove: boolean = false;
  statusReject: boolean = false;
  imgAvailable: boolean = false;
  loginurl: string;
  modifiedstring: any[];
  timesheetsstr: string;
  timesheets_str: any[];
  emp_mail: any;
  orgAdminId: any;

  constructor(
    private formBuilder: UntypedFormBuilder,
    private datePipe: DatePipe,
    private utilsService: UtilService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private spinner: NgxSpinnerService,
    public timeTrackerService: TimeTrackerService,
    private notificationService: NotificationService,
    private exportservice: ExportService,
    private domSanitizer: DomSanitizer,
    private timesheetService: TimesheetService,
    private attendanceService :AttendanceServiceService,
  ) {
    this.loginurl = window.location.href;
    this.modifiedstring = this.loginurl.split("#", 2)
    this.timesheetsstr = "#/timesheets";
    this.timesheets_str = this.modifiedstring[0].concat(this.timesheetsstr.toString());
    this.getScreenSize();
  }
  empId: any;
  dateOfRequest: any;
  Emp_id_loggedin: any;
  Emp_name: any;
  Org_id: any;
  tSheetStatus: any;
  tSheetId: any;
  requestedDate: any;
  comments: any;
  dataOfTimesheet: any;
  screenWidth: number = 1200;
  customMinWidth: number = 1365;
  customMaxWidth: number = 1850;
  isCustomWidhthBottombtn: boolean = false;
  isDataGetted: boolean = false;
  @HostListener('window:resize', ['$event'])
  getScreenSize() {
    this.screenWidth = window.innerWidth;
    if (this.screenWidth >= this.customMinWidth && this.screenWidth <= this.customMaxWidth) {
      this.isCustomWidhthBottombtn = true;
    }
    else {
      this.isCustomWidhthBottombtn = false;
    }
  }
  async ngOnInit() {
    this.empId = this.activatedRoute.snapshot.params.id;
    this.Emp_id_loggedin = localStorage.getItem('Id');
    this.Emp_name = localStorage.getItem('Name');
    this.Org_id = localStorage.getItem('OrgId');

    this.dateOfRequest = await sessionStorage.getItem('dateOfRequest');
    this.tSheetId = await sessionStorage.getItem('tSheetId');
    await this.getTasksByEmpidAndDate();
    await this.getTimesheet();

    // const channel = new BroadcastChannel('tcubeApprovals');
    // let tempData = sessionStorage.getItem("isApprovals");
    // if (tempData == "true") {
    //   this.dateOfRequest = sessionStorage.getItem('dateOfRequest');
    //   this.tSheetId = sessionStorage.getItem('tSheetId');
    //   this.getTimesheet();
    //   this.getTasksByEmpidAndDate();
    // } else {
    //   channel.onmessage = (event) => {
    //     this.dataOfTimesheet = event.data;
    //     this.dateOfRequest = this.dataOfTimesheet.dateOfRequest;
    //     this.tSheetId = this.dataOfTimesheet.tSheetId;
    //     this.getTimesheet();
    //     this.getTasksByEmpidAndDate();
    //     sessionStorage.setItem("isApprovals", "true");
    //     sessionStorage.setItem('dateOfRequest', this.dateOfRequest);
    //     sessionStorage.setItem('tSheetId', this.tSheetId);
    //   };
    // }
  }

  backToApprovals() {
    sessionStorage.removeItem('dateOfRequest');
    sessionStorage.removeItem('tSheetId');
    // sessionStorage.removeItem('isApprovals');
  }

  commentsFormGroup: UntypedFormGroup = this.formBuilder.group({
    comments: [''],
  })

  displayedColumns: string[] = ['task', 'project', 'bill', 'fromToTime', 'hours'];
  // displayedColumns: string[] = ['position', 'name', 'weight', 'symbol'];
  dataSource = new MatTableDataSource();

  arraydata: any[];
  total_task_duration: any;
  no_data: any[];
  task_time: any;
  billable_time: any;
  non_billable_time: any;
  emp_name: any;
  emp_designation: any;
  // emp_mail: any;
  projects: any;
  newData: any[] = [];
  timeIntervals: any[] = [];
  tempData: any[] = [];
  approveTasksIds: any[] = [];
  // Loggedhours: any[] = [];
  approveEmpId: any;
  approveDateOfRequest: any;
  url: any = "";

  // get method for task details
  getTasksByEmpidAndDate() {
    return new Promise<void>((resolve, reject) => {
      this.spinner.show();
      let formdata = {
        "emp_id": this.empId,
        "date_of_request": this.dateOfRequest,
        "timesheet_id": this.tSheetId
      }
      const response = this.timeTrackerService.getsubmittedbyempidanddate(formdata).subscribe(data => {
        this.arraydata = [];
        // for profile image
        if (data.map.profile_img != undefined) {
          this.imgAvailable = true;
          let stringArray = new Uint8Array(data.map.profile_img);
          const STRING_CHAR = stringArray.reduce((data, byte) => {
            return data + String.fromCharCode(byte);
          }, '');
          let base64String = btoa(STRING_CHAR);
          this.url = this.domSanitizer.bypassSecurityTrustUrl("data:image/jpeg;base64," + base64String);

        } else this.imgAvailable = false;

        // for billable and non billable hours
        var total_time = data.map.total_time;
        var billable_total_time = data.map.billable_total_time;
        var non_billable = data.map.non_billable_total_time;
        this.emp_name = data.map.emp_name;
        this.emp_designation = data.map.emp_designation;
        this.emp_mail = data.map.emp_email;
        if (data.map.projects != undefined) {
          this.projects = data.map.projects.myArrayList;
        }
        this.millisToMinutesAndSeconds(total_time);
        this.total_task_duration = this.task_time;
        this.millisToMinutesAndSeconds(billable_total_time);
        this.billable_time = this.task_time;
        this.millisToMinutesAndSeconds(non_billable);
        this.non_billable_time = this.task_time;
        if (data.map.statusMessage == "Success") {
          let data1 = JSON.parse(data.map.details);
          this.orgAdminId = data1[0].orgDetails.emp_id; // to send notification if mail is invalid or expired
         if (data1.length > 0) {
            this.approveEmpId = data1[0].emp_id;
            this.approveDateOfRequest = data1[0].date_of_request;
            for (var i = 0; i < data1.length; i++) {
              if (data1[i].approval_status == "Submitted") {
                this.approveTasksIds.push(data1[i].id);
                // this.Loggedhours.push(data1[i].task_duration);
              }
              this.arraydata.push(data1[i]);
              /// * * * * * * If the task is quick add task so we need to push string 
              if (data1[i].time_interval) {
                var timeInterval = JSON.parse(data1[i].time_interval);
                this.newData.push(timeInterval);
              } else {
                var timeInterval1 = ["null"];
                this.newData.push(timeInterval1);
              }
            }
            /// * * * * * * this for From- To time gerating array
            for (let i = 0; i < this.newData.length; i++) {
              /// * * * * * * If the arrxxx[i] is equal to null it push "-" or otherwise go to else
              if (this.newData[i] == "null") {
                this.tempData = [];
                this.tempData.push("-");
                this.timeIntervals.push(this.tempData);
              } else {
                this.tempData = [];
                var newData1 = this.newData[i];
                for (let j = 0; j < newData1.length; j++) {
                  var stTime = moment(newData1[j].start_time).format('hh:mm A');
                  var etTime = moment(newData1[j].end_time).format('hh:mm A');
                  this.tempData.push({ stTime, etTime });
                }
                this.timeIntervals.push(this.tempData.reverse());
              }
            }
            this.dataSource = new MatTableDataSource(this.arraydata);
            this.no_data = this.arraydata;
          }
          else if (data1.length == 0) {
            this.total_task_duration = '00:00:00';
            this.billable_time = '00:00:00';
            this.non_billable_time = '00:00:00';
            this.dataSource = new MatTableDataSource();
            this.no_data = [];
          }
          this.dataSource = new MatTableDataSource(this.arraydata);
          this.no_data = this.arraydata;
        }
        else {
          if (data.map.statusMessage == "Failed") {
            this.dataSource = new MatTableDataSource();
            this.total_task_duration = '00:00:00';
            this.billable_time = '00:00:00';
            this.non_billable_time = '00:00:00';
          }
        }
        resolve();
        setTimeout(() => {
          this.spinner.hide();
        }, 1000);
      }, (error) => {
        reject(error);
        this.router.navigate(["/404"]);
        this.spinner.hide();
      })
    });
  }

  getTimesheet() {
    return new Promise<void>((resolve, reject) => {
      this.spinner.show();
      this.isDataGetted = false;
      this.timesheetService.getTimesheetById(this.tSheetId).subscribe(data => {
        if (data.map.statusMessage == "Success") {
          let res = JSON.parse(data.map.data);
          if (res.approval_status == "Submitted") {
            this.tSheetStatus = "Pending";
          } else {
            this.tSheetStatus = res.approval_status;
          }
          this.dateOfRequest = res.date_of_request;
          this.comments = res.approval_comments;
          if (this.comments == " " || this.comments == null) {
            this.comments = "No comments";
          }
          this.requestedDate = moment(new Date(res.date_of_request)).format("DD-MM-YYYY");
        }
        resolve();
        this.isDataGetted = true;
        this.getActiveHours();
        this.spinner.hide();
      }, (error) => {
        reject(error);
        this.spinner.hide();
        this.isDataGetted = true;
      })
    });
  }

  millisToMinutesAndSeconds(ms) {
    //  this.task_time = '00:00:00';
    var seconds: any = Math.floor((ms / 1000) % 60);
    var minutes: any = Math.floor((ms / (1000 * 60)) % 60);
    var hours: any = Math.floor((ms / (1000 * 60 * 60)) % 24);

    hours = (hours < 10) ? "0" + hours : hours;
    minutes = (minutes < 10) ? "0" + minutes : minutes;
    seconds = (seconds < 10) ? "0" + seconds : seconds;
    this.task_time = hours + ":" + minutes + ":" + seconds;
  }

  approveTimeLogs() {
    this.statusApprove = true;
    // if(data == "approve")
    this.approveClicked = true;
    // else this.rejectClicked = true;
    this.commentsFormGroup = this.formBuilder.group({
      comments: [''],
    })
  }

  rejectTimeLogs() {
    this.statusApprove = false;
    this.statusReject = true;
    // this.approveClicked = true;
    this.rejectClicked = true;
    this.commentsFormGroup = this.formBuilder.group({
      comments: ['', Validators.required],
    })
  }

  back() {
    this.approveClicked = false;
    this.rejectClicked = false;
  }

  /// * * * * * * approve or reject the timelogs
  status: any;
  confirmTimeLogs() {
    this.spinner.show();
    if (this.statusApprove) {
      this.status = "Approved";
    } else {
      this.status = "Rejected";
    }
    let formdata = {
      "Ids": this.approveTasksIds,
      "emp_id": this.approveEmpId,
      "date_of_request": this.approveDateOfRequest,
      "status": this.status,
      "approval_comments": this.commentsFormGroup.value.comments,
      "timesheet_id": this.tSheetId,
      "timesheets_url": this.timesheets_str,
      "org_id": localStorage.getItem('OrgId')

      // "logged_hours":this.Loggedhours
    }
    this.timeTrackerService.updateApprovalStatus(formdata).subscribe(data => {
      if (this.statusApprove) {
        if (data.map.statusMessage == "Success" && data.map.Error == "Error in approving timesheet due to mail configuration check the configuration details ") {
          this.notification();
          this.notificationWithEmailMsg(this.approveEmpId);
          this.utilsService.openSnackBarAC("Timelogs approved successfully", "OK");
          setTimeout(() => {
            this.router.navigate(["/approvals"]);
          }, 1500);
        } else if (data.map.statusMessage == "Success") {
          this.notification();
          this.utilsService.openSnackBarAC("Timelogs approved successfully", "OK");
          setTimeout(() => {
            this.router.navigate(["/approvals"]);
          }, 1500);
        }
        else {
          this.utilsService.openSnackBarMC(data.map.data, "OK");
        }
      } 
      else {
        if(data.map.statusMessage == "Success" && data.map.Error == "Error in rejecting timesheet due to mail configuration check the configuration details") {
          this.notification();
          this.notificationWithEmailMsg(this.approveEmpId);
          this.utilsService.openSnackBarAC("Timelogs rejected successfully", "OK");
          setTimeout(() => {
            this.router.navigate(["/approvals"]);
          }, 1500);
        } else if (data.map.statusMessage == "Success") {
          this.notification();
          this.utilsService.openSnackBarAC("Timelogs rejected successfully", "OK");
          setTimeout(() => {
            this.router.navigate(["/approvals"]);
          }, 1500);
        }
        else {
          this.utilsService.openSnackBarMC(data.map.data, "OK");
        }
      }
      sessionStorage.removeItem('dateOfRequest');
      sessionStorage.removeItem('tSheetId');
      // sessionStorage.removeItem('isApprovals');
      this.spinner.hide();
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
    })
  }
  async notificationWithEmailMsg(empid) {
    this.spinner.show();
    let notify_id;
    let zone = moment.tz.guess();
    let message =
      "Mail configuration issue encountered while  "+ this.status+" "+empid+"  timesheet.";
    let formdata = {
      org_id: localStorage.getItem("OrgId"),
      message: message,
      to_notify_id:this.orgAdminId,
      notifier: empid ,
      keyword: "mail-issue",
      timezone: zone,
    };
    await this.notificationService
      .postNotification(formdata)
      .subscribe((data) => {
        if (data.map.statusMessage == "Success") {
          this.spinner.hide();
        } else {
          this.spinner.hide();
        }
      });
  }
  /// * * * * * * Export functions
  export_data: any = [];
  exportAsXLSX(): void {
    this.export_data = [];
    for (var i = 0; i < this.arraydata.length; i++) {
      this.export_data.push({ "Employee_Id": this.arraydata[i].emp_id, "Date": this.arraydata[i].date_of_request, "Project": this.arraydata[i].project, "Job": this.arraydata[i].job, "Task": this.arraydata[i].task, "Duration": this.arraydata[i].task_duration, "Billing Status": this.arraydata[i].bill })
    }
    this.exportservice.exportAsExcelFile(this.export_data, this.emp_name + '_Timelog_data', "xlsx");
  }
  exportAsXLS() {
    this.export_data = [];
    for (var i = 0; i < this.arraydata.length; i++) {
      this.export_data.push({ "Employee_Id": this.arraydata[i].emp_id, "Date": this.arraydata[i].date_of_request, "Project": this.arraydata[i].project, "Job": this.arraydata[i].job, "Task": this.arraydata[i].task, "Duration": this.arraydata[i].task_duration, "Billing Status": this.arraydata[i].bill })
    }
    this.exportservice.exportAsExcelFile(this.export_data, this.emp_name + '_Timelog_data', "xls");
  }
  exportAsCSV() {
    this.export_data = [];
    for (var i = 0; i < this.arraydata.length; i++) {
      this.export_data.push({ "Employee_Id": this.arraydata[i].emp_id, "Date": this.arraydata[i].date_of_request, "Project": this.arraydata[i].project, "Job": this.arraydata[i].job, "Task": this.arraydata[i].task, "Duration": this.arraydata[i].task_duration, "Billing Status": this.arraydata[i].bill })
    }
    this.exportservice.exportAsExcelFile(this.export_data, this.emp_name + '_Timelog_data', "csv");
  }

  /// * * * * * * Create method for notification
  /// * * * * * * create the notification for raquest raised user
  myDate = new Date();
  notification() {
    let zone = moment.tz.guess();
    let message;
    if (this.status === "Approved") {
      message = this.Emp_name + " has approved your request."
    }
    if (this.status === "Rejected") {
      message = this.Emp_name + " has Rejected your request."
    }
    let formdata = {

      "org_id": this.Org_id,
      "message": message,
      "to_notify_id": this.empId,
      "notifier": this.Emp_id_loggedin,
      "module_name": "Time-Tracker",
      "sub_module_name": "My-Timesheets",
      "approval_comments": this.commentsFormGroup.value.comments,
      "timezone": zone,
      "approval_status": this.status,
      "date_of_request": this.approveDateOfRequest,

    }
    this.notificationService.postNotification(formdata).subscribe(data => {
      if (data.map.statusMessage == "Success") {
      }
      else {
      }
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
    })
  }
  getStatusClass() {
    if (this.tSheetStatus == "Approved") {
      return "active-btn";
    } else if (this.tSheetStatus == "Rejected") {
      return "pending-btn";
    }
  }
  // Approve button margin style for while sidenav expansion is true
  SideNavMaximized: any = false;
  getMarginBottomStyle() {
    // return sessionStorage.getItem('sideNavMaximized') == 'true' ? { 'margin-left': '15rem' } : { 'margin-left': '25rem' };
  }

  //Get Active hours of the active 
  activeHours: any;
  getActiveHours() {
    this.activeHours = '00:00:00';
    this.attendanceService.getactiondatereportdata(this.requestedDate, this.emp_mail).subscribe(data => {
      // console.log(data);
      if (data.map.statusMessage == "Success") {
        this.activeHours = data.map.ActiveHours;
      }
      else {
        this.activeHours = '00:00:00';
      }
    })
  }


}

// export interface
export interface data {
  emp_id: any;
  date_of_request: any;
  time_interval: string;
  is_active: boolean;
  id: number;
  task: string;
  job: string;
  project: string;
  bill: string;
  task_duration: string;
  approval_status: string;
  task_duration_ms: number;
}

// export interface PeriodicElement {
//   task: string;
//   project: string;
//   job: string;
//   task_duration: string;
//   bill: string;
// }

// const ELEMENT_DATA: PeriodicElement[] = [
//   { project: 'Tcube', task: 'In projects and jobs form fields remove required field to not required for project cost description and hours', job: 'Design', task_duration: '05:10', bill: 'Billable' },
//   { project: 'Silm', task: 'To check and add loader for update jobs form', job: 'Design', task_duration: '02:10', bill: 'Billable' },
//   { project: 'Silm', task: 'To design and integrate in projects, click project name to view all details', job: 'Development', task_duration: '01:10', bill: 'Non Billable' },
//   { project: 'Silm', task: 'To check and add loader for update jobs form', job: 'Others', task_duration: '01:10', bill: 'Non Billable' },
//   { project: 'Tcube', task: 'In projects and jobs form fields remove required field to not required for project cost description and hours', job: 'Design', task_duration: '01:10', bill: 'Billable' },
//   { project: 'Silm', task: 'To check and add loader for update jobs form', job: 'Others', task_duration: '00:10', bill: 'Billable' },
//   { project: 'Tcube', task: 'In projects and jobs form fields remove required field to not required for project cost description and hours', job: 'Design', task_duration: '00:20', bill: 'Billable' },

// ];