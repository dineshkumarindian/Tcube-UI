import { SelectionModel } from '@angular/cdk/collections';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTreeFlatDataSource } from '@angular/material/tree';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { Subscription } from 'rxjs';
import { SettingsService } from 'src/app/services/settings.service';
import { UtilService } from 'src/app/services/util.service';
import { ClientSettingsCommonDialogComponent } from './client-settings-common-dialog/client-settings-common-dialog.component';
import { ActivateDialogComponent } from '../../../util/activate-dialog/activate-dialog.component';
import { DeactivateDialogComponent } from '../../../util/deactivate-dialog/deactivate-dialog.component';
import { BulkActivateDialogComponent } from '../../../util/bulk-activate-dialog/bulk-activate-dialog.component';
import { BulkDeactivateDialogComponent } from '../../../util/bulk-deactivate-dialog/bulk-deactivate-dialog.component';
import { DeleteComponent } from '../../../util/delete/delete.component';
import { BulkDeleteDialogComponent } from '../../../util/bulk-delete-dialog/bulk-delete-dialog.component';
import * as tablePageSize from '../../../util/table-pagination-option';


@Component({
  selector: 'app-manage-client-details',
  templateUrl: './manage-client-details.component.html',
  styleUrls: ['./manage-client-details.component.less']
})
export class ManageClientDetailsComponent implements OnInit {
  heading: string;
  pageSize: number = 10;
  clickEventsubscription: Subscription;
  tablePaginationOption: number[];
  constructor(private settingsService: SettingsService,
    private router: Router,
    public matDialog: MatDialog,
    private utilsService: UtilService,
    private spinner: NgxSpinnerService,
    private dialog: MatDialog) {
  }

  ngOnInit() {
    this.inactiveClient = false;
    if (localStorage.getItem('RouteToInactiveClients') == "true") {
      setTimeout(() => {
        this.getInactiveClientDetails();
      }, 500);
    }
    else {
      this.getActiveClientDetailsByOrgId();

    }
  }

  tableDataSource = new MatTableDataSource();
  displayedColumns: string[] = ['selector', 'client_name', 'currency', 'billing_method', 'mobile_number', 'name', 'email', 'actions'];
  selection = new SelectionModel(true, []);
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.tableDataSource.data.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  toggleAllRows() {
    if (this.isAllSelected()) {
      this.selection.clear();
      return;
    }

    this.selection.select(...this.tableDataSource.data);
  }
  masterToggle() {
    if (this.isAllSelected()) {
      this.selection.clear();
      return;
    } else {
      this.tableDataSource.data.forEach(row => this.selection.select(row));
    }
  }
  Bulkdeleteclients: boolean = false;
  clientlist: any[] = [];
  bulk_delete() {
    this.clientlist = [];
    for (var i = 0; i < this.selection.selected.length; i++) {
      this.clientlist.push(this.selection.selected[i].id)
    }
    if (this.clientlist.length >= 2) {
      this.Bulkdeleteclients = true;
    }
    else {
      this.Bulkdeleteclients = false
    }
  }


  activateClientData: boolean = false;
  clientDetailsData: any[] = [];
  onClientName: boolean = false;
  clientDetails: any[] = [];
  nodata: boolean = false;

  //get active client details by orgid
  getActiveClientDetailsByOrgId() {
    this.heading = "Active Client Details";
    this.clientlist = [];
    this.inactiveClient = false;
    this.clientDetailsData = [];
    this.spinner.show();
    this.pageSize = 10;
    this.tablePaginationOption = [];
    this.selection.clear();
    let OrgId = localStorage.getItem("OrgId");
    this.settingsService.getActiveClientDetailsByOrgId(OrgId).subscribe(data => {
      this.utilsService.sendActiveClient();
      if (data.map.statusMessage == "Success") {
        let response: any[] = JSON.parse(data.map.data);
        this.tablePaginationOption = tablePageSize.tablePaginationOption(response.length);
        if (response.length > 0) {
          this.clientDetails = response;
          for (let i = 0; i < this.clientDetails.length; i++) {
            let word = this.clientDetails[i].currency;
            this.clientDetails[i].currency = word.split(' ').pop();
            this.clientDetailsData.push(this.clientDetails[i].client_name);
          }
          this.tableDataSource = new MatTableDataSource(this.clientDetails);
          this.tableDataSource.sort = this.sort;
          this.tableDataSource.paginator = this.paginator;
          this.nodata = false;
        }
        else {
          this.nodata = true;
          this.tableDataSource = new MatTableDataSource();
          this.tableDataSource.sort = this.sort;
          this.tableDataSource.paginator = this.paginator;
        }
      }
      else {
        this.tableDataSource = new MatTableDataSource();
        this.tableDataSource.sort = this.sort;
        this.tableDataSource.paginator = this.paginator;
        this.nodata = true;
      }
      this.spinner.hide();
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
    })
    setTimeout(() => {
      this.getInactiveClientName();
    }, 2000);

  }

