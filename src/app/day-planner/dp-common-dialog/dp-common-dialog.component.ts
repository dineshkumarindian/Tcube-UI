import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormArray, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import  moment from 'moment-timezone';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { NgxSpinnerService } from 'ngx-spinner';
import { UtilService } from 'src/app/services/util.service';
import { ReplaySubject, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { DayPlannerService } from 'src/app/services/day-planner/day-planner.service';
import { bulkStatusUpdate,dayPlannerTaskUpdateMsg,dayPlannerDuplicateTaskMsg,moveContent,duplicateContent,taskUpdate} from '../../util/constants';
@Component({
  selector: 'app-dp-common-dialog',
  templateUrl: './dp-common-dialog.component.html',
  styleUrls: ['./dp-common-dialog.component.less']
})
export class DpCommonDialogComponent implements OnInit {

  // taskUpdate = taskUpdate;
  taskUpdateMsg :any;
  taskquestionMsg:any ;
  component: any;
  todayDate: any;
  date: any;
  displayDate: any;
  taskDetails: any = [];
  taskForm: UntypedFormGroup;
  projectDetails: any = [];
  noProjects: boolean = false;
  empDetails: any = [];
  empId: any;
  orgId: any;
  empName: any;
  statusList = ['Todo', 'Inprogress', 'Done'];
  statusheader: string;

  constructor(
    public dialogRef: MatDialogRef<DpCommonDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data,
    public router: Router,
    private _formbuilder: UntypedFormBuilder,
    private spinner: NgxSpinnerService,
    private utilsService: UtilService,
    private dayPlannerService: DayPlannerService,
  ) {
    if(this.data.move == "bulkStatusUpdate"){
      this.statusheader = bulkStatusUpdate;
    } else if(this.data.move == "move"){
      this.statusheader = moveContent;
    } else if(this.data.move == "copy"){
      this.statusheader = duplicateContent;
    } else if(this.data.move == "update-task"){
      this.statusheader = taskUpdate;
    } else {
      this.statusheader = taskUpdate;
    }


   }

  public startDate: UntypedFormControl = new UntypedFormControl();

  /** control for the MatSelect filter keyword */
  public projectFilterCtrl: UntypedFormControl = new UntypedFormControl();

  /** list of head filtered by search keyword */
  public filteredproject: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);

  protected _onDestroy = new Subject<void>();

  /** control for the MatSelect filter keyword */
  public taskStatus: UntypedFormControl = new UntypedFormControl('', [Validators.required]);

  statusOptions = ['Todo', 'Inprogress', 'Done'];
  ngOnInit() {
    this.taskquestionMsg = this.data.component;
    if(this.taskquestionMsg == "Task Date"){
      this.taskUpdateMsg = dayPlannerTaskUpdateMsg;
    } else {
      this.taskUpdateMsg = dayPlannerDuplicateTaskMsg;
    }
    this.empId = localStorage.getItem('Id');
    this.orgId = localStorage.getItem('OrgId');
    this.empName = localStorage.getItem('Name');
    this.component = this.data.component;
    this.todayDate = moment(this.data.date).add(1, 'day').toDate();
    this.startDate.setValue(this.todayDate);
    if (this.data.key === "tommorrow") {
      this.date = moment().add(1, 'days').format('YYYY-MM-DD');
      this.displayDate = moment().add(1, 'days').format('DD-MM-YYYY');
    } else if (this.data.key === "dayAfterTommorrow") {
      this.date = moment().add(2, 'days').format('YYYY-MM-DD');
      this.displayDate = moment().add(2, 'days').format('DD-MM-YYYY');
    } else if (this.data.key == "updatesWithNewTasks") {
      this.taskDetails = this.data.taskdetails;
      this.projectDetails = this.data.projectdetails;
      this.empDetails = this.data.emp;
      if (this.projectDetails.length > 0) {
        this.noProjects = false;
        this.filteredproject.next(this.projectDetails.slice());
        // listen for search field value changes
        this.projectFilterCtrl.valueChanges.pipe(takeUntil(this._onDestroy)).subscribe(() => {
          this.filterproject();
        });
      } else this.noProjects = true;
      this.taskForm = this._formbuilder.group({
        tasks: this._formbuilder.array([])
      });
    } else if (this.data.key == "bulkStatusUpdate") {
      // this.taskUpdate = bulkStatusUpdate;
    }
  }

  get tasks(): UntypedFormArray {
    return this.taskForm.get("tasks") as UntypedFormArray
  }

  getControls() {
    return (this.taskForm.get('tasks') as UntypedFormArray).controls;
  }

  newTask(): UntypedFormGroup {
    return this._formbuilder.group({
      day_task: ['', [Validators.required, Validators.pattern(/^(\s+\S+\s*)*(?!\s).*$/)]],
      project_id: ['', [Validators.required]],
      status: ['', [Validators.required]]
    })
  }

  addTask() {
    this.tasks.push(this.newTask());
  }

  removeTask(i: number) {
    this.tasks.removeAt(i);
  }

  taskDateUpdate() {
    if (this.data.key == 'custom') {
      this.date = moment(this.startDate.value).format('YYYY-MM-DD');
    }
    this.dialogRef.close({ data: true, date: this.date })
  }

  moveToDayPlanner() {
    this.dialogRef.close();
    this.router.navigate(["/my-day-planner"]);
  }

  updateEmpDetails() {
    this.dialogRef.close({ data: true });
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.taskDetails, event.previousIndex, event.currentIndex);
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

  //slack integration for send notifications to slack channel
  tempData: any = [];
  newDetails: any = [];
  uTCBtnDisable : boolean = false;
  sendToSlack() {
    this.uTCBtnDisable = true;
    this.tempData = [];
    if (this.data.slack.is_paused == false) {
      let finalData = [];
      finalData.push(this.taskDetails);
      finalData.push(this.taskForm.get('tasks').value);
      for (var i = 0; i < finalData.length; i++) {
        let tempData = finalData[i];
        for (var j = 0; j < tempData.length; j++) {
          this.newDetails.push(tempData[j]);
        }
      }
      for (var i = 0; i < this.projectDetails.length; i++) {
        this.tempData.push({ 'key': this.projectDetails[i].name, 'data': this.newDetails.filter(task => task.project_id == this.projectDetails[i].id) });
      }
      this.tempData.sort((a, b) => b.data.length - a.data.length);
      this.tempData = this.tempData.filter(val => val.data.length != 0);
      let details = this.dayPlannerService.createTemplate(this.empDetails, this.tempData, 'updatesForTheDay');
      this.dayPlannerService.sendToSlack(this.data.slack.url, JSON.stringify(details)).subscribe(data => {
        if (data.toLowerCase() == 'ok') {
          this.uTCBtnDisable = false;
          this.utilsService.openSnackBarAC('Tasks updated successfully', 'Ok');
          this.utilsService.sendReminderCheck();
          this.createDayTask();
          this.updateSubmitStatus(true, 'update');
          this.dialogRef.close({ data: true });
        }
      }, (errorData) => {
        this.uTCBtnDisable = false;
        this.utilsService.openSnackBarMC('Failed to update task details. Please verify the webhook URL connection', 'Ok');
      });
    } else {
      this.uTCBtnDisable = false;
      this.utilsService.openSnackBarMC('No integrations available', 'Ok');
    }
  }

  tasksIds: any = [];
  updateSubmitStatus(status, newdata) {
    this.tasksIds = this.taskDetails.map(a => a.id);
    let data: object = {
      "task_ids": this.tasksIds,
      "status": status,
      "to_change": newdata
    }
    this.dayPlannerService.updateDayTaskSubmitStatus(data).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        this.utilsService.sendReminderCheck();
      }
    });
  }

  //create day task
  tempProject: any = [];
  createDayTask() {
    this.spinner.show();
    let data = [];
    let zone = moment.tz.guess();
    data = this.taskForm.get('tasks').value;
    let detailsArray: any = [];
    let finalData: Object;
    for (let i = 0; i < data.length; i++) {
      this.tempProject = this.projectDetails.filter(project => project.id == data[i].project_id);
      let tempData: Object = {
        "emp_id": this.empId,
        "emp_name": this.empName,
        "day_task": data[i].day_task,
        "date": this.data.date,
        "project_name": this.tempProject[0].name,
        "project_id": data[i].project_id,
        "status": data[i].status,
        "is_submitted": true,
        "is_updated": true
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
      }
      this.spinner.hide();
    })
  }

  taskBulkUpdate() {
    this.dialogRef.close({ data: true, status: this.taskStatus.value });
  }

  addTaskRoute() {
    this.dialogRef.close();
    sessionStorage.setItem("dpTaskDate", this.taskDetails[0].date);
    this.router.navigate(['add-day-task']);
  }
}
