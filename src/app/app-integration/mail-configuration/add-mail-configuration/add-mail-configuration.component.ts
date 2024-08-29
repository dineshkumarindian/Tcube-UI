import { Component, OnInit } from "@angular/core";
import { UntypedFormBuilder, UntypedFormGroup, Validators } from "@angular/forms";

import { ActivatedRoute, Router } from "@angular/router";
import { NgxSpinnerService } from "ngx-spinner";
import { ReplaySubject, Subject } from "rxjs";
import { RegisterService } from "src/app/services/register.service";
import { UtilService } from "src/app/services/util.service";
import {
  alreadyExistMessage,
  errorMessage,
  validFormat,
} from "src/app/util/constants";
import { MailService } from "src/app/services/app-integration/mail-service/mail.service";
import { IntegrationDocumentationComponent } from "src/app/general-components/integration-forms/integration-documentation/integration-documentation.component";
import { MatDialog } from "@angular/material/dialog";

@Component({
  selector: "app-add-mail-configuration",
  templateUrl: "./add-mail-configuration.component.html",
  styleUrls: ["./add-mail-configuration.component.less"],
})
export class AddMailConfigurationComponent implements OnInit {
  requiredMessage = errorMessage;
  existMessage = alreadyExistMessage;
  validFormatMessage = validFormat;
  mailCheck: any = [];
  mailUpdate: any;
  constructor(
    private formBuilder: UntypedFormBuilder,
    private mailService: MailService,
    private router: Router,
    private utilsService: UtilService,
    private spinner: NgxSpinnerService,
    private registerService: RegisterService,
    private activatedRoute: ActivatedRoute,
    public matDialog: MatDialog,
  ) {}

  /** Subject that emits when the component has been destroyed. */
  protected _onDestroy = new Subject<void>();
  //Designation formgroup
  MailFormGroup: UntypedFormGroup = this.formBuilder.group({
    Host: [
      "",
      [Validators.required, Validators.pattern(/^[^\s]+(\s+[^\s]+)*$/)],
    ],
    Port: ["", [Validators.required, Validators.pattern(/^[0-9]*$/)]],
    name: [
      "",
      [Validators.required, Validators.pattern(/^[^\s]+(\s+[^\s]+)*$/)],
    ],
    Password: [
      "",
      [Validators.required, Validators.pattern(/^[^\s]+(\s+[^\s]+)*$/)],
    ],
    sender: [
      "",
      [
        Validators.required,
        Validators.email,
        Validators.pattern("^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{1,10}$"),
      ],
    ],
  });
  ngOnInit() {
    this.mailUpdate = this.activatedRoute.snapshot.params.id;
    if (this.mailUpdate) {
      this.setFormdetails();
    }
  }

  setFormdetails() {
    let orgId = localStorage.getItem("OrgId");
    this.mailService.getMailConfigByOrg(orgId).subscribe(
      (data) => {
        if (data.map.statusMessage == "Success") {
          let response = JSON.parse(data.map.data);
          this.MailFormGroup.get("Host").setValue(response.host);
          this.MailFormGroup.get("Port").setValue(response.port);
          this.MailFormGroup.get("name").setValue(response.username);
          this.MailFormGroup.get("Password").setValue(response.password);
          this.MailFormGroup.get("sender").setValue(response.sender);
        }
      },
      (error) => {
        this.router.navigate(["/404"]);
        this.spinner.hide();
      }
    );
  }

  addMail() {
    this.spinner.show();
    let OrgId = localStorage.getItem("OrgId");
    let data: Object = {
      org_id: OrgId,
      host: this.MailFormGroup.value.Host,
      port: parseInt(this.MailFormGroup.value.Port),
      username: this.MailFormGroup.value.name,
      password: this.MailFormGroup.value.Password,
      sender: this.MailFormGroup.value.sender,
      mail : localStorage.getItem("Email")
    };
    this.mailService.createMailConfig(data).subscribe(
      (data) => {
        if (data.map.statusMessage == "Success") {
          this.utilsService.openSnackBarAC(
            "Email integration details added successfully",
            "OK"
          );
          setTimeout(() => {
            this.router.navigate(["/app-mail-configuration"]);
          }, 500);
        } else {
          this.utilsService.openSnackBarMC(
            "Failed to added integration details. Please verify the integration",
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

  UpdateMail() {
    this.spinner.show();
    let OrgId = localStorage.getItem("OrgId");
    let data: Object = {
      org_id: OrgId,
      id:this.mailUpdate,
      host: this.MailFormGroup.value.Host,
      port: parseInt(this.MailFormGroup.value.Port),
      username: this.MailFormGroup.value.name,
      password: this.MailFormGroup.value.Password,
      sender: this.MailFormGroup.value.sender,
      mail : localStorage.getItem("Email")
    };
    this.mailService.updateMailConfig(data).subscribe(
      (data) => {
        if (data.map.statusMessage == "Success") {
          this.utilsService.openSnackBarAC(
            "Email integration details updated successfully",
            "OK"
          );
          setTimeout(() => {
            this.router.navigate(["/app-mail-configuration"]);
          }, 500);
        } else {
          this.utilsService.openSnackBarMC(
            "Failed to update integration details. Please verify the integration",
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

   //to open read docs dialog
  documentationDialog() {
    let screenWidth = screen.availWidth;
    if (screenWidth <= 750) {
      const dialogRef = this.matDialog.open(IntegrationDocumentationComponent, {
        width: '90%',
        panelClass: 'custom-viewdialogstyle', data: "Mail",
      });
    } else {
      const dialogRef = this.matDialog.open(IntegrationDocumentationComponent, {
        width: '70%',
        panelClass: 'custom-viewdialogstyle', data: "Mail",
      });
    }
  }
}
