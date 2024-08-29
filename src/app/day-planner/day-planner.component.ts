import { Component, OnInit, OnDestroy } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import moment from 'moment';
import { NgxSpinnerService } from 'ngx-spinner';
import { DayPlannerService } from '../services/day-planner/day-planner.service';
import { IntegrationsService } from '../services/general-components/integrations/integrations.service';
import { DpCommonDialogComponent } from './dp-common-dialog/dp-common-dialog.component';
import { UtilService } from '..//services//util.service';
import { DeleteComponent } from '../util/delete/delete.component';
import { SettingsService } from '../services/settings.service';
import { ReminderDetailsService } from '../services/reminder-details/reminder-details.service';
import { takeUntil } from 'rxjs/operators';
import { TimeTrackerService } from '..//services/time-tracker.service';
import { ReplaySubject, Subject } from 'rxjs';
import { noDataMessage } from '../util/constants';
import { ProjectsService } from '../services/projects.service';
import { EditDayTaskComponent } from './edit-day-task/edit-day-task.component';
import { BulkDeleteDialogComponent } from '../util/bulk-delete-dialog/bulk-delete-dialog.component';
import { ManageIntegrationService } from '../services/app-integration/manage-integration-service/manage-integration.service';
import { Router } from '@angular/router';


@Component({
  selector: 'app-day-planner',
  templateUrl: './day-planner.component.html',
  styleUrls: ['./day-planner.component.less']
})
export class DayPlannerComponent implements OnInit, OnDestroy {

  noDataMessage = noDataMessage;
  selectedDate: any;

  datepicker: UntypedFormControl;
  todayDate: Date;
  permanentTodayDate: any;
  empId: any;
  orgId: any;
  empName: any;
  dayTaskDetails: any = [];
  allDayTaskDetails: any = [];
  tommorrowIsActive: Boolean = false
  statusList = ['Todo', 'Inprogress', 'Done'];
  avtivateLoader: Boolean = false
  public statusControl: UntypedFormControl = new UntypedFormControl('Todo');
  slackIntegrationDetails: any = [];
  empDetails: any;
  testArr: any = [];
  isIntegrationPaused: Boolean = false;
  isSubmitted: Boolean = false;
  showActionBtns: Boolean = false;
  reminderDetailsList: any;
  submitTaskReminder: any;
  isUpdated: boolean = false;
  updateTaskReminder: any = [];
  isSelectedDateIsToday: boolean = true;
  showSubmitReminderIcon: boolean = false;
  showUpdateReminderIcon: boolean = false;
  projectDetails: any = [];
  noProjects: boolean = false;
  tasksGetted: boolean = false;


  protected _onDestroy = new Subject<void>();

