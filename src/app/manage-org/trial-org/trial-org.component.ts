import { SelectionModel } from '@angular/cdk/collections';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTreeModule } from '@angular/material/tree';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { SettingsService } from '../../services/settings.service';
import { ManageOrgService } from '../../services/super-admin/manage-org/manage-org.service';
import { AddOrgComponent } from '.././add-org/add-org.component';
import { BulkActDeactComponent } from '.././bulk-act-deact/bulk-act-deact.component';
import { EditOrgComponent } from '.././edit-org/edit-org.component';
import { ViewOrgDetailsComponent } from '.././view-org-details/view-org-details.component';
import { noDataMessage } from '../../util/constants';
import { DeleteComponent } from '../../util/delete/delete.component';
import { BulkDeleteDialogComponent } from '../../util/bulk-delete-dialog/bulk-delete-dialog.component';
import { UtilService } from '../../services/util.service';
import { BulkDeactivateDialogComponent } from '../../util/bulk-deactivate-dialog/bulk-deactivate-dialog.component';
import { DeactivateDialogComponent } from '../../util/deactivate-dialog/deactivate-dialog.component';
import * as tablePageOption from '../../util/table-pagination-option';

@Component({
  selector: 'app-trial-org',
  templateUrl: './trial-org.component.html',
  styleUrls: ['./trial-org.component.less']
})
export class TrialOrgComponent implements OnInit {

 
  noDataMsg = noDataMessage;
  orgDetails: any = [];
  select_all: boolean = false;
  selected: boolean = false;
  Filter: boolean;
  filterData: string;
  listOrg: any[] = [];
  pending_req: number = 0;
  pageSize = 10;
  tablePaginationOption: number[];
  loginurl: string;
  loginstr: string;
  modifiedstring: string;
  login_str: string;
  noDataMsgOrg: boolean = false;


  constructor(
    private settingsService: SettingsService,
    private manageOrgService: ManageOrgService,
    private router: Router,
    private dialog: MatDialog,
    private spinner: NgxSpinnerService,
    private utilsService: UtilService
  ) {

  }

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  ngOnInit() {
    this.getallpendingdetails();
    this.getAllOrgdetails();
    this.loginurl = window.location.href;
    this.modifiedstring = this.loginurl.slice(0, this.loginurl.length - 13);
    this.loginstr = "login";
    this.login_str = this.modifiedstring.concat(this.loginstr.toString());
    // this.orgDataSource.paginator = this.paginator;
  }

  openVieworg(orgId:any) {
    let url:string = window.location.href;
    let location:any[] = url.split('/');
    this.router.navigate(['/view-org',orgId,location[4]]);
  }

