import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { RegisterService } from "../services/register.service";
import { NgxSpinnerService } from 'ngx-spinner';
import { AuthenticateService } from '../services/authenticate.service';
import { UtilService } from '../services/util.service';
import { ErrorAlertDialogComponent } from '../util/error-alert-dialog/error-alert-dialog.component';
import { errorMessage, invalidFormat, validFormat, minLengthMessage } from '../util/constants';
import { BulkActDeactComponent } from '../manage-org/bulk-act-deact/bulk-act-deact.component';
import { environment } from 'src/environments/environment';
import { CacheService } from '../services/catche.service';
import { EmployeeService } from '../services/employee.service';

declare var anime: any;              // declare like this
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.less']
})
export class LoginComponent implements OnInit {
  requiredMessage = errorMessage;
  InvalidMessage = invalidFormat;
  validMessage = validFormat;
  minLengthMsg = minLengthMessage;
  loginForm: UntypedFormGroup;
  roleDetails: any;
  hide = true;
  visibility = 'visibility_off';
  siteKey: string = "";


  constructor(public router: Router,
    private registerService: RegisterService,
    private formBuilder: UntypedFormBuilder,
    private utilService: UtilService,
    private auhtenticateService: AuthenticateService,
    private spinner: NgxSpinnerService,
    private dialog: MatDialog,
    private route: ActivatedRoute,
    private cacheService: CacheService, private employeeService: EmployeeService) {
    this.loginformgroup();
    this.siteKey = environment.cloudFlareSiteKey;
  }

  loginformgroup() {
    window.addEventListener('storage', this.handleStorageChange.bind(this));
    this.loginForm = this.formBuilder.group({
      // email: ['', [Validators.required, Validators.email, Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{1,10}$')]],    
      email: ['', [this.contactValidator]],
      password: ['', [Validators.required, this.noWhitespaceValidator, Validators.minLength(6)]],
      captcha: [''],
    });
  }