  //for project filter
  public project: UntypedFormControl = new UntypedFormControl();
  public projectFilterCtrl: UntypedFormControl = new UntypedFormControl();
  public filteredproject: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);
  refreshIcon: boolean = false;
  notTodayDate: boolean = true;
  noIntegrationAvailable: boolean = true;
  isNotify: string = "No";
  dpTaskDate: string;
  constructor(
    public spinner: NgxSpinnerService,
    private router: Router,
    public dayPlannerService: DayPlannerService,
    public integrationsService: IntegrationsService,
    private utilsService: UtilService,
    private dialog: MatDialog,
    private settingsService: SettingsService,
    private reminderDetailsService: ReminderDetailsService,
    public timeTrackerService: TimeTrackerService,
    private projectsService: ProjectsService,
    private manageIntegrationService: ManageIntegrationService
  ) { }

  ngOnInit() {
    this.empId = localStorage.getItem('Id');
    this.orgId = localStorage.getItem('OrgId');
    this.dpTaskDate = sessionStorage.getItem("dpTaskDate");
    if (this.dpTaskDate) {
      this.todayDate = moment(this.dpTaskDate).toDate();
      this.datepicker = new UntypedFormControl(this.todayDate);
      this.selectedDate = moment(this.todayDate).format("YYYY-MM-DD");
    } else {
      this.todayDate = moment().toDate();
      this.selectedDate = moment().format("YYYY-MM-DD");
      this.datepicker = new UntypedFormControl(new Date());
    }

    this.empName = localStorage.getItem('Name');
    this.permanentTodayDate = moment().format("YYYY-MM-DD");

    this.getDayTaskDetails();
    if (localStorage.getItem('Role') == 'org_admin') {
      this.getProjectDetailsForOrgAdmin();
    } else {
      this.getProjectDetails();
    }
    this.getslackDetails();
    this.getEmpDetails();
    this.getReminderDetails();
    // this.getTaskSubmissionStatus();
  }

  //datepicker with get method intwgration
  public onDateChange(event: MatDatepickerInputEvent<Date>) {
    this.redirectStatusUpdate(); // If the any task status changed
    this.todayDate = new Date(event.value);
    this.datepicker = new UntypedFormControl(this.todayDate);
    this.selectedDate = moment(this.todayDate).format("YYYY-MM-DD");
    this.getDayTaskDetails();
    if (this.selectedDate == this.permanentTodayDate) {
      this.isSelectedDateIsToday = true;
    } else this.isSelectedDateIsToday = false;

    if (moment(this.selectedDate).toDate() <= moment(this.permanentTodayDate).toDate()) {
      this.notTodayDate = true;
    } else this.notTodayDate = false;

    this.bulkTasksArray = [];
    this.allSelected = false; // reset the select all check box
    sessionStorage.removeItem('dpTaskDate');
  }

  nextdate() {
    this.todayDate = new Date(+this.todayDate + 1 * 86400000);
    this.datepicker = new UntypedFormControl(this.todayDate);
    this.selectedDate = moment(this.todayDate).format("YYYY-MM-DD");
    this.getDayTaskDetails();
    if (this.selectedDate == this.permanentTodayDate) {
      this.isSelectedDateIsToday = true;
    } else this.isSelectedDateIsToday = false;

    if (moment(this.selectedDate).toDate() <= moment(this.permanentTodayDate).toDate()) {
      this.notTodayDate = true;
    } else this.notTodayDate = false;

    this.bulkTasksArray = [];
    this.allSelected = false; // reset the select all check box
    sessionStorage.removeItem('dpTaskDate');

  }
  previousdate() {
    this.todayDate = new Date(+this.todayDate - 1 * 86400000);
    this.datepicker = new UntypedFormControl(this.todayDate);
    this.selectedDate = moment(this.todayDate).format("YYYY-MM-DD");
    this.getDayTaskDetails();
    if (this.selectedDate == this.permanentTodayDate) {
      this.isSelectedDateIsToday = true;
    } else this.isSelectedDateIsToday = false;

    if (moment(this.selectedDate).toDate() <= moment(this.permanentTodayDate).toDate()) {
      this.notTodayDate = true;
    } else this.notTodayDate = false;

    this.bulkTasksArray = [];
    this.allSelected = false; // reset the select all check box
    sessionStorage.removeItem('dpTaskDate');
  }

  // get the current day task details
  getDayTaskDetails() {
    this.tasksGetted = false;
    this.spinner.show();
    // this.avtivateLoader = true;
    this.dayTaskDetails = [];
    let data = {
      "org_id": this.orgId,
      "emp_id": this.empId,
      "date": this.selectedDate
    }
    this.dayPlannerService.getDayTaskDetailsByEmpIdAndOrgIdAndDate(data).subscribe(async data => {
      if (data.map.statusMessage == "Success") {
        let response = JSON.parse(data.map.data);
        this.allDayTaskDetails = response;
        this.dayTaskDetails = response;
        await this.getTaskSubmissionStatus();
        // this.isSubmitted = !(this.dayTaskDetails.find(dayTask => dayTask.is_submitted == true));
        // this.isUpdated = !(this.dayTaskDetails.find(dayTask => dayTask.is_updated == true));
      }
      this.spinner.hide();
      this.tasksGetted = true;
    }, (error) => {
      this.tasksGetted = true;
      this.spinner.hide();
    });
  }

  getTaskSubmissionStatus() {
    return new Promise<void>((resolve, reject) => {
      this.spinner.show();
      let data = {
        "org_id": this.orgId,
        "emp_id": this.empId,
        "date": this.selectedDate
      }
      this.dayPlannerService.getTaskSubmissionStatus(data).subscribe(data => {
        if (data.map.statusMessage == "Success") {
          let response = JSON.parse(data.map.data).map;
          this.isSubmitted = !(response.is_submitted);
          this.isUpdated = !(response.is_updated);
        }
        this.spinner.hide();
        resolve();
      }, (error) => {
        reject(error);
        this.spinner.hide();
      });
    });

  }

  getTaskCardHeight() {
    let height1 = window.innerHeight;
    return (height1 - 230);
  }

  // task status update
  updateDayTaskStatus(task, status) {
    if (task.status == status) {
      this.utilsService.openSnackBarAC("Task status already in " + status.toLowerCase(), "OK");
    } else {
      this.spinner.show();
      let data: object = {
        "id": task.id,
        "org_id": task.orgDetails.org_id,
        "task_status": status
      }
      this.dayPlannerService.updateDayTaskStatus(data).subscribe(data => {
        if (data.map.statusMessage == "Success") {
          this.utilsService.openSnackBarAC("Task status updated successfully", "OK");
          this.getDayTaskDetails();
        } else {
          this.utilsService.openSnackBarMC("Failed to update task status", "OK");
        }
        this.spinner.hide();
      }, (error) => {
        this.spinner.hide();
      })
    }

  }

  // delete task dialog calling --> here util delete dialog used
  deleteDayTaskDialog(id) {
    this.redirectStatusUpdate(); // If the any task status changed
    let screenWidth = screen.availWidth;
    if (screenWidth <= 750) {
      const dialogRef = this.dialog.open(DeleteComponent, {
        width: '90%',
        panelClass: 'custom-viewdialogstyle',
        data: { key: "day-planner-delete", showComment: false },
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result != undefined && result != "") {
          if (result.data == true) {
            this.deleteTaskDetails(id);
          }
        }
      });
    } else {
      const dialogRef = this.dialog.open(DeleteComponent, {
        width: '30%',
        panelClass: 'custom-viewdialogstyle',
        data: { key: "day-planner-delete", showComment: false },
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result != undefined && result != "") {
          if (result.data == true) {
            this.deleteTaskDetails(id);
          }
        }
      });
    }
  }

  //delete task details
  deleteTaskDetails(id) {
    this.spinner.show();
    this.dayPlannerService.deleteDayTask(id).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        this.resetSelectAll();
        this.utilsService.openSnackBarAC("Task deleted successfully", "OK");
        this.getDayTaskDetails();
      } else {
        this.utilsService.openSnackBarMC("Failed to delete task", "OK");
      }
      this.spinner.hide();
    }, (error) => {
      this.spinner.hide();
    })
  }

  //task date change and add duplicate dialog calling
  tempWidth: any;
  tempHeight: any;
  headerName: any;
  tommorrowClicked(task, keyValue, dateOrDuplicate, moveorcopy) {
    let screenWidth = screen.availWidth;

    if (dateOrDuplicate == 'dateChange') {
      this.headerName = 'Task Date';
    } else if (dateOrDuplicate == 'duplicate') {
      this.headerName = 'Task Duplicate';
    }

    if (keyValue == 'dayAfterTommorrow' || keyValue == 'tommorrow') {
      this.tempWidth = '30%';
      this.tempHeight = '170px';
    } else if (keyValue == 'custom') {
      this.tempWidth = '35%';
      this.tempHeight = '240px';
    }
    if (screenWidth <= 750) {
      const dialogRef = this.dialog.open(DpCommonDialogComponent, {
        width: '90%',
        // height: this.tempHeight,
        panelClass: 'custom-viewdialogstyle',
        data: { component: this.headerName, key: keyValue, date: this.selectedDate, move: moveorcopy },
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result != undefined && result != "") {
          if (result.data == true) {
            if (dateOrDuplicate == 'dateChange') {
              this.updateTaskDate(task.id, result.date);
            } else if (dateOrDuplicate == 'duplicate') {
              this.duplicateClicked(task, result.date);
            }
          }
        }
      });
    } else {
      const dialogRef = this.dialog.open(DpCommonDialogComponent, {
        width: this.tempWidth,
        // height: this.tempHeight,
        panelClass: 'custom-viewdialogstyle',
        data: { component: this.headerName, key: keyValue, date: this.selectedDate, move: moveorcopy },
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result != undefined && result != "") {
          if (result.data == true) {
            if (dateOrDuplicate == 'dateChange') {
              // console.log(task);
              this.updateTaskDate(task.id, result.date);
            } else if (dateOrDuplicate == 'duplicate') {
              this.duplicateClicked(task, result.date);
            }
          }
        }
      });
    }
  }

  bulkMoveOrDuplicate(keyValue, dateOrDuplicate, moveorcopy) {
    let screenWidth = screen.availWidth;
    if (dateOrDuplicate == 'dateChange') {
      this.headerName = 'Task Date';
    } else if (dateOrDuplicate == 'duplicate') {
      this.headerName = 'Task Duplicate';
    }

    if (keyValue == 'dayAfterTommorrow' || keyValue == 'tommorrow') {
      this.tempWidth = '30%';
      this.tempHeight = '170px';
    } else if (keyValue == 'custom') {
      this.tempWidth = '40%';
      this.tempHeight = '240px';
    }
    if (screenWidth <= 750) {
      const dialogRef = this.dialog.open(DpCommonDialogComponent, {
        width: '90%',
        height: this.tempHeight,
        panelClass: 'custom-viewdialogstyle', data: { component: this.headerName, key: keyValue, date: this.selectedDate, move: moveorcopy },
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result != undefined && result != "") {
          if (result.data == true) {
            if (dateOrDuplicate == 'dateChange') {
              this.bulkMove(result.date);
            } else if (dateOrDuplicate == 'duplicate') {
              this.bulkDuplicate(result.date);
            }
          }
        }
      });
    } else {
      const dialogRef = this.dialog.open(DpCommonDialogComponent, {
        width: this.tempWidth,
        height: this.tempHeight,
        panelClass: 'custom-viewdialogstyle', data: { component: this.headerName, key: keyValue, date: this.selectedDate, move: moveorcopy },
      });
      dialogRef.afterClosed().subscribe(result => {
        if (result != undefined && result != "") {
          if (result.data == true) {
            if (dateOrDuplicate == 'dateChange') {
              this.bulkMove(result.date);
            } else if (dateOrDuplicate == 'duplicate') {
              this.bulkDuplicate(result.date);
            }
          }
        }
      });
    }
  }
  //Task date update
  tempTaskDateUpdate: any = [];
  updateTaskDate(id, date) {
    this.spinner.show();
    this.tempTaskDateUpdate.push(id);
    let data: object = {
      "task_ids": this.tempTaskDateUpdate,
      "date": date,
    }
    this.dayPlannerService.updateDayTaskDate(data).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        this.utilsService.openSnackBarAC("Task moved successfully", "OK");
        this.getDayTaskDetails();
      } else {
        this.utilsService.openSnackBarMC("Failed to move the task", "OK");
      }
      this.tempTaskDateUpdate = [];
      this.spinner.hide();
    }, (error) => {
      this.spinner.hide();
    })
  }

  //duplicate update
  duplicateClicked(task, date) {
    this.spinner.show();
    let detailsArray: any = [];
    let zone = moment.tz.guess();
    let finalData: Object;
    let tempData: Object = {
      "emp_id": this.empId,
      "emp_name": this.empName,
      "day_task": task.day_task,
      "description": task.description,
      "date": date,
      "project_name": task.project_name,
      "project_id": task.project_id,
      "status": "Todo",
    }
    detailsArray.push(tempData);
    finalData = {
      "org_id": this.orgId,
      "detailsArray": detailsArray,
      "timezone": zone,
    }
    this.dayPlannerService.createDayTask(finalData).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        this.utilsService.openSnackBarAC("Task duplicated successfully", "OK");
        // this.ngOnInit();
      } else {
        this.utilsService.openSnackBarMC("Failed to duplicate the task", "OK");
      }
      this.spinner.hide();
    }, (error) => {
      this.spinner.hide();
    })
  }

  //get slack details
  getslackDetails() {
    this.spinner.show();
    let data: Object = {
      "org_id": this.orgId,
      "module_name": "day-planner",
      "reason": "create-tasks",
      "app_name": "slack"
    }
    this.integrationsService.getslackDetails(data).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        // let response = JSON.parse(data.map.data);
        let response = data.map.data;
        this.slackIntegrationDetails = response;

        if (this.slackIntegrationDetails == null) {
          this.noIntegrationAvailable = true;
        } else {
          this.noIntegrationAvailable = false;
          if (this.slackIntegrationDetails.is_paused == true) {
            this.isIntegrationPaused = true;
          } else this.isIntegrationPaused = false;
        }

      } else if (data.map.statusMessage == "Error") {
      }
      this.spinner.hide();
      this.getSlackConfig();
    }, (error) => {
      this.noIntegrationAvailable = true;
      this.spinner.hide();
    })
  }
  getSlackConfig() {
    this.spinner.show();
    let OrgId = localStorage.getItem("OrgId");
    let data: Object = {
      org_id: OrgId,
      app: "slack",
      module: "all",
    };
    this.manageIntegrationService.getIntegrationAccessData(data).subscribe(
      (data) => {
        if (data.map.statusMessage == "Success") {
          let out = data.map.data;
          if (out.isActive == true) {
            this.isNotify = "Yes";
          } else {
            this.isNotify = "No";
          }
        } else {
          this.isNotify = "No";
        }
        this.spinner.hide();
      },
      (error) => {
        this.router.navigate(["/404"]);
        this.spinner.hide();
      }
    );
  }
  //get employee details
  getEmpDetails() {
    this.spinner.show();
    this.settingsService.getActiveEmpDetailsById(this.empId).subscribe(async data => {
      if (data.map.statusMessage == "Success") {
        let response = JSON.parse(data.map.data);
        this.empDetails = response;
      }
      this.spinner.hide();
    }, (error) => {
      this.spinner.hide();
    })
  }

  openUpdateDialog() {
    this.redirectStatusUpdate(); // If the any task status changed
    const dialogRef = this.dialog.open(DpCommonDialogComponent, {
      width: '70%',
      maxHeight: '80%',
      panelClass: 'custom-viewdialogstyle', data: { move: "update-task", component: "Tasks To Channel", key: "updatesWithNewTasks", slack: this.slackIntegrationDetails, emp: this.empDetails, taskdetails: this.allDayTaskDetails, projectdetails: this.projectDetails, date: this.selectedDate },
      disableClose: true
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result != undefined && result != "") {
        if (result.data == true) {
          this.resetSelectAll(); // to reset the select all checkbox and empty the bulk details array
          this.getDayTaskDetails();
        }
      }
    });
  }

  tempData: any = [];
  pTCBtnDisable : boolean = false;
  //integration
  sendToSlack(type) {
    this.pTCBtnDisable = true;
    this.tempData = [];
    if (this.slackIntegrationDetails.is_paused == false && this.isNotify === "Yes") {
      for (var i = 0; i < this.projectDetails.length; i++) {
        this.tempData.push({ 'key': this.projectDetails[i].name, 'data': this.dayTaskDetails.filter(task => task.project_name == this.projectDetails[i].name) });
      }
      this.tempData.sort((a, b) => b.data.length - a.data.length);
      // console.log(this.tempData);
      this.tempData = this.tempData.filter(val => val.data.length != 0);
      let details = this.dayPlannerService.createTemplate(this.empDetails, this.tempData, type);
      this.dayPlannerService.sendToSlack(this.slackIntegrationDetails.url, JSON.stringify(details)).subscribe(data => {
        // console.log(data);
        if (data.toLowerCase() == 'ok') {
          this.pTCBtnDisable = false;
          this.utilsService.openSnackBarAC('Tasks posted successfully', 'Ok');
          this.resetSelectAll(); // to reset the select all checkbox and empty the bulk details array
          if (this.isSubmitted == true) {
            this.utilsService.sendReminderCheck();
            this.updateSubmitStatus(true, 'submit');
          }
          if (this.isUpdated && !this.isSubmitted) {
            this.utilsService.sendReminderCheck();
            this.updateSubmitStatus(true, 'update');
          }
        }
      }, (errorData) => {
        this.pTCBtnDisable = false;
        this.utilsService.openSnackBarMC('Failed to post task details. Please check the slack integration', 'Ok');
      });
    } else {
      this.pTCBtnDisable = false;
      this.utilsService.openSnackBarMC('No integrations available', 'Ok');
    }
  }

  tasksIds: any = [];
  updateSubmitStatus(status, newdata) {
    this.tasksIds = this.dayTaskDetails.map(a => a.id);
    let data: object = {
      "task_ids": this.tasksIds,
      "status": status,
      "to_change": newdata
    }
    this.dayPlannerService.updateDayTaskSubmitStatus(data).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        // this.isSubmitted = false;
        // this.isUpdated = false;
        this.getDayTaskDetails();
        this.utilsService.sendReminderCheck();
      }
    });
  }

  //get reminder details
  getReminderDetails() {
    this.spinner.show();
    let data: Object = {
      "org_id": this.orgId,
      "module_name": "day-planner"
    }
    this.reminderDetailsService.getReminderByOrgIdAndModule(data).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        let response = JSON.parse(data.map.data);
        this.reminderDetailsList = response;
        this.submitTaskReminder = this.reminderDetailsList.find(r => r.key_primary == 'submit-tasks');
        this.updateTaskReminder = this.reminderDetailsList.find(r => r.key_primary == 'update-tasks');
        if (this.submitTaskReminder != null) {
          if (this.submitTaskReminder.is_active == true) {
            if (this.submitTaskReminder.reminder_type == 'Once') {
              if (moment().toDate() < moment(this.submitTaskReminder.reminder_date).toDate()) {
                this.showSubmitReminderIcon = true;
              }
            } else if (this.submitTaskReminder.reminder_type == 'Daily') {
              let date = moment().format('YYYY-MM-DD') + " " + this.submitTaskReminder.reminder_time_str;
              if (moment().toDate() < moment(date).toDate()) {
                this.showSubmitReminderIcon = true;
              }
            }
          }
        }
        if (this.updateTaskReminder != null) {
          if (this.updateTaskReminder.is_active == true) {
            if (this.updateTaskReminder.reminder_type == 'Once') {
              if (moment().toDate() < moment(this.updateTaskReminder.reminder_date).toDate()) {
                this.showUpdateReminderIcon = true;
              }
            } else if (this.updateTaskReminder.reminder_type == 'Daily') {
              let date = moment().format('YYYY-MM-DD') + " " + this.updateTaskReminder.reminder_time_str;
              if (moment().toDate() < moment(date).toDate()) {
                this.showUpdateReminderIcon = true;
              }
            }
          }
        }
      } else if (data.map.statusMessage == "Error") {
      }
      this.spinner.hide();
    }, (error) => {
      this.spinner.hide();
    })
  }

  // to visible the yes or no button while click the reminder icon
  showBtns() {
    this.showActionBtns = true;
  }

  // to hide the yes or no button while click the reminder icon
  hideBtns() {
    this.showActionBtns = false;
  }

  // update the emp details in reminder
  reminderEmpList: any = [];
  updateEmpDetails() {
    if (this.isSubmitted) {
      if (this.submitTaskReminder != null) {
        if (this.submitTaskReminder.key_secondary) {
          this.reminderEmpList = JSON.parse(this.submitTaskReminder.key_secondary);
        }
      }
      if (!(this.reminderEmpList.find(emp => emp == this.empId))) {
        this.reminderEmpList.push(this.empId);
        let data: Object = {
          "id": this.submitTaskReminder.id,
          "emps_arr": JSON.stringify(this.reminderEmpList)
        }
        this.reminderDetailsService.updateReminderEmpDetails(data).subscribe(details => {
          // console.log(details);
          if (details.map.statusMessage == "Success") {
            this.utilsService.openSnackBarAC("Reminder details updated successfully", "OK");
            this.showActionBtns = false;
            this.utilsService.sendReminderCheck();
          } else {
            this.utilsService.openSnackBarMC("Failed to update reminder details", "OK");
          }
        })
      } else {
        this.utilsService.openSnackBarAC("Reminder details updated successfully", "OK");
        this.showActionBtns = false;
      }
    } else if (this.isUpdated && !this.isSubmitted) {
      if (this.updateTaskReminder != null) {
        if (this.updateTaskReminder.key_secondary) {
          this.reminderEmpList = JSON.parse(this.updateTaskReminder.key_secondary);
        }
      }
      if (!(this.reminderEmpList.find(emp => emp == this.empId))) {
        this.reminderEmpList.push(this.empId);
        let data: Object = {
          "id": this.updateTaskReminder.id,
          "emps_arr": JSON.stringify(this.reminderEmpList)
        }
        this.reminderDetailsService.updateReminderEmpDetails(data).subscribe(details => {
          // console.log(details);
          if (details.map.statusMessage == "Success") {
            this.utilsService.openSnackBarAC("Reminder details updated successfully", "OK");
            this.showActionBtns = false;
            this.utilsService.sendReminderCheck();
          } else {
            this.utilsService.openSnackBarMC("Failed to update reminder details", "OK");
          }
        })
      } else {
        this.utilsService.openSnackBarAC("Reminder details updated successfully", "OK");
        this.showActionBtns = false;
      }
    }

  }

  //filter function for project form field
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

  //to get project and jobs based on the orgid and empid
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
  //   }, (error) => {
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
      // console.log(projectdetails);
      //remove the duplicate projects
      projectdetails = projectdetails.reduce((accumalator, current) => {
        if (!accumalator.some((item) => item.map.id === current.map.id && item.map.name === current.map.name)) {
          accumalator.push(current);
        } return accumalator;
      }, []);

      for (var i = 0; i < projectdetails.length; i++) {
        this.projectDetails.push({ "name": projectdetails[i].map.name, "id": projectdetails[i].map.id });
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
          if (projectdetails[i].project_status == "Inprogress")
            this.projectDetails.push({ "name": projectdetails[i].project_name, "id": projectdetails[i].id });
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


  //filter event
  filterByProject(event) {
    this.refreshIcon = true;
    this.dayTaskDetails = this.allDayTaskDetails.filter(d => d.project_id == event.value.id);
  }

  //reset filter
  refreshTasks() {
    this.refreshIcon = false;
    this.project.setValue(null);
    this.dayTaskDetails = this.allDayTaskDetails;
  }

  //Edit buttton enable func
  showEditBtn: boolean = false;
  checkEdit(data) {
    if (moment(data).add(5, 'minutes').toDate() >= moment().toDate()) {
      this.showEditBtn = true;
    } else this.showEditBtn = false;
  }

  editTask(data) {
    let screenWidth = screen.availWidth;
    if (screenWidth <= 750) {
      const dialogRef = this.dialog.open(EditDayTaskComponent, {
        width: '90%',
        maxHeight: '80%',
        panelClass: 'custom-viewdialogstyle', data: { 'details': data, 'project': this.projectDetails },
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result != undefined && result != "") {
          if (result.data == true) {
            this.resetSelectAll(); // to reset the select all checkbox and empty the bulk details array
            this.getDayTaskDetails();
          }
        }
      });
    } else {
      const dialogRef = this.dialog.open(EditDayTaskComponent, {
        width: '50%',
        maxHeight: '80%',
        panelClass: 'custom-viewdialogstyle', data: { 'details': data, 'project': this.projectDetails },
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result != undefined && result != "") {
          if (result.data == true) {
            this.resetSelectAll(); // to reset the select all checkbox and empty the bulk details array
            this.getDayTaskDetails();
          }
        }
      });
    }
  }

  finalTaskDetails: any[] = [];
  finalUpdateArr(task, data) {
    this.dayTaskDetails = this.dayTaskDetails.map(function (old) {
      if (task.id == old.id) {
        old.status = data
        return old;
      } else {
        return old;
      }
    })
    if (!this.finalTaskDetails.find(a => a.id == task.id)) {
      this.finalTaskDetails.push({
        "id": task.id,
        "status": data
      });
    } else {
      let indexOfTask = this.finalTaskDetails.findIndex(a => a.id == task.id);
      this.finalTaskDetails[indexOfTask].status = data;
    }
  }

  redirectStatusUpdate() {
    if (this.finalTaskDetails.length > 0) {
      let finalData: Object;
      finalData = {
        "org_id": this.orgId,
        "detailsArray": this.finalTaskDetails,
      }
      this.dayPlannerService.bulkUpdateDayTaskStatus(finalData).subscribe(data => {
        if (data.map.statusMessage == "Success") {
          this.finalTaskDetails = [];
        }
      });
    } else {
      //Nothing to do
    }
  }

  ngOnDestroy(): void {
    let url = window.location.href.split("/");
    let urlString = url[url.length - 1];
    if (urlString != 'add-day-task') {
      sessionStorage.removeItem('dpTaskDate');
    }
    if (this.finalTaskDetails.length > 0) {
      let finalData: Object;
      finalData = {
        "org_id": this.orgId,
        "detailsArray": this.finalTaskDetails,
      }
      this.dayPlannerService.bulkUpdateDayTaskStatus(finalData).subscribe(data => {
        if (data.map.statusMessage == "Success") {
          this.finalTaskDetails = [];
        }
      });
    } else {
      //Nothing to do
    }

  }

  //Slect all funtion single select
  allSelected: any = false;
  bulkTasksArray: any[] = [];
  showOptions(event, task) {
    if (event.checked) {
      if (!this.bulkTasksArray.find(a => a.id == task.id)) {
        this.bulkTasksArray.push({
          "id": task.id,
        });
      } else {
        let indexOfTask = this.bulkTasksArray.findIndex(a => a.id == task.id);
        this.bulkTasksArray.splice(indexOfTask, 1);
      }
    } else {
      let indexOfTask = this.bulkTasksArray.findIndex(a => a.id == task.id);

      if (indexOfTask != null) {
        this.bulkTasksArray.splice(indexOfTask, 1);
      } else {

      }

      this.dayTaskDetails.map(function (tempData) {
        if (task.id == tempData.id) {
          tempData.is_selected = false;
          return tempData;
        } else return tempData;
      })

    }
    if (this.bulkTasksArray.length == this.dayTaskDetails.length) {
      this.allSelected = true;
      this.dayTaskDetails = this.dayTaskDetails.map(function (day) {
        day.is_selected = true;
        return day;
      })
    } else {
      this.allSelected = false;
    }
  }

  //Select all funtion multi select
  toggleAllSelection() {
    if (this.allSelected) {
      this.dayTaskDetails = this.dayTaskDetails.map(function (day) {
        day.is_selected = true;
        return day;
      })
      this.bulkTasksArray = this.dayTaskDetails.map(function (day) {
        return { "id": day.id };
      });
    } else {
      this.bulkTasksArray = [];
      this.dayTaskDetails = this.dayTaskDetails.map(function (day) {
        day.is_selected = false;
        return day;
      })
    }
  }

  resetSelectAll() {
    this.allSelected = false;
    this.bulkTasksArray = [];
  }

  //Bulk status update dialog calling
  bulkStatusChange() {
    this.finalTaskDetails = []; // if user changed the status by cliking the button - after while click the the bulk status icon need to empty the array
    const dialogRef = this.dialog.open(DpCommonDialogComponent, {
      width: '35%',
      panelClass: 'custom-viewdialogstyle', data: { key: "bulkStatusUpdate", move: "bulkStatusUpdate" },
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result.data == true) {
        this.confirmBulkStatus(result.status);
      }
    });
  }

  //Bulk delete dialog calling
  // here used the bulk delete dialog component to delete multple the tasks at the same time
  bulkDelete() {
    const dialogRef = this.dialog.open(BulkDeleteDialogComponent, {
      width: '35%',
      panelClass: 'custom-viewdialogstyle',
      data: { key: "day-planner-bulk-delete", showComment: false },
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result.data == true) {
        this.confirmBulkDelete();
      }
    });
  }

  //While user click the confirm button in the dialog - below function continues the bulk status update operation
  confirmBulkStatus(status) {
    this.spinner.show();
    let tempData = this.bulkTasksArray.map(function (task) {
      return { "id": task.id, "status": status };
    })
    let finalData: Object;
    finalData = {
      "org_id": this.orgId,
      "detailsArray": tempData,
    }
    this.dayPlannerService.bulkUpdateDayTaskStatus(finalData).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        this.resetSelectAll();
        this.utilsService.openSnackBarAC("Tasks status updated successfully", "OK");
        this.getDayTaskDetails();
      } else {
        this.utilsService.openSnackBarMC("Failed to update tasks status", "OK");
      }
      this.spinner.hide();
    }, (error) => {
      this.spinner.hide();
    });
  }

  //While user click the confirm button in the dialog - below function continues the bulk delete operation
  confirmBulkDelete() {
    this.spinner.show();
    let tempData = this.bulkTasksArray.map(function (task) {
      return task.id;
    })
    let finalData: Object;
    finalData = {
      "deleteIds": tempData,
    }
    this.dayPlannerService.bulkDeleteDayTask(finalData).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        this.resetSelectAll();
        this.utilsService.openSnackBarAC("Tasks deleted successfully", "OK");
        this.getDayTaskDetails();
      } else {
        this.utilsService.openSnackBarMC("Failed to delete task details", "OK");
      }
      this.spinner.hide();
    }, (error) => {
      this.spinner.hide();
    });
  }

  // bulk move for a specific date
  bulkMove(date) {
    this.spinner.show();
    let idsArr = this.bulkTasksArray.map(function (task) {
      return task.id;
    })
    let data: object = {
      "task_ids": idsArr,
      "date": date,
    }
    this.dayPlannerService.updateDayTaskDate(data).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        this.resetSelectAll();
        this.utilsService.openSnackBarAC("Tasks moved successfully", "OK");
        this.getDayTaskDetails();
      } else {
        this.utilsService.openSnackBarMC("Failed to update task date", "OK");
      }
      this.tempTaskDateUpdate = [];
      this.spinner.hide();
    }, (error) => {
      this.spinner.hide();
    })
  }

  // copy the task for specific date
  bulkDuplicate(date) {
    this.spinner.show();
    let idsArr = this.bulkTasksArray.map(function (task) {
      return task.id;
    })
    let detailsArray: any = [];
    let zone = moment.tz.guess();
    let finalData: Object;
    for (let i = 0; i < idsArr.length; i++) {
      let taskData = this.allDayTaskDetails.find(d => d.id == idsArr[i]);
      let tempData: Object = {
        "emp_id": this.empId,
        "emp_name": this.empName,
        "day_task": taskData.day_task,
        "description": taskData.description,
        "date": date,
        "project_name": taskData.project_name,
        "project_id": taskData.project_id,
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
        this.resetSelectAll();
        this.utilsService.openSnackBarAC("Tasks duplicated successfully", "OK");
      } else {
        this.utilsService.openSnackBarMC("Failed to add task details", "OK");
      }
      this.spinner.hide();
    }, (error) => {
      this.spinner.hide();
    })
  }

  addTaskRoute() {
    this.router.navigate(['add-day-task']);
    sessionStorage.setItem("dpTaskDate", this.selectedDate);
  }
}
