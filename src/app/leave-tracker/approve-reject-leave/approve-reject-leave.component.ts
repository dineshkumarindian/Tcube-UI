import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, ValidationErrors, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import moment from 'moment-timezone';
import { NgxSpinnerService } from 'ngx-spinner';
import { LeaveTrackerService } from 'src/app/services/leave-tracker.service';
import { NotificationService } from 'src/app/services/notification.service';
import { SettingsService } from 'src/app/services/settings.service';
import { UtilService } from 'src/app/services/util.service';
import { Router } from '@angular/router';
import { errorMessage, validFormat, approvHeadMessage, approveContentMessage, rejectHeadMessage, rejectContetnMessage } from '../../util/constants';
import { ManageIntegrationService } from 'src/app/services/app-integration/manage-integration-service/manage-integration.service';
// import {approvHeadMessage,approveContentMessage,rejectHeadMessage,rejectContetnMessage} from '../../util/constants';
export function whitespaceValidator(form: UntypedFormControl): ValidationErrors {
  return form.value.startsWith(" ") ? { whitespace: true } : null;
}


@Component({
  selector: 'app-approve-reject-leave',
  templateUrl: './approve-reject-leave.component.html',
  styleUrls: ['./approve-reject-leave.component.less']
})
export class ApproveRejectLeaveComponent implements OnInit {

  requiredMessage = errorMessage;
  validMessage = validFormat;
  approveHeadMsg = approvHeadMessage;
  approvecontentMsg = approveContentMessage;
  rejectHeadMsg = rejectHeadMessage;
  rejectContentMsg = rejectContetnMessage;

  approve: Boolean = false;
  reject: Boolean = false;
  approveFormGroup: UntypedFormGroup;
  // rejectFormGroup:FormGroup;
  empDetails: any = [];
  slackIntegrationDetails: any = [];
  empDetails1: any;
  whatsappIntegrationDetails: any = [];
  loginstr: string;
  loginurl: any = '';
  login_str: any;
  modifiedstring: any;
  slackNotify: boolean;
  isNotify: string = "No";
  constructor(
    public dialogRef: MatDialogRef<ApproveRejectLeaveComponent>,
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
    this.empDetails = this.data.details;
    if (this.data.data == 'approve') {
      this.approve = true;
    } else if (this.data.data == 'reject') {
      this.reject = true;
    }
    //get url for login
    this.loginurl = window.location.href;
    this.modifiedstring = this.loginurl.slice(0, this.loginurl.length - 13);
    this.loginstr = "login";
    this.login_str = this.modifiedstring.concat(this.loginstr.toString());
    // console.log(this.login_str);

  }
  rejectFormGroup: UntypedFormGroup = this._formbuilder.group({
    comments: ['', [Validators.required, whitespaceValidator]]
  })
  //  // Emptyspace validator function ,Validators.pattern('/^\s*\s*$/')
  //  public noWhitespaceValidator(control: FormControl) {
  //   const isSpace = (control.value || '').match(/\s/g);
  //   return isSpace ? { 'whitespace': true } : null;
  // }
  emp_name: any
  halfAndFullDay: any;
  ngOnInit() {
    this.approveFormGroup = this._formbuilder.group({
      comments: ['', Validators.required],
    });
    // this.rejectFormGroup = this._formbuilder.group({
    //   comments: ['',Validators.required],
    // })
    this.getslackDetails();
    this.getWhatsappDetails();
    this.getEmpDetails(this.data.details.reporter);
  }

