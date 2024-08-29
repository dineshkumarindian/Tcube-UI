import { SelectionModel } from '@angular/cdk/collections';
import { DatePipe } from '@angular/common';
import { Component, ElementRef, OnInit, QueryList, ViewChildren } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { DateAdapter } from '@angular/material/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ReplaySubject, Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { JobsService } from 'src/app/services/jobs.service';
import { ManageattendanceService } from 'src/app/services/manageattendance.service';
import { ProjectsService } from 'src/app/services/projects.service';
import { RegisterService } from 'src/app/services/register.service';
import { SettingsService } from 'src/app/services/settings.service';
import { UtilService } from 'src/app/services/util.service';
import { DeleteComponent } from 'src/app/util/delete/delete.component';
import { SettingsBulkDeleteComponent } from '../settings-bulk-delete/settings-bulk-delete.component';
// import { AccessData, UserData } from '../settings.component';
import {noDataMessage} from '../../util/constants';
import {BulkDeleteDialogComponent} from '../../util/bulk-delete-dialog/bulk-delete-dialog.component';
// import { AccessData, RoleData, UserData } from '../settings.component';
import * as tablePageOption from '../../util/table-pagination-option';



export interface RoleData {
  role: string;
  action: string;
}

@Component({
  selector: 'app-manage-role',
  templateUrl: './manage-role.component.html',
  styleUrls: ['./manage-role.component.less']
})
export class ManageRoleComponent implements OnInit {

  noDataFoundMessage = noDataMessage;
  inactiveRole: boolean = false;
  heading: string;
  selection = new SelectionModel(true, []);
  Bulkdeleteroleicon: boolean = false;
  ifRoleNameAvail: boolean = false;
  ifRoleIdAvail: boolean = false;
  isRoleEditEnabled: boolean = false;
  roleIdUpdate: any;
  access = new UntypedFormControl("", [Validators.required]);
  accessList: string[] = [];
  roleDetails: any[] = [];
  roleDetailsData: any[] = [];
  listRole: any[];
  roleFilter: boolean = false;
  selectedRole: any;
  selectedAccess = ['dashboard'];
  selectedAccessList = [];
  filterData: string;
  // dataSource: MatTableDataSource<UserData>;
  displayedColumns1: string[] = ['role', 'action'];
  dataSource1: MatTableDataSource<RoleData>;
  displayedColumns2: string[] = ['role', 'action'];
  nodata : boolean = false;
  // dataSource2: MatTableDataSource<AccessData>;
  public showAdminForm: boolean = false;
  public showAdminFormBtn: boolean = true;
  public clientdetails: boolean = false;
  public showAdminFormPass: boolean = true;
  employeeDetails: any[] = [];
  is_default_leavetype_created: boolean;
  organizationName: string;
  mailCheck: any = [];
  tablePaginationOption:number[];

  @ViewChildren(MatPaginator) paginator = new QueryList<MatPaginator>();
  @ViewChildren(MatSort) sort = new QueryList<MatSort>();

