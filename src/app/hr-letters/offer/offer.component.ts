import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { OfferLetterService } from '../../services/offer-letter.service';
import { SelectionModel } from '@angular/cdk/collections';
import { UtilService } from '../../services/util.service';
import { DeleteOfferComponent } from './delete-offer/delete-offer.component';
import { MatDialog } from '@angular/material/dialog';
import { OfferBulkDeleteComponent } from './offer-bulk-delete/offer-bulk-delete.component';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { NgxSpinnerService } from 'ngx-spinner';
import { DomSanitizer } from '@angular/platform-browser';
import { noDataMessage, characterLength } from '../../util/constants';
import { DeleteComponent } from '../../util/delete/delete.component';
import { BulkDeleteDialogComponent } from '../../util/bulk-delete-dialog/bulk-delete-dialog.component';
import * as tablePageOption from '../../util/table-pagination-option';

// import {UtilService} from '../../services/util.service';
export interface OfferElement {
  name: String;
  dob: String;
  // doj: String;
  // designation: String;
  // location:string;

}
@Component({
  selector: 'app-offer',
  templateUrl: './offer.component.html',
  styleUrls: ['./offer.component.less']
})
export class OfferComponent implements OnInit {

  noDataMessage = noDataMessage;
  characterLength = characterLength;
  dataSource = new MatTableDataSource();
  selection = new SelectionModel(true, []);
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  displayedColumns: String[] = ["select", "name", "dob", "created_date", "modified_date", "action", "download"];
  details: any;
  offerLetterDetails: any[] = [];
  select_all: boolean = false;
  selected: boolean = false;
  Filter: boolean;
  filterData: string;
  no_data: any[] = [];
  noDataMsg: boolean = false;
  noDataLength: number;
  pageSize: number = 10;
  tablePaginationOption:number[];


  constructor(private offerLetterService: OfferLetterService,
    public route: Router, public dialog: MatDialog,
    private utilService: UtilService,
    private spinner: NgxSpinnerService,
    private router: Router) { }