  displayedColumns: string[] = ['selector', "organization_id", 'orgname', 'name', 'email', 'Approved_date', 'expiry_date', 'actions'];
  orgDataSource = new MatTableDataSource();
  selection = new SelectionModel(true, []);
  //get all org details
  nodata: boolean = true;
  getAllOrgdetails() {
    this.spinner.show();
    this.pageSize = 10;
    this.noDataMsgOrg = true;
    this.orgDetails = [];
    this.manageOrgService.getActiveOrgDetails().subscribe(data => {
      if (data.map.statusMessage == "Success") {
        let response: any[] = JSON.parse(data.map.data);
        this.tablePaginationOption = tablePageOption.tablePaginationOption(response.length);
        for (var i = 0; i < response.length; i++) {
          if ( response[i].status == "Trial") {
            this.orgDetails.push(response[i]);
          }
        }

        for (var i = 0; i < this.orgDetails.length; i++) {
          if (this.orgDetails[i].pricingPlanDetails) {
            let word = this.orgDetails[i].pricingPlanDetails.currency;
            this.orgDetails[i].pricingPlanDetails.currency = word.split(' ').pop();
            this.orgDetails[i].pricingPlanDetails.modules = JSON.parse(this.orgDetails[i].pricingPlanDetails.modules);
          }
        }
        if (this.orgDetails.length) {
          this.orgDataSource = new MatTableDataSource(this.orgDetails.reverse());
          this.orgDataSource.sort = this.sort;
          this.orgDataSource.paginator = this.paginator;
          this.nodata = false;
        }
        else {
          this.orgDataSource = new MatTableDataSource();
          this.nodata = false;
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

  addOrg() {
    const dialogRef = this.dialog.open(AddOrgComponent, {
      panelClass: 'custom-viewdialogstyle',
    });
    dialogRef.afterClosed().subscribe(
      resp => {
        this.ngOnInit();
      }
    );
  }
  editOrg(id) {
    this.manageOrgService.setOrgId(id);
    const dialogRef = this.dialog.open(EditOrgComponent, {
      panelClass: 'custom-viewdialogstyle',
    });
    dialogRef.afterClosed().subscribe(
      resp => {
        this.ngOnInit();
      }
    );
  }
  deleteOrg(id) {
    let isDelete = false;
    this.manageOrgService.setOrgId(id);
    const dialogRef = this.dialog.open(DeleteComponent, {
      width: '35%',
      panelClass: 'custom-viewdialogstyle',
      data: { key: "active-org", showComment: true }
    });
    dialogRef.afterClosed().subscribe(
      resp => {
        if (resp != undefined && resp != "") {
          if (resp.data == true) {
            let comment = resp.comment;
            this.deleteDetails(comment);
          } else {
            this.ngOnInit();
          }
        }
      }
    );
  }
  deleteDetails(comment: string) {
    this.spinner.show();
    let data: object = {
      "id": localStorage.getItem("organizationId"),
      "comments": comment,
    }
    this.manageOrgService.deleteOrg(data).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        this.utilsService.openSnackBarAC("Organization details deleted successfully", "OK");
        this.ngOnInit();
        // this.dialogRef.close();
      }
      else {
        this.utilsService.openSnackBarMC("Failed to delete organization details", "OK");
      }
      this.spinner.hide();
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
      // this.dialogRef.close();
    })
  }
  deactivateOrg(id) {
    this.manageOrgService.setOrgId(id);
    const dialogRef = this.dialog.open(DeactivateDialogComponent, {
      width: '37%',
      height: '258px',
      panelClass: 'custom-viewdialogstyle',
      data: { key: "deactivate-org", showComment: true }
    });
    dialogRef.afterClosed().subscribe(
      resp => {
        if (resp != null && resp != undefined) {
          let comment = '';
          if (resp.data == true) {
            comment = resp.comments;
            this.deactivateOrgdetails(id, comment);
          }
        }
        // this.ngOnInit();
      }
    );
  }
  url: any = []
  deactivateOrgdetails(id: any, comment: any) {
    this.spinner.show();
    this.url = window.location.href;
    this.url = this.url.split("/");
    let data: Object = {
      "id": id,
      "status": "deactivated",
      "comments": comment,
      "url": this.url[2]
    }
    // let id = localStorage.getItem("organizationId");
    this.manageOrgService.deactivateOrg(data).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        this.utilsService.openSnackBarAC("Organization details deactivated successfully", "OK");
        this.ngOnInit();
        this.spinner.hide();
        // this.dialogRef.close();
      }
      else {
        this.utilsService.openSnackBarMC("Failed to deactivate organization details", "OK");
        this.spinner.hide();
      }

    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
      // this.dialogRef.close();
    })
  }


  onSelectAll(items: any) {
    this.selected = items;
    this.listOrg = [];
    if (items == true) {
      for (let i = 0; i < this.orgDetails.length; i++) {
        this.listOrg.push(this.orgDetails[i].org_id);
      }
    } else {
      this.listOrg = [];
    }
  }
  // change event for getting particular job id
  jobCheck(ob: MatCheckboxChange, id) {
    this.select_all = !this.select_all;
    if (ob.checked == true) {
      this.listOrg.push(id);
    } else if (ob.checked == false) {
      this.listOrg = [];
    }
  }
  jobCheck1(ob: MatCheckboxChange, id) {
    if (ob.checked == true) {
      this.listOrg.push(id);
    } else if (ob.checked == false) {
      for (let i = 0; i < this.listOrg.length; i++) {
        if (id == this.listOrg[i]) {
          this.listOrg.splice(i, 1);
        }
      }
    }
  }

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.orgDataSource.data.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    if (this.isAllSelected()) {
      this.selection.clear();
      return;
    }

    this.selection.select(...this.orgDataSource.data);
  }

  bulk_delete() {
    this.listOrg = [];
    for (var i = 0; i < this.selection.selected.length; i++) {
      this.listOrg.push(this.selection.selected[i].org_id)
    }
  }

  // bulk delete for orgs
  bulkdelete() {
    const dialogRef = this.dialog.open(BulkDeleteDialogComponent, {
      width: '35%',
      panelClass: 'custom-viewdialogstyle',
      data: { key: "active-orgs", showComment: true }
      // data: this.listOrg,
    });
    dialogRef.afterClosed().subscribe(
      resp => {

        if (resp != undefined && resp != "") {
          if (resp.data = true) {
            //  let comment = resp.comment;
            this.bulkDeleteDetails();
          }
        }

        this.selection.clear();
        this.listOrg = [];
        // this.ngOnInit();  
        // }

      }
    );
  }
  bulkDeleteDetails() {
    this.spinner.show();
    let listdata = {
      "deleteIds": this.listOrg,
      "comments": "",
    }
    this.manageOrgService.bulkdeleteOrg(listdata).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        this.utilsService.openSnackBarAC("Organization details deleted successfully", "OK");
        this.selection.clear();
        this.listOrg = [];
        this.ngOnInit();
        // this.dialogRef.close();
      }
      else {
        this.utilsService.openSnackBarMC("Faild to delete organization details", "OK");
      }
      this.spinner.hide();
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
      // this.dialogRef.close();
    })
  }
  // bulk delete for orgs
  bulkdeactivate() {
    const dialogRef = this.dialog.open(BulkDeactivateDialogComponent, {
      width: '35%',
      height: '250px',
      panelClass: 'custom-viewdialogstyle',
      data: { key: "deactivate-org", showComment: true }
      // data: { key: "bulk-deactivate" , data:this.listOrg},
    });
    dialogRef.afterClosed().subscribe(
      resp => {
        if (resp != undefined && resp != null) {
          let comment = '';
          if (resp.data == true) {
            comment = resp.comments;
            this.bulkdeactivateDetails(comment);
          }
        }
        this.selection.clear();
        this.listOrg = [];
        // this.ngOnInit();
      }
    );
  }
  // bulk deact for orgs
  bulkdeactivateDetails(comment: any) {
    this.spinner.show();
    this.url = window.location.href;
    this.url = this.url.split("/");
    let listdata = {
      "deleteIds": this.listOrg,
      "comments": comment,
      "login_str": this.login_str,
      "url": this.url[2]
    }
    this.manageOrgService.bulkDeactivateOrg(listdata).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        this.utilsService.openSnackBarAC("Organization details deactivated successfully", "OK");
        this.selection.clear();
        this.listOrg = [];
        this.ngOnInit();
        // this.dialogRef.close();
      }
      else {
        this.utilsService.openSnackBarMC("Faild to deactivate organization details", "OK");
      }
      this.spinner.hide();
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
      // this.dialogRef.close();
    })

  }
  // filter
  applyProjectFilter(event: Event) {
    this.Filter = false;
    this.filterData = (event.target as HTMLInputElement).value;
    const filterValue = (event.target as HTMLInputElement).value;
    this.orgDataSource.filter = filterValue.trim().toLowerCase();
    if (this.orgDataSource.filteredData.length == 0) {
      this.Filter = true;
    }
    if (this.orgDataSource.paginator) {
      this.orgDataSource.paginator = this.paginator;
    }
  }
  getallpendingdetails() {
    this.spinner.show();
    this.pending_req = 0;
    this.manageOrgService.getAllOrgDetails().subscribe(data => {
      if (data.map.statusMessage == "Success") {
        let response: any[] = JSON.parse(data.map.data);
        for (var i = 0; i < response.length; i++) {
          if (response[i].status == "Pending") {
            this.pending_req += 1;
          }
        }
        this.spinner.hide();
      }
      else {
        this.spinner.hide();
      }
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
    })
  }

  // openVieworg(element) {
  //   const dialogRef = this.dialog.open(ViewOrgDetailsComponent, {
  //     width: '500px',
  //     // height: '228px',
  //     panelClass: 'customvieworg-dialogstyle',
  //     data: { header: "View Organization Details", data: element },
  //   });
  // }

  //upgrade plans for orgs
  upgradeplan(id, plan, req) {
    const dialogRef = this.dialog.open(BulkActDeactComponent, {
      width: '30%',
      // height: '235px',
      panelClass: 'custom-viewdialogstyle',
      data: { header: "upgrade", id: id, plan: plan, req: req },
    });
    dialogRef.afterClosed().subscribe(
      resp => {
        this.selection.clear();
        this.listOrg = [];
        this.ngOnInit();
      }
    );
  }

  //renew plans for orgs
  modified_plan_module: any = [];
  renewplan(id, plan, req, plan_id, modules) {
    this.modified_plan_module = modules;
    const dialogRef = this.dialog.open(BulkActDeactComponent, {
      width: '30%',
      // height: '235px',
      panelClass: 'custom-viewdialogstyle',
      data: { header: "renew", id: id, plan: plan, req: req, plan_id: plan_id, modules: this.modified_plan_module },
    });
    dialogRef.afterClosed().subscribe(
      resp => {
        this.selection.clear();
        this.listOrg = [];
        this.ngOnInit();
      }
    );
  }
  //pagination size
  changePage(event) {
    this.pageSize = event.pageSize;
  }
}
