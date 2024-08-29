import { DatePipe } from '@angular/common';
import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import moment from 'moment';
import { NgxSpinnerService } from 'ngx-spinner';
import { ReplaySubject, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { EmployeeService } from 'src/app/services/employee.service';
import { TimeTrackerService } from 'src/app/services/time-tracker.service';
import { TimesheetService } from 'src/app/services/timesheet.service';
import * as tablePageOption from 'src/app/util/table-pagination-option';
import { noRecordMessage, noDataMessage, errorMessage } from 'src/app/util/constants';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import * as Highcharts from 'highcharts/highstock';
import { PDFDocument } from 'pdf-lib';
import { ViewCommentsComponent } from '../view-comments/view-comments.component';
import { MatDialog } from '@angular/material/dialog';
import { ExportService } from 'src/app/services/export.service';
pdfMake.vfs = pdfFonts.pdfMake.vfs;
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-timesheet-reports-timetracker',
  templateUrl: './timesheet-reports-timetracker.component.html',
  styleUrls: ['./timesheet-reports-timetracker.component.less']
})
export class TimesheetReportsTimetrackerComponent implements OnInit {

  startdates: any;
  enddates: any;
  email: string | null;
  empId: string | null;
  yearofmonth: string;
  maxDate: Date;
  employee: string;
  today: any;
  customdate: boolean = false;
  customdatevalidation: boolean = false;
  daterangevalidation: boolean = false;
  org_id: any;
  show: boolean = false;
  showTimesheetTable: boolean = false;
  timesheetDetails: any[] = [];
  paginatorIndex: any = 0;
  noRecordMsg = noRecordMessage;
  No_Data_Found_timesheet: boolean = false;
  startDate: any;
  endDate: any;
  options: any;
  Emp_logged_hours: any = 0;
  responselength: number;
  approvedCount: number = 0;
  pendingCount: number = 0;
  rejectedCount: number = 0;
  submittedCount: number = 0;
  notSubmittedCount: number = 0;
  timesheetContent: any = [];
  totalCounts: any[] = [];
  isLoading: boolean = false;
  hoursData: any = [];
  billableHours: any = [];
  nonbillableHours: any = [];
  nodataMsg = noDataMessage;
  requiredMessage = errorMessage;

  public userCtrl: UntypedFormControl = new UntypedFormControl("", [Validators.required]);

  /** control for the selected date range */
  public dateCtrl: UntypedFormControl = new UntypedFormControl("", [Validators.required]);

  /** control for the selected start date range */
  public start: UntypedFormControl = new UntypedFormControl("", [Validators.required]);

  /** control for the selected end date  range */
  public end: UntypedFormControl = new UntypedFormControl("", [Validators.required]);

  /** control for the MatSelect filter keyword */
  public userFilterCtrl: UntypedFormControl = new UntypedFormControl();

