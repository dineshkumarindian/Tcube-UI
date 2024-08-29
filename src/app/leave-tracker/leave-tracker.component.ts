import { AnimateTimings } from '@angular/animations';
import { SelectionModel } from '@angular/cdk/collections';
import { Component, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { MatDatepicker, MatDatepickerInputEvent } from '@angular/material/datepicker';
import { MatDialog, } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
// import { color, map } from 'highcharts';
import moment from 'moment-timezone';
import { Moment } from 'moment-timezone';
import { NgxSpinnerService } from 'ngx-spinner';
import { ApprovedLeaveDetailsService } from '../services/approved-leave-details.service';
import { LeaveTrackerService } from '../services/leave-tracker.service';
import { SettingsService } from '../services/settings.service';
import { UtilService } from '../services/util.service';
import { ApproveRejectLeaveComponent } from './approve-reject-leave/approve-reject-leave.component';
import { CancelLeaveComponent } from './cancel-leave/cancel-leave.component';
import { noDataMessage } from '../util/constants';
import { NextPreviousYearRequestsComponent } from './next-previous-year-requests/next-previous-year-requests.component';
import * as tablePageOption from "../util/table-pagination-option";
import { ManageIntegrationService } from '../services/app-integration/manage-integration-service/manage-integration.service';
import * as $ from 'jquery';
import {ViewLeavetypeDialogComponent} from './view-leavetype-dialog/view-leavetype-dialog.component';


@Component({
  selector: 'app-leave-tracker',
  templateUrl: './leave-tracker.component.html',
  styleUrls: ['./leave-tracker.component.less']
})
export class LeaveTrackerComponent implements OnInit {

  noDataMsg = noDataMessage;
  leaveDetails: any[] = [];
  approveLeaveDetails: any[] = [];
  approvePendingLeaves: number;
  startOfYear: any;
  endOfYear: any;
  approveReject: Boolean = false;
  cancelLeaveComments: Boolean = false;
  leavetypeFilter: boolean = false;
  filterData: string;
  filterSection = new UntypedFormGroup({
    filterName: new UntypedFormControl('')
  });
  // @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  // @ViewChild(MatSort, { static: true }) sort: MatSort;
  // @ViewChild(MatSort,{static:true}) sort1:MatSort;
  // @ViewChild(MatSort,{static:true}) paginator1:MatPaginator;
  @ViewChildren(MatPaginator) paginator = new QueryList<MatPaginator>();
  @ViewChildren(MatSort) sort = new QueryList<MatSort>();

  // @ViewChildren(MatPaginator) paginator = new QueryList<MatPaginator>();
  // @ViewChildren(MatSort) sort = new QueryList<MatSort>();
  showPrevNxtDialogOnce: boolean = false;
  selection = new SelectionModel(true, []);
  dates: Date;
  datepicker: any;
  today_date: string;
  today_date_str: string;
  setDateStr: string;
  startingDate: any;
  endingDate: any;
  afterTwoYear: any;
  beforeTwoYear: any;
  disableStartDate: any;
  nextdisable: boolean = false;
  beforedisable: boolean = false;
  leaveTypeDetails: any[] = [];
  newLeaveTypeDetails: any[] = [];
  image_url: any;
  LeaveTypeArr: any[] = [];
  approvedCounts: any = [];
  holidayDetails: any[] = [];
  customTab: any;
  noDataMsgMyLeave: boolean = false;
  noDataMsgRequest: boolean = false;
  noDataMsgHoliday: boolean = false;
  leaveNoDataLength: number;
  tommorrow: any;
  lastday: any;
  currentDate: any;
  pageSize: number = 10;
  forMyLeaves: boolean = true;
  forRequests: boolean = false;
  forHolidays: boolean = false;

  approveLeave: any[] = [];
  otherLeave: any[] = [];
  requestLeaveLength: number;
  approveBadgeLength: boolean = true;
  leaveTypeData: any[] = [];
  tablePaginationOption: number[];
  isNotify: string = "No";
  // noDataMsg: boolean = false;

  constructor(
    private dialog: MatDialog,
    private spinner: NgxSpinnerService,
    private leaveTrackerService: LeaveTrackerService,
    private utilsService: UtilService,
    private router: Router,
    private settingsService: SettingsService,
    private domSanitizer: DomSanitizer,
    private approvedLeaveDetailsService: ApprovedLeaveDetailsService,
    private manageIntegrationService: ManageIntegrationService
  ) {

  }
  //color for leave type
  colorArray: any[] = ['#10ae8e', '#f3790d', '#328bf7', '#29796b', '#d56375', '#22c6d2', '#545454', '#a54cbc', '#724ece', '#d55250', '#453e3e', '#c6a52e', '#42930f', '#206e99', '#000000'];

  ngOnInit() {
    localStorage.removeItem('lt-date');
    this.startOfYear = moment().startOf('year').toDate();
    this.endOfYear = moment().endOf('year').toDate();
    this.LeaveTypeByOrgIdAndDates();
    // ------------- get colors colors arrray------------------------
    // for (let j = 0; j < 15; j++) {
    // var letters = '0123456789ABCDEF';
    //   var color = '#';
    //   for (var k = 0; k < 6; k++) {
    //     color += letters[Math.floor(Math.random() * 16)];
    //   }
    //   this.colorArray.push(color);
    // }
    // console.log(this.colorArray);

    this.startingDate = moment().startOf("year").format("DD-MM-YYYY");
    // console.log(this.startingDate);
    this.endingDate = moment().endOf("year").format("DD-MM-YYYY");
    this.customTab = localStorage.getItem("customTab");
    // console.log("customtab"+this.customTab);
    this.afterTwoYear = moment(this.startOfYear).add(1, 'year').format("DD-MM-YYYY").toString();
    this.beforeTwoYear = moment(this.startOfYear).subtract(2, 'year').format("DD-MM-YYYY").toString();
    this.datepicker = new UntypedFormControl(new Date());
    this.dates = new Date();
    this.currentDate = moment().startOf("day").toDate();

    // this.getapprovedLeaveCountsByEmpIdAndLTId();
    // this.getLeaveByReporter();

    this.getLeaveReportBadgeCount();
    // 
    if (this.customTab == "1") {
      this.getLeaveRequestDetailsCount();
      this.getLeaveReportBadgeCount();
      this.getLeaveByReporter();
      this.getslackDetails();
    }
    // this.getHolidaysByOrgId();

    this.getLeaveByEmp();
    this.getslackDetails();

    localStorage.removeItem("customTab");
    this.tommorrow = moment().add(1, 'days').format("YYYY-MM-DD").toString();
    this.lastday = moment().subtract(1, 'days').format("YYYY-MM-DD").toString();
    this.showPrevNxtDialogOnce = false;
    // this.countPreviousNextYearRequests();
    this.forMyLeaves = true;

  }

  displayedColumns: string[] = ['leave_type','start_date', 'end_date', 'total_days','Approval_status_date','status'];
  dataSource = new MatTableDataSource();
  displayedColumns2: string[] = ['emp_name', 'leave_type', 'applied_leave_date','start_date', 'end_date', 'total_days', 'status'];
  dataSource2 = new MatTableDataSource();
  displayedColumns3: string[] = ['leave_name', 'leave_date'];
  dataSource3 = new MatTableDataSource();
  filterDataSource: any;
  filterPagination: number;

  tempData: any[];
  Leave_count: boolean = false;

  // get details by requester id based
  leavetypecard: any[] = [];
  async getLeaveByEmp() {
    this.spinner.show();
    // console.log("getLeaveByEmp....");
    this.noDataMsgMyLeave = true;
    this.forMyLeaves = true;
    this.forRequests = false;
    this.forHolidays = false;
    this.filterDataSource = new MatTableDataSource();
    this.filterPagination = 0;
    this.pageSize = 10;
    this.leaveDetails = [];
    let data: Object = {
      "emp_id": localStorage.getItem('Id'),
      "org_id": localStorage.getItem("OrgId"),
      "start_date": this.startOfYear,
      "end_date": this.endOfYear,
    }
    // console.log(data);
    await this.leaveTrackerService.getActiveleaveByEmpIdAndYearByOrgid(data).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        let response: any[] = JSON.parse(data.map.data);
        this.tablePaginationOption = tablePageOption.tablePaginationOption(response.length);

        this.leaveNoDataLength = response.length;

        //<------fix the leave type color--->
        this.leaveDetails = [];
        let leaveTypesAvailableData: any = [];
        let remainMyLeaves: any[] = [];
        for (let i = 0; i < response.length; i++) {
          remainMyLeaves.push(response[i].leave_type.toLowerCase());
        }

        let uniqueChars = [...new Set(remainMyLeaves)];

        for (let i = 0; i < response.length; i++) {
          for (let j = 0; j < uniqueChars.length; j++) {
            if (response[i].leave_type.toLowerCase() == uniqueChars[j].toLowerCase()) {
              let date = response[i].start_date;
              let dateValue = new Date(date);
              leaveTypesAvailableData.push({ ...response[i], 'color': this.colorArray[j] });
              break;
            }
          }
        }
        this.leaveDetails = leaveTypesAvailableData;

        for (let j = 0; j < this.leaveDetails.length; j++) {
          let date = this.leaveDetails[j].start_date;
          let dateValue = new Date(date);
          this.leaveDetails[j].start_date = dateValue;
        }
        // console.log(this.leaveDetails);
        this.dataSource = new MatTableDataSource(this.leaveDetails);
        this.dataSource.sort = this.sort.toArray()[0];
        this.dataSource.paginator = this.paginator.toArray()[0];
        this.filterDataSource = this.dataSource;
        // console.log(this.filterDataSource);
        setTimeout(() => {
          this.spinner.hide();
        }, 500);

      }
      else {
        setTimeout(() => {
          this.spinner.hide();
        }, 500);
      }
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
    });
  }

  getLeaveReportBadgeCount() {
    this.spinner.show();
    // console.log("getLeaveReportBadgeCount....entry");
    this.approveBadgeLength = true;
    let data: Object = {
      "reporter": localStorage.getItem('Id'),
      "org_id": localStorage.getItem("OrgId"),
      "start_date": this.startOfYear,
      "end_date": this.endOfYear,
    }
    this.leaveTrackerService.getRequestApproveLeaveCount(data).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        let response = JSON.parse(data.map.data);
        if (response == 0) {
          this.approveBadgeLength = true;
        } else {
          this.approveBadgeLength = false;
          this.approvePendingLeaves = response;
        }

      }
    })

  }

  async getLeaveRequestDetailsCount() {
    this.spinner.show();
    // console.log("getLeaveRequestDetailsCount.....");
    let data: Object = {
      "reporter": localStorage.getItem('Id'),
      "org_id": localStorage.getItem("OrgId"),
      "start_date": this.startOfYear,
      "end_date": this.endOfYear,
    }
    await this.leaveTrackerService.getRequestLeaveDetailsCount(data).subscribe(data => {
      if (data.map.statusMessage = "Success") {
        let response = JSON.parse(data.map.data);
        this.tablePaginationOption = tablePageOption.tablePaginationOption(response);
        this.requestLeaveLength = response;

      }
    })
  }
  indexPosition: any = 0;

  // get details by approver id based
  async getLeaveByReporter() {
    this.spinner.show();
    // this.approveLeave = [];
    // this.approveBadgeLength = true;
    this.forMyLeaves = false;
    this.forRequests = true;
    this.forHolidays = false;
    // this.requestLeaveLength = 0;
    this.approveLeaveDetails = [];
    this.pageSize = 10;
    this.indexPosition = 0;
    let data: Object = {
      "reporter": localStorage.getItem('Id'),
      "org_id": localStorage.getItem("OrgId"),
      "start_date": this.startOfYear,
      "end_date": this.endOfYear,
      "page_size": this.pageSize,
      "index_position": this.indexPosition,
      // "index_size_value":this.pageSize
    }

    await this.leaveTrackerService.getRequestLeaveDetailsPaginationCount(data).subscribe(data => {

      if (data.map.statusMessage == "Success") {
        this.approveLeaveDetails = [];
        let response: any[] = JSON.parse(data.map.data);
        for (let i = 0; i < response.length; i++) {
          this.approveLeaveDetails.push(response[i].map);
        }
        // console.log(this.approveLeaveDetails);
        this.dataSource2 = new MatTableDataSource(this.approveLeaveDetails);
        this.dataSource2.sort = this.sort.toArray()[1];

        setTimeout(() => {
          this.spinner.hide();
        });
      }

    }
      , (error) => {
        this.router.navigate(["/404"]);
        this.spinner.hide();
      })

  }

  future_dates: any = [];
  previousdates: any = [];
  holiday_dates: any = [];
  formated_date: any;
  getHolidaysByOrgId() {
    this.spinner.show();
    // debugger;
    this.forMyLeaves = false;
    this.forRequests = false;
    this.forHolidays = true;
    this.holidayDetails = [];
    this.future_dates = [];
    this.previousdates = [];
    this.pageSize = 10;
    this.noDataMsgHoliday = false;
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
        this.tablePaginationOption = tablePageOption.tablePaginationOption(response.length);
        this.holidayDetails = response;
        if (this.holidayDetails.length == 0) {
          this.noDataMsgHoliday = true;
        }
        for (let i = 0; i < this.holidayDetails.length; i++) {
          this.formated_date = moment(this.holidayDetails[i].leave_date).format("YYYY-MM-DD");
          if (this.formated_date >= moment(new Date()).format("YYYY-MM-DD")) {
            this.future_dates.push(this.holidayDetails[i]);
          }
        }
        for (let i = 0; i < this.holidayDetails.length; i++) {
          this.formated_date = moment(this.holidayDetails[i].leave_date).format("YYYY-MM-DD");
          if (this.formated_date <= this.lastday) {
            this.previousdates.push(this.holidayDetails[i]);
          }
        }
        this.holiday_dates = this.future_dates.concat(this.previousdates);
        this.holiday_dates = this.holiday_dates.map(function (day) {
          day.formated_date = moment(day.leave_date).format("DD-MM-YYYY");
          return day;
        });
        this.dataSource3 = new MatTableDataSource(this.holiday_dates);
        this.dataSource3.sort = this.sort.toArray()[2];
        this.dataSource3.paginator = this.paginator.toArray()[2];
      }
      this.spinner.hide();
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
    })
  }
  
  formated_date1: any;
  leave_date(data: any) {
    this.formated_date1 = moment(data).format("YYYY-MM-DD");
    if (this.formated_date1 <= this.lastday) {
      return true;
    }
    else {
      return false
    }
  }

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  masterToggle() {
    if (this.isAllSelected()) {
      this.selection.clear();
      return;
    } else {
      this.dataSource.data.forEach(row => this.selection.select(row));
    }
  }

  // approve or reject the request
  openDialog(data, details) {
    // console.log(data);
    let screenWidth = screen.availWidth;
    if (screenWidth <= 750) {
      const dialogRef = this.dialog.open(ApproveRejectLeaveComponent, {
        width: '90%',
        height: '222px',
        panelClass: 'custom-viewdialogstyle',
        data: { data: data, details: details }
      });
      dialogRef.afterClosed().subscribe(
        async resp => {
          // this.ngOnInit();
          await this.getLeaveByReporter();
          this.getLeaveReportBadgeCount();
          this.getLeaveRequestDetailsCount();
          // this.LeaveTypeByOrgIdAndDates();
          // this.getLeaveByEmp();


          // this.getHolidaysByOrgId();
          this.approveReject = false;
        }
      );
    } else {
      const dialogRef = this.dialog.open(ApproveRejectLeaveComponent, {
        width: '30%',
        height: '222px',
        panelClass: 'custom-viewdialogstyle',
        data: { data: data, details: details }
      });
      dialogRef.afterClosed().subscribe(
        async resp => {
          // this.ngOnInit();
          await this.getLeaveByReporter();
          this.getLeaveReportBadgeCount();
          this.getLeaveRequestDetailsCount();
          // this.LeaveTypeByOrgIdAndDates();
          // this.getLeaveByEmp();


          // this.getHolidaysByOrgId();
          this.approveReject = false;
        }
      );
    }
  }

  // cancel the leave request
  cancelDialog(id, element) {
    let cancelLeave = "cancelLeave";
    let screenWidth = screen.availWidth;
    if (screenWidth <= 750) {
      const dialogRef = this.dialog.open(CancelLeaveComponent, {
        width: '90%',
        height: '222px',
        panelClass: 'custom-viewdialogstyle',
        data: { "id": id, "cancelLeave": cancelLeave, "details": element }
      });
      dialogRef.afterClosed().subscribe(
        resp => {
          //  this.getLeaveByEmp();
          // this.ngOnInit();
          this.getLeaveByEmp();
          this.LeaveTypeByOrgIdAndDates();
          this.getLeaveReportBadgeCount();
          // this.getLeaveRequestDetailsCount();
          this.getLeaveByReporter();

          // this.getHolidaysByOrgId();
          // this.approveReject = false ;
        }
      );
    } else {
      const dialogRef = this.dialog.open(CancelLeaveComponent, {
        width: '30%',
        height: '222px',
        panelClass: 'custom-viewdialogstyle',
        data: { "id": id, "cancelLeave": cancelLeave, "details": element }
      });
      dialogRef.afterClosed().subscribe(
        resp => {
          // this.ngOnInit();
          this.getLeaveByEmp();
          this.LeaveTypeByOrgIdAndDates();
          this.getLeaveReportBadgeCount();
          this.getLeaveByReporter();
          // this.getHolidaysByOrgId();
          // this.approveReject = false ;
        }
      );
    }
  }

  //approved leave cancel
  approvedCancelDialog(id, element) {
    let cancelLeave = "approveLeave"
    let screenWidth = screen.availWidth;
    if (screenWidth <= 750) {
      const dialogRef = this.dialog.open(CancelLeaveComponent, {
        width: '90%',
        height: '222px',
        panelClass: 'custom-viewdialogstyle',
        data: { "id": id, "cancelLeave": cancelLeave, "details": element }
      });
      dialogRef.afterClosed().subscribe(
        resp => {
          //  this.getLeaveByEmp();
          // this.ngOnInit();
          this.LeaveTypeByOrgIdAndDates();
          this.getLeaveByEmp();
          this.getLeaveReportBadgeCount();
          this.getLeaveByReporter();
          // this.approveReject = false ;
        }
      );
    } else {
      const dialogRef = this.dialog.open(CancelLeaveComponent, {
        width: '30%',
        height: '222px',
        panelClass: 'custom-viewdialogstyle',
        data: { "id": id, "cancelLeave": cancelLeave, "details": element }
      });
      dialogRef.afterClosed().subscribe(
        resp => {
          // this.ngOnInit();
          this.LeaveTypeByOrgIdAndDates();
          this.getLeaveByEmp();
          this.getLeaveReportBadgeCount();
          this.getLeaveByReporter();
          // this.approveReject = false ;
        }
      );
    }
  }

  openButtonds() {
    this.approveReject = true;
  }
  cancelBtn() {
    this.approveReject = false;
  }

  nextdate() {
    this.beforedisable = false;
    this.dates = moment(this.dates).add(1, 'years').toDate();
    this.today_date = moment(this.dates).format("YYYY-MM-DD");
    this.startingDate = moment(this.dates).startOf("year").format("DD-MM-YYYY");
    this.endingDate = moment(this.dates).endOf("year").format("DD-MM-YYYY");
    this.disableStartDate = moment(this.dates).startOf("year").format("DD-MM-YYYY").toString();
    this.startOfYear = moment(this.dates).startOf("year").toDate();
    this.endOfYear = moment(this.dates).endOf("year").toDate();
    this.LeaveTypeByOrgIdAndDates();
    // this.getActiveLeaveTypeByOrgIdAndDates
    this.getLeaveReportBadgeCount();
    this.getLeaveRequestDetailsCount();
    this.getLeaveByEmp();
    this.getLeaveByReporter();
    this.getHolidaysByOrgId();

    if (this.disableStartDate == this.afterTwoYear) {
      this.nextdisable = true;
    }
    else {
      this.nextdisable = false;
    }
    this.countPreviousNextYearRequests();
  }

  previousdate() {
    this.nextdisable = false;
    this.dates = moment(this.dates).subtract(1, 'years').toDate();
    this.startingDate = moment(this.dates).startOf("year").format("DD-MM-YYYY");
    this.endingDate = moment(this.dates).endOf("year").format("DD-MM-YYYY");
    this.disableStartDate = moment(this.dates).startOf("year").format("DD-MM-YYYY").toString();
    this.startOfYear = moment(this.dates).startOf("year").toDate();
    this.endOfYear = moment(this.dates).endOf("year").toDate();
    this.LeaveTypeByOrgIdAndDates();
    // this.getActiveLeaveTypeByOrgIdAndDates();
    this.getLeaveReportBadgeCount();
    this.getLeaveRequestDetailsCount();
    // this.leaveDetails = [];
    this.getLeaveByEmp();
    this.getLeaveByReporter();
    this.getHolidaysByOrgId();
    if (this.disableStartDate == this.beforeTwoYear) {
      this.beforedisable = true;
    }
    else {
      this.beforedisable = false;
    }
    this.countPreviousNextYearRequests();
  }
  newDetailsLength: any;
  async LeaveTypeByOrgIdAndDates() {

    this.spinner.show();

    this.newLeaveTypeDetails = [];
    this.LeaveTypeArr = [];
    this.leaveTypeData = [];
    this.newDetailsLength = 0;
    let zone = moment.tz.guess();
    let data: Object = {
      "org_id": localStorage.getItem("OrgId"),
      "start_date": this.startOfYear,
      "end_date": this.endOfYear,
      "timezone": zone,
    }
    await this.settingsService.getActiveLeaveTypeByOrgIdAndDates(data).subscribe(async data => {
      if (data.map.statusMessage == "Success") {
        let response = JSON.parse(data.map.data);
        this.newLeaveTypeDetails = response.reverse();

        this.newDetailsLength = this.newLeaveTypeDetails.length;

        for (var i = 0; i < this.newLeaveTypeDetails.length; i++) {
          this.LeaveTypeArr.push(this.newLeaveTypeDetails[i].id);
          this.leaveTypeData.push({ "id": this.newLeaveTypeDetails[i].id, "leave_type": this.newLeaveTypeDetails[i].leave_type });

          if (this.newLeaveTypeDetails[i].image != undefined) {
            let stringArray = new Uint8Array(this.newLeaveTypeDetails[i].image);
            const STRING_CHAR = stringArray.reduce((data, byte) => {
              return data + String.fromCharCode(byte);
            }, '');
            let base64String = btoa(STRING_CHAR);
            this.image_url = this.domSanitizer.bypassSecurityTrustUrl("data:image/jpeg;base64," + base64String);
            this.newLeaveTypeDetails[i].image = this.image_url;
          }

        }

        this.getActiveLeaveTypeByOrgIdAndDatesForData();

      }
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
    })
  }
  leavebg(data: any) {
    if (data.substr(data.length - 4) == ".png") {
      return true;
    }
    else {
      return false;
    }
  }
  // carosuelLeavetypeDetails: any[];

  async getActiveLeaveTypeByOrgIdAndDatesForData() {
    this.approvedCounts = [];
    // this.spinner.show();
    this.tempData = [];
    let data: Object = {
      "emp_id": localStorage.getItem('Id'),
      "org_id": localStorage.getItem("OrgId"),
      "start_date": this.startOfYear,
      "end_date": this.endOfYear,
    }
    await this.leaveTrackerService.getActiveleaveByEmpIdAndYearByOrgid(data).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        let response = JSON.parse(data.map.data);
        // console.log(response);
        for (let i = 0; i < response.length; i++) {
          if (response[i].approval_status == "Approved") {
            this.tempData.push(response[i]);
          }
        }
      }
      for (let i = 0; i < this.newLeaveTypeDetails.length; i++) {
        let count = 0;
        for (let j = 0; j < this.tempData.length; j++) {
          if (this.newLeaveTypeDetails[i].leave_type == this.tempData[j].leave_type) {
            count = count + this.tempData[j].total_days;
            // this.approvedCounts.push({ "id": this.LeaveTypeArr[i], "count": count });
          }
        }
        this.approvedCounts.push({ "id": this.LeaveTypeArr[i], "count": count });
        // this.approvedCounts.push({ "id": this.LeaveTypeArr[i], "count": count });
      }
      let sum = 0;
      for (let x = 0; x < this.newLeaveTypeDetails.length; x++) {
        sum = sum + this.newLeaveTypeDetails[x].available_days;
        for (let y = 0; y < this.approvedCounts.length; y++) {
          if (this.newLeaveTypeDetails[x].id == this.approvedCounts[y].id) {
            this.newLeaveTypeDetails[x].available_days = this.newLeaveTypeDetails[x].available_days - this.approvedCounts[y].count;
            this.newLeaveTypeDetails[x].counts = this.approvedCounts[y].count;
          }
        }
      }
      if (sum > 0) {
        this.Leave_count = true;

      }
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
    });
  }

  viewAllLeaveTypes() {
    const dialogRef = this.dialog.open(ViewLeavetypeDialogComponent, {
      width: '45%',
      panelClass: 'custom-viewdialogstyle',
      data: {leavetypes:this.newLeaveTypeDetails }
    });
    dialogRef.afterClosed().subscribe(
      async resp => {});

  }


  drawerData: any = [];
  url: any;
  isGettingEMpImage: boolean = true;
  empObjWithImg: [] = [];
  setDrawerDetails(details) {
    this.isGettingEMpImage = true;
    this.url = '';
    this.drawerData = details;
    try {
      this.drawerData.half_full_day = JSON.parse((this.drawerData).half_full_day);
    } catch (error) { }
    let data = {
      "emp_ids": [details.emp_id],
    }
    this.settingsService.getEmployeeImagesByIds(data).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        this.empObjWithImg = JSON.parse(data.map.data).map;
        if (this.empObjWithImg[this.drawerData.emp_id] != '') {
          let stringArray = new Uint8Array(this.empObjWithImg[this.drawerData.emp_id]);
          const STRING_CHAR = stringArray.reduce((data, byte) => {
            return data + String.fromCharCode(byte);
          }, '');
          let base64String = btoa(STRING_CHAR);
          this.url = this.domSanitizer.bypassSecurityTrustUrl("data:image/jpeg;base64," + base64String);
        } else {
          this.url = 'assets/images/user_person.png';
        }
        this.isGettingEMpImage = false;
      } else {
        this.url = 'assets/images/user_person.png';
        this.isGettingEMpImage = false;
      }
    }, (err) => {
      this.url = 'assets/images/user_person.png';
      this.isGettingEMpImage = false;
    });
  }

  resetDrawerDetails() {
    this.url = 'assets/images/user_person.png';
    this.isGettingEMpImage = false;
  }

  getStatusClass(data) {
    if (data == "Approved") {
      return "approvedStatus";
    } else if (data == "Rejected") {
      return "rejectededStatus";
    } else if (data == "Pending") {
      return "pendingStatus";
    }
  }

  clickApplyLeave() {
    this.router.navigate(['/applyleave']);
  }

  // }
  index: any;
  selectTabLeaveTracker(event: any) {
    this.leavetypeFilter = false;
    this.index = event.index;
    // console.log(index);
    if (0 == this.index) {
      this.getLeaveByEmp();
      this.filterDataSource = this.dataSource;
      this.filterPagination = this.index;
      this.filterSection.controls['filterName'].reset();
    } else if (1 == this.index) {
      this.getLeaveRequestDetailsCount();
      this.getLeaveReportBadgeCount();
      this.getLeaveByReporter();
      this.getslackDetails();

      this.filterDataSource = this.dataSource2;
      this.filterPagination = this.index;
      this.filterSection.controls['filterName'].reset();
    } else if (2 == this.index) {
      this.getHolidaysByOrgId();
      this.filterDataSource = this.dataSource3;
      this.filterPagination = this.index;
      this.filterSection.controls['filterName'].reset();
    }


  }
  //pagination size
  changePage(event: any) {
    this.pageSize = event.pageSize;
  }
  async changePageReportDetails(event: any) {
    this.spinner.show();

    this.approveLeaveDetails = [];
    this.indexPosition = event.pageIndex;
    this.pageSize = event.pageSize;
    let indexsizeValue = this.indexPosition * this.pageSize;

    let data: Object = {
      "reporter": localStorage.getItem('Id'),
      "org_id": localStorage.getItem("OrgId"),
      "start_date": this.startOfYear,
      "end_date": this.endOfYear,
      "page_size": this.pageSize,
      "index_position": this.indexPosition,
      // "index_size_value":indexsizeValue
    }

    await this.leaveTrackerService.getRequestLeaveDetailsPaginationCount(data).subscribe(data => {

      if (data.map.statusMessage == "Success") {

        this.approveLeaveDetails = [];
        let response: any[] = JSON.parse(data.map.data);

        for (let i = 0; i < response.length; i++) {
          this.approveLeaveDetails.push(response[i].map);
        }

        this.dataSource2 = new MatTableDataSource(this.approveLeaveDetails);
        this.dataSource2.sort = this.sort.toArray()[1];

        this.spinner.hide();
      }
    })

  }


  //filter for myleave,request,holidays
  applyFilterLeavetype(event: Event) {
    this.leavetypeFilter = false;
    this.filterData = (event.target as HTMLInputElement).value;
    const filterValue = (event.target as HTMLInputElement).value;
    if (this.forMyLeaves) {
      this.dataSource.filter = filterValue.trim().toLowerCase();
      if (this.dataSource.filteredData.length == 0) {
        this.leavetypeFilter = true;
      }
      if (this.dataSource.paginator) {

        this.dataSource.paginator = this.paginator.toArray()[this.filterPagination];
      }
    } else if (this.forRequests) {
      this.dataSource2.filter = filterValue.trim().toLowerCase();
      if (this.dataSource2.filteredData.length == 0) {
        this.leavetypeFilter = true;
      }
      if (this.dataSource2.paginator) {

        this.dataSource2.paginator = this.paginator.toArray()[this.filterPagination];
      }
    } else if (this.forHolidays) {
      this.dataSource3.filter = filterValue.trim().toLowerCase();
      if (this.dataSource3.filteredData.length == 0) {
        this.leavetypeFilter = true;
      }
      if (this.dataSource3.paginator) {

        this.dataSource3.paginator = this.paginator.toArray()[this.filterPagination];
      }
    }
  }

  //func to set the laevetype year in LS and redirect to apply leave form
  applyLeave() {
    localStorage.setItem('lt-date', this.startOfYear);
    setTimeout(() => {
      this.router.navigate(["/applyleave"]);
    }, 500);
  }

  //to fetch the previous and next year request count 
  // to show it in th{e badge in the date carousel
  prevAndNext_SOY: Date;
  prevAndNext_EOY: Date;
  prev: boolean;
  nxt: boolean;
  countPreviousNextYearRequests() {
    this.hideNxtBadge = true;
    this.hidePrevBadge = true;
    if (!this.showPrevNxtDialogOnce) {
      this.previousYearCnt();
      this.nextYearCnt();
    }

  }

  previousYearRequestCnt: number = 0;
  nextYearRequestCnt: number = 0;
  hidePrevBadge: boolean;

  //fetch the prevoius year request count
  previousYearCnt() {
    this.previousYearRequestCnt = 0;

    //for getting requests count for previous year 
    let previousYear = moment(this.startOfYear).subtract(1, 'years').toDate();
    this.prevAndNext_SOY = moment(previousYear).startOf("year").toDate();
    this.prevAndNext_EOY = moment(previousYear).endOf("year").toDate();
    let data: Object = {
      "reporter": localStorage.getItem('Id'),
      "org_id": localStorage.getItem("OrgId"),
      "start_date": this.prevAndNext_SOY,
      "end_date": this.prevAndNext_EOY,
    }
    this.leaveTrackerService.getActiveleaveByReporterIdAndYearByOrgid(data).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        let response = JSON.parse(data.map.data);
        this.approveLeaveDetails = response;
        let count = this.approveLeaveDetails.filter(data => data.approval_status == 'Pending');
        this.previousYearRequestCnt = count.length;
        if (this.previousYearRequestCnt == 0) {
          this.hidePrevBadge = true;
        }
        else {
          this.previousNextYearLeaveDialog("previous year", this.previousYearRequestCnt)
          this.hidePrevBadge = false;
        }
      }

    })
  }

  //fetch the next year request count
  hideNxtBadge: boolean;
  nextYearCnt() {
    this.nextYearRequestCnt = 0;
    //for getting requests count for next year
    let nextYear = moment(this.startOfYear).add(1, 'years').toDate();
    this.prevAndNext_SOY = moment(nextYear).startOf("year").toDate();
    this.prevAndNext_EOY = moment(nextYear).endOf("year").toDate();
    let data: Object = {
      "reporter": localStorage.getItem('Id'),
      "org_id": localStorage.getItem("OrgId"),
      "start_date": this.prevAndNext_SOY,
      "end_date": this.prevAndNext_EOY,
    }
    this.leaveTrackerService.getActiveleaveByReporterIdAndYearByOrgid(data).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        let response = JSON.parse(data.map.data);
        this.approveLeaveDetails = response;
        let count = this.approveLeaveDetails.filter(data => data.approval_status == 'Pending');
        this.nextYearRequestCnt = count.length;
        if (this.nextYearRequestCnt == 0) {
          this.hideNxtBadge = true;
        }
        else {
          this.previousNextYearLeaveDialog("next year", this.nextYearRequestCnt);
          this.hideNxtBadge = false;
        }
      }

    })
  }

  previousNextYearLeaveDialog(year, count) {
    const dialogRef = this.dialog.open(NextPreviousYearRequestsComponent, {
      width: '25%',
      height: '145px',
      panelClass: 'custom-viewdialogstyle',
      data: { year: year, count: count }
    });
    dialogRef.afterClosed().subscribe(
      resp => {
        this.showPrevNxtDialogOnce = true;
        if (resp.data === "previous year") {
          this.previousdate();
        }
        if (resp.data === "next year") {
          this.nextdate();
        }
      }
    );
  }
  slackIntegrationDetails: any;
  slack_Integration: boolean = false;
  //get slack details
  async getslackDetails() {
    // this.spinner.show();
    let data: Object = {
      "org_id": localStorage.getItem("OrgId"),
      "module_name": "leave-tracker",
      "reason": "approve-leave",
      "app_name": "slack"
    }
    await this.leaveTrackerService.getslackDetails(data).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        let response = data.map.data;
        this.slackIntegrationDetails = response;
      } else if (data.map.statusMessage == "Error") {
      }
      // this.spinner.hide();
      this.getSlackConfig();
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
    })
  }
  async getSlackConfig() {
    // this.spinner.show();
    let OrgId = localStorage.getItem("OrgId");
    let data: Object = {
      org_id: OrgId,
      app: "slack",
      module: "all",
    };
    await this.manageIntegrationService.getIntegrationAccessData(data).subscribe(
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
        if (this.slackIntegrationDetails.is_paused == false && this.isNotify === "Yes") {
          this.slack_Integration = true;
        }

        // this.spinner.hide();
      },
      (error) => {
        this.router.navigate(["/404"]);
        this.spinner.hide();
      }
    );
  }
  slackNotify: boolean;
  async Resend_Notification(Leave_data, details) {
    // send messages to slack
    if (this.slackIntegrationDetails.is_paused == false && this.isNotify === "Yes") {
      let details1 = await this.leaveTrackerService.createLeaveTemplate(details, Leave_data);
      await this.leaveTrackerService.sendToSlack(this.slackIntegrationDetails.url, JSON.stringify(details1)).subscribe(async data => {
        if (data === "ok") {
          this.slackNotify = true;
        }
        else {
          this.slackNotify = false;
        }
        // ***** Update on slack notifiaction sended**********
        let data1: Object = {
          "notificationId": details.id,
          "status": this.slackNotify,
        }
        await this.leaveTrackerService.updateSlackNotificationStatus(data1).subscribe(data => {
        });
        await this.utilsService.openSnackBarAC("Notification sended successfully", "OK");
        setTimeout(() => {
          if (Leave_data == "Approved leave cancelled") {
            this.ngOnInit();
          }
          else {
            this.getLeaveByReporter();
          }
        }, 500);

      }, async (error) => {
        this.slackNotify = false;
        // ***** When the slack notify failed**********
        let data1: Object = {
          "notificationId": details.id,
          "status": this.slackNotify
        }
        await this.leaveTrackerService.updateSlackNotificationStatus(data1).subscribe(data => {
        });
        await this.utilsService.openSnackBarMC("Failed to send notification please try after sometime", "OK");
        setTimeout(() => {
          if (Leave_data == "Approved leave cancelled") {
            this.ngOnInit();
          }
          else {
            this.getLeaveByReporter();
          }
        }, 500);
      });


    }
  }
}
