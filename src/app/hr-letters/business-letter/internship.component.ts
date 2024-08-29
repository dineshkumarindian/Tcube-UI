
// <!----- internship letter to change business letter due to some reason------>

import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { SelectionModel } from '@angular/cdk/collections';
import { InternshipletterService } from 'src/app/services/businessletter.service';
import { MatDialog } from '@angular/material/dialog';
// import { DeleteInternshipComponent } from './delete-business/delete-internship.component';
import { Router } from '@angular/router';
// import { InternshipBulkDeleteComponent } from './business-bulk-delete/internship-bulk-delete.component';
import { NgxSpinnerService } from 'ngx-spinner';
import { DomSanitizer } from '@angular/platform-browser';
import { noDataMessage } from '../../util/constants';
import { UtilService } from '../../services/util.service';
import { DeleteComponent } from '../../util/delete/delete.component';
import { BulkDeleteDialogComponent } from '../../util/bulk-delete-dialog/bulk-delete-dialog.component';
import * as tablePageOption from '../../util/table-pagination-option';

export interface InternShipElement {
  name: String;
  doj: String;
  address: String;
  program_title: String;
  description: String;
}
const Element_data: InternShipElement[] = [
  { 'name': 'dinesh', 'doj': '04/08/2022', 'address': 'coimbatore', 'program_title': '2month of internship offer', 'description': 'good day' },
  { 'name': 'bala', 'doj': '04/08/2022', 'address': 'coimbatore', 'program_title': '3 monthe of internship offer', 'description': 'good day' }
]

@Component({
  selector: 'app-internship',
  templateUrl: './internship.component.html',
  styleUrls: ['./internship.component.less']
})

export class InternshipComponent implements OnInit {

  nodataMsg = noDataMessage;
  displayedColumns: String[] = ["select", "name", "address", "program_title", "Created_date", "modified_time", "action", "download"];
  dataSource = new MatTableDataSource();
  selection = new SelectionModel(true, []);
  selected: boolean = false;
  select_all: boolean = false;
  Filter: boolean = false;
  filterData: string;
  no_data: any[] = [];
  noDataMsg: boolean = false;
  noDataLength: number;
  pageSize: number = 10;
  tablePaginationOption:number[];

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  internshipDetails: any[] = [];
  constructor(private internshipService: InternshipletterService,
    private utilsService: UtilService,
    public dialog: MatDialog,
    public route: Router,
    private spinner: NgxSpinnerService,
    private router: Router,
    private domSanitizer: DomSanitizer) { }
  ngOnInit() {
    this.viewBusinessLetter();
  }

  //get the business letter details
  viewBusinessLetter() {
    this.spinner.show();
    this.noDataMsg = true;
    let orgId = localStorage.getItem("OrgId");
    this.internshipService.getActiveOrgIdBusinessDetailsNew(orgId).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        let response: any[] = JSON.parse(data.map.data);
        this.tablePaginationOption = tablePageOption.tablePaginationOption(response.length);
        let pdffile;
        for (let i = 0; i < response.length; i++) {
          this.internshipDetails.push(response[i]);
          pdffile = response[i].PdfFileLink;
        }
        this.no_data = this.internshipDetails;
        this.noDataLength = this.internshipDetails.length;
        this.dataSource = new MatTableDataSource(this.internshipDetails);
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
  viewThePdfLetter(pdffile: any) {
    const file = pdffile;
    let stringArray = new Uint8Array(file);
    const String_Char = stringArray.reduce((data, byte) => {
      return data + String.fromCharCode(byte);
    }, '');
    let base64String = btoa(String_Char);
    const imageBlob = this.dataUritoBlob(base64String);
    const imageFile = new File([imageBlob], "internshipLetter", { type: 'application/pdf' })
    const fileURL = URL.createObjectURL(imageFile);
    window.open(fileURL, '_blank');
  }

  //download the pdf letter
  downloadPdfLetter(pdffile: any, name: any, program_title: any) {
    const program = program_title;
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
    // link.href = file;
    link.download = '' + program + '(' + fileName + ').pdf';
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

  //delete business letter
  deleteBusinessLetter(id: any) {
    let intern_id = id;
    const dialogRef = this.dialog.open(DeleteComponent, {
      width: '30%',
      panelClass: 'custom-viewdialogstyle',
      data:{key:"business-delete",showComment:false}
      // data: { id: intern_id },
    })
    dialogRef.afterClosed().subscribe(resp => {
      if(resp != undefined && resp != null){
      if (resp.data == true) {
        this.deleteUserDetail(id);
        // this.internshipDetails = [];
        // this.ngOnInit();
      }
    }
    })
  }
  //delete the business letter
  deleteUserDetail(id: any) {
    this.spinner.show();
    this.internshipService.deleteByIdBusinessDetails(id).subscribe(data => {
      //  console.log(data);
      if (data.map.statusMessage == "Success") {
        this.utilsService.openSnackBarAC("Letter deleted successfully", "OK");
        this.internshipDetails = [];
        this.ngOnInit();
        this.spinner.hide();
        // this.dialogRef.close();
      }
      else {
        this.utilsService.openSnackBarMC("Failed to delete letter details", "OK");
        this.spinner.hide();
      }
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
      // this.dialogRef.close();
    })
  }

  //update business letter
  updateBusinessLetter(id: any) {
    this.route.navigate(['edit-letter/' + id]);
  }

  //bulk-delete business letter
  bulkDelete() {
    const dialogRef = this.dialog.open(BulkDeleteDialogComponent, {
      width: '30%',
      panelClass: 'custom-viewdialogstyle',
      data:{key:"business-bulk-delete",showComment:false}
      // data: { name: this.listProject }
    });
    dialogRef.afterClosed().subscribe(
      resp => {
        if(resp != undefined && resp != null){
        if (resp.data == true) {
          this.bulkDeleteDetails(this.listProject);
        }
      }
      this.selection.clear();
      this.listProject = [];
      this.internshipDetails = [];
      }
    );

  }

  //bulkdelete
  bulkDeleteDetails(letterData: any) {
    this.spinner.show();
    let listdata = {
      "deleteIds": letterData,
    }
    this.internshipService.bulkDeleteBusinessDetails(listdata).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        this.utilsService.openSnackBarAC("Letter details deleted successfully", "OK");
        this.selection.clear();
        this.listProject = [];
        this.internshipDetails = [];
        this.ngOnInit();
        // this.dialogRef.close();
      }
      else {
        this.utilsService.openSnackBarMC("Faild to delete letter details", "OK");
      }
      this.spinner.hide();
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
      // this.dialogRef.close();
    })
  }

  //apply filter in business letter
  // applyBusinessFilter(event: Event) {
  //   this.Filter = false;
  //   const filterValue = (event.target as HTMLInputElement).value;
  //   this.dataSource.filter = filterValue.trim().toLowerCase();
  //   this.filterData = (event.target as HTMLInputElement).value;

  //   if (this.dataSource.filteredData.length == 0) {
  //     this.Filter = true;
  //   }
  //   if (this.dataSource.paginator) {
  //     this.dataSource.paginator = this.paginator;
  //   }
  // }
  //filter for the holiday table data
  applyBusinessFilter(event: Event) {
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





