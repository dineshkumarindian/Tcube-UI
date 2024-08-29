import { Component, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, FormControl, UntypedFormGroup, Validators, UntypedFormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import moment from 'moment-timezone';
import { NgxSpinnerService } from 'ngx-spinner';
import { PauseResumeComponent } from 'src/app/general-components/integration-forms/pause-resume/pause-resume.component';
// import { ViewIntegrationComponent } from 'src/app/general-components/integration-forms/view-integration/view-integration.component';
import { UtilService } from 'src/app/services/util.service';
import { DeleteComponent } from 'src/app/util/delete/delete.component';
import { DayPlannerService } from '..//..//services/day-planner/day-planner.service';
import { IntegrationsService } from '..//..//services/general-components/integrations/integrations.service';
import { ReminderDetailsService } from "..//..//services/reminder-details/reminder-details.service";
import { PauseResumeIntegrationComponent } from "../../util/pause-resume-integration/pause-resume-integration.component";
import { ViewIntegrationComponent } from '../../util/view-integration/view-integration.component';
import { ManageIntegrationService } from '../../services/app-integration/manage-integration-service/manage-integration.service';
import { manageNotificationYesOption, manageNotificationNoOption, manageDayPlannerYesOption, manageDayPlannerNoOption } from '../../util/note-message';
import { SettingsService } from 'src/app/services/settings.service';
import { MatSelect } from '@angular/material/select';
import { ReplaySubject, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MatOption } from '@angular/material/core';
import { errorMessage, invalidFormat, validFormat, minLengthMessage } from '../.././/../app/util/constants';



@Component({
  selector: 'app-dp-settings',
  templateUrl: './dp-settings.component.html',
  styleUrls: ['./dp-settings.component.less']
})
export class DpSettingsComponent implements OnInit {
  page_header: string;
  activeIntegrations: any = [];
  reminderDetailsList: any = [];
  submitTaskReminder: any = [];
  requiredMessage = errorMessage;

  // activeIntegrations = [{ app_name: "slack", created_by: "YS#102", created_time: "Sep 26, 2022, 3:13:30 PM", id: 8, is_deleted: false, is_paused: true, modified_time: "Oct 12, 2022, 10:57:54 AM", module_name: "attendance", reason: "check-in", url: "https://hooks.slack.com/services/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" }];
  yesOrNoOption = ['Yes', 'No'];
  reminderTypeList = ['Once', 'Daily'];
  notificationsList = ['Application', 'Application Notification', 'Mail'];
  isActiveIntegration: boolean = false;
  isActiveReminder: boolean = false;
  isActiveAttendance: boolean = false;
  integrationDetails: boolean = false;
  reminderDetails: boolean = false;
  attendanceDetails: boolean = false;
  isReminderForTasks: any;
  isReminderForCheckin: any;
  isReminderForDayplanner: any;
  isSlackIntAvail: Boolean = false;
  empId: any;
  orgId: any;
  empName: any;
  openReminderTypeEditor: boolean = false;
  openReminderTimeEditor: boolean = false;
  openReminderDateEditor: boolean = false;
  taskSubmitReminderFormGroup: UntypedFormGroup;
  daily_reminder_time: number;
  yesOrNo: boolean = false;
  isReminderForUpdateTasks: any;
  yesOrNoUpdate: boolean = false;
  openReminderTypeEditorUpdate: boolean = false;
  openReminderTimeEditorUpdate: boolean = false;
  openReminderDateEditorUpdate: boolean = false;
  updateTaskReminder: any = [];
  yesOrNoAttendance: boolean = false;
  attendanceReminder: any = [];
  employeeDetails: any[];
  yesOrNoDayPlannerNotification: boolean = false;
  yesOrNoDayPlannerNotification1: boolean = false;
  isRemainderSlackIntegration1: any;
  isRemainderSlackIntegration: any;
  usersCheckBox: boolean = false;
  manageSlackNoteMessage = manageNotificationNoOption;
  manageSlackNoteMessage1 = manageNotificationNoOption;
  manageDayPlannerNoteMessage = manageDayPlannerNoOption;
  tcubeDayplannerStatusNoteMessage: string = manageNotificationNoOption;
  staffDayPlannerRemainder: any = [];

  yesOrNoDayPlannerStatusOnApp: boolean = false;

  /** control for the selected project */
  public AssigneeCtrl: UntypedFormControl = new UntypedFormControl("");

  /** control for the MatSelect filter keyword */
  public AssigneeFilterCtrl: UntypedFormControl = new UntypedFormControl();

  /** list of head filtered by search keyword */
  public filteredAssignee: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);

  protected _onDestroy = new Subject<void>();

  managerselectedItems:any[];
  userList:any[];
  selectIds:any[];

  constructor(private settingsService: SettingsService,
    private router: Router,
    public spinner: NgxSpinnerService,
    public dayPlannerService: DayPlannerService,
    public integrationsService: IntegrationsService,
    public reminderDetailsService: ReminderDetailsService,
    public matDialog: MatDialog,
    public utilsService: UtilService,
    private _formbuilder: UntypedFormBuilder,
    public manageIntegrationService: ManageIntegrationService,
  ) { }


  ngOnInit() {
    this.isActiveIntegration = true;
    this.integrationDetails = true;
    this.empId = localStorage.getItem('Id');
    this.orgId = localStorage.getItem('OrgId');
    this.empName = localStorage.getItem('Name');
    this.page_header = "Manage Integrations";

    this.taskSubmitReminderFormGroup = this._formbuilder.group({
      reminderType: ['', [Validators.required]],
      reminderTypeUpdate: ['', [Validators.required]],
      reminderTime: ['', [Validators.required]],
      reminderTimeUpdate: ['', [Validators.required]],
      reminderDate: ['', [Validators.required]],
      reminderDateUpdate: ['', [Validators.required]],
      reminderDateWithTime: ['', [Validators.required]],
      reminderDateWithTimeUpdate: ['', [Validators.required]],
    });
    this, this.getSlackConfig();
    setTimeout(() => {
      this.getslackDetails();
      this.getReminderDetails();
      this.getDayplannerDetails();
      this.getActiveIntegrationDetailsByOrgId();
      // this.geEmployeeDetailsByOrgId();
    }, 500);
  }

  //togggle integration / reminder cards
  togglecards(data) {
    if (data == "integration") {
      this.isActiveIntegration = true;
      this.integrationDetails = true;

      this.isActiveReminder = false;
      this.reminderDetails = false;
      this.changeTaskReminderChanges();
      this.openReminderTypeEditor = false;
      this.openReminderTimeEditor = false;
      this.openReminderDateEditor = false;
      this.openReminderTypeEditorUpdate = false;
      this.openReminderTimeEditorUpdate = false;
      this.openReminderDateEditorUpdate = false;
      this.yesOrNo = false;
      this.yesOrNoUpdate = false;
      this.taskSubmitReminderFormGroup.markAsUntouched();

      this.isActiveAttendance = false;
      this.attendanceDetails = false;
      this.yesOrNoAttendance = false;
      this.setAttendanceChanges();
      this.getDayplannerDetails();
      this.getActiveIntegrationDetailsByOrgId();
      this.page_header = "Manage Integrations";

    } else if (data == "reminder") {

      this.reminderDetails = true;
      this.isActiveReminder = true;

      this.isActiveIntegration = false;
      this.integrationDetails = false;
      this.yesOrNoDayPlannerNotification = false;
      this.yesOrNoDayPlannerNotification1 = false;
      this.setRemiderChanges();

      this.isActiveAttendance = false;
      this.attendanceDetails = false;
      this.yesOrNoAttendance = false;
      this.setAttendanceChanges();

      this.page_header = "Manage Reminders";

    } else if (data == "attendance") {

      this.isActiveAttendance = true;
      this.attendanceDetails = true;

      this.isActiveIntegration = false;
      this.integrationDetails = false;
      this.yesOrNoDayPlannerNotification = false;
      this.yesOrNoDayPlannerNotification1 = false;
      this.setRemiderChanges();

      this.isActiveReminder = false;
      this.reminderDetails = false;
      this.changeTaskReminderChanges();
      this.openReminderTypeEditor = false;
      this.openReminderTimeEditor = false;
      this.openReminderDateEditor = false;
      this.openReminderTypeEditorUpdate = false;
      this.openReminderTimeEditorUpdate = false;
      this.openReminderDateEditorUpdate = false;
      this.yesOrNo = false;
      this.yesOrNoUpdate = false;
      this.taskSubmitReminderFormGroup.markAsUntouched();

      this.page_header = "Manage Day Planner With Attendance";
    }
  }

  //add slack integration
  addSlackIntegration() {
    localStorage.setItem("integrationModuleName", "day-planner");
    this.router.navigate(["/add-slack-integration"]);
  }

  //add lwhatsapp integration
  addWhatsappIntegration() {
    // localStorage.setItem("dp-previous", "integration");
    this.router.navigate(["/add-whatsapp-integration"]);
  }

  // To get the card class name from here
  getStyleClass(data) {
    if (data == true) {
      return 'pausedInnerCard';
    } else {
      return 'activeInnerCard';
    }
  }
  isslackConfig = false;

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
        // console.log(data);
        if (data.map.statusMessage == "Success") {
          // console.log(data);
          let response = data.map.data;
          if (response.isActive) {
            this.isslackConfig = true;
          } else {
            this.isslackConfig = false;
          }

        } else {
          this.isslackConfig = false;
        }
        this.spinner.hide();
      },
      (error) => {
        this.router.navigate(["/404"]);
        this.spinner.hide();
      });
  }


  slackId: any;
  //get slack details
  getslackDetails() {
    this.spinner.show();
    this.yesOrNoDayPlannerNotification = false;
    this.yesOrNoDayPlannerNotification1 = false;
    let data: Object = {
      "org_id": this.orgId,
      "module_name": "day-planner",
      "reason": "create-tasks",
      "app_name": "slack"
    }
    this.activeIntegrations = [];
    this.integrationsService.getslackDetails(data).subscribe(data => {
      // console.log(data);
      if (data.map.statusMessage == "Success") {
        // let response = JSON.parse(data.map.data);
        let response = data.map.data;
        this.activeIntegrations.push(response);
        let tempdata1 = this.activeIntegrations.find(r => r.app_name == 'slack' && r.module_name == "day-planner");
        // console.log(tempdata1);
        if (tempdata1 == null) {
          this.isRemainderSlackIntegration = 'No';
          this.manageSlackNoteMessage = manageNotificationNoOption;
        } else {
          this.slackId = tempdata1.id;
          // console.log(this.slackId);
          if (this.isslackConfig == true) {
            if (tempdata1.is_paused == true) {
              this.isRemainderSlackIntegration = 'No';
              this.manageSlackNoteMessage = manageNotificationNoOption;
            } else {
              this.isRemainderSlackIntegration = 'Yes';
              this.manageSlackNoteMessage = manageNotificationYesOption;
            }
          } else {
            this.isRemainderSlackIntegration = 'No';
            this.manageSlackNoteMessage = manageNotificationNoOption;
          }
          // console.log(this.isRemainderSlackIntegration);
        }
        //   if (this.activeIntegrations != null) {
        //     this.isRemainderSlackIntegration = 'No';
        //     this.isSlackIntAvail = true;
        //   } else this.isSlackIntAvail = false;
        //   // console.log(this.activeIntegrations);
        // } else if (data.map.statusMessage == "Error") {
      } else {
        if (data.map.statusMessage == "Error") {
          this.isRemainderSlackIntegration = 'No';
        }

      }
      this.spinner.hide();
    })
  }

  editSlackIntegration(id) {
    localStorage.setItem("integrationModuleName", "day-planner");
    this.router.navigate(['edit-slack-integration/' + id]);
  }

  //pause or resume dialog open
  pauseOrResumeDialog(id: number, status: String) {
    let statusData;
    if (status == "resumed") {
      statusData = "resume";
    } else if (status == "paused") {
      statusData = "pause";
    }
    const dialogRef = this.matDialog.open(PauseResumeIntegrationComponent, {
      width: '30%',
      height: '145px',
      panelClass: 'custom-viewdialogstyle', data: { component: "Integration", status: statusData },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result != undefined && result != "") {
        if (result.data == true) {
          this.pauseOrResume(id, status);
        }
      }
    });
  }

  // pause or resume the integration
  pauseOrResume(id, status) {
    this.spinner.show();
    let data: Object = {
      "id": id,
      "status": status
    }
    this.integrationsService.pauseResumeIntegration(data).subscribe(data => {
      if (status == "paused") {
        if (data.map.statusMessage == "Success") {
          this.utilsService.openSnackBarAC("Integration details paused successfully", "OK");
          this.getslackDetails();
          this.spinner.hide();
        }
        else {
          this.utilsService.openSnackBarMC("Failed to pause integration details", "OK");
          this.spinner.hide();
        }
      } else if (status == "resumed") {
        if (data.map.statusMessage == "Success") {
          this.utilsService.openSnackBarAC("Integration details resumed successfully", "OK");
          this.getslackDetails();
          this.spinner.hide();
        }
        else {
          this.utilsService.openSnackBarMC("Failed to resume integration details", "OK");
          this.spinner.hide();
        }
      }

    })
  }
  SaveOrUpdatedayplannerNotification(isRemainderSlackIntegration) {
    this.spinner.show();
    let status: string;
    if (isRemainderSlackIntegration == 'Yes') {
      status = 'resumed'
    } else {
      status = 'paused';
    }
    let data: Object = {
      "id": this.slackId,
      "status": status
    }
    this.integrationsService.pauseResumeIntegration(data).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        this.utilsService.openSnackBarAC(
          "Slack notification updated successfully",
          "OK"
        );
        this.getslackDetails();

      }
      // Failed to post task details to integration. Please verify the webhook URL connection
      else {
        this.utilsService.openSnackBarMC(
          "Failed to update, please check the slack integration",
          "OK"
        );
        this.getslackDetails();
        this.spinner.hide();

      }

    });
  }




  viewWhatsappIntegration(details) {
    this.matDialog.open(ViewIntegrationComponent, {
      width: '45%',
      maxHeight: '450px',
      panelClass: 'custom-viewdialogstyle', data: { details: details, component: "whatsapp" },
    });
  }

  viewSlackIntegration(details) {
    this.matDialog.open(ViewIntegrationComponent, {
      width: '45%',
      maxHeight: '450px',
      panelClass: 'custom-viewdialogstyle', data: { details: details, component: "slack" },
    });
  }

  //delete slack dialog
  deleteSlackIntegration(id) {
    const dialogRef = this.matDialog.open(DeleteComponent, {
      width: '30%',
      panelClass: 'custom-viewdialogstyle',
      data: { key: "slack-whats-delete", showComment: false },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result != undefined && result != "") {
        if (result.data == true) {
          this.deleteSlackIntegrationConfoirm(id);
        }
      }
    });
  }
  //delete slack dialog confirmation
  deleteSlackIntegrationConfoirm(id) {
    this.spinner.show();
    this.integrationsService.deleteIntegration(id).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        this.utilsService.openSnackBarAC("Integration details deleted successfully", "OK");
        this.isSlackIntAvail = false;
        this.getslackDetails();
        this.spinner.hide();
      }
      else {
        this.utilsService.openSnackBarAC("Failed to delete integration details", "OK");
        this.spinner.hide();
      }
    })
  }

  editReminderType() {
    this.openReminderTypeEditor = true;

  }
  editReminderTypeUpdate() {
    this.openReminderTypeEditorUpdate = true;

  }
  reminderTypeUpdate() {
    this.openReminderTypeEditorUpdate = true;
  }

  editReminderTime() {
    if (this.taskSubmitReminderFormGroup.value.reminderType == 'Once') {
      this.openReminderDateEditor = true;
      this.openReminderTimeEditor = false;
    } else {
      this.openReminderTimeEditor = true;
      this.openReminderDateEditor = false;
    }
  }

  editReminderTimeUpdate() {
    if (this.taskSubmitReminderFormGroup.value.reminderTypeUpdate == 'Once') {
      this.openReminderDateEditorUpdate = true;
      this.openReminderTimeEditorUpdate = false;
    } else {
      this.openReminderTimeEditorUpdate = true;
      this.openReminderDateEditorUpdate = false;
    }
  }

  changeReminderType(evevt) {
    this.openReminderTimeEditor = false;
    this.openReminderDateEditor = false;
    // this.openReminderTypeEditor = false;
  }

  changeReminderTypeUpdate(evevt) {
    this.openReminderTimeEditorUpdate = false;
    this.openReminderDateEditorUpdate = false;
    // this.openReminderTypeEditor = false;
  }

  //get reminder details
  getReminderDetails() {
    this.spinner.show();
    let data: Object = {
      "org_id": this.orgId,
      "module_name": "day-planner"
    }
    this.reminderDetailsService.getReminderByOrgIdAndModule(data).subscribe(data => {
      // console.log(data);
      if (data.map.statusMessage == "Success") {
        let response = JSON.parse(data.map.data);
        this.reminderDetailsList = response;
        this.submitTaskReminder = this.reminderDetailsList.find(r => r.key_primary == 'submit-tasks');
        this.updateTaskReminder = this.reminderDetailsList.find(r => r.key_primary == 'update-tasks');
        this.attendanceReminder = this.reminderDetailsList.find(r => r.key_primary == 'attendance');

        // for submit tasks details
        if (this.submitTaskReminder != null) {
          let re_dt = new Date(this.submitTaskReminder.reminder_date);
          if (this.submitTaskReminder.is_active == true)
            this.isReminderForTasks = 'Yes';
          else this.isReminderForTasks = 'No';
          this.taskSubmitReminderFormGroup.get('reminderType').setValue(this.submitTaskReminder.reminder_type);
          this.taskSubmitReminderFormGroup.get('reminderDate').setValue(re_dt);
          this.taskSubmitReminderFormGroup.get('reminderTime').setValue(this.submitTaskReminder.reminder_time_str);
          this.taskSubmitReminderFormGroup.get('reminderDateWithTime').setValue(moment(re_dt).format('HH:mm'));
        } else {
          this.isReminderForTasks = 'No';
          this.taskSubmitReminderFormGroup.get('reminderType').setValue('Once');
          this.taskSubmitReminderFormGroup.get('reminderDate').setValue(moment().add(1, 'day').toDate());
          this.taskSubmitReminderFormGroup.get('reminderTime').setValue(moment().format('HH:mm'));
          this.taskSubmitReminderFormGroup.get('reminderDateWithTime').setValue(moment().add(1, 'day').format('HH:mm'));
        }

        //for updates tasks values
        if (this.updateTaskReminder != null) {
          let re_dt = new Date(this.updateTaskReminder.reminder_date);
          if (this.updateTaskReminder.is_active == true)
            this.isReminderForUpdateTasks = 'Yes';
          else this.isReminderForUpdateTasks = 'No';
          this.taskSubmitReminderFormGroup.get('reminderTypeUpdate').setValue(this.updateTaskReminder.reminder_type);
          this.taskSubmitReminderFormGroup.get('reminderDateUpdate').setValue(re_dt);
          this.taskSubmitReminderFormGroup.get('reminderTimeUpdate').setValue(this.updateTaskReminder.reminder_time_str);
          this.taskSubmitReminderFormGroup.get('reminderDateWithTimeUpdate').setValue(moment(re_dt).format('HH:mm'));
        } else {
          this.isReminderForUpdateTasks = 'No';
          this.taskSubmitReminderFormGroup.get('reminderTypeUpdate').setValue('Once');
          this.taskSubmitReminderFormGroup.get('reminderDateUpdate').setValue(moment().add(1, 'day').toDate());
          this.taskSubmitReminderFormGroup.get('reminderTimeUpdate').setValue(moment().format('HH:mm'));
          this.taskSubmitReminderFormGroup.get('reminderDateWithTimeUpdate').setValue(moment().add(1, 'day').format('HH:mm'));
        }

        //for attendance reminder details
        if (this.attendanceReminder != null) {
          if (this.attendanceReminder.is_active == true) {
            this.isReminderForCheckin = 'Yes';
            this.manageDayPlannerNoteMessage = manageDayPlannerYesOption;
          }
          else {
            this.isReminderForCheckin = 'No';
            this.manageDayPlannerNoteMessage = manageDayPlannerNoOption;
          }
        } else {
          this.isReminderForCheckin = 'No';
          this.manageDayPlannerNoteMessage = manageDayPlannerNoOption;
        }

      } else if (data.map.statusMessage == "Error") {
      }
      this.spinner.hide();
    }, (error) => {
      this.spinner.hide();
    })
  }

  //to change time to milliseconds
  timetomillsecond(time) {
    var origStr = time;
    var n = origStr.search(":");
    var hrPart = origStr.substring(0, n);
    var str = origStr.substring(n + 1, origStr.length);
    var n = str.search(":");
    var minPart = str.substring(0, 2);

    var str = str.substring(n + 1, str.length);
    var n = str.search(":");
    var secPart = str.substring(0, 2);
    var hrs = Number(hrPart) * 3600;
    var min = Number(minPart) * 60;
    var sec = Number(secPart) % 60;
    this.daily_reminder_time = (hrs + min + sec) * 1000;
  }

  //while click the save changes button to create or update the reminder details
  tempActive: any;
  tempActiveUpdate: any;
  tempReminderDate: any;
  tempReminderDateUpdate: any;
  createOrUpdate() {
    this.spinner.show();
    let zone = moment.tz.guess();
    if (this.isReminderForTasks == 'Yes')
      this.tempActive = true;
    else this.tempActive = false;
    if (this.isReminderForUpdateTasks == 'Yes')
      this.tempActiveUpdate = true;
    else this.tempActiveUpdate = false;
    //--
    if (this.taskSubmitReminderFormGroup.value.reminderType == 'Once') {
      var temp_date = moment(this.taskSubmitReminderFormGroup.value.reminderDate).format("YYYY-MM-DD") + " " + this.taskSubmitReminderFormGroup.value.reminderDateWithTime;
      this.tempReminderDate = new Date(temp_date);
    } else {
      this.timetomillsecond(this.taskSubmitReminderFormGroup.value.reminderTime);
    }
    //for update tasks
    if (this.taskSubmitReminderFormGroup.value.reminderTypeUpdate == 'Once') {
      var temp_date = moment(this.taskSubmitReminderFormGroup.value.reminderDateUpdate).format("YYYY-MM-DD") + " " + this.taskSubmitReminderFormGroup.value.reminderDateWithTimeUpdate;
      this.tempReminderDateUpdate = new Date(temp_date);
    } else {
      this.timetomillsecond(this.taskSubmitReminderFormGroup.value.reminderTimeUpdate);
    }
    //create methode
    if (this.submitTaskReminder == null) {
      let data: Object = {
        "org_id": this.orgId,
        // "emp_id" : this.empId,
        "module_name": 'day-planner',
        "key_primary": 'submit-tasks',
        "is_active": this.tempActive,
        "reminder_date": this.tempReminderDate,
        "reminder_time_ms": this.daily_reminder_time,
        "reminder_time_str": this.taskSubmitReminderFormGroup.value.reminderTime,
        "reminder_type": this.taskSubmitReminderFormGroup.value.reminderType,
        "timezone": zone,
      }
      this.reminderDetailsService.createReminder(data).subscribe(data => {
        if (data.map.statusMessage == "Success") {
          this.utilsService.openSnackBarAC("Reminder updated successfully", "OK");
          this.openReminderTypeEditor = false
          this.openReminderTimeEditor = false;
          this.openReminderDateEditor = false;
          this.daily_reminder_time = 0;
          this.tempReminderDate = null;
          this.yesOrNo = false;
          this.taskSubmitReminderFormGroup.markAsUntouched();
          this.getReminderDetails();
          this.spinner.hide();
          this.utilsService.sendReminderCheck();
        }
        else {
          this.utilsService.openSnackBarMC("Failed to update remainder details", "OK");
          this.spinner.hide();
        }
      }, (error) => {
        this.utilsService.openSnackBarMC("Failed to update remainder details", "OK");
        this.spinner.hide();
      })

    } else {
      //update method
      let data: Object = {
        "org_id": this.orgId,
        // "emp_id" : this.empId,
        "id": this.submitTaskReminder.id,
        "module_name": 'day-planner',
        "key_primary": 'submit-tasks',
        "is_active": this.tempActive,
        "reminder_date": this.tempReminderDate,
        "reminder_time_ms": this.daily_reminder_time,
        "reminder_time_str": this.taskSubmitReminderFormGroup.value.reminderTime,
        "reminder_type": this.taskSubmitReminderFormGroup.value.reminderType,
        "timezone": zone,
      }
      this.reminderDetailsService.updateReminder(data).subscribe(data => {
        if (data.map.statusMessage == "Success") {
          this.utilsService.openSnackBarAC("Reminder updated successfully", "OK");
          this.openReminderTypeEditor = false
          this.openReminderTimeEditor = false;
          this.openReminderDateEditor = false;
          this.daily_reminder_time = 0;
          this.tempReminderDate = null;
          this.yesOrNo = false;
          this.taskSubmitReminderFormGroup.markAsUntouched();
          this.getReminderDetails();
          this.spinner.hide();
          this.utilsService.sendReminderCheck();
        }
        else {
          this.utilsService.openSnackBarMC("Failed to update remainder details", "OK");
          this.spinner.hide();
        }
      }, (error) => {
        this.utilsService.openSnackBarMC("Failed to update remainder details", "OK");
        this.spinner.hide();
      })
    }
    if (this.updateTaskReminder == null) {
      let data: Object = {
        "org_id": this.orgId,
        // "emp_id" : this.empId,
        "module_name": 'day-planner',
        "key_primary": 'update-tasks',
        "is_active": this.tempActiveUpdate,
        "reminder_date": this.tempReminderDateUpdate,
        "reminder_time_ms": this.daily_reminder_time,
        "reminder_time_str": this.taskSubmitReminderFormGroup.value.reminderTimeUpdate,
        "reminder_type": this.taskSubmitReminderFormGroup.value.reminderTypeUpdate,
        "timezone": zone,
      }
      this.reminderDetailsService.createReminder(data).subscribe(data => {
        if (data.map.statusMessage == "Success") {
          this.utilsService.openSnackBarAC("Reminder updated successfully", "OK");
          this.openReminderTypeEditor = false
          this.openReminderTimeEditor = false;
          this.openReminderDateEditor = false;
          this.openReminderTypeEditorUpdate = false
          this.openReminderTimeEditorUpdate = false;
          this.openReminderDateEditorUpdate = false;
          this.daily_reminder_time = 0;
          this.tempReminderDate = null;
          this.yesOrNo = false;
          this.tempReminderDateUpdate = null;
          this.yesOrNoUpdate = false;
          this.taskSubmitReminderFormGroup.markAsUntouched();
          this.getReminderDetails();
          this.spinner.hide();
          this.utilsService.sendReminderCheck();
        }
        else {
          this.utilsService.openSnackBarMC("Failed to update remainder details", "OK");
          this.spinner.hide();
        }
      }, (error) => {
        this.utilsService.openSnackBarMC("Failed to update remainder details", "OK");
        this.spinner.hide();
      })

    } else {
      //update method
      let data: Object = {
        "org_id": this.orgId,
        // "emp_id" : this.empId,
        "id": this.updateTaskReminder.id,
        "module_name": 'day-planner',
        "key_primary": 'update-tasks',
        "is_active": this.tempActiveUpdate,
        "reminder_date": this.tempReminderDateUpdate,
        "reminder_time_ms": this.daily_reminder_time,
        "reminder_time_str": this.taskSubmitReminderFormGroup.value.reminderTimeUpdate,
        "reminder_type": this.taskSubmitReminderFormGroup.value.reminderTypeUpdate,
        "timezone": zone,
      }
      this.reminderDetailsService.updateReminder(data).subscribe(data => {
        if (data.map.statusMessage == "Success") {
          this.utilsService.openSnackBarAC("Reminder updated successfully", "OK");
          this.openReminderTypeEditor = false
          this.openReminderTimeEditor = false;
          this.openReminderDateEditor = false;
          this.openReminderTypeEditorUpdate = false
          this.openReminderTimeEditorUpdate = false;
          this.openReminderDateEditorUpdate = false;
          this.daily_reminder_time = 0;
          this.tempReminderDate = null;
          this.yesOrNo = false;
          this.tempReminderDateUpdate = null;
          this.yesOrNoUpdate = false;
          this.taskSubmitReminderFormGroup.markAsUntouched();
          this.getReminderDetails();
          this.spinner.hide();
          this.utilsService.sendReminderCheck();
        }
        else {
          this.utilsService.openSnackBarMC("Failed to update remainder details", "OK");
          this.spinner.hide();
        }
      }, (error) => {
        this.utilsService.openSnackBarMC("Failed to update remainder details", "OK");
        this.spinner.hide();
      })
    }
  }

  attendanceReminderCreateOrUpdate() {
    this.spinner.show();
    let trueOrFalse;
    if (this.isReminderForCheckin == 'Yes') {
      trueOrFalse = true;
    } else if (this.isReminderForCheckin == 'No') {
      trueOrFalse = false;
    }

    if (this.attendanceReminder == null) {
      let data: Object = {
        "org_id": this.orgId,
        "module_name": 'day-planner',
        "key_primary": 'attendance',
        "is_active": trueOrFalse,
      }
      this.reminderDetailsService.createReminderWithoutZone(data).subscribe(data => {
        if (data.map.statusMessage == "Success") {
          this.utilsService.openSnackBarAC("Reminder updated successfully", "OK");
          this.getReminderDetails();
          this.spinner.hide();
        }
        else {
          this.utilsService.openSnackBarMC("Failed to update remainder details", "OK");
          this.spinner.hide();
        }
      }, (error) => {
        this.utilsService.openSnackBarMC("Failed to update remainder details", "OK");
        this.spinner.hide();
      })
    } else {
      //update method
      let data: Object = {
        "org_id": this.orgId,
        // "emp_id" : this.empId,
        "id": this.attendanceReminder.id,
        "module_name": 'day-planner',
        "key_primary": 'attendance',
        "is_active": trueOrFalse,
      }
      this.reminderDetailsService.updateAttendanceReminder(data).subscribe(data => {
        if (data.map.statusMessage == "Success") {
          this.utilsService.openSnackBarAC("Reminder updated successfully", "OK");
          this.getReminderDetails();
          this.spinner.hide();
        }
        else {
          this.utilsService.openSnackBarMC("Failed to update remainder details", "OK");
          this.spinner.hide();
        }
      }, (error) => {
        this.utilsService.openSnackBarMC("Failed to update remainder details", "OK");
        this.spinner.hide();
      })
    }
  }

  //update the save changes button enable
  radioButtonClicked(event) {
    this.yesOrNo = true;
  }
  //update the save changes button enable
  radioButtonUpdateClicked(event) {
    this.yesOrNoUpdate = true;
  }

  //update the save changes button enable
  radioButtonClickedAttendance(event) {
    this.yesOrNoAttendance = true;
    if (event.value == "Yes") {
      this.manageDayPlannerNoteMessage = manageDayPlannerYesOption;
    } else {
      this.manageDayPlannerNoteMessage = manageDayPlannerNoOption;
    }
  }

  radioButtonClickedManageNotification(event) {
    this.yesOrNoDayPlannerNotification = true;
    if (event.value == "Yes") {
      this.manageSlackNoteMessage = manageNotificationYesOption;
    } else {
      this.manageSlackNoteMessage = manageNotificationNoOption;
    }
  }
  radioButtonClickedManageNotificationDayplannerStatus(event) {

    this.yesOrNoDayPlannerNotification1 = true;
    if (event.value == "Yes") {
      this.manageSlackNoteMessage1 = manageNotificationYesOption;
    } else {
      this.manageSlackNoteMessage1 = manageNotificationNoOption;
    }
  }


  setRemiderChanges() {  /////// while toggle the cards need to set the previous values of fields if the the field value changed ==== for reminder details
    try {
      let tempdata1 = this.activeIntegrations.find(r => r.app_name == 'slack' && r.module_name == "day-planner");
      if (tempdata1 == null) {
        this.isRemainderSlackIntegration = 'No';
        // return "No";
      } else {
        this.slackId = tempdata1.id;
        if (tempdata1.is_paused == true) {
          this.isRemainderSlackIntegration = 'No';
          // return "No";
        } else {
          this.isRemainderSlackIntegration = 'Yes';
          // return "Yes";
        }
      }
    } catch (error) {
      this.isRemainderSlackIntegration = 'No';
      // return "No";
    }
  }
  setAttendanceChanges() { /////// while toggle the cards need to set the previous values of fields if the the field value changed ==== for attendance details
    try {
      if (this.attendanceReminder != null) {
        if (this.attendanceReminder.is_active == true)
          this.isReminderForCheckin = 'Yes';
        else this.isReminderForCheckin = 'No';
      } else {
        this.isReminderForCheckin = 'No';
      }
    } catch (error) {
      this.isReminderForCheckin = 'No';
    }
  }

  changeTaskReminderChanges() {  /////// while toggle the cards need to set the previous values of fields if the the field value changed ==== for reminder details
    if (this.submitTaskReminder != null) {
      let re_dt = new Date(this.submitTaskReminder.reminder_date);
      if (this.submitTaskReminder.is_active == true)
        this.isReminderForTasks = 'Yes';
      else this.isReminderForTasks = 'No';
      this.taskSubmitReminderFormGroup.get('reminderType').setValue(this.submitTaskReminder.reminder_type);
      this.taskSubmitReminderFormGroup.get('reminderDate').setValue(re_dt);
      this.taskSubmitReminderFormGroup.get('reminderTime').setValue(this.submitTaskReminder.reminder_time_str);
      this.taskSubmitReminderFormGroup.get('reminderDateWithTime').setValue(moment(re_dt).format('HH:mm'));
    } else {
      this.isReminderForTasks = 'No';
      this.taskSubmitReminderFormGroup.get('reminderType').setValue('Once');
      this.taskSubmitReminderFormGroup.get('reminderDate').setValue(moment().add(1, 'day').toDate());
      this.taskSubmitReminderFormGroup.get('reminderTime').setValue(moment().format('HH:mm'));
      this.taskSubmitReminderFormGroup.get('reminderDateWithTime').setValue(moment().add(1, 'day').format('HH:mm'));
    }

    //for updates tasks values
    if (this.updateTaskReminder != null) {
      let re_dt = new Date(this.updateTaskReminder.reminder_date);
      if (this.updateTaskReminder.is_active == true)
        this.isReminderForUpdateTasks = 'Yes';
      else this.isReminderForUpdateTasks = 'No';
      this.taskSubmitReminderFormGroup.get('reminderTypeUpdate').setValue(this.updateTaskReminder.reminder_type);
      this.taskSubmitReminderFormGroup.get('reminderDateUpdate').setValue(re_dt);
      this.taskSubmitReminderFormGroup.get('reminderTimeUpdate').setValue(this.updateTaskReminder.reminder_time_str);
      this.taskSubmitReminderFormGroup.get('reminderDateWithTimeUpdate').setValue(moment(re_dt).format('HH:mm'));
    } else {
      this.isReminderForUpdateTasks = 'No';
      this.taskSubmitReminderFormGroup.get('reminderTypeUpdate').setValue('Once');
      this.taskSubmitReminderFormGroup.get('reminderDateUpdate').setValue(moment().add(1, 'day').toDate());
      this.taskSubmitReminderFormGroup.get('reminderTimeUpdate').setValue(moment().format('HH:mm'));
      this.taskSubmitReminderFormGroup.get('reminderDateWithTimeUpdate').setValue(moment().add(1, 'day').format('HH:mm'));
    }
  }

  async getActiveIntegrationDetailsByOrgId() {
    this.spinner.show();
    this.yesOrNoDayPlannerNotification1 = false;
    this.yesOrNoDayPlannerNotification = false;
    this.slackUrlIntegrationOrNot = 'No';
    let OrgId = localStorage.getItem("OrgId");
    this.slackId = null;
    await this.settingsService.getActiveIntegrationByOrgId(OrgId).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        let response = JSON.parse(data.map.data);
        this.activeIntegrations = [];
        for (let i = 0; i < response.length; i++) {
          if (response[i].module_name == "day-planner") {
            this.activeIntegrations.push(response[i]);
          }
        }

        let tempdata1 = response.find(r => r.app_name == 'slack' && r.module_name == "day-planner");
        if (tempdata1 == null) {
          this.isRemainderSlackIntegration = 'No';
          this.slackUrlIntegrationOrNot = 'No';
          this.manageSlackNoteMessage = manageNotificationNoOption;
        } else {
          this.slackId = tempdata1.id;
          this.slackUrlIntegrationOrNot = 'Yes';
          if (this.isslackConfig == true) {
            if (tempdata1.is_paused == true) {
              this.isRemainderSlackIntegration = 'No';
              this.manageSlackNoteMessage = manageNotificationNoOption;
            } else {
              this.isRemainderSlackIntegration = 'Yes';
              this.manageSlackNoteMessage = manageNotificationYesOption;
            }
          } else {
            this.isRemainderSlackIntegration = 'No';
            this.manageSlackNoteMessage = manageNotificationNoOption;
          }

        }
      }
      this.spinner.hide();
    })
  }


  userDayplannerListSlackRemainder: any = []
  async getDayplannerDetails() {
    this.selectIds = [];
    this.spinner.show();
    let data: Object = {
      "org_id": this.orgId,
      "module_name": "day-planner"
    }
    await this.reminderDetailsService.getReminderByOrgIdAndModule(data).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        let response = JSON.parse(data.map.data);
        this.staffDayPlannerRemainder = response.find(r => r.key_primary == 'App-dayPlanner-status-update');
        this.userDayplannerListSlackRemainder = response.find(y => y.key_primary == 'slack-dayPlanner-status-update');
        if (this.staffDayPlannerRemainder != null) {

          const jsonString  = this.staffDayPlannerRemainder.active_users;
          const arrayValue = JSON.parse(jsonString);
          this.selectIds = arrayValue.map(item => item.emp_Id);
         
          this.yesOrNoDayPlannerStatusOnApp = false;
          if (this.staffDayPlannerRemainder.is_active == true) {
            this.isReminderForDayplanner = 'Yes';
            this.tcubeDayplannerStatusNoteMessage = manageNotificationYesOption;
          }
          else {
            this.isReminderForDayplanner = 'No';
            this.tcubeDayplannerStatusNoteMessage = manageNotificationNoOption;
          }
        } else {
          this.yesOrNoDayPlannerStatusOnApp = false;
          this.isReminderForDayplanner = 'No';
          this.tcubeDayplannerStatusNoteMessage = manageNotificationNoOption;
        }
        if (this.userDayplannerListSlackRemainder != null) {

          this.yesOrNoDayPlannerStatusOnApp = false;
          if (this.userDayplannerListSlackRemainder.is_active == true) {
            this.isRemainderSlackIntegration1 = 'Yes';
            this.tcubeDayplannerStatusNoteMessage = manageNotificationYesOption;
          }
          else {
            this.isRemainderSlackIntegration1 = 'No';
            this.tcubeDayplannerStatusNoteMessage = manageNotificationNoOption;
          }
        } else {
          this.yesOrNoDayPlannerStatusOnApp = false;
          this.isRemainderSlackIntegration1 = 'No';
          this.tcubeDayplannerStatusNoteMessage = manageNotificationNoOption;
        }

        if (this.userDayplannerListSlackRemainder != null && this.isslackConfig) {
          this.yesOrNoDayPlannerNotification1 = false;
          if (this.userDayplannerListSlackRemainder.is_active == true) {
            this.isRemainderSlackIntegration1 = 'Yes';
            this.manageSlackNoteMessage1 = manageNotificationYesOption;
          } else {
            this.isRemainderSlackIntegration1 = 'No';
            this.manageSlackNoteMessage1 = manageNotificationNoOption;
          }
        }
        else {
          this.yesOrNoDayPlannerNotification1 = false;
          this.isRemainderSlackIntegration1 = 'No';
          this.manageSlackNoteMessage1 = manageNotificationNoOption;
        }
      this.geEmployeeDetailsByOrgId();
        this.spinner.hide();
      } else {
        this.spinner.hide();
      }
    })
  }
  slackUrlIntegrationOrNot: string = '';

  dayPlannerStatusSlackAppCreateOrUpdate() {
    this.spinner.show();
    let OrgId = localStorage.getItem("OrgId");
    let ischeckInOrNot;
    if (this.isRemainderSlackIntegration1 == 'Yes') {
      ischeckInOrNot = true;
    } else if (this.isRemainderSlackIntegration1 == 'No') {
      ischeckInOrNot = false;
    }
    if (this.userDayplannerListSlackRemainder == null) {
      let data: Object = {
        "org_id": OrgId,
        "module_name": 'day-planner',
        "key_primary": 'slack-dayPlanner-status-update',
        "is_active": ischeckInOrNot,
      }

      this.reminderDetailsService.createReminderWithoutZone(data).subscribe(data => {
        if (data.map.statusMessage == "Success") {
          if (this.slackUrlIntegrationOrNot == 'Yes') {
            this.utilsService.openSnackBarAC("Changes updated successfully", "OK");
            // this.getReminderDetails();
            this.getDayplannerDetails();
          } else {
            this.utilsService.openSnackBarMC("Failed to update the changes. please verify the slack Url connection", "Ok");
            this.getDayplannerDetails();
          }
          this.spinner.hide();
        }
        else {
          this.utilsService.openSnackBarMC("Failed to update changes", "OK");
          this.spinner.hide();
        }
      })
    } else {
      let data: Object = {
        "org_id": this.orgId,
        // "emp_id" : this.empId,
        "id": this.userDayplannerListSlackRemainder.id,
        "module_name": 'day-planner',
        "key_primary": 'slack-dayPlanner-status-update',
        "is_active": ischeckInOrNot,
      }
      this.reminderDetailsService.updateAttendanceReminder(data).subscribe(data => {
        if (data.map.statusMessage == "Success") {
          if (this.slackUrlIntegrationOrNot == 'Yes') {
            this.utilsService.openSnackBarAC("Changes updated successfully", "OK");
            this.getDayplannerDetails();
          }
          else {
            this.utilsService.openSnackBarMC("Failed to update the changes. please verify the slack Url connection", "Ok");
            this.getDayplannerDetails();
          }
          this.spinner.hide();
        }
        else {
          this.utilsService.openSnackBarMC("Failed to update changes", "OK");
          this.spinner.hide();
        }

      })
    }
  }

  radioButtonClickedAppPopup(event) {
    this.usersCheckBox = true;
    this.yesOrNoDayPlannerStatusOnApp = true;

    if (event.value == "Yes") {
      this.tcubeDayplannerStatusNoteMessage = manageNotificationYesOption;
    } else {
      this.tcubeDayplannerStatusNoteMessage = manageNotificationNoOption;
    }
  }

  @ViewChild('leaveselect', { static: false }) select: MatSelect;
  allSelected = false;

  geEmployeeDetailsByOrgId() {
    this.spinner.show();
    this.employeeDetails = [];
    let orgId = localStorage.getItem("OrgId");
    //before used method --> getActiveEmpDetailsByOrgId()
    //Here I have used the get ACTIVE EMPLOYEE DETAILS API call --> Means its get all user details under the Organization Id
    this.settingsService.getCustomActiveEmpDetailsByOrgID(orgId).subscribe(data => {
      let response: any[] = JSON.parse(data.map.data);
      this.employeeDetails = response;
      if(this.userDayplannerListSlackRemainder != null){
        this.AssigneeCtrl.setValue(this.selectIds);
        // this.AssigneeCtrl.get('boardIds').setValue(this.selectoptionIds);
      }
      // load the initial assignee list
      this.filteredAssignee.next(this.employeeDetails.slice());
      // listen for search field value changes
      this.AssigneeFilterCtrl.valueChanges
        .pipe(takeUntil(this._onDestroy))
        .subscribe(() => {
          this.filterassignee();
        });
      this.spinner.hide();
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
    })
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

  managerfunction(event:any){
    let array = event;
      this.userList = [];
      if(this.managerselectedItems != undefined){
      for(let i = 0; i < this.managerselectedItems.length; i++) {
        if(this.managerselectedItems[i] != undefined) {
          this.userList.push({emp_Id:this.managerselectedItems[i]});
        }
      }
    }
      if(this.selectIds === array){
        this.usersCheckBox = false;
        this.yesOrNoDayPlannerStatusOnApp = false;
      } else {
        this.usersCheckBox = true;
        this.yesOrNoDayPlannerStatusOnApp = true;
      }
      
      if (this.userList.length == this.employeeDetails.length) {
        this.allSelected = true;
      }
      else {
        this.allSelected = false;
      }
      
  }
  toggleAllSelection() {
    if (this.allSelected) {
      this.select.options.forEach((item: MatOption) => item.select());
    } else {
      this.select.options.forEach((item: MatOption) => item.deselect());
    }
  }

  todayDayplannerstatusCreateOrUpdate() {
    this.spinner.show();
    let OrgId = localStorage.getItem("OrgId");
    let ischeckInOrNot;
    if (this.isReminderForDayplanner == 'Yes') {
      ischeckInOrNot = true;
    } else if (this.isReminderForDayplanner == 'No') {
      ischeckInOrNot = false;
    }
    if (this.staffDayPlannerRemainder == null) {
      let data: Object = {
        "org_id": OrgId,
        "module_name": 'day-planner',
        "key_primary": 'App-dayPlanner-status-update',
        "is_active": ischeckInOrNot,
        "active_users":JSON.stringify(this.userList)
      }
      
      this.reminderDetailsService.createReminderWithoutZone(data).subscribe(data => {
        if (data.map.statusMessage == "Success") {
          this.utilsService.openSnackBarAC("Changes updated successfully", "OK");
          this.getDayplannerDetails();
          this.spinner.hide();
        }
        else {
          this.utilsService.openSnackBarMC("Failed to update changes", "OK");
          this.spinner.hide();
        }
      })
    } else {
      let data: Object = {
        "org_id": this.orgId,
        // "emp_id" : this.empId,
        "id": this.staffDayPlannerRemainder.id,
        "module_name": 'day-planner',
        "key_primary": 'App-dayPlanner-status-update',
        "is_active": ischeckInOrNot,
        "active_users":JSON.stringify(this.userList)
      }
      this.reminderDetailsService.updateAttendanceReminder(data).subscribe(data => {
        if (data.map.statusMessage == "Success") {
          this.utilsService.openSnackBarAC("Changes updated successfully", "OK");
          this.getDayplannerDetails();
          this.spinner.hide();
        }
        else {
          this.utilsService.openSnackBarMC("Failed to update changes", "OK");
          this.spinner.hide();
        }

      })
    }
  }

}
