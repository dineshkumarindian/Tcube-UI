import { SelectionModel } from '@angular/cdk/collections';
import { Component, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import {  MatSelect,   } from '@angular/material/select';
import {  MatDialog } from '@angular/material/dialog';
import {  MatOption } from '@angular/material/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ReplaySubject, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { RegisterService } from 'src/app/services/register.service';
import { SettingsService } from 'src/app/services/settings.service';
import { UtilService } from 'src/app/services/util.service';
// import { AccessData, RoleData, UserData } from '../../settings.component';
import {errorMessage,alreadyExistMessage,validFormat,characterLength} from '../../../util/constants';

@Component({
  selector: 'app-add-role',
  templateUrl: './add-role.component.html',
  styleUrls: ['./add-role.component.less']
})
export class AddRoleComponent implements OnInit {
  characterLength = characterLength;
  inactiveRole: boolean = false;
  heading: string;
  selection = new SelectionModel(true, []);
  Bulkdeleteroleicon: boolean = false;
  ifRoleNameAvail: boolean = false;
  ifRoleIdAvail: boolean = true;
  ifRoleAvail: boolean = false;
  isRoleEditEnabled: boolean = false;
  roleIdUpdate: any;
  access = new UntypedFormControl("", [Validators.required]);
  accessList: string[] = [];
  roleAccessList: any[] = [];
  roleDetails: any[] = [];
  roleDetailsData: any[] = [];
  listRole: any[];
  roleFilter: boolean = false;
  selectedRole: any;
  selectedAccess = ['dashboard'];
  selectedAccessList = [];
  filterData: string;
  displayedColumns1: string[] = ['role', 'action'];
  displayedColumns2: string[] = ['role', 'action'];
  public showAdminForm: boolean = false;
  public showAdminFormBtn: boolean = true;
  public clientdetails: boolean = false;
  public showAdminFormPass: boolean = true;
  employeeDetails: any[] = [];
  is_default_leavetype_created: boolean;
  organizationName: string;
  mailCheck: any = [];
  requiredMessage = errorMessage;
  existMessage = alreadyExistMessage;
  validFormatMessage = validFormat;
  @ViewChildren(MatPaginator) paginator = new QueryList<MatPaginator>();
  @ViewChildren(MatSort) sort = new QueryList<MatSort>();

  /** control for the selected project */
  public accessCtrl: UntypedFormControl = new UntypedFormControl("", [Validators.required]);
  /** control for the MatSelect filter keyword */
  public accessFilterCtrl: UntypedFormControl = new UntypedFormControl();
  /** list of bill filtered by search keyword */
  public filteredAccess: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);
  /** list of currency filtered by search keyword */
  public filteredRole: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);
  /** control for the MatSelect filter keyword */
  public roleFilterCtrl: UntypedFormControl = new UntypedFormControl();
  /** control for the selected project */
  public accesslist: UntypedFormControl = new UntypedFormControl("", [Validators.required]);

  /** control for the MatSelect filter keyword */
  public accessListFilterCtrl: UntypedFormControl = new UntypedFormControl();
  
  constructor(
    private formBuilder: UntypedFormBuilder,
    private settingsService: SettingsService,
    private router: Router,
    public matDialog: MatDialog,
    private utilsService: UtilService,
    private spinner: NgxSpinnerService,
    private registerService: RegisterService,
    private activatedRoute: ActivatedRoute,
  ) { }
  //Role formgroup
  RoleFormGroup: UntypedFormGroup = this.formBuilder.group({
    new_role: ['', [Validators.required, Validators.pattern(/(^[^\s]+(\s+[^\s]+)*$)/),Validators.maxLength(40)]],
  })
  /** Subject that emits when the component has been destroyed. */
  protected _onDestroy = new Subject<void>();
  ngOnInit() {
    // this.getRoleByOrgidRoleid();
    this.getOrgDetailById();
    this.getActiveRoleDetailsByOrgId();
    this.roleIdUpdate = this.activatedRoute.snapshot.params.id;
    if (this.roleIdUpdate) {
      this.roleFormValue();
    }
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
  getOrgDetailById() {
    let orgId = localStorage.getItem('OrgId');
    this.registerService.getOrgDetailsById(orgId).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        let response = JSON.parse(data.map.data);
        this.is_default_leavetype_created = response.is_leavetype_created;
        this.organizationName = response.company_name;
      }
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
    })
  }
 addRole() {
    this.spinner.show();
    let OrgId = localStorage.getItem("OrgId");
    let arr:any=[]
    for(let i=0;i<this.selectedAccess.length;i++){
      if(this.selectedAccess[i]!=undefined){
      arr.push(this.selectedAccess[i])
      }
      
    };
    let data: Object = {
      "role": this.RoleFormGroup.value.new_role,
      "org_id": OrgId,
      "access_to": JSON.stringify(arr)
    }
    this.settingsService.createRoleDetails(data).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        this.utilsService.openSnackBarAC("Role added successfully", "OK");
        // this.getActiveRoleDetailsByOrgId();
        // this.toggleRole();
        setTimeout(() => {
          localStorage.setItem("ManageRoleAction", "true");
          this.router.navigate(['/settings']);
        }, 500);
        this.selectedAccess = ['dashboard'];
      }
      else {
        this.utilsService.openSnackBarMC("Failed to add role", "OK");
      }
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
    })
    setTimeout(() => {
      this.spinner.hide();
    }, 1000);
  }


  public roledetails: boolean = false;
  public accessdetails: boolean = false;
  selection_role = new SelectionModel(true, []);
  toggleRole() {
    this.resetform("Role");
    this.getRoleByOrgidRoleid();
    this.selection.clear();
    this.selection_role.clear();
    this.Bulkdeleteroleicon = false;
    this.ifRoleNameAvail = false;
    this.roledetails = !this.roledetails;
    if (this.roleIdUpdate && this.isRoleEditEnabled) {
      this.roleFormValue();
    } else {
      this.roleIdUpdate = null;
      this.getActiveRoleDetailsByOrgId();
    }
    this.isRoleEditEnabled = !this.isRoleEditEnabled;
  }
  resetform(data) {
    if (data == "Role") {
      this.RoleFormGroup.reset();
      this.accessCtrl = new UntypedFormControl("", [Validators.required]);
    }
  }
  getActiveRoleDetailsByOrgId() {
    let dummy = [];
    let OrgId = localStorage.getItem("OrgId");
    this.settingsService.getActiveRoleDetailsByClientId(OrgId).subscribe(data => {
      let response = JSON.parse(data.map.data);
      this.roleDetails = response;
      this.getOrgadminRoleAccessTo(this.roleDetails);
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
         this.roleDetailsData.push(this.roleDetails[i].role);
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

      this.roleDataSource = new MatTableDataSource(this.roleDetails);
      this.roleDataSource.sort = this.sort.toArray()[0];
      this.roleDataSource.paginator = this.paginator.toArray()[0];
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
    })
  }
  
  // To check duplicate Role
  onCheckRole(event) {
    if (this.ifRoleIdAvail) {
      for (let i = 0; i < this.roleDetailsData.length; i++) {
        if (this.RoleFormGroup.get('new_role').value == this.roleDetailsData[i]) {
          this.roleDetailsData.splice(i, 1);
        }
      }
      this.ifRoleIdAvail = false;
    }
    for (let i = 0; i < this.roleDetailsData.length; i++) {
      if (this.roleDetailsData.find(x => x.toLowerCase() == event.toLowerCase()))
        this.ifRoleNameAvail = true;
      else
        this.ifRoleNameAvail = false;
    }

  }

  updateRole() {
    this.spinner.show();
    let OrgId = localStorage.getItem("OrgId");
    let arr:any=[];
    for(let i=0;i<this.selectedAccess.length;i++){
      if(this.selectedAccess[i]!=undefined){
      arr.push(this.selectedAccess[i])
      }
    };
    
    let data: Object = {
      "id": this.roleIdUpdate,
      "role": this.RoleFormGroup.value.new_role,
      "org_id": OrgId,
      "access_to": JSON.stringify(arr)
    }
    this.settingsService.updateRole(data).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        this.utilsService.openSnackBarAC("Role updated successfully", "OK");
        // this.getActiveRoleDetailsByOrgId();
        // this.toggleRole();
        setTimeout(() => {
          localStorage.setItem("ManageRoleAction", "true");
          this.router.navigate(['/settings']);
        }, 500);
        this.selectedAccess = ['dashboard'];
        
      }
      else {
        this.utilsService.openSnackBarMC("Failed to update role", "OK");
      }
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
    })
    setTimeout(() => {
      this.spinner.hide();
    }, 1000);
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

