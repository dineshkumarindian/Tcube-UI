import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { UtilService } from 'src/app/services/util.service';
import { ManageIntegrationService } from '../../services/app-integration/manage-integration-service/manage-integration.service';
import { MailService } from "../../services/app-integration/mail-service/mail.service";
import { manageNotificationNoOption,manageNotificationYesOption } from "../../util/note-message";
import { errorMessage } from "../../util/constants";
import { UntypedFormControl, Validators } from '@angular/forms';
import { ReplaySubject, Subject } from 'rxjs';
import { SettingsService } from '../../services/settings.service';
import { ReminderDetailsService } from '../../services/reminder-details/reminder-details.service';
import { takeUntil } from 'rxjs/operators';
import { MatSelect } from '@angular/material/select';
import { MatOption } from '@angular/material/core';
@Component({
  selector: 'app-time-tracker-settings',
  templateUrl: './time-tracker-settings.component.html',
  styleUrls: ['./time-tracker-settings.component.less']
})
export class TimeTrackerSettingsComponent implements OnInit {


  requiredMessage = errorMessage;
  isActiveMailConfig: boolean = false;
  isActiveManasgeNotification: boolean = false;
  yesOrNoOption: any[] = ['Yes', 'No'];
  yesOrNoMailConfig: boolean = false;
  mailNotifyData: any;
  isRemainderMailConfig: string;
  mailNoteMessage: string = manageNotificationNoOption;
  manageNotificationNoteMessage = manageNotificationNoOption;
  managerselectedItems: any[] = [];
  isReminderForCheckin: any;
  carddata: any;
  yesOrNoAppNotification: boolean = false;
  userList: any;
  /** control for the selected project */
  public AssigneeCtrl: UntypedFormControl = new UntypedFormControl("");

  /** control for the MatSelect filter keyword */
  public AssigneeFilterCtrl: UntypedFormControl = new UntypedFormControl();

