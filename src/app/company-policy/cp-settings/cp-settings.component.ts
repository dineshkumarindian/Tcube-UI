import { CUSTOM_ELEMENTS_SCHEMA, Component, ElementRef, NO_ERRORS_SCHEMA, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { Router } from '@angular/router';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule, DatePipe } from '@angular/common';
import { CompanyPolicyService } from 'src/app/services/company-policy.service';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { SelectionModel } from '@angular/cdk/collections';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { UntypedFormControl } from '@angular/forms';
import { ReplaySubject, Subject } from 'rxjs';
import * as tablePageOption from '../../util/table-pagination-option';
import { takeUntil } from 'rxjs/operators';
import { NgxSpinnerService } from 'ngx-spinner';
import { DateAdapter } from '@angular/material/core';
import { DeleteComponent } from 'src/app/util/delete/delete.component';
import { MatDialog } from '@angular/material/dialog';
import { UtilService } from 'src/app/services/util.service';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormField, MatFormFieldControl } from '@angular/material/form-field';
import { BulkDeleteDialogComponent } from 'src/app/util/bulk-delete-dialog/bulk-delete-dialog.component';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { noDataMessage } from '../../util/constants';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { MatTooltipModule, MatTooltip } from '@angular/material/tooltip';