// capitalizing every first letter in role access dropdown 
  capitializingAccessDropdown(text) {
    const specialChars = '[`!@#$%^&*()_+-=[]{};\':"\\|,.<>/?~]/';
    let finalString = '';
    const splitSpecialChars = specialChars.split(''); // split above special char
    let splittedStrings = [];
    let existingSpecialChar;
    const isSpecialCharsPresent = splitSpecialChars.some(char => {
      if (text.includes(char)) {
        existingSpecialChar = char;
        splittedStrings = text.split(char);// split special char from text
        return true;
      }
      else {
        return false;
      }
    });
    if (isSpecialCharsPresent) {
      const capitalized = splittedStrings.length && splittedStrings.map(val => {
        return val = val.charAt(0).toUpperCase() + val.slice(1); // capitialize text which is with splitted special char
      });
      finalString = capitalized.join(existingSpecialChar); // again join text with special char
    }
    else {
      finalString = text.charAt(0).toUpperCase() + text.slice(1); // capitialize text which is without special char
    }
    return finalString;
  }

  projectString: any;
  splittedString: any;
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
        // load the initial access_to list
        this.filteredAccess.next(this.accessList.slice());

        // listen for search field value changes
        this.accessFilterCtrl.valueChanges
          .pipe(takeUntil(this._onDestroy))
          .subscribe(() => {
            this.filterAccess();
          });
      }
      else {
      }
      this.spinner.hide();
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
    })

  }

  // to get the orgadmin role deatails and load to the access_to dropdown values
  getOrgadminRoleAccessTo(data){
    this.spinner.show();
    this.accessList = [];
    let orgAdminRoles;
    data.forEach(x =>{
      if(x.role == "OrgAdmin"){
        orgAdminRoles = x;
      }
    })
    this.accessList = JSON.parse(orgAdminRoles.access_to);
      // load the initial access_to list
      this.filteredAccess.next(this.accessList.slice());

      // listen for search field value changes
      this.accessFilterCtrl.valueChanges
        .pipe(takeUntil(this._onDestroy))
        .subscribe(() => {
          this.filterAccess();
        });
    this.spinner.hide();
  }


  roleFormValue() {
    this.spinner.show();
    this.settingsService.getRoleById(this.roleIdUpdate).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        let response = JSON.parse(data.map.data);
        this.RoleFormGroup.get('new_role').setValue(response.role);
        this.accessCtrl.setValue(JSON.parse(response.access_to));
      }
      if(this.accessList.length==this.accessCtrl.value.length){
        this.allSelected=true; 
      }
      else{
        this.allSelected=false;
      }
      this.spinner.hide();
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
    })
  }
  roleDetailsWithColor: any[] = [];
  roleDataSource = new MatTableDataSource();
  
  canceltoggleRole() {
    localStorage.setItem("ManageRoleAction", "true");
    this.router.navigate(['/settings']);
  }
  backToRole() {
    localStorage.setItem("ManageRoleAction", "true");
    this.router.navigate(['/settings']);
  }

  /// ***************to select and unselcet function start********************///
  @ViewChild('select', { static: true }) select: MatSelect;
  allSelected = false;
  toggleAllSelection() {
    if (this.allSelected) {
      this.select.options.forEach((item: MatOption) => item.select());
    } else {
      this.select.options.forEach((item: MatOption) => {
        if(item.value!="dashboard"){
          item.deselect()
        }
      } );
    }
  }

  filterByUsers(){
  if(this.accessList.length==this.accessCtrl.value.length-1){
    this.allSelected=true; 
  }
  else{
    this.allSelected=false;
  }

  }
/// ***************to select and unselcet function end ********************///
}
