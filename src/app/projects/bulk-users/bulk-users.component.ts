import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormControl, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ReplaySubject, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ProjectsService } from 'src/app/services/projects.service';
import { SettingsService } from 'src/app/services/settings.service';
import { UtilService } from 'src/app/services/util.service';
import { ViewUsersComponent } from '../view-users/view-users.component';
import { errorMessage, addteamMembers,updateStaff } from '../../util/constants';
import moment from 'moment';
import { NotificationService } from 'src/app/services/notification.service';

@Component({
  selector: 'app-bulk-users',
  templateUrl: './bulk-users.component.html',
  styleUrls: ['./bulk-users.component.less']
})
export class BulkUsersComponent implements OnInit {

  requiredMessage = errorMessage;
  addUser:string;
  userlist = [];
  assigneeList: any[] = [];
  usersselectedItems = [];
  showusers: boolean = false;
  employeeDetails: any[] = [];
  orgAdminId: any;
  loginurl: string;
  projects_str: string;
  protected _onDestroy = new Subject<void>();
  isModified: boolean = false;
  constructor(
    private projectsService: ProjectsService,
    private settingsService: SettingsService,
    private utilsService: UtilService,
    private router: Router,
    public dialogRef: MatDialogRef<BulkUsersComponent>,
    private dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data,
    private spinner: NgxSpinnerService,
    private notificationService: NotificationService,
  ) {
    this.loginurl = window.location.href;
    this.projects_str = this.loginurl;
    if(data.isAssignee == "add-user"){
      this.addUser = addteamMembers;
    } else {
      this.addUser = updateStaff;
    }
  }

  /** control for the selected project */
  public AssigneeCtrl: UntypedFormControl = new UntypedFormControl("", [Validators.required]);

  /** control for the MatSelect filter keyword */
  public AssigneeFilterCtrl: UntypedFormControl = new UntypedFormControl();

