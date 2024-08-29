import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, Validators, UntypedFormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NgxSpinnerService } from 'ngx-spinner';
import { LeaveTrackerService } from '../../services/leave-tracker.service';
import { SettingsService } from '../../services/settings.service';
import { NotificationService } from '../../services/notification.service';
import { UtilService } from '../../services/util.service';
import { Router } from '@angular/router';
import * as moment from 'moment-timezone';
import { errorMessage, cancelContentMessage, cancelHeadMessage } from '../../util/constants';
import { ManageIntegrationService } from 'src/app/services/app-integration/manage-integration-service/manage-integration.service';
@Component({
  selector: 'app-cancel-leave',
  templateUrl: './cancel-leave.component.html',
  styleUrls: ['./cancel-leave.component.less']
})
export class CancelLeaveComponent implements OnInit {

  requiredMessage = errorMessage;
  cancelHeadMsg = cancelHeadMessage;
  cancelContentMsg = cancelContentMessage;

  approveFormGroup: UntypedFormGroup;
  comments = new UntypedFormControl('', [Validators.required]);

  dataValue: any;
  cancelLeave: boolean = false;
  approveLeave: boolean = false;
  slackNotify: boolean;
  empDetails1: any;
  empDetailsData: any[];
  slackIntegrationDetails: any = [];
  isNotify: string = "No";
  constructor(
    public dialogRef: MatDialogRef<CancelLeaveComponent>,
    @Inject(MAT_DIALOG_DATA) public data,
    private leaveTrackerService: LeaveTrackerService,
    private _formbuilder: UntypedFormBuilder,
    private spinner: NgxSpinnerService,
    private utilsService: UtilService,
    private settingsService: SettingsService,
    private notificationService: NotificationService,
    private router: Router,
    private manageIntegrationService: ManageIntegrationService
  ) {
    // this.getslackDetails();
  }


