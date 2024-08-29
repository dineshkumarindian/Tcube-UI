import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormControl, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ReplaySubject, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { JobsService } from 'src/app/services/jobs.service';
import { ProjectsService } from 'src/app/services/projects.service';
import { SettingsService } from 'src/app/services/settings.service';
import { UtilService } from 'src/app/services/util.service';
import { errorMessage, addAssignee,updateStaff } from '../../util/constants';
import { NotificationService } from 'src/app/services/notification.service';
import moment from 'moment';
@Component({
  selector: 'app-add-assignee',
  templateUrl: './add-assignee.component.html',
  styleUrls: ['./add-assignee.component.less']
})
export class AddAssigneeComponent implements OnInit {

  requiredMessage = errorMessage;
  addAssign = updateStaff;

  jobId: any;
  userlist = [];
  assigneeList: any[] = [];
  usersselectedItems = [];
  showusers: boolean = false;
  isJobIdAvailable: boolean = false;
  jobDetails;
  employeeDetails: any[] = [];
  protected _onDestroy = new Subject<void>();
  assigneeEmp: any[] = [];
  loginurl: string;
  jobs_str: string;
  orgAdminId: any;
  constructor(
    private jobsService: JobsService,
    private settingsService: SettingsService,
    private projectsService: ProjectsService,
    private utilsService: UtilService,
    private router: Router,
    private spinner: NgxSpinnerService,
    private notificationService: NotificationService,
    public dialogRef: MatDialogRef<AddAssigneeComponent>,
    @Inject(MAT_DIALOG_DATA) public data,
  ) {
    this.loginurl = window.location.href;
    this.jobs_str = this.loginurl;
  }

  /** control for the selected project */
  public AssigneeCtrl: UntypedFormControl = new UntypedFormControl("", [Validators.required]);

  /** control for the MatSelect filter keyword */
  public AssigneeFilterCtrl: UntypedFormControl = new UntypedFormControl();

  /** list of head filtered by search keyword */
  public filteredAssignee: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);

  ngOnInit() {
    // console.log(this.data);
    this.jobId = localStorage.getItem("jobId");
    if (this.jobId) {
      this.isJobIdAvailable = true;
    }
    this.getEmpDetailsByProjectId();
    setTimeout(() => {
      // this.getJobById();
      this.setActiveAssigneedropdown();
    }, 100);
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
      this.employeeDetails.filter(user => user.employeeDetails.firstname.toLowerCase().indexOf(search) > -1)
    );
  }

  userData = [];
  updateUsersfunction(event) {
    this.userlist = [];
    this.assigneeList = [];
    this.userData = [];
    for (let i = 0; i < this.usersselectedItems.length; i++) {
      for (let j = 0; j < this.employeeDetails.length; j++) {
        if (this.employeeDetails[j].employeeDetails.id == this.usersselectedItems[i]) {
          this.userData.push(this.employeeDetails[j]);
        }
      }
    }
    // console.log(this.userData);

    for (let i = 0; i < this.userData.length; i++) {
      this.userlist.push({ name: this.userData[i].employeeDetails.firstname + " " + this.userData[i].employeeDetails.lastname, rph: '0' });
      this.assigneeList.push({ emp_id: this.userData[i].employeeDetails.id, rph: '0' })
    }

    // if again select the user => set the previus rph
    for (let i = 0; i < this.jobAssigneeIds.length; i++) {
      for (let j = 0; j < this.userlist.length; j++) {
        if (this.assigneeList[j].emp_id == this.jobAssigneeIds[i]) {
          this.assigneeList[j].rph = this.jobAssigneeRph[i];
          this.userlist[j].rph = this.jobAssigneeRph[i];
        }
      }
    }

    if (this.usersselectedItems.length > 0) {
      this.showusers = true;
    }
    else {
      this.showusers = false;
    }
    // console.log(this.userlist);
    // console.log(this.assigneeList);

  }

  rphchangeuser(i: number, value: any) {
    this.userlist[i].rph = value;
    this.assigneeList[i].rph = value;
    // console.log(this.userlist);
    // console.log(this.assigneeList);
  }

  geEmployeeDetailsByOrgId() {
    let orgId = localStorage.getItem("OrgId");
    this.settingsService.getActiveEmpDetailsByOrgId(orgId).subscribe(data => {
      let response: any[] = JSON.parse(data.map.data);
      for (let i = 0; i < response.length; i++) {
        if (response[i].is_deleted == false)
          this.employeeDetails.push(response[i]);
      }

    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
    })
  }
