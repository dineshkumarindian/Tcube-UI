import { Component, OnInit } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, Validators, UntypedFormBuilder, Form } from '@angular/forms';
import { Router } from '@angular/router';
import { UtilService } from '../services/util.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ChangePasswordService } from '../services/change-password.service';
import { SettingsService } from '../services/settings.service';
import { errorMessage, minLengthMessage, oldPasswordTryNewPasswordMessage, passwordNotMatch, validFormat } from '../util/constants';
import { SuperAdminDashboardService } from '../services/super-admin/SA-dashboard/super-admin-dashboard.service';
import { RegisterService } from '../services/register.service';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.less']
})
export class ChangePasswordComponent implements OnInit {
  requiredMessage = errorMessage;
  minLengthMessage = minLengthMessage;
  oldAndNewpassword = oldPasswordTryNewPasswordMessage;
  passwordNotMatch = passwordNotMatch;

  // passwordform: FormGroup;
  hideOldPwd = true;
  hideNewPwd = true;
  hideConfirmPwd = true;
  isOldPwdMatchedWithNewPwd = false;
  isNewPasswordMatched = false;
  oldPassword: String;
  validFormatMessage = validFormat;
  previousPage: string;

  constructor(private router: Router,
    private formBuilder: UntypedFormBuilder,
    private utilService: UtilService,
    private changepasswordservice: ChangePasswordService,
    private spinner: NgxSpinnerService,
    private settingService: SettingsService,
    private registerService: RegisterService) {

  }

  passwordform: UntypedFormGroup = this.formBuilder.group({
    oldpassword: ['', [Validators.required, Validators.minLength(6), Validators.pattern(/^(\s+\S+\s*)*(?!\s).*$/), this.noWhitespaceValidator]],
    newpassword: ['', [Validators.required, Validators.minLength(6), this.noWhitespaceValidator]],
    confirmpassword: ['', [Validators.required, Validators.minLength(6), this.noWhitespaceValidator]]
  },
    { validators: [this.checkPasswords] },

  );
  // Emptyspace validator function
  public noWhitespaceValidator(control: UntypedFormControl) {
    const isSpace = (control.value || '').match(/\s/g);
    return isSpace ? { 'whitespace': true } : null;
  }

  //compare new password and confirm password
  checkPasswords(group: UntypedFormGroup) {
    const pass = group.controls.newpassword.value;
    const confirmPass = group.controls.confirmpassword.value;

    return pass === confirmPass ? null : { notSame: true };

  }
  OldSpace(event: any) {
    if (event.target.selectionStart === 0 && event.code === "Space") {
      event.preventDefault();
    }
  }
  NewSpace(event: any) {
    if (event.target.selectionStart === 0 && event.code === "Space") {
      event.preventDefault();
    }
  }
  ConSpace(event: any) {
    if (event.target.selectionStart === 0 && event.code === "Space") {
      event.preventDefault();
    }
  }

  ngOnInit() {
    if(localStorage.getItem("Role") == "super_admin"){
    this.getSADetails(localStorage.getItem("SAId"));
    } else {
      this.getEmployeeById();
    }
    this.previousPage = localStorage.getItem("previousPage");
    // this.passwordformgroup();
  }
  getEmployeeById() {
    let id = localStorage.getItem("Id");
    this.settingService.getActiveEmpDetailsById(id).subscribe(data => {

      if (data.map.statusMessage == "Success") {
        let response = JSON.parse(data.map.data);
        this.oldPassword = response.password;
      }
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
    })
  }
  getSADetails(id: any) {
    this.registerService.getSADetailsById(id).subscribe((data) => {
      if (data.map.statusMessage == "Success") {
        let response = JSON.parse(data.map.data);
        this.oldPassword = response.password;
      }
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
    })
  }
  //compare old password and new password
  isNewPassword: boolean = false;
  newPassword() {
    this.isNewPassword = false;
    let value = this.passwordform.get('oldpassword').value;
    if (value == this.passwordform.get('newpassword').value && this.passwordform.get('newpassword').value != null) {
      this.isNewPassword = true;
    } else {
      this.isNewPassword = false;
    }

  }

  resetChangePassword() {
    this.isNewPassword = false;
    // this.passwordform.reset();
  }

  showOrHidePassword(password) {
    if (password === 'oldpassword') {
      this.hideOldPwd = !this.hideOldPwd;
    }
    else if (password === 'newpassword') {
      this.hideNewPwd = !this.hideNewPwd;
    }
    else {
      this.hideConfirmPwd = !this.hideConfirmPwd;
    }
  }

