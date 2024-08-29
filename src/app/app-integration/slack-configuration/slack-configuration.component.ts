import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ManageIntegrationService } from 'src/app/services/app-integration/manage-integration-service/manage-integration.service';
import { SettingsService } from 'src/app/services/settings.service';
import { UtilService } from 'src/app/services/util.service';
import { DeleteComponent } from 'src/app/util/delete/delete.component';
import { manageNotificationNoOption, manageNotificationYesOption } from '../../util/note-message';
@Component({
  selector: 'app-slack-configuration',
  templateUrl: './slack-configuration.component.html',
  styleUrls: ['./slack-configuration.component.less']
})
export class SlackConfigurationComponent implements OnInit {

  constructor(private settingsService: SettingsService, private spinner: NgxSpinnerService, private router: Router,
    private utilsService: UtilService, private manageIntegrationService: ManageIntegrationService, public matDialog: MatDialog,) { }
  isSlackconfigured: boolean = false;
  yesOrNoOption = ["Yes", "No"];
  Notify: string;
  isNotify: string;
  slackconfigurations: any[] = [];
  slackConfigureYesOrNo: boolean = false;
  datapresent: boolean = false;
  attendancePresent: boolean = false;
  dayplannerPresent: boolean = false;
  leavePresent: boolean = false;
  approvalsPresent: boolean = false;
  attendanceData: any;
  dayplannerData: any;
  leaveData: any;
  approvalsData: any;
  slackNotifyData: any;
  slackConfigNoteMessage: string = manageNotificationNoOption;


  ngOnInit() {
    this.getSlackconfiguration();
    // setTimeout( () => {this.getSlackConfig();},500);
  }

