import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ProjectsService } from 'src/app/services/projects.service';
import { UtilService } from 'src/app/services/util.service';
import { NgxSpinnerService } from 'ngx-spinner';
import {updateStatus} from '../../util/constants';

@Component({
  selector: 'app-project-status',
  templateUrl: './project-status.component.html',
  styleUrls: ['./project-status.component.less']
})
export class ProjectStatusComponent implements OnInit {

  updateStatus = updateStatus;
  projectStatus = [
    "Inprogress",
    "Completed",
    "Closed",
    "Inactive"
  ];
  disable_matselect:Boolean;
  isModified: boolean = false;
  constructor(
    private fb: UntypedFormBuilder,
    private projectService: ProjectsService,
    private utilService: UtilService,
    private spinner: NgxSpinnerService,
    private router: Router,
    public dialogref: MatDialogRef<ProjectStatusComponent>,
    @Inject(MAT_DIALOG_DATA) public data,
    public dialogRef: MatDialogRef<ProjectStatusComponent>,
  ) { }
  changeStatusFormGroup: UntypedFormGroup = this.fb.group({
    prjStatus: ['',[Validators.required]],
    statuscomments: ['', []]

  });


  ngOnInit() {
    this.isModified = false;
    this.changeStatusFormGroup;
    this.setStatusFormValue();
    this.disable_matselect = this.data;
  }

    //function to close the dialog
  //send response of isModified value to the parent component
  closeDialog(){
    this.dialogRef.close({ data: this.isModified});
  }

  editProjectStatus(details) {
    this.isModified = true;
    // let project_id = this.projectService.getProjectId()
    let project_id = localStorage.getItem("projectId");
    let formData = {
      "project_status": (details.prjStatus),
      "status_comment":this.changeStatusFormGroup.value.statuscomments
    }

    this.projectService.updateProjectStatus(formData, project_id).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        this.utilService.openSnackBarAC("Project status updated successfully", "OK");
        setTimeout(() => {
          this.router.navigate(["/project-management/new-project"]);
        }, 1000);
        this.closeDialog();
      }
      else if (data.map.statusMessage != "Success") {
        this.utilService.openSnackBarMC("Failed to update project status ", 'OK');
      }
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
    });
  }

// COMMANDED AS THIS SERVICE THROWS 404 ERROR IN UAT, RESPONSE IS TOO LONG
  // setStatusFormValue(){
  //   this.spinner.show();
  //   // let project_id = this.projectService.getProjectId()
  //   let project_id = localStorage.getItem("projectId");
  //   this.projectService.getActiveProjectDetailsById(project_id).subscribe(response => {
  //     if(response.map.statusMessage == "Success") {
  //       let responseData = JSON.parse(response.map.data);
  //       console.log(responseData);
  //       this.changeStatusFormGroup.get("prjStatus").setValue(responseData.project_status);
  //     }
  //   }, (error) => {
  //     this.router.navigate(["/404"]);
  //     this.spinner.hide();
  //   })
  //   setTimeout(() => {
  //     this.spinner.hide();
  //   }, 1000);
  // }

  // To get project status and status comment which is customised response
  setStatusFormValue(){
    this.spinner.show();
    // let project_id = this.projectService.getProjectId()
    let project_id = localStorage.getItem("projectId");
    this.projectService.getProjectStatusById(project_id).subscribe(response => {
      // if(response.map.statusMessage == "Success") {
        let responseData = JSON.parse(response.map.data);
        this.changeStatusFormGroup.get("prjStatus").setValue(responseData.project_status);
      // }
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
    })
    setTimeout(() => {
      this.spinner.hide();
    }, 1000);
  }
}