  //get slack details
  getslackDetails() {
    this.spinner.show();
    let data: Object = {
      "org_id": localStorage.getItem("OrgId"),
      "module_name": "leave-tracker",
      "reason": "approve-leave",
      "app_name": "slack"
    }
    this.leaveTrackerService.getslackDetails(data).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        // let response = JSON.parse(data.map.data);
        let response = data.map.data;
        this.slackIntegrationDetails = response;
        // console.log(this.slackIntegrationDetails);
      } else if (data.map.statusMessage == "Error") {
      }
      this.spinner.hide();
      this.getSlackConfig();
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
    })
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

  //get slack details
  getWhatsappDetails() {
    this.spinner.show();
    let data: Object = {
      "org_id": localStorage.getItem("OrgId"),
      "module_name": "leave-tracker",
      "reason": "approve-leave",
      "app_name": "whatsapp"
    }
    this.leaveTrackerService.getslackDetails(data).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        let response = JSON.parse(data.map.data);
        this.whatsappIntegrationDetails = response;
        // console.log(this.whatsappIntegrationDetails);
      } else if (data.map.statusMessage == "Error") {
      }
      this.spinner.hide();
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
    })
  }

  //get employee details
  getEmpDetails(id) {
    this.spinner.show();
    this.settingsService.getActiveEmpDetailsById(id).subscribe(async data => {
      if (data.map.statusMessage == "Success") {
        let response = JSON.parse(data.map.data);
        this.empDetails1 = response;
      }
      this.spinner.hide();
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
    })
  }

  // approve or reject
  async changeStatus() {
    let zone = moment.tz.guess();
    if (this.data.data == 'approve') {
      let timeoffNotify = false;
      let timeoffNotification = null;
      if (this.slackIntegrationDetails.is_paused == false && this.isNotify === "Yes") {
        timeoffNotify = true;
        timeoffNotification = await this.leaveTrackerService.createLeaveTemplate(this.empDetails, 'Approved');
      }
      this.spinner.show();
      let data: Object = {
        "id": this.data.details.id,
        "status": "Approved",
        "comments": this.approveFormGroup.value.comments,
        "url": this.login_str,
        "timeoffUrl":this.slackIntegrationDetails.url,
        "timeoffNotification": timeoffNotification,
        "timeoffNotify":timeoffNotify,
        "reporter_id": localStorage.getItem("Id"),
        "timezone": zone,

      }
      this.leaveTrackerService.updateLeaveStatus(data).subscribe(data => {
        if(data.map.statusMessage == "Success" && data.map.Error == "Error in creating leave details due to mail configuration check the configuration details") {
          this.utilsService.openSnackBarAC("Leave approved successfully", "OK");  
          this.notificationWithEmailMsg("Approved");
          setTimeout(() => {
            if(localStorage.getItem('Role') != 'org_admin') {
            this.utilsService.openSnackBarMC("Mail configuration issue encountered, please contact admin", "OK");
            } else {
              this.utilsService.openSnackBarMC("Mail configuration issue encountered, please check it", "OK");
            }
          }, 2000);
          this.slackAndWhatsAppNotification();
          this.dialogRef.close();
          this.spinner.hide();
        }
        if (data.map.statusMessage == "Success") {
          // console.log(this.empDetails);
          this.utilsService.openSnackBarAC("Leave approved successfully", "OK");
          this.slackAndWhatsAppNotification();
          this.dialogRef.close();
          // // send messages to slack
          // if (this.slackIntegrationDetails.is_paused == false) {
          //   let details = this.leaveTrackerService.createLeaveTemplate(this.empDetails, 'Approved');
          //   this.leaveTrackerService.sendToSlack(this.slackIntegrationDetails.url, JSON.stringify(details)).subscribe();
          // }
          // // send message to whatsapp
          // if (this.whatsappIntegrationDetails.is_paused == false) {
          //   let tempData = JSON.parse(this.whatsappIntegrationDetails.numbers);
          //   for (let i = 0; i < tempData.length; i++) {
          //     let templateData = this.leaveTrackerService.createWAMsgTemplate(this.empDetails, "Approved", tempData[i].code + tempData[i].number)
          //     this.leaveTrackerService.sendToWhatsApp(this.whatsappIntegrationDetails.url, this.whatsappIntegrationDetails.whatsapp_access_token, JSON.stringify(templateData)).subscribe();
          //   }
          // let templateData = this.leaveTrackerService.createWAMsgTemplate(this.empDetails, "Approved", this.whatsappIntegrationDetails.country_code_1+this.whatsappIntegrationDetails.mobile_number_1)
          // this.leaveTrackerService.sendToWhatsApp(this.whatsappIntegrationDetails.url, this.whatsappIntegrationDetails.whatsapp_access_token, JSON.stringify(templateData)).subscribe();
          // if (this.whatsappIntegrationDetails.mobile_number_2 != undefined) {
          //   let templateData = this.leaveTrackerService.createWAMsgTemplate(this.empDetails, "Approved", this.whatsappIntegrationDetails.country_code_2+this.whatsappIntegrationDetails.mobile_number_2)
          //   this.leaveTrackerService.sendToWhatsApp(this.whatsappIntegrationDetails.url, this.whatsappIntegrationDetails.whatsapp_access_token, JSON.stringify(templateData)).subscribe();
          // }
          // }
          // this.notification();
          this.spinner.hide();
        }
        else {
          this.utilsService.openSnackBarMC(data.map.data, "OK");
          this.spinner.hide();
        }

      }, (error) => {
        this.router.navigate(["/404"]);
        this.spinner.hide();
        this.dialogRef.close();
      })
    } else if (this.data.data == 'reject') {
      // console.log(this.rejectFormGroup.value.comments);
      this.spinner.show();
      let data: Object = {
        "id": this.data.details.id,
        "status": "Rejected",
        "comments": this.rejectFormGroup.value.comments,
        "url": this.login_str,
        "reporter_id": localStorage.getItem("Id"),
        "timezone": zone,

      }
      // console.log(data);
      this.leaveTrackerService.updateLeaveStatus(data).subscribe(data => {
        if(data.map.statusMessage == "Success" && data.map.Error == "Error in creating leave details due to mail configuration check the configuration details") {
          this.utilsService.openSnackBarAC("Leave rejected successfully", "OK");
          this.notificationWithEmailMsg("Rejected");
          setTimeout(() => {
            if(localStorage.getItem('Role') != 'org_admin') {
              this.utilsService.openSnackBarMC("Mail configuration issue encountered, please contact admin", "OK");
              } else {
                this.utilsService.openSnackBarMC("Mail configuration issue encountered, please check it", "OK");
              }
          }, 2000);
          this.dialogRef.close();
          this.spinner.hide();
        }
        if (data.map.statusMessage == "Success") {
          this.utilsService.openSnackBarAC("Leave rejected successfully", "OK");
          // this.slackAndWhatsAppNotification();
          this.dialogRef.close();
          // send messages to slack
          // if (this.slackIntegrationDetails.is_paused == false) {
          //   let details = this.leaveTrackerService.createLeaveTemplate(this.empDetails, 'Rejected');
          //   this.leaveTrackerService.sendToSlack(this.slackIntegrationDetails.url, JSON.stringify(details)).subscribe();
          // }
          // send message to whatsapp
          // if (this.whatsappIntegrationDetails.is_paused == false) {
          //   let tempData = JSON.parse(this.whatsappIntegrationDetails.numbers);
          //   for (let i = 0; i < tempData.length; i++) {
          //     let templateData = this.leaveTrackerService.createWAMsgTemplate(this.empDetails, "Rejected", tempData[i].code + tempData[i].number)
          //     this.leaveTrackerService.sendToWhatsApp(this.whatsappIntegrationDetails.url, this.whatsappIntegrationDetails.whatsapp_access_token, JSON.stringify(templateData)).subscribe();
          //   }
          // }
          // this.notification();
          this.spinner.hide();
        }
        else {
          this.utilsService.openSnackBarMC(data.map.data, "OK");
          this.spinner.hide();
        }
        // this.spinner.hide();
      }, (error) => {
        this.router.navigate(["/404"]);
        this.spinner.hide();
        this.dialogRef.close();
      })
    }
  }

  async slackAndWhatsAppNotification() {
    // send messages to slack
    // if (this.slackIntegrationDetails.is_paused == false && this.isNotify === "Yes") {
    //   let details = await this.leaveTrackerService.createLeaveTemplate(this.empDetails, 'Approved');
    //   await this.leaveTrackerService.sendToSlack(this.slackIntegrationDetails.url, JSON.stringify(details)).subscribe(data => {
    //     if (data === "ok") {
    //       this.slackNotify = true;
    //     }
    //     else {
    //       this.slackNotify = false;
    //     }
    //     // ***** Update on slack notifiaction sended**********
    //     let data1: Object = {
    //       "notificationId": this.data.details.id,
    //       "status": this.slackNotify
    //     }
    //     this.leaveTrackerService.updateSlackNotificationStatus(data1).subscribe(data => {
    //     });
    //   }, (error) => {
    //     this.slackNotify = false;
    //     // ***** When the slack notify failed**********
    //     let data1: Object = {
    //       "notificationId": this.data.details.id,
    //       "status": this.slackNotify
    //     }
    //     this.leaveTrackerService.updateSlackNotificationStatus(data1).subscribe(data => {
    //     });
    //     setTimeout(() => {
    //       this.utilsService.openSnackBarMC("Failed to send leave notification", "OK");
    //     }, 1000);
    //   });
    // }
    // send message to whatsapp
    if (this.whatsappIntegrationDetails.is_paused == false) {
      let tempData = JSON.parse(this.whatsappIntegrationDetails.numbers);
      for (let i = 0; i < tempData.length; i++) {
        let templateData = this.leaveTrackerService.createWAMsgTemplate(this.empDetails, "Approved", tempData[i].code + tempData[i].number)
        this.leaveTrackerService.sendToWhatsApp(this.whatsappIntegrationDetails.url, this.whatsappIntegrationDetails.whatsapp_access_token, JSON.stringify(templateData)).subscribe();
      }
      // let templateData = this.leaveTrackerService.createWAMsgTemplate(this.empDetails, "Approved", this.whatsappIntegrationDetails.country_code_1+this.whatsappIntegrationDetails.mobile_number_1)
      // this.leaveTrackerService.sendToWhatsApp(this.whatsappIntegrationDetails.url, this.whatsappIntegrationDetails.whatsapp_access_token, JSON.stringify(templateData)).subscribe();
      // if (this.whatsappIntegrationDetails.mobile_number_2 != undefined) {
      //   let templateData = this.leaveTrackerService.createWAMsgTemplate(this.empDetails, "Approved", this.whatsappIntegrationDetails.country_code_2+this.whatsappIntegrationDetails.mobile_number_2)
      //   this.leaveTrackerService.sendToWhatsApp(this.whatsappIntegrationDetails.url, this.whatsappIntegrationDetails.whatsapp_access_token, JSON.stringify(templateData)).subscribe();
      // }
    }
  }

  // send notification
  notification() {
    let zone = moment.tz.guess();
    let message;
    let status;
    let approval_status;
    if (this.data.data == 'approve') {
      message = this.empDetails1.firstname + ' ' + this.empDetails1.lastname + " has approved your request."
      status = "Approved";
      approval_status = this.approveFormGroup.value.comments;

    }
    if (this.data.data == 'reject') {
      message = this.empDetails1.firstname + ' ' + this.empDetails1.lastname + " has Rejected your request."
      status = "Rejected";
      approval_status = this.rejectFormGroup.value.comments;

    }
    let formdata = {
      "org_id": localStorage.getItem("OrgId"),
      "message": message,
      "to_notify_id": this.data.details.emp_id,
      "notifier": this.data.details.reporter,
      "module_name": "Leave-Tracker",
      "sub_module_name": "My-Leaves",
      "approval_status": status,
      "approval_comments": approval_status,
      "timezone": zone,
      // "date_of_request" : moment().format("YYYY-MM-DD"),
      "date_of_request": moment(this.data.details.created_time).format("YYYY-MM-DD"),
    }
    this.notificationService.postNotification(formdata).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        // console.log("notification send");
      }
      else {
        //   console.log("notification failed");
      }
    })
  }
  async notificationWithEmailMsg(status) {
    this.spinner.show();
    let zone = moment.tz.guess();
    let message="";
    if(status == "Rejected") {
     message =
     "Mail configuration issue encountered while rejecting  "+this.empDetails1.id +"'s leave.";
    } else {
       message =
       "Mail configuration issue encountered while approving  "+this.empDetails1.id+"'s leave.";
    }
    let formdata = {
      "org_id": this.empDetails1.orgDetails.org_id,
      "message": message,
      "to_notify_id":  this.empDetails1.orgDetails.emp_id ,
      "notifier": this.empDetails1.id,
      "module_name": "Forgot password",
      "sub_module_name": "Forgot password",
      "keyword": "forgotpassword-mail-issue",  
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
}
