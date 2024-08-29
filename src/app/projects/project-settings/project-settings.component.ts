import { Component, OnInit } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { Router } from "@angular/router";
import { NgxSpinnerService } from "ngx-spinner";
import { Subscription } from "rxjs";
import { MailService } from "src/app/services/app-integration/mail-service/mail.service";
import { ManageIntegrationService } from "src/app/services/app-integration/manage-integration-service/manage-integration.service";
import { SettingsService } from "src/app/services/settings.service";
import { UtilService } from "src/app/services/util.service";
import {manageNotificationYesOption,manageNotificationNoOption} from '../../util/note-message';

@Component({
  selector: "app-project-settings",
  templateUrl: "./project-settings.component.html",
  styleUrls: ["./project-settings.component.less"],
})
export class ProjectSettingsComponent implements OnInit {
  showclients: boolean = false;
  isActiveClientCards: boolean = false;
  activeclients: any[] = [];
  isActiveManageActionCards: boolean = false;
  activecard: string = "client";
  yesOrNoOption = ["Yes", "No"];
  NotifyMail: string;
  isNotify: string;
  ismailconfigured: boolean = false;
  notifyDisable: boolean = true;
  notYetmailConfig: boolean = true;
  mailNotifyData: any;
  clickEventsubscriptionForActiveClient: Subscription;
  clickEventsubscriptionForInactiveClient: Subscription;
  yesOrNoMailConfig:boolean = false;
  projectJobNoteMessage = manageNotificationNoOption;

  constructor(
    private settingsService: SettingsService,
    private router: Router,
    public matDialog: MatDialog,
    private utilsService: UtilService,
    private spinner: NgxSpinnerService,
    private mailService: MailService,
    private manageIntegrationService: ManageIntegrationService,
    private dialog: MatDialog
  ) {
    this.clickEventsubscriptionForActiveClient = this.utilsService
      .getActiveClient()
      .subscribe(() => {
        this.getActiveClientDetailsByOrgId();
      });
    this.clickEventsubscriptionForInactiveClient = this.utilsService
      .getInactiveClient()
      .subscribe(() => {
        this.getInactiveClientDetails();
      });
  }

  ngOnInit() {
    this.getActiveClientDetailsByOrgId();
    this.toggleCards("manage-clients");
    this.yesOrNoMailConfig = false;
    this.getMailConfigByOrg();
    // this.getProjectMailConfig();
  }
  toggleCards(data) {
    if (data == "manage-clients") this.showclients = true;
    this.isActiveClientCards = true;
    this.isActiveManageActionCards = true;
  }

  radioButtonClickedSlackMailConfig(event:any){
    this.yesOrNoMailConfig = true;
    if(event.value == "Yes"){
      this.projectJobNoteMessage = manageNotificationYesOption;
    } else {
      this.projectJobNoteMessage = manageNotificationNoOption;
    }
  }
  
