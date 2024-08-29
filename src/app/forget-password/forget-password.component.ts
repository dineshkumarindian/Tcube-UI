import { Component, OnInit, ViewChild } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, Validators, UntypedFormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ForgetPasswordService } from '../services/forget-password.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { AuthenticateService } from '../services/authenticate.service';
import { UtilService } from '../services/util.service';
import {errorMessage,invalidFormat,passwordNotMatch,minLengthMessage} from '../util/constants';
import moment from 'moment';
import { EmployeeService } from '../services/employee.service';
import { NotificationService } from '../services/notification.service';
// import { NgOtpInputModule } from 'ng-otp-input';

@Component({
  selector: 'app-forget-password',
  templateUrl: './forget-password.component.html',
  styleUrls: ['./forget-password.component.less']
})
export class ForgetPasswordComponent implements OnInit {
  invalidFormatMsg =  invalidFormat;
  minLengthMessage = minLengthMessage;
  passwordNotMatch = passwordNotMatch;
  emailform: UntypedFormGroup;
  otpform: UntypedFormGroup;
  // passwordform : FormGroup;
  loginurl: string;
  modifiedstring: string;
  loginstr: string;
  login_str: string;
  requiredMessage = errorMessage;
  isForgotPassword:boolean = true;
  isConfirmPassword:boolean = true;
  userEmailId:any;
  enteredOtp: any[] = [];
  otp:any;
  concatenatedOtp:any;
  hideNewPwd = true;
  hideConfirmPwd = true;
  isNewPasswordMatched: boolean = false;
  display: any;
  resendOtp: boolean = false;
  displayTimer: boolean = false;
  employeeDetails: any;

  constructor(private router: Router, private formBuilder: UntypedFormBuilder, private utilService: UtilService,
    private forgetpasswordservice: ForgetPasswordService,  private activatedRoute: ActivatedRoute,
    private auhtenticateService: AuthenticateService, private spinner: NgxSpinnerService,private notificationService: NotificationService,
  private employeeService: EmployeeService) {
    this.emailformgroup();
    this.otpFormGroup();
    // this. confirmPasswordFormGroup();
    // for to get a current webpage url
    this.loginurl = window.location.href;
    this.modifiedstring = this.loginurl.slice(0, this.loginurl.length - 15);
    this.loginstr = "login";
    this.login_str = this.modifiedstring.concat(this.loginstr.toString());
  }
  //****************VALIDATION FOR EMAIL STARTS****************//
  emailformgroup() {
    this.emailform = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }
  otpFormGroup() {
    this.otpform = this.formBuilder.group({
      otpBox1: ['',[Validators.required]],
      otpBox2: ['',[Validators.required]],
      otpBox3: ['',[Validators.required]],
      otpBox4: ['',[Validators.required]],
      otpBox5: ['',[Validators.required]],
      otpBox6: ['',[Validators.required]],
    });
  }
  // confirmPasswordFormGroup() {
    passwordform: UntypedFormGroup = this.formBuilder.group({
      newpassword: ['', [Validators.required , Validators.minLength(6), this.noWhitespaceValidator]],
      confirmpassword: ['', [Validators.required, Validators.minLength(6), this.noWhitespaceValidator]]
    },
    { validators: [this.checkPasswords] },
    )

  // Emptyspace validator function
  public noWhitespaceValidator(control: UntypedFormControl){
    const isSpace = (control.value || '').match(/\s/g);
    return isSpace ? {'whitespace': true} : null;
  }