Detailsproject:any = []
  getEmpDetailsByProjectId() {
    this.employeeDetails = [];
    this.projectsService.getActiveProjectDetailsById(this.data[0]).subscribe(data => {
      let response = JSON.parse(data.map.data);
      this.Detailsproject = response;
      for (let i = 0; i < response.resourceDetails.length; i++) {
        if(response.resourceDetails[i].status == "Active" && response.resourceDetails[i].employeeDetails.is_deleted == false) {
          this.employeeDetails.push(response.resourceDetails[i])
        }
      }
      this.orgAdminId = this.employeeDetails[0].employeeDetails.orgDetails.emp_id;
      var filterArray = this.employeeDetails.reduce((accumalator, current) => {
        if (
          !accumalator.some(
            (item) => item.employeeDetails.id === current.employeeDetails.id
          )
        ) {
          accumalator.push(current);
        }
        return accumalator;
      }, []);
      // console.log(filterArray);
      this.employeeDetails = filterArray;
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
  }


  jobAssigneeIds = [];
  jobAssigneeRph = [];

  setActiveAssigneedropdown() {
    this.spinner.show();
    let jobAssigneeDetails: any[] = this.data[1];
    for (let i = 0; i < jobAssigneeDetails.length; i++) {
      if (jobAssigneeDetails[i].map.status == "Active") {
        this.jobAssigneeIds.push(jobAssigneeDetails[i].map.id);
        this.jobAssigneeRph.push(jobAssigneeDetails[i].map.rate_per_hour);
      }
    }

    setTimeout(() => {
      this.AssigneeCtrl.setValue(this.jobAssigneeIds);
      this.usersselectedItems = this.jobAssigneeIds;
      for (let i = 0; i < this.jobAssigneeRph.length; i++) {
        this.userlist[i].rph = this.jobAssigneeRph[i];
        this.assigneeList[i].rph = this.jobAssigneeRph[i];
      }
    }, 1000);
    setTimeout(() => {
      this.spinner.hide();
    }, 1000);
  }
  getJobById() {
    this.spinner.show();
    this.jobsService.getJobDetailsById(this.jobId).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        let res = JSON.parse(data.map.data);
        this.jobDetails = res;
        
        // romeve the existing assignees data
        // for (let i = 0; i < res.jobAssigneeDetails.length; i++) {
        //   let id = res.jobAssigneeDetails[i].employeeDetails.id;
        //   if (this.employeeDetails.filter(emp => emp.id === id)) {
        //     for (let j = 0; j < this.employeeDetails.length; j++) {
        //       if (this.employeeDetails[j].id === id) {
        //         let index = this.employeeDetails.indexOf(this.employeeDetails[j]);
        //         this.employeeDetails.splice(index, 1);
        //       }
        //     }
        //   }
        // }
        //   // load the initial assignee list
        // this.filteredAssignee.next(this.employeeDetails.slice());
        // // listen for search field value changes
        // this.AssigneeFilterCtrl.valueChanges
        //   .pipe(takeUntil(this._onDestroy))
        //   .subscribe(() => {
        //     this.filterassignee();
        //   });

        let jobAssigneeDetails: any[] = this.jobDetails.jobAssigneeDetails;
        for (let i = 0; i < jobAssigneeDetails.length; i++) {
          if (jobAssigneeDetails[i].status == "Active") {
            this.jobAssigneeIds.push(jobAssigneeDetails[i].employeeDetails.id);
            this.jobAssigneeRph.push(jobAssigneeDetails[i].rate_per_hour);
          }
        }
        // console.log(this.jobAssigneeIds);
        // console.log(this.jobAssigneeRph);

        setTimeout(() => {
          this.AssigneeCtrl.setValue(this.jobAssigneeIds);
          this.usersselectedItems = this.jobAssigneeIds;
          for (let i = 0; i < this.jobAssigneeRph.length; i++) {
            this.userlist[i].rph = this.jobAssigneeRph[i];
            this.assigneeList[i].rph = this.jobAssigneeRph[i];
          }
        }, 1000);
        // this.spinner.hide();
      }
      setTimeout(() => {
        this.spinner.hide();
      }, 1000);
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
    })
  }

  // updateJob() {
  //   this.spinner.show();
  //   let orgId = localStorage.getItem("OrgId");
  //   let st_date = new Date(this.jobDetails.start_date);
  //   let ed_date = new Date(this.jobDetails.end_date);
  //   let data: Object = {
  //     "id": this.jobId,
  //     "org_id": orgId,
  //     "job_name": this.jobDetails.job_name,
  //     "project_id": this.jobDetails.project_id,
  //     // "project_id": this.jobDetails.projectDetails.id,

  //     "start_date": st_date,
  //     "end_date": ed_date,
  //     "hours": this.jobDetails.hours,
  //     "rate_per_hour": this.jobDetails.rate_per_hour,
  //     "description": this.jobDetails.description,
  //     "bill": this.jobDetails.bill,
  //     "assignees": this.assigneeList
  //   }
  //   this.jobsService.updateJob(data).subscribe(data => {
  //     if (data.map.statusMessage == "Success") {
  //       this.utilsService.openSnackBarAC("Assignees added successfully", "OK");
  //       setTimeout(() => {
  //         this.dialogRef.close();
  //         this.router.navigate(["/jobs"]);
  //       }, 2000);
  //     }
  //     else {
  //       this.utilsService.openSnackBarMC("Failed to add assignees", "OK");
  //     }
  //     this.spinner.hide();
  //   })
  // }

  jobIds: any[] = [];
  Assignees: any[] = [];
  updateAssignee() {
    this.spinner.show();
    this.jobIds.push(this.jobId);
    let listdata = {
      "jobIds": this.jobIds,
      "assignees": this.assigneeList,
      "jobs_url": this.jobs_str
    }
    let zone = moment.tz.guess();
    this.jobsService.bulkAssignees(listdata).subscribe(data => {
      let project = this.Detailsproject.project_name;
      let job = this.data[2];
      job = job.charAt(0).toUpperCase() + job.slice(1);
      project = project.charAt(0).toUpperCase() + project.slice(1);
      for (let i = 0; i < this.assigneeList.length; i++) {
        if (!this.jobAssigneeIds.includes(this.assigneeList[i].emp_id)) {
          let message = '<p style="font-size: 14px !important; line-height:20px;">You have been assigned in <span style="background-color: #46464d; border-radius: 4px; color: white; padding: 0px 5px 2px 5px; font-weight: 400; font-size: 12px !important;">' + job + '</span> job on the <span style="background-color: #2e7f35; border-radius: 4px; color: white; padding: 0px 5px; font-weight: 400;font-size: 12px !important;"> ' + project + '</span> project</p>';
          let formdata = {
            "org_id": localStorage.getItem('OrgId'),
            "message": message,
            "to_notify_id": this.assigneeList[i].emp_id,
            "notifier": localStorage.getItem('Id'),
            "module_name": "Project and Jobs",
            "sub_module_name": "Job",
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

      // *************removed user notification ************
      for (let g = 0; g < this.assigneeList.length; g++) {
        this.Assignees.push(this.assigneeList[g].emp_id)
      }
      for (let i = 0; i < this.jobAssigneeIds.length; i++) {
        if (!this.Assignees.includes(this.jobAssigneeIds[i])) {
          let message = '<p style="font-size: 14px !important; line-height:20px;">You have been unassigned in <span style="background-color: #46464d; border-radius: 4px; color: white; padding: 0px 5px 2px 5px; font-weight: 400; font-size: 12px !important;">' + job + '</span> job on the <span style="background-color: #2e7f35; border-radius: 4px; color: white; padding: 0px 5px; font-weight: 400; font-size: 12px !important;"> ' + project + '</span> project</p>';
          let formdata = {
            "org_id": localStorage.getItem('OrgId'),
            "message": message,
            "to_notify_id": this.jobAssigneeIds[i],
            "notifier": localStorage.getItem('Id'),
            "module_name": "Project and Jobs",
            "sub_module_name": "Job",
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
      if(data.map.statusMessage == "Success" && data.map.Error == "Error in creating user due to mail configuration check the configuration details") {
        let zone = moment.tz.guess();
        let message =
         "Mail configuration issue encountered while adding bulk users to job.";
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
          this.utilsService.openSnackBarAC("Assignees added successfully", "OK");
          this.isModified = true;
          this.closeDialog();
      } else if (data.map.statusMessage == "Success") {
        this.utilsService.openSnackBarAC("Assignees added successfully", "OK");
        this.isModified = true;
        this.closeDialog();
      }
      else {
        this.utilsService.openSnackBarMC(data.map.data, "OK");
      }
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
    })
    setTimeout(() => {
      this.spinner.hide();
    }, 2000);
  }
  isModified:boolean = false;
  closeDialog(){
    this.dialogRef.close({ data: this.isModified});
  }

  manageprojectusers() {
    setTimeout(() => {
      this.router.navigate(["/projects"]);
    }, 200);
  }
}
