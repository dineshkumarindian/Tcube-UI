import { Component, OnInit, QueryList, ViewChildren } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { SelectionModel } from '@angular/cdk/collections';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { ReplaySubject, Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { NgxSpinnerService } from 'ngx-spinner';
import { RegisterService } from 'src/app/services/register.service';
import { SettingsBulkDeleteComponent } from '../settings-bulk-delete/settings-bulk-delete.component';
import { SettingsService } from 'src/app/services/settings.service';
import { UtilService } from 'src/app/services/util.service';
import { DeleteComponent } from '../../util/delete/delete.component';
import { noDataMessage } from '../../util/constants';
import { BulkDeleteDialogComponent } from '../../util/bulk-delete-dialog/bulk-delete-dialog.component';
import * as tablePageOption from '../../util/table-pagination-option';

@Component({
  selector: 'app-manage-designation',
  templateUrl: './manage-designation.component.html',
  styleUrls: ['./manage-designation.component.less']
})
export class ManageDesignationComponent implements OnInit {

  noDataFoundMessage = noDataMessage;
  ifDesignationAvail: boolean = false;
  ifDesignationIdAvail: boolean = false;
  designationIdUpdate: any;
  designationFilter: boolean = false;
  isDesignationEditEnabled: boolean = false;
  designationDetailsData: any[] = [];
  designationDetails: any[] = [];
  is_default_leavetype_created: boolean;
  organizationName: string;
  employeeDetails: any[] = [];
  mailCheck: any = [];
  listDesignation: any[];
  filterData: string;
  nodata: boolean = false;
  public showAdminFormBtn: boolean = true;	
  administratorData:any =[];
  // public showAdminFormBtn: boolean = true;
  tablePaginationOption:number[];

  /** control for the selected clien */
  public designationCtrl: UntypedFormControl = new UntypedFormControl("", [Validators.required]);

  /** control for the MatSelect filter keyword */
  public designationFilterCtrl: UntypedFormControl = new UntypedFormControl();

  /** list of currency filtered by search keyword */
  public filtereddesignation: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);

  /** list of bill filtered by search keyword */
  public filteredEmps: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);
  /** control for the MatSelect filter keyword */
  public empFilterCtrl: UntypedFormControl = new UntypedFormControl();

  //Designation formgroup
  DesignationFormGroup: UntypedFormGroup = this.formBuilder.group({
    designation: ['', [Validators.required]],
    responsibilities: [''],
  })
  @ViewChildren(MatPaginator) paginator = new QueryList<MatPaginator>();
  @ViewChildren(MatSort) sort = new QueryList<MatSort>();
  constructor(
    private formBuilder: UntypedFormBuilder,
    private settingsService: SettingsService,
    private router: Router,
    public matDialog: MatDialog,
    private utilsService: UtilService,
    private spinner: NgxSpinnerService,
    private registerService: RegisterService,
    private dialog: MatDialog,
    // public dialogRef:MatDialog<ManageDesignationComponent>,
  ) {
  }

  /** Subject that emits when the component has been destroyed. */
  protected _onDestroy = new Subject<void>();

  ngOnInit() {
    this.getOrgDetailById();
    this.getActiveDesignationDetailsByOrgId();
  }

  public designationdetails: boolean = false;
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

  toggleDesignation() {
    this.selection_designation.clear();
    this.Bulkdeletedesignation = false
    this.resetform("Designation");
    this.ifDesignationAvail = false;
    this.designationdetails = !this.designationdetails;
    if (this.designationIdUpdate && this.isDesignationEditEnabled) {
      this.designationFormValue();
    } else {
      this.designationIdUpdate = null;
      this.getActiveDesignationDetailsByOrgId();
    }
    this.isDesignationEditEnabled = !this.isDesignationEditEnabled;
    this.selection_designation.clear();
    this.Bulkdeletedesignation = false;
  }

  designationDataSource = new MatTableDataSource();
  selection_designation = new SelectionModel(true, []);
  displayedColumnsDesignation: string[] = ['selector', 'designation', 'designation_responsibilities', 'action'];

  getActiveDesignationDetailsByOrgId() {
    this.designationDetailsData = []; // for validating duplicate designation
    let OrgId = localStorage.getItem("OrgId");
    this.settingsService.getActiveDesignationDetailsByOrgId(OrgId).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        let response = JSON.parse(data.map.data);
        this.tablePaginationOption = tablePageOption.tablePaginationOption(response.length);
        if (response.length > 0) {
          this.designationDetails = response;
          // for validating duplicate designation
          for (let i = 0; i < this.designationDetails.length; i++) {
            this.designationDetailsData.push(this.designationDetails[i].designation);
          }

          this.administratorData = response.filter( res => res.designation == "Administrator"); /// get the administrator data only

          // load the initial bill list
          this.filtereddesignation.next(this.designationDetails.slice());

          // listen for search field value changes
          this.designationFilterCtrl.valueChanges
            .pipe(takeUntil(this._onDestroy))
            .subscribe(() => {
              this.filterDesignation();
            });

          this.designationDataSource = new MatTableDataSource(this.designationDetails);
          this.designationDataSource.sort = this.sort.toArray()[0];
          this.designationDataSource.paginator = this.paginator.toArray()[0];
          this.nodata = false;
        }
        else {
          this.nodata = true;
          this.designationDataSource = new MatTableDataSource(this.designationDetails);
          this.designationDataSource.sort = this.sort.toArray()[0];
          this.designationDataSource.paginator = this.paginator.toArray()[0];
        }
        this.spinner.hide();
      }
      else {
        this.nodata = true;
        this.designationDataSource = new MatTableDataSource(this.designationDetails);
        this.designationDataSource.sort = this.sort.toArray()[0];
        this.designationDataSource.paginator = this.paginator.toArray()[0];
      }
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
    })
  }

  resetform(data) {
    if (data == "Designation") {
      this.DesignationFormGroup.reset();
    }
  }
  designationFormValue() {
    this.spinner.show();
    this.settingsService.getDesignationById(this.designationIdUpdate).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        let response = JSON.parse(data.map.data);
        this.DesignationFormGroup.get('designation').setValue(response.designation);
        this.DesignationFormGroup.get('responsibilities').setValue(response.designation_responsibilities);
      }
      this.spinner.hide();
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
    })
  }
  editDesignation(id) {
    this.isDesignationEditEnabled = true;
    this.designationIdUpdate = id;
    this.ifDesignationIdAvail = true;
    this.toggleDesignation();
    this.router.navigate(["edit-designation/" + id]);
  }
  deleteDesignationDialog(id) {
    this.settingsService.setDesignationId(id);
    const dialogRef = this.matDialog.open(DeleteComponent, {
      width: '35%',
      panelClass: 'custom-viewdialogstyle',
      data: { key: "designation-delete", showComment: false },
    });
    dialogRef.afterClosed().subscribe(
      result => {
        if (result != undefined && result != "") {
          if (result.data == true) {
            this.deleteDesignation(id);
          }
        }
      })
  }
  deleteDesignation(id) {
    this.spinner.show();
    id = localStorage.getItem("designationId");
    this.settingsService.deleteDesignation(id).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        this.utilsService.openSnackBarAC("Designation deleted successfully", "OK");
        this.getActiveDesignationDetailsByOrgId();
        // this.dialogRef.close();
      }
      else {
        this.utilsService.openSnackBarMC("Failed to delete designation", "OK");
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
  isAllSelecteddesigantion() {
    const numSelected = this.selection_designation.selected.length;
    const numRows = this.designationDataSource.data.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  toggleAllRowsDesignation() {
    if (this.isAllSelecteddesigantion()) {
      this.selection_designation.clear();
      return;
    }

    this.selection_designation.select(...this.designationDataSource.data);
  }
  Bulkdeletedesignation = false;
  bulk_delete_Designation() {
    this.listDesignation = [];
    for (var i = 0; i < this.selection_designation.selected.length; i++) {
      this.listDesignation.push(this.selection_designation.selected[i].id)
    }
    this.listDesignation = this.listDesignation.filter((designation) => designation != this.administratorData[0].id);
    if (this.listDesignation.length >= 2) {
      this.Bulkdeletedesignation = true;
    }
    else {
      this.Bulkdeletedesignation = false
    }
  }
  DesignationBulkDelete() {
    const dialogRef = this.dialog.open(BulkDeleteDialogComponent, {
      width: '35%',
      panelClass: 'custom-viewdialogstyle',
      data: { key: "designation", showComment: false }

    })
    // deleteList: this.listDesignation
    dialogRef.afterClosed().subscribe(
      resp => {
        if (resp != undefined && resp != null) {
          if (resp.data == true) {
            this.bulkDeleteDesignation();
          }
        }
        this.selection_designation.clear();
        this.listDesignation = [];
        this.Bulkdeletedesignation = false;
        // this.getActiveDesignationDetailsByOrgId();
        // this.spinner.hide();
        // this.getActiveLeaveTypeDetailsByOrgId();
      }
    );
  }
  // bulk delete for designation
  bulkDeleteDesignation() {
    this.spinner.show();
    let data: Object = {
      "deleteIds": this.listDesignation,
    }
    this.settingsService.bulkdeleteDesignation(data).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        this.utilsService.openSnackBarAC("Designations deleted successfully", "OK");
        this.selection_designation.clear();
        this.listDesignation = [];
        this.Bulkdeletedesignation = false;
        this.getActiveDesignationDetailsByOrgId();
        // this.dialogRef.close();
      }
      else {
        this.utilsService.openSnackBarMC("Failed to delete Designation", "OK");
      }
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
      //  this.dialogRef.close();
    })
    setTimeout(() => {
      this.spinner.hide();
    }, 1000);
  }

  applyFilterDesignation(event: Event) {
    this.designationFilter = false;
    this.filterData = (event.target as HTMLInputElement).value;
    const filterValue = (event.target as HTMLInputElement).value;
    this.designationDataSource.filter = filterValue.trim().toLowerCase();
    if (this.designationDataSource.filteredData.length == 0) {
      this.designationFilter = true;
    }
    if (this.designationDataSource.paginator) {
      this.designationDataSource.paginator = this.paginator.toArray()[1];
    }
  }
  resetFilter(){
    (<HTMLInputElement>document.getElementById('searchDesignationText')).value = '';
    this.getActiveDesignationDetailsByOrgId();
  }
}