  //compare new password and confirm password
  checkPasswords(group: UntypedFormGroup) {
    const pass = group.controls.newpassword.value;
    const confirmPass = group.controls.confirmpassword.value;
  
     return pass === confirmPass ? null : { notSame: true };
    
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
  //****************VALIDATION FOR EMAIL ENDS****************//
  ngOnInit() {
    localStorage.setItem("SAId","1");
    this.isForgotPassword =true;
    this.isConfirmPassword = false;
    // if( this.displayTimer = true && (this.resendOtp = false)) {
    this.startCountdown();
  // }
}
startCountdown() {    
    this.displayTimer = true;
    this.resendOtp = false;
    this.otpform.reset();
    let minute = 2;
    let seconds = minute * 60;
    let textSec: any = '0';
    let statSec = 60;

    const prefix = minute < 10 ? '0' : '';

    const timer = setInterval(() => {
      seconds--;
      if (statSec != 0) statSec--;
      else statSec = 59;

      // if (statSec < 10) textSec = "0" + statSec;
      // textSec = statSec;

      if (statSec < 10) {
        // console.log('inside', statSec);
        textSec = '0' + statSec;
      } else {
        // console.log('else', statSec);
        textSec = statSec;
      }

      // this.display = prefix + Math.floor(seconds / 60) + ":" + textSec;
      this.display = `${prefix}${Math.floor(seconds / 60)}:${textSec}`;

      if (seconds == 0) {
        // console.log('finished');
        clearInterval(timer);
        this.resendOtp = true;
        this.displayTimer = false;
      
    // this.sendmail(localStorage.getItem('loginEmailId'));
        if(localStorage.getItem('loginEmailId') != null) {
    let formdata = {
      "to": localStorage.getItem('loginEmailId'),
      "login_str": this.login_str
    }
    this.forgetpasswordservice.sendMailToEmployee(formdata).subscribe(data => {
      if (data.map.statusMessage === "Success") {
        setTimeout(() => {
          /** spinner ends after 1 second */
          this.spinner.hide();
        }, 1000);
        this.utilService.openSnackBarAC(data.map.data, "OK");
        setTimeout(() => {
        }, 2000);
      } 
      else {
          // this.router.navigate(['/login']);
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
}, 1000);
  }
  showOrHidePassword(password) {
   if (password === 'newpassword') {
      this.hideNewPwd = !this.hideNewPwd;
    }
    else {
      this.hideConfirmPwd = !this.hideConfirmPwd;
    }
  }

  //****************SERVICE CALL FOR FORGET PASSWORD ****************//
  sendmail(emailid: any) {
    this.spinner.show();
    // if(localStorage.getItem('Role') != "org_admin") {
    // this.isForgotPassword =true;
  //   this.isConfirmPassword = false;
  //  this.isForgotPassword = true;
    let formdata = {
      "to": emailid.email,
      "login_str": this.login_str
    }
    // this.resendOtp = true;
    this.forgetpasswordservice.sendMailToEmployee(formdata).subscribe(async data => {
      if (data.map.statusMessage === "Success") {
        setTimeout(() => {
          /** spinner ends after 1 second */
          this.spinner.hide();
        }, 1000);
        this.utilService.openSnackBarAC(data.map.data, "OK");
        setTimeout(() => {
          this.isConfirmPassword = false;
          this.isForgotPassword = false;
           localStorage.setItem("loginEmailId",emailid.email);
        }, 2000);
      } else if(data.map.statusMessage === "Error" && data.map.data === "Mail configuration issue encountered, please contact our sales team") {
            this.spinner.hide();
        this.utilService.openSnackBarMC(data.map.data, "OK");
        setTimeout(() => {
        this.router.navigate(['/login']);
        }, 2000);
      this.getEmpDetails();
      }
      else {
        setTimeout(() => {
          /** spinner ends after 1 second */
          this.spinner.hide();
        }, 1000);
        this.utilService.openSnackBarMC(data.map.data, "OK");
          this.isConfirmPassword = false;
          this.isForgotPassword = true;
          // this.sendMailSA(emailid);  // For SA still forgot password was not implemented
      }
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
    });
  }
 async getEmpDetails(){
  await this.employeeService.getEmployeeDetails(this.emailform.value.email).subscribe(data => {
    if (data.map.statusMessage === "Success") {
      this.employeeDetails = JSON.parse(data.map.data);  
      this.notificationWithEmailMsg();       
    }
   }) 
 }
  sendMailSA(emailid: any) {
    this.spinner.show();
    let formdata = {
      "to": emailid.email
    }
    this.forgetpasswordservice.sendMailToSA(formdata).subscribe(data => {
      if (data.map.statusMessage === "Success") {
        setTimeout(() => {
          /** spinner ends after 1 second */
          this.spinner.hide();
        }, 1000);
        this.utilService.openSnackBarAC(data.map.data, "OK");
        setTimeout(() => {
          // this.router.navigate(['/login']);
          this.isConfirmPassword = false;
          this.isForgotPassword = false;
        }, 2000);
      } else {
        setTimeout(() => {
          /** spinner ends after 1 second */
          this.spinner.hide();
        }, 1000);
        this.utilService.openSnackBarMC(data.map.data, "OK");
        this.isForgotPassword = true;
        this.isConfirmPassword = false;
      }
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
    });
  }
  // OTP verification for employee
  otpVerification(otp:any) {
    this.spinner.show();
    this.isConfirmPassword = false;
    this.isForgotPassword = false;
    this.otp = `${this.otpform.get('otpBox1').value} ${this.otpform.get('otpBox2').value} ${this.otpform.get('otpBox3').value} ${this.otpform.get('otpBox4').value} ${this.otpform.get('otpBox5').value} ${this.otpform.get('otpBox6').value}`;
    this.concatenatedOtp = this.otp.replace(/\s/g, "");;
    let formdata = {
      "mailId" :     localStorage.getItem("loginEmailId"),
      "otp"     :   this.concatenatedOtp,
    }
    this.forgetpasswordservice.userOtpVerification(formdata).subscribe(data => {
      if (data.map.statusMessage === "Success") {
        setTimeout(() => {
          /** spinner ends after 1 second */
          this.spinner.hide();
        }, 1000);
        this.utilService.openSnackBarAC(data.map.data, "OK");  
        this.isConfirmPassword = true;
        this.isForgotPassword = false;    
  } else {
    setTimeout(() => {
      /** spinner ends after 1 second */
      this.spinner.hide();
    }, 1000);
    this.utilService.openSnackBarMC(data.map.data, "OK");
    this.resetOtpField();
  }
}, (error) => {
  this.router.navigate(["/404"]);
  this.spinner.hide();
});
}

// OTP Verification for Super Admin
superadminOtpVerification() {
  this.spinner.show();
  this.isConfirmPassword = false;
  this.isForgotPassword = false;
  this.otp = `${this.otpform.get('otpBox1').value} ${this.otpform.get('otpBox2').value} ${this.otpform.get('otpBox3').value} ${this.otpform.get('otpBox4').value} ${this.otpform.get('otpBox5').value} ${this.otpform.get('otpBox6').value}`;
  this.concatenatedOtp = this.otp.replace(/\s/g, "");;
  let formdata = {
    "mailId" :     localStorage.getItem("loginEmailId"),
    "otp"     :   this.concatenatedOtp,
  }
  this.forgetpasswordservice.superadminOtpVerification(formdata).subscribe(data => {
    if (data.map.statusMessage === "Success") {
      setTimeout(() => {
        /** spinner ends after 1 second */
        this.spinner.hide();
      }, 1000);
      this.utilService.openSnackBarAC(data.map.data, "OK");  
      this.isConfirmPassword = true;
      this.isForgotPassword = false;    
} else {
  setTimeout(() => {
    /** spinner ends after 1 second */
    this.spinner.hide();
  }, 1000);
  this.utilService.openSnackBarMC(data.map.data, "OK");
  this.resetOtpField();
}
}, (error) => {
this.router.navigate(["/404"]);
this.spinner.hide();
});
}
// reset the OTP field if its wrong
resetOtpField() {
  this.isForgotPassword = false;
  this.isConfirmPassword = false;
}
// OTP separate square box
  onInputEntry(event, nextInput) {
    let input = event.target;
    let length = input.value.length;
    let maxLength = input.attributes.maxlength.value;

    if (length >= maxLength) {
      nextInput.focus();
    }
  }

  // New and Confirm Password for emp and Super Admin
  changePassword(password:any) {
    this.spinner.show();
    this.isConfirmPassword = true;
    this.isForgotPassword = false;
    if (this.passwordform.value.newpassword !== this.passwordform.value.confirmpassword) {
      setTimeout(() => {
        /** spinner ends after 1 second */
        this.spinner.hide();
      }, 1000);
      this.isNewPasswordMatched = true;
      return;
    }
    let formdata = {
      "email" :  localStorage.getItem("loginEmailId"),
      "newpassword" : this.passwordform.value.confirmpassword ,
    }
      this.forgetpasswordservice.updateNewpassword(formdata).subscribe(data => {
        if (data.map.statusMessage === "Success") {
          setTimeout(() => {
            localStorage.removeItem("loginEmailId");
            this.router.navigate(['/'], { replaceUrl: true });
            this.spinner.hide();
          }, 1000);
          this.utilService.openSnackBarAC(data.map.data, "OK");  
    } else {
      setTimeout(() => {
        this.spinner.hide();
      }, 1000);
      this.utilService.openSnackBarMC(data.map.data, "OK");
      this.isForgotPassword = false;
      this.isConfirmPassword = true;
    }
  }, (error) => {
    this.router.navigate(["/404"]);
    this.spinner.hide();
  });
  }
  // If having invalid mail sned notification to SA with "Resend Mail" button
 async notificationWithEmailMsg() {
    this.spinner.show();
    let zone = moment.tz.guess();
    let message =
    "Mail configuration issue encountered  "+this.employeeDetails.id+" is trying for resetting password.";
    let formdata = {
      "org_id": 1,
      "message": message,
      "to_notify_id": 1 ,
      "notifier":  this.employeeDetails.id,
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