@Component({
  selector: 'app-cp-settings',
  templateUrl: './cp-settings.component.html',
  styleUrls: ['./cp-settings.component.less'],
  standalone: true,
  imports: [MatMenuModule, MatButtonModule, CommonModule, MatTableModule, MatPaginatorModule, MatIconModule, MatCheckboxModule,
    MatFormFieldModule, MatInputModule, MatSelectModule, MatTooltipModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
})
export class CpSettingsComponent implements OnInit {
  noDataFoundMessage = noDataMessage;
  isAddPolicy: boolean = false;
  ispolicyDataShowing: boolean = false;
  Org_id: any;
  policyList: any[] = [];
  policyDetails: any[] = [];
  tablePaginationOption: number[];
  nodata: boolean = false;
  listPolicy: any[];
  policyFilter: boolean = false;
  pageSize: number = 10;
  filterData: string;
  policyDataSource = new MatTableDataSource();
  selection_policy = new SelectionModel(true, []);
  listProject = [];
  select_all: boolean = false;
  policyContent: any = [];
  pdfUrl: SafeResourceUrl ;
  pdfData: Blob;
  isPolicyPdfOrNot: boolean = true;
  displayedColumnsPolicy: string[] = ['selector', 'policyname', 'issuedDate', 'modified_time', 'action'];
  @ViewChildren(MatPaginator) paginator = new QueryList<MatPaginator>();
  @ViewChildren(MatSort) sort = new QueryList<MatSort>();
  @ViewChild("myTooltip") myTooltip: MatTooltip;
  public policyFilterCtrl: UntypedFormControl = new UntypedFormControl();
  /** list of currency filtered by search keyword */
  public filteredPolicy: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);

  constructor(public router: Router, public policyService: CompanyPolicyService,
    public datepipe: DatePipe, public matDialog: MatDialog, public utilService: UtilService,
    private dateAdapter: DateAdapter<Date>,private sanitizer: DomSanitizer,
    private spinner: NgxSpinnerService, public elRef: ElementRef) {

  }
  protected _onDestroy = new Subject<void>();
  ngOnInit(): void {
    this.Org_id = localStorage.getItem('OrgId');
    this.getActivePolicyByOrgId();
  }

  policyData: any[] = [];
  policyNameList: any = [];
  async getActivePolicyByOrgId() {
    this.spinner.show();
    this.ispolicyDataShowing = false;
    await this.policyService.getActivePolicyByOrgId(this.Org_id).subscribe((data) => {
      if (data.map.statusMessage == "Success") {
        let response = JSON.parse(data.map.data);
        this.tablePaginationOption = tablePageOption.tablePaginationOption(response.length);
        if (response.length > 0) {
          let policyDetails1 = response;
          // for validating duplicate designation
          // for (let i = 0; i < policyDetails1.length; i++) {
          //   this.policyData.push({"id":policyDetails1[i].id,"policyname": policyDetails1[i].policyname,"createddate": policyDetails1[i].issuedDate,"updatedate": policyDetails1[i].modified_time, "description": policyDetails1[i].description});
          // }
          this.policyData = response;
          // load the initial bill list
          this.filteredPolicy.next(this.policyData.slice());

          // listen for search field value changes
          this.policyFilterCtrl.valueChanges
            .pipe(takeUntil(this._onDestroy))
            .subscribe(() => {
              this.filterPolicyDetails();
            });

          this.policyDataSource = new MatTableDataSource(this.policyData);
          this.policyDataSource.sort = this.sort.toArray()[0];
          this.policyDataSource.paginator = this.paginator.toArray()[0];
          this.nodata = false;
        }
        else {
          this.nodata = true;
          this.policyDataSource = new MatTableDataSource();
          this.policyDataSource.sort = this.sort.toArray()[0];
          this.policyDataSource.paginator = this.paginator.toArray()[0];
        }
        this.spinner.hide();
      }
      else {
        this.nodata = true;
        this.policyDataSource = new MatTableDataSource();
        this.policyDataSource.sort = this.sort.toArray()[0];
        this.policyDataSource.paginator = this.paginator.toArray()[0];
        setTimeout(() => {
          this.spinner.hide();
        }, 2000);
      }
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
    })
}
  protected filterPolicyDetails() {
    if (!this.policyData) {
      return;
    }
    // get the search keyword
    let search = this.policyFilterCtrl.value;
    if (!search) {
      this.filteredPolicy.next(this.policyData.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
    // filter the client
    this.filteredPolicy.next(
      this.policyData.filter(designation => designation.policyname.toLowerCase().indexOf(search) > -1)
    );
  }
  public ispolicydetails: boolean = false;
  protected bulk_delete_Policy() {
    this.policyList = [];
    for (var i = 0; i < this.selection_policy.selected.length; i++) {
      this.policyList.push(this.selection_policy.selected[i].id)
    }
    if (this.policyList.length >= 2) {
      this.ispolicydetails = true;
    }
    else {
      this.ispolicydetails = false
    }
  }
  isAllSelectedPolicy() {
    const numSelected = this.selection_policy.selected.length;
    const numRows = this.policyDataSource.data.length;
    return numSelected === numRows;
  }
  /** Selects all rows if they are not all selected; otherwise clear selection. */
  toggleAllRowsPolicy() {
    if (this.isAllSelectedPolicy()) {
      this.selection_policy.clear();
      return;
    }
    this.selection_policy.select(...this.policyDataSource.data);
  }
  uploadButton() {
    this.isAddPolicy = false;
    this.router.navigate(["add-policy/" + false]);
  }
  navigateToAdd() {
    this.isAddPolicy = true;
    this.router.navigate(["add-policy/" + true]);
  }
  projectName: any = []
  policyBulkDelete() {
    this.listProject = [];
    this.projectName = [];
    for (var i = 0; i < this.selection_policy.selected.length; i++) {
      this.listProject.push(this.selection_policy.selected[i].id)
      this.projectName += (i + 1 != this.selection_policy.selected.length) ? (" " + this.selection_policy.selected[i].policyname + ",") : this.selection_policy.selected[i].policyname;
    }
  }
  applyFilterPolicy(event) {
    this.policyFilter = false;
    this.filterData = (event.target as HTMLInputElement).value;
    const filterValue = (event.target as HTMLInputElement).value;
    this.policyDataSource.filter = filterValue.trim().toLowerCase();
    if (this.policyDataSource.filteredData.length == 0) {
      this.policyFilter = true;
    }
    if (this.policyDataSource.paginator) {
      this.policyDataSource.paginator = this.paginator.toArray()[1];
    }
  }
  editPolicy(id) {
    this.isAddPolicy = true;
    this.router.navigate(["edit-policy/" + id + "/" + true]);
  }
  //pagination size
  changePage(event) {
    this.pageSize = event.pageSize;
  }
  deletePolicy(id) {
    this.policyService.setPolicyId(id);
    const dialogRef = this.matDialog.open(DeleteComponent, {
      width: '40%',
      panelClass: 'custom-viewdialogstyle',
      data: { key: "policy-delete", showComment: false },
    });
    dialogRef.afterClosed().subscribe(
      result => {
        if (result != undefined && result != "") {
          if (result.data == true) {
            this.deletePolicyDetails(id);
          }
        }
      })
  }
  // delete role 
  deletePolicyDetails(id) {
    this.spinner.show();
    id = localStorage.getItem("policyDeleteId");
    this.policyService.deletePolicy(id).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        this.utilService.openSnackBarAC("Policy deleted successfully", "OK");
        this.policyData = [];
        this.getActivePolicyByOrgId();
        this.spinner.hide();
      }
      else {
        this.utilService.openSnackBarMC("Failed to delete policy", "OK");
      }
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
    })
    // setTimeout(() => {
    //   this.spinner.hide();
    // }, 1000);
  }

  bulkDeletePolicy() {
    const dialogRef = this.matDialog.open(BulkDeleteDialogComponent, {
      width: '35%',
      panelClass: 'custom-viewdialogstyle',
      data: { key: "policy", showComment: false }

    })
    // deleteList: this.listDesignation
    dialogRef.afterClosed().subscribe(
      resp => {
        if (resp != undefined && resp != null) {
          if (resp.data == true) {
            this.bulkdelete_Policy(this.policyList, "delete");
            this.selection_policy.clear();
          }
        }
        this.policyList = [];
        this.ispolicydetails = false;
      }
    );
  }
  bulkdelete_Policy(id, key) {
    this.spinner.show();
    let formData = {
      "deleteIds": id
    }
    this.policyService.bulkdelete(formData).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        this.utilService.openSnackBarAC("Policy details " + key + "d" + " successfully", "OK");
        // this.selection.clear();
        this.policyList = [];
        this.getActivePolicyByOrgId();
        // this.dialog.closeAll();
      }
      else if (data.map.statusMessage == "Failed") {
        this.utilService.openSnackBarMC("Failed to " + key + " policy details", "OK");
      } else {
        this.utilService.openSnackBarMC("Error while " + key + "ing policy details", "OK");
      }
    })
  }
  viewThePolicyNotes(id) {
    this.spinner.show();
    this.ispolicyDataShowing = true;
    this.policyService.getPolicybyId(id).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        let response = JSON.parse(data.map.data);
        this.policyContent = response;
        if(this.policyContent?.description) {
          this.isPolicyPdfOrNot= false;
        }
        else if(this.policyContent?.policy_pdfFormat) {
          this.isPolicyPdfOrNot= true;
        const uint8Array = new Uint8Array(this.policyContent.policy_pdfFormat);
        this.pdfData = new Blob([uint8Array], { type: 'application/pdf' }); // Assuming 'pdfData' is the property name containing PDF data
        this.pdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(URL.createObjectURL(this.pdfData));
      }
    }
      this.spinner.hide();
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
    })
  }
  backToPolicyTable() {
    this.ispolicyDataShowing = false;
  }
  getPdfHeight() {
    let height1 = window.innerHeight;
    return (height1 - 139);
  }
}
