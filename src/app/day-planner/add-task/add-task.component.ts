import { Component, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { FormArray, UntypedFormBuilder, UntypedFormControl, FormGroup, Validators } from '@angular/forms';
import { ReplaySubject, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { TimeTrackerService } from 'src/app/services/time-tracker.service';
import { DayPlannerService } from 'src/app/services/day-planner/day-planner.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { UtilService } from 'src/app/services/util.service';
import { Router } from '@angular/router';
import moment from 'moment-timezone';
import { MatDialog } from '@angular/material/dialog';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { AddTaskFormComponent } from '../add-task-form/add-task-form.component';
import { errorMessage } from '../../util/constants';
import { JiraIntegrationService } from 'src/app/services/Jira-integration/jira-integration.service';
import { ProjectsService } from 'src/app/services/projects.service';
import { MatPaginator } from '@angular/material/paginator';

@Component({
  selector: 'app-add-task',
  templateUrl: './add-task.component.html',
  styleUrls: ['./add-task.component.less']
})
export class AddTaskComponent implements OnInit {
  requiredMessage = errorMessage;
  empId: any;
  orgId: any;
  // dayTaskFormGroup: FormGroup;
  projectDetails: any = [];
  noProjects: boolean = false;
  keepForm: boolean = false;
  openForm: boolean = false;
  openSpecific: boolean = false;
  backlogsIdList: any = [];
  empName: any;
  newDayTaskDetails: any = [];
  items = [];
  email: string;
  dpTaskDate: string;

  reset_filter_btn: boolean = false;
  reset_filter_backlog: boolean = false;

  filter_open: boolean = false;
  filter_backlog: boolean = false;

  constructor(
    private fb: UntypedFormBuilder,
    public timeTrackerService: TimeTrackerService,
    public dayPlannerService: DayPlannerService,
    public spinner: NgxSpinnerService,
    private utilsService: UtilService,
    private router: Router,
    private dialog: MatDialog,
    private jiraIntegrationService: JiraIntegrationService,
    private projectsService: ProjectsService,
  ) { }

  public editTaskName: UntypedFormControl = new UntypedFormControl();

  /** form control for the project filter in the ASI - Active sprint issues */
  public ASIProjectFilterCtrl: UntypedFormControl = new UntypedFormControl();

  /** form control for the project filter in the BL - Backlog issues */
  public BLProjectFilterCtrl: UntypedFormControl = new UntypedFormControl();

  /** list of head filtered by search keyword */
  public filteredproject: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);

  protected _onDestroy = new Subject<void>();


  ngOnInit() {
    this.empId = localStorage.getItem('Id');
    this.orgId = localStorage.getItem('OrgId');
    this.empName = localStorage.getItem('Name');
    this.email = localStorage.getItem("Email");
    this.dpTaskDate = sessionStorage.getItem("dpTaskDate");

    this.getProjectsByOrgId();
    // this.getJiraintegrationCredByOrgid();
    // this.getJiraIntegratedProjectsByorgid();
    this.getJiraintegrationCredByOrgid();


  }

  //task form dialog
  addTaskForm() {
    let screenWidth = screen.availWidth;
    if (screenWidth <= 750) {
      const dialogRef = this.dialog.open(AddTaskFormComponent, {
        width: '90%',
        disableClose: true,
        // maxHeight: '500px',
        panelClass: 'custom-viewdialogstyle',
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result != undefined && result != "") {
          if (result.data.length > 0) {
            for (let i = 0; i < result.data.length; i++) {
              this.newDayTaskDetails.push(result.data[i]);
            }
          }
        }
      });
    } else {
      const dialogRef = this.dialog.open(AddTaskFormComponent, {
        width: '50%',
        disableClose: true,
        // maxHeight: '500px',
        panelClass: 'custom-viewdialogstyle',
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result != undefined && result != "") {
          if (result.data.length > 0) {
            for (let i = 0; i < result.data.length; i++) {
              this.newDayTaskDetails.push(result.data[i]);
            }
          }
        }
      });
    }
  }

  // getting responsive height 
  getTaskCardHeight() {
    // let height = screen.availHeight;
    let height1 = window.innerHeight;
    return (height1 - 157);
  }

  // getting responsive height 
  getTaskCardHeight1() {
    // let height = screen.availHeight;
    let height1 = window.innerHeight;
    return (height1 - 225);
  }

  getTaskCardHeight2() {
    // let height = screen.availHeight;
    let height1 = window.innerHeight;
    return (height1 - 235);
  }

  //if its custom task --> delete func
  deleteAddedTask(i) {
    this.newDayTaskDetails.splice(i, 1);
  }

  //if its custom task --> edit func
  editAddedTask(i) {
    this.newDayTaskDetails[i].edit_task = true;
    this.editTaskName.setValue(this.newDayTaskDetails[i].day_task);
  }

  //if its custom task --> update func
  updatTaskName(i) {
    this.newDayTaskDetails[i].edit_task = false;
    this.newDayTaskDetails[i].day_task = this.editTaskName.value;
  }

  //if its custom task --> cancel func
  cancelTaskName(i) {
    this.newDayTaskDetails[i].edit_task = false;
  }

  // getProjectsByOrgid() {
  //   this.spinner.show();
  //   let orgId = localStorage.getItem("OrgId");
  //   this.projectsService.getActiveProjectDetailsByOrgId(orgId).subscribe(data => {
  //     this.projectDetails = [];
  //     if (data.map.statusMessage == "Success") {
  //       let response: any[] = JSON.parse(data.map.data);
  //       let projectdetails = response;
  //       projectdetails.forEach(data =>{
  //         this.projectDetails.push({ "name": data.project_name, "id": data.id, "client_id": data.clientDetails.id});
  //       })
  //       this.spinner.hide();
  //     }
  //     else {
  //       this.projectDetails = [];
  //       setTimeout(() => {
  //         this.spinner.hide();
  //       }, 2000);
  //     }
  //   }, (error) => {
  //     this.spinner.hide();
  //   })
  // }

  activeProjectList = [];
  //For project name dropdown  in the add task in day palnner
  getProjectsByOrgId() {
    this.spinner.show();
    let orgId = localStorage.getItem("OrgId");
    this.projectsService.getProjectNameAndId(orgId).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        this.activeProjectList = JSON.parse(data.map.data);
        for (let i = 0; i < this.activeProjectList.length; i++) {
          if (this.activeProjectList[i].project_status == 'Inprogress') {
            this.projectDetails.push(this.activeProjectList[i]);
          }
        }
        this.spinner.hide();
      } else {
        this.spinner.hide();
        this.projectDetails = [];
      }
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
    })
  }

  //create day task
  createDayTask() {
    this.spinner.show();
    let zone = moment.tz.guess();
    let detailsArray: any = [];
    let finalData: Object;
    for (let i = 0; i < this.newDayTaskDetails.length; i++) {
      let task = "";
      if (this.newDayTaskDetails[i].issue_key) {
        task = this.newDayTaskDetails[i].issue_key + ' - ' + this.newDayTaskDetails[i].day_task;
      } else {
        task = this.newDayTaskDetails[i].day_task;
      }
      if (this.newDayTaskDetails[i].project_id == null) {
        this.projectDetails.forEach(data => {
          if (this.newDayTaskDetails[i].project_name == data.project_name) {
            this.newDayTaskDetails[i].project_id = data.id;
            // console.log(data.id);
          }
        })
      }
      let tempData: Object = {
        "emp_id": this.empId,
        "emp_name": this.empName,
        "day_task": task,
        "description": this.newDayTaskDetails[i].description,
        // "date": moment().format("YYYY-MM-DD").toString(),
        "date": this.dpTaskDate,
        "project_name": this.newDayTaskDetails[i].project_name,
        "project_id": this.newDayTaskDetails[i].project_id,
        "status": "Todo",
      }
      detailsArray.push(tempData);
    }
    finalData = {
      "org_id": this.orgId,
      "detailsArray": detailsArray,
      "timezone": zone,
    }
    this.dayPlannerService.createDayTask(finalData).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        this.utilsService.openSnackBarAC("Tasks added successfully", "OK");
        this.router.navigate(["/my-day-planner"]);
      } else {
        this.utilsService.openSnackBarMC("Failed to add tasks", "OK");
      }
      this.spinner.hide();
    })
  }

  // Drag and Drop event
  drop(event: CdkDragDrop<string[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex,
      );
    }
  }

  //get jira integrated projects by orgid
  jiraProjectString: string;
  jiraSelectProject: any[];
  filteredprojectData: any[];
  async getJiraIntegratedProjectsByorgid() {
    this.jiraProjectString = "";
    this.filteredprojectData = [];
    await this.jiraIntegrationService.getjiraProjectsByOrgid(this.orgId).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        let response = JSON.parse(data.map.data);
        this.jiraSelectProject = response;
        // console.log(response);
        for (let j = 0; j < response.length; j++) {
          let projectName: string = response[j].project_name;

          let GivenProject: any = projectName.split(" ")[0];
          this.filteredprojectData.push({ name: GivenProject, id: response[j].id });
          // this.jiraProjectString += GivenProject;
          // if (j < response.length - 1) {
          //   this.jiraProjectString += ",";
          // }
        }
        this.ASIProjectFilterCtrl.setValue(this.filteredprojectData[0].id);
        
        this.getJIRAIssueByProject(this.filteredprojectData[0].id);

      }
    }, (error) => {
      // this.spinner.hide();
    })
  }

  jiraTaskDetails: any = [];
  tempJiraTaskDetails: any = [];
  totalActiveSprintIssue: number = 0;
  ASIFilteredProjectBoardDetails: any[];
  async getJIRAIssueByProject(id,startAt?) {
    this.spinner.show();
    this.jiraTaskDetails = [];
    this.ASIFilteredProjectBoardDetails = [];
    if (this.jiraSelectProject.length > 1) {
      this.jiraSelectProject.forEach(x => {
        if (x.id == id) {
          this.ASIFilteredProjectBoardDetails.push(x);
        }
      })
    } else {
      this.ASIFilteredProjectBoardDetails = this.jiraSelectProject;
    }
    this.paginationCalcASI();
    let startValue;
    if(startAt == 0){
      startValue = startAt;
      if(this.paginator.toArray()[0] != undefined){
        this.paginator.toArray()[0].pageIndex = startValue;
      }else{
        this.paginator.toArray()[1].pageIndex = startValue;
      }
    }else{
      startValue = this.startAt;
    }
    // let jql = 'project IN ' + '(' + this.jiraProjectString + ') ' + 'AND assignee = ' + '"' + this.email + '" ' + 'AND status IN ("TO DO","IN PROGRESS") AND sprint IN openSprints()'
    let formdata = {
      "orgid": this.orgId,
      "email": localStorage.getItem("Email"),
      "board_id_details": JSON.stringify(this.ASIFilteredProjectBoardDetails),
      "startAt": this.startAt_ASI,
      "maxResults": this.maxResults_ASI
    }
    await this.jiraIntegrationService.getJiraIssues(formdata).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        this.totalActiveSprintIssue = data.map.data.myArrayList[0].map.array.myArrayList[0].map.total;
        let arrayList = data.map.data.myArrayList;
        let arrayLength = arrayList.length;
        for (let i = 0; i < arrayLength; i++) {
          if (arrayList[i].map.array.myArrayList[0].map.issues) {
            let response = arrayList[i].map.array.myArrayList[0].map.issues.myArrayList;
            response.forEach(issue => {
              let desc = "";
              if (issue.map.fields.map.description.map) {
                issue.map.fields.map.description.map.content.myArrayList.forEach(d => {
                  desc += d.map.content.myArrayList[0]?.map.text + " ";
                })
                this.jiraTaskDetails.push({ "issue_key": issue.map.key, "project_name": issue.map.fields.map.project.map.name, "day_task": issue.map.fields.map.summary, "status": issue.map.fields.map.status.map.name, "description": desc, "drag": false, "edit_task": false, "project_id": null })
              }
              else {
                this.jiraTaskDetails.push({ "issue_key": issue.map.key, "project_name": issue.map.fields.map.project.map.name, "day_task": issue.map.fields.map.summary, "status": issue.map.fields.map.status.map.name, "description": desc, "drag": false, "edit_task": false, "project_id": null })
              }
            })
          }
          this.tempJiraTaskDetails = this.jiraTaskDetails;
        }
        this.spinner.hide();
      } else {
        this.spinner.hide();
      }
    }, (err) => {
      this.spinner.hide();
    })
  }
  index: any;
  selectJiraTicketGroup(event: any) {
    this.index = event.index;
    if (0 == this.index) {
      this.filter_open = false;
      this.reset_filter_btn = false;
      // this.getJiraintegrationCredByOrgid();
      this.getJIRAIssueByProject(this.ASIProjectFilterCtrl.value);
    }
    if (1 == event.index) {
      this.filter_backlog = false;
      this.reset_filter_backlog = false;
      this.BLProjectFilterCtrl.setValue(this.filteredprojectData[0].id);
      this.getBacklogTicketDetails(this.BLProjectFilterCtrl.value);
    }

  }

  BacklogDetails: any = [];
  tempBacklogDetails: any = [];
  totalBacklogIssues: number = 0;
  BLFilteredProjectBoardDetails: any[];
  async getBacklogTicketDetails(id, startAt?) {
    this.spinner.show();
    this.BacklogDetails = [];
    this.BLFilteredProjectBoardDetails = [];
    if (this.jiraSelectProject.length > 1) {
      this.jiraSelectProject.forEach(x => {
        if (x.id == id) {
          this.BLFilteredProjectBoardDetails.push(x);
        }
      })
    } else {
      this.BLFilteredProjectBoardDetails = this.jiraSelectProject;
    }
    // this.totalBacklogIssues = 0;
    this.paginationCalc();
    let startValue;
    if(startAt == 0){
      startValue = startAt;
      if(this.paginator.toArray()[1] != undefined){
        this.paginator.toArray()[1].pageIndex = startValue;
      }else{
        this.paginator.toArray()[0].pageIndex = startValue;
      }
    }else{
      startValue = this.startAt;
    }
    let formdata = {
      "orgid": this.orgId,
      "board_id_details": JSON.stringify(this.BLFilteredProjectBoardDetails),
      "startAt": startValue,
      "maxResults": this.maxResults
    }

    // console.log("formdata", formdata);

    await this.jiraIntegrationService.getBacklogDetails(formdata).subscribe(data => {
      // console.log("getBacklogTicketDetails....", data);

      if (data.map.statusMessage == "Success") {
        this.totalBacklogIssues = data.map.data.myArrayList[0].map.array.myArrayList[0].map.total;
        let arrayList = data.map.data.myArrayList;
        let arrayLength = arrayList.length;
        for (let i = 0; i < arrayLength; i++) {
          let response = arrayList[i].map.array.myArrayList[0].map.issues.myArrayList;
          response.forEach(issue => {
            let desc = "";
            let issues = issue.map.fields.map.description;
            if (typeof issues === 'string' || issues instanceof String) {
              desc = issue.map.fields.map.description;
              // issue.map.fields.map.description.map.content.myArrayList.forEach(d => {
              //   desc += d.map.content.myArrayList[0].map.text + " ";
              // })
              this.BacklogDetails.push({ "issue_key": issue.map.key, "project_name": issue.map.fields.map.project.map.name, "day_task": issue.map.fields.map.summary, "status": issue.map.fields.map.status.map.name, "description": desc, "drag": false, "edit_task": false, "project_id": null })
            }
            else {
              this.BacklogDetails.push({ "issue_key": issue.map.key, "project_name": issue.map.fields.map.project.map.name, "day_task": issue.map.fields.map.summary, "status": issue.map.fields.map.status.map.name, "description": desc, "drag": false, "edit_task": false, "project_id": null })
            }
          })
        }
        this.tempBacklogDetails = this.BacklogDetails;
        // console.log(this.BacklogDetails);
        this.spinner.hide();
      } else {
        this.spinner.hide();
      }
    }, (err) => {
      this.spinner.hide();
    });
  }

  // }

  jiraIntegrationDetails: any;
  getJiraintegrationCredByOrgid() {
    this.jiraIntegrationService.getJiraCredByOrgId(this.orgId).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        let response = JSON.parse(data.map.data);
        this.jiraIntegrationDetails = response;
      } else if (data.map.statusMessage == "Failed") {
        this.jiraIntegrationDetails = "";
      } else {
        this.jiraIntegrationDetails = "";
        this.utilsService.openSnackBarMC("Failed to retrieve JIRA API's configuration details. Please check the configuration details", "OK");
      }

    }, (err) => {
      this.spinner.hide();
    })
    this.getJiraIntegratedProjectsByorgid();
  }

  redirectToJira() {
    window.open(this.jiraIntegrationDetails.url, '_blank');
  }


  filter_toggle() {
    this.filter_open = true;
  }
  filterBacklog() {
    this.filter_backlog = true;
  }


  selectedProjectData(event) {
    // console.log(event);
    this.reset_filter_btn = true;
    this.tempJiraTaskDetails = [];
    for (let i = 0; i < this.jiraTaskDetails.length; i++) {
      // console.log(this.jiraTaskDetails[i].project_name);
      if (this.jiraTaskDetails[i].project_name == event.value) {
        this.tempJiraTaskDetails.push(this.jiraTaskDetails[i]);
      }
    }
  }
  resetTableFilterByBoards() {
    this.tempJiraTaskDetails = [];
    for (let i = 0; i < this.jiraTaskDetails.length; i++) {
      this.tempJiraTaskDetails.push(this.jiraTaskDetails[i]);
    }
    this.filter_open = false;
    this.reset_filter_btn = false;
  }

  selectBacklogData(event) {
    this.tempBacklogDetails = [];
    this.reset_filter_backlog = true;
    for (let i = 0; i < this.BacklogDetails.length; i++) {
      if (this.BacklogDetails[i].project_name == event.value) {
        this.tempBacklogDetails.push(this.BacklogDetails[i]);
      }
    }
  }

  resetTableFilterByBoardBacklog() {
    this.tempBacklogDetails = [];
    for (let i = 0; i < this.BacklogDetails.length; i++) {
      this.tempBacklogDetails.push(this.BacklogDetails[i]);
    }
    this.filter_backlog = false;
    this.reset_filter_backlog = false;
  }


  //pagination for backlog
  @ViewChildren(MatPaginator) paginator = new QueryList<MatPaginator>();
  // @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

  pageSizeASI = 10;
  changePageASI(event) {
    this.pageSizeASI = event.pageSize;
    this.getJIRAIssueByProject(this.ASIProjectFilterCtrl.value);
  }

  startAt_ASI: any;
  maxResults_ASI: any;
  //calculation for pagination
  paginationCalcASI() {
    this.startAt_ASI = this.paginator.toArray()[0].pageIndex * this.pageSizeASI;
    this.maxResults_ASI = this.pageSizeASI;
  }

  pageSize = 10;
  paginatorIndex: any = 0;
  changePage(event) {
    this.pageSize = event.pageSize;
    this.getBacklogTicketDetails(this.BLProjectFilterCtrl.value);
  }

  startAt: any;
  maxResults: any;
  //calculation for pagination
  paginationCalc() { 
    let paginator;
    if(this.paginator.toArray()[1] != undefined){
      paginator = this.paginator.toArray()[1];
    }else{
      paginator = this.paginator.toArray()[0];
    }
    this.startAt = paginator.pageIndex * this.pageSize;
    this.maxResults = this.pageSize;
  }
}
