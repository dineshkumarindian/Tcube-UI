import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { NavigationEnd, Router } from '@angular/router';
import moment from 'moment-timezone';
import { NgxSpinnerService } from 'ngx-spinner';
import { SettingsService } from 'src/app/services/settings.service';
import { TimeTrackerService } from 'src/app/services/time-tracker.service';
import { TimesheetService } from 'src/app/services/timesheet.service';
import { UtilService } from 'src/app/services/util.service';
import { noRecordMessage } from '../../util/constants';
import { TimelogSubmitComponent } from '../timelog-submit/timelog-submit.component';
import * as tablePageOption from '../../util/table-pagination-option';
import { filter } from 'rxjs/operators';
import { UrlService } from 'src/app/services/url.service'
import { UntypedFormControl, Validators } from '@angular/forms';
import { ReplaySubject, concat } from 'rxjs';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { ViewCommentsComponent } from 'src/app/reports/timetracker/view-comments/view-comments.component';
import { ExportService } from 'src/app/services/export.service';

@Component({
  selector: 'app-timesheets',
  templateUrl: './timesheets.component.html',
  styleUrls: ['./timesheets.component.less']
})

export class TimesheetsComponent implements OnInit {
  noRecordMsg = noRecordMessage;
  Filter: boolean;
  filterData: string;
  emp_id: any;
  today_date: any;
  total_task_duration: any;
  task_time: any;
  reset_filter_btn: boolean = false;
  no_data: any[] = [];
  arraydata: any[] = [];
  dataSource1 = new MatTableDataSource(this.arraydata);
  active_timer_id: any;
  task_id: any;
  activetask_time: any;
  taskForm: any;
  timesheetDetails: any[] = [];
  notSubmittasks: any[] = [];
  approver: any = [];
  totalTimeMs: any;
  timesheets_submit_button: boolean = false;
  paginatorIndex: any = 0;
  previousUrl: any;
  customdate: boolean = false;
  customdatevalidation: boolean = true;
  daterangevalidation: boolean = false;
  startDate: any;
  endDate: any;
  startdates: any;
  enddates: any;
  isFilterByDateEmpty: boolean = false;
  datepicker: UntypedFormControl;
  isYearClicked: boolean = false;
  isMonthClicked: boolean = false;
  isWeekClicked: boolean = false;
  dates: Date;
  futureYearDisabled: boolean = false;
  beforeYearDisabled: boolean = false;
  showAllTimesheets: boolean = false;
  entiretimesheetDetails: any[] = [];
  mergedtask: any;
  mergedproject: any;
  mergedjob: any;
  mergedbill: any;
  mergedduration: any;
  mergeddate: any;
  startOfYear: any = moment().startOf('year').toDate();
  endOfYear: any = moment().endOf('year').toDate();
  startOfMonth: any = moment().startOf('month').toDate();
  endOfMonth: any = moment().endOf('month').toDate();
  startOfWeek: any = moment().startOf('week').toDate();
  endOfWeek: any = moment().endOf('week').toDate();
  currentYear: any = moment().year();
  timesheetContent:any = [];
  hoursData: any = [];
  maxDate: Date;
  protected dateData: any[] = [
    { data: 'Today', id: 1 },
    { data: 'Yesterday', id: 2 },
    { data: 'This week', id: 3 },
    { data: 'Last week', id: 4 },
    { data: 'This Month', id: 5 },
    { data: 'Last Month', id: 6 },
    { data: 'Custom Date', id: 7 }
  ];
  public dateCtrl: UntypedFormControl = new UntypedFormControl("", [Validators.required]);