  /** list of head filtered by search keyword */
  public filteredAssignee: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);


  protected _onDestroy = new Subject<void>();
  employeeDetails: any;
  userNotSubmittedUserRemainder: any;
  selectIds:any;
  usersCheckBox:boolean = false;

  constructor(private spinner: NgxSpinnerService,
    private utilsService: UtilService,
    private router: Router,
    private manageIntegrationService: ManageIntegrationService,
    private mailService: MailService,
    private settingsService: SettingsService,
    private reminderDetailsService: ReminderDetailsService
  ) {

  }

  ngOnInit() {
    this.carddata = "manage-notification";
    this.togglecards(this.carddata);


  }
  togglecards(data: any) {
    if (data == 'manage-notification') {
      this.isActiveMailConfig = false;
      this.isActiveManasgeNotification = true;
      // this.ngOnInit();
      this.getNotSubmittedUserDetails();
      setTimeout(() =>{
        this.getEmployeeDetailsByOrgId();
    });
      // 
    }
    if (data == 'manage-mail') {
      this.isActiveMailConfig = true;
      this.isActiveManasgeNotification = false;
      this.getMailConfigByOrg();
    }

  }
  
  async getNotSubmittedUserDetails() {
    this.spinner.show();
    this.selectIds = [];
    let OrgId = localStorage.getItem("OrgId");
    this.yesOrNoAppNotification = false;
    
    let data: Object = {
      "org_id": OrgId,
      "module_name": "time-tracker"
    }
    await this.reminderDetailsService.getReminderByOrgIdAndModule(data).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        let response = JSON.parse(data.map.data);
        this.userNotSubmittedUserRemainder = response.find(r => r.key_primary == 'not-submitted-user');
        if (this.userNotSubmittedUserRemainder != null) {
          const jsonString  = this.userNotSubmittedUserRemainder.active_users;
          const jsonArray = JSON.parse(jsonString);
          this.selectIds = jsonArray.map(item => item.emp_Id);
          if (this.userNotSubmittedUserRemainder.is_active == true) {
            this.isReminderForCheckin = 'Yes';
            this.manageNotificationNoteMessage = manageNotificationYesOption;
          }
          else {
            this.isReminderForCheckin = 'No';
            this.manageNotificationNoteMessage = manageNotificationNoOption;
          }
        } else {
          this.isReminderForCheckin = 'No';
          this.yesOrNoAppNotification = false;
         
        }
        // this.geEmployeeDetailsByOrgId();
        // console.log(response);
        this.spinner.hide();
      } else {
        this.spinner.hide();
      }
    
    });
  }
  
   async getEmployeeDetailsByOrgId() {
    this.spinner.show();
    this.employeeDetails = [];
    let orgId = localStorage.getItem("OrgId");
    await this.settingsService.getCustomActiveEmpDetailsByOrgID(orgId).subscribe(data => {
      let response: any[] = JSON.parse(data.map.data);
      this.employeeDetails = response;
      if(this.userNotSubmittedUserRemainder != null){
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
  
  @ViewChild('leaveselect', { static: false }) select: MatSelect;
  allSelected = false;

  managerfunction(event: any) {
    let array = event;
    this.userList = [];
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

  radioButtonClickedAppNotification(event) {
    this.yesOrNoAppNotification = true;
    this.usersCheckBox = true;
    if(event.value =="Yes"){
      this.manageNotificationNoteMessage = manageNotificationYesOption;
    } else {
      this.manageNotificationNoteMessage = manageNotificationNoOption;
    }
  }


  todayNotSubmittedUserCreateOrUpdate() {
    this.spinner.show();
    let OrgId = localStorage.getItem("OrgId");
    if(this.isReminderForCheckin == 'No'){
      this.userList = [];
    }
    if (this.userNotSubmittedUserRemainder == null) {
      let data: Object = {
        "org_id": OrgId,
        "module_name": 'time-tracker',
        "key_primary": 'not-submitted-user',
        "is_active": this.isReminderForCheckin == 'Yes' ? true : false,
        "active_users": JSON.stringify(this.userList)
      }
      this.reminderDetailsService.createReminderWithoutZone(data).subscribe(data => {
        if (data.map.statusMessage == "Success") {
          // console.log(data);
          this.utilsService.openSnackBarAC("App notification updated successfully", "OK");
          this.getNotSubmittedUserDetails();
          // this.spinner.hide();
        }
        else {
          this.utilsService.openSnackBarMC("Failed to update changes", "OK");
          this.getNotSubmittedUserDetails();
          // this.spinner.hide();
        }
      })
    } else {
      let data: Object = {
        "org_id": OrgId,
        // "emp_id" : this.empId,
        "id": this.userNotSubmittedUserRemainder.id,
        "module_name": 'time-tracker',
        "key_primary": 'not-submitted-user',
        "is_active": this.isReminderForCheckin == 'Yes' ? true : false,
        "active_users": JSON.stringify(this.userList)
      }
      this.reminderDetailsService.updateAttendanceReminder(data).subscribe(data => {
        if (data.map.statusMessage == "Success") {
          this.utilsService.openSnackBarAC("App notification updated successfully", "OK");
          this.getNotSubmittedUserDetails();
          // this.spinner.hide();
        }
        else {
          this.utilsService.openSnackBarMC("Failed to update changes", "OK");
          this.getNotSubmittedUserDetails();
          // this.spinner.hide();
        }

      })
    }
  }


  radioButtonClickedManageMail(event: any) {
    this.yesOrNoMailConfig = true;
    if(event.value == 'Yes'){
      this.mailNoteMessage = manageNotificationYesOption;
    } else {
      this.mailNoteMessage = manageNotificationNoOption;
    }
  }
  
  SaveOrUpdateTimeTrackerMailConfig() {
    // console.log(this.notYetmailConfig);

    if (this.mailNotifyData == null) {
      this.spinner.show();
      let OrgId = localStorage.getItem("OrgId");
      let data: Object = {
        org_id: OrgId,
        app: "mail",
        module: "time-tracker",
      };
      // console.log(data);
      this.manageIntegrationService.createIntegrationAcess(data).subscribe(
        (data) => {
          if (data.map.statusMessage == "Success") {
            this.utilsService.openSnackBarAC(
              "Mail notification created successfully",
              "OK"
            );
            this.getMailConfigByOrg();
          } else {
            this.utilsService.openSnackBarMC(
              "Failed to create mail notifcation",
              "OK"
            );
          }
          this.spinner.hide();
        },
        (error) => {
          this.router.navigate(["/404"]);
          this.spinner.hide();
        }
      );
    }
    else {
      this.spinner.show();
      let OrgId = localStorage.getItem("OrgId");
      let data: Object = {
        id: this.mailNotifyData.id,
        org_id: OrgId,
        app: "mail",
        module: "time-tracker",
        isActive: this.isRemainderMailConfig == "Yes" ? true : false
      };
      this.manageIntegrationService.updateIntegrationAcess(data).subscribe(
        (data) => {
          if (data.map.statusMessage == "Success") {
            this.utilsService.openSnackBarAC(
              "Email notification updated successfully",
              "OK"
            );
            this.getMailConfigByOrg();
          } else {
            this.utilsService.openSnackBarMC(
              "Failed to update mail notification",
              "OK"
            );
          }
          this.spinner.hide();
        },
        (error) => {
          this.router.navigate(["/404"]);
          this.spinner.hide();
        }
      );
    }
  }
  notifyDisable: boolean = false;
  ismailconfigured: boolean = false;
  getMailConfigByOrg() {
    this.spinner.show();
    let OrgId = localStorage.getItem("OrgId");
    this.yesOrNoMailConfig = false;
    this.mailService.getMailConfigByOrg(OrgId).subscribe(
      (data) => {
        if (data.map.statusMessage == "Success") {
          if (JSON.parse(data.map.data).isActive) {
            this.notifyDisable = false;
          }
          else {
            this.notifyDisable = true;
          }
          this.ismailconfigured = true;
          this.getTimeTrackerMailConfig();
        } else {
          this.isRemainderMailConfig = 'No';
          this.notifyDisable = true;
          this.ismailconfigured = false;
          this.spinner.hide();
        }
       
      },
      (error) => {
        this.router.navigate(["/404"]);
        this.spinner.hide();
      }
    );
  }

  getTimeTrackerMailConfig() {
    this.spinner.show();
    let OrgId = localStorage.getItem("OrgId");

    let data: Object = {
      org_id: OrgId,
      app: "mail",
      module: "time-tracker",
    };
    this.manageIntegrationService.getIntegrationAccessData(data).subscribe(
      (data) => {
        // console.log(data);
        if (data.map.statusMessage == "Success") {
          this.yesOrNoMailConfig = false;
          let out = data.map.data;
          this.mailNotifyData = out;
          // console.log(this.mailNotifyData);
          if (out.isActive == true) {
            this.isRemainderMailConfig = 'Yes';
            this.mailNoteMessage = manageNotificationYesOption;
          }
          else {
            this.isRemainderMailConfig = 'No';
            this.mailNoteMessage = manageNotificationNoOption;
          }
          this.spinner.hide();
        } else {
          this.isRemainderMailConfig = 'No';
          this.mailNoteMessage = manageNotificationNoOption;
          this.spinner.hide();
        }
        
      },
      (error) => {
        this.router.navigate(["/404"]);
        this.spinner.hide();
      }
    );
  }


}
