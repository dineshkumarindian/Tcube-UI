import { Component, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, FormGroup, Validators } from '@angular/forms';
import { PageEvent } from '@angular/material/paginator';
import { MatSelect } from '@angular/material/select';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { ReplaySubject, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import * as Highcharts from 'highcharts';
import { DatePipe } from '@angular/common';
import { NgxSpinnerService } from 'ngx-spinner';
import { AttendanceServiceService } from '../../../services/attendance-service.service';
import { DomSanitizer } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { EmployeeService } from '../../../services/employee.service';
import moment from 'moment';
import { LeaveTrackerService } from '../../../services/leave-tracker.service';
import { Router } from '@angular/router';
import { errorMessage, noDataMessage } from '../../../util/constants';
import * as tablePageOption from '../../../util/table-pagination-option';

// import { LOADIPHLPAPI } from 'dns';


@Component({
  selector: 'app-user-reports',
  templateUrl: './user-reports.component.html',
  styleUrls: ['./user-reports.component.less'],
  animations: [
    trigger('detailExpand', [
      state('void', style({ height: '0px', minHeight: '0', visibility: 'hidden' })),
      state('*', style({ height: '*', visibility: 'visible' })),
      transition('void <=> *', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class UserReportsComponent implements OnInit {
  nodataMsg = noDataMessage;
  requiredMessage = errorMessage;
  /** control for the selected date range */
  public dateCtrl: UntypedFormControl = new UntypedFormControl("", [Validators.required]);

  /** control for the selected start date range */
  public start: UntypedFormControl = new UntypedFormControl("", [Validators.required]);

  /** control for the selected end date  range */
  public end: UntypedFormControl = new UntypedFormControl("", [Validators.required]);

  /** control for the selected user */
  public userCtrl: UntypedFormControl = new UntypedFormControl("", [Validators.required]);

  public deativeuser: UntypedFormControl = new UntypedFormControl("", [Validators.required]);

  /** control for the MatSelect filter keyword */
  public dateFilterCtrl: UntypedFormControl = new UntypedFormControl();

  /** control for the MatSelect filter keyword */
  public userFilterCtrl: UntypedFormControl = new UntypedFormControl();

  /** list of client filtered by search keyword */
  public filtereddate: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);

  public filteracitve: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);
  /** list of client filtered by search keyword */
  public filtereduser: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);

  @ViewChild('singleSelect', { static: true }) singleSelect: MatSelect;

  /** Subject that emits when the component has been destroyed. */
  protected _onDestroy = new Subject<void>();
  name: string;
  hours: any;
  // filteracitve: any;

  constructor(private attendanceService: AttendanceServiceService,
    private employeeService: EmployeeService,
    private leaveTrackerService: LeaveTrackerService,
    private spinner: NgxSpinnerService,
    private domSanitizer: DomSanitizer,
    private formBuilder: UntypedFormBuilder,
    private router: Router,
    public datepipe: DatePipe) { }

  /** list of bill */
  protected dateData: any[] = [
    { data: 'Today', id: 1 },
    { data: 'Yesterday', id: 2 },
    { data: 'This week', id: 3 },
    { data: 'Last week', id: 4 },
    { data: 'This Month', id: 5 },
    { data: 'Last Month', id: 6 },
    { data: 'Custom Date', id: 7 }
  ];

  protected employeeData: any[] = [];
  protected inativateemployeeData: any[] = [];
  protected ativateemployeeData: any[] = [];
  leavetableData = [
    { "id": 1, "leavetype": "sick leave", "startDate": "07-09-2022", "endDate": "07-09-2022", "totaldays": 1 }, { "id": 2, "leavetype": "sick leave", "startDate": "07-09-2022", "endDate": "10-09-2022", "totaldays": 3 },
  ];

  options: any;
  pieoptions: any;
  customdate: boolean = false;
  customdatevalidation: boolean = false;
  daterangevalidation: boolean = false;
  // displayedColumns: string[] = ['id','leavetype', 'startDate', 'endDate', 'totaldays'];
  displayedColumns: string[] = ['leave_type', 'start_date', 'end_date', 'total_days'];
  displayedColumnsreport: string[] = ['date', 'firstIn', 'lastout', 'activeHours', 'inactiveHours', 'timediff', 'Logs'];
  dataSource: MatTableDataSource<any>;
  dataSourcereport: MatTableDataSource<any>;
  expand_details: any[];
  alldetails: any;
  monthlyresponse: any;
  startdates: any;
  enddates: any;
  email: string | null;
  empId: string | null;
  yearofmonth: string;
  maxDate: Date;
  employee: string;
  today: any;
  nextdisable: boolean = true;
  lastlog: any;
  org_id: any;
  xAxisBarChart: any[] = [];
  dataSourceBarChart: any[] = [];
  show: boolean = false;
  matpagesize: number = 5;
  matpageindex: number = 0;
  noOfpresentday: number = 0;
  noOfleave: number = 0;
  pageSize: number = 10;
  paginationTotalLength: number;
  tablePaginationOption: number[];
  no_data_found: boolean;
  no_data_found_attendance: boolean;
  Filter: boolean;
  filterData: string;
  activeusers: boolean = true;
  inactiveattendance: boolean = false;
  task_time: any;

  // @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  // @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild('TableOnePaginator', { static: true }) tableOnePaginator: MatPaginator;
  @ViewChild('TableOneSort', { static: true }) tableOneSort: MatSort;
  @ViewChildren(MatPaginator) paginator = new QueryList<MatPaginator>();
  @ViewChildren(MatSort) sort = new QueryList<MatSort>();
  ngOnInit() {

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
    this.alldetails = [];
    this.startdates = new Date();
    this.maxDate = new Date();
    // this.datepicker = new FormControl(new Date());
    const date = new Date(this.startdates);
    var startdates = new Date(date.getFullYear(), date.getMonth(), 1);
    this.today = this.datepipe.transform(startdates, 'dd-MM-yyyy');
    this.startdates = this.today
    var enddates = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    this.enddates = this.datepipe.transform(enddates, 'dd-MM-yyyy');
    // this.getdaterangeReport();
    // this.getBarChartData();
    // setTimeout(() => {
    //   Highcharts.chart('container', this.setchartoption());
    //   Highcharts.chart('piechart', this.setpiechartoption());
    // }, 1000);
  }
  // ! get org employees name and id
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

  inactiveusers() {
    this.inactiveattendance = true;
    this.activeusers = false;
    if (this.inactiveattendance == true) {
      this.employeeData = this.inativateemployeeData;
      this.filterEmployee();
    }
    this.show = false;
    this.start = new UntypedFormControl("", [Validators.required]);
    this.end = new UntypedFormControl("", [Validators.required]);
    this.dateCtrl = new UntypedFormControl("", [Validators.required]);
    this.userCtrl = new UntypedFormControl("", [Validators.required]);
    this.deativeuser = new UntypedFormControl("", [Validators.required]);
    this.customdate = false;
    this.customdatevalidation = false;
    this.daterangevalidation = false;
  }
  activeuseattendance() {
    this.inactiveattendance = false;
    this.activeusers = true;
    if (this.inactiveattendance == false) {
      this.employeeData = this.ativateemployeeData;
      this.filterEmployee();
    }
    this.show = false;
    this.start = new UntypedFormControl("", [Validators.required]);
    this.end = new UntypedFormControl("", [Validators.required]);
    this.dateCtrl = new UntypedFormControl("", [Validators.required]);
    this.userCtrl = new UntypedFormControl("", [Validators.required]);
    this.deativeuser = new UntypedFormControl("", [Validators.required]);
    this.customdate = false;
    this.customdatevalidation = false;
    this.daterangevalidation = false;
  }




  getdaterangeReport() {
    // this.spinner.show();
    this.lastlog = undefined;
    let formdata = {
      "email": this.email,
      // "startdate": this.formatedate(this.startdates),
      // "enddate": this.formatedate(this.enddates),
      "startdate": this.startdates,
      "enddate": this.enddates,
    }
    this.attendanceService.getMonthreportdata(formdata).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        let response: any[] = JSON.parse(data.map.report);
        this.tablePaginationOption = tablePageOption.tablePaginationOption(response.length);        
        this.paginationTotalLength = response.length;
        this.monthlyresponse = response;
        this.alldetails = JSON.parse(data.map.details);
        this.noOfpresentday = this.alldetails.length;
        // console.log(this.alldetails);
        for (var i = 0; i < this.alldetails.length; i++) {
          for (var j = 0; j < this.alldetails[i].length; j++) {
            // console.log(this.alldetails[i][j]);
            if (this.alldetails[i][j].image) {
              let stringArray = new Uint8Array(this.alldetails[i][j].image);
              const STRING_CHAR = stringArray.reduce((data, byte) => {
                return data + String.fromCharCode(byte);
              }, '');
              let base64String = btoa(STRING_CHAR);
              this.alldetails[i][j].image = this.domSanitizer.bypassSecurityTrustUrl("data:image/jpeg;base64," + base64String);
            }
          }

        }
        // console.log(this.alldetails);
        if (this.alldetails.length > 0) {
          this.dataSourcereport = new MatTableDataSource(response);
          this.matpageindex = 0;
          // this.tableOnePaginator.firstPage();
          this.dataSourcereport.paginator = this.paginator.toArray()[0];
          this.dataSourcereport.sort = this.sort.toArray()[0];
        }
        // setTimeout(() => {
        //   this.spinner.hide();
        // }, 2000);
      }
      else {
        // setTimeout(() => {
        //   this.spinner.hide();
        // }, 2000);
        // console.log(data);
      }
      this.spinner.hide();
      this.getEmpDateRangeApprovedLeaves();
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
    })
  }

  // ! expand row to show logs
  details(data: any) {
    if (this.lastlog != undefined && this.lastlog != data) {
      var activelog;
      activelog = document.getElementById("logId" + this.lastlog);
      activelog.click();
    }
    if (this.lastlog == data) {
      this.lastlog = undefined;
    }
    else {
      this.lastlog = data;
    }
    var index = (this.matpageindex * this.matpagesize) + data;
    this.expand_details = this.alldetails[index];
  }

  // !mat table pagination call event for log report
  resetlog(event?: PageEvent) {
    this.pageSize = event.pageSize;
    this.matpageindex = event!.pageIndex;
    if (this.lastlog != undefined) {
      var activelog = document.getElementById("logId" + this.lastlog);
      if (activelog != null) {
        activelog.click();
      }
    }
    if (this.matpagesize > event.pageSize) {
      if (!(this.lastlog < event.pageSize)) {
        this.lastlog = undefined;
      }
    }
    this.matpagesize = event.pageSize;
  }

  //! date formated date function
  formatedate(string: string) {
    var date = new Date(string),
      mnth = ("0" + (date.getMonth() + 1)).slice(-2),
      day = ("0" + date.getDate()).slice(-2);
    // this.yearofmonth=mnth+' '+date.getFullYear();
    this.yearofmonth = date.getMonth() + " " + date.getFullYear();
    return [day, mnth, date.getFullYear()].join("-");
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
        this.startdates = moment().format("DD-MM-YYYY");
        this.enddates = moment().format("DD-MM-YYYY");
      }
      if (data == "Yesterday") {
        this.startdates = moment().subtract(1, "days").format("DD-MM-YYYY");
        this.enddates = moment().subtract(1, "days").format("DD-MM-YYYY");
      }
      if (data == "This week") {
        this.startdates = moment().startOf("week").format("DD-MM-YYYY");
        this.enddates = moment().endOf("week").format("DD-MM-YYYY");
      }
      if (data == "Last week") {
        this.startdates = moment().subtract(1, 'weeks').startOf("week").format("DD-MM-YYYY");
        this.enddates = moment().subtract(1, 'weeks').endOf("week").format("DD-MM-YYYY");
      }
      if (data == "This Month") {
        this.startdates = moment().startOf("month").format("DD-MM-YYYY");
        this.enddates = moment().endOf("month").format("DD-MM-YYYY");
      }
      if (data == "Last Month") {
        this.startdates = moment().subtract(1, 'month').startOf("month").format("DD-MM-YYYY");
        this.enddates = moment().subtract(1, 'month').endOf("month").format("DD-MM-YYYY");
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
  getEmpDateRangeApprovedLeaves() {
    this.no_data_found_attendance = false;
    let formdata = {
      "empid": this.empId,
      "startdate": this.startdates,
      "enddate": this.enddates,
    }
    this.leaveTrackerService.getEmpDateRangeApprovedLeaves(formdata).subscribe(data => {

      if (data.map.statusMessage == "Success") {
        var response = JSON.parse(data.map.data);
        this.noOfleave = response.length;
        let counts = response.reduce((val, fi) => val + fi.total_days, 0);
        this.noOfleave = counts;
        // this.dataSource = new MatTableDataSource(response);
        // this.dataSource.paginator = this.paginator.toArray()[0];
        // this.dataSource.sort = this.sort.toArray()[0];
        Highcharts.chart('piechart', this.setpiechartoption());
        this.spinner.hide();
        if (this.noOfleave == 0 && this.noOfpresentday == 0) {
          this.no_data_found_attendance = true;
        }
      }
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
    })
  }
  // ! find function
  findData() {
    this.spinner.show();
    this.show = true;
    this.dataSource = new MatTableDataSource();
    this.dataSourcereport = new MatTableDataSource();
    this.noOfpresentday = 0;
    this.noOfleave = 0;
    this.dataSourceBarChart = [];
    this.xAxisBarChart = [];
    setTimeout(() => {
      if (this.customdate == true) {
        this.startdates = moment(this.start.value).format("DD-MM-YYYY");
        this.enddates = moment(this.end.value).format("DD-MM-YYYY");
        //nested Function for asynchronously getting
        this.getdaterangeReport();

        this.getBarChartData();
        // this.getEmpDateRangeApprovedLeaves();
      }
      else {
        //nested Function for asynchronously getting
        this.getdaterangeReport();

        this.getBarChartData();
      }
    }, 2000);



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

  //  ! To cancel form function
  cancelform() {
    this.show = false;
    this.start = new UntypedFormControl("", [Validators.required]);
    this.end = new UntypedFormControl("", [Validators.required]);
    this.dateCtrl = new UntypedFormControl("", [Validators.required]);
    this.userCtrl = new UntypedFormControl("", [Validators.required]);
    this.deativeuser = new UntypedFormControl("", [Validators.required]);
    this.customdate = false;
    this.customdatevalidation = false;
    this.daterangevalidation = false;

  }

  // ? To set charts characteristics
  setchartoption() {
    this.options = {
      chart: {
        renderTo: 'container',
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
        categories: this.xAxisBarChart
        , labels: {
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
      colors: ['#2f7ed8', '#0d233a', '#053220', '#EF5B0C'],
      credits: {
        enabled: false
      },
    }
    return this.options;
  }
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

  Averagecalculation(milliseconds) {
    if (this.customdate == true) {
      this.startdates = moment(this.start.value).toDate();
      this.enddates = moment(this.end.value).endOf("day").toDate();
    }
    let diffInDays = moment(this.enddates).diff(moment(this.startdates), 'days') + 1;
    var firstDay = new Date(this.startdates.getFullYear(), this.startdates.getMonth(), 1);
    var lastDay = new Date(this.enddates.getFullYear(), this.enddates.getMonth() + 1, 0);
    let TotalDays = moment(lastDay).diff(moment(firstDay), 'days') + 1;
    let diffInMonths = moment(this.enddates).diff(moment(this.startdates), 'months') + 1;
    if (!this.customdate) {
      return this.millisecondsToStr1(milliseconds / (diffInMonths));
    }
    else if (this.customdate) {
      return this.millisecondsToStr1(milliseconds / diffInMonths);
    }
  }

  Total_present_hours: any;
  // ! date range Bar chart reports function
  getBarChartData() {
    // this.spinner.show();
    this.lastlog = undefined;
    this.no_data_found = false;
    this.Total_present_hours = 0;
    // let hours = [];

    let formdata = {
      "email": this.email,
      // "startdate": this.formatedate(this.startdates),
      // "enddate": this.formatedate(this.enddates),
      "startdate": this.startdates,
      "enddate": this.enddates,
    }
    this.attendanceService.getDateBarChartReport(formdata).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        this.dataSourceBarChart = data.map.data.chart_data;
        if (this.dataSourceBarChart.length < 1) {
          this.no_data_found = true;
        }
        for (let i = 0; i < this.dataSourceBarChart.length; i++) {
          let hours = + this.dataSourceBarChart[i][1];
          // let hours =+ this.dataSourceBarChart[i]
          //console.log(hours)
          // console.log(hours = + this.dataSourceBarChart[i][1])
          // console.log(this.Total_present_hours = + this.Total_present_hours + hours)
         // console.log(this.hours = + this.Total_present_hours + this.dataSourceBarChart[i][1])
          this.Total_present_hours = + this.Total_present_hours + this.dataSourceBarChart[i][1];
          // this.Total_present_hours = + this.Total_present_hours + hours;
        }
        this.Total_present_hours = this.millisecondsToStr1((this.Total_present_hours * 3600000));
        // console.log(this.Total_present_hours = this.millisecondsToStr1((this.Total_present_hours * 3600000)))
        this.xAxisBarChart = data.map.data.dates_x_axis;
        Highcharts.chart('container', this.setchartoption());
        // setTimeout(() => {
        //   this.spinner.hide();
        // }, 2000);
      }
      else {
        // setTimeout(() => {
        //   this.spinner.hide();
        // }, 2000);
        // console.log(data);
      }
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
    })

  }
  //pagination size
  changePage(event) {
    this.pageSize = event.pageSize;
  }
  // filter
  applyFilter(event: Event) {
    this.Filter = false;
    this.filterData = (event.target as HTMLInputElement).value;
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSourcereport.filter = filterValue.trim().toLowerCase();
    if (this.dataSourcereport.filteredData.length == 0) {
      this.Filter = true;
    }
    if (this.dataSourcereport.paginator) {
      this.dataSourcereport.paginator = this.paginator.toArray()[1];
    }


  }
}