  changePassword() {
    this.spinner.show();
    this.isOldPwdMatchedWithNewPwd = false;
    this.isNewPasswordMatched = false;
    if (this.passwordform.value.oldpassword === this.passwordform.value.newpassword) {
      setTimeout(() => {
        /** spinner ends after 1 second */
        this.spinner.hide();
      }, 1000);
      this.isOldPwdMatchedWithNewPwd = true;
      return;
    }
    else if (this.passwordform.value.newpassword !== this.passwordform.value.confirmpassword) {
      setTimeout(() => {
        /** spinner ends after 1 second */
        this.spinner.hide();
      }, 1000);
      this.isNewPasswordMatched = true;
      return;
    }
    else {
      if (localStorage.getItem('Role') === "super_admin") {
        const formdata = {
          "id": localStorage.getItem('SAId'),
          "oldPassword": this.passwordform.value.oldpassword,
          "password": this.passwordform.value.confirmpassword
        }
        this.changepasswordservice.changePasswordForSA(formdata).subscribe(data => {
          if (data.map.statusMessage === "Success") {
            setTimeout(() => {
              /** spinner ends after 1 second */
              this.spinner.hide();
            }, 1000);
            // this.passwordform.reset();
            this.utilService.openSnackBarAC("Password updated successfully, please login with your new password", "OK");
            setTimeout(() => {
              this.router.navigate(["/login"]);
              // this.router.navigate(['/'], { replaceUrl: true });
            }, 2000);
          } else if (data.map.statusMessage != "Success") {
            setTimeout(() => {
              /** spinner ends after 1 second */
              this.spinner.hide();
            }, 1000);
            this.utilService.openSnackBarMC(data.map.data, "OK");
          }
        }, (error) => {
          this.router.navigate(["/404"]);
          this.spinner.hide();
        });
      }
      else {
        const formdata = {
          "orgId": localStorage.getItem('OrgId'),
          "id": localStorage.getItem('Id'),
          "oldPassword": this.passwordform.value.oldpassword,
          "password": this.passwordform.value.confirmpassword
        }
        this.changepasswordservice.changePasswordEmp(formdata).subscribe(data => {
          if (data.map.statusMessage === "Success") {
            setTimeout(() => {
              /** spinner ends after 1 second */
              this.spinner.hide();
            }, 1000);
            // this.passwordform.reset();
            this.utilService.openSnackBarAC("Password updated successfully, please login with your new password", "OK");
            setTimeout(() => {
              localStorage.clear();
              this.router.navigate(['/login']);
            }, 2000);
          } else if (data.map.statusMessage != "Success") {
            setTimeout(() => {
              /** spinner ends after 1 second */
              this.spinner.hide();
            }, 1000);
            this.utilService.openSnackBarMC(data.map.data, "OK");
          }
        }, (error) => {
          this.router.navigate(["/404"]);
          this.spinner.hide();
        });
      }
    }
  }
  // Back to previous Page onclick back button
  backToPreviousPage() {
    if(this.previousPage == '/dashboard') {
      this.router.navigate(['/dashboard']); 
    } else if(this.previousPage == '/time-tracker') {
      this.router.navigate(['/time-tracker']);
    }else if(this.previousPage == '/timesheets') {
      this.router.navigate(['/timesheets']);
    }else if(this.previousPage == '/approvals') {
      this.router.navigate(['/approvals']);
    }else if(this.previousPage == '/projects') {
      this.router.navigate(['/projects']);   
    }else if(this.previousPage == '/addproject') {
      this.router.navigate(['/addproject']);
    }else if(this.previousPage == '/addjobs') {
      this.router.navigate(['/addjobs']);
    }else if(this.previousPage == '/jobs') {
      this.router.navigate(['/jobs']);
    }else if(this.previousPage == '/project-jobs-settings') {
      this.router.navigate(['/project-jobs-settings']);
    }else if(this.previousPage == '/attendance') {
      this.router.navigate(['/attendance']);
    }else if(this.previousPage == '/attendancemonthlyreport') {
      this.router.navigate(['/attendancemonthlyreport']);
    }else if(this.previousPage == '/attendance-settings') {
      this.router.navigate(['/attendance-settings']);
    }else if(this.previousPage == '/leave-tracker') {
      this.router.navigate(['/leave-tracker']);
    }else if(this.previousPage == '/applyleave') {
      this.router.navigate(['/applyleave']);
    }else if(this.previousPage == '/leave-tracker-settings') {
      this.router.navigate(['/leave-tracker-settings']);
    }else if(this.previousPage == '/business_letter') {
      this.router.navigate(['/business_letter']); 
    }else if(this.previousPage == '/add-letter') {
      this.router.navigate(['/add-letter']); 
    }else if(this.previousPage == '/offer') {
      this.router.navigate(['/offer']);
    }else if(this.previousPage == '/add-offer') {
      this.router.navigate(['/add-offer']);
    }else if(this.previousPage == '/reports') { 
      this.router.navigate(['/reports']);
    }else if(this.previousPage == '/employeeattendancedatereport') {
      this.router.navigate(['/employeeattendancedatereport']);
    }else if(this.previousPage == '/userattendancereport') {
      this.router.navigate(['/userattendancereport']);
    }else if(this.previousPage == '/user-reports-leavetracker') {
      this.router.navigate(['/user-reports-leavetracker']);
    }else if(this.previousPage == '/my-day-planner') {
      this.router.navigate(['/my-day-planner']);
    }else if(this.previousPage == '/add-day-task') {
      this.router.navigate(['/add-day-task']);
    }else if(this.previousPage == '/all-day-planner') {
      this.router.navigate(['/all-day-planner']);
    }else if(this.previousPage == '/dp-settings') {
      this.router.navigate(['/dp-settings']);
    }else if(this.previousPage == '/settings') {
      this.router.navigate(['/settings']);
    }else if(this.previousPage == '/add-role') {
      this.router.navigate(['/add-role']);
    }else if(this.previousPage == '/add-designation') {
      this.router.navigate(['/add-designation']);
    }else if(this.previousPage == '/add-user') {
      this.router.navigate(['/add-user']);
    }else if(this.previousPage == '/my-profile') {
      this.router.navigate(['/my-profile']);
    }else if(this.previousPage == '/subscription') {
      this.router.navigate(['/subscription']);
    }else if(this.previousPage == '/admin_dashboard') {
      this.router.navigate(['/admin_dashboard']);
    }else if(this.previousPage == '/manage-org') {
      this.router.navigate(['/manage-org']);
    }else if(this.previousPage == '/pricing-plan') {
      this.router.navigate(['/pricing-plan']);
    }else if(this.previousPage == '/release-notes') {
      this.router.navigate(['/release-notes']);
    }

    localStorage.removeItem("previousPage");
  }
}