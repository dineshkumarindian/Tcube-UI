import { SelectionModel } from '@angular/cdk/collections';
import { DatePipe } from '@angular/common';
import { Component, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import {  MatCheckboxChange, } from '@angular/material/checkbox';
import {  MatDialog } from '@angular/material/dialog';
import {  DateAdapter } from '@angular/material/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ReplaySubject, Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { JobsService } from 'src/app/services/jobs.service';
import { ProjectsService } from 'src/app/services/projects.service';
import { RegisterService } from 'src/app/services/register.service';
import { SettingsService } from 'src/app/services/settings.service';
import { UtilService } from 'src/app/services/util.service';
import { DeleteComponent } from 'src/app/util/delete/delete.component';
import { SettingsBulkActiveDeactiveComponent } from '../manage-user/settings-bulk-active-deactive/settings-bulk-active-deactive.component';
import { SettingsBulkDeleteComponent } from '../settings-bulk-delete/settings-bulk-delete.component';
import { SettingsBulkUserOnBoardComponent } from '../manage-user/settings-bulk-user-onboard/settings-bulk-user-onboard.component';
import { ViewUserCountsComponent } from './view-user-counts/view-user-counts.component';
import { noDataMessage } from '../../util/constants';
import { ViewDetailsComponent } from '../manage-user/view-details/view-details.component';
import { ActivateClientUserComponent } from '../manage-user/activate-client-user/activate-client-user.component';
import { ActivateDeactivateComponent } from '../manage-user/activate-deactivate/activate-deactivate.component';
// import { ActivateDeactivateComponent } from '../activate-deactivate/activate-deactivate.component';
import { BulkDeleteDialogComponent } from '../../util/bulk-delete-dialog/bulk-delete-dialog.component';
import { ActivateDialogComponent } from '../../util/activate-dialog/activate-dialog.component';
import { DeactivateDialogComponent } from '../../util/deactivate-dialog/deactivate-dialog.component';
import { BulkActivateDialogComponent } from '../../util/bulk-activate-dialog/bulk-activate-dialog.component';
import { BulkDeactivateDialogComponent } from '../../util/bulk-deactivate-dialog/bulk-deactivate-dialog.component';
import { NotificationService } from 'src/app/services/notification.service';
import * as moment from 'moment-timezone';
import * as tablePageOption from '../../util/table-pagination-option';

import { UpdateReportingManagerComponent } from './update-reporting-manager/update-reporting-manager.component';
import { ManageBranchDetailsService } from 'src/app/services/manage-branch/manage-branch-details.service';
import { MatSelect } from '@angular/material/select';
export interface UserData {
  id: string;
  name: string;
  progress: string;
  color: string;
}

@Component({
  selector: 'app-manage-user',
  templateUrl: './manage-user.component.html',
  styleUrls: ['./manage-user.component.less']
})
export class ManageUserComponent implements OnInit {

  noDataFoundMessage = noDataMessage;
  is_default_leavetype_created: boolean;
  organizationName: string;
  password: any;
  employeeDetails: any[] = [];
  paginationTotalLength: number;
  empIdUpdate: any;
  isempEditEnabled: boolean = false;
  mailCheck: any = [];
  mailExists: boolean = false;
  empUpdateEmail: any;
  inactiveEmployeeDetails: any[] = [];
  isDefaultPass: boolean = false;
  defaultPass: any;
  customPass: any;
  selection = new SelectionModel(true, []);
  login_str: any;
  loginurl: any = '';
  modifiedstring: any;
  loginstr: string;
  roleDetails: any[] = [];
  roleDetailsData: any[] = [];
  empFilter: boolean = false;
  filterData: string;
  nodata: boolean = false;
  access = new UntypedFormControl("", [Validators.required]);
  accessList: string[] = [];
  pageSize: number = 10;
  tablePaginationOption:number[];
  inActiveEmpCnt : number = 0;
  org_count : number = 0;
  branchDetails:any[] = [];
  /** control for the selected clien */
  public designationCtrl: UntypedFormControl = new UntypedFormControl("", [Validators.required]);
  /** control for the selected clien */
  public roleCtrl: UntypedFormControl = new UntypedFormControl("", [Validators.required]);
  /** control for the selected project */
  public empCtrl: UntypedFormControl = new UntypedFormControl("", [Validators.required]);
  /** list of bill filtered by search keyword */
  public filteredEmps: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);
  /** control for the MatSelect filter keyword */
  public empFilterCtrl: UntypedFormControl = new UntypedFormControl();
  /** list of currency filtered by search keyword */
  public filteredRole: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);
  /** control for the MatSelect filter keyword */
  public roleFilterCtrl: UntypedFormControl = new UntypedFormControl();
  /** list of bill filtered by search keyword */
  public filteredAccess: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);
  /** control for the MatSelect filter keyword */
  public accessFilterCtrl: UntypedFormControl = new UntypedFormControl();

  public branchCtrl: UntypedFormControl = new UntypedFormControl("", [Validators.required]);

  public branchFilterCtrl: UntypedFormControl = new UntypedFormControl();

  public filteredbranch: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);

  public showAdminFormPass: boolean = true;
  public showUserFormPass: boolean = true;

  // @ViewChildren(MatPaginator) paginator = new QueryList<MatPaginator>();
  //  @ViewChildren(MatPaginator) inactivepaginator = new QueryList<MatPaginator>();
  
  // @ViewChildren(MatSort) sort = new QueryList<MatSort>();
  clickEventsubscription: Subscription;
  orgAdminData: any = [];
  constructor(
    private formBuilder: UntypedFormBuilder,
    private settingsService: SettingsService,
    private router: Router,
    public matDialog: MatDialog,
    private utilsService: UtilService,
    private registerService: RegisterService,
    private spinner: NgxSpinnerService,
    private projectsService: ProjectsService,
    private jobsService: JobsService,
    private domSanitizer: DomSanitizer,
    public datepipe: DatePipe,
    private dateAdapter: DateAdapter<Date>,
    private dialog: MatDialog,
    private notificationService: NotificationService,
    private manageBranchDetailsService: ManageBranchDetailsService,
  ) {
    this.clickEventsubscription = this.utilsService.getClickEventToRole().subscribe(() => {
      // this.selected.setValue(0);
      this.getActiveRoleDetailsByOrgId();
      this.getActiveBranchDetailsByOrgId();
      // this.getRoleByOrgidRoleid();
    })
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
    f_name: ['', [Validators.required, Validators.pattern("[A-Za-z]{2,32}")]],
    l_name: ['', [Validators.required, Validators.pattern("[A-Za-z]{1,32}")]],
    email: ['', [Validators.required, Validators.email, Validators.email, Validators.pattern(/^[a-z0-9!#$%&'*+\/=?^_`{|}~.-]+@[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*$/i)]],
    doj: ['', [Validators.required]],
    // radios: ['', [Validators.required]]
    // designation :['', [Validators.required]]
  });
  public userPassword: UntypedFormControl = new UntypedFormControl('', [Validators.required,
  Validators.minLength(6), this.noWhitespaceValidator,]);
  // Emptyspace validator function
  public noWhitespaceValidator(control: UntypedFormControl) {
    const isSpace = (control.value || '').match(/\s/g);
    return isSpace ? { 'whitespace': true } : null;
  }
  /** Subject that emits when the component has been destroyed. */
  protected _onDestroy = new Subject<void>();
  Emp_id: any;
  Org_id: any; 
  newEmpData: any;
  TrailData :number[]=[0,0];
  TrailAccount : boolean = false;
  selectedBranchLength: any =[];
  branchAvail : boolean = false;
  ngOnInit() {
    this.Emp_id = localStorage.getItem('Id');
    this.Org_id = localStorage.getItem('OrgId');
    this.getTrialDetails();
    this.getInactiveEmpCount();
    this.inactiveUser = false;
    if (localStorage.getItem('RouteToInactiveEmp') == "true") {
      this.getInactiveEmpDetails();
    }
    else {
      this.geEmployeeDetailsByOrgId();
    }
    this.getOrgDetailById();
    this.getBranchDetailsByOrgId();
    this.getActiveRoleDetailsByOrgId();
    this.getActiveBranchDetailsByOrgId();
    this.getAllEmployeeDetailsToGetEmail();
    // this.getCustomAllEmpDetailsByOrgID();
    //  this.redirectToRole();
  }

  // getCustomAllEmpDetailsByOrgID(){
  //   this.settingsService.getCustomAllEmpDetailsByOrgID(this.Org_id).subscribe(data =>{
  //     console.log(data);
  //     if(data.map.statusMessage == 'Success'){
  //       console.log(JSON.parse(data.map.data));
  //     }
  //   })
  // }
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  inActiveUserRedirect() {
    this.listUser = [];
    this.selection_1.clear();
    localStorage.setItem('RouteToInactiveEmp', "true");
    this.inactiveUser = true;
    this.branchCtrl.reset();
    this.branchAvail = false;
    this.getInactiveEmpDetails();
    (<HTMLInputElement>document.getElementById('searchText')).value = '';
  }
  protected filterAccess() {
    if (!this.accessList) {
      return;
    }
    // get the search keyword
    let search = this.accessFilterCtrl.value;
    if (!search) {
      this.filteredAccess.next(this.accessList.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
    // filter the client
    this.filteredAccess.next(
      this.accessList.filter(bill => bill.toLowerCase().indexOf(search) > -1)
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
  getColor(i) {
    return this.branchDetailsWithColor[i].color;
  }
  getOrgDetailById() {
    let orgId = localStorage.getItem('OrgId');
    this.registerService.getOrgDetailsById(orgId).subscribe(data => {
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
  resetform(data) {
    if (data == "User") {
      this.UserFormGroup.reset();
      this.designationCtrl = new UntypedFormControl("", [Validators.required]);
      this.roleCtrl = new UntypedFormControl("", [Validators.required]);
      this.empCtrl = new UntypedFormControl("", [Validators.required]);
      this.password = "";
    }
  }
  public userdetails: boolean = false;
  validatePass: boolean = false;
  toggleuser() {
    this.resetform("User");
    this.userPassword.setValue('');
    this.showAdminFormPass = true;
    this.userdetails = !this.userdetails;
    if (this.empIdUpdate && this.isempEditEnabled) {
      this.empCtrl = new UntypedFormControl('');
      this.empFormValue();

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
  toggleInactiveUser() {
    this.inactiveEmployeeDetails = [];
    this.listUser = [];
    this.selection_1.clear();
    // this.empDataSource = new MatTableDataSource();
    this.inactiveUser = true;
    this.getInactiveEmpDetails();
    this.getActiveRoleDetailsByOrgId();
    this.getActiveBranchDetailsByOrgId();
  }
  edit: boolean = false;
  toggleActiveUser() {
    this.employeeDetails = [];
    this.listUser = [];
    this.selection_1.clear();
    this.branchCtrl.reset();
    this.branchAvail = false;
    this.inactiveUser = false;
    this.getInactiveEmpCount();
    this.geEmployeeDetailsByOrgId();
    this.getActiveRoleDetailsByOrgId();
    this.getActiveBranchDetailsByOrgId();
    (<HTMLInputElement>document.getElementById('searchText')).value = '';
  }
  toggleUser() {
    this.password = '';
    this.showUserFormPass = false;
  }

  setPassword() {
    this.validatePass = false;
    this.showUserFormPass = true;
    let word = this.organizationName.split(' ');
    let nW = word[0];
    this.password = nW.charAt(0).toUpperCase() + nW.slice(1).toLowerCase() + "#1";
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

  reporting_m: any;
  isOrgAdmin: boolean = false;

  empFormValue() {
    this.spinner.show();
    this.inactiveUser = false;
    let role = localStorage.getItem("Role");
    this.settingsService.getActiveEmpDetailsById(this.empIdUpdate).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        let response = JSON.parse(data.map.data);
        this.UserFormGroup.get('f_name').setValue(response.firstname);
        this.UserFormGroup.get('l_name').setValue(response.lastname);
        this.UserFormGroup.get('email').setValue(response.email);
        this.empUpdateEmail = response.email;
        this.designationCtrl.setValue(response.designationDetails.id);
        if (response.user_login_type == 'OrgAdmin') {
          this.isOrgAdmin = true;
          this.empCtrl = new UntypedFormControl("", [Validators.required]);
        // } else if (response.isReportingManagerAvail == true) {
        } else {
          this.empCtrl.setValue(response.reporting_manager);
        }
        let doj = new Date(response.date_of_joining);
        this.UserFormGroup.get('doj').setValue(doj);
        // this.UserFormGroup.get('role').setValue(response.roleDetails.id);
        this.roleCtrl.setValue(response.roleDetails.id);
        this.updateEmpEvent(response.roleDetails.id);
        let word = this.organizationName.split(' ');
        let nW = word[0];
        let newPass = nW.charAt(0).toUpperCase() + nW.slice(1).toLowerCase() + "#1";
        if (response.password == newPass) {
          this.defaultPass = newPass;
          // this.password= this.organizationName.toLowerCase()+"#1";
          this.customPass = '';
          this.setPassword();
        }
        else {
          // this.showAdminFormPass= false;
          this.password = '';
          this.customPass = response.password;
          this.userPassword.setValue(response.password);
          this.toggleUser();
          // this.password= response.password;
        }
      }
      this.spinner.hide();
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
    })
  }
  empDataSource = new MatTableDataSource();
  displayedColumnsEmp: string[] = ['select', 'id', 'firstname', 'reporting_manager','branch', 'designation', 'role', 'actions'];
  selection_1 = new SelectionModel(true, []);
  geEmployeeDetailsByOrgId() {
    this.spinner.show();
    this.inactiveUser = false;
    this.empFilter = false;
    let orgId = localStorage.getItem("OrgId");
    //before used method --> getActiveEmpDetailsByOrgId()
    //Here I have used the get ACTIVE EMPLOYEE DETAILS API call --> Means its get all user details under the Organization Id
    this.settingsService.getCustomActiveEmpDetailsByOrgID(orgId).subscribe(async data => {
      if (data.map.statusMessage == "Success") {
        let response: any[] = JSON.parse(data.map.data);
        this.tablePaginationOption = tablePageOption.tablePaginationOption(response.length);
        if (response.length > 0) {
          this.employeeDetails = response;
          
          this.orgAdminData = this.employeeDetails.filter(employee => employee.role == "OrgAdmin"); // to store the orgadmin data
          this.paginationTotalLength = this.employeeDetails.length;
          this.empDataSource = new MatTableDataSource(this.employeeDetails);
          
           this.empDataSource.sort = this.sort;
           this.empDataSource.paginator = this.paginator;
          this.nodata = false;
        }
        else {
          this.nodata = true;
          this.empDataSource = new MatTableDataSource();
           this.empDataSource.sort = this.sort;
           this.empDataSource.paginator = this.paginator;
        }
        this.spinner.hide();
      }
      else {
        this.empDataSource = new MatTableDataSource();
        this.empDataSource.sort = this.sort;
        this.empDataSource.paginator = this.paginator;
        this.nodata = true;
        setTimeout(() => {
          this.spinner.hide();
        }, 1000);
      }
      // load the initial emp list
      this.filteredEmps.next(this.employeeDetails.slice());
      // listen for search field value changes
      this.empFilterCtrl.valueChanges
        .pipe(takeUntil(this._onDestroy))
        .subscribe(() => {
          this.filteremp();
        });

      this.spinner.hide();
      // }, (error) => {
      //   this.router.navigate(["/404"]);
      //   this.spinner.hide();
    })
  }
  inactiveUser: boolean = false;
  getInactiveEmpDetails() {
    localStorage.removeItem("RouteToInactiveEmp");
    this.spinner.show();
    this.inactiveUser = true;
    this.empFilter = false;
    let orgId = localStorage.getItem("OrgId");
    //before used method --> getInactiveEmpDetailsByOrgId()
    this.settingsService.getCustomInactiveEmpDetailsByOrgID(orgId).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        let response: any[] = JSON.parse(data.map.data);
        this.tablePaginationOption = tablePageOption.tablePaginationOption(response.length);
        this.inActiveEmpCnt = response.length;
        if (response.length > 0) {
          this.inactiveEmployeeDetails = response;
          this.paginationTotalLength = this.inactiveEmployeeDetails.length;
          this.empDataSource = new MatTableDataSource(this.inactiveEmployeeDetails);
           this.empDataSource.sort = this.sort;
           this.empDataSource.paginator = this.paginator;
          this.nodata = false;
        }
        else {
          this.nodata = true;
          this.empDataSource = new MatTableDataSource();
           this.empDataSource.sort = this.sort;
           this.empDataSource.paginator = this.paginator;
        }
        this.spinner.hide();
      }
      else {
        this.empDataSource = new MatTableDataSource();
        this.empDataSource.sort = this.sort;
        this.empDataSource.paginator = this.paginator;
        this.nodata = true;
      }

      // }, (error) => {
      //   this.router.navigate(["/404"]);
      //   this.spinner.hide();
    })
  }
  getInactiveEmpCount() {   
    let orgId = localStorage.getItem("OrgId");
    this.settingsService.getCustomInactiveEmpDetailsByOrgID(orgId).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        let response: any[] = JSON.parse(data.map.data);
        this.inActiveEmpCnt = response.length;
       
      }
    })
  }
  // bulk deactivate User
  isAll_Selected() {
    const numSelected = this.selection_1.selected.length;
    const numRows = this.empDataSource.data.length;
    return numSelected === numRows;
  }
  master_Toggle() {
    if (this.isAll_Selected()) {
      this.selection_1.clear();
      return;
    } else {
      this.empDataSource.data.forEach(row => this.selection_1.select(row));
    }
  }
  list_Project = [];
  select_all: boolean = false;
  projectCheck_1(ob: MatCheckboxChange, id) {
    this.select_all = !this.select_all;
    if (ob.checked == true) {
      this.list_Project.push(id);
    } else if (ob.checked == false) {
      this.list_Project = [];
    }

  }
  // bulk_deleteUser() {
  //   this.listUser = [];
  //   for (var i = 0; i < this.selection_1.selected.length; i++) {
  //     this.listUser.push(this.selection_1.selected[i].id)
  //   }
  // }
  applyFilterEmp(event: Event) {
    this.empFilter = false;
    this.filterData = (event.target as HTMLInputElement).value;
    const filterValue = (event.target as HTMLInputElement).value;
    this.empDataSource.filter = filterValue.trim().toLowerCase();

    if (this.empDataSource.filteredData.length == 0) {
      this.empFilter = true;
    } 
    if (this.empDataSource.paginator) {
      // this.empDataSource.paginator = this.paginator.toArray()[0];
      this.empDataSource.paginator = this.paginator;
    }
  }
  bulkDeactiveUserDetails() {
    // let isDelete = "deactivateUser";
    const dialogRef = this.dialog.open(BulkDeactivateDialogComponent, {
      width: '35%',
      panelClass: 'custom-viewdialogstyle',
      data: { key: "deactivate-user", showComment: true }
      // data: { header: isDelete, deleteList: this.listUser }
    })
    dialogRef.afterClosed().subscribe(
      resp => {
        if (resp != undefined && resp != null) {
          let comment = '';
          if (resp.data == true) {
            comment = resp.comments;
            this.bulkDeactivateUser(comment);
          }
        } else {
          this.selection.clear();
          this.listUser = [];
          this.toggleActiveUser();
        }
      }
    );
  }
  // bulk deactivate User
  bulkDeactivateUser(comment) {
    this.spinner.show();
    this.url = window.location.href;
    this.url = this.url.split("/");
    let data: Object = {
      "deleteIds": this.listUser,
      "action": "activated",
      "comments": comment,
      "org_id" : this.Org_id, // to change reporting manager as org admin for users who has these deactivated users as reporting manager
      "url": this.url[2]
    }
    this.settingsService.bulkDeactivateUserDetails(data).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        this.utilsService.openSnackBarAC("Users deactivated successfully", "OK");
        this.selection.clear();
        this.listUser = [];
        this.toggleActiveUser();
        this.getInactiveEmpCount();
        // this.dialogRef.close();
      }
      else {
        this.utilsService.openSnackBarMC("Failed to deactive user details", "OK");
      }
      this.spinner.hide();
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
      // this.dialogRef.close();
    })
  }
  bulkActiveUserDetails() {
    // let isDelete = "activateUser";
    const dialogRef = this.dialog.open(BulkActivateDialogComponent, {
      width: '30%',
      panelClass: 'custom-viewdialogstyle',
      data: { key: "activate-user", showComment: true }
      // data: { header: isDelete, login_str: this.login_str, deleteList: this.listUser }
    })
    dialogRef.afterClosed().subscribe(
      resp => {
        if (resp != undefined && resp != null) {
          let comment = '';
          if (resp.data = true) {
            comment = resp.comments;
            this.bulkActivateUser(comment);
          }
        } else {
          this.selection.clear();
          this.listUser = [];
          this.toggleInactiveUser()
        }
      }
    );

  }
  // bulk activate User
  bulkActivateUser(comment: any) {
    this.spinner.show();
    let data: Object = {
      "deleteIds": this.listUser,
      "action": "deactivated",
      "comments": comment,
      "login_str": this.login_str
    }

    this.settingsService.bulkActivateUserDetails(data).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        this.utilsService.openSnackBarAC("Users activated successfully", "OK");
        this.selection.clear();
        this.listUser = [];
        this.toggleInactiveUser();
        this.spinner.hide();
        // this.dialogRef.close();
      }
      else {
        this.utilsService.openSnackBarMC("Failed to active Users details", "OK");
        this.spinner.hide();
      }

    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
      // this.dialogRef.close();
    })
  }
  importBulkUserOnboard() {
    const dialogRef = this.dialog.open(SettingsBulkUserOnBoardComponent, {
      width: '70%',
      height: '700px',
      position: { left: '0' },
      panelClass: 'custom-viewdialogstyle',
      data: { users: this.employeeDetails.length + this.inActiveEmpCnt, userLimit: this.TrailAccount? this.TrailData[1]:this.org_count, trial:this.TrailAccount }
    })
    dialogRef.afterClosed().subscribe(
      result => {
        this.toggleActiveUser();
      }
    );
  }
  activateEmployee(id) {
    this.settingsService.setEmployeeId(id);
    const dialogRef = this.matDialog.open(ActivateDialogComponent, {
      width: '35%',
      panelClass: 'custom-viewdialogstyle',
      data: { key: "activate-user", showComment: true }
    });
    dialogRef.afterClosed().subscribe(
      result => {
        if (result != null && result != undefined) {
          let comment = '';
          if (result.data == true) {
            comment = result.comments;
            this.activateUser(comment);
          }
        }

      })
  }
  activateUser(comment: any) {
    this.spinner.show();
    let data: Object = {
      "id": localStorage.getItem("EmpDeleteId"),
      "status": "activated",
      "comments": comment,
      "login_str": this.login_str
    }

    this.settingsService.activateEmployee(data).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        this.utilsService.openSnackBarAC("User activated successfully", "OK");
        this.toggleInactiveUser();
        // this.dialogRef.close();
      }
      else {
        this.utilsService.openSnackBarMC(data.map.data, "OK");
      }
      this.spinner.hide();
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
      // this.dialogRef.close();
    })
  }
  deactivateEmployee(id) {
    this.settingsService.setEmployeeId(id);
    const dialogRef = this.matDialog.open(DeactivateDialogComponent, {
      width: '35%',
      panelClass: 'custom-viewdialogstyle',
      data: { key: 'deactivate-user', showComment: true }
    });

    dialogRef.afterClosed().subscribe(
      result => {
        if (result != undefined && result != null) {
          let comment = '';
          if (result.data == true) {
            comment = result.comments;
            this.deactivateUser(comment);
          }
        }


      })
  }
  url :any =[]
  deactivateUser(comment: any) {
    this.spinner.show();
    this.url = window.location.href;
    this.url = this.url.split("/");
    let data: Object = {
      "id": localStorage.getItem("EmpDeleteId"),
      "status": "activated",
      "comments": comment,
      "org_id" : this.Org_id,
      "url": this.url[2]
    }
    this.settingsService.deactivateEmployee(data).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        this.utilsService.openSnackBarAC("User deactivated successfully", "OK");
        this.notification();
        this.toggleActiveUser();
        // this.dialogRef.close();
      }
      else {
        this.utilsService.openSnackBarMC(data.map.data, "OK");
      }
      this.spinner.hide();
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
      // this.dialogRef.close();
    })
  }
  viewUserdetails(header, element) {
    let headerData = '';
    let key = '';
    if (header == "user") {
      headerData = "View User Details";
      this.matDialog.open(ViewDetailsComponent, {
        width: '50%',
        maxHeight: '450px',
        panelClass: 'custom-viewdialogstyle',
        data: { key: header, headerData: headerData, mainData: element }
      });
    }
  }
  BulkdeleteUser = false;
  bulk_delete_User() {
    this.listUser = [];
    for (var i = 0; i < this.selection_1.selected.length; i++) {
      this.listUser.push(this.selection_1.selected[i].id)
    }
    this.listUser = this.listUser.filter((user) => user != this.orgAdminData[0].id);
    if (this.listUser.length >= 2) {
      this.BulkdeleteUser = true;
    }
    else {
      this.BulkdeleteUser = false
    }
  }

  UserBulkDelete() {
    const dialogRef = this.dialog.open(BulkDeleteDialogComponent, {
      width: '35%',
      panelClass: 'custom-viewdialogstyle',
      data: { key: "employee-user", showComment: false }
      // data: { header: " User Bulk ", deleteList: this.listUser }

    })
    dialogRef.afterClosed().subscribe(
      resp => {
        if (resp != undefined && resp != null) {
          if (resp.data == true) {
            this.bulkDeleteUser();
          }
        }
        this.selection_1.clear();
        this.listUser = [];
        this.BulkdeleteUser = false;
        this.inactiveEmployeeDetails = [];
        // this.getInactiveEmpDetails();
        // this.spinner.hide();
        // this.getActiveLeaveTypeDetailsByOrgId();
      }
    );
  }
  // bulk delete for user
  bulkDeleteUser() {
    this.spinner.show();
    let data: Object = {
      "deleteIds": this.listUser,
    }
    this.settingsService.bulkdeleteUser(data).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        this.utilsService.openSnackBarAC("Users deleted successfully", "OK");
        this.selection_1.clear();
        this.listUser = [];
        this.BulkdeleteUser = false;
        this.inactiveEmployeeDetails = [];
        // this.getInactiveEmpDetails();
        this.toggleInactiveUser();
        // this.dialogRef.close();
      }
      else {
        this.utilsService.openSnackBarMC("Failed to delete bulk user", "OK");
      }
      this.spinner.hide();
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
      // this.dialogRef.close();
    })
  }
  roleDetailsWithColor: any[] = [];
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
        // to validate duplicate role
        // this.roleDetailsData.push(this.roleDetails[i].role);
      }
      this.roleDetailsWithColor = dummy;

      // load the initial bill list
      this.filteredRole.next(this.roleDetails.slice());

      // listen for search field value changes
      this.roleFilterCtrl.valueChanges
        .pipe(takeUntil(this._onDestroy))
        .subscribe(() => {
          this.filterRole();
        });
      // this.roleDataSource = new MatTableDataSource(this.roleDetails);
      // this.roleDataSource.sort = this.sort.toArray()[0];
      // this.roleDataSource.paginator = this.paginator.toArray()[0];
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
    })
  }
  branchDetailsWithColor: any[] = [];
  getActiveBranchDetailsByOrgId() {
    let dummy = [];
    let OrgId = localStorage.getItem("OrgId");
    this.manageBranchDetailsService.getBranchesByOrgId(OrgId).subscribe(data => {
      let response = JSON.parse(data.map.data);
      this.branchDetails = response;
      // for (let i = 0; i < this.branchDetails.length; i++) {
      //   this.roleDetails[i].access_to = JSON.parse(this.branchDetails[i].access_to);
      // }
      for (var i = 0; i < this.branchDetails.length; i++) {
        var letters = '0123456789ABCDEF';
        var color = '#';
        for (var j = 0; j < 6; j++) {
          color += letters[Math.floor(Math.random() * 16)];
        }
        dummy.push({ branch: this.branchDetails[i].branch, active_total_counts: this.branchDetails[i].active_total_counts, inactive_total_counts: this.branchDetails[i].inactive_total_counts, color: color })
        // to validate duplicate role
        // this.roleDetailsData.push(this.roleDetails[i].role);
      }
      this.branchDetailsWithColor = dummy;
  })
}
  accessHint = [];
  someMethod(role) {
    this.accessHint = role.access_to;
  }
  updateEmpEvent(event) {
    this.settingsService.getRoleById(event).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        let res = JSON.parse(data.map.data);
        this.accessHint = JSON.parse(res.access_to);
      }
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
    })
  }
  viewUsers(data) {
    this.matDialog.open(ViewUserCountsComponent, {
      width: '50%',
      maxHeight: '305px',
      panelClass: 'custom-viewdialogstyle',
      data: { list: data, inactiveUser: this.inactiveUser }
    });
  }
  deleteEmployeeDialog(id) {
    this.settingsService.setEmployeeId(id);
    let screenWidth = screen.availWidth;
    if (screenWidth <= 750) {
      const dialogRef = this.matDialog.open(DeleteComponent, {
        width: '35%',
        panelClass: 'custom-viewdialogstyle',
        data: { key: "delete-user", showComment: false },
        // panelClass: 'custom-viewdialogstyle',data: { component: "User", header: "User Delete" },
      });
      dialogRef.afterClosed().subscribe(
        result => {
          if (result != undefined && result != "") {
            if (result.data == true) {
              this.deleteEmp(id);
            }
          }
        })
    } else {
      const dialogRef = this.matDialog.open(DeleteComponent, {
        width: '35%',
        panelClass: 'custom-viewdialogstyle',
        data: { key: "delete-user", showComment: false },
        // panelClass: 'custom-viewdialogstyle',data: { component: "User", header: "User Delete" },
      });
      dialogRef.afterClosed().subscribe(
        result => {
          if (result != undefined && result != "") {
            if (result.data == true) {
              this.deleteEmp(id);
            }
          }
        })
    }
  }
  deleteEmp(id) {
    this.spinner.show();
    id = localStorage.getItem("EmpDeleteId");
    this.settingsService.deleteEmployee(id).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        this.utilsService.openSnackBarAC("User deleted successfully", "OK");
        this.inactiveEmployeeDetails = [];
        // this.getInactiveEmpDetails();
        this.toggleInactiveUser(); 
      }
      else {
        this.utilsService.openSnackBarMC("Failed to delete user details", "OK");
      }
      this.spinner.hide();
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
    })
  }
  editEmployee(id) {
    this.router.navigate(["edit-user/" + id]);
  }
  selected = new UntypedFormControl(0);
  redirectToRole() {
    this.utilsService.sendActiveRole();
  }

  redirectToUpdatePage(id) {
    this.router.navigate(["edit-user/" + id]);
  }
  resetUserTable() {
    this.branchCtrl.reset();
    this.branchAvail = false;
    if(this.inactiveUser == false) {
      this.toggleActiveUser();
    } else {
      this.toggleInactiveUser();
    }
  }
  //notification service
  notification() {
    let zone = moment.tz.guess();
    let message = "Org admin Deactivated your account"
    let formdata = {
      "org_id": this.Org_id,
      "message": message,
      "to_notify_id": localStorage.getItem("EmpDeleteId"),
      "notifier": this.Emp_id,
      "module_name": "Manage-User",
      "sub_module_name": "Deactivated-User",
      "timesheet_id": "",
      "date_of_request": "",
      "approval_status": "",
      "timezone": zone,
    }
    this.notificationService.postNotification(formdata).subscribe(data => {
      if (data.map.statusMessage == "Success") {
      }
      else {
      }
    })
  }
   //pagination size
   changePage(event){
    this.pageSize = event.pageSize;
  }

  // update/add the reporting manager
  UEReportingMAnager(title,id,current_manager){
    const dialogRef = this.matDialog.open(UpdateReportingManagerComponent, {
      width: '25%',
      height: '165px',
      panelClass: 'custom-viewdialogstyle',
      data: { key: title, id: id, current_manager: current_manager}
    });
    dialogRef.afterClosed().subscribe(resp =>{
      if (resp != undefined && resp != null) {
        if (resp.data == true) {
          this.geEmployeeDetailsByOrgId();
        }
      }
    }
    )
  }

    // Get Trail details 
    getTrialDetails() {
      if (localStorage.getItem('TrialAccount') == "true") {
        this.TrailAccount = true;
        this.spinner.show();
        this.getInactiveEmpCount();
        this.registerService.getTrialDetails().subscribe(data => {
  
          if (data.map.statusMessage == "Success") {
            this.TrailData= JSON.parse(data.map.data);
            // console.log(this.TrailData);
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
      else{
        this.TrailAccount = false;
      }
     
    }
    resetFilter(){
      (<HTMLInputElement>document.getElementById('searchText')).value = '';
      this.geEmployeeDetailsByOrgId();
    }
  
  selectedBranchEvent(event){
    this.branchAvail = true;
    if(!this.inactiveUser) {
    this.selectedBranchLength = this.employeeDetails.filter(a => a.branch_id == event.value);
    } else {
      this.selectedBranchLength = this.inactiveEmployeeDetails.filter(a => a.branch_id == event.value);
    }
    this.empDataSource = new MatTableDataSource(this.selectedBranchLength);
    this.empDataSource.sort = this.sort;
    this.empDataSource.paginator = this.paginator;
  }

  @ViewChild('branchSelect', { static: false }) branchSelect: MatSelect
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
  Branchnameset() {
    this.branchName = this.branchFilterCtrl.value;
  }
  // resend mail to new user if mail is invalid while creating that user
  resendMail(id) {
    this.spinner.show();
      let formdata = {
        "id": id,
        "login_str": this.login_str
      }
      this.registerService.resendMailToOrg(formdata).subscribe(data => {
        if(data.map.statusMessage == "Success" && data.map.data == "Mail sent successfully") {
          this.utilsService.openSnackBarAC("Mail sent successfully", "OK");
          this.toggleActiveUser();
        } else  if(data.map.statusMessage == "Success" && data.map.Error == "Error in sending details due to invalid mail check the configuration details"){
          if(localStorage.getItem("Role") != 'org_admin') {
          this.utilsService.openSnackBarMC("Mail configuration issue encountered, please contact admin", "OK");
          } else {
            this.utilsService.openSnackBarMC("Mail configuration issue encountered, please check it", "OK");
          }
        } else {
          this.utilsService.openSnackBarMC("Failed to send mail", "OK");
        }
        setTimeout(() => {
          this.spinner.hide();
        }, 2000);
      })
    }
}