import { Component, OnInit ,Inject } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { JobsService } from 'src/app/services/jobs.service';
import { UtilService } from 'src/app/services/util.service';
import {updateStatus} from 'src/app/util/constants';

@Component({
  selector: 'app-job-status',
  templateUrl: './job-status.component.html',
  styleUrls: ['./job-status.component.less']
})
export class JobStatusComponent implements OnInit {

  updateStatus = updateStatus;
  jobStatus = [
    "Inprogress",
    "Completed",
    "Closed",
    "Inactive"
  ];
  isModified: boolean = false;
  constructor(
    private fb: UntypedFormBuilder,
    private jobsService: JobsService,
    private utilService: UtilService,
    private router: Router,
    private spinner: NgxSpinnerService,
    @Inject(MAT_DIALOG_DATA) public data,
    public dialogref: MatDialogRef<JobStatusComponent>,
  ) { }
  
  changeStatusFormGroup: UntypedFormGroup = this.fb.group({
    jobStatus: ['',[Validators.required]],
    statuscomments: ['', []]
  });

  ngOnInit() {
    this.isModified = false;
    this.changeStatusFormGroup;
    this.setStatusFormValue();
  }
  closeDialog(){
    this.dialogref.close({ data: this.isModified});
  }

  editJobStatus(details) {
    this.isModified = true;
    // let project_id = this.projectService.getProjectId()
    let job_id = localStorage.getItem("jobId");

    let formData = {
      "job_status": (details.jobStatus),
      "status_comment":this.changeStatusFormGroup.value.statuscomments
    }

    this.jobsService.updateJobStatus(formData, job_id).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        this.utilService.openSnackBarAC("Job status updated successfully", "OK");
        setTimeout(() => {
          this.router.navigate(["/project-management/new-project"]);
        }, 1000);
        this.closeDialog();
      }
      else if (data.map.statusMessage != "Success") {
        this.utilService.openSnackBarMC("Failed to update job status ", 'OK');
      }
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
    }
    );
  }

  setStatusFormValue(){
    this.spinner.show();
    // let project_id = this.projectService.getProjectId()
    let job_id = localStorage.getItem("jobId");
    this.jobsService.getJobDetailsById(job_id).subscribe(response => {
      
      if(response.map.statusMessage == "Success") {
        let responseData = JSON.parse(response.map.data);
        // console.log(responseData);
        this.changeStatusFormGroup.get("jobStatus").setValue(responseData.job_status);
      }
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
    })
    setTimeout(() => {
              this.spinner.hide();
            }, 1000);
  }

}
