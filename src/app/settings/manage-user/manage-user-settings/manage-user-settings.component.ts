import { Component, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { UtilService } from 'src/app/services/util.service';
import { ManageIntegrationService } from '../../../services/app-integration/manage-integration-service/manage-integration.service';
import { Router } from '@angular/router';
import {MailService} from '../../../services/app-integration/mail-service/mail.service';
import {manageNotificationYesOption,manageNotificationNoOption} from '../../../util/note-message';
@Component({
  selector: 'app-manage-user-settings',
  templateUrl: './manage-user-settings.component.html',
  styleUrls: ['./manage-user-settings.component.less']
})
export class ManageUserSettingsComponent implements OnInit {

  isActiveMailConfig: boolean = false;
  yesOrNoOption: any[] = ['Yes', 'No'];
  yesOrNoMailConfig: boolean = false;
  mailNotifyData: any;
  isRemainderMailConfig:string;
  mailNoteMessage:string = manageNotificationNoOption;

  constructor(private spinner: NgxSpinnerService,
    private utilsService: UtilService,
    private manageIntegrationService: ManageIntegrationService,
    private router: Router,
    private mailService:MailService) { }

  ngOnInit() {
    this.isActiveMailConfig = true;
    this.yesOrNoMailConfig = false;
    this.getMailConfigByOrg();
    // this.getManageUserMailConfig();


  }
  radioButtonClickedManageMail(event: any) {
    this.yesOrNoMailConfig = true;
    if(event.value == "Yes"){
      this.mailNoteMessage = manageNotificationYesOption;
    } else {
      this.mailNoteMessage = manageNotificationNoOption;
    }
  }

  SaveOrUpdateManageUserMailConfig() {
    // console.log(this.notYetmailConfig);

    if (this.mailNotifyData == null) {
      this.spinner.show();
      let OrgId = localStorage.getItem("OrgId");
      let data: Object = {
        org_id: OrgId,
        app: "mail",
        module: "manage-user",
      };
      // console.log(data);
      this.manageIntegrationService.createIntegrationAcess(data).subscribe(
        (data) => {
          if (data.map.statusMessage == "Success") {
            this.utilsService.openSnackBarAC(
              "Mail notification created successfully",
              "OK"
            );
            this.getMailConfigByOrg();
          } else {
            this.utilsService.openSnackBarMC(
              "Failed to create mail notifcation",
              "OK"
            );
          }
          this.spinner.hide();
        },
        (error) => {
          this.router.navigate(["/404"]);
          this.spinner.hide();
        }
      );
    }
    else {
      this.spinner.show();
      let OrgId = localStorage.getItem("OrgId");
      let data: Object = {
        id: this.mailNotifyData.id,
        org_id: OrgId,
        app: "mail",
        module: "manage-user",
        isActive: this.isRemainderMailConfig == "Yes" ? true : false
      };
      this.manageIntegrationService.updateIntegrationAcess(data).subscribe(
        (data) => {
          if (data.map.statusMessage == "Success") {
            this.utilsService.openSnackBarAC(
              "Mail notification updated successfully",
              "OK"
            );
            this.getMailConfigByOrg();
          } else {
            this.utilsService.openSnackBarMC(
              "Failed to update mail notification",
              "OK"
            );
          }
          this.spinner.hide();
        },
        (error) => {
          this.router.navigate(["/404"]);
          this.spinner.hide();
        }
      );
    }
  }

  notifyDisable:boolean = false;
  ismailconfigured:boolean = false;
  getMailConfigByOrg() {
    this.spinner.show();
    let OrgId = localStorage.getItem("OrgId");
    this.yesOrNoMailConfig = false;
    this.mailService.getMailConfigByOrg(OrgId).subscribe(
      (data) => {
        if (data.map.statusMessage == "Success") {
          if(JSON.parse(data.map.data).isActive){
            this.notifyDisable = false;
          }
          else{
            this.notifyDisable = true;
          }  
          this.ismailconfigured = true;
          this.getManageUserMailConfig();
        } else {this.isRemainderMailConfig = 'No';
          this.notifyDisable = true;
          this.ismailconfigured = false;
          this.spinner.hide();
        }
       
      },
      (error) => {
        this.router.navigate(["/404"]);
        this.spinner.hide();
      }
    );
  }

  getManageUserMailConfig() {
    this.spinner.show();
    let OrgId = localStorage.getItem("OrgId");
    let data: Object = {
      org_id: OrgId,
      app: "mail",
      module: "manage-user",
    };
    this.manageIntegrationService.getIntegrationAccessData(data).subscribe(
      (data) => {
        // console.log(data);
        if (data.map.statusMessage == "Success") {
          this.yesOrNoMailConfig = false;
          let out = data.map.data;
          this.mailNotifyData = out;
          // console.log(this.mailNotifyData);
          if (out.isActive == true) {
            this.isRemainderMailConfig = 'Yes';
            this.mailNoteMessage = manageNotificationYesOption;
           }
          else {
            this.isRemainderMailConfig = 'No';
            this.mailNoteMessage = manageNotificationNoOption;
          }
          this.spinner.hide();
        } else{
          this.isRemainderMailConfig = 'No';
          this.mailNoteMessage = manageNotificationNoOption;
          this.spinner.hide();
        }
       
      },
      (error) => {
        this.router.navigate(["/404"]);
        this.spinner.hide();
      }
    );
  }
  canceltoggleEmp() {
    localStorage.setItem("ManageUserAction", "true");
    this.router.navigate(['/settings']);
  }
}
