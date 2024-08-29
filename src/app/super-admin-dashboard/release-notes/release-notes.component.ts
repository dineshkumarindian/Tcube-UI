import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { SelectionModel } from '@angular/cdk/collections';
import { ReleaseNotesService } from '..//../services/super-admin/release-notes/release-notes.service';
import { MatDialog } from '@angular/material/dialog';
import { DomSanitizer } from '@angular/platform-browser';
import { UtilService } from '../../services/util.service';
import { noDataMessage } from '../../util/constants';
import { DeleteComponent } from '../../util/delete/delete.component';
import { BulkDeleteDialogComponent } from '../../util/bulk-delete-dialog/bulk-delete-dialog.component';
import { UntypedFormControl } from '@angular/forms';
import { ReplaySubject, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { PublishNotesComponent } from './publish-notes/publish-notes.component';
import * as tablepageOption from '../../util/table-pagination-option';
import { UpdateRelaseDialogComponent } from '../release-notes/update-relase-dialog/update-relase-dialog.component';

export interface InternShipElement {
  version: String;
  dor: String;
  // notes_Title: String;
  // description: String;
}

@Component({
  selector: 'app-release-notes',
  templateUrl: './release-notes.component.html',
  styleUrls: ['./release-notes.component.less']
})
export class ReleaseNotesComponent implements OnInit {

  nodataMessage = noDataMessage;
  displayedColumns: String[] = ["select", "type", "notes_Title", "product_name", "version", "created_date", "modified_time", "action", "download"];
  dataSource = new MatTableDataSource();
  selection = new SelectionModel(true, []);
  releaseNotesDetails: any[] = [];
  selected: boolean = false;
  select_all: boolean = false;
  Filter: boolean;
  filterData: string;
  no_data: any[] = [];
  noDataMsg: boolean = false;
  noDataLength: number;
  details: any;
  pageSize = 10;
  tablePaginationOption: number[];
  reset_filter_btn: Boolean = false;
  filteredclient: any[] = ["Web Application", "Android", "iOS"];

  public project: UntypedFormControl = new UntypedFormControl();
  public projectFilterCtrl: UntypedFormControl = new UntypedFormControl();
  public filteredproject: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);
  protected _onDestroy = new Subject<void>();
  /** control for the selected project */
  //  public clientCtrl: FormControl = new FormControl("");

  //  /** control for the MatSelect filter keyword */
  //  public clientFilterCtrl: FormControl = new FormControl();

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  notesDetails: any[] = [];

  constructor(
    private releaseNotesService: ReleaseNotesService,
    private spinner: NgxSpinnerService,
    private router: Router,
    public dialog: MatDialog,
    public route: Router,
    private utilsService: UtilService
    // private domSanitizer: DomSanitizer,
  ) { }

  ngOnInit() {
    this.viewReleaseNotesDetails();
    // this.viewCustomReleaseNotesDetails();
  }
  addReleaseNotesForm() {
    this.route.navigate(['add-release-notes']);
    this.filteredproject.next(this.filteredclient.slice());
    // listen for search field value changes
    this.projectFilterCtrl.valueChanges.pipe(takeUntil(this._onDestroy)).subscribe(() => {
      this.filterproject();
    });
  }
  //filter function for project form field
  protected filterproject() {
    if (!this.filteredclient) {
      return;
    }
    // get the search keyword
    let search = this.projectFilterCtrl.value;
    if (!search) {
      this.filteredproject.next(this.filteredclient.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
    // filter the client
    this.filteredproject.next(
      this.filteredclient.filter(data => data.toLowerCase().indexOf(search) > -1)
    );
  }

  keynotes = "";
  async viewReleaseNotesDetails() {
    this.spinner.show();
    this.keynotes = "";
    this.noDataMsg = true;
    this.reset_filter_btn = false;
    this.releaseNotesDetails = [];
    await this.releaseNotesService.getAllReleaseNotesCustomDetails().subscribe(data => {
      if (data.map.statusMessage == "Success") {
        let res: any[] = JSON.parse(data.map.data);
        this.tablePaginationOption = tablepageOption.tablePaginationOption(res.length);
        // this.keynotes = res[0].keyNote;
        // console.log(res);
        // console.log(this.keynotes);
        // console.log(res[0].notes_pdfFormat);
        for (let i = 0; i < res.length; i++) {
          res[i].loading = false;
          res[i].downloading = false;
          this.releaseNotesDetails.push(res[i]);
        }
        // console.log(this.releaseNotesDetails);
        this.no_data = this.releaseNotesDetails;
        this.noDataLength = this.releaseNotesDetails.length;
        // console.log(length);
        this.dataSource = new MatTableDataSource(this.releaseNotesDetails);
        // console.log(this.dataSource);
        // console.log(this.releaseNotesDetails);
        this.dataSource.sort = this.sort;
        this.dataSource.paginator = this.paginator;
        setTimeout(() => {
          this.spinner.hide();
        }, 3000);
      }
      // else {
      //   setTimeout(() => {
      //     this.spinner.hide();
      //   }, 1000);
      // }
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
    })
  }
  // viewReleaseNotesDetails() {
  //   // console.log("view Release notes");
  //   this.spinner.show();
  //   this.keynotes = "";
  //   this.noDataMsg = true;
  //   this.releaseNotesDetails = [];
  //   let orgId = localStorage.getItem("OrgId");
  //   this.releaseNotesService.getAllReleaseNotesDetails().subscribe(data => {
  //     // console.log(data);
  //     // this.releaseNotesService.getActiveOrgIdReleaseNotesDetails(orgId).subscribe(data => {
  //     if (data.map.statusMessage == "Success") {
  //       let res: any[] = JSON.parse(data.map.data);
  //       // this.keynotes = res[0].keyNote;
  //       // console.log(res);
  //       // console.log(this.keynotes);
  //       for (let i = 0; i < res.length; i++) {
  //         this.releaseNotesDetails.push(res[i]);
  //       }
  //       this.no_data = this.releaseNotesDetails;
  //       this.noDataLength = this.releaseNotesDetails.length;
  //       // console.log(length);
  //       this.dataSource = new MatTableDataSource(this.releaseNotesDetails);
  //       // console.log(this.dataSource);
  //       console.log(this.releaseNotesDetails);
  //       this.dataSource.sort = this.sort;
  //       this.dataSource.paginator = this.paginator;
  //       setTimeout(() => {
  //         this.spinner.hide();
  //       }, 1000);
  //     }
  //     // else {
  //     //   setTimeout(() => {
  //     //     this.spinner.hide();
  //     //   }, 1000);
  //     // }
  //   }, (error) => {
  //     this.router.navigate(["/404"]);
  //     this.spinner.hide();
  //   })
  // }
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
  selectedClientEvent(event: any) {
    // console.log(event);
    this.noDataMsg = true;
    this.keynotes = event.value;
    this.reset_filter_btn = true;
    // console.log(this.keynotes);
    let selectReleaseNotes = [];
    let selectnumber = 0;
    this.dataSource = new MatTableDataSource();
    for (let i = 0; i < this.releaseNotesDetails.length; i++) {
      if (this.releaseNotesDetails[i].keyNote == this.keynotes) {
        selectReleaseNotes.push(this.releaseNotesDetails[i]);
        selectnumber += 1;
      }
    }

    // console.log(selectReleaseNotes);
    this.noDataLength = selectReleaseNotes.length;
    // this.noDataLength = this.releaseNotesDetails.length;
    this.dataSource = new MatTableDataSource(selectReleaseNotes);
    // console.log(this.dataSource);

    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;

  }
  resetTableFilterByreleaseNotes() {
    this.spinner.show();
    this.reset_filter_btn = false;
    this.no_data = this.releaseNotesDetails;
    this.noDataLength = this.releaseNotesDetails.length;
    this.dataSource = new MatTableDataSource(this.releaseNotesDetails);
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
    this.project.setValue('');
    this.spinner.hide();
  }

  bulk_delete() {
    this.listProject = [];
    for (var i = 0; i < this.selection.selected.length; i++) {
      this.listProject.push(this.selection.selected[i].id);
    }
  }
  async viewThePdfNotes(id: any) {
    for (let i = 0; i < this.releaseNotesDetails.length; i++) {
      if (this.releaseNotesDetails[i].id == id) {
        this.releaseNotesDetails[i].loading = true;
        break;
      }
    }
    await this.releaseNotesService.getViewPdfDetails(id).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        let response = JSON.parse(data.map.data);
        // console.log(response);
        const file = response[0];
        let stringArray = new Uint8Array(file);
        const String_Char = stringArray.reduce((data, byte) => {
          return data + String.fromCharCode(byte);
        }, '');
        for (let i = 0; i < this.releaseNotesDetails.length; i++) {
          if (this.releaseNotesDetails[i].id == id) {
            this.releaseNotesDetails[i].loading = false;
            break;
          }
        }
        let base64String = btoa(String_Char);
        const imageBlob = this.dataUritoBlob(base64String);
        const imageFile = new File([imageBlob], "releaseNotes", { type: 'application/pdf' })
        const fileURL = URL.createObjectURL(imageFile);
        window.open(fileURL, '_blank');
      }

    })


  }
  async downloadPdfNotes(id: any, name: any, version: any) {
    for (let i = 0; i < this.releaseNotesDetails.length; i++) {
      if (this.releaseNotesDetails[i].id == id) {
        this.releaseNotesDetails[i].downloading = true;
        break;
      }
    }
    await this.releaseNotesService.getViewPdfDetails(id).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        let response = JSON.parse(data.map.data);
        // console.log(response);
        const file = response[0];
        const fileName = name;
        const version1 = version;
        let stringArray = new Uint8Array(file);
        const String_Char = stringArray.reduce((data, byte) => {
          return data + String.fromCharCode(byte);
        }, '');
        let base64String = btoa(String_Char);
        const imageBlob = this.dataUritoBlob(base64String);
        for (let i = 0; i < this.releaseNotesDetails.length; i++) {
          if (this.releaseNotesDetails[i].id == id) {
            this.releaseNotesDetails[i].downloading = false;
            break;
          }
        }
        var link = document.createElement('a');
        link.href = window.URL.createObjectURL(imageBlob);
        link.download = 'Releasenotes(' + fileName + '-' + version1 + ').pdf';
        link.click();
        window.URL.revokeObjectURL(link.href);
      }
    })

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
  updateReleaseNotes(id: any) {
    this.route.navigate(['edit-release-notes/' + id]);
  }

  deleteReleaseNotes(id: any) {
    let release_id = id;
    const dialogRef = this.dialog.open(DeleteComponent, {
      width: '30%',
      panelClass: 'custom-viewdialogstyle',
      data: { key: "release-delete", showComment: false }
    })
    dialogRef.afterClosed().subscribe(resp => {
      if (resp != undefined && resp != null) {
        if (resp.data == true) {
          this.deleteReleaseDetails(id);
        }
      }
      // this.releaseNotesDetails = [];
      // this.ngOnInit();
    })
  }
  
  deleteReleaseDetails(id: any) {
    // console.log(id);
    this.spinner.show();
    this.releaseNotesService.deleteReleaseNotesByIdDetails(id).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        this.utilsService.openSnackBarAC("Release notes deleted successfully", "OK");
        // this.releaseNotesDetails = [];
        // this.ngOnInit();
        this.viewReleaseNotesDetails();
        setTimeout(() => {
          this.spinner.hide();
        }, 1000);

      }
      else {
        this.utilsService.openSnackBarMC("Failed to delete release notes details", "OK");
        this.spinner.hide();
      }
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
    })
  }

  bulkDelete() {
    const dialogRef = this.dialog.open(BulkDeleteDialogComponent, {
      width: '30%',
      panelClass: 'custom-viewdialogstyle',
      data: { key: 'release-bulk-delete', showComment: false }
    });
    dialogRef.afterClosed().subscribe(
      resp => {
        if (resp != undefined && resp != null) {
          if (resp.data == true) {
            this.deleteReleaseDetailsData(this.listProject);
          }
        }
        this.selection.clear();
        this.listProject = [];
        this.releaseNotesDetails = [];
      }
    );

  }
  deleteReleaseDetailsData(listdata: any) {
    // console.log(listdata);
    this.spinner.show();
    let data = {
      "deleteIds": listdata,
    }
    this.releaseNotesService.bulkReleaseNotesDelete(data).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        this.utilsService.openSnackBarAC("Release notes deleted successfully", "OK");
        this.selection.clear();
        this.listProject = [];
        this.viewReleaseNotesDetails();
        // this.dialogRef.close();
        setTimeout(() => {
          this.spinner.hide();
        }, 2000);
      }
      else {
        this.utilsService.openSnackBarMC("Failed to delete release notes", "OK");
        this.spinner.hide();
      }

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

  publishReleaseNotes(id: any) {
    let release_id = id;
    const dialogRef = this.dialog.open(PublishNotesComponent, {
      width: '30%',
      panelClass: 'custom-viewdialogstyle',
      data: { id: release_id, active: "publish" }
    })
    dialogRef.afterClosed().subscribe(resp => {
      if (resp != undefined && resp != null) {
        if (resp.data == true) {
          this.viewReleaseNotesDetails();
        }
      }
      // this.releaseNotesDetails = [];
      // this.ngOnInit();
    })

  }
  RepublishReleaseNotes(id: any) {
    let release_id = id;
    const dialogRef = this.dialog.open(PublishNotesComponent, {
      width: '30%',
      panelClass: 'custom-viewdialogstyle',
      data: { id: release_id, active: "republish" }
    })
    dialogRef.afterClosed().subscribe(resp => {
      if (resp != undefined && resp != null) {
        if (resp.data == true) {
          this.viewReleaseNotesDetails();
        }
      }
      // this.releaseNotesDetails = [];
      // this.ngOnInit();
    })
  }
  update_release() {
    const dialogRef = this.dialog.open(UpdateRelaseDialogComponent,{
      width:'30%',
      panelClass:'custom-viewdialogstyle'
    })
    dialogRef.afterClosed().subscribe(resp => {
      if (resp != undefined && resp != null) {
        if (resp.data == true) {
          this.viewReleaseNotesDetails();
          // this.updateReleaseData();
        }
      }
    });

  }

  
}