  ngOnInit() {
    this.viewOfferLetterDetails();
  }
  viewOfferLetterDetails() {
    this.spinner.show();
    this.noDataMsg = true;
    let orgId = localStorage.getItem("OrgId");

    this.offerLetterService.getActiveOrgIdOfferLetterDetails(orgId).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        let res: any[] = JSON.parse(data.map.data);
        this.tablePaginationOption = tablePageOption.tablePaginationOption(res.length);
        
        for (let i = 0; i < res.length; i++) {
          if (res[i].orgDetails.is_deleted == false) {
            this.offerLetterDetails.push(res[i]);
          }
        }
        this.no_data = this.offerLetterDetails;
        this.noDataLength = this.offerLetterDetails.length;
        this.dataSource = new MatTableDataSource(this.offerLetterDetails);
        this.dataSource.sort = this.sort;
        this.dataSource.paginator = this.paginator;
        setTimeout(() => {
          this.spinner.hide();
        }, 1000);
      } else {
        setTimeout(() => {
          this.spinner.hide();
        }, 1000);
      }
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
    })
  }
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }
  masterToggle() {
    if (this.isAllSelected()) {
      this.selection.clear();
      return;
    } else {
      this.dataSource.data.forEach(row => this.selection.select(row));
    }
  }
  listProject = [];
  projectCheck(ob: MatCheckboxChange, id) {
    this.select_all = !this.select_all;
    if (ob.checked == true) {
      this.listProject.push(id);
    } else if (ob.checked == false) {
      this.listProject = [];
    }

  }
  bulk_delete() {
    this.listProject = [];
    for (var i = 0; i < this.selection.selected.length; i++) {
      this.listProject.push(this.selection.selected[i].id);
    }
  }
  viewThePdfLetter(pdffile: any) {
    const file = pdffile;
    let stringArray = new Uint8Array(file);
    const String_Char = stringArray.reduce((data, byte) => {
      return data + String.fromCharCode(byte);
    }, '');
    let base64String = btoa(String_Char);
    const imageBlob = this.dataUritoBlob(base64String);
    const imageFile = new File([imageBlob], "offerLetter", { type: 'application/pdf' })
    const fileURL = URL.createObjectURL(imageFile);
    window.open(fileURL, '_blank');
  }

  downloadPdfLetter(pdffile: any, name: any) {
    const file = pdffile;
    const fileName = name;
    let stringArray = new Uint8Array(file);
    const String_Char = stringArray.reduce((data, byte) => {
      return data + String.fromCharCode(byte);
    }, '');
    let base64String = btoa(String_Char);
    const imageBlob = this.dataUritoBlob(base64String);
    var link = document.createElement('a');
    link.href = window.URL.createObjectURL(imageBlob);
    link.download = 'Offerletter(' + fileName + ').pdf';
    link.click();
    window.URL.revokeObjectURL(link.href);
  }
  dataUritoBlob(dataURI) {
    const byteString = window.atob(dataURI);
    const arrayBuffer = new ArrayBuffer(byteString.length);
    const int8Array = new Uint8Array(arrayBuffer);
    for (let i = 0; i < byteString.length; i++) {
      int8Array[i] = byteString.charCodeAt(i);
    }
    const blob = new Blob([int8Array], { type: 'application/pdf' });
    return blob;
  }
  updateOfferLetter(id: any) {
    this.route.navigate(['edit-offer/' + id]);
  }
  deleteOfferLetter(id: any) {
    const dialogRef = this.dialog.open(DeleteComponent, {
      width: '30%',
      panelClass: 'custom-viewdialogstyle',
      data:{key:"offer-delete",showComment:false}
      // data: { id: offer_id }
    })

    dialogRef.afterClosed().subscribe(resp => {
      if(resp != undefined && resp != null){
      if (resp.data == true) {
        this.deleteUserDetails(id);
      }
    }

    })
  }
  deleteUserDetails(id: any) {
    this.spinner.show();
    this.offerLetterService.deleteOfferLetterByIdDetails(id).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        this.utilService.openSnackBarAC("Offer letter deleted successfully", "OK");
        this.offerLetterDetails = [];
        this.ngOnInit();
        this.spinner.hide();
        // this.dialogRef.close();
      }
      else {
        // this.utilsService.openSnackBarMC("Failed to delete offer letter details", "OK");
        this.spinner.hide();
      }
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
      // this.dialogRef.close();
    })
  }

  bulkDelete() {
    const dialogRef = this.dialog.open(BulkDeleteDialogComponent, {
      width: '30%',
      panelClass: 'custom-viewdialogstyle',
      data: {key:"offer-bulk-delete",showComment:false}
    });
    dialogRef.afterClosed().subscribe(
      resp => {
        if(resp != undefined && resp != null){
        if(resp.data == true){
        this.bulkDeleteDetails(this.listProject);
        }
      }
      this.selection.clear();
      this.listProject = [];
      this.offerLetterDetails = [];
      }
    );

  }


  bulkDeleteDetails(offerData: any) {
    this.spinner.show();
    let listdata = {
      "deleteIds": offerData,
    }
    this.offerLetterService.bulkOfferLetterDelete(listdata).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        this.utilService.openSnackBarAC("Offer Letter deleted successfully", "OK");
        this.selection.clear();
        this.listProject = [];
        this.offerLetterDetails = [];
        this.ngOnInit();
        // this.dialogRef.close();
      }
      else {
        this.utilService.openSnackBarMC("Failed to delete offer letter", "OK");
      }
      this.spinner.hide();
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
      // this.dialogRef.close();
    })
  }
  applyProjectFilter(event: Event) {
    this.Filter = false;
    this.filterData = (event.target as HTMLInputElement).value;
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.filteredData.length == 0) {
      this.Filter = true;
    }
    if (this.dataSource.paginator) {
      this.dataSource.paginator = this.paginator;
    }
  }
  //pagination size
  changePage(event) {
    this.pageSize = event.pageSize;
  }
}



