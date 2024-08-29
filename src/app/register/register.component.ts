import { JsonPipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, MaxLengthValidator, Validators, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatCheckbox } from '@angular/material/checkbox';
import { NavigationEnd, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ManagePricingPlanService } from '../services/super-admin/manage-pricing-plan/manage-pricing-plan.service';
import { RegisterService } from '../services/register.service';
import { SettingsService } from '../services/settings.service';
import { ManageOrgService } from 'src/app/services/super-admin/manage-org/manage-org.service';
import { UtilService } from '../services/util.service';
import { RegisterCommonDialogComponent } from './register-common-dialog/register-common-dialog.component';
import { errorMessage, alreadyExistMessage, invalidFormat, minLengthMessage, validFormat, passwordNotMatch, minLength_3_char } from '../util/constants';
// import { RecaptchaComponent } from 'ng-recaptcha';
import { environment } from 'src/environments/environment';
import { ReplaySubject, Subject } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';
import moment from 'moment';
import { NotificationService } from '../services/notification.service';
import { CacheService } from '../services/catche.service';
// import { NgxTurnstileModule, NgxTurnstileFormsModule } from "ngx-turnstile";


@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.less']
})
export class RegisterComponent implements OnInit {

  requiredMessage = errorMessage;
  existMessage = alreadyExistMessage;
  invalidFormat = invalidFormat;
  minLengthMsg = minLengthMessage;
  minLengthMsg_Name = minLength_3_char;
  validMsg = validFormat;
  passwordNotMatch = passwordNotMatch;
  registerForm: UntypedFormGroup;
  hide = true;
  passwordHide = true;
  visibility = 'visibility_off';
  confirmVisible = 'visibility_off';
  mailCheck: any = [];
  mailExists: boolean = false;
  mailCheckForOrg: any = [];
  mailExistsOrg: boolean = false;
  TrialCheckbox: boolean = false;
  TrailData: number[] = [0, 0];
  trialDays: string = "0";
  checkTerms: boolean = true;
  public pricingarr: any = [];
  modifiedstring: any;
  loginurl: string;
  loginstr: string;
  login_str: any;
  countryCodeDetails: any[] = [];
  codes: any;
  superadminId : any;
  emp_id: any;
  company_name: any;
  weekDays:any[] = [
    { 'id': 1, 'day': 'Monday' },
    { 'id': 2, 'day': 'Tuesday' },
    { 'id': 3, 'day': 'Wednesday' },
    { 'id': 4, 'day': 'Thursday' },
    { 'id': 5, 'day': 'Friday' }];

    siteKey:string = "";
    turnstileWidth = '320px';

    
  // siteKey: string = environment.recaptcha.siteKey;

  public countrycodeFilterCtrl: UntypedFormControl = new UntypedFormControl();
  public filteredcountrycode : ReplaySubject<any[]> = new ReplaySubject<any[]>(1);
  public countrycodeCtrl: UntypedFormControl = new UntypedFormControl("", [Validators.required]);
  
  protected aFormGroup: FormGroup;
  constructor(private formBuilder: UntypedFormBuilder,
    public registerService: RegisterService,
    private utilsService: UtilService,
    private router: Router,
    private settingsService: SettingsService,
    private manageOrgService: ManageOrgService,
    private spinner: NgxSpinnerService,
    private dialog: MatDialog,
   private notificationService: NotificationService,private cacheService: CacheService,
    private managePricingPlanService: ManagePricingPlanService) {
    this.registorformgroup();
    // for to get a current webpage url
    this.loginurl = window.location.href;
    this.modifiedstring = this.loginurl.slice(0, this.loginurl.length - 13);
    this.loginstr = "login";
    this.login_str = this.modifiedstring.concat(this.loginstr.toString());
    this.siteKey = environment.cloudFlareSiteKey;
  }

  // @ViewChild('captchaElem') captchaElem: RecaptchaComponent;

  protected _onDestroy = new Subject<void>();
  ngOnInit() {
    
    this.getAllPlanDetails();
    // this.getTrialDetails();
   localStorage.setItem("SAId","1");
    this.getAllEmployeeDetailsToGetEmail();
    this.getAllOrgdetails();
    this.getCountryTelCode();


    // this.aFormGroup = this.formBuilder.group({
    //   recaptcha: ['', Validators.required]
    // });
  }

  // sendCaptchaResponse(captchaResponse: string) {
  // console.log(`Resolved captcha with response: ${captchaResponse}`);
  // }