  handleStorageChange(event: StorageEvent) {
    if (event.key === 'newTabId' && event.newValue === 'completed') {
      window.close();
    }
  }
  // to validate both email and mobile number in same field
  contactValidator(control: UntypedFormControl): { [key: string]: any } | null {
    const value = control.value;
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const mobileRegex = /^(\d{10}|\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3}))$/;

    if (!emailRegex.test(value) && !mobileRegex.test(value)) {
      return value ? { invalidContact: true } : null;
    }
  }
  // Emptyspace validator function
  public noWhitespaceValidator(control: UntypedFormControl) {
    const isSpace = (control.value || '').match(/\s/g);
    return isSpace ? { 'whitespace': true } : null;
  }
  sessionId: any;
  orgId: any;
  orgdetails: any;

  ngOnInit() {
    localStorage.clear();
    sessionStorage.clear();

    // this.clearCookies();

    // // Clear HTTP cache
    // this.cacheService.clearCache();
  }

  async getOrgdetailsByid() {
    this.spinner.show();
    this.registerService.getOrgDetailsById(this.orgId).subscribe(
      (data) => {
        if (data.map.statusMessage == "Success") {
          let response: any = [];
          response = JSON.parse(data.map.data);
          this.orgdetails = response;
        }
      })
  }

  // sendCaptchaResponse(captchaResponse: string) {
  //  console.log(`Resolved captcha with response: ${captchaResponse}`);
  // }

  loginSA() {
    this.spinner.show();
    let formdata = {
      "email": this.loginForm.value.email,
      "password": this.loginForm.value.password
    }
    this.auhtenticateService.authenticateSA(formdata).subscribe(data => {

      if (data.map.statusMessage == "Success") {
        let response = data.map.details;
        this.loginForm.reset();
        this.utilService.openSnackBarAC("Logged in successfully", "OK");
        localStorage.setItem('LoggedInStatus', "true");
        localStorage.setItem('Name', response.firstName);
        localStorage.setItem('SAId', response.empId);
        localStorage.setItem('SACompanyName', response.orgName);
        localStorage.setItem('Role', response.role);
        localStorage.setItem('Email', response.email);
        localStorage.setItem('OrgId', response.orgId);
        this.router.navigate(["/admin_dashboard"]);
      }
      else {
        this.loginOrgadmin(formdata);
      }

    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
    })
    setTimeout(() => {
      /** spinner ends after 2 seconds */
      this.spinner.hide();
    }, 1000);
  }

  loginOrgadmin(formdata) {
    this.spinner.show();
    this.auhtenticateService.authenticateOrgadmin(formdata).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        this.loginForm.reset();
        let response = data.map.details;
        if (data.map.details.status == "Approved") {
          this.utilService.openSnackBarAC("Logged in Successfully", "OK");
          localStorage.setItem('LoggedInStatus', "true");
          localStorage.setItem('Name', response.firstName);
          localStorage.setItem('Id', response.empId);
          localStorage.setItem('OrgName', response.orgName);
          localStorage.setItem('OrgId', response.orgId);
          localStorage.setItem('Role', response.role);
          localStorage.setItem('Email', response.email);
          setTimeout(() => {
            this.router.navigate(["/dashboard"]);
          }, 1000);
        }
        else if (data.map.details.status == "Pending") {
          setTimeout(() => {
            this.utilService.openSnackBarMC("Sorry, your account still not approved . Please check the email for the further updates.", "OK");
          }, 1000);
        }
        else if (data.map.details.status == "Rejected") {
          this.utilService.openSnackBarMC("User doesn't exist", "OK");
        }
      }
      else if (data.map.statusMessage == "Failed") {
        setTimeout(() => {
          this.spinner.hide();
        }, 1000);
        this.utilService.openSnackBarMC("User does not exist", "OK");
      }
      else {
        this.loginemployee(formdata);
      }
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
    })
  }

  loginemployee(formdata) {
    this.auhtenticateService.authenticateEmployee(formdata).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        let response = data.map.details;
        if (response.empRoleDeleted == true) {
          const dialogRef = this.dialog.open(ErrorAlertDialogComponent, {
            width: '30%',
            height: '150px',
            panelClass: 'custom-viewdialogstyle',
            data: "roleError"
          });
          dialogRef.afterClosed().subscribe(
            result => {
              this.loginForm.reset();
              this.router.navigate(['login']);
            })
        } else {
          setTimeout(() => {
            /** spinner ends after 1 seconds */
            this.spinner.hide();
          }, 1000);
          this.utilService.openSnackBarAC("Logged in successfully", "OK");
          localStorage.setItem('LoggedInStatus', "true");
          localStorage.setItem('Id', response.empId);
          localStorage.setItem('Name', response.firstName);
          if (response.role == "OrgAdmin") {
            localStorage.setItem('Role', "org_admin");
            localStorage.setItem('Email', response.email);
            localStorage.setItem('OrgId', response.orgId);
            localStorage.setItem('OrgName', response.orgName);
          } else {
            localStorage.setItem('Role', response.role);
            localStorage.setItem('Email', response.email);
            localStorage.setItem('OrgId', response.orgId);
            localStorage.setItem('OrgName', response.orgName);
          }

          this.loginForm.reset();
          setTimeout(() => {
            this.router.navigate(["/dashboard"]);
          }, 1000);
        }
      }
      else if (data.map.statusMessage == "Failed") {
        setTimeout(() => {
          /** spinner ends after 2 seconds */
          this.spinner.hide();
        }, 1000);
        this.utilService.openSnackBarMC(data.map.data, "OK");
      }
      else if (data.map.statusMessage == "Error" && data.map.statusCode == "200") {
        setTimeout(() => {
          /** spinner ends after 2 seconds */
          this.spinner.hide();
        }, 1000);
        this.utilService.openSnackBarMC("User doesn't exist", "OK");
      }
      else {
        setTimeout(() => {
          /** spinner ends after 2 seconds */
          this.spinner.hide();
        }, 1000);
        this.utilService.openSnackBarMC(data.map.data, "OK");
      }
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
    })
  }
  hidePassword() {
    this.hide = !this.hide;
    if (this.hide == true) {
      this.visibility = 'visibility_off';
    } else {
      this.visibility = 'visibility';
    }
  }

  //common authentication for User, orgAdmin and super admin
  commonAuthentication() {
    this.spinner.show();
    let formdata = {
      "email": this.loginForm.value.email,
      "password": this.loginForm.value.password
    }
    this.auhtenticateService.commonAuthentication(formdata).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        let response = data.map.details;
        localStorage.setItem('password', response.password);
        if (response.empRoleDeleted == true) {
          this.spinner.hide();
          const dialogRef = this.dialog.open(ErrorAlertDialogComponent, {
            width: '30%',
            height: '150px',
            panelClass: 'custom-viewdialogstyle',
            data: "roleError"
          });
          dialogRef.afterClosed().subscribe(
            result => {
              this.loginForm.reset();
              this.router.navigate(['login']);
            })
        }
        else {
          if (response.role == "org_admin") {
            if (response.status == "Approved" || response.status == "Trial") {
              this.loginForm.reset();
              this.utilService.openSnackBarAC("Logged in Successfully", "OK");
              localStorage.setItem('LoggedInStatus', "true");
              localStorage.setItem('Name', response.firstName);
              localStorage.setItem('Id', response.empId);
              localStorage.setItem('OrgName', response.orgName);
              localStorage.setItem('OrgId', response.orgId);
              localStorage.setItem('Role', response.role);
              localStorage.setItem('Email', response.email);
              if (response.status === "Trial") {
                localStorage.setItem('TrialAccount', "true");
              }
              setTimeout(() => {
                this.spinner.hide();
                this.router.navigate(["/dashboard"]);
              }, 1000);
            }
            else if (response.status == "Pending") {
              localStorage.setItem('OrgId', response.orgId);
              localStorage.setItem('Role', response.role);
              localStorage.setItem('LoggedInStatus', "true");
              this.router.navigate(["/payments"]);
            }
            else if (response.status == "Created") {
              setTimeout(() => {
                this.spinner.hide();
                this.utilService.openSnackBarMC("Your account has not been approved yet. Please check your email for further updates. If you have any queries, please contact sales@tcube.io", "OK");
              }, 1000);
            }
            else if (response.status == "Rejected") {
              this.spinner.hide();
              this.utilService.openSnackBarMC("User doesn't exist", "OK");
            }
          }
          else if (response.role == "super_admin") {
            this.loginForm.reset();
            setTimeout(() => {
              this.spinner.hide();
            }, 1000);
            this.utilService.openSnackBarAC("Logged in successfully", "OK");
            localStorage.setItem('LoggedInStatus', "true");
            localStorage.setItem('Name', response.firstName);
            localStorage.setItem('SAId', response.empId);
            localStorage.setItem('SACompanyName', response.orgName);
            localStorage.setItem('Role', response.role);
            localStorage.setItem('Email', response.email);
            localStorage.setItem('OrgId', response.orgId);
            this.router.navigate(["/admin_dashboard"]);

          }
          else {
            setTimeout(() => {
              this.spinner.hide();
            }, 1000);
            this.utilService.openSnackBarAC("Logged in successfully", "OK");
            localStorage.setItem('LoggedInStatus', "true");
            localStorage.setItem('Id', response.empId);
            localStorage.setItem('Name', response.firstName);
            localStorage.setItem('Role', response.role);
            localStorage.setItem('Email', response.email);
            localStorage.setItem('OrgId', response.orgId);
            localStorage.setItem('OrgName', response.orgName);
            if (response.status === "Trial") {
              localStorage.setItem('TrialAccount', "true");
            }
            this.loginForm.reset();
            setTimeout(() => {
              this.router.navigate(["/dashboard"]);
            }, 1000);
          }
        }
      }
      else if (data.map.statusMessage == "Failed") {
        setTimeout(() => {
          this.spinner.hide();
        }, 1000);
        // this.utilService.openSnackBarMC(data.map.data, "OK");
        let failedMessage: string = data.map.data;
       if(failedMessage.includes("plan is expired")){
          // let response = data.map.details;
          let email = this.loginForm.get('email').value;
          this.employeeService.getEmployeeDetails(email).subscribe(data => {
            if (data.map.statusMessage == "Success") {
              let response = JSON.parse(data.map.data);
              let roledetails = response.roleDetails.access_to;
              const accessToArray: any[] = JSON.parse(roledetails);
              if (accessToArray.includes("subscription")) {
                localStorage.setItem('LoggedInStatus', "true");
                localStorage.setItem('OrganizationPlan', "expired")
                localStorage.setItem('Name', response.firstname);
                localStorage.setItem('Id', response.id);
                localStorage.setItem('OrgName', response.orgDetails.company_name);
                localStorage.setItem('OrgId', response.orgDetails.org_id);
                localStorage.setItem('Role', response.roleDetails.role);
                localStorage.setItem('Email', response.email);
                this.router.navigate(["/subscription"]);
              } else {
                this.utilService.openSnackBarMC(failedMessage, "OK");
              }
            }
          })
        } else {
          this.utilService.openSnackBarMC(failedMessage, "OK");
        }
        
      }
      else if (data.map.statusMessage == "Error" && data.map.statusCode == "200") {
        setTimeout(() => {
          this.spinner.hide();
        }, 1000);
        this.utilService.openSnackBarMC(data.map.DATA, "OK");
      }
      else if (data.map.statusMessage == "Error" && data.map.statusCode == "500") {
        setTimeout(() => {
          this.spinner.hide();
        }, 1000);
        this.utilService.openSnackBarMC("User doesn't exist", "OK");
      }
      else {
        setTimeout(() => {
          this.spinner.hide();
        }, 1000);
        this.utilService.openSnackBarMC("Failed to authenticate", "OK");
      }
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
    })
  }
  upgradeplan(id, plan, req) {
    const dialogRef = this.dialog.open(BulkActDeactComponent, {
      width: '30%',
      // height: '235px',
      panelClass: 'custom-viewdialogstyle',
      data: { header: "upgradeRequest", id: id, plan: plan, req: req },
    });
    dialogRef.afterClosed().subscribe(
      resp => {
        if (resp.data === "Success") {
          this.router.navigate(["/payments"]);
        }
      }
    );
  }

  redirectRegister() {
    // localStorage.clear();

    // // Clear session storage
    // sessionStorage.clear();

    // this.clearCookies();

    // // Clear HTTP cache
    // this.cacheService.clearCache();

    this.router.navigate(["/user-register"]);

    // setTimeout(() =>{ window.location.reload()});
  }

  private clearCookies() {
    const cookies = document.cookie.split(";");

    for (const cookie of cookies) {
      const eqPos = cookie.indexOf("=");
      const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
      document.cookie = name + `=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
    }
  }
}
