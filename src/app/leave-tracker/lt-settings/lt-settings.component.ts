import { SelectionModel } from '@angular/cdk/collections';
import { Component, OnInit, QueryList, ViewChild, ViewChildren, AfterViewInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { UntypedFormControl, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { SettingsService } from 'src/app/services/settings.service';
import { UtilService } from 'src/app/services/util.service';
import { SettingsBulkDeleteComponent } from 'src/app/settings/settings-bulk-delete/settings-bulk-delete.component';
import { DeleteComponent } from 'src/app/util/delete/delete.component';
import { NoleavetypeActionComponent } from '../noleavetype-action/noleavetype-action.component';
import { NoholidayActionComponent } from '../noleavetype-action/noholiday-action/noholiday-action.component';
// import { ViewIntegrationComponent } from '../../general-components/integration-forms/view-integration/view-integration.component';
import { PauseResumeComponent } from '../../general-components/integration-forms/pause-resume/pause-resume.component';
import moment from 'moment-timezone';
import { noDataMessage ,errorMessage} from '../../util/constants';
import { ReminderDetailsService } from '../../services/reminder-details/reminder-details.service';
import { BulkDeleteDialogComponent } from '../../util/bulk-delete-dialog/bulk-delete-dialog.component';
import { PauseResumeIntegrationComponent } from '../../util/pause-resume-integration/pause-resume-integration.component';
import { ViewIntegrationComponent } from '../../util/view-integration/view-integration.component';
import * as tablePageOption from '../../util/table-pagination-option';
import { ManageIntegrationService } from '../../services/app-integration/manage-integration-service/manage-integration.service';
import { MailService } from '../../services/app-integration/mail-service/mail.service';
import {manageNotificationNoOption,manageNotificationYesOption} from '../../util/note-message';
import { ReplaySubject, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MatSelect } from '@angular/material/select';
import { MatOption } from '@angular/material/core';
import {UsersComponentComponent} from '../../general-components/users-component/users-component.component';
@Component({
  selector: 'app-lt-settings',
  templateUrl: './lt-settings.component.html',
  styleUrls: ['./lt-settings.component.less']
})


export class LtSettingsComponent implements OnInit {
  noDataMsg = noDataMessage;
  requiredMessage = errorMessage;
  displayedColumns1: string[] = ['selector', 'leave_type', 'available_days','year', 'lt_action'];
  displayedColumns: string[] = ['selector', 'leave_name', 'leave_date', 'hd_action'];
  // dataSource = new MatTableDataSource();
  tableDataSource = new MatTableDataSource();
  selection_1 = new SelectionModel(true, []);
  selection = new SelectionModel(true, []);
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;

  leaveTypeDetails: any[] = [];
  leaveTypeLength: number;
  leaveTypes: any[] = [];
  listLeaveTypes: any[];
  listHolidays: any[];
  filterData: string;
  page_header: string;
  leaveTypeYear: any = moment().year();
  isSkipLeaveType: boolean = false;
  isActiveLeaveTracker: boolean = false;
  showManageLeaveTypeTable: boolean = false;
  Bulkdeleteleavetypesicon: boolean = false;
  leavetypeFilter: boolean = false;
  leave_nodata: boolean = false;
  nextdisable: boolean = false;
  beforedisable: boolean = false;
  formname: string;
  pageSize: number = 10;
  tablePaginationOption: number[];
  dates: Date;
  today_date: string;
  today_date_str: string;
  setDateStr: string;
  startingDate: any;
  endingDate: any;
  afterOneYear: any;
  beforeTwoYear: any;
  disableStartDate: any;
  mailNoteMessage: string = manageNotificationNoOption;
  tcubeTodayNoteMessage: string = manageNotificationNoOption;
  slackTodayNoteMessage: string = manageNotificationNoOption;
  slackApprovalsNoteMessage: string = manageNotificationNoOption;
  ApprovalsNoteMessage: string = manageNotificationNoOption;
  whatsNoteMessage: string = manageNotificationNoOption;
  // @ViewChildren(MatPaginator) paginator = new QueryList<MatPaginator>();
  // @ViewChildren(MatSort) sort = new QueryList<MatSort>();

  // @ViewChild('empTbSort') empTbSort = new MatSort();
  // @ViewChild('empTbPagination') empTbSort = new MatPaginator();
  currentDate = moment(new Date()).format("YYYY-MM-DD").toString();
  startOfYear: any = moment().startOf('year').toDate();
  endOfYear: any = moment().endOf('year').toDate();
  currentYear: any = moment().year();
  isCurrentYear: boolean;
  zone = moment.tz.guess();

  isActiveIntegration: boolean = false;
  integrationDetails: boolean = false;

  isActiveTodayLeave: boolean = false;
  todayLeaveDetails: boolean = false;

  orgId: any;
  userLeavePopupRemainder: any = [];

  yesOrNoOption = ['Yes', 'No'];
  yesOrNoLeavePopup: boolean = false;
  yesOrNoManageMail: boolean = false;
  isReminderForCheckin: any;

  yesOrNoSlackApp: boolean = false;
  isReminderForCheckSlackApp: any;
  userLeaveListSlackRemainder: any = [];

  isActiveMailConfig: boolean = false;
  yesOrNoMailConfig: boolean = false;
  isRemainderMailConfig:any;

  isRemainderSlackIntegration: any;
  isRemainderSlackApprovalsIntegration: any = 'No';
  isRemainderWhatsappIntegration: any;
  yesOrNoSlackIntegration: boolean = false;
  yesOrNoSlack: boolean = false;
  isslackConfig: boolean = false;
  isWAConfig: boolean = false;
  isWAConfigForLT: boolean = false;
  // selectIds:any[];

   /** control for the selected project */
   public AssigneeCtrl: UntypedFormControl = new UntypedFormControl("");

  /** control for the MatSelect filter keyword */
  public AssigneeFilterCtrl: UntypedFormControl = new UntypedFormControl();

  /** list of head filtered by search keyword */
  public filteredAssignee: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);

  
  protected _onDestroy = new Subject<void>();

  managerselectedItems:any[]= [];
  employeeDetails:any[];
  userList:any[];
  selectIds:any[];
  usersCheckBox:boolean = false;
  // @ViewChild('select', { static: true }) select: MatSelect;
  // usersselectedItems = [];

  constructor(private settingsService: SettingsService,
    private router: Router,
    public matDialog: MatDialog,
    private utilsService: UtilService,
    private spinner: NgxSpinnerService,
    private dialog: MatDialog,
    public reminderDetailsService: ReminderDetailsService,
    private domSanitizer: DomSanitizer,
    private manageIntegrationService: ManageIntegrationService,
    private mailService: MailService) { }

  ngOnInit() {
    this.formname = localStorage.getItem('lt-form');
    this.orgId = localStorage.getItem('OrgId');   
    this.dates = new Date();
    this.afterOneYear = moment(this.startOfYear).add(1, 'year').format("DD-MM-YYYY").toString();
    this.beforeTwoYear = moment(this.startOfYear).subtract(2, 'year').format("DD-MM-YYYY").toString();
    this.getSlackConfig();
    // console.log(this.formname);
    this.togglecards(this.formname);
    // console.log(this.todayDate);
  }
  leaveTypeData: any[] = [
    {
      "leave_type": "Casual leave",
      "start_date": this.startOfYear,
      "end_date": this.endOfYear,
      "year": this.leaveTypeYear,
      "available_days": 10,
      "image_name": "casual.jpg",
      "image_file": "../../../assets/images/casual-leave.png",
      "timezone": this.zone

    },
    {
      "leave_type": "Sick leave",
      "start_date": this.startOfYear,
      "end_date": this.endOfYear,
      "year": this.leaveTypeYear,
      "available_days": 10,
      "image_name": "sick.jpg",
      "image_file": "../../../assets/images/sick.png",
      "timezone": this.zone
    }
  ];
  isresetLeaveType: boolean = false;
  isresetHoliday: boolean = false;

  //togggle leavetype / holiday cards
  togglecards(data) {
    if (data == "leavetypes") {
      this.tableDataSource = new MatTableDataSource();
      this.isActiveLeaveTracker = true;
      this.isActiveTodayLeave = false;
      this.showManageLeaveTypeTable = true;
      this.isHolidayLeaveTracker = false;
      this.isActiveIntegration = false;
      this.isresetLeaveType = false;
      this.isresetHoliday = false;
      this.isActiveMailConfig = false;
      this.Bulkdeleteleavetypesicon = false;
      this.showHolidayTable = false;
      this.integrationDetails = false;
      this.todayLeaveDetails = false;
      this.page_header = "Leave Types";
      this.displayedColumns = ['selector', 'leave_type', 'available_days','pre_Leave_notice_period','year', 'lt_action'];
      this.getActiveLeaveTypeDetailsByOrgId();
      setTimeout(() => {
        this.getHolidaysCounts();
        this.getActiveIntegrationDetailsByOrgId();
      }, 500);

    }
    else if (data == "holidays") {
      this.tableDataSource = new MatTableDataSource();
      // this.selection_1.clear();
      this.leave_nodata = false;
      this.isActiveTodayLeave = false;
      this.isHolidayLeaveTracker = true;
      this.isresetLeaveType = false;
      this.isresetHoliday = false;
      this.showHolidayTable = true;
      this.Bulkdeleteleavetypesicon = false;
      this.isActiveLeaveTracker = false;
      this.isActiveMailConfig = false;
      this.isActiveIntegration = false;
      this.showManageLeaveTypeTable = false;
      this.integrationDetails = false;
      this.todayLeaveDetails = false;
      this.page_header = "Holidays";
      this.displayedColumns1 = ['selector', 'leave_name', 'leave_date', 'hd_action'];
      if (this.leaveTypeYear == this.currentYear) {
        this.isCurrentYear = true;
      } else {
        this.isCurrentYear = false;
      }
      this.getHolidaysByOrgId();
      this.getleavetypeCounts();
      // this.getActiveLeaveTypeDetailsByOrgId();

    }
    else if (data == "integration") {
      this.tableDataSource = new MatTableDataSource();
      this.selection.clear();
      this.isActiveIntegration = true;
      this.isActiveTodayLeave = false;
      this.integrationDetails = true;
      this.todayLeaveDetails = false;
      this.isHolidayLeaveTracker = false;
      this.isActiveMailConfig = false;
      this.showHolidayTable = false;
      this.Bulkdeleteleavetypesicon = false;
      this.isActiveLeaveTracker = false;
      this.showManageLeaveTypeTable = false;
      this.page_header = "Integrations";
      // this.getActiveIntegrationDetailsByOrgId();
    }
    else if (data == "todayleaves") {
      this.tableDataSource = new MatTableDataSource();
      this.selection.clear();
      this.isActiveTodayLeave = true;
      this.todayLeaveDetails = true;
      this.isActiveIntegration = false;
      this.isActiveMailConfig = false;
      this.integrationDetails = false;
      this.isHolidayLeaveTracker = false;
      this.showHolidayTable = false;
      this.Bulkdeleteleavetypesicon = false;
      this.isActiveLeaveTracker = false;
      this.showManageLeaveTypeTable = false;
      this.getWAConfig();
      this.getActiveIntegrationDetailsByOrgId();
      setTimeout(() =>{
        this.getTodayLeaveDetails();
        this.geEmployeeDetailsByOrgId();
      })   
      // this.getTodayLeaveDetails();


    }
    else if (data == "manage-email") {
      this.tableDataSource = new MatTableDataSource();
      this.selection.clear();
      this.isActiveTodayLeave = false;
      this.todayLeaveDetails = false;
      this.isActiveIntegration = false;
      this.isActiveMailConfig = true;
      this.integrationDetails = false;
      this.isHolidayLeaveTracker = false;
      this.showHolidayTable = false;
      this.Bulkdeleteleavetypesicon = false;
      this.isActiveLeaveTracker = false;
      this.showManageLeaveTypeTable = false;
      this.yesOrNoMailConfig = false;
      this.page_header = "Mail";
      // this.isRemainderMailConfig = 'No';
      this.getMailConfigByOrg();
      // this.getLeaveTrackerMailConfig();
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

  bulk_delete() {
    this.listLeaveTypes = [];
    for (var i = 0; i < this.selection.selected.length; i++) {
      this.listLeaveTypes.push(this.selection.selected[i].id)
    }
    if (this.listLeaveTypes.length >= 2) {
      this.Bulkdeleteleavetypesicon = true;
    }
    else {
      this.Bulkdeleteleavetypesicon = false
    }
  }

  //to get get holiday counts
  getHolidaysCounts() {
    this.spinner.show();
    let zone = moment.tz.guess();

    let data: Object = {
      "org_id": localStorage.getItem("OrgId"),
      "start_date": moment(this.startOfYear).format("YYYY-MM-DD").toString(),
      "end_date": moment(this.endOfYear).format("YYYY-MM-DD").toString(),
      "timezone": zone,
    }
    this.settingsService.getActiveHolidayByOrgIdAndDates(data).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        let response = JSON.parse(data.map.data);
        this.holidayDetails = response;
      }
      this.spinner.hide();
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
    })
  }

  //to get get leavetypes counts
  getleavetypeCounts() {
    this.spinner.show();
    // this.startOfYear = moment().startOf('year').toDate();
    // this.endOfYear = moment().endOf('year').toDate()
    let zone = moment.tz.guess();
    let data: Object = {
      "org_id": localStorage.getItem("OrgId"),
      "start_date": this.startOfYear,
      "end_date": this.endOfYear,
      "timezone": zone,
    }
    this.settingsService.getActiveLeaveTypeByOrgIdAndDates(data).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        let response = JSON.parse(data.map.data);
        this.leaveTypes = response;
      }
      this.spinner.hide();
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
    })
  }
  //get active leave type details by orgid
  getAllLeaveTypeDetailsId: any[];
  //   getActiveLeaveTypeDetailsByOrgId() {
  //     this.spinner.show();
  //     this.leaveTypeDetails = [];
  //     this.getAllLeaveTypeDetailsId = [];
  //     this.leaveTypeLength;
  //     this.selection.clear();
  //     let OrgId = localStorage.getItem("OrgId");
  //     this.settingsService.getActiveLeaveDetailsByOrgId(OrgId).subscribe(async data => {
  //       if (data.map.statusMessage == "Success") {
  //         let response = JSON.parse(data.map.data);
  //         console.log(response);
  //         let currentleaveType = false;
  // console.log(this.leaveTypeYear);
  //         for (let i = 0; i < response.length; response++) {
  //           let year = parseInt(response[i].year);
  //           if (this.leaveTypeYear == year) {
  //             currentleaveType = true;
  //             break;
  //           } else {
  //             currentleaveType = false;
  //           }
  //         }
  //         //  console.log("response"+currentleaveType);

  //         if (response.length > 0 && currentleaveType == true) {
  //           // this for getting leave type image
  //           for (var i = 0; i < response.length; i++) {
  //             this.getAllLeaveTypeDetailsId.push(response[i].id);
  //             if (response[i].image != undefined) {
  //               let stringArray = new Uint8Array(response[i].image);
  //               const STRING_CHAR = stringArray.reduce((data, byte) => {
  //                 return data + String.fromCharCode(byte);
  //               }, '');
  //               let base64String = btoa(STRING_CHAR);
  //               response[i].image = this.domSanitizer.bypassSecurityTrustUrl("data:image/jpeg;base64," + base64String);
  //             }
  //           }
  //           this.leaveTypes = response;
  //           for (let k = 0; k < this.leaveTypes.length; k++) {
  //             this.leaveTypeDetails.push(this.leaveTypes[k].leave_type.toLowerCase());
  //           }
  //           // console.log(this.getAllLeaveTypeDetailsId)
  //           this.displayedColumns = ['selector', 'leave_type', 'available_days', 'year', 'lt_action'];
  //           this.leaveTypeDetails = [...new Set(this.leaveTypeDetails)];
  //           this.leaveTypeLength = this.leaveTypeDetails.length;
  //           // console.log(this.leaveTypeLength);
  //           this.tableDataSource = new MatTableDataSource(this.leaveTypes);
  //           this.tableDataSource.sort = this.sort;
  //           this.tableDataSource.paginator = this.paginator;
  //           this.leave_nodata = false;
  //           this.holiday_nodata = false;

  //         }
  //         else if (response.length == 0 && currentleaveType == false) {
  //           this.displayedColumns = ['selector', 'leave_type', 'available_days', 'year', 'lt_action'];

  //           // this.leaveTypeLength = 0;
  //           // this.NoDatadefaultActionLeaveType();
  //           this.getEmployeeDetails();
  //           // onClickManageLeaveType
  //           this.leaveTypes = [];
  //           // console.log(response.length);
  //           this.tableDataSource = new MatTableDataSource();
  //           this.leave_nodata = true;
  //           this.holiday_nodata = false;
  //         }

  //       }
  //       setTimeout(() => {
  //         this.spinner.hide();
  //       }, 2000);
  //     }, (error) => {
  //       this.router.navigate(["/404"]);
  //       this.spinner.hide();
  //     })

  //   }


  nextdate() {
    this.beforedisable = false;
    this.dates = moment(this.dates).add(1, 'years').toDate();
    this.today_date = moment(this.dates).format("YYYY-MM-DD");
    this.startingDate = moment(this.dates).startOf("year").format("DD-MM-YYYY");
    this.endingDate = moment(this.dates).endOf("year").format("DD-MM-YYYY");
    this.disableStartDate = moment(this.dates).startOf("year").format("DD-MM-YYYY").toString();
    this.startOfYear = moment(this.dates).startOf("year").toDate();
    this.endOfYear = moment(this.dates).endOf("year").toDate();
    this.leaveTypeYear = moment(this.startOfYear).year();
    // console.log("this.leaveTypeYear",this.leaveTypeYear);
    if (this.leaveTypeYear == this.currentYear) {
      this.isCurrentYear = true;
    } else {
      this.isCurrentYear = false;
    }
    if (this.page_header == "Holidays") {
      this.getHolidaysByOrgId();
      this.getleavetypeCounts();
    }
    if (this.page_header == "Leave Types") {
      this.getActiveLeaveTypeDetailsByOrgId();
      this.getHolidaysCounts();
    }

    let currentdate = moment().startOf("year").format("DD-MM-YYYY").toString();
    if (currentdate == this.disableStartDate) {
      this.previousYear = false;
    }
    if (this.disableStartDate == this.afterOneYear) {
      this.nextdisable = true;
    }
    else {
      this.nextdisable = false;
    }
  }

  previousYear: boolean = false;
  previousdate() {
    this.nextdisable = false;
    this.dates = moment(this.dates).subtract(1, 'years').toDate();
    this.startingDate = moment(this.dates).startOf("year").format("DD-MM-YYYY");
    this.endingDate = moment(this.dates).endOf("year").format("DD-MM-YYYY");
    this.disableStartDate = moment(this.dates).startOf("year").format("DD-MM-YYYY").toString();
    this.startOfYear = moment(this.dates).startOf("year").toDate();
    this.endOfYear = moment(this.dates).endOf("year").toDate();
    this.leaveTypeYear = moment(this.startOfYear).year();
    if (this.leaveTypeYear == this.currentYear) {
      this.isCurrentYear = true;
    } else {
      this.isCurrentYear = false;
    }
    if (this.page_header == "Holidays") {
      this.getHolidaysByOrgId();
      this.getleavetypeCounts();

    }
    if (this.page_header == "Leave Types") {
      this.getActiveLeaveTypeDetailsByOrgId();
      this.getHolidaysCounts();
    }
    let lt_yr = moment().startOf("year");
    let lastYear = moment(lt_yr).subtract(1, 'years').format("DD-MM-YYYY").toString();

    if (lastYear == this.disableStartDate) {
      this.previousYear = true;
    }
    else {
      this.previousYear = false;
    }

    if (this.disableStartDate == this.beforeTwoYear) {
      this.beforedisable = true;
      this.previousYear = true;
    }
    else {
      this.beforedisable = false;
    }
  }

  // To fetch the leave types based on the orgid and time zone
  getActiveLeaveTypeDetailsByOrgId() {
    this.spinner.show();
    this.leaveTypeDetails = [];
    this.getAllLeaveTypeDetailsId = [];
    this.leaveTypeLength;
    this.pageSize = 10;
    this.selection.clear();
    let zone = moment.tz.guess();
    let data: Object = {
      "org_id": localStorage.getItem("OrgId"),
      "start_date": this.startOfYear,
      "end_date": this.endOfYear,
      "timezone": zone,
    }
    this.settingsService.getActiveLeaveTypeByOrgIdAndDates(data).subscribe(async data => {
      // console.log(data);
      if (data.map.statusMessage == "Success") {
        let response = JSON.parse(data.map.data);
        // console.log(response);
        this.tablePaginationOption = tablePageOption.tablePaginationOption(response.length);
        if (response.length > 0) {
          // this for getting leave type image
          for (var i = 0; i < response.length; i++) {
            this.getAllLeaveTypeDetailsId.push(response[i].id);
            if (response[i].image != undefined) {
              let stringArray = new Uint8Array(response[i].image);
              const STRING_CHAR = stringArray.reduce((data, byte) => {
                return data + String.fromCharCode(byte);
              }, '');
              let base64String = btoa(STRING_CHAR);
              response[i].image = this.domSanitizer.bypassSecurityTrustUrl("data:image/jpeg;base64," + base64String);
            }
          }
          this.leaveTypes = response;
          // console.log(this.leaveTypes);
          for (let k = 0; k < this.leaveTypes.length; k++) {
            this.leaveTypeDetails.push(this.leaveTypes[k].leave_type.toLowerCase());
          }
          // console.log(this.leaveTypes);
          // console.log(this.getAllLeaveTypeDetailsId)
          // this.displayedColumns = ['selector', 'leave_type', 'available_days', 'year', 'lt_action'];
          this.leaveTypeDetails = [...new Set(this.leaveTypeDetails)];
          this.leaveTypeLength = this.leaveTypeDetails.length;
          // console.log(this.leaveTypeLength);
          this.tableDataSource = new MatTableDataSource(this.leaveTypes);
          this.tableDataSource.sort = this.sort;
          this.tableDataSource.paginator = this.paginator;
          this.leave_nodata = false;
          this.holiday_nodata = false;

        }
        else if (response.length == 0) {
          // this.displayedColumns = ['selector', 'leave_type', 'available_days', 'year', 'lt_action'];
          this.tableDataSource = new MatTableDataSource();
          this.tableDataSource.sort = this.sort;
          this.tableDataSource.paginator = this.paginator;
          // this.leaveTypeLength = 0;
          // this.NoDatadefaultActionLeaveType();
          if (!this.previousYear) {
            this.getEmployeeDetails();
          }

          // onClickManageLeaveType
          this.leaveTypes = [];
          // console.log(response.length);
          this.tableDataSource = new MatTableDataSource();
          this.leave_nodata = true;
          this.holiday_nodata = false;
        }
      }
      setTimeout(() => {
        this.spinner.hide();
      }, 2000);
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
    })
  }
  // get employee details for need to show after 24 hours NoDatadefaultActionLeaveType adding functionality of employee details
  skiptime: boolean = false;
  getEmployeeDetails() {
    let empId = localStorage.getItem("Id");
    // console.log(empId);
    this.settingsService.getActiveEmpDetailsById(empId).subscribe(data => {
      let response = JSON.parse(data.map.data);
      let skipped_time = new Date(response.skipped_time);
      // let skip_hour = skipped_time.getHours();
      let nextday = moment(skipped_time).add(1, 'days').toDate();
      // let nextDayHour = new Date(nextday).getHours();
      let todayDate = new Date();
      if (skipped_time <= nextday && nextday >= todayDate) {
        let nextdayHour = nextday.getHours();
        let todayHour = todayDate.getHours();
        if (todayHour >= nextdayHour) {
        }
      } else {
        this.NoDatadefaultActionLeaveType();
      }
    })

  }
  NoDatadefaultActionLeaveType() {
    localStorage.setItem("lt-form", "leavetypes");
    // debugger;
    const dialogRef = this.dialog.open(NoleavetypeActionComponent, {
      width: '38%',
      height: '240px',
      panelClass: 'custom-viewdialogstyle',
      data: { "st_date": this.startOfYear, "ed_date": this.endOfYear },
    })
    dialogRef.afterClosed().subscribe(resp => {

      if (resp == "create") {
        this.router.navigate(["/add-leave-types"]);
      }
      if (resp == "refresh") {
        this.getActiveLeaveTypeDetailsByOrgId();
      }
    });
  }
  // }
  manageleavebg(data: any) {
    if (data.substr(data.length - 4) == ".png") {
      return true;
    }
    else {
      return false;
    }
  }

  // filter for the leave type table
  applyFilterLeavetype(event: Event) {
    this.leavetypeFilter = false;
    this.filterData = (event.target as HTMLInputElement).value;
    const filterValue = (event.target as HTMLInputElement).value;
    this.tableDataSource.filter = filterValue.trim().toLowerCase();
    if (this.tableDataSource.filteredData.length == 0) {
      this.leavetypeFilter = true;
    }
    if (this.tableDataSource.paginator) {
      this.tableDataSource.paginator = this.paginator;
    }
  }

  deleteLeaveType(id: number) {
    const dialogRef = this.matDialog.open(DeleteComponent, {
      width: '30%',
      panelClass: 'custom-viewdialogstyle',
      data: { key: "leave-type-delete", showComment: false },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result != undefined && result != "") {
        if (result.data == true) {
          this.deleteLeaveTypeConfoirm(id);
        }
      }
    });
  }
  deleteLeaveTypeConfoirm(id: number) {
    this.spinner.show();
    let data: Object = {
      "id": id,
      // In UI not implemented the comments section ( form field) but in api added field for comments for future purposes
      "comment": "",
    }
    this.settingsService.deleteLeaveType(data).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        this.utilsService.openSnackBarAC("Leave type deleted successfully", "OK");
        this.getActiveLeaveTypeDetailsByOrgId();
      }
      else {
        this.utilsService.openSnackBarMC("Failed to delete leave type details", "OK");
      }
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
    })
    setTimeout(() => {
      this.spinner.hide();
    }, 1000);
  }

  LeavetypeBulkDelete() {
    // console.log(id);
    let isDelete = "Leave Types Bulk";
    const dialogRef = this.dialog.open(BulkDeleteDialogComponent, {
      width: '30%',
      panelClass: 'custom-viewdialogstyle',
      data: { key: "leave-type-bulk-delete", showComment: false }
      // data: { header: "Leave Types Bulk", deleteList: this.listLeaveTypes }

    })
    dialogRef.afterClosed().subscribe(
      resp => {
        if (resp != undefined && resp != null) {
          if (resp.data == true) {
            this.bulkDeleteLeaveTypeConfoirm(this.listLeaveTypes);
          }// this.selection.clear();
          // this.listLeaveTypes = [];
          // this.Bulkdeleteleavetypesicon = false
          // this.getActiveLeaveTypeDetailsByOrgId();
        }
        this.selection.clear();
        this.listLeaveTypes = [];
        this.Bulkdeleteleavetypesicon = false;
      }
    );
  }
  //bulkdelete leave type

  bulkDeleteLeaveTypeConfoirm(leavedata: any) {
    this.spinner.show();
    let data: Object = {
      "deleteIds": leavedata,
    }
    this.settingsService.bulkdeleteLeaveTypes(data).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        this.utilsService.openSnackBarAC("Leave types deleted successfully", "OK");
        this.selection.clear();
        this.listLeaveTypes = [];
        this.Bulkdeleteleavetypesicon = false
        this.getActiveLeaveTypeDetailsByOrgId();
        // this.dialogRef.close("delete");
      }
      else {
        this.utilsService.openSnackBarMC("Failed to delete leave type details", "OK");
      }
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
      // this.dialogRef.close();
    })
    setTimeout(() => {
      this.spinner.hide();
    }, 1000);
  }

  //initializations starts for the HOLIDAYS
  holidayDetails: any[] = [];
  holidayLeaveName: any[];
  holidayLeaveDate: any[];
  // holidayDataSource = new MatTableDataSource();
  // displayedColumnsHoliday: string[] = ['leave_name', 'leave_date', 'action'];

  isHolidayLeaveTracker: boolean = false;
  showHolidayTable: boolean = false;
  holidayFilter: boolean = false;
  holiday_nodata: boolean = false;
  getHolidayIds: any[] = [];
  //get active holiday details based on orgid
  async getHolidaysByOrgId() {
    this.spinner.show();
    this.holidayLeaveName = [];
    this.holidayLeaveDate = [];
    this.getHolidayIds = [];
    this.pageSize = 10;
    this.selection_1.clear();
    let zone = moment.tz.guess();

    let data: Object = {
      "org_id": localStorage.getItem("OrgId"),
      "start_date": moment(this.startOfYear).format("YYYY-MM-DD").toString(),
      "end_date": moment(this.endOfYear).format("YYYY-MM-DD").toString(),
      "timezone": zone,
    }

    // this.existingHolidayFormGroup.controls['leave_date'].enable();
    // this.settingsService.getActiveHolidayByOrgId(localStorage.getItem("OrgId")).subscribe(data => {
    await this.settingsService.getActiveHolidayByOrgIdAndDates(data).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        let response = JSON.parse(data.map.data);
        this.tablePaginationOption = tablePageOption.tablePaginationOption(response.length);
        if (response.length > 0) {
          // debugger;
          this.holidayDetails = response;
          for (let i = 0; i < this.holidayDetails.length; i++) {
            this.holidayDetails[i].leave_date = new Date(this.holidayDetails[i].leave_date_str);
            this.holidayLeaveName.push(this.holidayDetails[i].leave_name);
            this.holidayLeaveDate.push(this.holidayDetails[i].leave_date_str);
            this.getHolidayIds.push(this.holidayDetails[i].id);
          }
          this.tableDataSource = new MatTableDataSource(this.holidayDetails);
          this.tableDataSource.sort = this.sort;
          this.tableDataSource.paginator = this.paginator;
          this.holiday_nodata = false;
          this.leave_nodata = false;
        }
        else if (response.length == 0) {
          this.holidayDetails = [];
          this.tableDataSource = new MatTableDataSource();
          this.tableDataSource.sort = this.sort;
          this.tableDataSource.paginator = this.paginator;
          if (!this.previousYear) {
            this.getEmployeeDetailsHoliday();
          }
          this.holiday_nodata = true;
          this.leave_nodata = true;
        }
      }
      setTimeout(() => { this.spinner.hide() }, 1000);
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
    })
  }
  isAllSelected2() {
    const numSelected = this.selection_1.selected.length;
    const numRows = this.tableDataSource.data.length;
    return numSelected === numRows;
  }
  //  !!Selects all rows if they are not all selected; otherwise clear selection
  toggleAllRows2() {
    if (this.isAllSelected2()) {
      this.selection_1.clear();
      return;
    }
    this.selection_1.select(...this.tableDataSource.data);
  }
  bulk_delete_holidays() {
    this.listHolidays = [];
    for (var i = 0; i < this.selection_1.selected.length; i++) {
      this.listHolidays.push(this.selection_1.selected[i].id)
    }
    // console.log(this.listHolidays);
    if (this.listHolidays.length >= 2) {
      this.Bulkdeleteleavetypesicon = true;
    }
    else {
      this.Bulkdeleteleavetypesicon = false
    }
  }
  //holiday bulk delete implementation
  holidaysBulkDelete() {
    let isDelete = "Holidays Bulk";
    const dialogRef = this.dialog.open(BulkDeleteDialogComponent, {
      width: '30%',
      panelClass: 'custom-viewdialogstyle',
      data: { key: "holiday-bulk-delete", showComment: false }
      // data: { header: isDelete, deleteList: this.listHolidays }

    })
    dialogRef.afterClosed().subscribe(
      resp => {
        if (resp != undefined && resp != null) {
          if (resp.data == true) {
            this.bulkdeleteHolidays(this.listHolidays);
          }
        }
        this.selection_1.clear();
        this.listHolidays = [];
        this.Bulkdeleteleavetypesicon = false;
      }
    );
  }
  bulkdeleteHolidays(holidayData: any) {
    this.spinner.show();
    let data: Object = {
      "deleteIds": holidayData,
    }
    this.settingsService.bulkDeleteHolidays(data).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        this.utilsService.openSnackBarAC("Holidays deleted successfully", "OK");
        // this.dialogRef.close();
        this.selection_1.clear();
        this.listHolidays = [];
        this.Bulkdeleteleavetypesicon = false;
        this.getHolidaysByOrgId();
      }
      else {
        this.utilsService.openSnackBarMC("Failed to delete holiday details", "OK");
      }
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
      // this.dialogRef.close();
    })
    setTimeout(() => {
      this.spinner.hide();
    }, 1000);
  }
  // get employee details for need to show after 24 hours noDataHolidayAction adding functionality of employee details
  getEmployeeDetailsHoliday() {
    let empId = localStorage.getItem("Id");
    // console.log(empId);
    this.settingsService.getActiveEmpDetailsById(empId).subscribe(data => {
      let response = JSON.parse(data.map.data);
      let skipped_time = new Date(response.skipped_time);
      let nextday = moment(skipped_time).add(1, 'days').toDate();
      let todayDate = new Date();
      if (skipped_time <= nextday && nextday >= todayDate) {
        let nextdayHour = nextday.getHours();
        let todayHour = todayDate.getHours();
      
        if (todayHour >= nextdayHour) {
          // console.log(true);
        }
      } else {
        this.noDataHolidayAction();
      }
    })

  }
  noDataHolidayAction() {
    localStorage.setItem("lt-form", "holidays");
    const dialogRef = this.dialog.open(NoholidayActionComponent, {
      width: '38%',
      // height: '230px',
      panelClass: 'custom-viewdialogstyle',      
      data: { "isresetHoliday": false, leaveTypeYear: this.leaveTypeYear }
    })
  
    dialogRef.afterClosed().subscribe(resp => {
      if (resp == "default") {
        this.getHolidaysByOrgId();
      }
      if (resp == "custom") {
        this.router.navigate(['/add-holiday']);
        // this.ngOnInit();
        // this.toggleNewHoliday();
      }
    });


  }
  //filter for the holiday table data
  applyFilterHoliday(event: Event) {
    this.holidayFilter = false;
    this.filterData = (event.target as HTMLInputElement).value;
    const filterValue = (event.target as HTMLInputElement).value;
    this.tableDataSource.filter = filterValue.trim().toLowerCase();
    if (this.tableDataSource.filteredData.length == 0) {
      this.holidayFilter = true;
    }
    if (this.tableDataSource.paginator) {
      this.tableDataSource.paginator = this.paginator;
    }
  }

  //delete for the hodiay
  deleteHoliday(id: number) {
    const dialogRef = this.matDialog.open(DeleteComponent, {
      width: '30%',
      panelClass: 'custom-viewdialogstyle',
      data: { key: "delete-holiday", showComment: false },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result != undefined && result != "") {
        if (result.data == true) {
          this.deleteHolidayConfoirm(id);
          // this.getHolidaysByOrgId();
        }
      }
    });
  }
  deleteHolidayConfoirm(id: number) {
    this.spinner.show();
    let data: Object = {
      "id": id,
      // In UI not implemented the comments section ( form field) but in api added field for comments for future purposes
      "comment": "",
    }
    this.settingsService.deleteHoliday(data).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        this.utilsService.openSnackBarAC("Holiday deleted successfully", "OK");
        this.getHolidaysByOrgId();
      }
      else {
        this.utilsService.openSnackBarMC("Failed to delete holiday", "OK");
      }
    })
    setTimeout(() => {
      this.spinner.hide();
    }, 1000);
  }


  //add leave type
  addLeaveType() {
    localStorage.setItem("lt-form", "leavetypes");
    this.router.navigate(["/add-leave-types"]);
  }

  //add holiday form
  addholiday() {
    localStorage.setItem("lt-form", "holidays");
    localStorage.setItem("lt-year", this.leaveTypeYear);
    this.router.navigate(["/add-holiday"]);
  }

  //add gov holiday
  addgovholiday() {
    localStorage.setItem("lt-form", "holidays");
    this.router.navigate(["/add-gov-holiday"]);
  }

  //edit leave type
  editleavetype(id) {
    localStorage.setItem("lt-form", "leavetypes");
    this.router.navigate(['edit-leave-types/' + id]);
  }
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

  getWAConfig() {
    this.spinner.show();
    let OrgId = localStorage.getItem("OrgId");
    let data: Object = {
      org_id: OrgId,
      app: "whatsapp",
      module: "all",
    };
    this.manageIntegrationService.getIntegrationAccessData(data).subscribe(
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
  integrationtype_arr: any[] = [];
  slackId: any;
  slackApprovalsId : any = null;
  whatappIntId: any;
  slackUrlIntegrationOrNot: string = '';
  //get all integration based on org id
  async getActiveIntegrationDetailsByOrgId() {
    this.spinner.show();
    this.integrationtype_arr = [];
    this.yesOrNoSlackIntegration = false;
    this.yesOrNoSlack = false;
    this.yesOrNoWhatsappIntegration = false;
    this.slackUrlIntegrationOrNot = 'No';
    let OrgId = localStorage.getItem("OrgId");
    this.slackId = null;
    await this.settingsService.getActiveIntegrationByOrgId(OrgId).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        let response = JSON.parse(data.map.data);
        for (let i = 0; i < response.length; i++) {
          if (response[i].module_name == "approvals" && response[i].app_name == "slack") {
            this.slackApprovalsId = response[i].id;
            if(response[i].is_paused){
               this.isRemainderSlackApprovalsIntegration = 'No';
               this.ApprovalsNoteMessage = manageNotificationNoOption;
            }else{
              this.isRemainderSlackApprovalsIntegration = 'Yes';
              this.ApprovalsNoteMessage = manageNotificationYesOption;
            }            
          }
        }
        let tempdata = response.find(r => r.app_name == 'whatsapp' && r.module_name == "leave-tracker");
        if (tempdata == null || tempdata == undefined){
          this.isRemainderWhatsappIntegration = 'No';
          this.whatsNoteMessage = manageNotificationNoOption;
          this.integrationtype_arr.push('whatsapp');
          this.isWAConfigForLT = false;
        } else {
          this.isWAConfigForLT = true;
          this.whatappIntId = tempdata.id;
          if (this.isWAConfig) {
            if (tempdata.is_paused == true) {
              this.isRemainderWhatsappIntegration = 'No';
              this.whatsNoteMessage = manageNotificationNoOption;
            } else {
              this.isRemainderWhatsappIntegration = 'Yes';
              this.whatsNoteMessage = manageNotificationYesOption;
            }
          } else {
            this.isRemainderWhatsappIntegration = 'No';
            this.whatsNoteMessage = manageNotificationNoOption;
          }

        }

        let tempdata1 = response.find(r => r.app_name == 'slack' && r.module_name == "leave-tracker");
        if (tempdata1 == null) {
          this.isRemainderSlackIntegration = 'No';
          this.slackUrlIntegrationOrNot = 'No';
          this.slackApprovalsNoteMessage = manageNotificationNoOption;
        } else {
          this.slackId = tempdata1.id;
          this.slackUrlIntegrationOrNot = 'Yes';
          if (this.isslackConfig == true) {
            if (tempdata1.is_paused == true) {
              this.isRemainderSlackIntegration = 'No';
              this.slackApprovalsNoteMessage = manageNotificationNoOption;
            } else {
              this.isRemainderSlackIntegration = 'Yes';
              this.slackApprovalsNoteMessage = manageNotificationYesOption;
            }
          } else {
            this.isRemainderSlackIntegration = 'No';
            this.slackApprovalsNoteMessage = manageNotificationNoOption;
          }
          
        }
      }
      this.spinner.hide();
    })
  }
  
  // To get the card class name from here
  getStyleClass(data) {
    if (data == true) {
      return 'pausedInnerCard';
    } else {
      return 'activeInnerCard';
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
      panelClass: 'custom-viewdialogstyle',
      data: { component: "Integration", status: statusData },
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
    localStorage.setItem("integrationModuleName", "leave-tracker");
    localStorage.setItem("lt-form", "integration");
    // if (data == "slack") {
    //   this.router.navigate(["/add-slack-integration"]);
    // }
    if (data == "whatsapp") {
      this.router.navigate(["/add-whatsapp-integration"]);
    }
  }


  //edit  integrations redirect to the form module
  editIntegration(id, name) {
    localStorage.setItem("integrationModuleName", "leave-tracker");
    localStorage.setItem("lt-form", "integration");
    // if (name == "slack") {
    //   this.router.navigate(['edit-slack-integration/' + id]);
    // }
    if (name == "whatsapp") {
      this.router.navigate(['edit-whatsapp-integration/' + id]);
    }
  }
  resetLeaveType() {
    this.isresetLeaveType = true;
  }
  resetHoliday() {
    const dialogRef = this.dialog.open(NoholidayActionComponent, {
      width: '33%',
      height: '230px',
      panelClass: 'custom-viewdialogstyle',
      data: { "deleteIds": this.getHolidayIds, "isresetHoliday": true }
    })
    dialogRef.afterClosed().subscribe(resp => {
      if (resp == "reset") {
        this.getHolidaysByOrgId();
      }
    });
  }
  resetCancelBtn() {
    this.getActiveLeaveTypeDetailsByOrgId();
    this.isresetLeaveType = false;
  }
  async DefaultLeaveTypeData() {
    this.spinner.show();
    if (this.leaveTypeDetails.length != 0) {
      await this.deleteLeaveIds();
      for await (let leaveData of this.leaveTypeData) {
        var formData = new FormData();
        var file = await this.getFileFromUrl(leaveData.image_file, 'image.jpg');
        formData.append("image", file);
       let data = {
          'created_by': localStorage.getItem('Id'),
          'leave_type': leaveData.leave_type,
          'start_date': this.startOfYear,
          'end_date': this.endOfYear,
          'year': this.leaveTypeYear,
          'available_days': leaveData.available_days,
          'image_name': leaveData.image_name,
          'timezone': leaveData.timezone
        }
        formData.append('org_id', localStorage.getItem("OrgId"));
        formData.append("data", JSON.stringify(data));
        this.settingsService.createLeaveTypeDetails(formData).subscribe(res => {
          if (res.map.statusMessage == "Success") {
            this.spinner.hide();
            this.getActiveLeaveTypeDetailsByOrgId();
            this.isresetLeaveType = false;
          }
        });
      }
    } else {
      this.spinner.show();
      for await (let leaveData of this.leaveTypeData) { 
        var formData = new FormData();
        var file = await this.getFileFromUrl(leaveData.image_file, 'image.jpg');
        formData.append("image", file);
        let data = {
          'created_by': localStorage.getItem('Id'),
          'leave_type': leaveData.leave_type,
          'start_date': this.startOfYear,
          'end_date': this.endOfYear,
          'year': this.leaveTypeYear,
          'available_days': leaveData.available_days,
          'image_name': leaveData.image_name,
          'timezone': leaveData.timezone
        }
        formData.append('org_id', localStorage.getItem("OrgId"));
        formData.append("data", JSON.stringify(data));
        this.settingsService.createLeaveTypeDetails(formData).subscribe(res => {
          if (res.map.statusMessage == "Success") {
            this.spinner.hide();
            this.getActiveLeaveTypeDetailsByOrgId();
            this.isresetLeaveType = false;
          }
        });
      }
    }
  }
  async deleteLeaveIds() {
    let data: Object = {
      "deleteIds": this.getAllLeaveTypeDetailsId,
    }
    this.settingsService.bulkdeleteLeaveTypes(data).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        this.utilsService.openSnackBarAC("Leave types deleted successfully", "OK");
      }
    });
  }
  async getFileFromUrl(url, name, defaultType = 'image/jpeg') {
    const response = await fetch(url);
    const data = await response.blob();
    return new File([data], name, {
      type: data.type || defaultType,
    });
  }

  //pagination size
  changePage(event) {
    this.pageSize = event.pageSize;
  }

  radioButtonClickedAppPopup(event) {
    this.yesOrNoLeavePopup = true;
    this.usersCheckBox = true;
    if(event.value == "Yes"){
      this.tcubeTodayNoteMessage = manageNotificationYesOption;
    } else {
      this.tcubeTodayNoteMessage = manageNotificationNoOption;
    }
  }


  async getTodayLeaveDetails() {
    this.selectIds = [];
    this.spinner.show();
    let data: Object = {
      "org_id": this.orgId,
      "module_name": "leave-tracker"
    }
    await this.reminderDetailsService.getReminderByOrgIdAndModule(data).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        let response = JSON.parse(data.map.data);
        this.userLeavePopupRemainder = response.find(r => r.key_primary == 'today-leaves');
        this.userLeaveListSlackRemainder = response.find(y => y.key_primary == 'slack-today-leave-userlist');
        if (this.userLeavePopupRemainder != null) {

          const jsonString  = this.userLeavePopupRemainder.active_users;
          const arrayValue = JSON.parse(jsonString);
          this.selectIds = arrayValue.map(item => item.emp_Id);
         
          this.yesOrNoLeavePopup = false;
          if (this.userLeavePopupRemainder.is_active == true) {
            this.isReminderForCheckin = 'Yes';
            this.tcubeTodayNoteMessage = manageNotificationYesOption;
          }
          else {
            this.isReminderForCheckin = 'No';
            this.tcubeTodayNoteMessage = manageNotificationNoOption;
          }
        } else {
          this.yesOrNoLeavePopup = false;
          this.isReminderForCheckin = 'No';
          this.tcubeTodayNoteMessage = manageNotificationNoOption;
        }

        if (this.userLeaveListSlackRemainder != null && this.isslackConfig && this.slackUrlIntegrationOrNot == 'Yes') {
          this.yesOrNoSlackApp = false;

          if (this.userLeaveListSlackRemainder.is_active == true && this.isslackConfig) {
            this.isReminderForCheckSlackApp = 'Yes';
            this.slackTodayNoteMessage =manageNotificationYesOption;
          } else {
            this.isReminderForCheckSlackApp = 'No';
            this.slackTodayNoteMessage = manageNotificationNoOption;
          }
        }
        else {
          this.yesOrNoSlackApp = false;
          this.isReminderForCheckSlackApp = 'No';
          this.slackTodayNoteMessage = manageNotificationNoOption;
        }
      }
    })
    this.spinner.hide();
  }

  geEmployeeDetailsByOrgId() {
    this.spinner.show();
    this.employeeDetails = [];
    let orgId = localStorage.getItem("OrgId");
    //before used method --> getActiveEmpDetailsByOrgId()
    //Here I have used the get ACTIVE EMPLOYEE DETAILS API call --> Means its get all user details under the Organization Id
    this.settingsService.getCustomActiveEmpDetailsByOrgID(orgId).subscribe(data => {
      let response: any[] = JSON.parse(data.map.data);
      this.employeeDetails = response;
     
      if(this.userLeavePopupRemainder){
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
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
    })
    setTimeout(() => {
      this.spinner.hide();
    }, 2000);
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
    this.usersCheckBox = this.yesOrNoLeavePopup = this.selectIds === array ? false : true;
      
    this.allSelected = this.userList.length === this.employeeDetails.length ? true : false;
      
  }

  @ViewChild('leaveselect', { static: false }) select: MatSelect; 
  allSelected = false;
  toggleAllSelection() {
    if (this.allSelected) {
      this.select.options.forEach((item: MatOption) => item.select());
    } else {
      this.select.options.forEach((item: MatOption) => item.deselect());
    }
  }

  todayLeavesCreateOrUpdate() {
    this.spinner.show();
    let OrgId = localStorage.getItem("OrgId");
    let ischeckInOrNot;
    if (this.isReminderForCheckin == 'Yes') {
      ischeckInOrNot = true;
    } else if (this.isReminderForCheckin == 'No') {
      ischeckInOrNot = false;
      this.userList = [];
    }
    if (this.userLeavePopupRemainder == null) {
      let data: Object = {
        "org_id": OrgId,
        "module_name": 'leave-tracker',
        "key_primary": 'today-leaves',
        "is_active": ischeckInOrNot,
        "active_users":JSON.stringify(this.userList)
      }
      this.reminderDetailsService.createReminderWithoutZone(data).subscribe(data => {
        if (data.map.statusMessage == "Success") {
          this.utilsService.openSnackBarAC("App notification updated successfully", "OK");
          this.getTodayLeaveDetails();
          this.spinner.hide();
        }
        else {
          this.utilsService.openSnackBarMC("Failed to update app notification", "OK");
          this.spinner.hide();
        }
      })
    } else {
      let data: Object = {
        "org_id": this.orgId,
        // "emp_id" : this.empId,
        "id": this.userLeavePopupRemainder.id,
        "module_name": 'leave-tracker',
        "key_primary": 'today-leaves',
        "is_active": ischeckInOrNot,
        "active_users":JSON.stringify(this.userList)
      }
      this.reminderDetailsService.updateAttendanceReminder(data).subscribe(data => {
        if (data.map.statusMessage == "Success") {
          this.utilsService.openSnackBarAC("App notification updated successfully", "OK");
          this.getTodayLeaveDetails();
          this.spinner.hide();
        }
        else {
          this.utilsService.openSnackBarMC("Failed to app notification", "OK");
          this.spinner.hide();
        }

      })
    }
  }

  //today leave user list in slack application

  todayLeavesSlackAppCreateOrUpdate() {
    this.spinner.show();
    let OrgId = localStorage.getItem("OrgId");
    let ischeckInOrNot;
    if (this.isReminderForCheckSlackApp == 'Yes') {
      ischeckInOrNot = true;
    } else if (this.isReminderForCheckSlackApp == 'No') {
      ischeckInOrNot = false;
    }
    if (this.userLeaveListSlackRemainder == null) {
      let data: Object = {
        "org_id": OrgId,
        "module_name": 'leave-tracker',
        "key_primary": 'slack-today-leave-userlist',
        "is_active": ischeckInOrNot,
      }
      this.reminderDetailsService.createReminderWithoutZone(data).subscribe(data => {
        if (data.map.statusMessage == "Success") {
          if (this.slackUrlIntegrationOrNot == 'Yes') {
            this.utilsService.openSnackBarAC("Slack notification updated successfully", "OK");
            // this.getReminderDetails();
            this.getTodayLeaveDetails();
          } else {
            this.utilsService.openSnackBarMC("Failed to update, please check the slack integration", "Ok");
            this.getTodayLeaveDetails();
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
        "id": this.userLeaveListSlackRemainder.id,
        "module_name": 'leave-tracker',
        "key_primary": 'slack-today-leave-userlist',
        "is_active": ischeckInOrNot,
      }
      this.reminderDetailsService.updateAttendanceReminder(data).subscribe(data => {
        if (data.map.statusMessage == "Success") {
          if (this.slackUrlIntegrationOrNot == 'Yes') {
            this.utilsService.openSnackBarAC("Changes updated successfully", "OK");
            this.getTodayLeaveDetails();
          }
          else {
            this.utilsService.openSnackBarMC("Failed to update, please check the slack integration", "Ok");
            this.getTodayLeaveDetails();
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

  mailNotifyData: any;

  radioButtonClickedSlackApp(event: any) {
    this.yesOrNoSlackApp = true;
    if(event.value == "Yes"){
      this.slackTodayNoteMessage = manageNotificationYesOption;
    } else {
      this.slackTodayNoteMessage = manageNotificationNoOption;
    }
  }


  radioButtonClickedSlackIntegration(event: any, module: string) {
    if(module=="leave-tracker"){
      this.yesOrNoSlackIntegration = true;
      if(event.value == "Yes"){
        this.slackApprovalsNoteMessage = manageNotificationYesOption;
      } else {
        this.slackApprovalsNoteMessage = manageNotificationNoOption;
      }
    }else{
      this.yesOrNoSlack = true;
      if(event.value == "Yes"){
        this.ApprovalsNoteMessage = manageNotificationYesOption;
      } else {
        this.ApprovalsNoteMessage = manageNotificationNoOption;
      }
    }    
   
  }

  yesOrNoWhatsappIntegration: any = false;
  radioButtonClickedWhatsappIntegration(event: any) {
    this.yesOrNoWhatsappIntegration = true;
    if(event.value == "Yes"){
      this.whatsNoteMessage = manageNotificationYesOption;
    } else {
      this.whatsNoteMessage = manageNotificationNoOption;
    }
   
  }

  radioButtonClickedManageMail(event: any) {
    this.yesOrNoMailConfig = true;
    if(event.value == "Yes"){
      this.mailNoteMessage = manageNotificationYesOption;
    } else {
      this.mailNoteMessage = manageNotificationNoOption;
    }
  }

  SaveOrUpdateLeaveTrackerMailConfig() {
    if (this.mailNotifyData == null) {
      this.spinner.show();
      let OrgId = localStorage.getItem("OrgId");
      let data: Object = {
        org_id: OrgId,
        app: "mail",
        module: "leave-tracker",
      };
     
      this.manageIntegrationService.createIntegrationAcess(data).subscribe(
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
    else {
      this.spinner.show();
      let OrgId = localStorage.getItem("OrgId");
      let data: Object = {
        id: this.mailNotifyData.id,
        org_id: OrgId,
        app: "mail",
        module: "leave-tracker",
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
  // UsersDialog(){
  //   const dialogRef = this.dialog.open(UsersComponentComponent, {
  //     width: '30%',
  //     panelClass: 'custom-viewdialogstyle',
  //     data:{users:this.employeeDetails}
  //     // data: { id: intern_id },
  //   })
  //   dialogRef.afterClosed().subscribe(resp => {
  //   //   if(resp != undefined && resp != null){
  //   //   if (resp.data == true) {
  //   //     this.deleteUserDetail(id);
  //   //     // this.internshipDetails = [];
  //   //     // this.ngOnInit();
  //   //   }
  //   // }
  //   })
  // }
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
          this.getLeaveTrackerMailConfig();
        } else {
          this.isRemainderMailConfig = 'No';
          this.notifyDisable = true;
          this.ismailconfigured = false;
        }
        this.spinner.hide();
      },
      (error) => {
        this.router.navigate(["/404"]);
        this.spinner.hide();
      }
    );
  }



  getLeaveTrackerMailConfig() {
    this.spinner.show();
    let OrgId = localStorage.getItem("OrgId");
    let data: Object = {
      org_id: OrgId,
      app: "mail",
      module: "leave-tracker",
    };
    this.manageIntegrationService.getIntegrationAccessData(data).subscribe(
      (data) => {
       
        if (data.map.statusMessage == "Success") {
          this.yesOrNoMailConfig = false;
          let out = data.map.data;
          this.mailNotifyData = out;
          
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

  async SlackIntegrationPauseOrResume(isRemainderSlackIntegration: any, app: string) {
    // console.log(isRemainderSlackIntegration);
    this.spinner.show();
    let status: string;
    if (isRemainderSlackIntegration == 'Yes') {
      status = 'resumed'
    } else {
      status = 'paused';
    }
    let data: Object ={};
    if(app==="slackApprovals"){
      data = {
        "id":  this.slackApprovalsId,
        "status": status
      }
    }else{
      data = {
        "id": app == 'whatsapp' ? this.whatappIntId : this.slackId,
        "status": status
      }
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
        if(app==="slackApprovals" || app==="slack"){
          if (app==="slack") {
            this.yesOrNoSlackIntegration = false;
            this.spinner.hide();
          }
          else{
            this.yesOrNoSlack = false;
            this.spinner.hide();
          }
        }
        else{
          this.getActiveIntegrationDetailsByOrgId();
        }
        
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
        this.spinner.hide();
        // this.getActiveIntegrationDetailsByOrgId();
      }
    });
  }

  leave_date(dateValue: any) {
    let date = moment(dateValue).format('YYYY-MM-DD').toString();
    if (date >= this.currentDate) {
      return true;
    }
    else {
      return false;
    }
  }

}