   /** control for the MatSelect filter keyword */
   public empFilterCtrl: UntypedFormControl = new UntypedFormControl();
  /** control for the selected project */
  public accessCtrl: UntypedFormControl = new UntypedFormControl("", [Validators.required]);
   /** control for the selected project */
   public accesslist: UntypedFormControl = new UntypedFormControl("", [Validators.required]);
   /** list of bill filtered by search keyword */
  public filteredAccess: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);
   /** control for the MatSelect filter keyword */
   public accessFilterCtrl: UntypedFormControl = new UntypedFormControl();
   /** list of currency filtered by search keyword */
  public filteredRole: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);
  /** control for the MatSelect filter keyword */
  public roleFilterCtrl: UntypedFormControl = new UntypedFormControl();
  /** control for the selected project */
  public empCtrl: UntypedFormControl = new UntypedFormControl("", [Validators.required]);
  /** list of bill filtered by search keyword */
  public filteredEmps: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);
  
  clickEventsubscription:Subscription;
  orgRoleData: any = [];
  constructor(
    private formBuilder: UntypedFormBuilder,
    private settingsService: SettingsService,
    private router: Router,
    public matDialog: MatDialog,
    private utilsService: UtilService,
    private registerService: RegisterService,
    private spinner: NgxSpinnerService,
    public datepipe: DatePipe,
    private dialog: MatDialog,
    public elRef: ElementRef) {
      // this.clickEventsubscription = this.utilsService.getActiveRole().subscribe(()=>{
      //   this.getActiveRoleDetailsByOrgId();
      //   this.getRoleByOrgidRoleid();
      // })
     }
    /** Subject that emits when the component has been destroyed. */
  protected _onDestroy = new Subject<void>();
 //Role formgroup
 RoleFormGroup: UntypedFormGroup = this.formBuilder.group({
  new_role: ['', [Validators.required]],
})
  ngOnInit() {
    this.getRoleByOrgidRoleid();
    this.getOrgDetailById();
    this.getActiveRoleDetailsByOrgId();
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
  // protected filteremp() {
  //   if (!this.employeeDetails) {
  //     return;
  //   }
  //   // get the search keyword
  //   let search = this.empFilterCtrl.value;
  //   if (!search) {
  //     this.filteredEmps.next(this.employeeDetails.slice());
  //     return;
  //   } else {
  //     search = search.toLowerCase();
  //   }
  //   // filter the client
  //   this.filteredEmps.next(
  //     this.employeeDetails.filter(list => list.firstname.toLowerCase().indexOf(search) > -1)
  //   );
  // }
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
  empDataSource = new MatTableDataSource();
  public roledetails: boolean = false;
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
  roleDetailsWithColor: any[] = [];
  roleDataSource = new MatTableDataSource();
  displayedColumnsRole: string[] = ['selector', 'role', 'accessto', 'action'];
  selection_role = new SelectionModel(true, []);
  //  !!for bulk delete role
  isAllSelected2() {
    const numSelected = this.selection_role.selected.length;
    const numRows = this.roleDataSource.data.length;
    return numSelected === numRows;
  }
  //  !!Selects all rows if they are not all selected; otherwise clear selection
  toggleAllRows1() {
    if (this.isAllSelected2()) {
      this.selection_role.clear();
      return;
    }
    this.selection_role.select(...this.roleDataSource.data);
  }
  bulk_deleted2() {
    this.listRole = [];
    for (var i = 0; i < this.selection_role.selected.length; i++) {
      this.listRole.push(this.selection_role.selected[i].id)
    }
    this.listRole = this.listRole.filter((data) => data != this.orgRoleData[0].id);
    if (this.listRole.length >= 2) {
      this.Bulkdeleteroleicon = true;
    }
    else {
      this.Bulkdeleteroleicon = false
    }
  }
  //  !!For role Bulk delete conformation dialogbox
  bulkDeleteRoleConfirm() {
    let isDelete = "Role";
    const dialogRef = this.dialog.open(BulkDeleteDialogComponent, {
      width: '40%',
      panelClass: 'custom-viewdialogstyle',
      data :{key:"role",showComment:false }
      // data: { header: "Role", deleteList: this.listRole }
    })
    dialogRef.afterClosed().subscribe(
      resp => {
        if(resp != null && resp != undefined){
          if(resp.data == true){
            this.bulkDeleteRoleData();
          }
        }
        this.selection_role.clear();
        this.listRole = [];
        this.Bulkdeleteroleicon = false;
        // this.getActiveRoleDetailsByOrgId();
      }
    );
  }
  //Bulk delete roles
  bulkDeleteRoleData() {
    this.spinner.show();
    let data: Object = {
      "deleteIds": this.listRole,
    }
    this.settingsService.bulkdeleteRole(data).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        this.utilsService.openSnackBarAC("Roles deleted successfully", "OK");
        this.selection_role.clear();
        this.listRole = [];
        this.Bulkdeleteroleicon = false;
        this.getActiveRoleDetailsByOrgId();
        // this.dialogRef.close();
      }
      else {
        this.utilsService.openSnackBarMC("Failed to delete roles", "OK");
      }
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
      // this.dialogRef.close();
    })
    setTimeout(() => {
      this.spinner.hide();
    }, 1000);
  }
  getActiveRoleDetailsByOrgId() {
    let dummy = [];
    let OrgId = localStorage.getItem("OrgId");
    this.settingsService.getActiveRoleDetailsByClientId(OrgId).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        // this.utilsService.sendClickEventToRole();
      let response = JSON.parse(data.map.data);
      this.tablePaginationOption = tablePageOption.tablePaginationOption(response.length);
      if(response.length>0){
      this.roleDetails = response;
      for (let i = 0; i < this.roleDetails.length; i++) {
        this.roleDetails[i].access_to = JSON.parse(this.roleDetails[i].access_to);
      }
      // console.log(this.roleDetails);
      this.orgRoleData = this.roleDetails.filter( res => res.role == "OrgAdmin"); /// get the administrator data only
      // console.log(this.orgRoleData);
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
      this.nodata = false;
      }
      else {
        this.nodata = true;
        this.roleDataSource = new MatTableDataSource(this.roleDetails);
        this.roleDataSource.sort = this.sort.toArray()[0];
        this.roleDataSource.paginator = this.paginator.toArray()[0];
      }
      this.spinner.hide();
    }
    else {
      this.nodata = true;
      this.roleDataSource = new MatTableDataSource(this.roleDetails);
      this.roleDataSource.sort = this.sort.toArray()[0];
      this.roleDataSource.paginator = this.paginator.toArray()[0];
    }
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
    })
  }
  roleFormValue() {
    this.spinner.show();
    this.settingsService.getRoleById(this.roleIdUpdate).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        let response = JSON.parse(data.map.data);
        this.RoleFormGroup.get('new_role').setValue(response.role);
        this.accessCtrl.setValue(JSON.parse(response.access_to));
      }
      this.spinner.hide();
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
    })
  }
  resetform(data) {
     if (data == "Role") {
      this.RoleFormGroup.reset();
      this.accessCtrl = new UntypedFormControl("", [Validators.required]);
    }
    else if (data == "Access") {
      this.empCtrl = new UntypedFormControl("", [Validators.required]);
      this.selectedAccessList = [];
    }

  }
  resetFilter(){
    (<HTMLInputElement>document.getElementById('searchRoleText')).value = '';
    this.getActiveRoleDetailsByOrgId();
  }
  editRole(id) {
    this.isRoleEditEnabled = true;
    this.ifRoleIdAvail = true;
    this.roleIdUpdate = id;
    this.toggleRole();
    this.router.navigate(["edit-role/"+id]);

  }

  deleteRoleDialog(id) {
    this.settingsService.setRoleId(id);
    const dialogRef = this.matDialog.open(DeleteComponent, {
      width: '40%',
      panelClass: 'custom-viewdialogstyle',
      data:{ key:"role-delete",showComment:false },
    });
    dialogRef.afterClosed().subscribe(
      result => {
        if (result != undefined && result != "") {
          if (result.data == true) {
            this.deleteRole(id);
          }
        }
      })
  }
  // delete role 
  deleteRole(id) {
    this.spinner.show();
    id = localStorage.getItem("roleDeleteId");
    this.settingsService.deleteRole(id).subscribe(data => {
        if (data.map.statusMessage == "Success") {
          this.utilsService.openSnackBarAC("Role deleted successfully", "OK");
          this.roleDetails = [];
        this.getActiveRoleDetailsByOrgId();
        }
        else {
          this.utilsService.openSnackBarMC("Failed to delete role", "OK");
        }
      }, (error) => {
        this.router.navigate(["/404"]);
        this.spinner.hide();
      })
      setTimeout(() => {
        this.spinner.hide();
      }, 1000);
  }

  applyFilterRole(event: Event) {
    this.roleFilter = false;
    this.filterData = (event.target as HTMLInputElement).value;
    const filterValue = (event.target as HTMLInputElement).value;
    this.roleDataSource.filter = filterValue.trim().toLowerCase();
    if (this.roleDataSource.filteredData.length == 0) {
      this.roleFilter = true;
    }
    if (this.roleDataSource.paginator) {
      this.roleDataSource.paginator = this.paginator.toArray()[0];
    }
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
        // this.utilsService.sendClickEventToRole();
        let response = JSON.parse(data.map.data);
        this.accessList = JSON.parse(response.access_to);
        // load the initial bill list
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
}
