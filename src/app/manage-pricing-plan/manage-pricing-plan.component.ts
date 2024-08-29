import { SelectionModel } from '@angular/cdk/collections';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ManagePricingPlanService } from '../services/super-admin/manage-pricing-plan/manage-pricing-plan.service';
import { UtilService } from '../../app/services/util.service';
import { DeleteComponent } from '../util/delete/delete.component';
import { PricingPlanCommonDialogComponent } from './pricing-plan-common-dialog/pricing-plan-common-dialog.component';
import { noDataMessage } from '../util/constants';
import { BulkDeleteDialogComponent } from '../util/bulk-delete-dialog/bulk-delete-dialog.component';
import * as tablePageOption from '../util/table-pagination-option';
@Component({
  selector: 'app-manage-pricing-plan',
  templateUrl: './manage-pricing-plan.component.html',
  styleUrls: ['./manage-pricing-plan.component.less']
})
export class ManagePricingPlanComponent implements OnInit {

  noDataMsg = noDataMessage;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  displayedColumns: string[] = ['selector', 'plan', 'amount','users', 'days', 'modules', 'actions'];
  planDataSource = new MatTableDataSource();
  selection = new SelectionModel(true, []);
  pageSize: number = 10;
  tablePaginationOption: number[];
  Filter: boolean;
  filterData: string;
  noDataMsgPlan: boolean = false;
  constructor(private router: Router,
    private dialog: MatDialog,
    private spinner: NgxSpinnerService,
    private utilService: UtilService,
    private managePricingPlanService: ManagePricingPlanService) { }

  ngOnInit() {
    this.getAllPlanDetails();
  }
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.planDataSource.data.length;
    return numSelected === numRows;
  }
  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    if (this.isAllSelected()) {
      this.selection.clear();
      return;
    }

    this.selection.select(...this.planDataSource.data);
  }
  listplan = [];
  bulk_delete() {
    this.listplan = [];
    for (var i = 0; i < this.selection.selected.length; i++) {
      this.listplan.push(this.selection.selected[i].id)
    }
  }
  addplan() {
    this.router.navigate(['add-pricing-plan']);
  }
  nodata: boolean = false;
  allplandetails = [];
  //get pricing plan details 
  getAllPlanDetails() {
    this.spinner.show();
    this.allplandetails = [];
    this.managePricingPlanService.getAllPlanDetails().subscribe(data => {
      if (data.map.statusMessage == "Success") {
        let response: any[] = JSON.parse(data.map.data);
        this.tablePaginationOption = tablePageOption.tablePaginationOption(response.length);
        this.allplandetails = response;
        for (var i = 0; i < this.allplandetails.length; i++) {
          let word = this.allplandetails[i].currency;
          this.allplandetails[i].currency = word.split(' ').pop();
          this.allplandetails[i].modules = JSON.parse(this.allplandetails[i].modules);
        }
        this.planDataSource = new MatTableDataSource(this.allplandetails.reverse());
        this.planDataSource.sort = this.sort;
        this.planDataSource.paginator = this.paginator;
        this.nodata = false;
        this.noDataMsgPlan = true;
      }
      else {
        this.planDataSource = new MatTableDataSource();
        this.nodata = true;
      }
      this.spinner.hide();
    })
  }

  //edit pricing plan details
  editplan(id) {
    this.router.navigate(['edit-pricing-plan/' + id]);
  }

  //delete plan by id
  delete(id) {
    const dialogRef = this.dialog.open(DeleteComponent, {
      width: '30%',
      panelClass: 'custom-viewdialogstyle',
      data: { key: "pricing-delete", showComment: false },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result != undefined && result != "") {
        if (result.data == true) {
          this.deletePlanConfoirm(id);
        }
      }
    });
  }
  deletePlanConfoirm(id) {
    this.spinner.show();
    this.managePricingPlanService.delteById(id).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        this.utilService.openSnackBarAC("Pricing plan details deleted successfully", "OK");
      }
      else {
        this.utilService.openSnackBarMC("Failed to delete the pricing plan details", "OK")
      }
      this.getAllPlanDetails();
      this.spinner.hide();
    })
  }

  //view plan details
  viewPlanDetails(element) {
    const dialogRef = this.dialog.open(PricingPlanCommonDialogComponent, {
      width: '500px',
      // height: '228px',
      panelClass: 'customviewplan-dialogstyle',
      data: { header: "View Pricing Plan Details", data: element },
    });
  }

  // bulk delete , data: 
  bulkDeleteByCheckedIds() {
    const dialogRef = this.dialog.open(BulkDeleteDialogComponent, {
      width: '30%',
      panelClass: 'custom-viewdialogstyle',
      data: { key: "pricing-bulk-delete", showComment: false },
    });
    dialogRef.afterClosed().subscribe(response => {
      if (response != undefined && response != "") {
        if (response.data == true)
          this.bulkdeletePricingPlan();
      }
      this.selection.clear();
      this.listplan = [];
      // this.getAllPlanDetails();
    });

  }
  //bulk delete
  bulkdeletePricingPlan() {
    this.spinner.show()
    let ids = {
      "deleteIds": this.listplan
    }
    this.managePricingPlanService.bulkDeleteByIds(ids).subscribe(data => {
      // console.log(data);
      if (data.map.statusMessage == "Success") {
        this.utilService.openSnackBarAC("Pricing plan details bulk deleted successfully", "OK");
        this.selection.clear();
        this.listplan = [];
        this.getAllPlanDetails();
        // this.dialog.closeAll();
      }
      else {
        this.utilService.openSnackBarAC("Failed to bulk delete pricing plan details", "OK");
      }
      this.spinner.show();
    })
  }
  //pagination size
  changePage(event) {
    this.pageSize = event.pageSize;
  }

  applyProjectFilter(event: Event) {
    this.Filter = false;
    this.filterData = (event.target as HTMLInputElement).value;
    const filterValue = (event.target as HTMLInputElement).value;
    this.planDataSource.filter = filterValue.trim().toLowerCase();
    if (this.planDataSource.filteredData.length == 0) {
      this.Filter = true;
    }
    if (this.planDataSource.paginator) {
      this.planDataSource.paginator = this.paginator;
    }
  }
}
