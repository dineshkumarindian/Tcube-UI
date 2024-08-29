import { SelectionModel } from '@angular/cdk/collections';
import { ChangeDetectorRef, Component, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { FormControl, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MatRadioButton } from '@angular/material/radio';
import { MatDialog } from '@angular/material/dialog';
import { DateAdapter } from '@angular/material/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { ActivatedRoute, Router } from '@angular/router';
import moment from 'moment-timezone';
import { NgxSpinnerService } from 'ngx-spinner';
import { ReplaySubject, Subject } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';
import { RegisterService } from '../../../services/register.service';
import { SettingsService } from '../../../services/settings.service';
import { UtilService } from '../../../services/util.service';
import { errorMessage, alreadyExistMessage, validFormat, duplicateName, duplicateMobileNumber } from '../../../util/constants';
import { AddBranchComponent } from '../../manage-branch/add-branch/add-branch.component';
import { ManageBranchDetailsService } from 'src/app/services/manage-branch/manage-branch-details.service';
import { MatSelect } from '@angular/material/select';
import { DeleteComponent } from 'src/app/util/delete/delete.component';
import { OrgUserLimitComponentComponent } from 'src/app/util/org-user-limit-component/org-user-limit-component.component';
import { ManageSatffTypeDetailsService } from 'src/app/services/manage-staffType/manage-satff-type-details.service';
import { ManageShiftService } from 'src/app/services/manage-shift/manage-shift.service';
import { NotificationService } from 'src/app/services/notification.service';

@Component({
  selector: 'app-add-user',
  templateUrl: './add-user.component.html',
  styleUrls: ['./add-user.component.less']
})
export class AddUserComponent implements OnInit {

  validFormatMessage = validFormat;
  requiredMessage = errorMessage;
  existMessage = alreadyExistMessage;
  duplicateName = duplicateName;
  duplicateMobileNumber = duplicateMobileNumber;
  employeeDetails: any[] = [];
  empIdUpdate: any;
  isempEditEnabled: boolean = false;
  password: any;
  defaultPassword: any;
  mailCheck: any[] = [];
  mailExists: boolean = false;
  isUserNameAvail: boolean = false;
  isUserName: boolean = false;
  updatedNameExist: boolean = false;
  isIdAvailable: boolean = false;
  empUpdateEmail: any;
  editedPersonName: any;
  editedPersonFirstName: any;
  editedPersonLastName: any;
  userFirstNameList: any[] = [];
  userLastNameList: any[] = [];
  userFullName: any[] = [];
  userLastName: any[] = [];
  userFirstName: any[] = [];
  nameList: any[] = [];
  inactiveUser: boolean = false;
  inactiveEmployeeDetails: any[] = [];
  organizationName: string;
  isDefaultPass: boolean = false;
  defaultPass: any;
  customPass: any;
  roleDetails: any[] = [];
  roleDetailsData: any[] = [];
  loginurl: any = '';
  loginstr: string;
  modifiedstring: any;
  login_str: any;
  is_default_leavetype_created: boolean;
  access = new UntypedFormControl("", [Validators.required]);
  accessList: string[] = [];
  designationDetailsData: any[] = [];
  designationDetails: any[] = [];
  branchDetails: any[] = [];
  roleIsAvail: boolean = true;
  isUserAvail: boolean;
  orgEmpCount: number = 0;
  org_count: number = 0;
  Trial: boolean = false;
  staffTypeDetails: any[] = [];
  TrailData: number[] = [0, 0];
  countryCodes: any[] = [];
  codes: any;
  hide = true;
  visibility = 'visibility_off';
  public showAdminFormPass: boolean = true;
  public showUserFormPass: boolean = true;
  isDefaultPassword: boolean = false;
  showValues = true;
  mobileNumberCountryDetails: any[] = [];
  mobileNumberDetails: any[] = [];
  isMobileNumberAvail: boolean = false;
  isMobileNumber: boolean ;
  editedMobileNumber: any;
  editMobileNumber: boolean = false;
  /** list of currency filtered by search keyword */
  public filteredRole: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);
  /** control for the selected project */
  public empCtrl: UntypedFormControl = new UntypedFormControl("", [Validators.required]);
  /** control for the MatSelect filter keyword */
  public empFilterCtrl: UntypedFormControl = new UntypedFormControl();
  /** list of bill filtered by search keyword */
  public filteredEmps: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);
  /** control for the selected clien */
  public designationCtrl: UntypedFormControl = new UntypedFormControl("", [Validators.required]);
  /** control for the selected clien */
  public branchCtrl: UntypedFormControl = new UntypedFormControl("", [Validators.required]);
  /** control for the selected clien */
  public roleCtrl: UntypedFormControl = new UntypedFormControl("", [Validators.required]);
  /** control for the MatSelect filter keyword */
  public roleFilterCtrl: UntypedFormControl = new UntypedFormControl();
  /** control for the selected project */
  public accesslist: UntypedFormControl = new UntypedFormControl("", [Validators.required]);
  /** list of bill filtered by search keyword */
  public filteredAccess: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);
  /** control for the MatSelect filter keyword */
  public accessFilterCtrl: UntypedFormControl = new UntypedFormControl();
  /** control for the MatSelect filter keyword */
  public designationFilterCtrl: UntypedFormControl = new UntypedFormControl();
  /** list of currency filtered by search keyword */
  public filtereddesignation: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);
  public staffTypeCtrl: UntypedFormControl = new UntypedFormControl("", [Validators.required]);

  /** control for the MatSelect filter keyword for branch*/
  public branchFilterCtrl: UntypedFormControl = new UntypedFormControl();
  /** list of branch filtered by search keyword */
  public filteredbranch: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);

   /** control for the MatSelect filter keyword for staffType*/
   public stafftypeFilterCtrl: UntypedFormControl = new UntypedFormControl();
   /** list of staffType filtered by search keyword */
   public filteredstaffType: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);
   public countrycodeFilterCtrl: UntypedFormControl = new UntypedFormControl();
   public filteredcountrycode : ReplaySubject<any[]> = new ReplaySubject<any[]>(1);
   public countrycodeCtrl: UntypedFormControl = new UntypedFormControl("", [Validators.required]);

   public shiftCtrl: UntypedFormControl = new UntypedFormControl("", [Validators.required]);

   /** control for the MatSelect filter keyword for staffType*/
   public shiftFilterCtrl: UntypedFormControl = new UntypedFormControl();
   /** list of staffType filtered by search keyword */
   public filteredshift: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);


  @ViewChildren(MatPaginator) paginator = new QueryList<MatPaginator>();
  @ViewChildren(MatSort) sort = new QueryList<MatSort>();
  @ViewChild('staffTypeSelect', { static: false }) staffTypeSelect: MatSelect
  resetFormControl: FormControl = new FormControl;
  editorSave: boolean;
  validatePass: boolean = false;
  // maillIssue: boolean = false;
  emp_org_data: any;
  new_emp_id: any;
  
  constructor(
    private formBuilder: UntypedFormBuilder,
    private settingsService: SettingsService,
    private router: Router,
    public matDialog: MatDialog,
    private utilsService: UtilService,
    private registerService: RegisterService,
    private spinner: NgxSpinnerService,
    private dateAdapter: DateAdapter<Date>,
    private activatedRoute: ActivatedRoute,
    private manageBranchDetailsService: ManageBranchDetailsService,
    private changeDetectorRef: ChangeDetectorRef,
    private manageStaffTypeService: ManageSatffTypeDetailsService,
    private manageShiftService: ManageShiftService,private notificationService: NotificationService
  ) {
    this.dateAdapter.setLocale('en-GB');
    // for to get a current webpage url
    /* Your code goes here on every router change */
    this.loginurl = window.location.href;
    this.modifiedstring = this.loginurl.slice(0, this.loginurl.length - 8);
    this.loginstr = "login";
    this.login_str = this.modifiedstring.concat(this.loginstr.toString());
  }
  //User formgroup
  UserFormGroup: UntypedFormGroup = this.formBuilder.group({
    f_name: ['', [Validators.required, Validators.pattern(/^[A-Za-z]+( [A-Za-z]+)*$/)]],
    l_name: ['', [Validators.required, Validators.pattern(/^[A-Za-z]+( [A-Za-z]+)*$/)]],
    email: ['', [Validators.required, Validators.email, Validators.pattern(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)]],
    // email: ['', [Validators.required, Validators.email,Validators.pattern("/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/")]],
    doj: ['', [Validators.required]],
    resetFormControl1: ['',Validators.required],
    mobilenumber:['', [Validators.required, Validators.pattern(/^(?!(\d)\1+$)(?:\(?\+\d{1,3}\)?[- ]?|0)?\d{10}$/)]],
    // radios: ['', [Validators.required]]
    // designation :['', [Validators.required]]
  });
  /** Subject that emits when the component has been destroyed. */
  protected _onDestroy = new Subject<void>();
  async ngOnInit() {
    this.getRoleByOrgidRoleid();
    this.getOrgDetailById();
    this.getemployeereport();
    this.getShiftsByOrgId();
    if (localStorage.getItem('TrialAccount') == "true") {
      this.Trial = true;
      // this.getemployeereport();
      this.getTrialDetails();
    }
    else {
      this.Trial = false;
    }

    this.geEmployeeDetailsByOrgId();
    this.getActiveDesignationDetailsByOrgId();
    this.getAllEmployeeDetailsToGetEmail();
    this.getActiveRoleDetailsByOrgId();
    this.getActiveEmpSpecificDetailsByOrgId();
    this.getBranchDetailsByOrgId();
    this.getStaffTypeDetailsByOrgId();
   await this.getCountryTelCode();   
    // this.isIdAvailable = true;
    this.editorSave = false;
    this.isUserAvail = false;          
    this.getMobileNumberAndCountryCode();
    this.empIdUpdate = this.activatedRoute.snapshot.params.id;
    if (this.empIdUpdate) {
      this.getOrgDetailById();      
      this.empFormValue();          
      this.isUserName = true;
      this.editorSave= false;
      this.isUserAvail = true;
      this.editMobileNumber = false;
    }  
  }
  async getOrgDetailById() {
    let orgId = localStorage.getItem('OrgId');
   await this.registerService.getOrgDetailsById(orgId).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        let response = JSON.parse(data.map.data);
        this.is_default_leavetype_created = response.is_leavetype_created;
        this.organizationName = response.company_name;
        this.org_count = parseInt(response.userslimit);
      }
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
    })
  }
  //get roledetails based on the orgid and roleid 
  getRoleByOrgidRoleid() {
    this.spinner.show();
    this.accessList = [];
    let OrgId = localStorage.getItem("OrgId");
    let roleId = localStorage.getItem("role_id");
    let formdata = {
      "org_id": OrgId,
      "role_id": roleId
    }
    this.settingsService.getRoledetailsbyorgidandroleid(formdata).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        let response = JSON.parse(data.map.data);
        this.accessList = JSON.parse(response.access_to);
        // load the initial bill list
        this.filteredAccess.next(this.accessList.slice());

      }
      else {
      }
      this.spinner.hide();
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
    })

  }
  // designationDataSource = new MatTableDataSource();
  getActiveDesignationDetailsByOrgId() {
    this.designationDetailsData = []; // for validating duplicate designation
    let OrgId = localStorage.getItem("OrgId");
    // debugger
    this.settingsService.getActiveDesignationDetailsByOrgId(OrgId).subscribe(data => {
      let response = JSON.parse(data.map.data);
      this.designationDetails = response;
      // load the initial bill list
      this.filtereddesignation.next(this.designationDetails.slice());

      // listen for search field value changes
      this.designationFilterCtrl.valueChanges
        .pipe(takeUntil(this._onDestroy))
        .subscribe(() => {
          this.filterDesignation();
        });

    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
    })
  }
  protected filterDesignation() {
    if (!this.designationDetails) {
      return;
    }
    // get the search keyword
    let search = this.designationFilterCtrl.value;
    if (!search) {
      this.filtereddesignation.next(this.designationDetails.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
    // filter the client
    this.filtereddesignation.next(
      this.designationDetails.filter(designation => designation.designation.toLowerCase().indexOf(search) > -1)
    );
  }

  //get branch details by org id
  getBranchDetailsByOrgId() {
    let OrgId = localStorage.getItem("OrgId");
    this.manageBranchDetailsService.getBranchesByOrgId(OrgId).subscribe(data => {
      this.branchDetails = [];
      // ********** while removing all braches one by one need to reset the branch form on last brach deleting************
      if (data.map.data === "No data found for the given ID.") {
        this.branchSelect.close();
        this.branchCtrl.reset();
        this.branchDetails = [];
      }
      let response = JSON.parse(data.map.data);
      this.branchDetails = response;
      // load the initial bill list
      this.filteredbranch.next(this.branchDetails.slice());

      // listen for search field value changes
      this.branchFilterCtrl.valueChanges
        .pipe(takeUntil(this._onDestroy))
        .subscribe(() => {
          this.filterBranch();
        });

      this.spinner.hide()
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
    })
  }
  // for branch details
  branchName: any = [];
  protected filterBranch() {
    this.branchName = this.branchFilterCtrl.value;
    if (!this.branchDetails) {
      return;
    }
    // get the search keyword
    let search = this.branchFilterCtrl.value;
    if (!search) {
      this.filteredbranch.next(this.branchDetails.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
    // filter the client
    this.filteredbranch.next(
      this.branchDetails.filter(branch => branch.branch.toLowerCase().indexOf(search) > -1)
    );
  }
  protected filteremp() {
    if (!this.employeeDetails) {
      return;
    }
    // get the search keyword
    let search = this.empFilterCtrl.value;
    if (!search) {
      this.filteredEmps.next(this.employeeDetails.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
    // filter the client
    this.filteredEmps.next(
      this.employeeDetails.filter(list => list.firstname.toLowerCase().indexOf(search) > -1)
    );
  }
  protected filterRole() {
    if (!this.roleDetails) {
      return;
    }
    // get the search keyword
    let search = this.roleFilterCtrl.value;
    if (!search) {
      this.filteredRole.next(this.roleDetails.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
    // filter the client
    this.filteredRole.next(
      this.roleDetails.filter(designation => designation.role.toLowerCase().indexOf(search) > -1)
    );
  }
  public userdetails: boolean = false;
  // validatePass: boolean = false;
  toggleuser() {
    this.resetform("User");
    this.userPassword.setValue('');
    this.showAdminFormPass = true;
    this.isUserNameAvail = false;
    // this.isMobileNumber = true;
    this.userdetails = !this.userdetails;
    if (this.empIdUpdate && this.isempEditEnabled) {
      this.empCtrl = new UntypedFormControl('');
      this.empFormValue();
      // this.isMobileNumber = true;

    } else {
      // this.employeeDetails = [];
      // this.geEmployeeDetailsByOrgId();
      this.toggleActiveUser();
      this.isOrgAdmin = false;
      this.empIdUpdate = null;
      this.password = null;
      this.validatePass = false;
    }
    this.isempEditEnabled = !this.isempEditEnabled;
  }
  listUser = [];
  selection_1 = new SelectionModel(true, []);
  toggleInactiveUser() {
    this.inactiveEmployeeDetails = [];
    this.listUser = [];
    this.selection_1.clear();
    // this.empDataSource = new MatTableDataSource();
    this.inactiveUser = true;
    this.getInactiveEmpDetails();
    this.getActiveRoleDetailsByOrgId();
  }
  edit: boolean = false;
  toggleActiveUser() {
    this.employeeDetails = [];
    this.listUser = [];
    this.selection_1.clear();
    // this.empDataSource = new MatTableDataSource();
    this.inactiveUser = false;
    this.geEmployeeDetailsByOrgId();
    this.getActiveRoleDetailsByOrgId();
  }
  toggleUser() {
    this.isDefaultPassword=true;
    this.validatePass = false;
    // this.password = '';
    this.UserFormGroup.get('resetFormControl1').patchValue('password');
    this.userPassword.value;
    this.showUserFormPass = false;
    this.defaultPassword = '';
  }
  resetform(data) {
    if (data == "User") {
      this.UserFormGroup.reset();
      this.designationCtrl = new UntypedFormControl("", [Validators.required]);
      this.roleCtrl = new UntypedFormControl("", [Validators.required]);
      this.empCtrl = new UntypedFormControl("", [Validators.required]);
      this.password = "";
    }
  }
  // , Validators.minLength(6)]
  public userPassword: UntypedFormControl = new UntypedFormControl('', [Validators.required,
  Validators.minLength(6), this.noWhitespaceValidator]);
  // Emptyspace validator function
  public noWhitespaceValidator(control: UntypedFormControl) {
    const isSpace = (control.value || '').match(/\s/g);
    return isSpace ? { 'whitespace': true } : null;
  }
  reporting_m: any;
  isOrgAdmin: boolean = false;
  word:any;
  newPass : any;
  anotherPassword : any ;
  anotherOnePassword :any;
  empFormValue() {
    this.spinner.show();    
    let role = localStorage.getItem("Role");
    this.settingsService.getActiveEmpDetailsById(this.empIdUpdate).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        let response = JSON.parse(data.map.data);        
        this.UserFormGroup.get('f_name').setValue(response.firstname);
        this.UserFormGroup.get('l_name').setValue(response.lastname);
        this.UserFormGroup.get('email').setValue(response.email);
        this.UserFormGroup.get('mobilenumber').setValue(response.login_mobilenumber);
        this.editedMobileNumber = this.UserFormGroup.get('mobilenumber').value;
        // this.editMobileNumber = true;
        this.editedPersonName = this.UserFormGroup.get('f_name').value + " " + this.UserFormGroup.get('l_name').value;
        this.editedPersonFirstName = this.UserFormGroup.get('f_name').value;
        // this.editedPersonLastName = this.UserFormGroup.get('l_name').value;
        this.empUpdateEmail = response.email;
        if (response.designationDetails.is_deleted == false) {
          this.designationCtrl.setValue(response.designationDetails.id);
        }
        if (response.branchDetails && response.branchDetails.is_deleted == false) {
          this.branchCtrl.setValue(response.branchDetails.id);
        }   
        if (response.stafftypeDetails && response.stafftypeDetails.is_deleted == false) {
          this.staffTypeCtrl.setValue(response.stafftypeDetails.id);
        }  
        if (response.manageShiftDetails && response.manageShiftDetails.is_deleted == false) {
          this.shiftCtrl.setValue(response.manageShiftDetails.id);
        } 

        if(response.countryCodeDetails) {          
          let temp = this.countryCodes.find(x => x.id == response.countryCodeDetails.id);
          this.codes = temp.telcode;
          this.countrycodeCtrl.setValue(response.countryCodeDetails.id);
        }         
        if (response.user_login_type == 'OrgAdmin') {
          this.isOrgAdmin = true;
          this.empCtrl = new UntypedFormControl("", [Validators.required]);
          this.empCtrl.setValue(response.reporting_manager);
          // } else if (response.isReportingManagerAvail == true) { // flag for displaying the update reporting manager button
        } 
        else {
          this.empCtrl.setValue(response.reporting_manager);
        }
        let doj = new Date(response.date_of_joining);
        this.UserFormGroup.get('doj').setValue(doj);
        // this.UserFormGroup.get('role').setValue(response.roleDetails.id);
        this.roleCtrl.setValue(response.roleDetails.id);
        this.roleIsAvail = true;
        if (response.roleDetails.is_deleted == false) {
          this.roleIsAvail = false;
          this.updateEmpEvent(response.roleDetails.id);
        }       

        if(this.organizationName != "" && this.organizationName != undefined && this.organizationName != null) {
        this.word = this.organizationName.split(' ');
        let nW = this.word[0];
        this. newPass = nW.charAt(0).toUpperCase() + nW.slice(1).toLowerCase() + "#1";
        this. anotherPassword = nW.charAt(0).toUpperCase() + nW.slice(1).toLowerCase() + "#1" + "1*";
        this. anotherOnePassword = nW.charAt(0).toUpperCase() + nW.slice(1).toLowerCase() + "#1" + "1";      
        } else {
          let localStorageOrgaName = localStorage.getItem("OrgName");
          let nW = localStorageOrgaName[0];
          this. newPass = nW.charAt(0).toUpperCase() + nW.slice(1).toLowerCase() + "#1";
          this. anotherPassword = nW.charAt(0).toUpperCase() + nW.slice(1).toLowerCase() + "#1" + "1*";
          this. anotherOnePassword = nW.charAt(0).toUpperCase() + nW.slice(1).toLowerCase() + "#1" + "1";
        }  
        if (response.password == this.newPass) {
          this.defaultPass = this.newPass;
           this.UserFormGroup.get('resetFormControl1').patchValue('defaultPassword');
          // this.password= this.organizationName.toLowerCase()+"#1";
          this.customPass = '';
          this.setPassword();         
          this.changeDetectorRef.detectChanges();
        } else if(response.password == this.anotherPassword) {
          this.defaultPass = this.anotherPassword;
          this.UserFormGroup.get('resetFormControl1').patchValue('defaultPassword');
          this.customPass = '';
          this.setPassword();
          this.changeDetectorRef.detectChanges();
        } else if(response.password == this.anotherOnePassword) {
          this.defaultPass = this.anotherOnePassword;
          this.UserFormGroup.get('resetFormControl1').patchValue('defaultPassword');
          this.customPass = '';
          this.setPassword();
          this.changeDetectorRef.detectChanges();
        } else {
          // this.showUserFormPass= false;
          this.password = response.password;
          this.UserFormGroup.get('resetFormControl1').patchValue('password');
          this.defaultPassword = '';
          this.customPass = response.password;
          this.userPassword.setValue(response.password);
          this.toggleUser();
          this.changeDetectorRef.detectChanges();
          // this.password= response.password;
        }
       
      }
      setTimeout(() => {
        this.spinner.hide();
      }, 2000);
      // this.spinner.hide();
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
    })
    setTimeout(() => {
      this.spinner.hide();
    }, 2000);
  }
  empDataSource = new MatTableDataSource();
  getInactiveEmpDetails() {
    this.spinner.show();
    let orgId = localStorage.getItem("OrgId");
    this.settingsService.getInactiveEmpDetailsByOrgId(orgId).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        let response: any[] = JSON.parse(data.map.data);
        this.inactiveEmployeeDetails = response;

        this.empDataSource = new MatTableDataSource(this.inactiveEmployeeDetails);
        this.empDataSource.sort = this.sort.toArray()[2];
        this.empDataSource.paginator = this.paginator.toArray()[2];
        this.spinner.hide();
      }
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
    })
  }
  geEmployeeDetailsByOrgId() {
    this.spinner.show();
    let orgId = localStorage.getItem("OrgId");
    //Here I have used the get ACTIVE EMPLOYEE DETAILS API call --> Means its get all user details under the Organization Id
    this.settingsService.getCustomActiveEmpDetailsByOrgID(orgId).subscribe(data => {
      let response: any[] = JSON.parse(data.map.data);
      this.employeeDetails = response;
      
      // load the initial emp list
      this.filteredEmps.next(this.employeeDetails.slice());
      // listen for search field value changes
      this.empFilterCtrl.valueChanges
        .pipe(takeUntil(this._onDestroy))
        .subscribe(() => {
          this.filteremp();
        });

      this.spinner.hide();
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
    })
  }

  pass: any;

  addEmployee() {
    this.spinner.show();
    let zone = moment.tz.guess();
    if (this.showUserFormPass == false) {
      this.pass = this.userPassword.value;
    } else{
       this.pass = this.defaultPassword;
    }
    // this.editedMobileNumber = this.UserFormGroup.value.mobilenumber;
    let formData: any = new FormData();
    let data: Object = {
      "firstname": this.UserFormGroup.value.f_name,
      "lastname": this.UserFormGroup.value.l_name,
      "email": this.UserFormGroup.value.email,
      "date_of_joining": this.UserFormGroup.value.doj,
      "password": this.pass,
      "login_mobilenumber":this.UserFormGroup.value.mobilenumber,
      "seq": 1,
      "login_str": this.login_str,
      "timezone": zone,
    }
    let orgId = localStorage.getItem("OrgId");
    formData.append("data", JSON.stringify(data));
    formData.append("org_id", orgId);
    formData.append("role_id", this.roleCtrl.value.id,);
    formData.append("designation_id", this.designationCtrl.value);
    formData.append("reporting_manager_id", this.empCtrl.value);
    formData.append("branch_id", this.branchCtrl.value);
    formData.append("stafftype_id",this.staffTypeCtrl.value);
    formData.append("shift_id", this.shiftCtrl.value);
    formData.append("country_code_id",this.countrycodeCtrl.value);
    this.settingsService.createEmployessDetails(formData).subscribe( data => {
       if (data.map.statusMessage == "Success" && data.map.Error =="Error in creating user due to mail configuration check the configuration details") {
        let response = JSON.parse(data.map.data);
        this.emp_org_data = response.orgDetails.emp_id;
        this.new_emp_id = response.id;     
        this.utilsService.openSnackBarAC("User added successfully", "OK");
        this.notificationWithEmailMsg();
        setTimeout(() => {
          if(localStorage.getItem('Role') == 'org_admin') {
        this.utilsService.openSnackBarMC("Mail configuration issue encountered, please check it", "OK");
          } else {
            this.utilsService.openSnackBarMC("Mail configuration issue encountered, please contact admin", "OK");
          }
      }, 2000);
        this.orgEmpCount += 1;
        if (this.editorSave == false) {
          this.employeeDetails = [];
          setTimeout(() => {
            localStorage.setItem("ManageUserAction", "true");
            this.router.navigate(['/settings']);
          }, 500);
        } else {
          if((this.org_count <=this.orgEmpCount)){
            const dialog = this.matDialog.open(OrgUserLimitComponentComponent, {
              width: '35%',
              panelClass: 'custom-viewdialogstyle',
              data: { key: "branch-delete", showComment: false }
            });
            dialog.afterClosed().subscribe(
              async resp => {
                if (resp != undefined && resp != "") {
                  if (resp.data == true) {
        
                  }
                }
              }
            );
          }
          this.UserFormGroup.reset();
          this.roleCtrl.reset();
          this.designationCtrl.reset();
          this.empCtrl.reset();
          this.branchCtrl.reset();
          this.password = '';
          this.userPassword.reset();
          this.staffTypeCtrl.reset();
          this.countrycodeCtrl.reset();
          this.defaultPassword = '';
          this.shiftCtrl.reset();
          this.geEmployeeDetailsByOrgId();
          this.getActiveEmpSpecificDetailsByOrgId();
          this.getAllEmployeeDetailsToGetEmail();
          this.mailchange(this.UserFormGroup.value.email);
          this.getMobileNumberAndCountryCode();
          this.checkMobileNumber(this.UserFormGroup.value.mobilenumber);
        }
        // setTimeout(() => {
        //   localStorage.setItem("ManageUserAction", "true");
        //   this.router.navigate(['/settings']);
        // }, 500);
        this.spinner.hide();
      } else if (data.map.statusMessage == "Success") {      
        this.utilsService.openSnackBarAC("User added successfully", "OK");
        this.orgEmpCount += 1;
        if (this.editorSave == false) {
          this.employeeDetails = [];
          setTimeout(() => {
            localStorage.setItem("ManageUserAction", "true");
            this.router.navigate(['/settings']);
          }, 500);
        } else {
          if((this.org_count <=this.orgEmpCount)){
            const dialog = this.matDialog.open(OrgUserLimitComponentComponent, {
              width: '35%',
              panelClass: 'custom-viewdialogstyle',
              data: { key: "branch-delete", showComment: false }
            });
            dialog.afterClosed().subscribe(
              async resp => {
                if (resp != undefined && resp != "") {
                  if (resp.data == true) {
        
                  }
                }
              }
            );
          }
          this.UserFormGroup.reset();
          this.roleCtrl.reset();
          this.designationCtrl.reset();
          this.empCtrl.reset();
          this.branchCtrl.reset();
          this.password = '';
          this.userPassword.reset();
          this.staffTypeCtrl.reset();
          this.countrycodeCtrl.reset();
          this.defaultPassword = '';
          this.shiftCtrl.reset();
          this.geEmployeeDetailsByOrgId();
          this.getActiveEmpSpecificDetailsByOrgId();
          this.getAllEmployeeDetailsToGetEmail();
          this.mailchange(this.UserFormGroup.value.email);
          this.getMobileNumberAndCountryCode();
          this.checkMobileNumber(this.UserFormGroup.value.mobilenumber);
        }
        // setTimeout(() => {
        //   localStorage.setItem("ManageUserAction", "true");
        //   this.router.navigate(['/settings']);
        // }, 500);
        this.spinner.hide();
      }
      else {
         this.utilsService.openSnackBarMC(data.map.data, "OK");
        // this.spinner.hide();
        // }
        this.spinner.hide();
      }
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
    })
    if (this.editorSave == true) {
      this.UserFormGroup.reset();
      this.roleCtrl.reset();
      this.designationCtrl.reset();
      this.empCtrl.reset();
      this.branchCtrl.reset();
      this.password = '';
      this.userPassword.reset();
      this.staffTypeCtrl.reset();
      this.countrycodeCtrl.reset();
      this.defaultPassword = '';
      this.shiftCtrl.reset();
      this.geEmployeeDetailsByOrgId();
      this.getActiveEmpSpecificDetailsByOrgId();
      this.getAllEmployeeDetailsToGetEmail();
      this.mailchange(this.UserFormGroup.value.email);
      this.getMobileNumberAndCountryCode();
      this.checkMobileNumber(this.UserFormGroup.value.mobilenumber);
    }
  }
 async notificationWithEmailMsg(){
  this.spinner.show();
    let notify_id;
    let zone = moment.tz.guess();
    let message =
    "Mail configuration issue encountered while creating user.";
    let formdata = {
      "org_id":  localStorage.getItem("OrgId"),
      "message": message,
      "to_notify_id":  this.emp_org_data,
      "notifier": this.new_emp_id,
      "keyword": "mail-issue",
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
  getemployeereport() {
    this.spinner.show();
    this.settingsService.getAllEmployeeReportsByOrgId(localStorage.getItem("OrgId")).subscribe(data => {
      if (data.map.statusMessage == "Success") {

        let response: any[] = JSON.parse(data.map.data);
        this.orgEmpCount = response.length;
        setTimeout(() => {
          this.spinner.hide();
          if((this.org_count <=this.orgEmpCount) && !this.empIdUpdate){
            const dialog = this.matDialog.open(OrgUserLimitComponentComponent, {
              width: '35%',
              panelClass: 'custom-viewdialogstyle',
              data: { key: "branch-delete", showComment: false }
            });
            dialog.afterClosed().subscribe(
              async resp => {
                if (resp != undefined && resp != "") {
                  if (resp.data == true) {
        
                  }
                }
              }
            );
          }
        }, 2000);
      }
      else {
        setTimeout(() => {
          this.spinner.hide();
        }, 2000);
      }
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
    })

  }
  editEmployee(id) {
    this.password = '';
    // this.UserFormGroup.get('resetFormControl1').setValue('');
    this.userPassword.setValue('');
    this.isempEditEnabled = true;
    this.empIdUpdate = id;
    this.validatePass = false;
    this.defaultPassword = '';
    this.toggleuser();
  }
  tempRole: any;
  updateDetails() {
    // this.spinner.show();
    if (this.showUserFormPass == false) {
      this.pass = this.userPassword.value;
    } else this.pass = this.defaultPassword;

    // if(this.isOrgAdmin){
    //   this.tempRole= 'org_admin'
    // }else{
    //   this.tempRole =  this.roleCtrl.value;
    // }
    this.spinner.show();
    let orgId = localStorage.getItem("OrgId");
    let formData: any = new FormData();
    let zone = moment.tz.guess();
    let orgAdminReportingId;
    if(this.empCtrl.value != undefined){
      orgAdminReportingId = this.empCtrl.value
    }
    else
    orgAdminReportingId = ""
    let data: Object = {
      "id": this.empIdUpdate,
      "firstname": this.UserFormGroup.value.f_name,
      "lastname": this.UserFormGroup.value.l_name,
      "email": this.UserFormGroup.value.email,
      "password": this.pass,
      "seq": 1,
      "date_of_joining": this.UserFormGroup.value.doj,
      "role_id": this.roleCtrl.value,
      "branch_id": this.branchCtrl.value,
      "org_id": orgId,
      "designation_id": this.designationCtrl.value,
      "reporting_manager_id": orgAdminReportingId,
      "stafftype_id": this.staffTypeCtrl.value,
      "shift_id": this.shiftCtrl.value,
      "country_code":this.countrycodeCtrl.value,
      "login_mobilenumber":this.UserFormGroup.value.mobilenumber,
      "timezone": zone,

    }
    this.settingsService.updateEmployee(data).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        this.utilsService.openSnackBarAC("User updated successfully", "OK");
        this.employeeDetails = [];
        // this.geEmployeeDetailsByOrgId();
        this.getActiveRoleDetailsByOrgId();
        setTimeout(() => {
          localStorage.setItem("ManageUserAction", "true");
          this.router.navigate(['/settings']);
          // this.spinner.hide();
        }, 500);
      }
      else {
        this.utilsService.openSnackBarMC("Failed to update user details", "OK");
        this.spinner.hide();
      }
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
    })
    // setTimeout(() => {
    //   this.spinner.hide();
    // }, 1000);
  }
  canceltoggleEmp() {
    localStorage.setItem("ManageUserAction", "true");
    this.router.navigate(['/settings']);
  }
  backToEmp() {
    localStorage.setItem("ManageUserAction", "true");
    this.router.navigate(['/settings']);
  }
  getAllEmployeeDetailsToGetEmail() {
    this.settingsService.getAllEmpDetailsByEmail().subscribe(data => {
      if (data.map.statusMessage == "Success") {
        let res: any[] = JSON.parse(data.map.data);
        
        for (let i = 0; i < res.length; i++) {
          this.mailCheck.push(res[i]);
        }
      }
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
    })
  }
  mailchange(event) {
    this.mailExists = false;
    if (this.mailCheck.includes(event)) {
      if (event == this.empUpdateEmail) {
        this.mailExists = false;
      } else {
        this.mailExists = true;
      }
    }
  }
  count = 0;
  splicedName: any;
  userLastNameCheck() {
    let userName;
    userName = (this.UserFormGroup.get('f_name').value + " " + this.UserFormGroup.get('l_name').value);
    if (this.isUserName && this.count < 2) {
      this.count++;
      for (let i = 0; i < this.userFullName.length; i++) {
        if (userName == this.userFullName[i]) {
          // this.splicedName.push(this.userFullName.splice(i,1));
          this.userFullName.splice(i, 1);
        }
      }
      if (this.count < 2) {
        this.isUserName = true;
      } else {
        this.isUserName = false;
      }
    }
    if (userName) {
      if (this.userFullName.find(x => x.toLowerCase() == userName.toLowerCase()) && (this.editedPersonName != userName.toLowerCase())) {
        this.isUserNameAvail = true;
      }
      else {
        this.isUserNameAvail = false;
      }
    }
  }
  async getActiveEmpSpecificDetailsByOrgId() {
    this.spinner.show();
    let OrgId = localStorage.getItem("OrgId");
    await this.settingsService.getActiveEmpSpecificDetailsByOrgId(OrgId).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        let response = JSON.parse(data.map.data);
        this.nameList = response;
        for (let i = 0; i < this.nameList.length; i++) {
          this.userFullName.push(this.nameList[i].firstname + " " + this.nameList[i].lastname);
        }
      }
    })
  }

  // roleDataSource = new MatTableDataSource();
  getActiveRoleDetailsByOrgId() {
    let dummy = [];
    let OrgId = localStorage.getItem("OrgId");
    this.settingsService.getActiveRoleDetailsByClientId(OrgId).subscribe(data => {
      let response = JSON.parse(data.map.data);
      this.roleDetails = response;
      for (let i = 0; i < this.roleDetails.length; i++) {
        this.roleDetails[i].access_to = JSON.parse(this.roleDetails[i].access_to);
      }
      for (var i = 0; i < this.roleDetails.length; i++) {
        var letters = '0123456789ABCDEF';
        var color = '#';
        for (var j = 0; j < 6; j++) {
          color += letters[Math.floor(Math.random() * 16)];
        }
        dummy.push({ role: this.roleDetails[i].role, active_total_counts: this.roleDetails[i].active_total_counts, inactive_total_counts: this.roleDetails[i].inactive_total_counts, color: color })
       
      }
      // load the initial bill list
      this.filteredRole.next(this.roleDetails.slice());

      // listen for search field value changes
      this.roleFilterCtrl.valueChanges
        .pipe(takeUntil(this._onDestroy))
        .subscribe(() => {
          this.filterRole();
        });
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
    })
  }
  accessHint = [];
  // roleAccessList = [];
  someMethod(role) {
    this.roleIsAvail = false;
    this.accessHint = role.access_to;
    // this.roleAccessList = role.is_deleted;
  }
  updateEmpEvent(event) {
    this.settingsService.getRoleById(event).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        let res = JSON.parse(data.map.data);
        this.roleIsAvail = true;
        if (res.role != '' && res.is_deleted == false) {
          this.roleIsAvail = false;
          this.accessHint = JSON.parse(res.access_to);
        }
      }
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
    })
  }
  setPassword() {
    this.isDefaultPassword = true;
    this.validatePass = false;
    this.showUserFormPass = true;
    let word = this.organizationName.split(' ');
    let nW = word[0];
    this.defaultPassword = nW.charAt(0).toUpperCase() + nW.slice(1).toLowerCase() + "#1";
    this.UserFormGroup.get('resetFormControl1').setValue(this.defaultPassword);
    if (this.defaultPassword.length == 4) {
      this.defaultPassword = nW.charAt(0).toUpperCase() + nW.slice(1).toLowerCase() + "#1" + "1*";
      this.UserFormGroup.get('resetFormControl1').setValue(this.defaultPassword);
    } else if (this.defaultPassword.length == 5) {
      this.defaultPassword = nW.charAt(0).toUpperCase() + nW.slice(1).toLowerCase() + "#1" + "1";
      this.UserFormGroup.get('resetFormControl1').setValue(this.defaultPassword);
    } else this.UserFormGroup.get('resetFormControl1').setValue(this.defaultPassword);
  }

  // setPassword() {
  //   this.validatePass = false;
  //   this.showUserFormPass = true;
  //   const randomChars = '0123456789';
  //   const stringLength = 2;
  //   let word = this.organizationName.split(' ');
  //   if(word.length >3) {
  //   let nW = word[0];
  //   this.password = nW.charAt(0).toUpperCase() + nW.slice(1).toLowerCase() + "#1";
  //   } else{
  //     let nW = word[0];
  //     for (let i = 0; i < stringLength; i++) {
  //   this.password = nW.charAt(0).toUpperCase() + nW.slice(1).toLowerCase() + "#1" + Math.floor(Math.random() * randomChars.length);
  //     }
  //   console.log("646", "#1" + this.password);
  //   }
  // }
 
  changeFn(value : String) {
    this.isDefaultPassword = true;
    this.validatePass = false;    
    if (value.length != 0) {
      this.validatePass = true;
      this.UserFormGroup.get('resetFormControl1').clearValidators();
    } else if (value.length == 0) {
      // this.UserFormGroup.controls['userPassword'].setValidators([Validators.required]);
      // this.UserFormGroup.controls['userPassword'].updateValueAndValidity;
      this.validatePass = true;
       this.UserFormGroup.get('resetFormControl1').setValidators([Validators.required]);
    } else {
      this.UserFormGroup.get('resetFormControl1').updateValueAndValidity();
    }
  }
  checkLength: Boolean = false;
  checkPass() {
    let pass = this.userPassword.value;
    let len = pass.length;
    if (len >= 6)
      this.checkLength = true;
    else if (len == 0) {
      this.checkLength = true;
    }
    else
      this.checkLength = false;
  }
  // keep form section  
  keepEditor(event) {
    if (event.checked == true) {
      this.editorSave = true;
    } else {
      this.editorSave = false;
    }
  }

  //call add branch dialog
  DeleteBranch(data) {
    event.stopPropagation();
    const dialogRef = this.matDialog.open(DeleteComponent, {
      width: '35%',
      panelClass: 'custom-viewdialogstyle',
      data: { key: "branch-delete", showComment: false }
    });
    dialogRef.afterClosed().subscribe(
      async resp => {
        if (resp != undefined && resp != "") {
          if (resp.data == true) {
            await this.branchDelete(data);

          }
        }
      }
    );
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

  @ViewChild('branchSelect', { static: false }) branchSelect: MatSelect

  branchAdd() {
    let formdata = {
      branch: this.branchFilterCtrl.value,
      orgid: localStorage.getItem('OrgId')
    }
    this.manageBranchDetailsService.createBranchDetails(formdata).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        this.utilsService.openSnackBarAC("Branch added successfully", "OK");
        this.getBranchDetailsByOrgId();
        setTimeout(() => {
          this.branchCtrl.setValue(this.branchDetails[this.branchDetails.length - 1].id);
          this.branchSelect.close();
        }, 500);
      }
      else if (data.map.statusMessage == "Failed") {
        this.utilsService.openSnackBarMC("Failed to create a new branch details", "OK");
      }
      else if (data.map.statusMessage == "Error") {
        this.utilsService.openSnackBarMC("Error while creating new details", "OK");
      }
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
    })
  }
  Branchnameset() {
    this.branchName = this.branchFilterCtrl.value;
  }
  isSelectOpen: boolean;
  onSelectOpen(isOpen: boolean): void {
    this.isSelectOpen = isOpen;
  }
  Branchname: string;
  branchDetails1: any;
  async branchDelete(data) {
    let formdata: object = {
      "branchName": data,
      org_id: localStorage.getItem('OrgId')
    }
    await this.manageBranchDetailsService.DeleteBranchDetails(formdata).subscribe(async data => {
      if (data.map.statusMessage == "Success") {
        this.utilsService.openSnackBarAC("Branch deleted successfully", "OK");
        await this.getBranchDetailsByOrgId();
      }
      else if (data.map.statusMessage == "Failed") {
        this.utilsService.openSnackBarMC("Failed to delete branch details", "OK");
      }
      else if (data.map.statusMessage == "Error") {
        this.utilsService.openSnackBarMC("Error while deleting branch details", "OK");
      }
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
      // this.branchSelect.close();
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
  
  getStaffTypeDetailsByOrgId() {
    let OrgId = localStorage.getItem('OrgId')
     this.manageStaffTypeService.getStaffTypesByOrgId(OrgId).subscribe(data => {
       this.staffTypeDetails = [];
       // ********** while removing all braches one by one need to reset the branch form on last brach deleting************
       if (data.map.data === "No data found for the given ID.") {
         this.staffTypeSelect.close();
         this.staffTypeCtrl.reset();
         this.staffTypeDetails = [];
       }
       let response = JSON.parse(data.map.data);
       this.staffTypeDetails = response;
       
       // load the initial bill list
       this.filteredstaffType.next(this.staffTypeDetails.slice());
 
       // listen for search field value changes
       this.stafftypeFilterCtrl.valueChanges
         .pipe(takeUntil(this._onDestroy))
         .subscribe(() => {
           this.filterStafftype();
         });
 
       this.spinner.hide()
     }, (error) => {
       this.router.navigate(["/404"]);
       this.spinner.hide();
     })
   }
  // Staff Type Details
  addStaffType() {
    let formData = {
      stafftype : this.stafftypeFilterCtrl.value,
      orgid  :  localStorage.getItem('OrgId')
    }
    this.manageStaffTypeService.createStaffTypeDetails(formData).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        this.utilsService.openSnackBarAC("New Staff Type was created successfully", "OK");
        this.getStaffTypeDetailsByOrgId();
        setTimeout(() => {
          
          this.staffTypeCtrl.setValue(this.staffTypeDetails[this.staffTypeDetails.length - 1].id);
          this.staffTypeSelect.close();
        }, 500);
      }
      else if (data.map.statusMessage == "Failed") {
        this.utilsService.openSnackBarMC("Failed to create a new staff type details", "OK");
      }
      else if (data.map.statusMessage == "Error") {
        this.utilsService.openSnackBarMC("Error while creating new staff type details", "OK");
      }
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
    })
  }

  
  
     staffTypes: any = [];
  protected filterStafftype() {
    this.staffTypes = this.stafftypeFilterCtrl.value;
    if (!this.staffTypeDetails) {
      return;
    }
    // get the search keyword
    let search = this.stafftypeFilterCtrl.value;
    if (!search) {
      this.filteredstaffType.next(this.staffTypeDetails.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
    // filter the stafftype
    this.filteredstaffType.next(
      this.staffTypeDetails.filter(staffDetails => staffDetails.stafftype.toLowerCase().indexOf(search) > -1)
    );
  }
  StaffTypenameset() {
      this.staffTypes = this.stafftypeFilterCtrl.value;
    }
    isSelectOpen1: boolean;
    onSelectOpen1(isOpen: boolean): void {
      this.isSelectOpen1 = isOpen;
    }
   async deleteStaffType(data){
    let formdata: object = {
      "stafftype": data,
      org_id: localStorage.getItem('OrgId')
    }
    await this.manageStaffTypeService.deleteStaffTypeDetails(formdata).subscribe(async data => {
      if (data.map.statusMessage == "Success") {
        this.utilsService.openSnackBarAC("Staff type deleted successfully", "OK");
        await this.getStaffTypeDetailsByOrgId();
      }
      else if (data.map.statusMessage == "Failed") {
        this.utilsService.openSnackBarMC("Failed to delete staff type details", "OK");
      }
      else if (data.map.statusMessage == "Error") {
        this.utilsService.openSnackBarMC("Error while deleting staff type details", "OK");
      }
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
      // this.branchSelect.close();
    })
  }

   //call add stafftype dialog
   DeleteStaffType(data) {
    event.stopPropagation();
    const dialogRef = this.matDialog.open(DeleteComponent, {
      width: '35%',
      panelClass: 'custom-viewdialogstyle',
      data: { key: "stafftype-delete", showComment: false }
    });
    dialogRef.afterClosed().subscribe(
      async resp => {
        if (resp != undefined && resp != "") {
          if (resp.data == true) {
            await this.deleteStaffType(data);

          }
        }
      }
    );
  }
  //To get all country code from database
  getCountryTelCode() {
    return new Promise<void>((resolve, reject) => {
      this.settingsService.getCountryTelCode().subscribe(data => {
        if (data.map.statusMessage == "Success") {
          let response = JSON.parse(data.map.data);
            this.countryCodes = response;    
            
            // load the initial code list
            this.filteredcountrycode.next(this.countryCodes.slice());
      
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
        if (!this.countryCodes) {
          return;
        }
        // get the search keyword
        let search = this.countrycodeFilterCtrl.value;
        if (!search) {
          this.filteredcountrycode.next(this.countryCodes.slice());
          return;
        } else {
          search = search.toLowerCase();
        }
        if((isNaN(search))) {
          this.filteredcountrycode.next(
            this.countryCodes.filter(code => code.country.toLowerCase().indexOf(search) > -1)
          );
          } else if(!(isNaN(search))){
            this.filteredcountrycode.next(
              this.countryCodes.filter(code => code.telcode.toLowerCase().indexOf(search) > -1)
            );
          }
      }
// To show the telcode by selected id
selectedTelcode(telcode) {
    let temp = this.countryCodes.find(x => x.id == telcode);
    this.codes = temp.telcode;    
  }
  toggleValuesVisibility() {
    this.isDefaultPassword = true;
    this.showValues = !this.showValues;
    if (this.showValues == true) {
      this.visibility = 'visibility_off';
    } else {
      this.visibility = 'visibility';
    }
  }

  shiftDetails: any[] = [];
  getShiftsByOrgId() {
    this.spinner.show();
    this.shiftDetails = [];
    this.manageShiftService.getShiftDetailsByOrgId(localStorage.getItem('OrgId')).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        let response = JSON.parse(data.map.data);
        if (response.length) {
          response.forEach(x => {
            this.shiftDetails.push({ id: x.id, name: x.shift, startTime: new Date(moment().format("YYYY-MM-DD") + " " + x.start_time), endTime: new Date(moment().format("YYYY-MM-DD") + " " + x.end_time)});
          });

          this.filteredshift.next(this.shiftDetails.slice());
          // listen for search field value changes
          this.shiftFilterCtrl.valueChanges
            .pipe(takeUntil(this._onDestroy))
            .subscribe(() => {
              this.filtershift();
            });

        } else {
          this.shiftDetails = [];
        }
      } else if (data.map.statusMessage == "Failed") {
        this.shiftDetails = [];
      } else {
        this.shiftDetails = [];
      }
      this.spinner.hide();
    })
  }

  @ViewChild('singleSelect') singleSelect: MatSelect;
  protected setInitialValue() {
    this.filteredshift
      .pipe(take(1), takeUntil(this._onDestroy))
      .subscribe(() => {
        this.singleSelect.compareWith = (a: any, b: any) => a && b && a.id === b.id;
      });
  }

  protected filtershift() {
    if (!this.shiftDetails) {
      return;
    }
    // get the search keyword
    let search = this.shiftFilterCtrl.value;
    if (!search) {
      this.filteredshift.next(this.shiftDetails.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
    // filter the banks
    this.filteredshift.next(
      this.shiftDetails.filter(bank => bank.name.toLowerCase().indexOf(search) > -1)
    );
  }
  getMobileNumberAndCountryCode() {
    this.spinner.show();
    let orgId = localStorage.getItem('OrgId');
    this.settingsService.getActiveMobileNumberSpecificDetailsByOrgId(orgId).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        let response = JSON.parse(data.map.data);
        this.mobileNumberCountryDetails.push(response);
      }
    })
  }
  checkMobileNumber(event) {
    this.editMobileNumber = false;
    if (this.empIdUpdate) {
      if (this.editedMobileNumber) {
        for (let i = 0; i < this.mobileNumberCountryDetails.length; i++) {
          if (this.mobileNumberCountryDetails[i].includes(event)) {
            if (event == this.editedMobileNumber) {
              this.editMobileNumber = false;
            } else {
              this.editMobileNumber = true;
            }
          }
        }
      }
    } else {
      if (this.UserFormGroup.value.mobilenumber) {
        for (let i = 0; i < this.mobileNumberCountryDetails.length; i++) {
          if (this.mobileNumberCountryDetails[i].includes(event)) {
            if (event == this.UserFormGroup.value.mobilenumber){
              this.editMobileNumber = true;
            } else {
              this.editMobileNumber = false;
            }
          }
        }
      }
    }
  }
}