  /** list of head filtered by search keyword */
  public filteredAssignee: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);
  Bulkusers: boolean = true;
  assigneesId: string[] = [];
  projectAssigneeDetails: any = []
  async ngOnInit() {
    await this.geEmployeeDetailsByOrgId();
    if (this.data.assignedUsers.length > 0) {
      for (let i = 0; i < this.data.assignedUsers.length; i++) {
        this.assigneesId.push(this.data.assignedUsers[i].emp_id);
      }
    }
    this.isModified = false;

    if (this.data.bulkusers == false) {
      this.Bulkusers = this.data.bulkusers;
    }
    else {
      this.Bulkusers = true;
    }
    for (let i = 0; i < this.data.assignedUsers.length; i++) {
      // debugger
      this.projectAssigneeDetails.push(this.data.assignedUsers[i].emp_id);
    }
    this.usersselectedItems = this.projectAssigneeDetails;

  }

  //function to close the dialog
  //send response of isModified value to the parent component
  closeDialog() {
    this.dialogRef.close({ data: this.isModified });
  }
  protected filterassignee() {
    if (!this.employeeDetails) {
      return;
    }
    // get the search keyword
    let search = this.AssigneeFilterCtrl.value;
    if (!search) {
      this.filteredAssignee.next(this.employeeDetails.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
    // filter the client
    this.filteredAssignee.next(
      this.employeeDetails.filter(user => user.firstname.toLowerCase().indexOf(search) > -1)
    );
  }
  userlist1: any = []
  async usersfunction(event) {
    this.userlist1 = [];
    this.userlist = [];
    this.assigneeList = [];
    if (this.usersselectedItems) {
      for (let i = 0; i < this.usersselectedItems.length; i++) {
        for (let j = 0; j < this.employeeDetails.length; j++) {
          if (this.employeeDetails[j].id == this.usersselectedItems[i]) {
            this.userlist1.push(this.employeeDetails[j]);
          }
        }
      }
    }
    if (this.employeeDetails.length == 0) {
      for (let i = 0; i < this.data.assignedUsers.length; i++) {
        this.userlist.push({ name: this.data.assignedUsers[i].name, rph: '0' });
        this.assigneeList.push({ emp_id: this.data.assignedUsers[i].emp_id, rph: '0' })
      }
    }
    else {
      for (let i = 0; i < this.userlist1.length; i++) {
        this.userlist.push({ name: this.userlist1[i].firstname + " " + this.userlist1[i].lastname, rph: '0' });
        this.assigneeList.push({ emp_id: this.userlist1[i].id, rph: '0' })
        // this.userlist.push({ name: this.usersselectedItems[i].employeeDetails.firstname + " " + this.usersselectedItems[i].employeeDetails.lastname, rph: '0' });
        // this.assigneeList.push({ emp_id: this.usersselectedItems[i].employeeDetails.id, rph: '0' })
      }
    }
    if (this.data.assignedUsers.length > 0) {
      this.showusers = true;
    }
    else {
      this.showusers = false;
    }
  }

  rphchangeuser(i: number, value: any) {
    this.userlist[i].rph = value;
    this.assigneeList[i].rph = value;
  }
  geEmployeeDetailsByOrgId() {
    this.spinner.show();
    let orgId = localStorage.getItem("OrgId");
    //before used method --> getActiveEmpDetailsByOrgId()
    //Here I have used the get ACTIVE EMPLOYEE DETAILS API call --> Means its get all user details under the Organization Id
    this.settingsService.getCustomActiveEmpDetailsByOrgID(orgId).subscribe(data => {
      let response: any[] = JSON.parse(data.map.data);
      this.employeeDetails = response;
      for (let i = 0; i < this.employeeDetails.length; i++) {
        if(this.employeeDetails[i].role == "OrgAdmin") {
        this.orgAdminId= this.employeeDetails[i].id;
        }
      }
      // load the initial assignee list
      this.filteredAssignee.next(this.employeeDetails.slice());
      // listen for search field value changes
      this.AssigneeFilterCtrl.valueChanges
        .pipe(takeUntil(this._onDestroy))
        .subscribe(() => {
          this.filterassignee();
        });
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
    })
    setTimeout(() => {
      this.spinner.hide();
    }, 2000);
  }

  updateUsers() {
    this.isModified = true;
    this.spinner.show();
    let listdata = {
      "projectIds": this.data.listproject,
      "resource_details": this.assigneeList,
      "designation": "team_members",
      "projects_url": this.projects_str
    }
    let zone = moment.tz.guess();
    this.projectsService.bulkUsers(listdata).subscribe(data => {
      if (data.map.statusMessage == "Success" && data.map.Error == "Error in creating user due to mail configuration check the configuration details") {
       
        for (let i = 0; i < this.assigneeList.length; i++) {
          if (!this.assigneesId.includes(this.assigneeList[i].emp_id)) {
            let message = '<p style="font-size: 14px !important; line-height:20px;">You have been assigned in <span style="background-color: #2e7f35; border-radius: 4px; color: white; padding: 0px 5px; font-weight: 400; font-size: 12px !important;">' + this.data.projectName + '</span> project</p>';
            let formdata = {
              "org_id": localStorage.getItem('OrgId'),
              "message": message,
              "to_notify_id": this.assigneeList[i].emp_id,
              "notifier": localStorage.getItem('Id'),
              "module_name": "Project and Jobs",
              "sub_module_name": "Project",
              "date_of_request": moment(new Date()).format("YYYY-MM-DD"),
              "approval_status": "Approved",
              "timezone": zone
            }
            this.notificationService.postNotification(formdata).subscribe(data => {
              if (data.map.statusMessage == "Success") {
              }
              else {
              }
            })
          }
        }
        // send notification with mail expired info message
        let message =
        "Mail configuration issue encountered while adding bulk users in project.";
        let formdata = {
          org_id: localStorage.getItem("OrgId"),
          message: message,
          to_notify_id: this.orgAdminId,
          notifier: localStorage.getItem("Id"),
          keyword: "mail-issue",
          timezone: zone,
        };
        this.notificationService
          .postNotification(formdata)
          .subscribe((data) => {
            if (data.map.statusMessage == "Success") {
              this.spinner.hide();
            } else {
              this.spinner.hide();
            }
          });
        if (this.data.listproject.length > 1) {
          this.utilsService.openSnackBarAC("Users added successfully and existing users will be skipped", "OK");
        }
        else {
          this.utilsService.openSnackBarAC("Project users updated successfully", "OK");
        }
        setTimeout(() => {
          this.closeDialog();
        }, 2500);
        // this.updatedusers();
      } else if (data.map.statusMessage == "Success") {
        for (let i = 0; i < this.assigneeList.length; i++) {
          if (!this.assigneesId.includes(this.assigneeList[i].emp_id)) {
            let message = '<p style="font-size: 14px !important; line-height:20px;">You have been assigned in <span style="background-color: #2e7f35; border-radius: 4px; color: white; padding: 0px 5px; font-weight: 400; font-size: 12px !important;">' + this.data.projectName + '</span> project</p>';
            let formdata = {
              "org_id": localStorage.getItem('OrgId'),
              "message": message,
              "to_notify_id": this.assigneeList[i].emp_id,
              "notifier": localStorage.getItem('Id'),
              "module_name": "Project and Jobs",
              "sub_module_name": "Project",
              "date_of_request": moment(new Date()).format("YYYY-MM-DD"),
              "approval_status": "Approved",
              "timezone": zone
            }
            this.notificationService.postNotification(formdata).subscribe(data => {
              if (data.map.statusMessage == "Success") {
              }
              else {
              }
            })
          }

        }
        if (this.data.listproject.length > 1) {
          this.utilsService.openSnackBarAC("Users added successfully and existing users will be skipped", "OK");
        }
        else {
          this.utilsService.openSnackBarAC("Project users updated successfully", "OK");
        }
        setTimeout(() => {
          this.closeDialog();
        }, 2500);
        // this.updatedusers();
      }
      else {
        this.utilsService.openSnackBarMC(data.map.data, "OK");
      }
      setTimeout(() => {
        this.spinner.hide();
      }, 2000)
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
    })
  }

  // updatedusers(){
  //   const dialogRef = this.dialog.open(ViewUsersComponent, {
  //     minWidth: '40%',
  //     panelClass: 'custom-viewdialogstyle',
  //     data: this.data[2],
  //   });
  //   dialogRef.afterClosed().subscribe(
  //   );
  // }
  // manageusers(){
  //   setTimeout(() => {
  //     this.router.navigate(["/settings"]);
  //   }, 100);
  // }
}
