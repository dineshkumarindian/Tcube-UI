import { Component, OnInit, ViewChild } from '@angular/core';
import { ReplaySubject, Subject } from 'rxjs';
import { FormBuilder, UntypedFormControl, FormGroup, Validators } from '@angular/forms';
import { EmployeeService } from 'src/app/services/employee.service';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { LeaveTrackerService } from 'src/app/services/leave-tracker.service';
import { TimeTrackerService } from 'src/app/services/time-tracker.service';
import { AttendanceServiceService } from 'src/app/services/attendance-service.service';
import { takeUntil } from 'rxjs/operators';
import * as moment from 'moment-timezone';
import { PerformanceMetricsService } from 'src/app/services/performance-metrics/performance-metrics.service';
import * as Highcharts from 'highcharts/highstock';
import { errorMessage, noDataMessage } from '../util/constants';
import Drilldown from 'highcharts/modules/drilldown';
import { DomSanitizer } from '@angular/platform-browser';
import { SettingsService } from 'src/app/services/settings.service';
import { ExportService } from 'src/app/services/export.service';
import { GitlabIntegrationService } from "src/app/services/app-integration/gitlab-service/gitlab-integration.service";
import { DatePipe } from '@angular/common';
import { NgxCaptureService } from 'ngx-capture';
import { jsPDF } from 'jspdf';
import axios from 'axios';
Drilldown(Highcharts);
@Component({
  selector: 'app-performance-metrics',
  templateUrl: './performance-metrics.component.html',
  styleUrls: ['./performance-metrics.component.less']
})
export class PerformanceMetricsComponent implements OnInit {
  requiredMessage = errorMessage;
  nodataMsg = noDataMessage;
  employeeData: any[] = [];
  org_id: any;
  customdate: boolean = false;
  customdatevalidation: boolean = false;
  daterangevalidation: boolean = false;
  startDate: any;
  endDate: any;
  maxDate: Date;
  show: boolean = false;
  options: any;
  Emp_logged_hours: any = 0;
  protected dateData: any[] = [
    { data: 'This Month', id: 1 },
    { data: 'Last Month', id: 2 },
    { data: 'First-Quarter', id: 3 },
    { data: 'Second-Quarter', id: 4 },
    { data: 'Third-Quarter', id: 5 },
    { data: 'Fourth-Quarter', id: 6 },
    { data: 'First-Half', id: 7 },
    { data: 'Second-Half', id: 8 },
    { data: 'This Year', id: 9 },
    { data: 'Last Year', id: 10 },
    { data: 'Custom Date', id: 11 }
  ];