  getMailConfigByOrg() {
    this.spinner.show();
    let OrgId = localStorage.getItem("OrgId");
    this.yesOrNoMailConfig = false;
    this.mailService.getMailConfigByOrg(OrgId).subscribe(
      (data) => {
        if (data.map.statusMessage == "Success") {
          let response = JSON.parse(data.map.data);
          if(response.isActive){
            this.notifyDisable = false;
          }
          else{
            this.notifyDisable = true;
          }  
          this.ismailconfigured = true;
          this.getProjectMailConfig();
        } else {
          this.NotifyMail = "No";
          this.isNotify = "No";
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
  getProjectMailConfig() {
    this.spinner.show();
    let OrgId = localStorage.getItem("OrgId");
    let data: Object = {
      org_id: OrgId,
      app: "mail",
      module: "projects/jobs",
    };
    this.manageIntegrationService.getIntegrationAccessData(data).subscribe(
      (data) => {
        if (data.map.statusMessage == "Success") {
          this.notYetmailConfig= false;
          let out = data.map.data;
          this.mailNotifyData = out;
          this.yesOrNoMailConfig = false;
          if (out.isActive == true) {
            this.isNotify = "Yes";
            this.NotifyMail = "Yes";   
            this.projectJobNoteMessage = manageNotificationYesOption;
          } else {
            this.isNotify = "No";
            this.NotifyMail = "No";
            this.projectJobNoteMessage = manageNotificationNoOption;
          }
          this.spinner.hide();
        } else {
          this.isNotify = "No";
          this.NotifyMail = "No";
          this.notYetmailConfig= true;
          this.spinner.hide();
        }
       
      },
      (error) => {
        this.router.navigate(["/404"]);
        this.spinner.hide();
      }
    );
  }

  SaveOrUpdateModuleMail(){ 
    if (this.notYetmailConfig) {
      this.spinner.show();
      let OrgId = localStorage.getItem("OrgId");
      let data: Object = {
        org_id: OrgId,
        app: "mail",
        module: "projects/jobs",
      };
      this.manageIntegrationService.createIntegrationAcess(data).subscribe(
        (data) => {
          if (data.map.statusMessage == "Success") {
            this.notYetmailConfig=false;
            this.isNotify = this.NotifyMail;
            this.utilsService.openSnackBarAC(
              "Mail notification created successfully",
              "OK"
            );
            this.getMailConfigByOrg();
          } else {
            this.utilsService.openSnackBarMC(
              "Mail notification create failed",
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
    else{
      this.spinner.show();
      let OrgId = localStorage.getItem("OrgId");
      let data: Object = {
        id: this.mailNotifyData.id,
        org_id: OrgId,
        app: "mail",
        module: "projects/jobs",
        isActive: this.NotifyMail=="Yes"?true:false
      };
      this.manageIntegrationService.updateIntegrationAcess(data).subscribe(
        (data) => {
          if (data.map.statusMessage == "Success") {            
            this.isNotify = this.NotifyMail;
            this.utilsService.openSnackBarAC(
              "Email notification updated successfully",
              "OK"
            );
            this.getMailConfigByOrg();
          } else {
            this.utilsService.openSnackBarMC(
              "Email notification update failed",
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
  count_str: string;
  //get active client details by orgid
  getActiveClientDetailsByOrgId() {
    this.spinner.show();
    this.activeclients = [];
    let OrgId = localStorage.getItem("OrgId");
    this.settingsService.getActiveClientDetailsByOrgId(OrgId).subscribe(
      (data) => {
        if (data.map.statusMessage == "Success") {
          let response: any[] = JSON.parse(data.map.data);
          if (response.length > 0) {
            this.activeclients = response;
            this.count_str = this.activeclients.length + " active clients";
          } else {
            this.count_str = "0 active clients";
          }
        } else {
          this.count_str = "0 active clients";
        }
        this.spinner.hide();
      },
      (error) => {
        this.router.navigate(["/404"]);
        this.spinner.hide();
      }
    );
  }

  inactiveClientDetails: any[];
  inactiveClient: boolean = false;
  getInactiveClientDetails() {
    this.spinner.show();
    let OrgId = localStorage.getItem("OrgId");
    this.settingsService.getInactiveClientDetailsByOrgId(OrgId).subscribe(
      (data) => {
        this.utilsService.sendClickEvent();
        if (data.map.statusMessage == "Success") {
          let response = JSON.parse(data.map.data);
          if (response.length > 0) {
            this.inactiveClientDetails = response;
            this.count_str =
              this.inactiveClientDetails.length + " inactive clients";
          } else {
            this.count_str = "0 inactive clients";
          }
          this.spinner.hide();
        } else {
          this.count_str = "0 inactive clients";
        }
      },
      (error) => {
        this.router.navigate(["/404"]);
        this.spinner.hide();
      }
    );
  }

  togglecards(card) {
    this.activecard = card;
  }


 
}
