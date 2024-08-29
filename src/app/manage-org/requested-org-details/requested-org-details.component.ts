import { SelectionModel } from '@angular/cdk/collections';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { NgxSpinnerService } from 'ngx-spinner';
import { BulkActDeactComponent } from '../bulk-act-deact/bulk-act-deact.component';
import { ViewOrgDetailsComponent } from '../view-org-details/view-org-details.component';
import { OrgDeleteComponent } from "../org-delete/org-delete.component";
import { ManageOrgService } from '../../services/super-admin/manage-org/manage-org.service';
import { Router } from '@angular/router';
import { noDataMessage } from '../../util/constants';
import { UtilService } from '../../services/util.service';
import { DeleteComponent } from '../../util/delete/delete.component';
import { BulkDeleteDialogComponent } from '../../util/bulk-delete-dialog/bulk-delete-dialog.component';
import * as tablePageOption from '../../util/table-pagination-option';
import { RegisterService } from 'src/app/services/register.service';

@Component({
  selector: 'app-requested-org-details',
  templateUrl: './requested-org-details.component.html',
  styleUrls: ['./requested-org-details.component.less']
})
export class RequestedOrgDetailsComponent implements OnInit {

  nodataMsg = noDataMessage;
  heading: any;
  orgDetails: any = [];
  Filter: boolean;
  filterData: string;
  pageSize = 10;
  tablePaginationOption: number[];
  login_str: any;
  loginurl: any = '';
  modifiedstring: any;
  loginstr: string;
  constructor(private manageOrgService: ManageOrgService,
    private spinner: NgxSpinnerService,
    private router: Router,
    private dialog: MatDialog,
    private utilsService: UtilService,
    private registerService: RegisterService) {
       // for to get a current webpage url
    /* Your code goes here on every router change */
    this.loginurl = window.location.href;
    this.modifiedstring = this.loginurl.slice(0, this.loginurl.length - 8);
    this.loginstr = "login";
    this.login_str = this.modifiedstring.concat(this.loginstr.toString());
     }

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  ngOnInit() {
    let url: string = window.location.href;
    let location: any[] = url.split('/');
    if (location[4] == 'requested_org') {
      this.getallpendingdetails();
    }
    if (location[4] == 'rejected-orgs') {
      this.rejectedlist();
    }

  }
  displayedColumns: string[] = ['selector','organization_id', 'orgname', 'name', 'email', 'created_time', 'actions'];
  orgDataSource = new MatTableDataSource();
  selection = new SelectionModel(true, []);
  selectValue: boolean = false;
  allorgdetails: any = [];
  pending_req: number = 0;
  nodata: boolean = true;


  async getallpendingdetails() {
    this.spinner.show();
    this.pending_req = 0;
    this.pageSize = 10;
    this.selection.clear();
    this.selectValue = false;
    this.allorgdetails = [];
    this.orgDetails = [];
    this.heading = "Pending org details";
    await this.manageOrgService.getAllpendingDetails().subscribe(data => {
      if (data.map.statusMessage == "Success") {
        let response: any[] = JSON.parse(data.map.data);
        this.allorgdetails = response.reverse();
        this.tablePaginationOption = tablePageOption.tablePaginationOption(response.length);
        this.allorgdetails = [];
        this.allorgdetails = response;
        this.orgDetails = [];
        let createAndPendingOrgs = [];
        for (var i = 0; i < response.length; i++) {
          if (response[i].status == "Pending") {
            createAndPendingOrgs.push(response[i]);
          }
        }
        for (var i = 0; i < response.length; i++) {
          if (response[i].status == "Created") {
            createAndPendingOrgs.push(response[i]);
          }
        }
        this.orgDetails = createAndPendingOrgs;
        for (var i = 0; i < this.orgDetails.length; i++) {
          if (this.orgDetails[i].pricingPlanDetails) {
            let word = this.orgDetails[i].pricingPlanDetails.currency;
            this.orgDetails[i].pricingPlanDetails.currency = word.split(' ').pop();
            this.orgDetails[i].pricingPlanDetails.modules = JSON.parse(this.orgDetails[i].pricingPlanDetails.modules);
          }
        }

        if (this.orgDetails.length > 0) {
          this.displayedColumns = ['selector','organization_id', 'orgname', 'name', 'email', 'created_time', 'actions'];
          this.orgDataSource = new MatTableDataSource(this.orgDetails.reverse());
          this.orgDataSource.sort = this.sort;
          this.orgDataSource.paginator = this.paginator;
          this.nodata = false;
        }
        else {
          this.orgDataSource = new MatTableDataSource();
          this.nodata = true;
        }
      }
      else {
        this.nodata = true;
        this.spinner.hide();
      }
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
    })
    setTimeout(() => {
      this.spinner.hide();
    }, 2000);
  }