  /** list of client filtered by search keyword */
  public filtereduser: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);

  public filtereddate: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);

  /** control for the MatSelect filter keyword */
  public dateFilterCtrl: UntypedFormControl = new UntypedFormControl();

  protected _onDestroy = new Subject<void>();
  name: string;
  hours: any;
  entiretimesheetDetails: any[] = [];
  isFilterByDateEmpty: boolean = false;
  timeDataSource = new MatTableDataSource();
  timesheetArray: any = [];
  // count = 1;

  constructor(public datepipe: DatePipe, private employeeService: EmployeeService,
    private spinner: NgxSpinnerService, private timetrackerservice: TimeTrackerService,
    private domSanitizer: DomSanitizer, private timesheetService: TimesheetService, private exportservice: ExportService,
    private formBuilder: UntypedFormBuilder, private timeTrackerService: TimeTrackerService,
    private router: Router, private dialog: MatDialog, private elem: ElementRef) {
    // this.loadInitialAccordions();
  }

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  allTimeSheetDataSource = new MatTableDataSource();
  displayedColumns1: string[] = ['task', "project", 'job', 'bill', 'task_duration'];
  Statustype = ['Total', 'Approved', 'Rejected', 'Submitted', 'Pending', 'Not Submitted'];

  // ['task', 'project', 'job', 'bill', 'task_duration', 'dateofrequest', 'reporter_name', 'approval_status'];
  pageSize: any = 10;
  tablePaginationOption: number[];
  /** list of bill */
  protected dateData: any[] = [
    { data: 'Today', id: 1 },
    { data: 'Yesterday', id: 2 },
    { data: 'This week', id: 3 },
    { data: 'Last week', id: 4 },
    { data: 'This Month', id: 5 },
    { data: 'Last Month', id: 6 },
    { data: 'This Year', id: 7 },
    { data: 'Last Year', id: 8 },
    { data: 'Custom Date', id: 9 }
  ];

  protected employeeData: any[] = [];
  protected inativateemployeeData: any[] = [];
  protected ativateemployeeData: any[] = [];

  ngOnInit(): void {
    this.showTimesheetTable = false;
    this.org_id = localStorage.getItem("OrgId");
    this.getOrgEmployees();
    // load the initial bill list
    this.filtereddate.next(this.dateData.slice());
    // listen for search field value changes
    this.dateFilterCtrl.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        this.filterDate();
      });

    // load the initial employee list
    this.filtereduser.next(this.employeeData.slice());

    // listen for search field value changes
    this.userFilterCtrl.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        this.filterEmployee();
      });
    this.startdates = new Date();
    this.maxDate = new Date();
    // this.datepicker = new FormControl(new Date());
    const date = new Date(this.startdates);
    var startdates = new Date(date.getFullYear(), date.getMonth(), 1);
    this.today = this.datepipe.transform(startdates, 'dd-MM-yyyy');
    this.startdates = this.today
    var enddates = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    this.enddates = this.datepipe.transform(enddates, 'dd-MM-yyyy');
  }
  // @HostListener('window:scroll', ['$event'])
  // onWindowScroll(event: Event) {
  //   if (this.elem.nativeElement.contains(event.target)) {
  //     if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight) {
  //       // Load more accordion items if not already loading
  //       if (!this.isLoading) {
  //         this.loadMoreAccordions();
  //       }
  //     }
  //   }
  // }
  // loadInitialAccordions() {
  //   this.isLoading = true;
  //   setTimeout(() => {
  //     this.entiretimesheetDetails = this.generateAccordions(5);
  //     this.isLoading = false;
  //   }, 1000);
  // }
  // loadMoreAccordions() {
  //   this.isLoading = true;
  //   setTimeout(() => {
  //     const newAccordions = this.generateAccordions(5);
  //     this.entiretimesheetDetails = this.entiretimesheetDetails.concat(newAccordions);
  //     this.isLoading = false;
  //   }, 1000);
  // }
  // generateAccordions(count: number): any[] {
  //   const newAccordions: any[] = [];
  //   let accordionLength = Object.keys(this.entiretimesheetDetails).length;
  //   for (let i = 0; i < count; i++) {
  //     newAccordions.push({ id: accordionLength - (accordionLength - i), title: `Accordion ${accordionLength - (accordionLength - i)}`, data: this.entiretimesheetDetails[i] });
  //   }
  //   let count1 = 0;
  //   let newData = [];
  //   for (const date in this.entiretimesheetDetails) {
  //     if (count1 >= 5) break; // Exit loop if 5 items are already collected
  //     newData[date] = this.entiretimesheetDetails[date].slice(0, 5);
  //     count1 += newData[date].length;
  //   }
  //   // newData.push(this.entiretimesheetDetails.slice(0,5));
  //   return newData;
  // }

  // ! Select Employeedetails
  selectEmploy(data) {
    this.email = data.mail;
    this.employee = data.name;
    this.empId = data.id;
    this.name = data.name;

  }
  //  ! change Date field function
  selectChangeHandler(data) {
    if (data == "Custom Date") {
      this.customdate = true;
    }
    else {
      if (data == "Today") {
        this.startdates = moment().format("YYYY-MM-DD");
        this.enddates = moment().format("YYYY-MM-DD");
      }
      if (data == "Yesterday") {
        this.startdates = moment().subtract(1, "days").format("YYYY-MM-DD");
        this.enddates = moment().subtract(1, "days").format("YYYY-MM-DD");
      }
      if (data == "This week") {
        this.startdates = moment().startOf("week").format("YYYY-MM-DD");
        this.enddates = moment().endOf("week").format("YYYY-MM-DD");
      }
      if (data == "Last week") {
        this.startdates = moment().subtract(1, 'weeks').startOf("week").format("YYYY-MM-DD");
        this.enddates = moment().subtract(1, 'weeks').endOf("week").format("YYYY-MM-DD");
      }
      if (data == "This Month") {
        this.startdates = moment().startOf("month").format("YYYY-MM-DD");
        this.enddates = moment().endOf("month").format("YYYY-MM-DD");
      }
      if (data == "Last Month") {
        this.startdates = moment().subtract(1, 'month').startOf("month").format("YYYY-MM-DD");
        this.enddates = moment().subtract(1, 'month').endOf("month").format("YYYY-MM-DD");
      }
      if (data == "This Year") {
        this.startdates = moment().startOf("years").format("YYYY-MM-DD");
        this.enddates = moment().endOf("years").format("YYYY-MM-DD");
      }
      if (data == "Last Year") {
        this.startdates = moment().subtract(1, 'years').startOf("years").format("YYYY-MM-DD");
        this.enddates = moment().subtract(1, 'years').endOf("years").format("YYYY-MM-DD");
      }
      this.customdate = false;
      this.daterangevalidation = true;
    }
    if (this.end.value == "") {
      this.customdatevalidation = false;
    }
    else {
      this.customdatevalidation = true;
    }
  }
  //  ! Filter employee field function
  protected filterEmployee() {
    if (!this.employeeData) {
      return;
    }
    // get the search keyword
    let search = this.userFilterCtrl.value;
    if (!search) {
      this.filtereduser.next(this.employeeData.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
    // filter the client
    this.filtereduser.next(
      this.employeeData.filter(employeeData => employeeData.name.toLowerCase().indexOf(search) > -1)
    );
  }

  getOrgEmployees() {
    this.employeeService.getOrgEmployees(this.org_id).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        var response = data.map.data.myArrayList;
        var inactivateresponse = data.map.inactivateusers.myArrayList;
        for (var i = 0; i < response.length; i++) {
          this.ativateemployeeData.push(response[i].map);
        }
        this.employeeData = this.ativateemployeeData;
        this.filterEmployee();
        for (var i = 0; i < inactivateresponse.length; i++) {
          this.inativateemployeeData.push(inactivateresponse[i].map);
        }
        // this.employeeData = this.inativateemployeeData;
        // this.filterEmployee();
      }
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
    })
  }
  //  ! Filter Date field function
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
  //  ! To cancel form function
  cancelform() {
    this.show = false;
    this.start = new UntypedFormControl("", [Validators.required]);
    this.end = new UntypedFormControl("", [Validators.required]);
    this.dateCtrl = new UntypedFormControl("", [Validators.required]);
    this.userCtrl = new UntypedFormControl("", [Validators.required]);
    this.customdate = false;
    this.customdatevalidation = false;
    this.daterangevalidation = false;
    this.showTimesheetTable = false;
  }
  getTimesheetByWeek() {
    this.timesheetDetails = [];
    this.spinner.show();
    let formdata = {
      "org_id": localStorage.getItem("OrgId"),
      "emp_id": this.empId,
      "start_date": this.startdates,
      "end_date": this.enddates,
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
        // this.gettaskbyempiddate();
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
  async findData() {
    this.show = true;
    this.spinner.show();
    this.showTimesheetTable = true;
    this.allTimeSheetDataSource = new MatTableDataSource();
    this.timeDataSource = new MatTableDataSource();
    setTimeout(async () => {
      if (this.customdate == true) {
        this.startdates = moment(this.start.value).format("YYYY-MM-DD");
        this.enddates = moment(this.end.value).format("YYYY-MM-DD");
        this.getTimesheetByWeek();
        this.getAllTimeSheets();
        await this.getBillableNonBillable();
        await this.gettaskDetails();
        // this.loadInitialAccordions();
      }
      else {
        this.startdates = moment(this.startdates).format("YYYY-MM-DD");
        this.enddates = moment(this.enddates).format("YYYY-MM-DD");
        this.getTimesheetByWeek();
        this.getAllTimeSheets();
        await this.getBillableNonBillable();
        await this.gettaskDetails();
        // this.loadInitialAccordions();
      }
    }, 2000);

  }
  getAllTimeSheets() {
    this.entiretimesheetDetails = [];
    this.spinner.show();
    this.formdata = {  // if year is clicked 
      "org_id": localStorage.getItem("OrgId"),
      "emp_id": this.empId,
      "start_date": this.startdates,
      "end_date": this.enddates,
    }
    this.timeTrackerService.getAllTimesheetsByDate(this.formdata).subscribe(data => {
      let response: any = data;
      if (response.length != 0) {
        for (let i = 0; i < response.length; i++) {
          this.duplicateArray.push(response[i].date_of_request);
        }
        for (let i = 0; i < response.length; i++) {
          this.taskArray = this.groupBy(response, 'date_of_request');
        }
        this.entiretimesheetDetails = this.taskArray;
      } else {
        this.entiretimesheetDetails.length = 0;
      }
      this.responselength = Object.keys(this.entiretimesheetDetails).length;
      this.getTotalCount();
      this.tablePaginationOption = tablePageOption.tablePaginationOption(this.entiretimesheetDetails.length);
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
      } else if (data[i].approval_status == 'Not submitted') {
        return "Not submitted";
      }
    }
  }
  tempData: any = [];
  separatedData: any;
  counts: number = 0;
  getTotalCount() {
    this.submittedCount = 0;
    this.approvedCount = 0;
    this.rejectedCount = 0;
    this.notSubmittedCount = 0;
    this.pendingCount = 0;
    this.totalCounts = [];
    Object.keys(this.entiretimesheetDetails).forEach((k, i) => {
      if (this.entiretimesheetDetails[k][0].approval_status === 'Submitted') {
        this.submittedCount++;

      } else if (this.entiretimesheetDetails[k][0].approval_status === 'Approved') {
        this.approvedCount++;

      } else if (this.entiretimesheetDetails[k][0].approval_status === 'Rejected') {
        this.rejectedCount++;

      } else if (this.entiretimesheetDetails[k][0].approval_status === 'Not submitted') {
        this.notSubmittedCount++;

      } else if (this.entiretimesheetDetails[k][0].approval_status === 'Pending') {
        this.pendingCount++;
      }
      this.tempData.push(this.entiretimesheetDetails[k][0].approval_status);

    });
    this.separatedData = this.tempData.filter(function (elem, index, self) {
      return index === self.indexOf(elem);
    })
    this.totalCounts.push(this.responselength, this.approvedCount, this.rejectedCount, this.submittedCount, this.pendingCount, this.notSubmittedCount);

  }
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
  getApprover(data: any[]) {
    for (let i = 0; i < data.length; i++) {
      if (data[i].approval_status != 'Not submitted') {
        return data[i].reporter_name;
      } else {
        return '-';
      }
    }
  }
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
    // for (let i = 0; i < this.timesheetDetails.length; i++) {
    //   if (data[0].date_of_request == this.timesheetDetails[i].date_of_request) {
    //     return this.timesheetDetails[i].total_time;
    //   }
    // }
  }
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
  } 
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
    }
    return this.hoursData;
  }
  // for (let i = 0; i < this.timesheetDetails.length; i++) {
  //   for(let j=0;j<data.length;j++) {
  //   if (data[j].date_of_request == this.timesheetDetails[i].date_of_request) {
  //    return  this.addTime(data[j].task_duration, this.timesheetDetails[i].non_billable_total_time);
  //     // return sum(this.timesheetDetails[i].non_billable_total_time);
  //   }
  // }
  // }

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

  // ************************************************Billable and Non Bilabe bar chart section started ***************************************************
  billable: any;
  non_billable: any;
  report: boolean = false;
  formdetails: any;
  getBillableNonBillable() {
    return new Promise<void>((resolve, reject) => {
      this.No_Data_Found_timesheet = false;
      this.formdetails = {
        "empid": this.empId,
        "startdate": moment(this.startdates).format("DD-MM-YYYY"),
        "enddate": moment(this.enddates).format("DD-MM-YYYY"),
      }
      let subscription1 = this.timetrackerservice.getbillingchartmonth(this.formdetails).subscribe(data => {
        if (data.map.statusMessage == "Success") {
          let response: any = data.map.data.map;
          if (response.billable_time == 0 && response.non_billable_time == 0) {
            this.No_Data_Found_timesheet = true;
          }
          this.billable = Number(response.billable_time);
          this.non_billable = Number(response.non_billable_time);
        }

        setTimeout(() => {
          Highcharts.chart('timesheet_count', this.setchartoption());
        }, 1000);
        resolve()
      }, (error) => {
        this.router.navigate(["/404"]);
        this.spinner.hide();

      })
    });
  }

  //************ chart section for total count of timesheet status**************** */ 
  setchartoption() {
    this.options = {
      chart: {
        type: 'column',
      },
      title: false,
      subtitle: {
      },
      xAxis: {
        categories: this.Statustype,
        title: {
          text: 'Status',
        },
      },
      yAxis: {
        min: 0,
        title: {
          text: 'Timesheet count',
          align: 'middle',
        },
        labels: {
          overflow: 'justify',
        },
      },
      tooltip: {
        headerFormat: "",
        useHTML: true,
        pointFormat: 'Total Timesheet: {point.y:.1f}',
      },
      plotOptions: {
        bar: {
          dataLabels: {
            enabled: true,
          },
        },
        series: {
          borderWidth: 0,
          cursor: 'pointer',
          dataLabels: {
            enabled: true,
            // format: '{point.y:.1f}',
          }
        },
      },
      legend: false,
      credits: {
        enabled: false,
      },
      series: [
        {
          name: 'Total Count',
          colorByPoint: true,
          data: this.totalCounts,
          events: {
            click: (event) => {
              this.Showtable(event.point.category);
            },
          },
          // colorByPoint: true
        }],

    };
    return this.options;
  }
  Showtable(data) {
    this.spinner.show();
    if (data != 'Total') {
      this.entiretimesheetDetails = [];
      this.formdata = {
        "org_id": localStorage.getItem("OrgId"),
        "emp_id": this.empId,
        "start_date": this.startdates,
        "end_date": this.enddates,
        "approval_status": data
      }
      this.timeTrackerService.getAllTimesheetsByStatus(this.formdata).subscribe(data => {
        let response: any = data;
        if (response.length != 0) {
          for (let i = 0; i < response.length; i++) {
            this.duplicateArray.push(response[i].date_of_request);
          }
          for (let i = 0; i < response.length; i++) {
            this.taskArray = this.groupBy(response, 'date_of_request');
          }
          this.entiretimesheetDetails = this.taskArray;
        } else {
          this.entiretimesheetDetails.length = 0;
        }
        this.responselength = Object.keys(this.entiretimesheetDetails).length;
        this.getTotalCount();
        this.tablePaginationOption = tablePageOption.tablePaginationOption(this.entiretimesheetDetails.length);
        this.allTimeSheetDataSource = new MatTableDataSource(this.entiretimesheetDetails);
        this.allTimeSheetDataSource.sort = this.sort;
        this.allTimeSheetDataSource.paginator = this.paginator;
        this.isFilterByDateEmpty = false;
        this.spinner.hide();
      }, (error) => {
        this.router.navigate(["/404"]);
        this.spinner.hide();
      })
    } else {
      this.getAllTimeSheets();
    }
  }
  // setchartoption(e) {
  //   this.options = {
  //     chart: {
  //       type: e
  //     },
  //     title: {
  //       text: 'Total Count',
  //       enabled: false,
  //       style: {
  //         fontSize: '16px'
  //       }
  //     },
  //     subtitle: {
  //       text: 'Click the columns to view timesheets below.'
  //     },
  //     accessibility: {
  //       announceNewData: {
  //         enabled: true
  //       }
  //     },
  //     xAxis: {
  //       type: 'category'
  //     },
  //     yAxis: {
  //       title: {
  //         text: 'Total timesheet status count'
  //       },

  //     },
  //     legend: {
  //       enabled: false
  //     },
  //     credits: {
  //       enabled: false,
  //     },
  //     plotOptions: {
  //       series: {
  //         borderWidth: 0,
  //         dataLabels: {
  //           enabled: true,
  //         }
  //       }
  //     },
  //     tooltip: {
  //       pointFormat: '({point.time})'
  //     },
  //     series:
  //       [
  //         {
  //           name: "Count(s)",
  //           colorByPoint: true,
  //           data: this.totalCounts,
  //         }
  //       ],
  //     drilldown: {
  //       series:
  //         this.job_details1,
  //     }
  //   }
  //   return this.options;
  // } 
  // ----------------milliseconds to time converter function------------------
  millisecondsToStr(milliseconds) {
    var value = "";

    var temp = Math.floor(milliseconds / 1000);
    var hours = Math.floor(temp / 60 / 60);
    if (hours) {
      // value+=  hours + ' hour ' + this.numberEnding(hours);
      if (hours > 1) {
        value += hours + ' hours ';
      }
      else {
        value += hours + ' hour ';

      }
    }
    var minutes = Math.floor((temp / 60 / 60 - hours) * 60);
    if (minutes) {
      // value+= minutes + ' minute ' + this.numberEnding(minutes);
      if (minutes > 1) {
        value += minutes + ' minutes ';
      }
      else {
        value += minutes + ' minute ';
      }
    }
    var seconds = Math.floor(((temp / 60 / 60 - hours) * 60 - minutes) * 60);
    if (seconds) {
      // value+= seconds + ' second' + this.numberEnding(seconds);
      if (seconds > 1) {
        value += seconds + ' seconds';
      }
      else {
        value += seconds + ' second';
      }
    }
    if (value == "") {
      value = 'less than a second'  //'just now' //or other string you like;
    }
    return value;


  }
  //  ! To Date field validation
  todatechange() {
    if (this.end.value == "") {
      this.customdatevalidation = false;
    }
    else {
      this.customdatevalidation = true;
    }
  }
  // ***********************Average calculation section*******************************
  Average_month_log_hours: any;
  Total_log_hours: any;
  Averagecalculation(milliseconds) {
    if (this.customdate == true) {
      this.startdates = moment(this.start.value).toDate();
      this.enddates = moment(this.end.value).endOf("day").toDate();
    }
    let fullyearOfStartDate = new Date(this.startdates);
    let fullyearOfEndDate = new Date(this.enddates);
    let diffInDays = moment(this.enddates).diff(moment(this.startdates), 'days') + 1;
    var firstDay = (fullyearOfStartDate.getFullYear(), fullyearOfStartDate.getMonth(), 1);
    var lastDay = (fullyearOfEndDate.getFullYear(), fullyearOfEndDate.getMonth() + 1, 0);
    let TotalDays = moment(lastDay).diff(moment(firstDay), 'days') + 1;
    let diffInMonths = moment(this.enddates).diff(moment(this.startdates), 'months') + 1;
    if (!this.customdate) {
      return this.millisecondsToStr1(milliseconds / (diffInMonths));
    }
    else if (this.customdate) {
      return this.millisecondsToStr1(milliseconds / diffInMonths);
    }
  }
  // *********************************************************project and job section ****************************************************************
  All_details: any[];
  project_name: any = [];
  job_name: any = [];
  project_data: any = [];
  project_details1: any = [];
  job_data: any = [];
  job_details1: any = [];
  no_data_found_project: boolean = false;
  gettaskDetails() {
    this.spinner.show();
    this.Emp_logged_hours = 0;
    this.project_data = [];
    this.job_details1 = [];
    this.All_details = [];
    this.project_name = [];
    this.no_data_found_project = false;
    let formdata = {
      "empid": this.empId,
      "start_date": moment(this.startdates).format("YYYY-MM-DD"),
      "enddate": moment(this.enddates).format("YYYY-MM-DD"),
    }
    let subscription1 = this.timetrackerservice.getTaskDetailsForTimeTrackerReport(formdata).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        let response: any[] = JSON.parse(data.map.data);
        this.All_details = response;
      }
      // *******************For project chart section*************************
      let arr: any = [];
      this.project_data = [];
      for (let i = 0; i < this.All_details.length; i++) {
        this.project_name.push(this.All_details[i].project);
        this.project_name = this.project_name.filter(function (elem, index, self) {
          return index === self.indexOf(elem);
        })
      }
      let log_hours: any = 0;
      let Hours: any = 0;
      for (let j = 0; j < this.project_name.length; j++) {
        this.project_details1 = (this.All_details.filter(n => n.project == this.project_name[j]));
        for (let k = 0; k < this.project_details1.length; k++) {
          if (this.project_details1[k].task_duration_ms) {
            log_hours += this.project_details1[k].task_duration_ms;
            this.Emp_logged_hours += this.project_details1[k].task_duration_ms;
          }
        }
        arr[j] = { 'name': this.project_name[j], 'y': this.millisecondsToHrs(log_hours), 'drilldown': this.project_name[j], 'time': this.millisecondsToStr(log_hours) }
        this.project_data = arr;
        log_hours = 0;
      }
      this.Average_month_log_hours = this.Averagecalculation(this.Emp_logged_hours);
      this.Total_log_hours = this.millisecondsToStr1(this.Emp_logged_hours);

      // *****************project section ends**************

      // ------------------jobs section start---------------
      let job_arr: any = [];
      let sub_job_arr: any = [];
      let temp_job_array: any = [];
      this.job_details1 = [];
      for (let m = 0; m < this.project_name.length; m++) {
        this.job_data = this.All_details.filter(n => n.project == this.project_name[m]);
        for (let n = 0; n < this.job_data.length; n++) {
          this.job_name.push(this.job_data[n].job);
          this.job_name = this.job_name.filter(function (elem, index, self) {
            return index === self.indexOf(elem);
          })
        }
        let job_log_hours: any = 0;
        for (let o = 0; o < this.job_name.length; o++) {
          temp_job_array = (this.job_data.filter(n => n.job == this.job_name[o]));
          for (let k = 0; k < temp_job_array.length; k++) {
            if (temp_job_array[k].task_duration_ms) {
              job_log_hours += temp_job_array[k].task_duration_ms;
            }
          }
          sub_job_arr.push({ 'name': this.job_name[o], 'y': this.millisecondsToHrs(job_log_hours), 'time': this.millisecondsToStr(job_log_hours) })
          job_log_hours = 0;
        }
        job_arr[m] = { 'name': this.project_name[m], 'id': this.project_name[m], 'data': sub_job_arr }
        sub_job_arr = [];
        this.job_name = [];
      }
      this.job_details1 = job_arr;
      // *****************job section ends**************
      if (this.project_data.length < 1) {
        this.no_data_found_project = true;
      }
      setTimeout(() => {
        Highcharts.chart('project_job', this.setchartoption1('column'));
      }, 1000);
      this.spinner.hide();
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
    })
  }

  // *********************** chart section for projects and jobs*****************************
  // for to show only hours format  Ex:32.444hrs
  millisecondsToHrs(milliseconds) {
    var value = 0;
    var temp = Math.floor(milliseconds / 1000);
    var hours = Math.floor(temp / 60 / 60);
    if (hours) {
      value += hours;
    }
    var minutes = Math.floor((temp / 60 / 60 - hours) * 60);
    if (minutes) {
      value = hours + (minutes / 60);
    }
    const roundedUp = parseFloat(value.toFixed(2))
    return roundedUp;
  }
  // for to show only hours format  Ex: HH:MM:SS
  millisecondsToStr1(milliseconds) {
    var value = "";
    var temp = Math.floor(milliseconds / 1000);
    var hours = Math.floor(temp / 60 / 60);
    if (hours) {
      if (hours < 10) {
        // value+= minutes + ' minute ' + this.numberEnding(minutes);
        value += '0' + hours + ' : ';
      }
      else {
        value += hours + ' : ';
      }
    }
    else {
      value += ' 00 : '
    }
    var minutes = Math.floor((temp / 60 / 60 - hours) * 60);
    if (minutes) {
      if (minutes < 10) {
        // value+= minutes + ' minute ' + this.numberEnding(minutes);
        value += ' 0' + minutes + ' : ';
      }
      else {
        value += minutes + ' : ';
      }
    }
    else {
      value += ' 00 : '
    }
    var seconds = Math.floor(((temp / 60 / 60 - hours) * 60 - minutes) * 60);
    if (seconds) {
      if (seconds < 10) {
        // value+= seconds + ' second' + this.numberEnding(seconds);
        value += ' 0' + seconds;
      }
      else {
        value += seconds;
      }
    }
    else {
      value += ' 00 '
    }
    if (value == ' 00 :  00 :  00 ') {
      value = ' NA '
    }
    else {
      value = value + (' HMS');
    }
    return value;
  }

  setchartoption1(e) {
    //pie chart
    this.options = {
      chart: {
        type: e
      },
      title: {
        text: 'User logged hours on projects/jobs',
        enabled: false,
        style: {
          fontSize: '16px'
        }
      },
      subtitle: {
        text: 'Click the columns to view jobs worked hours.'
      },
      accessibility: {
        announceNewData: {
          enabled: true
        }
      },
      xAxis: {
        type: 'category'
      },
      yAxis: {
        title: {
          text: 'Total logged hours'
        },

      },
      legend: {
        enabled: false
      },
      credits: {
        enabled: false,
      },
      plotOptions: {
        series: {
          borderWidth: 0,
          dataLabels: {
            enabled: true,
            // format: '({point.name})'y
          }
        }
      },
      tooltip: {
        // headerFormat: '<span style="font-size:11px">{series.name}</span><br>',
        // pointFormat: '<span style="color:{point.color}">{point.name}</span>: <b>{point.y:.2f}%</b> of total<br/>'
        pointFormat: '({point.time})'
      },
      series:
        [
          {
            name: "Project(s)",
            colorByPoint: true,
            data: this.project_data,
          }
        ],
      drilldown: {
        series:
          this.job_details1,
      }
    }
    return this.options;
  }

  viewComments() {
    const dialogRef = this.dialog.open(ViewCommentsComponent, {
      width: '35%',
      data: { "title": 'Comments', details: this.entiretimesheetDetails }
    });

    dialogRef.afterClosed().subscribe(result => {
      dialogRef.close();
    });
  }
  generateXLSX() { 
     this.timesheetContent = [];
    Object.keys(this.entiretimesheetDetails).forEach((k, i) => {
      for (let j = 0; j < this.entiretimesheetDetails[k].length; j++) {
        this.timesheetContent.push({
          "Date": moment(this.entiretimesheetDetails[k][j].date_of_request).format("DD-MM-YYYY"), "Task": this.entiretimesheetDetails[k][j].task, "Project": this.entiretimesheetDetails[k][j].project,
          "Job": this.entiretimesheetDetails[k][j].job, "Bill": this.entiretimesheetDetails[k][j].bill, "TaskDuration": this.entiretimesheetDetails[k][j].task_duration,
          "Status": this.entiretimesheetDetails[k][j].approval_status, "Approver": this.entiretimesheetDetails[k][j].reporter_name, "Comments": this.entiretimesheetDetails[k][j].approval_comments,
          
        });
      }
    })
    for (let i = 0; i < this.timesheetContent.length; i++) {
      this.timesheetArray = this.groupBy(this.timesheetContent, 'Date');
    }
    const fileName = this.employee+ "(" + moment(this.startdates).format("DD-MM-YYYY") + " to " + moment(this.enddates).format("DD-MM-YYYY") + " report"+".xlsx";
    const firstSheetName = "Summary";
    let wb = XLSX.utils.book_new();
    let ws: XLSX.WorkSheet;
    let sheetName;
    let timesheetCount: any = ({"Total": this.responselength, "Approved": this.approvedCount, "Rejected": this.rejectedCount, "Submitted": this.submittedCount, "Pending": this.pendingCount, "Not Submitted": this.notSubmittedCount });
    let firstSheet = XLSX.utils.json_to_sheet([timesheetCount]);
    XLSX.utils.book_append_sheet(wb, firstSheet, firstSheetName);
    Object.keys(this.timesheetArray).forEach((k, index) => {  
      sheetName = this.timesheetArray[k][0].Date;
      this.hoursData = [];
      this.billableHours = [];
      this.nonbillableHours = [];
      for(let i=0;i<this.timesheetArray[k].length;i++) {  
        if (this.hoursData.length == 0) {
          this.hoursData = this.timesheetArray[k][i].TaskDuration;
          } else {
          this.hoursData = this.addTime(this.hoursData, this.timesheetArray[k][i].TaskDuration);
        }

        if (this.timesheetArray[k][i].Bill == 'Billable') {
          if ((this.billableHours.length == 0)) {
            this.billableHours = this.timesheetArray[k][i].TaskDuration;
          } else {
            this.billableHours = this.addTime(this.billableHours, this.timesheetArray[k][i].TaskDuration);
          }
        } 
        else {
        if (this.timesheetArray[k][i].Bill == 'Non Billable') {
          if ((this.nonbillableHours.length == 0)) {
            this.nonbillableHours = this.timesheetArray[k][i].TaskDuration;
          } else {
            this.nonbillableHours = this.addTime(this.nonbillableHours, this.timesheetArray[k][i].TaskDuration);
          }
        }
      }
      }
       const newRow = { TotalHours: this.hoursData, TotalBillableHours: this.billableHours, TotalNonBillableHours: this.nonbillableHours };
      let sheetName1 =  `${sheetName}`;
      ws =  XLSX.utils.json_to_sheet(this.timesheetArray[k]);
      const lastRowIndex = ws['!ref'] ? ws['!ref'].split(':')[1].match(/\d+/g).map(Number).pop() : 0;
      XLSX.utils.sheet_add_json(ws, [newRow], { origin: lastRowIndex + 1});
      XLSX.utils.book_append_sheet(wb, ws, sheetName1);

      
    })
    XLSX.writeFile(wb, fileName);
  }
  generateXLS() {
  this.timesheetContent = [];
  Object.keys(this.entiretimesheetDetails).forEach((k, i) => {
    for (let j = 0; j < this.entiretimesheetDetails[k].length; j++) {
      this.timesheetContent.push({
        "Date": moment(this.entiretimesheetDetails[k][j].date_of_request).format("DD-MM-YYYY"), "Task": this.entiretimesheetDetails[k][j].task, "Project": this.entiretimesheetDetails[k][j].project,
        "Job": this.entiretimesheetDetails[k][j].job, "Bill": this.entiretimesheetDetails[k][j].bill, "TaskDuration": this.entiretimesheetDetails[k][j].task_duration,
        "Status": this.entiretimesheetDetails[k][j].approval_status, "Approver": this.entiretimesheetDetails[k][j].reporter_name, "Comments": this.entiretimesheetDetails[k][j].approval_comments,
        
      });
    }
  })
  for (let i = 0; i < this.timesheetContent.length; i++) {
    this.timesheetArray = this.groupBy(this.timesheetContent, 'Date');
  }
  const fileName = this.employee+ "(" + moment(this.startdates).format("DD-MM-YYYY") + " to " + moment(this.enddates).format("DD-MM-YYYY") + " report" + ".xls";
  const firstSheetName = "Summary";
  let wb = XLSX.utils.book_new();
  let ws: XLSX.WorkSheet;
  let sheetName;
  let timesheetCount: any = ({"Total": this.responselength, "Approved": this.approvedCount, "Rejected": this.rejectedCount, "Submitted": this.submittedCount, "Pending": this.pendingCount, "Not Submitted": this.notSubmittedCount });
  let firstSheet = XLSX.utils.json_to_sheet([timesheetCount]);
  XLSX.utils.book_append_sheet(wb, firstSheet, firstSheetName);

  Object.keys(this.timesheetArray).forEach((k, index) => {  
    sheetName = this.timesheetArray[k][0].Date;
    this.hoursData = [];
    this.billableHours = [];
    this.nonbillableHours = [];
    for(let i=0;i<this.timesheetArray[k].length;i++) {  
      if (this.hoursData.length == 0) {
        this.hoursData = this.timesheetArray[k][i].TaskDuration;
        } else {
        this.hoursData = this.addTime(this.hoursData, this.timesheetArray[k][i].TaskDuration);
      }

      if (this.timesheetArray[k][i].Bill == 'Billable') {
        if ((this.billableHours.length == 0)) {
          this.billableHours = this.timesheetArray[k][i].TaskDuration;
        } else {
          this.billableHours = this.addTime(this.billableHours, this.timesheetArray[k][i].TaskDuration);
        }
      } 
      else {
      if (this.timesheetArray[k][i].Bill == 'Non Billable') {
        if ((this.nonbillableHours.length == 0)) {
          this.nonbillableHours = this.timesheetArray[k][i].TaskDuration;
        } else {
          this.nonbillableHours = this.addTime(this.nonbillableHours, this.timesheetArray[k][i].TaskDuration);
        }
      }
    }
    }
     const newRow = { TotalHours: this.hoursData, TotalBillableHours: this.billableHours, TotalNonBillableHours: this.nonbillableHours };
    let sheetName1 = `${sheetName}`;
    ws = XLSX.utils.json_to_sheet(this.timesheetArray[k]);
    const lastRowIndex = ws['!ref'] ? ws['!ref'].split(':')[1].match(/\d+/g).map(Number).pop() : 0;
    XLSX.utils.sheet_add_json(ws, [newRow], { origin: lastRowIndex + 1});
    XLSX.utils.book_append_sheet(wb, ws, sheetName1);    
  })
  XLSX.writeFile(wb, fileName);
}
  generateCSV() {
    this.timesheetContent = [];
    Object.keys(this.entiretimesheetDetails).forEach((k, i) => {
      for (let j = 0; j < this.entiretimesheetDetails[k].length; j++) {
        if (this.entiretimesheetDetails[k][j].approval_comments == undefined && this.entiretimesheetDetails[k][j].reporter_name == undefined) {
          this.timesheetContent.push({
            "Date": moment(this.entiretimesheetDetails[k][j].date_of_request).format("DD-MM-YYYY"), "Task": this.entiretimesheetDetails[k][j].task, "Project": this.entiretimesheetDetails[k][j].project,
            "Job": this.entiretimesheetDetails[k][j].job, "Bill": this.entiretimesheetDetails[k][j].bill, "Task Duration": this.entiretimesheetDetails[k][j].task_duration,
            "Status": this.entiretimesheetDetails[k][j].approval_status, "Approver": '-', "Comments": '-'
          });

        }
        else if (this.entiretimesheetDetails[k][j].reporter_name == undefined) {
          this.timesheetContent.push({
            "Date": moment(this.entiretimesheetDetails[k][j].date_of_request).format("DD-MM-YYYY"), "Task": this.entiretimesheetDetails[k][j].task, "Project": this.entiretimesheetDetails[k][j].project,
            "Job": this.entiretimesheetDetails[k][j].job, "Bill": this.entiretimesheetDetails[k][j].bill, "Task Duration": this.entiretimesheetDetails[k][j].task_duration,
            "Status": this.entiretimesheetDetails[k][j].approval_status, "Approver": '-', "Comments": this.entiretimesheetDetails[k][j].approval_comments
          });

        }
        else if (this.entiretimesheetDetails[k][j].approval_comments == undefined) {
          this.timesheetContent.push({
            "Date": moment(this.entiretimesheetDetails[k][j].date_of_request).format("DD-MM-YYYY"), "Task": this.entiretimesheetDetails[k][j].task, "Project": this.entiretimesheetDetails[k][j].project,
            "Job": this.entiretimesheetDetails[k][j].job, "Bill": this.entiretimesheetDetails[k][j].bill, "Task Duration": this.entiretimesheetDetails[k][j].task_duration,
            "Status": this.entiretimesheetDetails[k][j].approval_status, "Approver": this.entiretimesheetDetails[k][j].reporter_name, "Comments": '-'
          });

        }
        else {
          this.timesheetContent.push({
            "Date": moment(this.entiretimesheetDetails[k][j].date_of_request).format("DD-MM-YYYY"), "Task": this.entiretimesheetDetails[k][j].task, "Project": this.entiretimesheetDetails[k][j].project,
            "Job": this.entiretimesheetDetails[k][j].job, "Bill": this.entiretimesheetDetails[k][j].bill, "Task Duration": this.entiretimesheetDetails[k][j].task_duration,
            "Status": this.entiretimesheetDetails[k][j].approval_status, "Approver": this.entiretimesheetDetails[k][j].reporter_name, "Comments": this.entiretimesheetDetails[k][j].approval_comments
          });
        }
      }
    })
    this.exportservice.exportAsExcelFile(this.timesheetContent, this.employee+ "(" + moment(this.startdates).format("DD-MM-YYYY") + " to " + moment(this.enddates).format("DD-MM-YYYY") + " report", "csv");
  }