  constructor(private employeeService: EmployeeService,
    private router: Router,
    private spinner: NgxSpinnerService,
    private leaveTrackerService: LeaveTrackerService,
    private performanceMetricsService: PerformanceMetricsService,
    private timetrackerservice: TimeTrackerService,
    private attendanceService: AttendanceServiceService,
    private domSanitizer: DomSanitizer,
    private settingsService: SettingsService,
    private exportservice: ExportService,
    private gitlabService: GitlabIntegrationService,
    private captureService: NgxCaptureService) { }
  @ViewChild('screen', { static: true }) screen: any;
  ngOnInit() {
    this.org_id = localStorage.getItem('OrgId');
    this.maxDate = new Date();
    this.userCtrl = new UntypedFormControl("", [Validators.required]);
    this.getOrgEmployees();
    this.filtereddate.next(this.dateData.slice());
    // listen for search field value changes
    this.dateFilterCtrl.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        this.filterDate();
      });

    // ***************load the initial employee list*************
    this.filtereduser.next(this.employeeData.slice());

    // listen for search field value changes
    this.userFilterCtrl.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        this.filterEmployee();
      });
    // setTimeout(() => {
    //   Highcharts.chart('project_job', this.setchartoption1());
    // }, 1000);
    // this.Initial_projectDetails();
  }
  /** control for the MatSelect filter keyword */
  public dateFilterCtrl: UntypedFormControl = new UntypedFormControl();
  /** list of client filtered by search keyword */
  public filtereddate: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);

  /** control for the selected start date range */
  public start: UntypedFormControl = new UntypedFormControl("", [Validators.required]);

  /** control for the selected end date  range */
  public end: UntypedFormControl = new UntypedFormControl("", [Validators.required]);
  /** control for the selected date range */
  public dateCtrl: UntypedFormControl = new UntypedFormControl("", [Validators.required]);


  /** control for the MatSelect filter keyword */
  public userFilterCtrl: UntypedFormControl = new UntypedFormControl();

  /** control for the selected user */
  public userCtrl: UntypedFormControl = new UntypedFormControl("", [Validators.required]);

  /** list of client filtered by search keyword */
  public filtereduser: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);

  protected _onDestroy = new Subject<void>();
  // --------------------------------Filter employee field function---------------------------
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

  // --------------------------------Filter Date field function-----------------------------
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
  // ---------------------------------get org employees name and id--------------------------------
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

      }
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
    })
  }
  //---------------------------------show the active employee report------------------------
  activeusers: boolean = true;
  inactiveusers: boolean = false;
  protected inativateemployeeData: any[] = [];
  protected ativateemployeeData: any[] = [];
  inactiveUsers() {
    this.activeusers = false;
    this.inactiveusers = true;
    if (this.inactiveusers == true) {
      this.employeeData = this.inativateemployeeData;
      this.filterEmployee();
    }
    this.cancelform();
    this.show = false;
    this.start = new UntypedFormControl("", [Validators.required]);
    this.end = new UntypedFormControl("", [Validators.required]);
    this.dateCtrl = new UntypedFormControl("", [Validators.required]);
    this.userCtrl = new UntypedFormControl("", [Validators.required]);
    this.customdate = false;
    this.customdatevalidation = false;
    this.daterangevalidation = false;
  }
  activeUsers() {
    this.activeusers = true;
    this.inactiveusers = false;
    if (this.inactiveusers == false) {
      this.employeeData = this.ativateemployeeData;
      this.filterEmployee();
    }
    this.cancelform();
    this.show = false;
    this.start = new UntypedFormControl("", [Validators.required]);
    this.end = new UntypedFormControl("", [Validators.required]);
    this.dateCtrl = new UntypedFormControl("", [Validators.required]);
    this.userCtrl = new UntypedFormControl("", [Validators.required]);
    this.customdate = false;
    this.customdatevalidation = false;
    this.daterangevalidation = false;
  }

  selectChangeHandler(data) {
    if (data == "Custom Date") {
      this.customdate = true;
      this.start = new UntypedFormControl("", [Validators.required]);
      this.end = new UntypedFormControl("", [Validators.required]);
    }
    else {
      if (data == "This Month") {
        this.startDate = moment().startOf("month").toDate();
        this.endDate = moment().endOf("month").toDate();
      }
      if (data == "Last Month") {
        this.startDate = moment().subtract(1, 'month').startOf("month").toDate();
        this.endDate = moment().subtract(1, 'month').endOf("month").toDate();
      }
      if (data == "First-Quarter") {
        this.startDate = moment().startOf("year").toDate();
        this.endDate = moment().endOf("year").subtract(9, 'month').toDate();
      }
      if (data == "Second-Quarter") {
        this.startDate = moment().startOf("year").add(3, 'month').toDate();
        this.endDate = moment().endOf("year").subtract(6, 'month').toDate();
      }
      if (data == "Third-Quarter") {
        this.startDate = moment().startOf("year").add(6, 'month').toDate();
        this.endDate = moment().endOf("year").subtract(3, 'month').toDate();
      }
      if (data == "Fourth-Quarter") {
        this.startDate = moment().startOf("year").add(9, 'month').toDate();
        this.endDate = moment().endOf("year").toDate();
      }
      if (data == "First-Half") {
        this.startDate = moment().startOf("year").toDate();
        this.endDate = moment().endOf("year").subtract(6, 'month').toDate();
      }
      if (data == "Second-Half") {
        this.startDate = moment().startOf("year").add(6, 'month').toDate();
        this.endDate = moment().endOf("year").toDate();
      }
      if (data == "This Year") {
        this.startDate = moment().startOf("year").toDate();
        this.endDate = moment().endOf("year").toDate();
      }
      if (data == "Last Year") {
        this.startDate = moment().subtract(1, "year").startOf("year").toDate();
        this.endDate = moment().subtract(1, "year").endOf("year").toDate();
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

  //  ! To Date field validation
  todatechange() {
    if (this.end.value == "") {
      this.customdatevalidation = false;
    }
    else {
      this.customdatevalidation = true;
    }
  }

  // -----------------------To cancel form function-------------------------

  cancelform() {
    this.show = false;
    this.start = new UntypedFormControl("", [Validators.required]);
    this.end = new UntypedFormControl("", [Validators.required]);
    this.dateCtrl = new UntypedFormControl("", [Validators.required]);
    this.userCtrl = new UntypedFormControl("", [Validators.required]);
    this.customdate = false;
    this.customdatevalidation = false;
    this.daterangevalidation = false;
    this.report = false;
    this.url = [];
    this.Emp_details = [];
  }
  billable: any;
  non_billable: any;
  No_Data_Found_mybillable: boolean = false;
  report: boolean = false;

  async getReport() {
    this.spinner.show();
    this.report = true;
    this.show = true;
    this.getEmpDetailsById(this.userCtrl.value);
    // this.TogetgitDetails(this.userCtrl.value);
    this.gettaskDetails();
    this.getBarChartDataForAttendance();
    this.getEmpDateRangeApprovedLeaves();
    this.getActiveLeaveTypeByOrgIdAndDatesForData();
    await this.getBillableNonBillable();
    this.spinner.hide();
  }
  empId: any = [];
  selectEmploy(event) {
    this.empId = event;
  }

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

  // *************************To get employee deatils by id*******************
  Emp_details: any = [];
  username: any = [];
  userid: any = [];
  url: any = [];
  imgAvailable: boolean = false;
  getEmpDetailsById(id) {
    this.settingsService.getActiveEmpDetailsById(id).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        let response = JSON.parse(data.map.data);
        this.Emp_details = response;
        this.Emp_email = this.Emp_details.email;
        // ----------to get emp_name---------------------
        this.username = this.Emp_details.firstname + ' ' + this.Emp_details.lastname;
        this.userid = id;
        // console.log(this.responsibility);
        if (response.profile_image != undefined) {
          this.imgAvailable = true;
          let stringArray = new Uint8Array(response.profile_image);
          const STRING_CHAR = stringArray.reduce((data, byte) => {
            return data + String.fromCharCode(byte);
          }, '');
          let base64String = btoa(STRING_CHAR);
          this.url = this.domSanitizer.bypassSecurityTrustUrl("data:image/jpeg;base64," + base64String);
        } else this.imgAvailable = false;
      }
      // console.log(this.Details);
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
    })
  }

  // --------------------Ended/-------------------------------

  // ************************************************Billable and Non Bilabe bar chart section **********************************************************

  getBillableNonBillable() {
    return new Promise<void>((resolve, reject) => {
      this.No_Data_Found_mybillable = false;
      if (this.customdate == true) {
        this.startDate = moment(this.start.value).toDate();
        this.endDate = moment(this.end.value).endOf("day").toDate();
      }
      let formdata = {
        "empid": this.userCtrl.value,
        "startdate": moment(this.startDate).format("DD-MM-YYYY"),
        "enddate": moment(this.endDate).format("DD-MM-YYYY"),
      }
      let subscription1 = this.timetrackerservice.getbillingchartmonth(formdata).subscribe(data => {
        if (data.map.statusMessage == "Success") {
          let response: any = data.map.data.map;
          if (response.billable_time == 0 && response.non_billable_time == 0) {
            this.No_Data_Found_mybillable = true;
          }
          this.billable = Number(response.billable_time);
          this.non_billable = Number(response.non_billable_time);
        }

        setTimeout(() => {
          Highcharts.chart('bill_status', this.setchartoption());
        }, 1000);
        resolve()
      }, (error) => {
        this.router.navigate(["/404"]);
        this.spinner.hide();

      })
    });
  }

  //************ chart section for billable and non billable**************** */ 

  setchartoption() {
    //pie chart
    this.options = {
      chart: {
        plotBackgroundColor: null,
        plotBorderWidth: null,
        type: 'pie'
      },
      credits: {
        enabled: false
      },
      title: {
        text: 'Billable/Non Billable Status',
        style: {
          fontSize: '16px'
        }
      },
      tooltip: {
        pointFormat: '{series.name}: {point.percentage:.1f}% ({point.time})'
      },
      accessibility: {
        point: {
          valueSuffix: '%'
        }
      },
      plotOptions: {
        pie: {
          // size: '200px',
          allowPointSelect: true,
          cursor: 'pointer',

          dataLabels: {
            enabled: true,
            format: '{point.name}: {point.percentage:.1f} % ({point.time})'
          },
          showInLegend: true
        }
      },
      series: [{
        name: 'Hours',
        colorByPoint: true,
        data: [{
          name: 'Billable',
          y: this.billable,
          color: '#ff6e40',
          sliced: true,
          selected: true,
          // time: this.billable_time
          time: this.millisecondsToStr(this.billable)
        }, {
          name: 'Non Billable',
          color: '#6FB2D2',
          y: this.non_billable,
          // time: this.non_billable_time
          time: this.millisecondsToStr(this.non_billable)
        }]
      }]
    }
    return this.options;
  }

  // ************************************************Billable and Non Bilabe bar chart section ended ***************************************************

  // *********************************************************project and job section ****************************************************************
  All_details: any[];
  project_name: any = [];
  job_name: any = [];
  project_details: any = [];
  project_details1: any = [];
  job_details: any = [];
  job_details1: any = [];
  no_data_found_project: boolean = false;
  gettaskDetails() {
    this.Emp_logged_hours = 0;
    this.project_details = [];
    this.job_details1 = [];
    this.All_details = [];
    this.project_name = [];
    this.no_data_found_project = false;
    // this.spinner.show();
    if (this.customdate == true) {
      this.startDate = moment(this.start.value).toDate();
      this.endDate = moment(this.end.value).endOf("day").toDate();
    }
    let formdata = {
      "empid": this.userCtrl.value,
      "start_date": moment(this.startDate).format("YYYY-MM-DD"),
      "enddate": moment(this.endDate).format("YYYY-MM-DD"),
    }
    let subscription1 = this.timetrackerservice.getTaskDetails(formdata).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        let response: any[] = JSON.parse(data.map.data);
        this.All_details = response;
      }
      // *******************For project chart section*************************
      let arr: any = [];
      this.project_details = [];
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
        this.project_details = arr;
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
        this.job_details = this.All_details.filter(n => n.project == this.project_name[m]);
        for (let n = 0; n < this.job_details.length; n++) {
          this.job_name.push(this.job_details[n].job);
          this.job_name = this.job_name.filter(function (elem, index, self) {
            return index === self.indexOf(elem);
          })
        }
        let job_log_hours: any = 0;
        for (let o = 0; o < this.job_name.length; o++) {
          temp_job_array = (this.job_details.filter(n => n.job == this.job_name[o]));
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
      if (this.project_details.length < 1) {
        this.no_data_found_project = true;
      }
      setTimeout(() => {
        Highcharts.chart('project_job', this.setchartoption1('column'));
      }, 1000);
      // this.spinner.hide();
    }, (error) => {
      this.router.navigate(["/404"]);
    })
  }

  // *********************** chart section for projects and jobs*****************************

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
        // type: '({point.name})',
        // labels: {
        //   formatter: function () {
        //     return Highcharts.dateFormat("%H", '({point.time})');
        //   }
        // }
        // labels: {           
        //   formatter: function () {
        //     //get the timestamp
        //     var time = '({point.time})';
        //     var hours1 = parseInt('({point.time})');
        //     return time + ':' + 'hi';
        //     //now manipulate the timestamp as you wan using data functions
        //   }
        // }

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
            data: this.project_details,
          }
        ],
      drilldown: {
        series:
          this.job_details1,
      }
    }
    return this.options;
  }

  // *********************************************************project and job section ended****************************************************************


  // ******************************************************Leave tracker section***********************************************************************
  tempData: any = [];
  Leavetype: any = [];
  leaveCounts: any = [];
  list_empId: any = [];
  No_data_found_onleave: boolean = false;
  getActiveLeaveTypeByOrgIdAndDatesForData() {
    this.tempData = []
    this.Leavetype = [];
    this.leaveCounts = [];
    this.list_empId = [];
    this.No_data_found_onleave = false;
    // this.spinner.show();
    if (this.customdate == true) {
      this.startDate = moment(this.start.value).toDate();
      this.endDate = moment(this.end.value).endOf("day").toDate();
    }
    this.list_empId.push(this.userCtrl.value);
    let formdata = {
      "emp_id": this.list_empId,
      "org_id": localStorage.getItem("OrgId"),
      "start_date": moment(this.startDate).format("YYYY-MM-DD"),
      "end_date": moment(this.endDate).format("YYYY-MM-DD"),
    }

    this.leaveTrackerService.getActiveleaveByEmpIdAndYearByOrgid1(formdata).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        let response = JSON.parse(data.map.data);
        if (response.length > 0) {
          // this.username=response[0].emp_name;
        }
        if (response.length == 0) {
          this.No_data_found_onleave = true;
        }
        else {
          this.tempData = [];
          this.tempData = response.filter(a => a.approval_status == 'Approved');
          if (this.tempData.length == 0) {
            this.No_data_found_onleave = true;
          }
        }
        // -------------------- for to get leave types arrray with dublicate removing-----------------------

        let tempdata = this.tempData.map(n => n.leave_type);
        this.Leavetype = tempdata.filter(function (elem, index, self) {
          return index === self.indexOf(elem);
        })
        for (let j = 0; j < this.Leavetype.length; j++) {
          // -----------------To get leaveconts----------------------

          let details = this.tempData.filter(n => n.leave_type == this.Leavetype[j]);
          let counts = details.reduce((val, fi) => val + fi.total_days, 0);
          // let counts = details.reduce(function(val, fi) {return val + fi.total_days } ,0);
          this.leaveCounts.push(counts);
        }

      }

      // if (this.Single_user && this.tempData.length > 0) {
      setTimeout(() => {
        Highcharts.chart('container', this.setchartoptionforleave_tracker());
        // this.spinner.hide();
      }, 1000);
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
    });
  }
  options_all: any;
  Colorarray: any = [];

  // *****************chart section for leave section*************************

  setchartoptionforleave_tracker() {
    this.options = {
      chart: {
        type: 'column',
      },
      // exporting: {
      //   enabled: true,
      //     menuItemDefinitions: {
      //         // Custom definition
      //         switchChart: {
      //             onclick: function() {
      //                 var chartType = this.options.chart.type;

      //                 this.update({
      //                     chart: {
      //                         type: chartType === 'bar' ? 'pie' : 'bar'
      //                     }
      //                 })
      //             },
      //             text: 'Switch chart'
      //         }
      //     },
      //     buttons: {
      //         contextButton: {
      //             menuItems: ["switchChart", "separator", "printChart", "separator", "downloadPNG", "downloadJPEG", "downloadPDF", "downloadSVG"]
      //         }
      //     }
      // },
      title: false,
      // {
      //   // text: 'Leave report',
      // },
      subtitle: {
        // text: 'Click the bar to view the full details in table',
      },
      xAxis: {
        categories: this.Leavetype,
        title: {
          text: 'leaves',
        },
      },
      yAxis: {
        min: 0,
        title: {
          text: 'Days count',
          align: 'middle',
        },
        labels: {
          overflow: 'justify',
        },
      },
      tooltip: {
        headerFormat: "",
        useHTML: true,
        pointFormat: 'Leaves Taken : {point.y:.1f}',
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
            format: '{point.y:.1f}',
          }
        },
        // showInLegend: true,
      },
      legend: false,
      // {
      //   layout: 'none',
      //   align: 'none',
      //   veriticalAlign: 'none',
      //   x: 0,
      //   y: 0,
      //   floating: true,
      //   borderWidth: 2,
      //   shadow: true,
      // },
      credits: {
        enabled: false,
      },
      series: [
        {
          name: 'Leaves taken',
          data: this.leaveCounts,
          // color: this.Colorarray,
          // events: {
          //   click: (event) => {
          //     this.Showtable(event.point.category);
          //   },
          // },
          colorByPoint: true
        }],
      // colors: this.Colorarray,

    };
    return this.options;
  }

  // ******************************************************Leave tracker section ended***********************************************************************

  // ******************************************************Attendance  section***********************************************************************

  email: any;
  dataSourceBarChart: any = [];
  xAxisBarChart: any = [];
  no_data_found: boolean = false;

  // ***********date attendance report************
  Emp_checkin_hours: any;
  Total_checkin_hours: any;
  getBarChartDataForAttendance() {
    this.Emp_checkin_hours = 0;
    // this.spinner.show();
    this.no_data_found = false;
    this.email = (this.employeeData.filter(n => n.id == this.userCtrl.value));
    this.email = this.email[0].mail;
    if (this.customdate == true) {
      this.startDate = moment(this.start.value).toDate();
      this.endDate = moment(this.end.value).endOf("day").toDate();
    }
    let formdata = {
      "email": this.email,
      "startdate": moment(this.startDate).format("DD-MM-YYYY"),
      "enddate": moment(this.endDate).format("DD-MM-YYYY"),
    }
    this.attendanceService.getDateBarChartReport(formdata).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        this.dataSourceBarChart = data.map.data.chart_data;
        if (this.dataSourceBarChart.length < 1) {
          this.no_data_found = true;
        }
        this.xAxisBarChart = data.map.data.dates_x_axis;
        Highcharts.chart('Attendance_container', this.setAttendancechartoption());
        // ******for to get check hours *********
        for (let g = 0; g < this.dataSourceBarChart.length; g++) {
          this.Emp_checkin_hours += this.dataSourceBarChart[g][1];
        }
        this.Total_checkin_hours = this.millisecondsToStr1((this.Emp_checkin_hours * 3600000));
        this.Emp_checkin_hours = this.Averagecalculation((this.Emp_checkin_hours * 3600000));
      }
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
    })
  }

  // ***********chart section************

  setAttendancechartoption() {
    // ************For scroll bar chart**********************
    if (this.dataSourceBarChart.length > 15) {
      this.options = {
        chart: {
          renderTo: 'Attendance_container',
          type: 'column',
          options3d: {
            enabled: true,
            alpha: 1,
            beta: 1,
            depth: 50,
            viewDistance: 25
          }
        },
        xAxis: {
          categories: this.xAxisBarChart,
          min: 0,
          max: 15,
          scrollbar: {
            enabled: true,
            height: 5,
            barBorderRadius: 1,
            cursor: Highcharts.Pointer
          },
          labels: {
            style: {
              color: '#00214c',
            }
          }
        },
        yAxis: {
          title: {
            enabled: true,
            text: 'Hours'
          }
        },
        tooltip: {
          headerFormat: '<b>{point.key}</b><br>',
          pointFormat: 'Present Hours: {point.y:.2f} Hrs'
        },
        title: {
          text: '',
          style: {
            display: 'none'
          }
        },
        legend: {
          enabled: false
        },
        plotOptions: {
          column: {
            depth: 25

          }
        },
        series: [{
          name: 'Population',
          data: this.dataSourceBarChart,
          dataLabels: {
            enabled: true,
            //rotation: -90,
            color: '#000',
            align: 'center',
            format: '{point.y:.2f} Hrs', // two decimal
            y: -25, // 50 pixels top from the bar
            style: {
              // fontSize: '12px',
              fontFamily: 'Verdana, sans-serif'
            },
          },
          colorByPoint: true
        }],
        colors: ['#053220', '#EF5B0C', '#2f7ed8', '#0d233a'],
        credits: {
          enabled: false
        },
      }
    }
    // ************For without  scroll bar chart**********************
    else {
      this.options = {
        chart: {
          renderTo: 'Attendance_container',
          type: 'column',
          options3d: {
            enabled: true,
            alpha: 1,
            beta: 1,
            depth: 50,
            viewDistance: 25
          }
        },
        xAxis: {
          categories: this.xAxisBarChart,
          labels: {
            style: {
              color: '#00214c',
            }
          }
        },
        yAxis: {
          title: {
            enabled: true,
            text: 'Hours'
          }
        },
        tooltip: {
          headerFormat: '<b>{point.key}</b><br>',
          pointFormat: 'Present Hours: {point.y:.2f} Hrs'
        },
        title: {
          // text: 'Date Attendance Reports',
          // style: {
          //   color: '#00214c',
          // }
          text: '',
          style: {
            display: 'none'
          }
        },
        // subtitle: {
        //   text: 'Source: ' +
        //     '<a href="https://ofv.no/registreringsstatistikk"' +
        //     'target="_blank">OFV</a>'
        // },
        legend: {
          enabled: false
        },
        plotOptions: {
          column: {
            depth: 25

          }
        },
        series: [{
          name: 'Population',
          data: this.dataSourceBarChart,
          dataLabels: {
            enabled: true,
            //rotation: -90,
            color: '#000',
            align: 'center',
            format: '{point.y:.2f} Hrs', // two decimal
            y: -25, // 50 pixels top from the bar
            style: {
              // fontSize: '12px',
              fontFamily: 'Verdana, sans-serif'
            },
          },
          colorByPoint: true
        }],
        colors: ['#053220', '#EF5B0C', '#2f7ed8', '#0d233a'],
        credits: {
          enabled: false
        },
      }
    }

    return this.options;
  }

  // ***********attendance report************

  no_data_found_attendance: boolean = false;
  noOfleave: any = []
  pieoptions: any = []
  noOfpresentday: any = 0;
  alldetails: any = [];
  getEmpDateRangeApprovedLeaves() {
    this.no_data_found_attendance = false;
    if (this.customdate == true) {
      this.startDate = moment(this.start.value).toDate();
      this.endDate = moment(this.end.value).endOf("day").toDate();
    }
    let formdata = {
      "empid": this.userCtrl.value,
      "startdate": moment(this.startDate).format("DD-MM-YYYY"),
      "enddate": moment(this.endDate).format("DD-MM-YYYY")
    }
    this.leaveTrackerService.getEmpDateRangeApprovedLeaves(formdata).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        var response = JSON.parse(data.map.data);
        let counts = response.reduce((val, fi) => val + fi.total_days, 0);
        this.noOfleave = counts;
        // this.spinner.hide();\
      }
    },
      (error) => {
        this.router.navigate(["/404"]);
        this.spinner.hide();
      });
    this.getpresentcounts();
  }
  async getpresentcounts() {
    if (this.customdate == true) {
      this.startDate = moment(this.start.value).toDate();
      this.endDate = moment(this.end.value).endOf("day").toDate();
    }
    let formData = {
      "email": this.email,
      "startdate": moment(this.startDate).format("DD-MM-YYYY"),
      "enddate": moment(this.endDate).format("DD-MM-YYYY")
    }
    await this.attendanceService.getMonthreportdata(formData).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        this.alldetails = JSON.parse(data.map.details);
        this.noOfpresentday = this.alldetails.length;
        if (this.noOfleave == 0 && this.noOfpresentday == 0) {
          this.no_data_found_attendance = true;
        }
        Highcharts.chart('piechart', this.setpiechartoption());
      }
      else {
        Highcharts.chart('piechart', this.setpiechartoption());
      }
    },
      (error) => {
        this.router.navigate(["/404"]);
        this.spinner.hide();
      });
  }

  // *********** chart for attendance report************ 
  setpiechartoption() {
    this.pieoptions = {
      chart: {
        plotBackgroundColor: null,
        plotBorderWidth: null,
        plotShadow: false,
        type: 'pie'
      },
      title: {
        // text: 'Present and Absent data'
        text: '',
        style: {
          display: 'none'
        }
      },
      tooltip: {
        pointFormat: '{point.y} {series.name}<br><b>{point.percentage:.1f}%</b>'
      },
      accessibility: {
        point: {
          valueSuffix: '%'
        }
      },
      plotOptions: {
        pie: {
          allowPointSelect: true,
          cursor: 'pointer',
          colors: ['#9EDE73', '#C21010'],
          dataLabels: {
            enabled: true,
            format: '<b>{point.name} : {point.y}</b><br>{point.percentage:.1f} %',
            distance: -50,
            filter: {
              property: 'percentage',
              operator: '>',
              value: 4
            }
          },
          showInLegend: true
        }
      },
      series: [{
        name: 'Days',
        data: [
          { name: 'Present Days', y: this.noOfpresentday },
          { name: 'Absent Days', y: this.noOfleave },
        ]
      }],
      credits: {
        enabled: false
      }
    }
    return this.pieoptions;
  }

  // ******************************************************Attendance  section ended***********************************************************************

  // ***********************Average calculation section*******************************
  Average_month_log_hours: any;
  Total_log_hours: any;
  Averagecalculation(milliseconds) {
    if (this.customdate == true) {
      this.startDate = moment(this.start.value).toDate();
      this.endDate = moment(this.end.value).endOf("day").toDate();
    }
    let diffInDays = moment(this.endDate).diff(moment(this.startDate), 'days') + 1;
    var firstDay = new Date(this.startDate.getFullYear(), this.startDate.getMonth(), 1);
    var lastDay = new Date(this.endDate.getFullYear(), this.endDate.getMonth() + 1, 0);
    let TotalDays = moment(lastDay).diff(moment(firstDay), 'days') + 1;
    let diffInMonths = moment(this.endDate).diff(moment(this.startDate), 'months') + 1;
    if (!this.customdate) {
      return this.millisecondsToStr1(milliseconds / (diffInMonths));
    }
    else if (this.customdate) {
      return this.millisecondsToStr1(milliseconds / diffInMonths);
    }
  }

  // **********************************table export*******************************
  export_data: any = [];
  export_name: any = [];
  Table_value: any = [];
  exportAsXLSX(): void {
    this.export_data = [];
    for (var i = 0; i < this.dataSourceBarChart.length; i++) {
      this.export_data.push({ "Employee_Id": this.userid, "Employee_Name": this.username, "Date": this.xAxisBarChart[i], "Present_hours": this.dataSourceBarChart[i][1], "Over/Deviation_time": this.dataSourceBarChart[i][0] })
    }
    this.exportservice.exportAsExcelFile(this.export_data, this.username + "_attendance_report", "xlsx");
  }
  exportAsXLS() {
    this.export_data = [];
    for (var i = 0; i < this.dataSourceBarChart.length; i++) {
      this.export_data.push({ "Employee_Id": this.userid, "Employee_Name": this.username, "Date": this.xAxisBarChart[i], "Present_hours": this.dataSourceBarChart[i][1], "Over/Deviation_time": this.dataSourceBarChart[i][0] })
    }
    this.exportservice.exportAsExcelFile(this.export_data, this.username + "_attendance_report", "xls");
  }
  exportAsCSV() {
    this.export_data = [];
    for (var i = 0; i < this.dataSourceBarChart.length; i++) {
      this.export_data.push({ "Employee_Id": this.userid, "Employee_Name": this.username, "Date": this.xAxisBarChart[i], "Present_hours": this.dataSourceBarChart[i][1], "Over/Deviation_time": this.dataSourceBarChart[i][0] })
    }
    this.exportservice.exportAsExcelFile(this.export_data, this.username + "_attendance_report", "csv");
  }

  //   getGitDetails() {
  //     exec('git rev-parse --abbrev-ref HEAD', (err, stdout, stderr) => {
  //   if (err) {
  //     console.error(err);
  //     return;
  //   }
  //   console.log(`Current Git branch: ${stdout}`);
  // });
  //   }


  // *****************************************************Git lab integration***************************************************
  Project_ids: any = [];
  Project_ids1: any = [];
  gitlabIntegrationDetails: any;
  git_repository: any;
  gitlabConfigured: boolean = false;
  appsIntegraionAccess: boolean = false;
  // async Initial_projectDetails() {
  //   let access = localStorage.getItem("emp_access");
  //   var access_to = [];
  //   if (access != null) {
  //     access_to = access.split(",");
  //   }
  //   if (access_to.includes('apps-integration')) {
  //     this.appsIntegraionAccess = true;
  //   }

  //   await this.gitlabService.getGitLabDetailsByOrgid(localStorage.getItem('OrgId')).subscribe(async data => {
  //     if (data.map.statusMessage == "Success") {
  //       let response = JSON.parse(data.map.data);
  //       this.gitlabIntegrationDetails = response;
  //       if (this.gitlabIntegrationDetails.git_integration == true) {
  //         this.gitlabConfigured = true;
  //       }
  //       else {
  //         this.gitlabConfigured = false;
  //       }
  //       this.spinner.hide();
  //     } else if (data.map.statusMessage == "Failed") {
  //       this.gitlabIntegrationDetails = "";
  //       this.gitlabConfigured = false;
  //       this.spinner.hide();
  //     } else {
  //       this.spinner.hide();
  //       this.gitlabIntegrationDetails = "";
  //       this.gitlabConfigured = false;
  //     }

  //     const ACCESS_TOKEN = this.gitlabIntegrationDetails.access_token;
  //     const ACCESS_URL = this.gitlabIntegrationDetails.url;
  //     const url = `${ACCESS_URL}/api/v4/projects`;

  //     // Set the headers to include your access token
  //     const headers = { Authorization: `Bearer ${ACCESS_TOKEN}` };
  //     let page = 1;
  //     const perPage = 100;
  //     // Set the query parameters
  //     const params = { page, per_page: perPage };
  //     const response = await axios.get(url, { headers, params });
  //     for (let i = 0; i < response.data.length; i++) {
  //       this.Project_ids.push(response.data[i]);
  //     }
  //     this.Project_ids = this.Project_ids.slice(0, this.Project_ids.length - 1)
  //     this.Project_ids1 = this.Project_ids;

  //   })

  // }
  since: string;
  until: any;
  Commits: any = []
  Emp_email: any;
  Project_commits: any = [];
  Project_object: any = [];
  GitLab_NoDataFound: boolean = false;
  // async TogetgitDetails(id) {
  //   await this.Getgitdetails(id);
  //   this.Project_commits = this.Project_commits.map(arr => arr.length);
  //   this.sortfunct();
  // }
  // sortfunct() {
  //   this.Project_object = [];
  //   for (let i = 0; i < this.Project_ids1.length; i++) {
  //     this.Project_object.push({ 'namespace_path': this.Project_ids1[i].namespace.path, 'path': this.Project_ids[i].path, 'http_url_to_repo': this.Project_ids[i].http_url_to_repo, 'commits': this.Project_commits[i] })
  //   }
  //   this.Project_object.sort((a, b) => b.commits - a.commits);
  // }

  // async Getgitdetails(id) {
  //   this.Project_commits = [];
  //   this.since = this.startDate;
  //   this.until = this.endDate;

  //   const ACCESS_TOKEN = this.gitlabIntegrationDetails.access_token;
  //   const BASE_URL = this.gitlabIntegrationDetails.url;

  //   for await (const i of this.Project_ids) {
  //     const PROJECT_ID = i.id;
  //     const url = `${BASE_URL}/api/v4/projects/${PROJECT_ID}/repository/commits`;
  //     const headers = { Authorization: `Bearer ${ACCESS_TOKEN}` };
  //     let page = 1;
  //     const perPage = 100;
  //     let since = this.since;
  //     let until = this.until;

  //     const params = { page, per_page: perPage, since, until };
  //     const userCommits = [];

  //     while (true) {
  //       const response = await axios.get(url, { headers, params });
  //       userCommits.push(...response.data);

  //       if (response.headers.link && response.headers.link.includes('rel="next"')) {
  //         page += 1;
  //         params.page = page;
  //       } else {
  //         break;
  //       }
  //     }

  //     try {
  //       const data = await this.settingsService.getActiveEmpDetailsById(id).toPromise();
  //       if (data.map.statusMessage === "Success") {
  //         let response = JSON.parse(data.map.data);
  //         this.Emp_details = response;
  //         this.Emp_email = this.Emp_details.email;
  //         this.Commits = userCommits.filter(n => n.author_email == this.Emp_email);
  //         this.Project_commits.push(this.Commits);
  //       }
  //     } catch (error) {
  //       // Handle error
  //     }
  //   }
  //   const isEmpty = this.Project_commits.every(innerArray => innerArray.length === 0);
  //   this.GitLab_NoDataFound = isEmpty;
  // }
  RouterLink() {
    if (this.appsIntegraionAccess) {
      this.router.navigate(["/view-gitlab-configuration"]);
    }
  }
  imgBase64 = '';
  loading: boolean = false
  //   Download image and pdf functions
  capture(data) {
    this.loading = true;
    this.captureService
      .getImage(this.screen.nativeElement, true)
      .toPromise()
      .then((img) => {
        this.imgBase64 = img;
        if (data == "png") {
          this.convertToPNG();
        }
        else if (data == "pdf") {
          this.convertToPDF();
        }
      })
      .catch((error) => {
        this.router.navigate(["/404"]);
      });
  }

  convertToPNG() {
    const element = document.createElement('a');
    element.setAttribute('href', this.imgBase64);
    element.setAttribute('download', this.username + ' report.png');
    element.setAttribute('type', 'image/png');
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    this.loading = false;
  }

  convertToPDF() {
    const doc = new jsPDF();
    const imgData = this.imgBase64;

    // Get the dimensions of the PDF page
    const pageSize = doc.internal.pageSize;
    const pageWidth = pageSize.getWidth();
    const pageHeight = pageSize.getHeight();

    // Calculate the desired dimensions and positioning for the image
    const imageWidth = pageWidth; // Adjust as needed, leaving 10 units of margin on each side
    const imageHeight = (pageHeight); // Maintain the aspect ratio, adjust the factor (100) as needed
    const imageX = null; // Center the image horizontally
    const imageY = null;

    // Set the font size to increase the size of the content
    const fontSize = 16; // Adjust as needed, increase to make the content larger

    doc.setFontSize(fontSize);
    doc.addImage(imgData, 'PNG', imageX, imageY, imageWidth, imageHeight, '', 'FAST');
    doc.save(this.username + ' report.pdf');
    this.loading = false;
  }

}
