import { SelectionModel } from '@angular/cdk/collections';
import { Component, OnInit, QueryList, ViewChildren } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import moment from 'moment';
import { NgxSpinnerService } from 'ngx-spinner';
import { ReplaySubject } from 'rxjs';
import { ManageShiftService } from 'src/app/services/manage-shift/manage-shift.service';
import { UtilService } from 'src/app/services/util.service';
import { BulkDeleteDialogComponent } from 'src/app/util/bulk-delete-dialog/bulk-delete-dialog.component';
import { noDataMessage } from 'src/app/util/constants';
import { DeleteComponent } from 'src/app/util/delete/delete.component';
import * as tablePageOption from '../../util/table-pagination-option';

@Component({
  selector: 'app-manage-shift',
  templateUrl: './manage-shift.component.html',
  styleUrls: ['./manage-shift.component.less']
})
export class ManageShiftComponent implements OnInit {
  org_id: any;
  noDataFoundMessage = noDataMessage;
  shiftList: any[] = [];
  displayedColumnsShift: string[] = ['selector', 'shift', 'startTime', 'endTime', 'totalHours', 'actions'];
  shiftDataSource = new MatTableDataSource();
  @ViewChildren(MatPaginator) paginator = new QueryList<MatPaginator>();
  @ViewChildren(MatSort) sort = new QueryList<MatSort>();
  tablePaginationOption:number[];
  constructor(private router: Router,
    public matDialog: MatDialog,
    private utilsService: UtilService,
    private spinner: NgxSpinnerService,
    private activatedRoute: ActivatedRoute,
    private utilService: UtilService,
    private manageShiftService: ManageShiftService) { }

  ngOnInit(): void {
    this.org_id = localStorage.getItem('OrgId');
    this.getShiftsByOrgId();
  }
  selection_shift = new SelectionModel(true, []);
  isAllSelectedShift() {
    const numSelected = this.selection_shift.selected.length;
    const numRows = this.shiftDataSource.data.length;
    return numSelected === numRows;
  }
  /** Selects all rows if they are not all selected; otherwise clear selection. */
  toggleAllRowsShift() {
    if (this.isAllSelectedShift()) {
      this.selection_shift.clear();
      return;
    }
    this.selection_shift.select(...this.shiftDataSource.data);
  }

  BulkDeleteShift = false;
  bulk_delete_shift() {
    this.shiftList = [];
    for (var i = 0; i < this.selection_shift.selected.length; i++) {
      this.shiftList.push(this.selection_shift.selected[i].id)
    }
    // this.listDesignation = this.listDesignation.filter((designation) => designation != this.administratorData[0].id);
    if (this.shiftList.length >= 2) {
      this.BulkDeleteShift = true;
    }
    else {
      this.BulkDeleteShift = false
    }
  }

  //getAll shift details by orgid
  shiftDetails: any[] = [];
  nodata: boolean = false;
  getShiftsByOrgId() {
    this.spinner.show();
    this.shiftDetails = [];
    this.manageShiftService.getShiftDetailsByOrgId(this.org_id).subscribe(data => {
      this.shiftDataSource = new MatTableDataSource();
      this.shiftDataSource.sort = this.sort.toArray()[0];
      this.shiftDataSource.paginator = this.paginator.toArray()[0];
      if (data.map.statusMessage == "Success") {
        let response = JSON.parse(data.map.data);
        // this.shiftDetails = response;
        if (response.length) {
          response.forEach(x => {
            x.start_time = new Date(moment().format("YYYY-MM-DD") + " " + x.start_time);
            x.end_time = new Date(moment().format("YYYY-MM-DD") + " " + x.end_time);
          });
          this.shiftDetails = response;
          this.nodata = false;
          this.shiftDataSource = new MatTableDataSource(this.shiftDetails);
          this.shiftDataSource.sort = this.sort.toArray()[0];
          this.shiftDataSource.paginator = this.paginator.toArray()[0];
          this.tablePaginationOption = tablePageOption.tablePaginationOption(response.length);
        } else {
          this.shiftDetails = [];
          this.nodata = true
        }
      } else if (data.map.statusMessage == "Failed") {
        this.nodata = true;
        this.shiftDetails = [];
      } else {
        this.nodata = true;
        this.shiftDetails = [];
      }
      this.spinner.hide();
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
    })
  }

  editShift(id) {
    this.router.navigate(["edit-shift/" + id]);
  }

  //table filter functionality with required configs
  shiftFilter: boolean = false;
  filterData: string;
  /** control for the MatSelect filter keyword */
  public shiftFilterCtrl: UntypedFormControl = new UntypedFormControl();
  /** list of shift filtered by search keyword */
  public filteredShift: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);

  protected filterDesignation() {
    if (!this.shiftDetails) {
      return;
    }
    // get the search keyword
    let search = this.shiftFilterCtrl.value;
    if (!search) {
      this.filteredShift.next(this.shiftDetails.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
    // filter the shift
    this.filteredShift.next(
      this.shiftDetails.filter(x => x.shift.toLowerCase().indexOf(search) > -1)
    );
  }

  applyFiltershift(event: Event) {
    this.shiftFilter = false;
    this.filterData = (event.target as HTMLInputElement).value;
    const filterValue = (event.target as HTMLInputElement).value;
    this.shiftDataSource.filter = filterValue.trim().toLowerCase();
    if (this.shiftDataSource.filteredData.length == 0) {
      this.shiftFilter = true;
    }
    if (this.shiftDataSource.paginator) {
      this.shiftDataSource.paginator = this.paginator.toArray()[1];
    }
  }

  //delete functinality
  callDeleteShiftDialog(id){
    const dialogRef = this.matDialog.open(DeleteComponent, {
      width: '35%',
      panelClass: 'custom-viewdialogstyle',
      data: { key: "shift-delete", showComment: false },
    });
    dialogRef.afterClosed().subscribe(
      result => {
        if (result != undefined && result != "") {
          if (result.data == true) {
            this.shiftList = [];
            this.shiftList.push(id);
            this.deleteShift(this.shiftList, "delete");
          }
        }
      })
  }

  callBulkDeleteShift() {
    const dialogRef = this.matDialog.open(BulkDeleteDialogComponent, {
      width: '35%',
      panelClass: 'custom-viewdialogstyle',
      data: { key: "shift", showComment: false }

    })
    // deleteList: this.listDesignation
    dialogRef.afterClosed().subscribe(
      resp => {
        if (resp != undefined && resp != null) {
          if (resp.data == true) {
            this.deleteShift(this.shiftList, "delete");
            this.selection_shift.clear();
          }
        }
        this.shiftList = [];
        this.BulkDeleteShift = false;
      }
    );
  }
  deleteShift(id, key){
    this.spinner.show();
    let formData = {
      "deleteIds": id
    }
    this.manageShiftService.delete(formData).subscribe(data =>{
      if (data.map.statusMessage == "Success") {
        this.utilService.openSnackBarAC("Shift details " + key +"d"+ " successfully", "OK");
        // this.selection.clear();
        this.shiftList = [];
        this.getShiftsByOrgId();
        // this.dialog.closeAll();
      }
      else if(data.map.statusMessage == "Failed") {
        this.utilService.openSnackBarMC("Failed to "+key+" shift details", "OK");
      }else{
        this.utilService.openSnackBarMC("Error while "+key+"ing shift details", "OK");
      }
    })
  }
}
