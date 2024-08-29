import { Component, OnInit } from '@angular/core';
import { UntypedFormArray, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { NgxSpinnerService } from 'ngx-spinner';
import { ReplaySubject, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { TimeTrackerService } from '..//..//services/time-tracker.service';
import { UtilService } from '..//..//services/util.service';
import { errorMessage ,createTask, validFormat} from '../../util/constants';
import { ProjectsService } from '..//..//services/projects.service';
import  moment from 'moment-timezone';

@Component({
  selector: 'app-add-task-form',
  templateUrl: './add-task-form.component.html',
  styleUrls: ['./add-task-form.component.less']
})
export class AddTaskFormComponent implements OnInit {
  requiredMessage = errorMessage;
  createTask = createTask;
  validMessage = validFormat;

  dayTaskFormGroup: UntypedFormGroup;
  projectDetails: any = [];
  empId: any;
  orgId: any;
  noProjects: boolean = false;
  todayDate :any;
  dpTaskDate: string;

  constructor(
    public dialogRef: MatDialogRef<any>,
    private fb: UntypedFormBuilder,
    public timeTrackerService: TimeTrackerService,
    private utilsService: UtilService,
    private spinner: NgxSpinnerService,
    private projectsService : ProjectsService,
  ) { }

  /** control for the MatSelect filter keyword */
  public projectFilterCtrl: UntypedFormControl = new UntypedFormControl();

  /** list of head filtered by search keyword */
  public filteredproject: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);

  protected _onDestroy = new Subject<void>();

  ngOnInit() {
    this.empId = localStorage.getItem('Id');
    this.orgId = localStorage.getItem('OrgId');
    this.todayDate = moment().format("DD-MM-YYYY");
    this.dpTaskDate = sessionStorage.getItem("dpTaskDate");
    // console.log(this.todayDate);
    this.dayTaskFormGroup = this.fb.group({
      // projectSec: this.fb.array([ this.newProjectSec() ]),
      projectSec: this.fb.array([this.newProjectSec()])
    });
    if(localStorage.getItem('Role') == 'org_admin'){
      this.getProjectDetailsForOrgAdmin();
    }else{
    this.getProjectDetails();
    }
  }

  projectSec(): UntypedFormArray {
    return this.dayTaskFormGroup.get('projectSec') as UntypedFormArray;
  }

  getControls() {
    return (this.dayTaskFormGroup.get('projectSec') as UntypedFormArray).controls;
  }

  newProjectSec(): UntypedFormGroup {
    return this.fb.group({
      project: ['', [Validators.required]],
      day_tasks: this.fb.array([this.newTask()])
    });
  }

  addProjectSec() {
    this.projectSec().push(this.newProjectSec());
  }

  removeProjectSec(index: number) {
    this.projectSec().removeAt(index);
    // this.checkArr.splice(index,1);
  }

  taskGroup(index: number): UntypedFormArray {
    return this.projectSec().at(index).get('day_tasks') as UntypedFormArray;
  }

  newTask(): UntypedFormGroup {
    return this.fb.group({
      task: ['', [Validators.required,Validators.pattern(/^(\s+\S+\s*)*(?!\s).*$/)]],
      // task: ['', [Validators.required,Validators.pattern(/^(\s*\S+(\s+\S+)*\s*)*$/m)]],
    });
  }

  addNewTask(index: number) {
    this.taskGroup(index).push(this.newTask());
  }

  removeTask(index: number, skillIndex: number) {
    this.taskGroup(index).removeAt(skillIndex);
  }

  protected filterproject() {
    if (!this.projectDetails) {
      return;
    }
    // get the search keyword
    let search = this.projectFilterCtrl.value;
    if (!search) {
      this.filteredproject.next(this.projectDetails.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
    // filter the client
    this.filteredproject.next(
      this.projectDetails.filter(data => data.name.toLowerCase().indexOf(search) > -1)
    );
  }

  // //to get project and jobs based on the orgid and empid
  // getProjectDetails() {
  //   this.spinner.show();
  //   this.projectDetails = [];
  //   let formdata = {
  //     "empid": this.empId,
  //     "orgid": this.orgId
  //   }
  //   this.timeTrackerService.getprojectjobdropdown(formdata).subscribe(data => {
  //     var response = JSON.parse(data.map.data);
  //     var projectdetails = response[0].map.projectdetails.myArrayList;
  //     // var jobdetails = response[1].map.jobdetails.myArrayList;

  //     //remove the duplicate projects
  //     projectdetails = projectdetails.reduce((accumalator, current) => {
  //       if (!accumalator.some((item) => item.map.id === current.map.id && item.map.name === current.map.name)) {
  //         accumalator.push(current);
  //       } return accumalator;
  //     }, []);

  //     for (var i = 0; i < projectdetails.length; i++) {
  //       this.projectDetails.push({ "name": projectdetails[i].map.name, "id": projectdetails[i].map.id, "client_id": projectdetails[i].map.client_id });
  //     }

  //     if (this.projectDetails.length == 0) {
  //       this.noProjects = true;
  //     } else {
  //       this.filteredproject.next(this.projectDetails.slice());
  //       // listen for search field value changes
  //       this.projectFilterCtrl.valueChanges.pipe(takeUntil(this._onDestroy)).subscribe(() => {
  //         this.filterproject();
  //       });
  //     }
  //     this.spinner.hide();
  //   })
  // }

  // to get project and jobs based on the orgid and empid by using reference id
  getProjectDetails() {
    this.spinner.show();
    this.projectDetails = [];
    let formdata = {
      "empid": this.empId,
      "orgid": this.orgId
    }
    this.timeTrackerService.getProjectAndJobNames(formdata).subscribe(data => {
      var response = JSON.parse(data.map.data);
      var projectdetails = response[0].map.projectdetails.myArrayList;
      // var jobdetails = response[1].map.jobdetails.myArrayList;

      //remove the duplicate projects
      projectdetails = projectdetails.reduce((accumalator, current) => {
        if (!accumalator.some((item) => item.map.id === current.map.id && item.map.name === current.map.name)) {
          accumalator.push(current);
        } return accumalator;
      }, []);

      for (var i = 0; i < projectdetails.length; i++) {
        this.projectDetails.push({ "name": projectdetails[i].map.name, "id": projectdetails[i].map.id});
      }

      if (this.projectDetails.length == 0) {
        this.noProjects = true;
      } else {
        this.filteredproject.next(this.projectDetails.slice());
        // listen for search field value changes
        this.projectFilterCtrl.valueChanges.pipe(takeUntil(this._onDestroy)).subscribe(() => {
          this.filterproject();
        });
      }
      this.spinner.hide();
    }, (error) => {
      this.spinner.hide();
    })
  }

  getProjectDetailsForOrgAdmin() {
    this.spinner.show();
    let orgId = localStorage.getItem("OrgId");
    this.projectsService.getProjectNameAndId(orgId).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        let response: any[] = JSON.parse(data.map.data);
        let projectdetails = response;
        for (var i = 0; i < projectdetails.length; i++) {
          if(projectdetails[i].project_status == "Inprogress")
          this.projectDetails.push({ "name": projectdetails[i].project_name, "id": projectdetails[i].id});
        }
        // console.log(projectdetails);
        // console.log(this.projectDetails);
        if (this.projectDetails.length == 0) {
          this.noProjects = true;
        } else {
          this.filteredproject.next(this.projectDetails.slice());
          this.projectFilterCtrl.valueChanges.pipe(takeUntil(this._onDestroy)).subscribe(() => {
            this.filterproject();
          });
        }
        setTimeout(() => {
          this.spinner.hide();
        }, 2000);
      }
      else {
        setTimeout(() => {
          this.spinner.hide();
        }, 2000);
      }
    }, (error) => {
      this.spinner.hide();
    })
  }

  //duplicate project filter
  checkArr: any = [];
  projectCheck(event, i) {
    this.checkArr = this.dayTaskFormGroup.value.projectSec;
    let data = JSON.parse(JSON.stringify(this.checkArr));
    data.splice(i,1);
    if (data.find(val => val.project.id == event.value.id)) {
      this.projectSec().at(i).get('project').setValue('');
      this.utilsService.openSnackBarMC("This project is already selected, please choose another project", "OK");
    }
  }

  //to add task page
  allDetails: any = [];
  tempDetails: any = [];
  finalDetails: any = [];
  sendDayTask() {
    // console.log(this.dayTaskFormGroup.value.projectSec);
    // debugger
    this.allDetails = this.dayTaskFormGroup.value.projectSec;
    for (var i = 0; i < this.allDetails.length; i++) {
      let projectData = this.allDetails[i].project;
      let data = this.allDetails[i].day_tasks;
      for (var j = 0; j < data.length; j++) {
        this.tempDetails.day_task = data[j].task;
        this.tempDetails.project_name = projectData.name;
        this.tempDetails.project_id = projectData.id;
        this.tempDetails.drag = true;
        this.tempDetails.edit_task = false;
        this.finalDetails.push(this.tempDetails);
        this.tempDetails = [];
      }
    }
    this.dialogRef.close({ data: this.finalDetails })
  }

  //While click the add icon - scroll down to bottom
  moveToBottom() {
    setTimeout(() => {
      const element = document.getElementById("moveToBottom");
      element.scrollIntoView({ behavior: "smooth", block: "end", inline: "nearest" });
    }, 100);
  }

}