  ngOnInit() {
    this.approveFormGroup = this._formbuilder.group({
      comments: ['', Validators.required],
    });
    if (this.data.cancelLeave == "cancelLeave") {
      this.cancelLeave = true;
    } else if (this.data.cancelLeave == "approveLeave") {
      this.approveLeave = true;
    }
    this.empDetailsData = this.data.details;
    this.getSlackConfig();
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
  cancelRequestLeave() {
    this.spinner.show();
    this.dataValue = {
      "id": this.data.id,
      "leaveComments": this.comments.value,
      "approval_status": "cancelLeave"
    }
    this.leaveTrackerService.cancelLeaveComments(this.dataValue).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        this.utilsService.openSnackBarAC("Leave canceled successfully", "OK");
        this.getslackDetails("cancel-applied-leave");
        setTimeout(() => {
          this.slackAndWhatsAppNotification();
          this.notification();
          this.dialogRef.close();
        }, 500)
        this.spinner.hide();
      }
      else {
        this.utilsService.openSnackBarMC("Failed to cancel leave", "OK");
        this.spinner.hide();
      }


    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
    })

  }

  cancelApproveLeave() {
    this.spinner.show();
    this.dataValue = {
      "id": this.data.id,
      "leaveComments": this.comments.value,
      "approval_status": "approveLeave"
    }
    this.leaveTrackerService.cancelLeaveComments(this.dataValue).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        this.utilsService.openSnackBarAC("Approved leave canceled successfully", "OK");
        this.getslackDetails("cancel-approved-leave");
        setTimeout(() => {
          this.slackAndWhatsAppNotification();
          this.notification();
          this.dialogRef.close();
        }, 500);
        this.spinner.hide();
      }
      else {
        this.utilsService.openSnackBarMC("Failed to approved leave cancel", "OK");
        this.spinner.hide();
      }

    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
    })

  }

  //get slack details
  async getslackDetails(event: string) {
    this.spinner.show();
    let data: object;
    //Apply leave cancel info
    if (event == "cancel-applied-leave") {
      data = {
        "org_id": localStorage.getItem("OrgId"),
        "module_name": "Approvals",
        "reason": "approve-reject",
        "app_name": "slack"
      }
    }
    //Approved leave cancel info
    if (event == "cancel-approved-leave") {
      data = {
        "org_id": localStorage.getItem("OrgId"),
        "module_name": "leave-tracker",
        "reason": "approve-leave",
        "app_name": "slack"
      }
    }
    await this.leaveTrackerService.getslackDetails(data).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        // let response = JSON.parse(data.map.data);
        let response = data.map.data;
        this.slackIntegrationDetails = response;
      } else if (data.map.statusMessage == "Error") {
      }
      this.spinner.hide();
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
    })
  }

  //send notification to the slack cancel and approved leave cancel
  async slackAndWhatsAppNotification() {
    // send messages to slack
    if (this.slackIntegrationDetails.is_paused == false && this.isNotify === "Yes") {
      let details: any;
      //Apply leave cancel info
      if (this.cancelLeave == true) {
        details = await this.leaveTrackerService.createLeaveTemplate(this.empDetailsData, 'Applied leave cancelled');
      }
      //Approved leave cancel info
      if (this.approveLeave == true) {
        details = await this.leaveTrackerService.createLeaveTemplate(this.empDetailsData, 'Approved leave cancelled');
      }
      await this.leaveTrackerService.sendToSlack(this.slackIntegrationDetails.url, JSON.stringify(details)).subscribe(data => {
        if (data === "ok") {
          this.slackNotify = true;
        }
        else {
          this.slackNotify = false;
        }
        // ***** Update on slack notifiaction sended**********
        let data1: Object = {
          "notificationId": this.data.id,
          "status": this.slackNotify
        }
        this.leaveTrackerService.updateSlackNotificationStatus(data1).subscribe(data => {
        });

      }, (error) => {
        this.slackNotify = false;
        // ***** When the slack notify failed**********
        let data1: Object = {
          "notificationId": this.data.id,
          "status": this.slackNotify
        }
        this.leaveTrackerService.updateSlackNotificationStatus(data1).subscribe(data => {
        });
        setTimeout(() => {
          this.utilsService.openSnackBarMC("Failed to send leave notification", "OK");
        }, 4000);
      });
    }
  }
  // // send notification
  async notification() {
    let zone = moment.tz.guess();
    let message;
    let status;
    let formdata;
    if (this.data.cancelLeave == 'cancelLeave') {
      message = this.data.details.emp_name + " has cancelled the applied leave."
      status = "Cancelled";
      formdata = {
        "org_id": localStorage.getItem("OrgId"),
        "message": message,
        "to_notify_id": this.data.details.reporter,
        "notifier": this.data.details.emp_id,
        "module_name": "",
        "sub_module_name": "",
        "approval_status": status,
        "approval_comments": this.comments.value,
        "timezone": zone,
        "keyword": "cancel-leave",
        // "date_of_request" : moment().format("YYYY-MM-DD"),
        "date_of_request": moment(this.data.details.created_time).format("YYYY-MM-DD"),
      }
    }
    if (this.data.cancelLeave == 'approveLeave') {
      message = this.data.details.emp_name + " has cancelled the approved leave."
      status = "Cancelled";
      formdata = {
        "org_id": localStorage.getItem("OrgId"),
        "message": message,
        "to_notify_id": this.data.details.reporter,
        "notifier": this.data.details.emp_id,
        "module_name": "",
        "sub_module_name": "",
        "approval_status": status,
        "approval_comments": this.comments.value,
        "timezone": zone,
        "keyword": "approved-leave-cancel",
        // "date_of_request" : moment().format("YYYY-MM-DD"),
        "date_of_request": moment(this.data.details.created_time).format("YYYY-MM-DD"),
      }
    }
    // let formdata = {

    // }
    // console.log(formdata);
    await this.notificationService.postNotification(formdata).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        // console.log("notification send");
      }
      else {
        //   console.log("notification failed");
      }
    })
  }
}
