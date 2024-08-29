import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { PauseResumeComponent } from 'src/app/general-components/integration-forms/pause-resume/pause-resume.component';
// import { ViewIntegrationComponent } from 'src/app/general-components/integration-forms/view-integration/view-integration.component';
import { ManageattendanceService } from 'src/app/services/manageattendance.service';
import { SettingsService } from 'src/app/services/settings.service';
import { UtilService } from 'src/app/services/util.service';
import { DeleteComponent } from 'src/app/util/delete/delete.component';
import { NoactionComponent } from '../action/noaction/noaction.component';
import { PauseResumeIntegrationComponent } from '../../util/pause-resume-integration/pause-resume-integration.component';
import { ViewIntegrationComponent } from '../../util/view-integration/view-integration.component';
import { ReminderDetailsService } from '../../services/reminder-details/reminder-details.service';
import { ManageIntegrationService } from '../../services/app-integration/manage-integration-service/manage-integration.service';
import { manageNotificationYesOption, manageNotificationNoOption } from '../../util/note-message';
import { UntypedFormControl, Validators } from '@angular/forms';
import { ReplaySubject, Subject } from 'rxjs';
import { MatSelect } from '@angular/material/select';
import { MatOption } from '@angular/material/core';
import { takeUntil } from 'rxjs/operators';
import { errorMessage,noDataMessage } from '../../util/constants';
import { MatTableDataSource } from '@angular/material/table';
import { SelectionModel } from '@angular/cdk/collections';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import {ManageOrgService} from '../../services/super-admin/manage-org/manage-org.service'; 

// export interface adSettingElement {
//   working_days: number;
//   days: object;
// }

// const Element_data: adSettingElement[] = [
//   { 'working_days': 7, 'days': {day:['sunday','monday','tuesday','wednesday','thursday','friday','saturday']}}
// ]

@Component({
  selector: 'app-ad-settings',
  templateUrl: './ad-settings.component.html',
  styleUrls: ['./ad-settings.component.less']
})
export class AdSettingsComponent implements OnInit {

  integrationtype_arr: any[] = [];

  isRemainderSlackIntegration: string;
  isRemainderWhatsappIntegration: string;
  isRemainderActiveEmployeeSlackApp: string;

  slackId: any;
  whatappIntId: any;
  isActiveNotification: boolean = false;
  isManageWorkingDays:boolean = false;
  yesOrNoOption = ["Yes", "No"];
  yesOrNoManageNotification = false;
  yesOrNoTodayAteendanceList = false;
  yesOrNoWhatsappIntegration = false;
  isReminderForCheckin: any;
  isWAConfig: boolean = false;
  isWAConfigForAD: boolean = false;
  // workingDaysDetails:any[] = ["sunday","monday","tuesday","wednesday","thursday","friday","saturday"]

  ApplicationNoteMessage = manageNotificationNoOption;
  slackNoteMessage = manageNotificationNoOption;
  whatsAppNoteMessage = manageNotificationNoOption;
  slackTodayNoteMessage = manageNotificationNoOption;
  requiredMessage = errorMessage;
  noDataMsg = noDataMessage;

  /** control for the selected project */
  public AssigneeCtrl: UntypedFormControl = new UntypedFormControl("");

  /** control for the MatSelect filter keyword */
  public AssigneeFilterCtrl: UntypedFormControl = new UntypedFormControl();

