import { Component, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { SettingsService } from 'src/app/services/settings.service';
import { UtilService } from 'src/app/services/util.service';
import { Router } from '@angular/router';
import { ManageIntegrationService } from 'src/app/services/app-integration/manage-integration-service/manage-integration.service';
import { DeleteComponent } from 'src/app/util/delete/delete.component';
import { MatDialog } from '@angular/material/dialog';
import {manageNotificationYesOption,manageNotificationNoOption} from '../../util/note-message';

@Component({
  selector: 'app-whatsapp-configuration',
  templateUrl: './whatsapp-configuration.component.html',
  styleUrls: ['./whatsapp-configuration.component.less']
})
export class WhatsappConfigurationComponent implements OnInit {

  constructor(private settingsService: SettingsService,
    private spinner: NgxSpinnerService,
    private utilsService: UtilService,
    private router: Router,
    private manageIntegrationService: ManageIntegrationService,
    public matDialog: MatDialog,) { }

  isWhatsappconfigured: boolean = false;
  yesOrNoOption = ["Yes", "No"];
  Notify: string = "No";
  isNotify: string = "No";
  whatsappconfigurations: any[] = [];
  datapresent: boolean = false;
  attendancePresent: boolean = false;
  // dayplannerPresent: boolean = false;
  leavePresent: boolean = false;
  attendanceData: any;
  // dayplannerData: any;
  leaveData: any;
  slackNotifyData: any;
  whatsappConfigNoteMessage  = manageNotificationNoOption;

  ngOnInit(): void {
    this.getWhatsappconfiguration();
    this.getWhatsappConfig();
  }

  //***  To get slack configurations based on org id */
  getWhatsappconfiguration() {
    this.spinner.show();
    this.settingsService.getActiveWhatsappIntegrationByOrgId(localStorage.getItem("OrgId")).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        this.whatsappconfigurations = JSON.parse(data.map.data);
        if (this.whatsappconfigurations.length > 0) {
          this.datapresent = true;
        }
        else {
          this.datapresent = false;
        }
      }
      // console.log(this.whatsappconfigurations);
      this.spinner.hide();
      if (this.datapresent == true) {
        for (let i = 0; i < this.whatsappconfigurations.length; i++) {
          if (this.whatsappconfigurations[i].module_name == "attendance") {
            this.attendancePresent = true;
            this.attendanceData = this.whatsappconfigurations[i];
          }
          // if (this.whatsappconfigurations[i].module_name == "day-planner") {
          //   this.dayplannerPresent = true;
          //   this.dayplannerData = this.whatsappconfigurations[i];
          // }
          if (this.whatsappconfigurations[i].module_name == "leave-tracker") {
            this.leavePresent = true;
            this.leaveData = this.whatsappconfigurations[i];
          }

        }
      }
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
    })
  }
  radioButtonClickedManageWhatsappConfig(event:any){
    if(event.value == "Yes"){
      this.whatsappConfigNoteMessage = manageNotificationYesOption;
    } else {
      this.whatsappConfigNoteMessage = manageNotificationNoOption;
    }
    
  }
  getWhatsappConfig() {
    this.spinner.show();
    let OrgId = localStorage.getItem("OrgId");
    let data: Object = {
      org_id: OrgId,
      app: "whatsapp",
      module: "all",
    };
    this.manageIntegrationService.getIntegrationAccessData(data).subscribe(
      (data) => {
        if (data.map.statusMessage == "Success") {
          this.isWhatsappconfigured = true;
          let out = data.map.data;
          this.slackNotifyData = out;
          // console.log(this.slackNotifyData);

          if (out.isActive == true) {
            this.isNotify = "Yes";
            this.Notify = "Yes";
            this.whatsappConfigNoteMessage = manageNotificationYesOption;
          } else {
            this.isNotify = "No";
            this.Notify = "No";
            this.whatsappConfigNoteMessage = manageNotificationNoOption;
          }
        } else {
          this.isWhatsappconfigured = false;
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

  //**** To navigate to slack integration add and edit page */
  navigate(navigateTo: string) {
    localStorage.setItem("fromWhatsappIntegration", "true");
    if (navigateTo == "attendance") {
      if (this.attendancePresent == true) {
        localStorage.setItem("integrationModuleName", "attendance");
        this.router.navigate(['edit-whatsapp-integration/' + this.attendanceData.id]);
      }
      else {
        localStorage.setItem("integrationModuleName", "attendance");
        this.router.navigate(["/add-whatsapp-integration"]);
      }
    }
    // if (navigateTo == "dayplanner") {
    //   if (this.dayplannerPresent == true) {
    //     localStorage.setItem("integrationModuleName", "day-planner");
    //     this.router.navigate(['edit-slack-integration/' + this.dayplannerData.id]);
    //   }
    //   else {
    //     localStorage.setItem("integrationModuleName", "day-planner");
    //     this.router.navigate(["/add-slack-integration"]);
    //   }
    // }
    if (navigateTo == "leave") {
      if (this.leavePresent == true) {
        localStorage.setItem("integrationModuleName", "leave-tracker");
        this.router.navigate(['edit-whatsapp-integration/' + this.leaveData.id]);
      }
      else {
        localStorage.setItem("integrationModuleName", "leave-tracker");
        this.router.navigate(["/add-whatsapp-integration"]);
      }
    }
  }

  SaveModuleslack() {
    this.spinner.show();
    let OrgId = localStorage.getItem("OrgId");
    let data: Object = {
      org_id: OrgId,
      app: "whatsapp",
      module: "all",
    };
    this.manageIntegrationService.createIntegrationAcess(data).subscribe(
      (data) => {
        if (data.map.statusMessage == "Success") {
          this.isWhatsappconfigured = true;
          this.isNotify = this.Notify;
          // this.utilsService.openSnackBarAC(
          //   "Whatsapp notification created successfully",
          //   "OK"
          // );
        } else {
          // this.utilsService.openSnackBarMC(
          //   "Whatsapp notification create failed",
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
      app: "whatsapp",
      module: "all",
      isActive: this.Notify == "Yes" ? true : false
    };
    this.manageIntegrationService.updateIntegrationAcess(data).subscribe(
      (data) => {
        if (data.map.statusMessage == "Success") {
          this.isNotify = this.Notify;
          this.utilsService.openSnackBarAC(
            "Whatsapp integration updated successfully",
            "OK"
          );
        } else {
          this.utilsService.openSnackBarMC(
            "Failed to update whatsapp integration",
            "OK"
          );
        }
        this.getWhatsappConfig();
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
        this.utilsService.openSnackBarAC("whatsapp integration details deleted successfully", "OK");
        // this.dayplannerPresent = false;
        this.leavePresent = false;
        this.attendancePresent = false;
        this.getWhatsappconfiguration();
        this.getWhatsappConfig();
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
