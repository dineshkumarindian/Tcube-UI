import { SelectionModel } from '@angular/cdk/collections';
import { Component, OnInit, ViewChild } from '@angular/core';
import {  MatDialog } from '@angular/material/dialog';
import {  MatTreeModule } from '@angular/material/tree';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ManageOrgService } from 'src/app/services/super-admin/manage-org/manage-org.service';
import { ActivateOrgsComponent } from '../activate-orgs/activate-orgs.component';
import { BulkActDeactComponent } from '../bulk-act-deact/bulk-act-deact.component';
import { OrgBulkDeleteComponent } from '../org-bulk-delete/org-bulk-delete.component';
import { ViewOrgDetailsComponent } from '../view-org-details/view-org-details.component';
import {noDataMessage} from '../../util/constants';
import {BulkActivateDialogComponent} from '../../util/bulk-activate-dialog/bulk-activate-dialog.component';
import {ActivateDialogComponent} from '../../util/activate-dialog/activate-dialog.component';
import {UtilService} from '../../services/util.service';
import * as tablePageOption  from '../../util/table-pagination-option';
import { DeleteComponent } from 'src/app/util/delete/delete.component';

@Component({
  selector: 'app-inactive-orgs',
  templateUrl: './inactive-orgs.component.html',
  styleUrls: ['./inactive-orgs.component.less']
})
export class InactiveOrgsComponent implements OnInit {

  noDataMsg = noDataMessage;
  orgDetails: any[]=[];
  selected: boolean = false;
  listOrg: any[] = [];
  Filter: boolean;
  filterData: string;
  pageSize:number = 10;
  tablePaginationOption:number[];
  loginurl: string;
  loginstr: string;
  modifiedstring: string;
  login_str: string;
  
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  
  constructor(
    private manageOrgService: ManageOrgService,
    private router: Router,
    private dialog: MatDialog,
    private spinner : NgxSpinnerService,
    private utilsService:UtilService) { }

  ngOnInit() {
    this.getAllOrgdetails();
    this.loginurl = window.location.href;
    this.modifiedstring = this.loginurl.slice(0, this.loginurl.length - 13);
    this.loginstr = "login";
    this.login_str = this.modifiedstring.concat(this.loginstr.toString());
  }

  displayedColumns: string[] = ['selector','organization_id' ,'orgname', 'name', 'email', 'actions'];
  orgDataSource = new MatTableDataSource();
  selection = new SelectionModel(true, []);
  //get all org details
  getAllOrgdetails() {
    this.spinner.show();
    this.manageOrgService.getInactiveOrgDetails().subscribe(data => {
      if(data.map.statusMessage == "Success"){
        let response: any[] = JSON.parse(data.map.data);
        this.tablePaginationOption = tablePageOption.tablePaginationOption(response.length);
        this.orgDetails = response;
        for(var i=0;i<this.orgDetails.length;i++){
          if(this.orgDetails[i].pricingPlanDetails){
            let word = this.orgDetails[i].pricingPlanDetails.currency;
            this.orgDetails[i].pricingPlanDetails.currency = word.split(' ').pop();
            this.orgDetails[i].pricingPlanDetails.modules = JSON.parse(this.orgDetails[i].pricingPlanDetails.modules);
          }
        }
        this.orgDataSource = new MatTableDataSource(this.orgDetails.reverse());
        this.orgDataSource.sort = this.sort;
        this.orgDataSource.paginator = this.paginator;
        this.spinner.hide();
      }else{
        this.spinner.hide();
      }
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
    })
  }

  openVieworg(orgId:any) {
    let url:string = window.location.href;
    let location:any[] = url.split('/');
    this.router.navigate(['/view-org',orgId,location[4]]);
  }

