import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSelect } from '@angular/material/select';
import { Router } from '@angular/router';
import moment from 'moment-timezone';
import { NgxSpinnerService } from 'ngx-spinner';
import { ReplaySubject, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { NotificationService } from 'src/app/services/notification.service';
import { SettingsService } from 'src/app/services/settings.service';
import { TimeTrackerService } from 'src/app/services/time-tracker.service';
import { UtilService } from 'src/app/services/util.service';
import { errorMessage } from '../../util/constants';
@Component({
  selector: 'app-timelog-submit',
  templateUrl: './timelog-submit.component.html',
  styleUrls: ['./timelog-submit.component.less']
})
export class TimelogSubmitComponent implements OnInit {
  requiredMessage = errorMessage;
  approverform: UntypedFormGroup;
  Org_id: any;
  Emp_id: any;
  Emp_name: any;
  protected approver: any[] = [];
  timesheetDetails: any;
  loginurl: string;
  modifiedstring: string;
  approvalsstr: string;
  approvals_str: string;
  public approverFilterCtrl: UntypedFormControl = new UntypedFormControl();

  /** list of approver filtered by search keyword */
  public filteredapprover: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);
  @ViewChild('singleSelect', { static: true }) singleSelect: MatSelect;
  /** Subject that emits when the component has been destroyed. */
  protected _onDestroy = new Subject<void>();
  dateOfRequest: any;
  constructor(
    public dialogRef: MatDialogRef<TimelogSubmitComponent>,
    @Inject(MAT_DIALOG_DATA) public data,
    public timeTrackerService: TimeTrackerService,
    private formBuilder: UntypedFormBuilder,
    private utilsService: UtilService,
    private spinner: NgxSpinnerService,
    private router: Router,
    private notificationService: NotificationService,
    private settingsService: SettingsService,) {
    this.loginurl = window.location.href;
    this.modifiedstring = this.loginurl.slice(0, this.loginurl.length - 12);
    this.approvalsstr = "approvals";
    this.approvals_str = this.modifiedstring.concat(this.approvalsstr.toString());
    
  }
  list: any[];
  billable: any;
  nonBillable: any;
  totalTimeMs: any;
  totalTimeStr: any;
  approveList: any;
  accessList: any;
  approversortlist: any = [];
  header:string;
  submit:boolean = false;
  resubmit:boolean = false;
  ngOnInit() {
    let nameDetails = [];
    let sortlist = [];
    if(this.data.header == "timelog_submit"){
      this.submit = true;
      this.resubmit = false;
      this.list = this.data.ids;
      this.billable = this.data.billable;
      this.nonBillable = this.data.nonBilliable;
      this.totalTimeMs = this.data.totalTimeMs;
      this.totalTimeStr = this.data.totalTimeStr;
      this.approversortlist = this.data.approver_list;
      this.dateOfRequest = this.data.date_of_request;
      this.approver = this.data.approver_list;
      this.Emp_id = localStorage.getItem('Id');
      this.Emp_name = localStorage.getItem('Name');
      this.Org_id = localStorage.getItem('OrgId');
      this.approverform = this.formBuilder.group({
        approver: ['', Validators.required],
      });
      // load the initial project list
      this.filteredapprover.next(this.approver.slice());
  
      // listen for search field value changes
      this.approverFilterCtrl.valueChanges
        .pipe(takeUntil(this._onDestroy))
        .subscribe(() => {
          this.filterapprover();
        });
      setTimeout(() => {
        this.setapprover();
      }, 20);
    }else if(this.data.header == "timelog_resubmit"){
      this.resubmit = true;
      this.submit = false;
    }
  }

  setapprover() {
    // this.approver = [];
    // this.approver = this.data.approver_list;
    if (this.approver.length == 0) {
      this.geEmployeeDetailsByOrgId();
    }
    this.filterapprover();
  }
  geEmployeeDetailsByOrgId() {
    this.spinner.show();
    this.approver = [];
    let employeelist = []
    this.approver = this.approversortlist;
    this.filterapprover();
    setTimeout(() => {
      this.spinner.hide();
    }, 500);
  }

  protected filterapprover() {
    if (!this.approverFilterCtrl) {
      return;
    }
    // get the search keyword
    let search = this.approverFilterCtrl.value;
    if (!search) {
      this.filteredapprover.next(this.approver.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
    // filter the client
    this.filteredapprover.next(
      this.approver.filter(approver => approver.name.toLowerCase().indexOf(search) > -1)
    );
  }
  submit_timelog() {
    this.spinner.show();
    let formdata = {
      "approver_id": this.approverform.value.approver,
      "Ids": this.list,
      "status": "Submitted",
      "billable_time": this.billable,
      "nonBillable_time": this.nonBillable,
      "total_time_ms": this.totalTimeMs,
      "total_time": this.totalTimeStr,
      "approvals_url":this.approvals_str,
    }
    this.timeTrackerService.updateReporterandtaskstatus(formdata).subscribe(data => {
      if (data.map.statusMessage == "Success" && data.map.Error == "Error in creating leave details due to mail configuration check the configuration details") {
        this.timesheetDetails = data.map.data;
        this.notification();
        this.notificationWithEmailMsg();
        this.utilsService.openSnackBarAC("Timesheet submitted successfully", "OK");
        this.dialogRef.close();
      } else if(data.map.statusMessage == "Success"){
        this.timesheetDetails = data.map.data;
        this.notification();
        this.utilsService.openSnackBarAC("Timesheet submitted successfully", "OK");
        this.dialogRef.close();
      }
      else {
        this.utilsService.openSnackBarMC(data.map.data, "OK");
      }
      this.spinner.hide();
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
      this.dialogRef.close();
    })
  }

  notification() {
    let zone = moment.tz.guess();
    let message = this.Emp_name + " submitted timesheet and waiting for your approval."
    let formdata = {
      "org_id": this.Org_id,
      "message": message,
      "to_notify_id": this.approverform.value.approver,
      "notifier": this.Emp_id,
      "module_name": "Time-Tracker",
      "sub_module_name": "My-Approvals",
      "timesheet_id": this.timesheetDetails.id,
      "date_of_request": this.dateOfRequest,
      "approval_status": this.timesheetDetails.approval_status,
      "timezone": zone,
    }
    this.notificationService.postNotification(formdata).subscribe(data => {
      if (data.map.statusMessage == "Success") {
      }
      else {
      }
    })
  }

  // send notification with mail expired info message
  async notificationWithEmailMsg() {
    this.spinner.show();
    let notify_id;
    let zone = moment.tz.guess();
    let message =
    "Mail configuration issue encountered during  "+ this.Emp_id +" timesheet submission.";
    let formdata = {
      "org_id": localStorage.getItem("OrgId"),
      "message": message,
      "to_notify_id":  this.timesheetDetails.orgDetails.emp_id,
      "notifier": this.Emp_id,
      "keyword": "mail-issue",
      "timezone": zone,
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

  //timelog resubmit will give response of true
  resubmit_timelog(){
    this.dialogRef.close({ data: true});
  }
}