  registorformgroup() {
    this.registerForm = this.formBuilder.group({
      first_name: ['',
        [Validators.minLength(3),
        Validators.maxLength(60),
        Validators.pattern(/^[a-zA-Z](.*[a-zA-Z])?$/),]],
      last_name: [''],
      email: ['', [Validators.required, Validators.email, Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{1,10}$(.*[a-zA-Z])?$')]],
      company_name: ['', [Validators.required]],
      pricing: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6), Validators.pattern(/^(\s+\S+\s*)*(?!\s).*$/), this.noWhitespaceValidator]],
      cnfm_password: ['', [Validators.required]],
      mobilenumber:['', [Validators.required, Validators.pattern(/^(?!(\d)\1+$)(?:\(?\+\d{1,3}\)?[- ]?|0)?\d{10}$/)]],
      // countrycodes:['', [Validators.required]],
      recaptcha: [''],
    }, { validator: this.checkPasswords });
  }
  // siteKey: string  = "";
  // Emptyspace validator function
  public noWhitespaceValidator(control: UntypedFormControl) {
    const isSpace = (control.value || '').match(/\s/g);
    return isSpace ? { 'whitespace': true } : null;
  }
  checkPasswords(group: UntypedFormGroup) {
    const pass = group.controls.password.value;
    const confirmPass = group.controls.cnfm_password.value;

    return pass === confirmPass ? null : { notSame: true };
  }

  public checked: UntypedFormControl = new UntypedFormControl("", [Validators.required]);

  // resetform
  resetform() {
    this.registerForm.reset();
  }

  //add unique settings module
  addSettings() {
    for (var i = 0; i < this.modified_plan_module.length; i++) {
      if (this.modified_plan_module[i] == "project/jobs") {
        this.modified_plan_module.splice(i + 1, 0, "client-settings");
        i = i + 1;
      } else if (this.modified_plan_module[i] == "time-tracker") {
        this.modified_plan_module.splice(i + 1, 0, "time-tracker-settings");
        i = i + 1;
      }
      else if (this.modified_plan_module[i] == "leave-tracker") {
        this.modified_plan_module.splice(i + 1, 0, "leave-tracker-settings");
        i = i + 1;
      }
      else if (this.modified_plan_module[i] == "attendance") {
        this.modified_plan_module.splice(i + 1, 0, "attendance-settings");
        i = i + 1;
      }
      else if (this.modified_plan_module[i] == "day-planner") {
        this.modified_plan_module.splice(i + 1, 0, "my-day-planner");
        this.modified_plan_module.splice(i + 2, 0, "day-planner-settings");
        i = i + 2;
      }
      else if(this.modified_plan_module[i] == "company-policy"){
        this.modified_plan_module.splice(i+1,0,"company-policy-settings");
        i=i+1;
      }
    }
  }


  // public addclient(form: FormGroup): void {
  //   if (form.invalid) {
  //     for (const control of Object.keys(form.controls)) {
  //       form.controls[control].markAsTouched();
  //     }
  //     return;
  //   }

  //   this.recaptchaV3Service.execute('importantAction')
  //   .subscribe((token: string) => {
  //     console.debug(`Token [${token}] generated`);
  //   });
  // }

  url: any = [];
  // add clients from register form
  async addclient() {
    this.spinner.show();
    this.addSettings();
    this.url = window.location.href;
    this.url = this.url.split("/");
    let formdata = {
      "firstname": this.registerForm.value.first_name,
      "lastname": this.registerForm.value.last_name,
      "email": this.registerForm.value.email,
      "company_name": this.registerForm.value.company_name,
      "password": this.registerForm.value.cnfm_password,
      "plan": this.registerForm.value.pricing,
      "status": this.TrialCheckbox ? "Trial" : "Created",
      "plan_id": this.selected_plan_id,
      "login_str": this.login_str,
      "modules": JSON.stringify(this.modified_plan_module),
      "login_mobilenumber":this.registerForm.value.mobilenumber,
      "country_code":this.countrycodeCtrl.value,
      "url": this.url[2],
      "working_days":JSON.stringify(this.weekDays)
    }
    await this.registerService.createClientDetails(formdata).subscribe(data => {
      if(data.map.statusMessage == "Success" && data.map.Error == "Error in creating org details due to mail configuration check the configuration details") {
       let response = data.map.data;
        this.emp_id = response.emp_id;
        this.company_name = response.company_name;        
         this.resetform();
        this.spinner.hide();
        if (this.TrialCheckbox) {
          this.utilsService.openSnackBarAC("Your Trial account has been created! please check the email for further updates", "OK");
        }
        else {
          this.utilsService.openSnackBarAC("Your account has been successfully created. It will be approved by the admin within 7 working days. Please check your email for further updates", "OK");
        this.notification();
        this.notificationWithEmailMsg();
          // this.utilsService.openSnackBarAC("Your account has been created! account will be verified by the admin, please check the email for further updates", "OK");
        }
        this.checkTerms = false;
        setTimeout(() => {
          
          localStorage.setItem('OrgId', data.map.data.org_id);
          localStorage.setItem('Role', "org_admin");
          if (data.map.data.plan === "Trial plan") {
             this.router.navigate(["/login"]);
          }
          else{
            window.open("https://tcube.io/#/", "_blank");
            // this.router.navigate(["/payments"]);
          }          
        }, 4000);
      } else  if(data.map.statusMessage == "Success") {
        this.resetform();
        this.spinner.hide();
        this.notification();
        if (this.TrialCheckbox) {
          this.utilsService.openSnackBarAC("Your Trial account has been created! please check the email for further updates", "OK");
        }
        else {
          this.utilsService.openSnackBarAC("Your account has been successfully created. It will be approved by the admin within 7 working days. Please check your email for further updates", "OK");
          // this.utilsService.openSnackBarAC("Your account has been created! account will be verified by the admin, please check the email for further updates", "OK");
        }
        this.checkTerms = false;
        setTimeout(() => {
          
          localStorage.setItem('OrgId', data.map.data.org_id);
          localStorage.setItem('Role', "org_admin");
          if (data.map.data.plan === "Trial plan") {
             this.router.navigate(["/login"]);
          }
          else{
            window.open("https://tcube.io/#/", "_blank");
            // this.router.navigate(["/payments"]);
          }          
        }, 4000);
      }
      else {
        setTimeout(() => {
          this.spinner.hide();
        }, 1000);
        this.utilsService.openSnackBarMC("Failed to register", "OK");
      }
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
    })
  }
  // sending notification once new org is created
  async notification() {
    this.spinner.show();
    let zone = moment.tz.guess();
    let message =
      "New organization '"+ this.company_name +"' is registered";
    let formdata = {
      "org_id": 1,
      "message": message,
      "to_notify_id": 1,
      "notifier":  this.emp_id,
      "module_name": "Register",
      "sub_module_name": "Register",
      "keyword": "new-org-created",  
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
  // If having invalid mail sned notification to SA with "Resend Mail" button
 async notificationWithEmailMsg() {
    this.spinner.show();
    let zone = moment.tz.guess();
    let message =
    "Mail configuration issue encountered while creating "+ this.company_name+".";
    let formdata = {
      "org_id": 1,
      "message": message,
      "to_notify_id": 1 ,
      "notifier":  this.emp_id,
      "module_name": "Register",
      "sub_module_name": "Register",
      "keyword": "resgister-mail-issue",  
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
  // Get Trail details 
  getTrialDetails() {
    this.spinner.show();

    this.registerService.getTrialDetails().subscribe(data => {

      if (data.map.statusMessage == "Success") {
        this.TrailData = JSON.parse(data.map.data);
      }
      else {
        this.TrailData = [0, 0];
      }
      this.spinner.hide();
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
  confirmHidePassword() {
    this.passwordHide = !this.passwordHide;
    if (this.passwordHide == true) {
      this.confirmVisible = 'visibility_off';
    } else {
      this.confirmVisible = 'visibility';
    }
  }

  // --------------mail check function for org details------------------------
  getAllOrgdetails() {
    this.spinner.show();
    this.manageOrgService.getAllOrgDetails().subscribe(data => {
      if (data.map.statusMessage == "Success") {
        let response: any[] = JSON.parse(data.map.data)
        for (let i = 0; i < response.length; i++) {
          this.mailCheckForOrg.push(response[i].email);
        }

        this.spinner.hide();
      } else {
        this.spinner.hide();
      }

    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
    })
  }

  getAllEmployeeDetailsToGetEmail() {
    this.settingsService.getAllEmpDetailsByEmail().subscribe(data => {
      if (data.map.statusMessage == "Success") {
        let res = JSON.parse(data.map.data);
        // this.mailCheck.push(res);
        this.mailCheck = res;
      }
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
    })
  }

  mailchange(event) {
    this.mailExists = false;
    this.mailExistsOrg = false;
    if (this.mailCheckForOrg.includes(event)) {
      this.mailExistsOrg = true;
    }
    else if (this.mailCheck.includes(event)) {
      this.mailExists = true;
    }
  }

  openTandC() {
    this.dialog.open(RegisterCommonDialogComponent, {
      height: '500px',
      width: '70%',
      panelClass: 'custom-viewdialogstyle',
      data: ["Terms and Conditions"]
    });
  }

  checkevent(event: MatCheckbox) {
    this.checkTerms = true;
    if (event.checked == true) {
      this.checkTerms = false;
    }
  }

  selected_plan_module: any[] = [];
  modified_plan_module: any[];
  selected_plan_id: number;
  openpricingdetails() {
    if (this.registerForm.value.pricing === "Trial plan") {
      this.TrialCheckbox = true;
    }
    else {
      this.TrialCheckbox = false;
    }
    this.selected_plan_module = [];
    this.modified_plan_module = [];
    let heading = this.registerForm.value.pricing + " - " + "Pricing details";
    let plandetails: any = [];
    for (var i = 0; i < this.allplandetails.length; i++) {
      if (this.registerForm.value.pricing == this.allplandetails[i].plan) {
        plandetails.push(this.allplandetails[i]);
        this.selected_plan_module.push(this.allplandetails[i].modules);
        this.modified_plan_module = this.allplandetails[i].modules
        this.selected_plan_id = this.allplandetails[i].id;
      }
    }
    const dialogref = this.dialog.open(RegisterCommonDialogComponent, {
      width: '30%',
      panelClass: 'custom-viewdialogstyle',
      autoFocus: false,
      data: [heading, plandetails]
    });
    dialogref.afterClosed().subscribe((result) => {
      if (result.data == 'Cancel') {
        this.registerForm.controls['pricing'].reset();
        this.TrialCheckbox = false;
      }
    });
  }

  allplandetails: any = [];
  getAllPlanDetails() {
    this.spinner.show();
    this.allplandetails = [];
    this.managePricingPlanService.getAllPlanDetails().subscribe(data => {
      if (data.map.statusMessage == "Success") {
        let response: any[] = JSON.parse(data.map.data);
        this.allplandetails = response;
        for (var i = 0; i < this.allplandetails.length; i++) {
          let word = this.allplandetails[i].currency;
          this.allplandetails[i].currency = word.split(' ').pop();
          this.allplandetails[i].modules = JSON.parse(this.allplandetails[i].modules);
          this.pricingarr.push({ "name": this.allplandetails[i].plan, "id": this.allplandetails[i].id });
          if (this.allplandetails[i].plan == "Trial plan") {
            this.trialDays = this.allplandetails[i].days;
          }
        }
      }
      else {
      }
      this.spinner.hide();
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
    })
  }
  privacypolicy() {
    this.router.navigate(["/privacy-policy"]);
  }

  TrialClick(trail) {
    this.TrialCheckbox = trail.currentTarget.checked
    if (this.TrialCheckbox) {
      this.registerForm.controls['pricing'].setValue("Trial plan");
      for (var i = 0; i < this.allplandetails.length; i++) {
        if (this.registerForm.value.pricing == this.allplandetails[i].plan) {
          this.selected_plan_module.push(this.allplandetails[i].modules);
          this.modified_plan_module = this.allplandetails[i].modules
          this.selected_plan_id = this.allplandetails[i].id;
        }
      }
    }
    else {
      this.registerForm.controls['pricing'].setValue("");
    }
  }
  // To get country codes from db
  selectedCountry: string;
  onCountryChange(event:any) {
    this.selectedCountry = event.target.telcode;
  }
      //To get all country code from database
  getCountryTelCode() {
    return new Promise<void>((resolve, reject) => {
      this.settingsService.getCountryTelCode().subscribe(data => {
        if (data.map.statusMessage == "Success") {
          let response = JSON.parse(data.map.data);
            this.countryCodeDetails = response;    
            
            // load the initial code list
            this.filteredcountrycode.next(this.countryCodeDetails.slice());
      
            // listen for search field value changes
            this.countrycodeFilterCtrl.valueChanges
              .pipe(takeUntil(this._onDestroy))
              .subscribe(() => {
                this.filterCountryCodes();
              });
            }
            resolve();
          }, (error) => {
            reject(error);
          })
        });   
      }
      protected filterCountryCodes() {
        if (!this.countryCodeDetails) {
          return;
        }
        // get the search keyword
        let search = this.countrycodeFilterCtrl.value;
        if (!search) {
          this.filteredcountrycode.next(this.countryCodeDetails.slice());
          return;
        } else {
          search = search.toLowerCase();
        }
        if((isNaN(search))) {
          this.filteredcountrycode.next(
            this.countryCodeDetails.filter(code => code.country.toLowerCase().indexOf(search) > -1)
          );
          } else if(!(isNaN(search))){
            this.filteredcountrycode.next(
              this.countryCodeDetails.filter(code => code.telcode.toLowerCase().indexOf(search) > -1)
            );
          }
      }
// To show the telcode by selected id
selectedTelcode(telcode) {
    let temp = this.countryCodeDetails.find(x => x.id == telcode);
    this.codes = temp.telcode;    
  }


  redirectLogin(){
     // Clear local storage
    //  localStorage.clear();

    //  // Clear session storage
    //  sessionStorage.clear();

    // this.clearCookies();

    // // Clear HTTP cache
    // this.cacheService.clearCache();

    this.router.navigate(["/login"]);

    // setTimeout(() =>{window.location.reload()});
  }

  clearCookies() {
    const cookies = document.cookie.split(";");

    for (const cookie of cookies) {
      const eqPos = cookie.indexOf("=");
      const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
      document.cookie = name + `=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
    }
  }


}
