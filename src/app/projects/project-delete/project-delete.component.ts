import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { NgxSpinnerService } from 'ngx-spinner';
import { ProjectsService } from 'src/app/services/projects.service';
import { UtilService } from 'src/app/services/util.service';
import { Router } from '@angular/router';
@Component({
  selector: 'app-project-delete',
  templateUrl: './project-delete.component.html',
  styleUrls: ['./project-delete.component.less']
})
export class ProjectDeleteComponent implements OnInit {

  constructor(
    private projectsService: ProjectsService,
    public dialogRef: MatDialogRef<ProjectDeleteComponent>,
    private utilsService: UtilService,
    private spinner: NgxSpinnerService,
    private router: Router,
  ) { }

  ngOnInit() {

  }

  // deleteDetails(){
  //   this.spinner.show();
  //   let id = localStorage.getItem("projectId");
  //   this.projectsService.deleteProject(id).subscribe(data => {
  //       if (data.map.statusMessage == "Success") {
  //         this.utilsService.openSnackBarAC("Project details deleted successfully", "OK");
  //         this.dialogRef.close();
  //       }
  //       else {
  //         this.utilsService.openSnackBarMC("Failed to delete project details", "OK");
  //       }
  //       this.spinner.hide();
  //     }, (error) => {
  //       this.router.navigate(["/404"]);
  //       this.spinner.hide();
  //       this.dialogRef.close();
  //     })
  // }

}