  deleteOrg(id) {
    let isDelete = false;
    this.manageOrgService.setOrgId(id);
    const dialogRef = this.dialog.open(DeleteComponent, {
      width: "35%",
      panelClass: "custom-viewdialogstyle",
      data: { key: "active-org", showComment: true },
    });
    dialogRef.afterClosed().subscribe((resp) => {
      if (resp != undefined && resp != "") {
        if (resp.data == true) {
          let comment = resp.comment;
          this.deleteDetails(comment);
        } else {
          this.ngOnInit();
        }
      }
    });
  }
  deleteDetails(comment: string) {
    this.spinner.show();
    let data: object = {
      id: localStorage.getItem("organizationId"),
      comments: comment,
    };
    this.manageOrgService.deleteOrg(data).subscribe(
      (data) => {
        if (data.map.statusMessage == "Success") {
          this.utilsService.openSnackBarAC(
            "Organization details deleted successfully",
            "OK"
          );
          this.ngOnInit();
          // this.dialogRef.close();
        } else {
          this.utilsService.openSnackBarMC(
            "Failed to delete organization details",
            "OK"
          );
        }
        this.spinner.hide();
      },
      (error) => {
        this.router.navigate(["/404"]);
        this.spinner.hide();
        // this.dialogRef.close();
      }
    );
  }
  activateOrg(id:any){
    this.manageOrgService.setOrgId(id);
    const dialogRef = this.dialog.open(ActivateDialogComponent, {
      width: '35%',
      height: '227px',
      panelClass: 'custom-viewdialogstyle',
      data: {key:"active-org",showComment:true},
    });
    dialogRef.afterClosed().subscribe(
      resp => {
        if(resp != null && resp != undefined){
          let comment = '';
          if(resp.data == true){
            comment = resp.comments;
            this.ActivateDetails(id,comment);
          }
        }
        // this.ngOnInit();

      }
    );
  }
  ActivateDetails(iddata:any,comment:any) {
    this.spinner.show();
    let data: Object = {
      "id": iddata,
      "status": "activated",
      "comments": comment,
      "login_str": this.login_str
    }
    let id = localStorage.getItem("organizationId");
    this.manageOrgService.activateOrg(data).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        this.utilsService.openSnackBarAC("Organization details activated successfully", "OK");
        this.ngOnInit();
        // this.dialogRef.close();
      }
      else {
        this.utilsService.openSnackBarMC("Failed to activate organization details", "OK");
      }
      this.spinner.hide();
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
      // this.dialogRef.close();
    })
  }

  //upgrade plans for orgs
  upgradeplan(id,plan,req) {
    const dialogRef = this.dialog.open(BulkActDeactComponent, {
      width: '30%',
      // height: '235px',
      panelClass: 'custom-viewdialogstyle',
      data: { header : "upgrade",id:id,plan:plan,req: req},
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
   modified_plan_module:any = [];
   renewplan(id,plan,req,plan_id,modules) {
    this.modified_plan_module = modules;
    const dialogRef = this.dialog.open(BulkActDeactComponent, {
      width: '30%',
      // height: '235px',
      panelClass: 'custom-viewdialogstyle',
      data: { header:"renew", id:id, plan:plan, req:req, plan_id: plan_id,modules: this.modified_plan_module},
    });
    dialogRef.afterClosed().subscribe(
      resp => {
        this.selection.clear();
        this.listOrg = [];
        this.ngOnInit();
      }
    );
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
    const dialogRef = this.dialog.open(OrgBulkDeleteComponent, {
      width: '35%',
      height: '167px',
      panelClass: 'custom-viewdialogstyle',
      data: this.listOrg,
    });
    dialogRef.afterClosed().subscribe(
      resp => {
        this.selection.clear();
        this.listOrg = [];
        this.ngOnInit();
      }
    );
  }

    // bulk delete for orgs
    bulkactivate() {
      const dialogRef = this.dialog.open(BulkActivateDialogComponent, {
        width: '30%',
        height: '227px',
        panelClass: 'custom-viewdialogstyle',
        data:{key:"active-org",showComment:true}
        // data: { header : "bulk-activate" , data:this.listOrg},
      });
      dialogRef.afterClosed().subscribe(
        resp => {
          if(resp != undefined  && resp != null){
            let comment ='';
            if(resp.data == true){
              comment = resp.comments;
              this.ActivateDetails1(comment);
            }
          }
          this.selection.clear();
          this.listOrg = [];
          // this.ngOnInit();
        }
      );
    }
    // Bulk act for orgs
  ActivateDetails1(comment) {
    this.spinner.show();
    let listdata = {
      "deleteIds": this.listOrg,
      "comments": comment,
      "login_str": this.login_str
    }
      this.manageOrgService.bulkActivateOrg(listdata).subscribe(data => {
        if (data.map.statusMessage == "Success") {
          this.utilsService.openSnackBarAC("Organization details activated successfully", "OK");
          this.selection.clear();
          this.listOrg = [];
          this.ngOnInit();
          this.spinner.hide();
        }
        else {
          this.utilsService.openSnackBarMC("Failed to activate organization details", "OK");
          this.spinner.hide();
        }
        this.spinner.hide();
      }, (error) => {
        this.router.navigate(["/404"]);
        // this.spinner.hide();
      })
  }

    // openVieworg(element){
    //   const dialogRef = this.dialog.open(ViewOrgDetailsComponent, {
    //     width: '500px',
    //     // height: '228px',
    //     panelClass: 'customvieworg-dialogstyle',
    //     data: { header : "View Organization Details" , data: element},
    //   });
    // }
     //pagination size
  changePage(event){
    this.pageSize = event.pageSize;
  }
}
