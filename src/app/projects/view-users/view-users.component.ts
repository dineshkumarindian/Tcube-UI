import { AfterContentChecked, ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DomSanitizer } from '@angular/platform-browser';
import { NgxSpinnerService } from 'ngx-spinner';
import { ProjectsService } from 'src/app/services/projects.service';
import { DialogData } from 'src/app/time-tracker/edit-time-tracker/edit-time-tracker.component';
import { BulkUsersComponent } from '../bulk-users/bulk-users.component';
import { Router } from '@angular/router';
import { UtilService } from 'src/app/services/util.service';
import {viewTeamMembers,addteamMembers,viewManager} from '../../util/constants';
@Component({
  selector: 'app-view-users',
  templateUrl: './view-users.component.html',
  styleUrls: ['./view-users.component.less']
})
export class ViewUsersComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<ViewUsersComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private domSanitizer: DomSanitizer,
    private dialog: MatDialog,
    private utilsService: UtilService,
    private router: Router,
    private projectsService: ProjectsService,
    private spinner: NgxSpinnerService,
  ) { }

  viewTeamMsg = viewTeamMembers;
  addTeamMsg = addteamMembers;
    viewManager = viewManager;

  view
  header: any;
  projectIsActive: boolean;
  list = [];
  project_id: any;
  listProject: any = [];
  emp_id: any;
  Org_id: any;
  fullscreen: boolean;
  View_members: boolean = false;
  deactivateSingleUser:boolean = false;
  all_project_details: any = [];
  project_details: any []= [];
  projectResourceDetails: any[] = [];
  isModified: boolean = false;
  ngOnInit() {
    this.fullscreen = true;
    this.emp_id = localStorage.getItem('Id');
    this.Org_id = localStorage.getItem('OrgId');
    this.header = this.data.header;
    // this.list = this.data.list;
    this.project_id = this.data.id;
    this.projectIsActive = this.data.isActiveProject;
    this.listProject.push(this.project_id);
    // -------------remove user condition for to show only for view menber cards---------------------
    if (this.header == "View Team Members") {
      this.View_members = true;
    }
    else if (this.header == "View Team Member") {
      this.View_members = true;
    }
    else {
      this.View_members = false;
    }

    setTimeout(() => {
      // this.getprojectdetailsbyid();
      this.disabledUserInViewMembers();
    }, 100);
    this.isModified = false;
  }

  //function to close the dialog
  //send response of isModified value to the parent component
  closeDialog(){
    this.dialogRef.close({ data: this.isModified});
  }
  view_data: any = [];
  image_url: any;
  convertimgurl() {
    this.view_data = [];
    for (var i = 0; i < this.list.length; i++) {
      if (this.list[i].photo != undefined) {
        // debugger
        let stringArray = new Uint8Array(this.list[i].photo);
        const STRING_CHAR = stringArray.reduce((data, byte) => {
          return data + String.fromCharCode(byte);
        }, '');
        let base64String = btoa(STRING_CHAR);
        this.image_url = this.domSanitizer.bypassSecurityTrustUrl("data:image/jpeg;base64," + base64String);
        this.view_data.push({ "name": this.list[i].name, "role": this.list[i].role, "emp_id": this.list[i].emp_id, "Project_id": this.project_id, "photo": this.image_url, "status":this.list[i].status });
       }
      else {
        this.view_data.push({ "name": this.list[i].name, "role": this.list[i].role, "emp_id": this.list[i].emp_id, "Project_id": this.project_id, "photo": "assets/images/user_person.png", "status":this.list[i].status });
          }
    }
    // console.log("87==>",this.view_data);
  }
  assignusers() {
    const dialogRef = this.dialog.open(BulkUsersComponent, {
      disableClose: true,
      minWidth: '600px',
      panelClass: 'custom-viewdialogstyle',
      data: {isAssignee:"bulk-user",listproject: this.listProject, bulkusers: false , assignedUsers: this.list, projectName: this.data.projectName}
    });
    dialogRef.afterClosed().subscribe(
      resp => {
        if (resp != undefined && resp != "") {
          if (resp.data == true) {
            this.isModified = true;
            this.disabledUserInViewMembers();
          }}
      }, (error) => {
        this.router.navigate(["/404"]);
        this.spinner.hide();
      }
    );
  }
  view_users = [];
  // getprojectdetailsbyid() {
  //   this.spinner.show();
  //   this.view_users = [];
  //   this.projectsService.getActiveProjectDetailsById(this.project_id).subscribe(data => {
  //     if (data.map.statusMessage == "Success") {
  //       let response = JSON.parse(data.map.data);
  //       let project_resource = [];
  //       project_resource = response.resourceDetails;
  //       for (var i = 0; i < project_resource.length; i++) {
  //         if (this.header === "View Team Members" || this.header === "View Team Member") {
  //           if (project_resource[i].designation == "team_members") {
  //             this.view_users.push({ "name": project_resource[i].employeeDetails.firstname + " " + project_resource[i].employeeDetails.lastname, "role": project_resource[i].employeeDetails.roleDetails.role, "emp_id": project_resource[i].employeeDetails.id, "Project_id": this.project_id, "photo": project_resource[i].employeeDetails.profile_image })
  //           }
  //         }
  //         if (this.header === "View Manager" || this.header === "View Managers") {
  //           if (project_resource[i].designation == "project_manager") {
  //             this.view_users.push({ "name": project_resource[i].employeeDetails.firstname + " " + project_resource[i].employeeDetails.lastname, "role": project_resource[i].employeeDetails.roleDetails.role, "photo": project_resource[i].employeeDetails.profile_image })
  //           }
  //         }
  //       }
  //       this.list = this.view_users;
  //       this.convertimgurl();
  //     }
  //   }, (error) => {
  //     this.router.navigate(["/404"]);
  //     this.spinner.hide();
  //   })
  //   setTimeout(() => {
  //     this.spinner.hide();
  //   }, 3000);
  // }
  removinguser_id: any = []
  previousemp_id: any = []
  close_open: boolean = false;
  remove(data) {
    this.removinguser_id = data;
    if (this.close_open && data == this.previousemp_id) {
      this.close_open = false;
    }
    else {
      this.close_open = true;
    }
    this.previousemp_id = data;
  }
  userremove(emp_id, Project_id) {
    this.isModified = true;
    this.spinner.show();
    let data: Object = {
      "projectId": Project_id,
      "empId": emp_id
    }
    this.projectsService.projectUserRemove(data).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        this.close_open = false;
        this.utilsService.openSnackBarAC("User removed successfully", "OK");
        // this.ngOnInit();
        this.disabledUserInViewMembers();
      }
      else{
        this.utilsService.openSnackBarMC("Failed to remove user", "OK");
      }
    });
    this.spinner.hide();
  }
  //To display the user in disabled form  in view team members after single deactivate in manage user
  disabledUserInViewMembers() {
    this.spinner.show();
    this.project_details = [];
    this.projectResourceDetails = [];
    let data: Object = {
      "org_id" : this.Org_id,
      "projId" : this.project_id
    };
    this.projectsService.disableUserAfterDeactivate(data).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        let response = JSON.parse(data.map.data);
        this.all_project_details = response;
        console.log(this.all_project_details);
        this.project_details.push(this.all_project_details[0].resourceDetails);
        
        for (var i = 0; i < this.project_details.length; i++) {
          for(let j=0; j< this.project_details[i].length; j++) {
        if (this.header === "View Team Members" || this.header === "View Team Member") {
           if (this.project_details[i][j].map.designation == "team_members") {
          this.projectResourceDetails.push({ "name":this.project_details[i][j].map.name, "role": this.project_details[i][j].map.role, "photo": this.project_details[i][j].map.profile_image , "status":this.project_details[i][j].map.status,"emp_id":this.project_details[i][j].map.id});
        }
      }
      if (this.header === "View Manager" || this.header === "View Managers") {
           if (this.project_details[i][j].map.designation == "project_manager") {
            this.projectResourceDetails.push({ "name":this.project_details[i][j].map.name, "role": this.project_details[i][j].map.role, "photo": this.project_details[i][j].map.profile_image , "status":this.project_details[i][j].map.status});
                  }
                }
    }
  }
      this.list = this.projectResourceDetails;
      this.convertimgurl();
      }
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
    })
    setTimeout(() => {
      this.spinner.hide();
    }, 3000);
  }

   //To display the user in disabled form after single deactivate in manage user
  // disabledBulkUserInViewMembers() {
  //   this.spinner.show();
  //   this.view_users = [];
  //   let data: Object = {
  //     "org_id" : this.Org_id,
  //     "deleteIds" : this.listProject
  //   };
  //   this.projectsService.disableBulkUserAfterBulkDeactivate(data).subscribe(data => {
  //     if (data.map.statusMessage == "Success") {
  //       let response = JSON.parse(data.map.data);
  //       console.log("221==>",response);
  //       this.all_project_details = response;
  //       for (var i = 0; i < this.all_project_details.length; i++) {
  //         if (this.all_project_details[i].is_activated == true) {
  //           this.project_details.push(this.all_project_details[i].resourceDetails);
  //         }
  //       }
  //       for (var i = 0; i < this.project_details.length; i++) {
  //         for(let j=0; j< this.project_details[i].length; j++) {
  //       if (this.header === "View Team Members" || this.header === "View Team Member") {
  //          if (this.project_details[i][j].map.designation == "team_members") {
  //         this.projectResourceDetails.push({ "name":this.project_details[i][j].map.name, "role": this.project_details[i][j].map.role, "photo": this.project_details[i][j].map.profile_image , "status":this.project_details[i][j].map.status,"emp_id":this.project_details[i][j].map.id});
  //       }
  //     }
  //     if (this.header === "View Manager" || this.header === "View Managers") {
  //          if (this.project_details[i][j].map.designation == "project_manager") {
  //           this.projectResourceDetails.push({ "name":this.project_details[i][j].map.name, "role": this.project_details[i][j].map.role, "photo": this.project_details[i][j].map.profile_image , "status":this.project_details[i][j].map.status});
  //                 }
  //               }
  //   }
  // }
  //     this.list = this.projectResourceDetails;
  //     console.log("243==>",this.list);
  //     this.convertimgurl();
  //     }
  //   }, (error) => {
  //     this.router.navigate(["/404"]);
  //     this.spinner.hide();
  //   })
  //   setTimeout(() => {
  //     this.spinner.hide();
  //   }, 3000);
  // }
}
