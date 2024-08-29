import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { RegisterCommonDialogComponent } from 'src/app/register/register-common-dialog/register-common-dialog.component';
import { ManageOrgService } from 'src/app/services/super-admin/manage-org/manage-org.service';
import { ManagePricingPlanService } from 'src/app/services/super-admin/manage-pricing-plan/manage-pricing-plan.service';
import { UtilService } from 'src/app/services/util.service';
import {errorMessage,alreadyExistMessage, invalidFormat} from '../../util/constants';
import { RegisterService } from '../../services/register.service';
import { ReplaySubject, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { SettingsService } from 'src/app/services/settings.service';

@Component({
  selector: 'app-add-org',
  templateUrl: './add-org.component.html',
  styleUrls: ['./add-org.component.less']
})
export class AddOrgComponent implements OnInit {
  requiredMessage = errorMessage;
  existMessage = alreadyExistMessage;
  invalidFormat = invalidFormat;
  public pricingarr:any = [];
  loginurl: string;
  modifiedstring: string;
  loginstr: string;
  login_str: string;
  TrialCheckbox : boolean = false;
  countryCodeDetails: any[] = [];
  codes: any;
  weekDays:any[] = [
    { 'id': 1, 'day': 'Monday' },
    { 'id': 2, 'day': 'Tuesday' },
    { 'id': 3, 'day': 'Wednesday' },
    { 'id': 4, 'day': 'Thursday' },
    { 'id': 5, 'day': 'Friday' }];
    public countrycodeCtrl: UntypedFormControl = new UntypedFormControl("", [Validators.required]);
    public countrycodeFilterCtrl: UntypedFormControl = new UntypedFormControl();
    public filteredcountrycode : ReplaySubject<any[]> = new ReplaySubject<any[]>(1);
  constructor(
    private manageOrgService: ManageOrgService,
    private formBuilder: UntypedFormBuilder,
    public dialogRef: MatDialogRef<AddOrgComponent>,
    private utilsService: UtilService,
    private spinner: NgxSpinnerService,
    private dialog: MatDialog,
    private router : Router,
    private managePricingPlanService: ManagePricingPlanService,
    public registerService: RegisterService, private settingsService: SettingsService,
  ) { 
     // for to get a current webpage url
     this.loginurl = window.location.href;
     this.modifiedstring = this.loginurl.slice(0, this.loginurl.length - 10);
     this.loginstr = "login";
     this.login_str = this.modifiedstring.concat(this.loginstr.toString());
  }

  OrgFormGroup: UntypedFormGroup = this.formBuilder.group({
    clientName: ['', [Validators.required,Validators.pattern("[A-Za-z]{2,32}(?: [a-zA-Z]+){0,2}")]],
    email: ['', [Validators.required, Validators.email]],
    fName: ['', [Validators.required,Validators.pattern("[A-Za-z]{2,32}")]],
    lName: ['', [Validators.required]],
    plan: ['', [Validators.required]],
    password: ['', [Validators.required,Validators.minLength(6),this.noWhitespaceValidator,]],
    c_password: ['', [Validators.required]],
    description: [''],
    mobilenumber:['', [Validators.required, Validators.pattern(/^(?!(\d)\1+$)(?:\(?\+\d{1,3}\)?[- ]?|0)?\d{10}$/)]],
    // countrycodes:['', [Validators.required]],
  },
  { validator: [this.checkPasswords] }
  );
  checkPasswords(group: UntypedFormGroup) {
    const pass = group.controls.password.value;
    const confirmPass = group.controls.c_password.value;
  
    return pass === confirmPass ? null : { notSame: true };
  }
  public noWhitespaceValidator(control: UntypedFormControl) {
    const isSpace = (control.value || '').match(/\s/g);
    return isSpace ? { 'whitespace': true } : null;
  }
  mailCheck:any=[];
  TrailData : number[] = [0,0];
  mailExists: boolean= false;
  protected _onDestroy = new Subject<void>();
  ngOnInit() {
    this.getAllPlanDetails()
    this.getTrialDetails();
    this.getAllOrgdetails();
    this.getCountryTelCode();
  }

  modified_plan_module:any[] = [];
  //add unique settings module
addSettings(){
  for(var i=0;i<this.modified_plan_module.length;i++){
    if(this.modified_plan_module[i] == "project/jobs"){
      this.modified_plan_module.splice(i+1,0,"client-settings");
      i=i+1;
    }
    else if(this.modified_plan_module[i] == "time-tracker"){
      this.modified_plan_module.splice(i+1,0,"time-tracker-settings");
      i=i+1;
    }
    else if(this.modified_plan_module[i] == "leave-tracker"){
      this.modified_plan_module.splice(i+1,0,"leave-tracker-settings");
      i=i+1;
    }
    else if(this.modified_plan_module[i] == "attendance"){
      this.modified_plan_module.splice(i+1,0,"attendance-settings");
      i=i+1;
    }
    else if(this.modified_plan_module[i] == "day-planner"){
      this.modified_plan_module.splice(i+1,0,"my-day-planner");
      this.modified_plan_module.splice(i+2,0,"day-planner-settings");
      i=i+2;
    }
    else if(this.modified_plan_module[i] == "company-policy"){
      this.modified_plan_module.splice(i+1,0,"company-policy-settings");
      i=i+1;
    }
  }
}

 // Get Trail details 
 getTrialDetails() {
  this.spinner.show();
 
  this.registerService.getTrialDetails().subscribe(data => {

    if (data.map.statusMessage == "Success") {
      this.TrailData= JSON.parse(data.map.data);
    }
    else {
      this.TrailData= [0,0];
    }
    this.spinner.hide();
  },(error) => {
    this.router.navigate(["/404"]);
    this.spinner.hide();
  })
}
  url :any =[];
  addOrg(){
    this.addSettings();
    this.spinner.show();
    this.url = window.location.href;
    this.url = this.url.split("/");
    let formdata = {
      "firstname": this.OrgFormGroup.value.fName,
      "lastname": this.OrgFormGroup.value.lName,
      "email": this.OrgFormGroup.value.email,
      "company_name": this.OrgFormGroup.value.clientName,
      "password": this.OrgFormGroup.value.c_password,
      "plan": this.OrgFormGroup.value.plan,
      "status": this.TrialCheckbox? "Trial" : "Created",
      "plan_id": this.selected_plan_id,
      "login_str": this.login_str,
      "desc":this.OrgFormGroup.value.description,
      "modules": JSON.stringify(this.modified_plan_module),
      "url": this.url[2],
      "working_days":JSON.stringify(this.weekDays),
      "login_mobilenumber":this.OrgFormGroup.value.mobilenumber,
      "country_code":this.countrycodeCtrl.value,
    }
    this.manageOrgService.createOrg(formdata).subscribe(data =>{
      if(data.map.statusMessage == "Success" && data.map.Error == "Error in sending mail due to mail configuration issue,check the configuration details") {
        this.utilsService.openSnackBarAC("Organization details created successfully", "OK");
        this.router.navigate(["/requested_org"]);
        setTimeout(() => { 
          this.utilsService.openSnackBarMC( "Mail configuration issue encountered", "OK");
        }, 500);
        }
      else if (data.map.statusMessage == "Success"){
        this.utilsService.openSnackBarAC("Organization details created successfully", "OK");
        this.router.navigate(["/requested_org"]);
        this.dialogRef.close();
        // this.spinner.hide();
      }
      else{
        this.utilsService.openSnackBarMC("Failed to create organization details", "OK");
        // this.spinner.hide();
      }
      this.spinner.hide();
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
      this.dialogRef.close();
    })
  }

  getAllOrgdetails() {
    this.spinner.show();
    this.manageOrgService.getAllOrgDetails().subscribe(data => {
      if(data.map.statusMessage == "Success"){
        let response: any[] = JSON.parse(data.map.data)
        for(let i=0; i<response.length; i++) {
          this.mailCheck.push(response[i].email);
        }
        this.spinner.hide();
      }else{
        this.spinner.hide();
      }
      
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
    })
  }

  mailchange(event){
    this.mailExists = false;
    if(this.mailCheck.includes(event)){
      this.mailExists = true;
    }
  }
  selected_plan_module:any = [];
  selected_plan_id: number;
  openpricingdetails(){
    if(this.OrgFormGroup.value.plan ==="Trial plan"){
      this.TrialCheckbox = true;
   }
   else{
     this.TrialCheckbox = false;
   }
    this.selected_plan_module = [];
    let heading = this.OrgFormGroup.value.plan +" - "+"Pricing details"
    let plandetails:any = [];
    for(var i=0;i<this.allplandetails.length;i++){
      if(this.OrgFormGroup.value.plan == this.allplandetails[i].plan){
        plandetails.push(this.allplandetails[i]);
        this.selected_plan_module.push(this.allplandetails[i].modules);
        this.modified_plan_module = this.allplandetails[i].modules;        
        this.selected_plan_id = this.allplandetails[i].id;
      }
    } 
    const dialogref = this.dialog.open(RegisterCommonDialogComponent,{
      width: '30%',
      // height: '85%',
      panelClass: 'custom-viewdialogstyle',
      data:[heading,plandetails]
    });
    dialogref.afterClosed().subscribe((result)=> {
      if (result.data =='Cancel') {
          this.OrgFormGroup.controls['plan'].reset();
          this.TrialCheckbox = false;
        }
    });
  }

  //get active pricing plan details
  allplandetails:any = [];
  getAllPlanDetails(){
    this.spinner.show();
    this.allplandetails = [];
    this.managePricingPlanService.getAllPlanDetails().subscribe(data => {
      if(data.map.statusMessage == "Success"){
        let response: any[] = JSON.parse(data.map.data);
        this.allplandetails = response;
        for(var i=0;i<this.allplandetails.length;i++){
         let word = this.allplandetails[i].currency;
         this.allplandetails[i].currency = word.split(' ').pop();
          this.allplandetails[i].modules = JSON.parse(this.allplandetails[i].modules);
          this.pricingarr.push({"name":this.allplandetails[i].plan,"id":this.allplandetails[i].id})
        }
        
      }
      else{
      }
      this.spinner.hide();
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
    })
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
}