//Implement scroll, at first show 5 data,while scrolling need to show the remaining data

//    @HostListener("window:scroll", [])
//   onScroll(): void {
//     if (this.bottomReached()) {
//       this.entiretimesheetDetails = [...this.entiretimesheetDetails, this.count++];
//     }
//   }

//   bottomReached(): boolean {
//     return (window.innerHeight + window.scrollY) >= document.body.offsetHeight;
//   }
}
  // Codes to generate timehseet as pdf
  // generatePDF(data: any) {
  //   data = this.entiretimesheetDetails;
  //   let textContent;
  //   for (let date in data) {
  //     if (data.hasOwnProperty(date)) {
  //       let tasksForDate = data[date];
  //        textContent = this.generateTextContentForDate(date, tasksForDate);
  //     }
  //   }    
  //   this.convertHtmlToPdf(textContent, `Timesheet.pdf`);
  // }

  // generateTextContentForDate(date: string, tasks: any[]): string {  
  //   // let htmlContent = `<h2>${date}</h2><table border="1"><thead><tr><th>Task</th>
  //   // <th>Project</th><th>Job</th><th>Bill</th><th>Task Duration</th><th>Task</th></tr></thead><tbody>`;

  //   // tasks.forEach((task) => {
  //   //   htmlContent += `<tr><td>${task.task}</td></tr><tr><td>${task.project}</td></tr>
  //   //   <tr><td>${task.job}</td></tr><tr><td>${task.bill}</td></tr><tr><td>${task.task_duration}</td></tr>`;  
  //   // });

  //   // htmlContent += `</tbody></table>`;
  //   // return htmlContent;  
  //   tasks.forEach((task) => {
  //     let textContent;
  //     if(task.approval_comments != undefined || task.reporter_name!= undefined) {
  //       textContent += `Date: ${date}\n`; 
  //       textContent += `Task: ${task.task}\n`;  
  //       textContent += `Project: ${task.project}\n`;  
  //       textContent += `Job: ${task.job}\n`;  
  //       textContent += `Bill: ${task.bill}\n`;  
  //       textContent += `task Duration: ${task.task_duration}\n`;  
  //       textContent += `Comment: ${task.approval_comments}\n`;  
  //       textContent += `Approver: ${task.reporter_name}\n`;  
  //       textContent += '\n'; 
  //       this.timesheetContent.push(textContent);  
  //     } else {
  //       textContent += `Date: ${date}\n`; 
  //       textContent += `Task: ${task.task}\n`;  
  //       textContent += `Project: ${task.project}\n`;  
  //       textContent += `Job: ${task.job}\n`;  
  //       textContent += `Bill: ${task.bill}\n`;  
  //       textContent += `task Duration: ${task.task_duration}\n`;  
  //       textContent += '\n'; 
  //       this.timesheetContent.push(textContent);
  //     }
  //   });

  //   return this.timesheetContent;
  // }

  // convertHtmlToPdf(htmlContent: string, pdfFileName: string): void {
  //   html2canvas(document.body, { scale: 2 }).then((canvas) => {
  //     const imgData = canvas.toDataURL('image/png');
  //     const pdf = new jsPDF();
  //     const imgWidth = pdf.internal.pageSize.getWidth();
  //     const imgHeight = (canvas.height * imgWidth) / canvas.width;
  //     pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);

  //     // Convert HTML content to PDF
  //     pdf.html(htmlContent, {
  //       callback: () => {
  //         pdf.save(pdfFileName);
  //       },
  //     });
  //   });
  // }

  