  //getAll inactive client Name
  getInactiveClientName() {
    let OrgId = localStorage.getItem("OrgId");
    this.settingsService.getInactiveClientDetailsByOrgId(OrgId).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        let response = JSON.parse(data.map.data);
        for (let i = 0; i < response.length; i++) {
          this.clientDetailsData.push(response[i].client_name);
        }
      }
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
    });

  }

  //to get inactive client details
  inactiveClientDetails: any[];
  inactiveClient: boolean = false;
  getInactiveClientDetails() {
    this.heading = "Inactive Client Details";
    this.clientlist = [];
    this.inactiveClient = true;
    this.pageSize = 10;
    this.spinner.show();
    this.selection.clear();
    let OrgId = localStorage.getItem("OrgId");
    this.settingsService.getInactiveClientDetailsByOrgId(OrgId).subscribe(data => {
      this.utilsService.sendInactiveClient();
      if (data.map.statusMessage == "Success") {
        let response = JSON.parse(data.map.data);
        this.tablePaginationOption = tablePageSize.tablePaginationOption(response);
        if (response.length > 0) {
          this.inactiveClientDetails = response;
          for (let i = 0; i < this.inactiveClientDetails.length; i++) {
            let word = this.inactiveClientDetails[i].currency;
            this.inactiveClientDetails[i].currency = word.split(' ').pop();
          }
          this.tableDataSource = new MatTableDataSource(this.inactiveClientDetails);
          this.tableDataSource.sort = this.sort;
          this.tableDataSource.paginator = this.paginator;
          this.nodata = false;
        }
        else {
          this.nodata = true;
          this.tableDataSource = new MatTableDataSource();
          this.tableDataSource.sort = this.sort;
          this.tableDataSource.paginator = this.paginator;
        }
        this.spinner.hide();
      }
      else {
        this.nodata = true;
        this.tableDataSource = new MatTableDataSource();
        this.tableDataSource.sort = this.sort;
        this.tableDataSource.paginator = this.paginator;
      }
      localStorage.removeItem("RouteToInactiveClients");
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
    })
  }

  //table filter logic
  clientFilter: boolean = false;
  filterData: string;
  applyFilterClient(event: Event) {
    this.clientFilter = false;
    this.filterData = (event.target as HTMLInputElement).value;
    const filterValue = (event.target as HTMLInputElement).value;
    this.tableDataSource.filter = filterValue.trim().toLowerCase();
    if (this.tableDataSource.filteredData.length == 0) {
      this.clientFilter = true;
    }
    if (this.tableDataSource.paginator) {
      this.tableDataSource.paginator = this.paginator;
    }
  }

  //edit client redirection
  editClient(id) {
    this.router.navigate(["edit-client/" + id]);
  }

  //delete client redirection
  deleteClient(id: any) {
    this.settingsService.setClientId(id);
    const dialogRef = this.matDialog.open(DeleteComponent, {
      width: '35%',
      panelClass: 'custom-viewdialogstyle',
      data: { key: "delete-client", showComment: false }
    });
    dialogRef.afterClosed().subscribe(
      result => {
        if (result != null && result != undefined) {
          if (result.data == true) {
            this.deleteDetails();
          }
        }
      });
  }
  //delete client details
  deleteDetails() {
    this.spinner.show();
    let id = localStorage.getItem("clientId");
    this.settingsService.deleteClient(id).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        this.utilsService.openSnackBarAC("Client deleted successfully", "OK");
        this.clientDetails = [];
        if (this.inactiveClient) {
          this.getInactiveClientDetails();
        }
        else {
          this.getActiveClientDetailsByOrgId();

        }
        this.spinner.hide();
        // this.dialogRef.close();
      }
      else {
        this.utilsService.openSnackBarMC("Failed to delete client details", "OK");
        this.spinner.hide();
      }

    })
  }

  //deactivate the client details
  deactivateClient(id) {
    this.settingsService.setClientId(id);
    const dialogRef = this.matDialog.open(DeactivateDialogComponent, {
      width: '35%',
      panelClass: 'custom-viewdialogstyle',
      data: { key: "deactivate", showComment: false }
    });

    dialogRef.afterClosed().subscribe(
      result => {
        if (result != undefined && result != null) {
          let comment = '';
          if (result.data == true) {
            comment = result.comments;
            this.moveDeactivateClient(comment);
          }
        }
        // this.utilsService.sendClickEvent();
        // this.getActiveClientDetailsByOrgId();
      })
  }

  //deactivate clients
  moveDeactivateClient(comment) {
    this.spinner.show();
    let data: Object = {
      "id": localStorage.getItem("clientId"),
      "status": "activated",
      "comments": comment,
    }
    this.settingsService.deactivateClient(data).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        this.utilsService.openSnackBarAC("Client deactivated successfully", "OK");
        this.getActiveClientDetailsByOrgId();
        // this.dialogRef.close();
      }
      else {
        this.utilsService.openSnackBarMC("Failed to deactivate client", "OK");
      }
      this.spinner.hide();
    })
  }

  //activate the client details
  activateClient(id) {
    this.settingsService.setClientId(id);
    const dialogRef = this.matDialog.open(ActivateDialogComponent, {
      width: '35%',
      panelClass: 'custom-viewdialogstyle',
      data: { key: "activate-client", showComment: true }
    });

    dialogRef.afterClosed().subscribe(
      result => {
        if (result != undefined && result != null) {
          let comment = '';
          if (result.data == true) {
            comment = result.comments;
            this.moveActivateClient(comment);
          }
        }
        // this.toggleInactiveUser();
        // this.utilsService.sendClickEvent();

      })
  }
  // activate Client
  moveActivateClient(comment: string) {
    this.spinner.show();
    let data: Object = {
      "id": localStorage.getItem("clientId"),
      "status": "activated",
      "comments": comment,
    }
    this.settingsService.activateClient(data).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        this.utilsService.openSnackBarAC("Client activated successfully", "OK");
        this.getInactiveClientDetails();
        // this.dialogRef.close();
      }
      else {
        this.utilsService.openSnackBarMC("Failed to activate client", "OK");
      }
      this.spinner.hide();
    })
  }

  // Active client bulk delete 
  bulkDeleteActiveClientDetails() {
    const dialogRef = this.dialog.open(ClientSettingsCommonDialogComponent, {
      width: '35%',
      panelClass: 'custom-viewdialogstyle',
      data: { header: "activeClientBD", deleteList: this.clientlist }
    })
    dialogRef.afterClosed().subscribe(
      resp => {
        this.selection.clear();
        this.clientlist = [];
        this.getActiveClientDetailsByOrgId();

      }
    );
  }

  //inactive client bulk delete  
  bulkDeleteInactiveClientDetails() {
    const dialogRef = this.dialog.open(BulkDeleteDialogComponent, {
      width: '35%',
      panelClass: 'custom-viewdialogstyle',
      data: { key: "client-delete", showComment: false }
    })
    dialogRef.afterClosed().subscribe(
      resp => {
        if (resp != undefined && resp != null) {
          if (resp.data == true) {
            this.bulkDeleteClientDetails();
          }
        }
        this.selection.clear();
        this.clientlist = [];
        // this.getInactiveClientDetails();

      }
    );


  }
  //bulk delete client details
  bulkDeleteClientDetails() {
    this.spinner.show();
    let data: Object = {
      "deleteIds": this.clientlist,
    }
    this.settingsService.bulkDeleteClientDetails(data).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        this.utilsService.openSnackBarAC("Clients deleted successfully", "OK");
        this.selection.clear();
        this.clientlist = [];
        this.getInactiveClientDetails();
        this.spinner.hide();
        // this.dialogRef.close();
      }
      else {
        this.utilsService.openSnackBarMC("Failed to delete client details", "OK");
        this.spinner.hide();
      }
    })
    setTimeout(() => {
      this.spinner.hide();
    }, 1000);
  }

  //bulk deactivate client details
  bulkDeactivateClientDetails() {
    const dialogRef = this.dialog.open(BulkDeactivateDialogComponent, {
      width: '35%',
      panelClass: 'custom-viewdialogstyle',
      data: { key: "client-deactivate", showComment: false }
    })
    dialogRef.afterClosed().subscribe(
      resp => {
        if (resp != undefined && resp != null) {
          let comment = '';
          if (resp.data == true) {
            comment = resp.comments;
            this.bulkDeactiveClientDetails(comment);
          }
        }
        this.selection.clear();
        this.clientlist = [];
        // this.getActiveClientDetailsByOrgId();
      }
    );
  }
  // bulkDeactiveClient 
  bulkDeactiveClientDetails(comment: any) {
    this.spinner.show();
    let data: Object = {
      "deleteIds": this.clientlist,
      "action": "activated",
      "comments": comment
    }
    // console.log(data);
    this.settingsService.bulkDeactivateClientDetails(data).subscribe(data => {
      // console.log(data);
      if (data.map.statusMessage == "Success") {
        this.utilsService.openSnackBarAC("Clients deactivated successfully", "OK");
        this.selection.clear();
        this.clientlist = [];
        this.getActiveClientDetailsByOrgId();
        // this.dialogRef.close();
      }
      else {
        this.utilsService.openSnackBarMC("Failed to deactivate the client details", "OK");
      }
    })
    setTimeout(() => {
      this.spinner.hide();
    }, 2000);
  }

  //bulk activate client details
  bulkactivateClientDetails() {
    const dialogRef = this.dialog.open(BulkActivateDialogComponent, {
      width: '30%',
      panelClass: 'custom-viewdialogstyle',
      data: { key: "activate-client", showComment: true }
    })
    dialogRef.afterClosed().subscribe(
      resp => {
        if (resp != null && resp != undefined) {
          let comment = '';
          if (resp.data == true) {
            comment = resp.comments;
            this.bulkactiveClientDetails(comment);
          }
        }
        this.selection.clear();
        this.clientlist = [];
        // this.getInactiveClientDetails();
      }
    );
  }
  // bulk active client
  bulkactiveClientDetails(comment: any) {
    this.spinner.show();
    let data: Object = {
      "deleteIds": this.clientlist,
      "action": "deactivated",
      "comments": comment
    }
    // console.log(data);
    this.settingsService.bulkActivateClientDetails(data).subscribe(data => {
      // console.log(data);
      if (data.map.statusMessage == "Success") {
        this.utilsService.openSnackBarAC("Clients activated successfully", "OK");
        this.selection.clear();
        this.clientlist = [];
        this.getInactiveClientDetails();
        // this.dialogRef.close();
      }
      else {
        this.utilsService.openSnackBarMC("Failed to activate details", "OK");
      }
    })
    setTimeout(() => {
      this.spinner.hide();
    }, 2000);
  }

  //view client details
  viewUserdetails(header, element) {
    let headerData = '';
    let key = '';
    let activeclient;
    if (this.inactiveClient) {
      activeclient = false;
    }
    else{
      activeclient = true;
    }
    headerData = "View Client Details";
    this.matDialog.open(ClientSettingsCommonDialogComponent, {
      width: '50%',
      // maxHeight: '450px',
      panelClass: 'custom-viewdialogstyle',
      data: { header: header, headerData: headerData, mainData: element, Activeclient:activeclient}
    });
  }
  //pagination size
  changePage(event) {
    this.pageSize = event.pageSize;
  }
}
