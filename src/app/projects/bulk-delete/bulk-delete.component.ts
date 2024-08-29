import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NgxSpinnerService } from 'ngx-spinner';
import { ProjectsService } from 'src/app/services/projects.service';
import { UtilService } from 'src/app/services/util.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-bulk-delete',
  templateUrl: './bulk-delete.component.html',
  styleUrls: ['./bulk-delete.component.less']
})
export class BulkDeleteComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<BulkDeleteComponent>,
    @Inject(MAT_DIALOG_DATA) public data,
    private projectsService: ProjectsService,
    private utilsService: UtilService,
    private spinner: NgxSpinnerService,
    private router: Router,

  ) { }
  list = [];
  ngOnInit() {
    this.list = this.data.name;
  }

  // bulk delete for projects
  // deleteDetails() {
  //   this.spinner.show();
  //   let listdata = {
  //     "deleteIds": this.list
  //   }
  //   this.projectsService.bulkDelet(listdata).subscribe(data => {
  //     if (data.map.statusMessage == "Success") {
  //       this.utilsService.openSnackBarAC("Project details deleted successfully", "OK");
  //       this.dialogRef.close();
  //     }
  //     else {
  //       this.utilsService.openSnackBarMC("Failed to delete project details", "OK");
  //     }
  //     this.spinner.hide();
  //   }, (error) => {
  //     this.router.navigate(["/404"]);
  //     this.spinner.hide();
  //     this.dialogRef.close();
  //   })
  // }

}
