import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NgxSpinnerService } from 'ngx-spinner';
import { JobsService } from 'src/app/services/jobs.service';
import { ProjectsService } from 'src/app/services/projects.service';
import { UtilService } from 'src/app/services/util.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-job-bulk-delete',
  templateUrl: './job-bulk-delete.component.html',
  styleUrls: ['./job-bulk-delete.component.less']
})
export class JobBulkDeleteComponent implements OnInit {
  list: any=[];

  constructor(
    public dialogRef: MatDialogRef<JobBulkDeleteComponent>,
    @Inject(MAT_DIALOG_DATA) public data,
    private jobsService: JobsService,
    private utilsService: UtilService,
    private router: Router,
    private spinner:NgxSpinnerService,
  ) { }

  ngOnInit() {
    // console.log(this.data);
  }
// Bulk delete for jobs
  // deleteDetails(){
  //   this.spinner.show();
  //   let listdata = {
  //       "deleteIds": this.data,
  //   }
  //   this.jobsService.bulkDeleteJob(listdata).subscribe(data => {
  //       if (data.map.statusMessage == "Success") {
  //         this.utilsService.openSnackBarAC("Job details deleted successfully", "OK");
  //         this.dialogRef.close();
  //       }
  //       else {
  //         this.utilsService.openSnackBarMC("Faild to delete job details", "OK");
  //       }
  //       this.spinner.hide();
  //     }, (error) => {
  //       this.router.navigate(["/404"]);
  //       this.spinner.hide();
  //       this.dialogRef.close()
  //     })
  // }
}
