import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { NgxSpinnerService } from "ngx-spinner";
import { MailService } from "src/app/services/app-integration/mail-service/mail.service";
import { UtilService } from "src/app/services/util.service";
import {manageNotificationYesOption,manageNotificationNoOption} from '../../util/note-message';
import { DeleteComponent } from "src/app/util/delete/delete.component";
import { MatDialog } from "@angular/material/dialog";
@Component({
  selector: "app-mail-configuration",
  templateUrl: "./mail-configuration.component.html",
  styleUrls: ["./mail-configuration.component.less"],
})
export class MailConfigurationComponent implements OnInit {
  yesOrNoOption = ["Yes", "No"];
  ismailconfigured: boolean;
  mailConfigureYesOrNo:boolean = false;
  configData: any;
  NotifyMail: string = "No";
  isNotify: string = "No";
  show: boolean = false;
  mailConfigNoteMessage = manageNotificationNoOption;
  constructor(
    private mailService: MailService,
    private router: Router,
    private utilsService: UtilService,
    private spinner: NgxSpinnerService,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.getMailConfigByOrg();
  }
 
  getMailConfigByOrg() {
    this.spinner.show();
    let OrgId = localStorage.getItem("OrgId");
    // this.mailConfigureYesOrNo = false;
    // console.log(this.mailConfigureYesOrNo);
    this.mailService.getMailConfigByOrg(OrgId).subscribe(
      (data) => {
        if (data.map.statusMessage == "Success") {
          this.ismailconfigured = true;
          this.configData = JSON.parse(data.map.data);
          if (this.configData.isActive == true) {
            this.isNotify = "Yes";
            this.NotifyMail = "Yes";
            this.mailConfigNoteMessage = manageNotificationYesOption; 
            
          } else {
            this.isNotify = "No";
            this.NotifyMail = "No";
            this.mailConfigNoteMessage = manageNotificationNoOption;
           
          }
          this.show=true;
          this.mailConfigureYesOrNo = false;
        } else {
          this.ismailconfigured = false;
          this.show=true;
        }
        this.spinner.hide();
      },
      (error) => {
        this.router.navigate(["/404"]);
        this.spinner.hide();
      }
    );
  }

  editconfig() {
    this.router.navigate([
      "/edit-mail-configuration" + "/" + this.configData.id,
    ]);
  }

  UpdateMailNotification() {
    this.spinner.show();
    let OrgId = localStorage.getItem("OrgId");
    let data: Object = {
      org_id: OrgId,
      id: this.configData.id,
      host: this.configData.host,
      port: parseInt(this.configData.port),
      username: this.configData.username,
      password: this.configData.password,
      sender: this.configData.sender,
      isActive: this.NotifyMail == "Yes" ? true : false,
      mail : localStorage.getItem("Email")
    };
    this.mailService.updateMailConfig(data).subscribe(
      (data) => {
        if (data.map.statusMessage == "Success") {
          this.utilsService.openSnackBarAC(
            "Email integration updated successfully",
            "OK"
          );
          this.ngOnInit();
        } else {
          this.utilsService.openSnackBarMC(
            "Failed to update Mail integration",
            "OK"
          );
        }
        this.getMailConfigByOrg();
        this.spinner.hide();
        
      },
      (error) => {
        this.router.navigate(["/404"]);
        this.spinner.hide();
      }
    );
  }
  deleteDialog(){
    const dialogRef = this.dialog.open(DeleteComponent, {
      width: '30%',
      panelClass: 'custom-viewdialogstyle',
      data:{key:"business-delete",showComment:false}
      // data: { id: intern_id },
    })
    dialogRef.afterClosed().subscribe(resp => {
      if(resp != undefined && resp != null){
      if (resp.data == true) {
        this.DeleteConfiguration();
      }
    }
    })
  }

  DeleteConfiguration() {
    this.spinner.show();
    this.mailService.deleteMailConfig(this.configData.id).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        this.ismailconfigured = false;
        this.utilsService.openSnackBarAC("Email integration details deleted successfully", "OK");
        this.spinner.hide();
      }
      else {
        this.spinner.hide();
        this.utilsService.openSnackBarMC("Failed to delete integration details", "OK");
      }
    },
    (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
    })
  }

  radioButtonClickedMailIntegration(event:any){
    this.mailConfigureYesOrNo = true;
    if(event.value == "Yes"){
      this.mailConfigNoteMessage = manageNotificationYesOption;
    } else {
      this.mailConfigNoteMessage = manageNotificationNoOption;
    }
    // console.log(this.mailConfigureYesOrNo);
  }
}