  /** list of client filtered by search keyword */
  public filtereddate: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);

  constructor(private router: Router,
    private timeTrackerService: TimeTrackerService,
    private timesheetService: TimesheetService,
    private spinner: NgxSpinnerService,
    public utilsService: UtilService,
    public dialog: MatDialog,
    private settingsService: SettingsService,private exportservice: ExportService,
    private urlService: UrlService) {
  }

  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  
  // @ViewChild(MatPaginator, { static: true }) paginator1 =new QueryList<MatPaginator>();
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  empId: any;
  Org_id: any;
  ngOnInit() {
    this.filtereddate.next(this.dateData.slice());
    let this_month = new Date();
    this.datepicker = new UntypedFormControl(this_month.getMonth);
    this.isWeekClicked = true;
    this.getTimesheetByWeek();
    this.showAllTimesheets = false;
    this.urlService.previousUrl$.subscribe((previousUrl: string) => {
      this.previousUrl = previousUrl;
    });
    // let currentYear = this_month.getFullYear();
    // if(currentYear>(this.startOfYear.getFullYear())) {
    this.futureYearDisabled = true;
    // }

    //to check the previous page is view log,
    // if not the paginator related session storage should be remove and reset to normal
    if (this.previousUrl != '/view-log') {
      sessionStorage.removeItem("timesheets-paginator-pageSize");
      sessionStorage.removeItem("timesheets-paginator-index");
    }
    this.today_date = moment().format("YYYY-MM-DD");
    this.empId = localStorage.getItem('Id');
    this.Org_id = localStorage.getItem('OrgId');
    // if(sessionStorage.getItem("timesheets-paginator")){
    //   this.paginatorIndex = sessionStorage.getItem("timesheets-paginator");
    // }
    // this.getTaskDetails();
    this.emp_id = localStorage.getItem('Id');
    this.reset_filter_btn = false;
    this.geEmployeeDetailsByOrgId();
    this.getactivetask();    
    this.maxDate = new Date();
  }
  public start: UntypedFormControl = new UntypedFormControl("", [Validators.required]);

  /** control for the selected end date  range */
  public end: UntypedFormControl = new UntypedFormControl("", [Validators.required]);

  public dateFilterCtrl: UntypedFormControl = new UntypedFormControl();

  protected filterDate() {
    if (!this.dateData) {
      return;
    }
    // get the search keyword
    let search = this.dateFilterCtrl.value;
    if (!search) {
      this.filtereddate.next(this.dateData.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
    // filter the client
    this.filtereddate.next(
      this.dateData.filter(dateData => dateData.data.toLowerCase().indexOf(search) > -1)
    );
  }

  displayedColumns: string[] = ['timesheet_name', 'reporter_name', 'billable_total_time', 'non_billable_total_time', 'total_time', 'Status', 'action'];
  timeDataSource = new MatTableDataSource();
  allTimeSheetDataSource = new MatTableDataSource();
  displayedColumns1: string[] = ['task', "project", 'job', 'bill', 'task_duration'];


  // ['task', 'project', 'job', 'bill', 'task_duration', 'dateofrequest', 'reporter_name', 'approval_status'];
  pageSize: any = 10;
  tablePaginationOption: number[];

  viewLog(date, status, tId, comments) {
    localStorage.setItem("requestedDate", moment(new Date(date)).format('DD-MM-YYYY'));
    localStorage.setItem("dateOfRequest", date);
    localStorage.setItem("tSheetStatus", status);
    localStorage.setItem("tSheetId", tId);
    if (status != "Pending") {
      localStorage.setItem("tSheetComments", comments);
    }
    this.router.navigate(['/view-log']);

  }

  // timesheetDetails: any[] = [];
  getTaskDetails() {
    this.spinner.show();

    this.timesheetService.getbyempid(this.empId).subscribe(data => {
      if (data.map.statusMessage == "Success") {

        let res: any[] = JSON.parse(data.map.data);
        // this.tablePaginationOption = tablePageOption.tablePaginationOption(res.length);

        // let res: any[] = JSON.parse(data.map.data);
        for (let i = 0; i < res.length; i++) {
          if (res[i].approval_status == "Submitted") {
            res[i].approval_status = "Pending";
          }
        }
        this.timesheetDetails = res;
        this.gettaskbyempiddate();
        if (this.timesheetDetails.length == 0) {
          this.spinner.hide();
        }

        this.timesheetDetails = res;
        this.timeDataSource = new MatTableDataSource(this.timesheetDetails);
        this.timeDataSource.sort = this.sort;
        if (sessionStorage.getItem("timesheets-paginator-index") && sessionStorage.getItem("timesheets-paginator-pageSize")) {
          this.paginatorIndex = sessionStorage.getItem("timesheets-paginator-index");
          this.pageSize = sessionStorage.getItem("timesheets-paginator-pageSize");

          this.paginator.pageSize = this.pageSize;
          this.paginator.pageIndex = this.paginatorIndex;
        }
        this.timeDataSource.paginator = this.paginator;
        this.spinner.hide();
      } else {
        setTimeout(() => {
          this.spinner.hide();
        }, 2000)
      }
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
    })
  }
  //  Get the task by employee id and date 
  // To add the today task in my time sheet table 
  gettaskbyempiddate() {
    let formdata = {
      "emp_id": this.emp_id,
      "date_of_request": this.today_date
    }
    this.timeTrackerService.getbyempidanddate(formdata).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        var data1 = JSON.parse(data.map.details);

        if (data1.length > 0) {
          this.notSubmittasks = data1.filter(a => a.approval_status == "Not submitted" || a.approval_status == "Updated");

          if (this.notSubmittasks.length > 0) {
            let billData = this.notSubmittasks.filter(a => a.bill == "Billable");
            let nonBillData = this.notSubmittasks.filter(a => a.bill == "Non Billable");
            let billableTime = billData.reduce((a, b) => b.task_duration_ms + a, 0);

            let totalTime = this.notSubmittasks.reduce((a, b) => b.task_duration_ms + a, 0);
            let nonBillableTime = nonBillData.reduce((a, b) => b.task_duration_ms + a, 0);
            let datas = new Object;
            datas = {
              "approval_status": "Submit",
              "timesheet_name": "Today",
              "billable_total_time": this.millisToMinutesAndSeconds(billableTime),
              "non_billable_total_time": this.millisToMinutesAndSeconds(nonBillableTime),
              "total_time": this.millisToMinutesAndSeconds(totalTime)
            }
            this.timesheetDetails.unshift(datas);
            // this.tablePaginationOption = tablePageOption.tablePaginationOption(this.timesheetDetails.length);
            this.timeDataSource = new MatTableDataSource(this.timesheetDetails);
            this.timeDataSource.sort = this.sort;
            this.timeDataSource.paginator = this.paginator;
          } else {
            this.timeDataSource = new MatTableDataSource(this.timesheetDetails);
            this.timeDataSource.sort = this.sort;
            this.timeDataSource.paginator = this.paginator;
          }

        }
        this.spinner.hide();
      }
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
    })
  }
  //know get today active task data  
  getactivetask() {
    this.timeTrackerService.getTaskDetailsByActive(this.emp_id).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        this.timesheets_submit_button = true;
        let data1 = JSON.parse(data.map.data);

      }
      else {
        this.timesheets_submit_button = false;
      }
    }, (error) => {

      this.router.navigate(["/404"]);
      this.spinner.hide();
    })
  }
  getStatusClass(name, status) {
    if (name == 'Today' || status == 'Updated') {
      return "todaycolor";
    } else {
      return "byDate";
    }
  }
  // convet milliseconds to seconds

  millisToMinutesAndSeconds(ms) {
    var seconds: any = Math.floor((ms / 1000) % 60);
    var minutes: any = Math.floor((ms / (1000 * 60)) % 60);
    var hours: any = Math.floor((ms / (1000 * 60 * 60)) % 24);
    var days: any = Math.floor((ms / (1000 * 60 * 60 * 24)));
    if (days > 0) {
      hours = (days * 24) + hours;
    }
    hours = (hours < 10) ? "0" + hours : hours;
    minutes = (minutes < 10) ? "0" + minutes : minutes;
    seconds = (seconds < 10) ? "0" + seconds : seconds;
    return hours + ":" + minutes + ":" + seconds;
  }

  //filter
  applyProjectFilter(event: Event) {
    this.Filter = false;
    this.filterData = (event.target as HTMLInputElement).value;
    const filterValue = (event.target as HTMLInputElement).value;
    this.timeDataSource.filter = filterValue.trim().toLowerCase();
    if (this.timeDataSource.filteredData.length == 0) {
      this.Filter = true;
    }
    if (this.timeDataSource.paginator) {
      this.timeDataSource.paginator = this.paginator;
    }
  }


  // to git employees details and orgID details
  geEmployeeDetailsByOrgId() {
    this.approver = [];
    let employeelist = [];
    //before used method --> getActiveEmpDetailsByOrgId()
    //Here I have used the get ACTIVE EMPLOYEE DETAILS API call --> Means its get all user details under the Organization Id
    this.settingsService.getCustomActiveEmpDetailsByOrgID(this.Org_id).subscribe(data => {
      let response: any[] = JSON.parse(data.map.data);
      for (let i = 0; i < response.length; i++) {
        employeelist.push({ "name": response[i].firstname + " " + response[i].lastname, "id": response[i].id, "access": response[i].access_to });
      }

      this.approver = employeelist;
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
    })
  }

  timelog_submit_dialog() {
    let ids = [];
    this.totalTimeMs = 0;
    let totalTimeStr;
    for (var i = 0; i < this.notSubmittasks.length; i++) {
      if (this.notSubmittasks[i].approval_status === "Not submitted") {
        ids.push(this.notSubmittasks[i].id);
      }

    }


    let billData = this.notSubmittasks.filter(a => a.bill == "Billable");
    let nonBillData = this.notSubmittasks.filter(a => a.bill == "Non Billable");
    let billableTime = billData.reduce((a, b) => b.task_duration_ms + a, 0);
    let nonBillableTime = nonBillData.reduce((a, b) => b.task_duration_ms + a, 0);
    this.totalTimeMs = this.notSubmittasks.reduce((a, b) => b.task_duration_ms + a, 0);
    let billableTime_str = this.millisToMinutesAndSeconds(billableTime);
    let nonBillableTime_str = this.millisToMinutesAndSeconds(nonBillableTime);
    let totalTime_Str = this.millisToMinutesAndSeconds(this.totalTimeMs);

    if (ids.length == 0) {
      this.utilsService.openSnackBarAC("No log hours available to submit", "OK");
    }
    else {
      const dialogRef = this.dialog.open(TimelogSubmitComponent, {
        width: '535px',
        panelClass: 'custom-viewdialogstyle',
        data: { ids: ids, billable: billableTime_str, nonBilliable: nonBillableTime_str, totalTimeMs: this.totalTimeMs, totalTimeStr: totalTime_Str, approver_list: this.approver, header: "timelog_submit" },
      });


      dialogRef.afterClosed().subscribe(response => {
        // this.getTaskDetails();
        this.getTimesheetByWeek();
      }
      );
    }
  }

  changePage(event?: PageEvent) {
    this.pageSize = event.pageSize;
    sessionStorage.setItem("timesheets-paginator-index", event.pageIndex.toString());
    sessionStorage.setItem("timesheets-paginator-pageSize", event.pageSize.toString());
  }

  //call resubmit dialog
  resubmit_dialog(id, date) {
    const dialogRef = this.dialog.open(TimelogSubmitComponent, {
      width: '35%',
      panelClass: 'custom-viewdialogstyle',
      data: { header: "timelog_resubmit" },
    });


    dialogRef.afterClosed().subscribe(response => {
      if (response != undefined && response != "") {
        if (response.data == true) {
          this.resubmitTimesheets(id, date);
        }
      }
    });
  }
  //resubmit the rejected the timesheets 
  resubmitTimesheets(id, date) {
    this.spinner.show();
    this.timeTrackerService.updateResubmittedTimesheetsbyTimesheetid(id).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        sessionStorage.setItem("resubmitted-date", date);
        this.utilsService.openSnackBarAC("Timesheet updated successfully, you can edit/delete tasks and resubmit again", "Ok");
        setTimeout(() => {
          this.spinner.hide();
          this.router.navigate(["/time-tracker"]);
        }, 2000);

      }
      else {
        this.utilsService.openSnackBarMC("Failed to resubmit timesheets", "Ok")
        this.spinner.hide();
      }
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
    })
  }
  //To show timesheets in table by onclick week button 
  getTimesheetByWeek() {
    this.spinner.show();
    if (this.customdate) {
      this.startdates = moment(this.start.value).format("YYYY-MM-DD");
      this.enddates = moment(this.end.value).format("YYYY-MM-DD");
    }
    let formdata = {
      "org_id": localStorage.getItem("OrgId"),
      "emp_id": localStorage.getItem("Id"),
      "start_date": this.startOfWeek,
      "end_date": this.endOfWeek,
    }
    this.timesheetService.getTimesheetDetailsByDate(formdata).subscribe(data => {
      let res: any = data;

      if (res.length > 0) {
        this.timesheetDetails = res;
        this.tablePaginationOption = tablePageOption.tablePaginationOption(this.timesheetDetails.length);
        for (let i = 0; i < res.length; i++) {
          if (res[i].approval_status == "Submitted") {
            res[i].approval_status = "Pending";
          }
        }
        this.timesheetDetails = res;
        this.gettaskbyempiddate();
        if (this.timesheetDetails.length == 0) {
          this.spinner.hide();
        }
        this.timesheetDetails = res;
        this.timeDataSource = new MatTableDataSource(this.timesheetDetails);
        this.timeDataSource.sort = this.sort;
        this.timeDataSource.paginator = this.paginator;
        if (sessionStorage.getItem("timesheets-paginator-index") && sessionStorage.getItem("timesheets-paginator-pageSize")) {
          this.paginatorIndex = sessionStorage.getItem("timesheets-paginator-index");
          this.pageSize = sessionStorage.getItem("timesheets-paginator-pageSize");

          this.paginator.pageSize = this.pageSize;
          this.paginator.pageIndex = this.paginatorIndex;
        }
        this.isFilterByDateEmpty = false;
      } else {
        this.isFilterByDateEmpty = true;
        this.timeDataSource = new MatTableDataSource();
        this.timeDataSource.sort = this.sort;
        this.timeDataSource.paginator = this.paginator;
      }
      this.spinner.hide();
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
    })
  }

   //To show timesheets in table by onclick month button 
  getTimesheetByMonth() {
    this.spinner.show();
    let formdata = {
      "org_id": localStorage.getItem("OrgId"),
      "emp_id": localStorage.getItem("Id"),
      "start_date": this.startOfMonth,
      "end_date": this.endOfMonth,
    }
    this.timesheetService.getTimesheetDetailsByDate(formdata).subscribe(data => {
      let res: any = data;
      if (res.length > 0) {
        this.timesheetDetails = res;
        this.tablePaginationOption = tablePageOption.tablePaginationOption(this.timesheetDetails.length);
        for (let i = 0; i < res.length; i++) {
          if (res[i].approval_status == "Submitted") {
            res[i].approval_status = "Pending";
          }
        }
        this.timesheetDetails = res;
        this.gettaskbyempiddate();
        if (this.timesheetDetails.length == 0) {
          this.spinner.hide();
        }
        this.timesheetDetails = res;
        this.timeDataSource = new MatTableDataSource(this.timesheetDetails);
        this.timeDataSource.sort = this.sort;
        if (sessionStorage.getItem("timesheets-paginator-index") && sessionStorage.getItem("timesheets-paginator-pageSize")) {
          this.paginatorIndex = sessionStorage.getItem("timesheets-paginator-index");
          this.pageSize = sessionStorage.getItem("timesheets-paginator-pageSize");

          this.paginator.pageSize = this.pageSize;
          this.paginator.pageIndex = this.paginatorIndex;
        }
        this.timeDataSource.paginator = this.paginator;
        this.isFilterByDateEmpty = false;
      } else {
        this.isFilterByDateEmpty = true;
        this.timeDataSource = new MatTableDataSource();
        this.timeDataSource.sort = this.sort;
        this.timeDataSource.paginator = this.paginator;
      }
      this.spinner.hide();
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
    })
  }

   //To show timesheets in table by onclick year button 
  getTimesheetByYear() {
    this.spinner.show();
    let formdata = {
      "org_id": localStorage.getItem("OrgId"),
      "emp_id": localStorage.getItem("Id"),
      "start_date": this.startOfYear,
      "end_date": this.endOfYear,
    }
    this.timesheetService.getTimesheetDetailsByDate(formdata).subscribe(data => {
      let res: any = data;
      if (res.length > 0) {
        this.timesheetDetails = res;
        this.tablePaginationOption = tablePageOption.tablePaginationOption(this.timesheetDetails.length);
        for (let i = 0; i < res.length; i++) {
          if (res[i].approval_status == "Submitted") {
            res[i].approval_status = "Pending";
          }
        }
        this.timesheetDetails = res;
        this.gettaskbyempiddate();
        if (this.timesheetDetails.length == 0) {
          this.spinner.hide();
        }
        this.timesheetDetails = res;
        this.timeDataSource = new MatTableDataSource(this.timesheetDetails);
        this.timeDataSource.sort = this.sort;
        if (sessionStorage.getItem("timesheets-paginator-index") && sessionStorage.getItem("timesheets-paginator-pageSize")) {
          this.paginatorIndex = sessionStorage.getItem("timesheets-paginator-index");
          this.pageSize = sessionStorage.getItem("timesheets-paginator-pageSize");

          this.paginator.pageSize = this.pageSize;
          this.paginator.pageIndex = this.paginatorIndex;
        }
        this.timeDataSource.paginator = this.paginator;
        this.isFilterByDateEmpty = false;
      } else {
        this.isFilterByDateEmpty = true;
        this.timeDataSource = new MatTableDataSource();
        this.timeDataSource.sort = this.sort;
        this.timeDataSource.paginator = this.paginator;
      }
      this.spinner.hide();
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
    })
  }
  //date picker previous date
  previousdate() {
    this.futureYearDisabled = false;
    this.showAllTimesheets = false;
    if (this.isYearClicked) {
      this.dates = moment(this.dates).subtract(1, 'years').toDate();
      this.startOfYear = moment(this.dates).startOf("year").toDate();
      this.endOfYear = moment(this.dates).endOf("year").toDate();
      this.getTimesheetByYear();
      let this_Year = new Date();
      let currentYear = this_Year.getFullYear();
      if (currentYear > (this.startOfYear.getFullYear())) {
        this.futureYearDisabled = false;
      }
    }
    else if (this.isMonthClicked) {
      this.dates = moment(this.dates).subtract(1, 'month').toDate();
      this.startOfMonth = moment(this.dates).startOf("month").toDate();
      this.endOfMonth = moment(this.dates).endOf("month").toDate();
      this.getTimesheetByMonth();
      let this_month = new Date();
      let currentMonth = this_month.getMonth();
      if (currentMonth > (this.startOfYear.getMonth())) {
        this.futureYearDisabled = false;
      }
    }
    else if (this.isWeekClicked) {
      this.dates = moment(this.dates).subtract(1, 'week').toDate();
      this.startOfWeek = moment(this.dates).startOf("week").toDate();
      this.endOfWeek = moment(this.dates).endOf("week").toDate();
      this.getTimesheetByWeek();

    }
  }
  //date picker next date
  nextdate() {
    this.futureYearDisabled = false;
    this.showAllTimesheets = false;
    if (this.isYearClicked) {
      this.dates = moment(this.dates).add(1, 'years').toDate();
      this.startOfYear = moment(this.dates).startOf("year").toDate();
      this.endOfYear = moment(this.dates).endOf("year").toDate();
      this.getTimesheetByYear();
      let next_Year = new Date();
      let current_year = next_Year.getFullYear();
      if (current_year == (this.endOfYear.getFullYear())) {
        this.futureYearDisabled = true;
      }

    }
    else if (this.isMonthClicked) {
      this.dates = moment(this.dates).add(1, 'month').toDate();
      this.startOfMonth = moment(this.dates).startOf("month").toDate();
      this.endOfMonth = moment(this.dates).endOf("month").toDate();
      this.getTimesheetByMonth();
      let next_Month = new Date();
      let current_month = next_Month.getMonth();
      if (current_month == (this.endOfMonth.getMonth())) {
        this.futureYearDisabled = true;
      }
    }
    else if (this.isWeekClicked) {
      this.dates = moment(this.dates).add(1, 'week').toDate();
      this.startOfWeek = moment(this.dates).startOf("week").toDate();
      this.endOfWeek = moment(this.dates).endOf("week").toDate();
      this.getTimesheetByWeek();
      const currentDate = new Date();
      const currentDayOfWeek = currentDate.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday

      const currentstartOfWeek = new Date(currentDate);
      currentstartOfWeek.setDate(currentDate.getDate() - currentDayOfWeek);

      const currentendOfWeek = new Date(currentDate);
      currentendOfWeek.setDate(currentDate.getDate() + (6 - currentDayOfWeek));

      // Adjust to midnight for better date comparisons
      currentstartOfWeek.setHours(0, 0, 0, 0);
      currentendOfWeek.setHours(23, 59, 59, 999);
      let startDay = currentstartOfWeek;
      let endDay = currentendOfWeek;

      // let next_Week = new Date();
      // let current_year = next_Week.getFullYear();
      if (((startDay.getDate()) == (this.startOfWeek.getDate())) && ((endDay.getDate()) == (this.endOfWeek.getDate()))) {
        this.futureYearDisabled = true;
      }
    }
  }
  // for showing the timesheet details(old one) onclick year button
  showYearBasedTimesheet() {
    this.isYearClicked = true;
    this.isMonthClicked = false;
    this.isWeekClicked = false;
    this.showAllTimesheets = false;
    this.getTimesheetByYear();
  }
  // for showing the timesheet details(old one) onclick year month
  showMonthBasedTimesheet() {
    this.isMonthClicked = true;
    this.isWeekClicked = false;
    this.isYearClicked = false;
    this.showAllTimesheets = false;
    this.getTimesheetByMonth();
  }
  // for showing the timesheet details(old one) onclick year week and onload will show week based timesheet
  showWeekBasedTimesheet() {
    this.isWeekClicked = true;
    this.isYearClicked = false;
    this.isMonthClicked = false;
    this.showAllTimesheets = false;
    this.getTimesheetByWeek();
  }

  task_details: any[] = [];
  project_details: any[] = [];
  job_details: any[] = [];
  bill_details: any[] = [];
  task_duration: any[] = [];
  dateofrequest: any[] = [];
  reporter_name: any[] = [];
  approval_status: any[] = [];
  uniqueDate: any[] = [];
  taskArray: any[] = [];
  duplicateArray: any[] = [];
  filteredList: any;
  formdata: any;
  // for showing the all timesheets in details by week/month/year onclick View All Timesheets button
  showAllTimesheetsByDate() {
    this.showAllTimesheets = true;
    this.spinner.show();
    if (this.isWeekClicked) { // if week is clicked 
      this.formdata = {
        "org_id": localStorage.getItem("OrgId"),
        "emp_id": localStorage.getItem("Id"),
        "start_date": this.startOfWeek,
        "end_date": this.endOfWeek,
      }
    } else if (this.isMonthClicked) { // if month is clicked 
      this.formdata = {
        "org_id": localStorage.getItem("OrgId"),
        "emp_id": localStorage.getItem("Id"),
        "start_date": this.startOfMonth,
        "end_date": this.endOfMonth,
      }
    } else {
      this.formdata = {  // if year is clicked 
        "org_id": localStorage.getItem("OrgId"),
        "emp_id": localStorage.getItem("Id"),
        "start_date": this.startOfYear,
        "end_date": this.endOfYear,
      }
    }
    this.timeTrackerService.getAllTimesheetsByDate(this.formdata).subscribe(data => {
      let response: any = data;
      if (response.length > 0) {
        for (let i = 0; i < response.length; i++) {
          this.duplicateArray.push(response[i].date_of_request);
        }
        for (let i = 0; i < response.length; i++) {
          this.taskArray = this.groupBy(response, 'date_of_request');
        }
      }
      this.entiretimesheetDetails = this.taskArray;
      // this.tablePaginationOption = tablePageOption.tablePaginationOption(this.entiretimesheetDetails.length);
      this.allTimeSheetDataSource = new MatTableDataSource(this.entiretimesheetDetails);
      this.allTimeSheetDataSource.sort = this.sort;
      this.allTimeSheetDataSource.paginator = this.paginator;
      this.isFilterByDateEmpty = false;
      this.spinner.hide();
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
    })
  }
  displayTasks(tasks: any): string {
    return tasks.map(task => task.task);
  }
  private groupBy(array: any[], key: string): any {
    return array.reduce((result, currentValue) => {
      const groupingKey = currentValue[key];
      if (!result[groupingKey]) {
        result[groupingKey] = [];
      }
      result[groupingKey].push(currentValue);
      return result;
    }, {});
  }
  // for style project and job
  getProjectJobCssClass(project: string, job: string): string {
    // if (this.entiretimesheetDetails.includes(project) && this.entiretimesheetDetails.includes(job)) {
    for (let i = 0; i < this.entiretimesheetDetails.length; i++) {
      if (this.entiretimesheetDetails[i].project == project) {
        return 'design_style';
      }
      return '';
    }
  }
  getStatus(data: any[]) {
    for (let i = 0; i < data.length; i++) {
      if (data[i].approval_status == 'Pending') {
        return "Pending";
      } else if (data[i].approval_status == 'Submitted') {
        return "Submitted";
      } else if (data[i].approval_status == 'Approved') {
        return "Approved";
      } else if (data[i].approval_status == 'Rejected') {
        return "Rejected";
      } else if (data[i].approval_status == 'Updated') {
        return "Updated";
      }else if (data[i].approval_status == 'Not submitted') {
        return "Not submitted";
      }
    }
  }
  // getComments(data: any[]) {
  //   if (data.length != 0) {
  //     for (let i = 0; i < data.length; i++) {
  //       if (data[i].approval_comments) {
  //         return data[i].approval_comments;
  //       } else {
  //         return '-';
  //       }
  //     }
  //   }
  // }

  //To get approver name
  getApprover(data: any[]) {
    for (let i = 0; i < data.length; i++) {
      if(data[i].approval_status != 'Not submitted') {
      return data[i].reporter_name;
      } else {
        return '-';
      }
    }
  }
   //To get total hours spent in selected day
   getTotalHours(data: any[]) {
    this.hoursData = [];
    for (let i = 0; i < data.length ; i++) {
      if (this.hoursData.length == 0) {
        this.hoursData = data[i].task_duration;
        } else {
        this.hoursData = this.addTime(this.hoursData, data[i].task_duration);
      }
    }
    return this.hoursData;
  }
  // getTotalHours(data: any[]) {
  //   for (let i = 0; i < this.timesheetDetails.length; i++) {
  //     if (data[0].date_of_request == this.timesheetDetails[i].date_of_request) {
  //       return this.timesheetDetails[i].total_time;
  //     }
  //   }
  // }
  
   //To get total billable hours spent in selected day
  getBillableHours(data: any[]) {
    this.hoursData = [];
    for (let i = 0; i < data.length ; i++) {
        if (data[i].bill == 'Billable') {
          if (this.hoursData.length == 0) {
            this.hoursData = data[i].task_duration;
            } else {
            this.hoursData = this.addTime(this.hoursData, data[i].task_duration);
          }
        } 
    }
    return this.hoursData;
    // for (let i = 0; i < this.timesheetDetails.length; i++) {
    //   if (data[0].date_of_request == this.timesheetDetails[i].date_of_request) {
    //     return this.timesheetDetails[i].billable_total_time;
    //   }
    // }
  }
  //To get total non-billable hours spent in selected day
  getNonBillableHours(data: any[]) {
    this.hoursData = [];
    for (let i = 0; i < data.length; i++) {
        if (data[i].bill == 'Non Billable') {
          if (this.hoursData.length == 0) {
            this.hoursData = data[i].task_duration;
          } else {
            this.hoursData = this.addTime(this.hoursData, data[i].task_duration);
          }
        } 
        // else {
        //   this.hoursData = '-';
        // }
    }
    return this.hoursData;
    // for (let i = 0; i < this.timesheetDetails.length; i++) {
    //   if (data[0].date_of_request == this.timesheetDetails[i].date_of_request) {
    //     return this.timesheetDetails[i].non_billable_total_time;
    //   }
    // }
  }
  addTime(time1, time2) {
    // Split the time strings into hours, minutes, and seconds
    let [h1, m1, s1] = time1.split(':').map(Number);
    let [h2, m2, s2] = time2.split(':').map(Number);

    // Convert both times to seconds
    let totalSeconds1 = h1 * 3600 + m1 * 60 + s1;
    let totalSeconds2 = h2 * 3600 + m2 * 60 + s2;

    // Add the seconds
    let totalSeconds = totalSeconds1 + totalSeconds2;

    // Convert the total seconds back to HH:MM:SS format
    let hours = Math.floor(totalSeconds / 3600);
    let minutes = Math.floor((totalSeconds % 3600) / 60);
    let seconds = totalSeconds % 60;

    // Format the result
    let result = [
      String(hours).padStart(2, '0'),
      String(minutes).padStart(2, '0'),
      String(seconds).padStart(2, '0')
    ].join(':');
    return result;
  }
  //To show the comments for each timesheet
  commentsArray: any[];
  getComments(data: any[]) {
    if (data.length != 0) {
      this.commentsArray = [];
      for (let i = 0; i < data.length; i++) {
        if (data[i].approval_comments) {
          this.commentsArray.push(data[i].approval_comments);
        } else {
          this.commentsArray.push('-');
        }
      }
        const dialogRef = this.dialog.open(ViewCommentsComponent, {
          width: '35%',
          data: { "title": 'Comments', details: this.commentsArray }
        });

        dialogRef.afterClosed().subscribe(result => {
          dialogRef.close();
        });
    }
  }
  generateXLSX() {
    this.timesheetContent = [];
    Object.keys(this.entiretimesheetDetails).forEach((k, i) => {
      for(let j=0;j< this.entiretimesheetDetails[k].length;j++) {
        if(this.entiretimesheetDetails[k][j].approval_comments == undefined && this.entiretimesheetDetails[k][j].reporter_name == undefined) {
          this.timesheetContent.push({ "Date": moment(this.entiretimesheetDetails[k][j].date_of_request).format("DD-MM-YYYY"), "Task": this.entiretimesheetDetails[k][j].task, "Project": this.entiretimesheetDetails[k][j].project, 
          "Job": this.entiretimesheetDetails[k][j].job, "Bill": this.entiretimesheetDetails[k][j].bill, "Task Duration": this.entiretimesheetDetails[k][j].task_duration,
          "Status": this.entiretimesheetDetails[k][j].approval_status,"Approver": '-',"Comments":'-' });
        
        }
        else if(this.entiretimesheetDetails[k][j].reporter_name == undefined) {
          this.timesheetContent.push({ "Date": moment(this.entiretimesheetDetails[k][j].date_of_request).format("DD-MM-YYYY"), "Task": this.entiretimesheetDetails[k][j].task, "Project": this.entiretimesheetDetails[k][j].project, 
          "Job": this.entiretimesheetDetails[k][j].job, "Bill": this.entiretimesheetDetails[k][j].bill, "Task Duration": this.entiretimesheetDetails[k][j].task_duration,
          "Status": this.entiretimesheetDetails[k][j].approval_status,"Approver": '-',"Comments":this.entiretimesheetDetails[k][j].approval_comments });
       
        }
        else if(this.entiretimesheetDetails[k][j].approval_comments == undefined) {
          this.timesheetContent.push({ "Date": moment(this.entiretimesheetDetails[k][j].date_of_request).format("DD-MM-YYYY"), "Task": this.entiretimesheetDetails[k][j].task, "Project": this.entiretimesheetDetails[k][j].project, 
          "Job": this.entiretimesheetDetails[k][j].job, "Bill": this.entiretimesheetDetails[k][j].bill, "Task Duration": this.entiretimesheetDetails[k][j].task_duration,
          "Status": this.entiretimesheetDetails[k][j].approval_status,"Approver": this.entiretimesheetDetails[k][j].reporter_name,"Comments":'-' });
        
        }       
        else {
        this.timesheetContent.push({ "Date": moment(this.entiretimesheetDetails[k][j].date_of_request).format("DD-MM-YYYY"), "Task": this.entiretimesheetDetails[k][j].task, "Project": this.entiretimesheetDetails[k][j].project, 
        "Job": this.entiretimesheetDetails[k][j].job, "Bill": this.entiretimesheetDetails[k][j].bill, "Task Duration": this.entiretimesheetDetails[k][j].task_duration,
        "Status": this.entiretimesheetDetails[k][j].approval_status,"Approver": this.entiretimesheetDetails[k][j].reporter_name,"Comments":this.entiretimesheetDetails[k][j].approval_comments });   
        }
      }
      })      
    this.exportservice.exportAsExcelFile(this.timesheetContent, 'Timesheet', "xlsx");
  }
  generateXLS() {
    this.timesheetContent = [];
    Object.keys(this.entiretimesheetDetails).forEach((k, i) => {
      for(let j=0;j< this.entiretimesheetDetails[k].length;j++) {
        if(this.entiretimesheetDetails[k][j].approval_comments == undefined && this.entiretimesheetDetails[k][j].reporter_name == undefined) {
          this.timesheetContent.push({ "Date": moment(this.entiretimesheetDetails[k][j].date_of_request).format("DD-MM-YYYY"), "Task": this.entiretimesheetDetails[k][j].task, "Project": this.entiretimesheetDetails[k][j].project, 
          "Job": this.entiretimesheetDetails[k][j].job, "Bill": this.entiretimesheetDetails[k][j].bill, "Task Duration": this.entiretimesheetDetails[k][j].task_duration,
          "Status": this.entiretimesheetDetails[k][j].approval_status,"Approver": '-',"Comments":'-' });
        
        }
        else if(this.entiretimesheetDetails[k][j].reporter_name == undefined) {
          this.timesheetContent.push({ "Date": moment(this.entiretimesheetDetails[k][j].date_of_request).format("DD-MM-YYYY"), "Task": this.entiretimesheetDetails[k][j].task, "Project": this.entiretimesheetDetails[k][j].project, 
          "Job": this.entiretimesheetDetails[k][j].job, "Bill": this.entiretimesheetDetails[k][j].bill, "Task Duration": this.entiretimesheetDetails[k][j].task_duration,
          "Status": this.entiretimesheetDetails[k][j].approval_status,"Approver": '-',"Comments":this.entiretimesheetDetails[k][j].approval_comments });
       
        }
        else if(this.entiretimesheetDetails[k][j].approval_comments == undefined) {
          this.timesheetContent.push({ "Date": moment(this.entiretimesheetDetails[k][j].date_of_request).format("DD-MM-YYYY"), "Task": this.entiretimesheetDetails[k][j].task, "Project": this.entiretimesheetDetails[k][j].project, 
          "Job": this.entiretimesheetDetails[k][j].job, "Bill": this.entiretimesheetDetails[k][j].bill, "Task Duration": this.entiretimesheetDetails[k][j].task_duration,
          "Status": this.entiretimesheetDetails[k][j].approval_status,"Approver": this.entiretimesheetDetails[k][j].reporter_name,"Comments":'-' });
        
        }       
        else {
        this.timesheetContent.push({ "Date": moment(this.entiretimesheetDetails[k][j].date_of_request).format("DD-MM-YYYY"), "Task": this.entiretimesheetDetails[k][j].task, "Project": this.entiretimesheetDetails[k][j].project, 
        "Job": this.entiretimesheetDetails[k][j].job, "Bill": this.entiretimesheetDetails[k][j].bill, "Task Duration": this.entiretimesheetDetails[k][j].task_duration,
        "Status": this.entiretimesheetDetails[k][j].approval_status,"Approver": this.entiretimesheetDetails[k][j].reporter_name,"Comments":this.entiretimesheetDetails[k][j].approval_comments });   
        }
      }
      })      
    this.exportservice.exportAsExcelFile(this.timesheetContent, 'Timesheet', "xls");
  }
  generateCSV() {
    this.timesheetContent = [];
    Object.keys(this.entiretimesheetDetails).forEach((k, i) => {
      for(let j=0;j< this.entiretimesheetDetails[k].length;j++) {
        if(this.entiretimesheetDetails[k][j].approval_comments == undefined && this.entiretimesheetDetails[k][j].reporter_name == undefined) {
          this.timesheetContent.push({ "Date": moment(this.entiretimesheetDetails[k][j].date_of_request).format("DD-MM-YYYY"), "Task": this.entiretimesheetDetails[k][j].task, "Project": this.entiretimesheetDetails[k][j].project, 
          "Job": this.entiretimesheetDetails[k][j].job, "Bill": this.entiretimesheetDetails[k][j].bill, "Task Duration": this.entiretimesheetDetails[k][j].task_duration,
          "Status": this.entiretimesheetDetails[k][j].approval_status,"Approver": '-',"Comments":'-' });
        
        }
        else if(this.entiretimesheetDetails[k][j].reporter_name == undefined) {
          this.timesheetContent.push({ "Date": moment(this.entiretimesheetDetails[k][j].date_of_request).format("DD-MM-YYYY"), "Task": this.entiretimesheetDetails[k][j].task, "Project": this.entiretimesheetDetails[k][j].project, 
          "Job": this.entiretimesheetDetails[k][j].job, "Bill": this.entiretimesheetDetails[k][j].bill, "Task Duration": this.entiretimesheetDetails[k][j].task_duration,
          "Status": this.entiretimesheetDetails[k][j].approval_status,"Approver": '-',"Comments":this.entiretimesheetDetails[k][j].approval_comments });
       
        }
        else if(this.entiretimesheetDetails[k][j].approval_comments == undefined) {
          this.timesheetContent.push({ "Date": moment(this.entiretimesheetDetails[k][j].date_of_request).format("DD-MM-YYYY"), "Task": this.entiretimesheetDetails[k][j].task, "Project": this.entiretimesheetDetails[k][j].project, 
          "Job": this.entiretimesheetDetails[k][j].job, "Bill": this.entiretimesheetDetails[k][j].bill, "Task Duration": this.entiretimesheetDetails[k][j].task_duration,
          "Status": this.entiretimesheetDetails[k][j].approval_status,"Approver": this.entiretimesheetDetails[k][j].reporter_name,"Comments":'-' });
        
        }       
        else {
        this.timesheetContent.push({ "Date": moment(this.entiretimesheetDetails[k][j].date_of_request).format("DD-MM-YYYY"), "Task": this.entiretimesheetDetails[k][j].task, "Project": this.entiretimesheetDetails[k][j].project, 
        "Job": this.entiretimesheetDetails[k][j].job, "Bill": this.entiretimesheetDetails[k][j].bill, "Task Duration": this.entiretimesheetDetails[k][j].task_duration,
        "Status": this.entiretimesheetDetails[k][j].approval_status,"Approver": this.entiretimesheetDetails[k][j].reporter_name,"Comments":this.entiretimesheetDetails[k][j].approval_comments });   
        }
      }
      })      
    this.exportservice.exportAsExcelFile(this.timesheetContent, 'Timesheet', "csv");
  }
}
