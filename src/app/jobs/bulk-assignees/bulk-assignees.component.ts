import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormControl, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ReplaySubject, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { JobsService } from 'src/app/services/jobs.service';
import { SettingsService } from 'src/app/services/settings.service';
import { UtilService } from 'src/app/services/util.service';
import { ProjectsService } from 'src/app/services/projects.service';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-bulk-assignees',
  templateUrl: './bulk-assignees.component.html',
  styleUrls: ['./bulk-assignees.component.less']
})
export class BulkAssigneesComponent implements OnInit {
  userlist = [];
  assigneeList: any[] = [];
  usersselectedItems = [];
  showusers: boolean = false;
  employeeDetails: any[] = [];
  loginurl: string;
  jobs_str: string;
  protected _onDestroy = new Subject<void>();

  constructor(
    private jobsService: JobsService,
    private settingsService: SettingsService,
    private utilsService: UtilService,
    private projectsService: ProjectsService,
    private router: Router,
    private spinner: NgxSpinnerService,
    public dialogRef: MatDialogRef<BulkAssigneesComponent>,
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
    this.geEmployeeDetailsByProjectId();
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

  usersfunction(event) {
    this.userlist = [];
    this.assigneeList = [];
    // console.log(this.usersselectedItems);
    for (let i = 0; i < this.usersselectedItems.length; i++) {
      this.userlist.push({ name: this.usersselectedItems[i].employeeDetails.firstname + " " + this.usersselectedItems[i].employeeDetails.lastname, rph: '0' });
      this.assigneeList.push({ emp_id: this.usersselectedItems[i].employeeDetails.id, rph: '0' })
      // this.userlist.push({ name: this.usersselectedItems[i].employeeDetails.firstname + " " + this.usersselectedItems[i].employeeDetails.lastname, rph: '0' });
      // this.assigneeList.push({ emp_id: this.usersselectedItems[i].employeeDetails.id, rph: '0' })
    }
    if (this.usersselectedItems.length > 0) {
      this.showusers = true;
    }
    else {
      this.showusers = false;
    }
    // console.log(this.userlist);
  }

  rphchangeuser(i: number, value: any) {
    this.userlist[i].rph = value;
    this.assigneeList[i].rph = value;
    // console.log(this.userlist);
    // console.log(this.assigneeList);
  }

  geEmployeeDetailsByProjectId() {
    this.projectsService.getActiveProjectDetailsById(this.data.ProjectId).subscribe(data => {
      let response = JSON.parse(data.map.data);

      for (let i = 0; i < response.resourceDetails.length; i++) {
        if (response.resourceDetails[i].status == "Active" && response.resourceDetails[i].employeeDetails.is_deleted == false) {
          this.employeeDetails.push(response.resourceDetails[i])
        }
      }
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

  updateAssignee() {
    this.spinner.show();
    let listdata = {
      "jobIds": this.data.JobList,
      "assignees": this.assigneeList,
      "jobs_url": this.jobs_str
    }
    this.jobsService.bulkAssignees(listdata).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        this.utilsService.openSnackBarAC("Assignees added successfully and existing assignees will be skiped", "OK");
        this.isModified = true;
        this.closeDialog();
      }
      else {
        this.utilsService.openSnackBarMC("Faild to add assignees", "OK");
      }
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
    })
  }
  isModified:boolean = false;
  closeDialog(){
    this.dialogRef.close({ data: this.isModified});
  }
}