  //***  To get slack configurations based on org id */
  getSlackconfiguration() {
    this.spinner.show();
    this.settingsService.getActiveSlackIntegrationByOrgId(localStorage.getItem("OrgId")).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        this.slackconfigurations = JSON.parse(data.map.data);
        // console.log(this.slackconfigurations);
        if (this.slackconfigurations.length > 0) {
          this.datapresent = true;
          for (let i = 0; i < this.slackconfigurations.length; i++) {
            if (this.slackconfigurations[i].module_name == "attendance") {
              this.attendancePresent = true;
              this.attendanceData = this.slackconfigurations[i];
            }
            else if (this.slackconfigurations[i].module_name == "day-planner") {
              this.dayplannerPresent = true;
              this.dayplannerData = this.slackconfigurations[i];
            }
            else if (this.slackconfigurations[i].module_name == "leave-tracker") {
              this.leavePresent = true;
              this.leaveData = this.slackconfigurations[i];
            }
            else if (this.slackconfigurations[i].module_name == "approvals") {
              this.approvalsPresent = true;
              this.approvalsData = this.slackconfigurations[i];
            }
          }
        }
        else {
          this.datapresent = false;
          // this.updateSlackConfig();
        }
        this.getSlackConfig();
      }
      this.spinner.hide();
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
    })
  }
  // async updateSlackConfig(){
  //     let OrgId = localStorage.getItem("OrgId");
  //   let data = {
  //     org_id: OrgId,
  //     app: "slack",
  //     module: "all",
  //   };
  //   await this.manageIntegrationService.updateGetAllSlackConfig(data).subscribe(
  //     (data) =>{
  //     });
  // }

  //**** To navigate to slack integration add and edit page */
  navigateModule(navigateTo: string) {
    localStorage.setItem("fromSlackIntegration", "true");
    if (navigateTo == "attendance") {
      if (this.attendancePresent == true) {
        localStorage.setItem("integrationModuleName", "attendance");
        this.router.navigate(['edit-slack-integration/' + this.attendanceData.id]);
      }
      else {
        localStorage.setItem("integrationModuleName", "attendance");
        this.router.navigate(["/add-slack-integration"]);
      }
    }
    if (navigateTo == "dayplanner") {
      if (this.dayplannerPresent == true) {
        localStorage.setItem("integrationModuleName", "day-planner");
        this.router.navigate(['edit-slack-integration/' + this.dayplannerData.id]);
      }
      else {
        localStorage.setItem("integrationModuleName", "day-planner");
        this.router.navigate(["/add-slack-integration"]);
      }
    }
    if (navigateTo == "leave") {
      if (this.leavePresent == true) {
        localStorage.setItem("integrationModuleName", "leave-tracker");
        this.router.navigate(['edit-slack-integration/' + this.leaveData.id]);
      }
      else {
        localStorage.setItem("integrationModuleName", "leave-tracker");
        this.router.navigate(["/add-slack-integration"]);
      }
    }
    if (navigateTo == "approvals") {
      if (this.approvalsPresent == true) {
        localStorage.setItem("integrationModuleName", "approvals");
        this.router.navigate(['edit-slack-integration/' + this.approvalsData.id]);
      }
      else {
        localStorage.setItem("integrationModuleName", "approvals");
        this.router.navigate(["/add-slack-integration"]);
      }
    }

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
          this.isSlackconfigured = true;
          let out = data.map.data;
          this.slackNotifyData = out;
          if (out.isActive == true) {
            this.isNotify = "Yes";
            this.Notify = "Yes";
            this.slackConfigNoteMessage = manageNotificationYesOption;
          } else {
            this.isNotify = "No";
            this.Notify = "No";
            this.slackConfigNoteMessage = manageNotificationNoOption;
          }
        } else {
          this.isSlackconfigured = false;
          this.SaveModuleslack();
        }
        this.spinner.hide();
      },
      (error) => {
        this.router.navigate(["/404"]);
        this.spinner.hide();
      }
    );
  }
  radioButtonClickedManageSlackConfig(event) {
    if (event.value == "Yes") {
      this.slackConfigNoteMessage = manageNotificationYesOption;
    } else {
      this.slackConfigNoteMessage = manageNotificationNoOption;
    }

  }

  SaveModuleslack() {
    this.spinner.show();
    let OrgId = localStorage.getItem("OrgId");
    let data: Object = {
      org_id: OrgId,
      app: "slack",
      module: "all",
    };
    this.manageIntegrationService.createIntegrationAcess(data).subscribe(
      (data) => {
        // console.log("SaveModuleslack",data);
        if (data.map.statusMessage == "Success") {
          this.isSlackconfigured = true;
          this.isNotify = this.Notify;
          // this.utilsService.openSnackBarAC(
          //   "Slack notification created successfully",
          //   "OK"
          // );
        } else {
          // this.utilsService.openSnackBarMC(
          //   "Slack notification create failed",
          //   "OK"
          // );
        }
        this.spinner.hide();
      },
      (error) => {
        this.router.navigate(["/404"]);
        this.spinner.hide();
      }
    );
  }
  UpdateModuleslack() {
    this.spinner.show();
    let OrgId = localStorage.getItem("OrgId");
    let data: Object = {
      id: this.slackNotifyData.id,
      org_id: OrgId,
      app: "slack",
      module: "all",
      isActive: this.Notify == "Yes" ? true : false
    };
    this.manageIntegrationService.updateIntegrationAcess(data).subscribe(
      (data) => {
        if (data.map.statusMessage == "Success") {
          this.isNotify = this.Notify;
          this.utilsService.openSnackBarAC(
            "Slack integration updated successfully",
            "OK"
          );
        } else {
          this.utilsService.openSnackBarMC(
            "Failed to update slack integration. Please verify the integration",
            "OK"
          );
        }
        this.getSlackConfig();
        this.spinner.hide();
      },
      (error) => {
        this.router.navigate(["/404"]);
        this.spinner.hide();
      }
    );
  }

  //integrations delete
  deleteIntegration(id) {
    const dialogRef = this.matDialog.open(DeleteComponent, {
      width: '30%',
      panelClass: 'custom-viewdialogstyle',
      data: { key: "slack-whats-delete", showComment: false },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result != undefined && result != "") {
        if (result.data == true) {
          this.deleteIntegrationConfoirm(id);
        }
      }
    });
  }
  deleteIntegrationConfoirm(id) {
    this.spinner.show();
    this.settingsService.deleteIntegration(id).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        this.utilsService.openSnackBarAC("Slack integration details deleted successfully", "OK");
        this.dayplannerPresent = false;
        this.leavePresent = false;
        this.attendancePresent = false;
        this.getSlackconfiguration();
        // this.getSlackConfig();
        this.spinner.hide();
      }
      else {
        this.utilsService.openSnackBarAC("Failed to delete integration details", "OK");
        this.spinner.hide();
      }
    },
      (error) => {
        this.router.navigate(["/404"]);
        this.spinner.hide();
      })
  }
}