  /** list of head filtered by search keyword */
  public filteredAssignee: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);


  protected _onDestroy = new Subject<void>();

  managerselectedItems: any[] = [];
  usersCheckBox: boolean = false;

  displayedColumns: string[] = ['working_days', 'days', 'action'];
  tableDataSource = new MatTableDataSource();
  selection = new SelectionModel(true, []);
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  table_data:any[] = [];
  pageSize: number = 10;
  tablePaginationOption: number[];

  constructor(private settingsService: SettingsService,
    private router: Router,
    public matDialog: MatDialog,
    private utilsService: UtilService,
    private spinner: NgxSpinnerService,
    private dialog: MatDialog,
    private manageattendanceService: ManageattendanceService,
    private domSanitizer: DomSanitizer,
    public reminderDetailsService: ReminderDetailsService,private manageOrg:ManageOrgService,
    public manageIntegrationService: ManageIntegrationService) {
      // localStorage.setItem("atd-settings","manage-action-cards");
  }
  ngOnInit() {
    // this.getActiveIntegrationDetailsByOrgId();
    this.getSlackConfig();
    this.ActionCard();
    let data = localStorage.getItem("atd-settings");
    if(data == null || data == undefined){
      localStorage.setItem("atd-settings","manage-action-cards");
    } else {
    this.toggleCards(data);
    }
    // this.getOrgDetailsById();
  }
  incards: any[] = [];
  outcards: any[] = [];
  backcards: any[] = [];
  cardLenArray: any[] = [];
  noActionCard: boolean = false;

  //get all action cards by org id
  ActionCard() {
    this.noActionCard = false;
    this.spinner.show();
    this.cardLenArray = [];
    this.incards = [];
    this.backcards = [];
    this.outcards = [];
    this.cardLenArray.push({ "card_name": "In Actions", "length": this.incards.length },
      { "card_name": "Out Actions", "length": this.outcards.length },
      { "card_name": "Back Actions", "length": this.backcards.length });
    this.manageattendanceService.getAllActionCardByOrgId(localStorage.getItem("OrgId")).subscribe(async data => {

      if (data.map.statusMessage == "Success") {
        // this.actioncards = JSON.parse(data.map.data);
        this.actioncards = data.map.data.myArrayList;
        if (this.actioncards.length == 0) {
          this.noActionCard = true;
          if (!this.isSkipped) {
            this.noActionCardDialog();
          }
        }
        // let response = JSON.parse(data.map.data);
        let response = data.map.data.myArrayList;
        for (var i = 0; i < response.length; i++) {
          if (response[i].map.current_section == "in") {
            this.incards.push(response[i].map);
          }
          if (response[i].map.current_section == "back") {
            this.backcards.push(response[i].map);
          }
          if (response[i].map.current_section == "out") {
            this.outcards.push(response[i].map);
          }
        }
        this.cardLenArray[0].length = this.incards.length;
        this.cardLenArray[1].length = this.outcards.length;
        this.cardLenArray[2].length = this.backcards.length;
        // console.log(this.cardLenArray);

        this.spinner.hide();
      }
      else {
        this.spinner.hide();
      }
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
    })
  }
  actioncards: any[] = [];
  activeIntegrations: any[] = [];
  integrationDetails: boolean = false;
  isActiveIntegration: boolean = false;
  isActiveManageActionCards: boolean = false;
  showActioncard: boolean = false;

  toggleCards(data) {
    if (data == "manage-action-cards") {
      localStorage.setItem("atd-settings", "manage-action-cards");
      this.showActioncard = true;
      this.isActiveManageActionCards = true;
      this.integrationDetails = false;
      this.isActiveIntegration = false;
      this.isActiveNotification = false;
      this.isManageWorkingDays = false;
      // this.router.navigate(["/manage-action-cards"]);
      
    }
    // else if (data == "integration") {
    //   localStorage.setItem("atd-settings", "integration");
    //   this.isActiveIntegration = true;
    //   this.integrationDetails = true;
    //   this.showActioncard = false;
    //   this.isActiveManageActionCards = false;
    //   this.integrationtype_arr = [];
    //   this.isActiveNotification = false;
    //   this.getActiveIntegrationDetailsByOrgId();
    // }
    else if (data == "manage-notification") {
      localStorage.setItem("atd-settings", "manage-notification");
      this.showActioncard = false;
      this.isActiveManageActionCards = false;
      this.integrationDetails = false;
      this.isActiveIntegration = false;
      this.integrationtype_arr = [];
      this.isActiveNotification = true;
      this.isManageWorkingDays = false;
      this.getWAConfig();
      this.getActiveIntegrationDetailsByOrgId();
      setTimeout(() => {
        this.getAttendanceActiveEmployeeUserList();
      this.getEmployeeDetailsByOrgId(); 
      });
      
    } else if(data =="manage-working-days"){
      localStorage.setItem("atd-settings", "manage-working-days");
      this.tableDataSource = new MatTableDataSource();
      this.showActioncard = false;
      this.isActiveManageActionCards = false;
      this.integrationDetails = false;
      this.isActiveIntegration = false;
      this.isActiveNotification = false;
      this.isManageWorkingDays = true;
      this.integrationtype_arr = [];
      this.table_data = [];
      this.displayedColumns = ['working_days', 'days', 'action'];
      // this.displayedColumns = ['selector','working_days', 'days', 'action'];
      this.getOrgDetailsById();
      // this.tableDataSource = new MatTableDataSource(Element_data);
      // this.tableDataSource.paginator = this.paginator;
      // this.tableDataSource.sort = this.sort;
      // console.log(Element_data);
    }
  }

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.tableDataSource.data.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  toggleAllRows() {
    if (this.isAllSelected()) {
      this.selection.clear();
      return;
    }

    this.selection.select(...this.tableDataSource.data);
  }

  getOrgDetailsById() {
    this.spinner.show();
    this.manageOrg.getOrgDetailsById(localStorage.getItem("OrgId")).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        let response = JSON.parse(data.map.data);
        // console.log(response);
        let workingDays = JSON.parse(response.working_days);
          let responseData = {
            "working_days":workingDays.length,
            "days":workingDays
          }
        this.table_data.push(responseData);
        this.tableDataSource = new MatTableDataSource(this.table_data);
        this.tableDataSource.sort = this.sort;
        this.tableDataSource.paginator = this.paginator;
        this.spinner.hide();
      } else {
        this.spinner.hide();
      }
    })
  }
 
  //viewActionCards
  viewActionCards(data) {
    let action;
    if (data === "In Actions") {
      action = "in";
    }
    if (data === "Out Actions") {
      action = "out";
    }
    if (data === "Back Actions") {
      action = "back";
    }
    localStorage.setItem("action-card", action);
    this.router.navigate(["/manage-action-cards"]);
  }
  //addActionCards
  addActionCards(data) {
    localStorage.setItem("atd-form", data);
    this.router.navigate(["/add-action-cards"]);
  }
  isslackConfig = false;
  async getSlackConfig() {
    this.spinner.show();
    let OrgId = localStorage.getItem("OrgId");
    let data: Object = {
      org_id: OrgId,
      app: "slack",
      module: "all",
    };
    await this.manageIntegrationService.getIntegrationAccessData(data).subscribe(
      (data) => {
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
        this.isslackConfig = false;
        this.router.navigate(["/404"]);
        this.spinner.hide();
      });
  }

  async getWAConfig() {
    this.spinner.show();
    let OrgId = localStorage.getItem("OrgId");
    let data: Object = {
      org_id: OrgId,
      app: "whatsapp",
      module: "all",
    };
    await this.manageIntegrationService.getIntegrationAccessData(data).subscribe(
      (data) => {
        if (data.map.statusMessage == "Success") {
          let response = data.map.data;
          if (response.isActive) {
            this.isWAConfig = true;
          } else {
            this.isWAConfig = false;
          }

        } else {
          this.isWAConfig = false;
        }
        this.spinner.hide();
      },
      (error) => {
        this.isWAConfig = false;
        this.router.navigate(["/404"]);
        this.spinner.hide();
      });
  }

  //intgegration types arr
  slackUrlIntegrationOrNot: string = '';
  //get all integration based on org id
  async getActiveIntegrationDetailsByOrgId() {
    this.spinner.show();
    this.integrationtype_arr = [];
    this.yesOrNoManageNotification = false;
    this.yesOrNoWhatsappIntegration = false;
    this.slackUrlIntegrationOrNot = 'No';
    let OrgId = localStorage.getItem("OrgId");
   await this.settingsService.getActiveIntegrationByOrgId(OrgId).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        let response = JSON.parse(data.map.data);
        this.activeIntegrations = [];
        for (let i = 0; i < response.length; i++) {
          if (response[i].module_name == "attendance" && response[i].app_name == "whatsapp") {
            this.activeIntegrations.push(response[i]);
          }
        }
        let tempdata = this.activeIntegrations.find(r => r.app_name == 'whatsapp');
        if (tempdata == null || tempdata == undefined) {
          this.isRemainderWhatsappIntegration = 'No';
          this.whatsAppNoteMessage = manageNotificationNoOption;
          this.integrationtype_arr.push('whatsapp');
          this.isWAConfigForAD = false;
        } else {
          this.isWAConfigForAD = true;
          this.whatappIntId = tempdata.id;
          if (this.isWAConfig) {
            if (tempdata.is_paused == true) {
              this.isRemainderWhatsappIntegration = 'No';
              this.whatsAppNoteMessage = manageNotificationNoOption;
            } else {
              this.isRemainderWhatsappIntegration = 'Yes';
              this.whatsAppNoteMessage = manageNotificationYesOption;
            }
          }else{
            this.isRemainderWhatsappIntegration = 'No';
            this.whatsAppNoteMessage = manageNotificationNoOption;
          }
          
        }
        let tempdata1 = response.find(r => r.app_name == 'slack' && r.module_name == "attendance");

        if (tempdata1 == null) {
          this.isRemainderSlackIntegration = 'No';
          this.slackUrlIntegrationOrNot = 'No';

        } else {
          this.slackId = tempdata1.id;
          this.slackUrlIntegrationOrNot = 'Yes';

          if (this.isslackConfig == true) {
            if (tempdata1.is_paused == true) {
              this.isRemainderSlackIntegration = 'No';
              this.slackNoteMessage = manageNotificationNoOption;
            } else {
              this.isRemainderSlackIntegration = 'Yes';
              this.slackNoteMessage = manageNotificationYesOption;
            }
          }
          if(this.isslackConfig == false) {
            this.isRemainderSlackIntegration = 'No';
            this.slackNoteMessage = manageNotificationNoOption;
          }

        }
        this.spinner.hide();
      }
      else {
        this.spinner.hide();
      }
      // }), (error) => {
      //   this.router.navigate(["/404"]);
      //   this.spinner.hide();
    });
  }

  // To get the card class name from here
  getStyleClass(data) {
    if (data == true) {
      return 'pausedInnerCard';
    } else {
      return 'activeInnerCard';
    }
  }

  //to get the action card class
  getClassForAction(data) {
    if (data == "In Actions") {
      return 'in-action-card';
    }
    else if (data == "Out Actions") {
      return 'out-action-card';
    }
    else if (data == "Back Actions") {
      return 'back-action-card';
    }
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
    this.settingsService.pauseResumeIntegration(data).subscribe(data => {
      if (status == "paused") {
        if (data.map.statusMessage == "Success") {
          this.utilsService.openSnackBarAC("Integration paused successfully", "OK");
          this.getActiveIntegrationDetailsByOrgId();
          this.spinner.hide();
        }
        else {
          this.utilsService.openSnackBarMC("Failed to pause the integration", "OK");
          this.spinner.hide();
        }
      } else if (status == "resumed") {
        if (data.map.statusMessage == "Success") {
          this.utilsService.openSnackBarAC("Integration resumed successfully", "OK");
          this.getActiveIntegrationDetailsByOrgId();
          this.spinner.hide();
        }
        else {
          this.utilsService.openSnackBarMC("Failed to resume the integration", "OK");
          this.spinner.hide();
        }
      }

    })
  }
  //view integragion details in dialog
  viewIntegration(details) {
    this.matDialog.open(ViewIntegrationComponent, {
      width: '45%',
      maxHeight: '450px',
      panelClass: 'custom-viewdialogstyle', data: { details: details, component: details.app_name },
    });
  }

  //integrations delete
  deleteIntegration(id) {
    const dialogRef = this.matDialog.open(DeleteComponent, {
      width: '30%',
      panelClass: 'custom-viewdialogstyle',
      data: { key: "slack-whats-delete", showComment: false },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result != undefined && result != "") {
        if (result.data == true) {
          this.deleteIntegrationConfoirm(id);
        }
      }
    });
  }
  deleteIntegrationConfoirm(id) {
    this.spinner.show();
    this.settingsService.deleteIntegration(id).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        this.utilsService.openSnackBarAC("Integration deleted successfully", "OK");
        this.getActiveIntegrationDetailsByOrgId();
        this.spinner.hide();
      }
      else {
        this.utilsService.openSnackBarAC("Failed to delete integration", "OK");
        this.spinner.hide();
      }
    })
  }

  //to redirect to the integration form
  addIntegrationForm(data) {
    localStorage.setItem("integrationModuleName", "attendance");
    localStorage.setItem("ad-settings", "integration");
    if (data == "slack") {
      this.router.navigate(["/add-slack-integration"]);
    }
    else if (data == "whatsapp") {
      this.router.navigate(["/add-whatsapp-integration"]);
    }
  }


  //edit  integrations redirect to the form module
  editIntegration(id, name) {
    localStorage.setItem("integrationModuleName", "attendance");
    localStorage.setItem("ad-settings", "integration");
    if (name == "slack") {
      this.router.navigate(['edit-slack-integration/' + id]);
    }
    else if (name == "whatsapp") {
      this.router.navigate(['edit-whatsapp-integration/' + id]);
    }
  }

  //add action cards redirect
  addactioncard() {
    localStorage.setItem("atd-form", "any");
    this.router.navigate(["/add-action-cards"]);
  }

  isSkipped: boolean = false;
  //to call the noaction dialog component if there is no action cards
  noActionCardDialog() {
    const dialogRef = this.dialog.open(NoactionComponent, { width: '50%', panelClass: 'custom-viewdialogstyle' });

    dialogRef.afterClosed().subscribe(result => {
      this.ActionCard();
      this.isSkipped = true;
    });
  }

  radioButtonClickedManageNotification(event: any) {
    this.yesOrNoManageNotification = true;
    if (event.value == "Yes") {
      this.slackNoteMessage = manageNotificationYesOption;
    } else {
      this.slackNoteMessage = manageNotificationNoOption;
    }
  }

  radioButtonClickedManageNotificationTodaySlackAPP(event: any) {
    this.yesOrNoTodayAteendanceList = true;
    if (event.value == "Yes") {
      this.slackTodayNoteMessage = manageNotificationYesOption;
    } else {
      this.slackTodayNoteMessage = manageNotificationNoOption;
    }
  }

  radioButtonClickedWhatsappIntegration(event: any) {
    this.yesOrNoWhatsappIntegration = true;
    if (event.value == "Yes") {
      this.whatsAppNoteMessage = manageNotificationYesOption;
    } else {
      this.whatsAppNoteMessage = manageNotificationNoOption;
    }
  }

  async SlackIntegrationPauseOrResume(isRemainderSlackIntegration: any, app: string) {

    this.spinner.show();
    let status: string;
    if (isRemainderSlackIntegration == 'Yes') {
      status = 'resumed'
    } else {
      status = 'paused';
    }
    let data: Object = {
      "id": app == 'whatsapp' ? this.whatappIntId : this.slackId,
      "status": status
    }
    this.settingsService.pauseResumeIntegration(data).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        if (app == "whatsapp") {
          this.utilsService.openSnackBarAC(
            "Whatsapp notification updated successfully",
            "OK"
          );
        } else {
          this.utilsService.openSnackBarAC(
            "Slack notification updated successfully",
            "OK"
          );
        }
        this.getActiveIntegrationDetailsByOrgId();

      }
      else {
        if (app == "whatsapp") {
          this.utilsService.openSnackBarMC(
            "Failed to update, please check the whatsapp integration",
            "OK"
          );
        } else {
          this.utilsService.openSnackBarMC(
            "Failed to update, please check the slack integration",
            "OK"
          );
        }
        this.getActiveIntegrationDetailsByOrgId();
        this.spinner.hide();

      }

    });
  }
  userattendanceActiveEmployeeRemainder: any;
  applicationActiveUsersList: any;
  yesOrNoAppNotification: boolean = false;
  employeeDetails: any[];
  userList: any[];
  selectIds: any[];
 
  async getAttendanceActiveEmployeeUserList() {
    let orgId = localStorage.getItem("OrgId");
    this.yesOrNoTodayAteendanceList = false;
    this.yesOrNoAppNotification = false;
    this.selectIds = [];
    this.spinner.show();
    let data: Object = {
      "org_id": orgId,
      "module_name": "attendance"
    }
    await this.reminderDetailsService.getReminderByOrgIdAndModule(data).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        let response = JSON.parse(data.map.data);

        this.userattendanceActiveEmployeeRemainder = response.find(r => r.key_primary == 'slack-today-Active-Employee');
        this.applicationActiveUsersList = response.find(r => r.key_primary == "app-active-users");

        if (this.userattendanceActiveEmployeeRemainder != null && this.isslackConfig == true && this.slackUrlIntegrationOrNot == "Yes") {
          if (this.userattendanceActiveEmployeeRemainder.is_active == true) {
            this.isRemainderActiveEmployeeSlackApp = 'Yes';
            this.slackTodayNoteMessage = manageNotificationYesOption;
          }
          else {
            this.isRemainderActiveEmployeeSlackApp = 'No';
            this.slackTodayNoteMessage = manageNotificationNoOption;
          }
        } else {
          this.isRemainderActiveEmployeeSlackApp = 'No';
          this.slackNoteMessage = manageNotificationNoOption;
        }
        if (this.applicationActiveUsersList != null) {
          const jsonString = this.applicationActiveUsersList.active_users;
          const jsonArray = JSON.parse(jsonString);
          this.selectIds = jsonArray.map(item => item.emp_Id);

          if (this.applicationActiveUsersList.is_active == true) {
            this.isReminderForCheckin = 'Yes';
            this.ApplicationNoteMessage = manageNotificationYesOption;
          } else {
            this.isReminderForCheckin = 'No';
            this.ApplicationNoteMessage = manageNotificationNoOption;
          }
        } else {
          this.isReminderForCheckin = 'No';
          this.ApplicationNoteMessage = manageNotificationNoOption;
        }
        this.spinner.hide();
      } else {
        this.spinner.hide();
      }

    })
  }


  async getEmployeeDetailsByOrgId() {
    this.spinner.show();
    this.employeeDetails = [];
    let orgId = localStorage.getItem("OrgId");
    //before used method --> getActiveEmpDetailsByOrgId()
    //Here I have used the get ACTIVE EMPLOYEE DETAILS API call --> Means its get all user details under the Organization Id
    await this.settingsService.getCustomActiveEmpDetailsByOrgID(orgId).subscribe(data => {
      let response: any[] = JSON.parse(data.map.data);
      this.employeeDetails = response;
      // console.log(this.employeeDetails)
      if (this.applicationActiveUsersList != null) {
        this.AssigneeCtrl.setValue(this.selectIds);
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
  @ViewChild('leaveselect', { static: false }) select: MatSelect;
  allSelected = false;
  managerfunction(event: any) {
    this.userList = [];
    let array = event;
    if (this.managerselectedItems != undefined) {
      for (let i = 0; i < this.managerselectedItems.length; i++) {
        if (this.managerselectedItems[i] != undefined) {
          this.userList.push({ emp_Id: this.managerselectedItems[i] });
        }
      }
    }
    this.usersCheckBox = this.yesOrNoAppNotification = this.selectIds === array ? false : true;

    this.allSelected = this.userList.length === this.employeeDetails.length ? true : false;
    
  }


  toggleAllSelection() {
    if (this.allSelected) {
      this.select.options.forEach((item: MatOption) => item.select());
    } else {
      this.select.options.forEach((item: MatOption) => item.deselect());
    }
  }

  radioButtonClickedTcubeApp(event: any) {
    this.yesOrNoAppNotification = true;
    this.usersCheckBox = true;
    if (event.value == "Yes") {
      this.ApplicationNoteMessage = manageNotificationYesOption;
    } else {
      this.ApplicationNoteMessage = manageNotificationNoOption;
    }
  }



  activeEmployeeUserListSlackAppCreateOrUpdate() {
    this.spinner.show();
    let OrgId = localStorage.getItem("OrgId");
    let ischeckInOrNot;
    if (this.isRemainderActiveEmployeeSlackApp == 'Yes') {
      ischeckInOrNot = true;
    } else if (this.isRemainderActiveEmployeeSlackApp == 'No') {
      ischeckInOrNot = false;
    }

    if (this.userattendanceActiveEmployeeRemainder == null) {
      let data: Object = {
        "org_id": OrgId,
        "module_name": 'attendance',
        "key_primary": 'slack-today-Active-Employee',
        "is_active": ischeckInOrNot,
      }
      this.reminderDetailsService.createReminderWithoutZone(data).subscribe(data => {
        if (data.map.statusMessage == "Success") {
          if (this.slackUrlIntegrationOrNot == "Yes") {
            this.utilsService.openSnackBarAC("Slack notification updated successfully", "OK");
            this.getAttendanceActiveEmployeeUserList();
            this.spinner.hide();
          } else {
            this.utilsService.openSnackBarMC("Failed to update, please check the slack integration", "Ok");
            this.getAttendanceActiveEmployeeUserList();
            this.spinner.hide();
          }
        }
        else {
          this.utilsService.openSnackBarMC("Failed to update changes", "OK");
          this.getAttendanceActiveEmployeeUserList();
          this.spinner.hide();
        }
      })
    } else {
      let data: Object = {
        "org_id": OrgId,
        // "emp_id" : this.empId,
        "id": this.userattendanceActiveEmployeeRemainder.id,
        "module_name": 'leave-tracker',
        "key_primary": 'slack-today-Active-Employee',
        "is_active": ischeckInOrNot,
      }
      // console.log(data);

      this.reminderDetailsService.updateAttendanceReminder(data).subscribe(data => {
        if (data.map.statusMessage == "Success") {
          // console.log("updateAttendanceReminder",data);
          if (this.slackUrlIntegrationOrNot == "Yes") {
            this.utilsService.openSnackBarAC("Slack notification updated successfully", "OK");
            this.getAttendanceActiveEmployeeUserList();
            this.spinner.hide();
          } else {
            this.utilsService.openSnackBarMC("Failed to update, please check the slack integration", "Ok");
            this.getAttendanceActiveEmployeeUserList();
            this.spinner.hide();
          }
        }
        else {
          this.utilsService.openSnackBarMC("Failed to update changes", "OK");
          this.spinner.hide();
        }

      })
    }
  }

  ApplicationCreateOrUpdate() {
    this.spinner.show();
    let OrgId = localStorage.getItem("OrgId");
    if (this.isReminderForCheckin == 'No') {
      this.userList = [];
    }
    if (this.applicationActiveUsersList == null) {
      let data: Object = {
        "org_id": OrgId,
        "module_name": 'attendance',
        "key_primary": 'app-active-users',
        "is_active": this.isReminderForCheckin == 'Yes' ? true : false,
        "active_users": JSON.stringify(this.userList)
      }
      // console.log(data);
      this.reminderDetailsService.createReminderWithoutZone(data).subscribe(data => {
        if (data.map.statusMessage == "Success") {
          this.utilsService.openSnackBarAC("App notification updated successfully", "OK");
          this.getAttendanceActiveEmployeeUserList();
          this.getEmployeeDetailsByOrgId();
          this.spinner.hide();
        }
        else {
          this.utilsService.openSnackBarMC("Failed to update application notification", "Ok");
          this.getAttendanceActiveEmployeeUserList();
          this.getEmployeeDetailsByOrgId();
          this.spinner.hide();
        }
      });

    } else {

      let data: Object = {
        "org_id": OrgId,
        // "emp_id" : this.empId,
        "id": this.applicationActiveUsersList.id,
        "module_name": 'attendance',
        "key_primary": 'app-active-users',
        "is_active": this.isReminderForCheckin == 'Yes' ? true : false,
        "active_users": JSON.stringify(this.userList)
      }
      // console.log(data);

      this.reminderDetailsService.updateAttendanceReminder(data).subscribe(data => {
        if (data.map.statusMessage == "Success") {
          this.utilsService.openSnackBarAC("App notification updated successfully", "OK");
          this.getAttendanceActiveEmployeeUserList();
          this.spinner.hide();
        }
        else {
          this.utilsService.openSnackBarMC("Failed to update application notification", "Ok");
          this.getAttendanceActiveEmployeeUserList();
          this.spinner.hide();
        }
      });
    }
  }

  addworkingDay(){
    this.router.navigate(['/update-working-days']);
  }

}
