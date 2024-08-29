import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { NgxSpinnerService } from 'ngx-spinner';
import { JobsService } from 'src/app/services/jobs.service';
import { UtilService } from 'src/app/services/util.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-job-delete',
  templateUrl: './job-delete.component.html',
  styleUrls: ['./job-delete.component.less']
})
export class JobDeleteComponent implements OnInit {

  constructor(
    private jobsService: JobsService,
    public dialogRef: MatDialogRef<JobDeleteComponent>,
    private utilsService: UtilService,
    private router: Router,
    private spinner: NgxSpinnerService,
  ) { }

  ngOnInit() {
  }

  // deleteDetails() {
  //   this.spinner.show();
  //   let id = localStorage.getItem("jobId");
  //   this.jobsService.deleteJob(id).subscribe(data => {
  //     if (data.map.statusMessage == "Success") {
  //       this.utilsService.openSnackBarAC("Job details deleted successfully", "OK");
  //       this.dialogRef.close();
  //     }
  //     else {
  //       this.utilsService.openSnackBarMC("Failed to delete job details", "OK");
  //     }
  //     this.spinner.hide();
  //   }, (error) => {
  //     this.router.navigate(["/404"]);
  //     this.spinner.hide();
  //     this.dialogRef.close();
  //   })
  // }
}