  //to ge the reject list
  async rejectedlist() {
    this.spinner.show();
    this.selection.clear();
    this.orgDetails = [];
    this.selectValue = true;
    this.pageSize = 10;
    this.heading = "Rejected org details";
    await this.manageOrgService.getAllRejectDetails().subscribe(data => {
      if (data.map.statusMessage == "Success") {
        let response: any[] = JSON.parse(data.map.data);
        this.tablePaginationOption = tablePageOption.tablePaginationOption(response.length);
        for (let j = 0; j < response.length; j++) {
          this.orgDetails.push(response[j]);
          // if(response[j].status == "Rejected" ){
          //   this.orgDetails.push(response[j]);
          // }
        }

        for (var i = 0; i < this.orgDetails.length; i++) {
          if (this.orgDetails[i].pricingPlanDetails) {
            let word = this.orgDetails[i].pricingPlanDetails.currency;
            this.orgDetails[i].pricingPlanDetails.currency = word.split(' ').pop();
            this.orgDetails[i].pricingPlanDetails.modules = JSON.parse(this.orgDetails[i].pricingPlanDetails.modules);
          }
        }
      }
      if (this.orgDetails.length > 0) {
        this.displayedColumns = ['selector','organization_id' ,'orgname', 'name', 'email', 'Rejected_Date', 'Reason', 'action'];
        this.orgDataSource = new MatTableDataSource(this.orgDetails.reverse());
        this.orgDataSource.sort = this.sort;
        this.orgDataSource.paginator = this.paginator;
        this.nodata = false;
      }
      else {
        this.nodata = true;
      }
      setTimeout(() => {
        this.spinner.hide();
      }, 2000);

    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
    });
  }

  listOrg: any[] = [];
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

  openVieworg(orgId: any) {
    let url: string = window.location.href;
    let location: any[] = url.split('/');
    this.router.navigate(['/view-org', orgId, location[4]]);
  }
  // approve or  reject the org's details
  approveRejectOrgDetails(data, head, plan) {
    // debugger;
    const dialogRef = this.dialog.open(BulkActDeactComponent, {
      width: '30%',
      // height: '325px',
      panelClass: 'custom-viewdialogstyle',
      data: { header: head, data: data, plan: plan },
    });
    dialogRef.afterClosed().subscribe(
      resp => {
        // debugger;
        this.selection.clear();
        this.listOrg = [];
        this.orgDetails = [];
        this.allorgdetails = [];
        // this.orgDataSource = new MatTableDataSource();
        this.getallpendingdetails();
      }
    );
  }

  // openVieworg(element) {
  //   const dialogRef = this.dialog.open(ViewOrgDetailsComponent, {
  //     width: '500px',
  //     // height: '228px',
  //     panelClass: 'customvieworg-dialogstyle',
  //     data: { header: "View Organization Details", data: element },
  //   });
  // }
  rejectDelete(id: any) {
    // let isDelete = "rejectedDelete";
    const dialogRef = this.dialog.open(DeleteComponent, {
      width: '35%',
      height: '168px',
      panelClass: 'custom-viewdialogstyle',
      data: { key: "reject-orgs", showComment: false }

    })
    dialogRef.afterClosed().subscribe(
      resp => {
        if (resp != undefined && resp != null) {
          if (resp.data == true) {
            this.deleteRejectedOrgDetails(id);
          }
        }
        // this.selection.clear();
        // this.listOrg = [];
        // this.getallpendingdetails();
        // this.rejectedlist();
        // this.ngOnInit();
      }
    );
  }
  deleteRejectedOrgDetails(id: any) {
    this.spinner.show();
    let rejDate = {
      "org_id": id
    }
    this.manageOrgService.deleteOrgRejected(rejDate).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        this.utilsService.openSnackBarAC("Rejected organization details successfully", "OK");
        this.rejectedlist();
        // this.dialogRef.close();
      } else {
        this.utilsService.openSnackBarMC("Failed to delete rejected organization details", "OK");
      }
      this.spinner.hide();
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
      // this.dialogRef.close();
    })
  }
  rejectedBulkDelete() {
    // let isDelete = "rejectedBulkDelete";
    const dialogRef = this.dialog.open(BulkDeleteDialogComponent, {
      width: '35%',
      height: '168px',
      panelClass: 'custom-viewdialogstyle',
      data: { key: "reject-orgs", showComment: false }
      // data: { isDel: isDelete, delList: this.listOrg }
    })
    dialogRef.afterClosed().subscribe(
      resp => {
        if (resp != null && resp != undefined) {
          if (resp.data == true) {
            this.bulkDeleteRejectedOrgDetails();
          }
        }

        this.selection.clear();
        this.listOrg = [];
        // this.getallpendingdetails();
        // this.rejectedlist();
        // this.ngOnInit();
      }
    );
  }
  bulkDeleteRejectedOrgDetails() {
    this.spinner.show();
    let rejDate = {
      "deleteIds": this.listOrg
    }
    this.manageOrgService.bulkDeleteOrgRejected(rejDate).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        this.utilsService.openSnackBarAC("Rejected organization details deleted successfully", "OK");
        this.selection.clear();
        this.listOrg = [];
        this.rejectedlist();
        this.spinner.hide();
        // this.dialogRef.close();
      } else {
        this.utilsService.openSnackBarMC("Failed to delete rejected organization details", "OK");
        this.spinner.hide();
      }

    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
      // this.dialogRef.close();
    })
  }
  //pagination size
  changePage(event) {
    this.pageSize = event.pageSize;
  }
  resendMail(id){
    this.spinner.show();
      let formdata = {
        "id": id,
        "login_str": this.login_str
      }
      this.registerService.resendMailToOrg(formdata).subscribe(data => {
        if(data.map.statusMessage == "Success" && data.map.data == "Mail sent successfully") {
          this.utilsService.openSnackBarAC("Mail sent successfully", "OK");
          this.getallpendingdetails();
        } else  if(data.map.statusMessage == "Success" && data.map.Error == "Error in sending details due to invalid mail check the configuration details"){
          this.utilsService.openSnackBarMC("Mail configuration issue encountered", "OK");
        } else {
          this.utilsService.openSnackBarMC("Failed to send mail", "OK");
        }
        setTimeout(() => {
          this.spinner.hide();
        }, 2000);
      })
    }
  }
