import { Component, OnInit } from '@angular/core';
import { ReplaySubject, Subject } from 'rxjs';
import { FormBuilder, UntypedFormControl, FormGroup, Validators } from '@angular/forms';
import { EmployeeService } from '../../services/employee.service';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { TimeTrackerService } from '../../services/time-tracker.service';
import { takeUntil } from 'rxjs/operators';
import * as moment from 'moment-timezone';
import * as Highcharts from 'highcharts/highstock';
import { errorMessage, noDataMessage } from '../../util/constants';
import Drilldown from 'highcharts/modules/drilldown';
import { ExportService } from 'src/app/services/export.service';
import { DatePipe } from '@angular/common';
Drilldown(Highcharts);



export interface ProjectJob {
  map: ProjectJobMap;
}

export interface ProjectJobMap {
  job_count: any;
  project_users: number;
  total_duration: string;
  report: Report;
  statusMessage: string;
  statusCode: string;
}

export interface Report {
  myArrayList: MyArrayList[];
}

export interface MyArrayList {
  map: MyArrayListMap;
}

export interface MyArrayListMap {
  hours: string;
  details: Details;
  user: string;
}

export interface Details {
  map: any;
}

export interface DetailsMap {
  "response-proposal": string;
  "client-meeting": string;
  documentation: string;
  "Mockup-design": string;
  meeting: string;
  "ui-mockup-development": string;
  "design-document": string;
}
@Component({
  selector: 'app-project-jobs',
  templateUrl: './project-jobs.component.html',
  styleUrls: ['./project-jobs.component.less']
})

export class ProjectJobsComponent implements OnInit {
  requiredMessage = errorMessage;
  nodataMsg = noDataMessage;
  org_id: any;
  customdate: boolean = false;
  customdatevalidation: boolean = true;
  daterangevalidation: boolean = false;
  startDate: any;
  endDate: any;
  startdates: any;
  enddates: any;
  maxDate: Date;
  show: boolean = false;
  options: any;
  Emp_logged_hours: any = 0;

  reportdata: ProjectJobMap;
  tot_emp: number = 0;
  tot_hrs: string = '00:00';
  project_name: string = '';
  tot_job: any = [];
  job_Count: any;
  user_details: any = [];
  job_arr: any = [];
  export_data: any = [];
  today: any;
  jobHoursOfEach: any[] = [];
  job_details: any = [];
  no_job: boolean = true;

  /** list of date range */
  protected dateData: any[] = [
    { data: 'Today', id: 1 },
    { data: 'Yesterday', id: 2 },
    { data: 'This week', id: 3 },
    { data: 'Last week', id: 4 },
    { data: 'This Month', id: 5 },
    { data: 'Last Month', id: 6 },
    { data: 'Custom Date', id: 7 }
  ];

  /** control for the selected date range */
  public dateCtrl: UntypedFormControl = new UntypedFormControl("", [Validators.required]);

  /** list of client filtered by search keyword */
  public filtereddate: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);


  constructor(private employeeService: EmployeeService,
    private router: Router,
    private spinner: NgxSpinnerService,
    private timeTrackerService: TimeTrackerService,
    private exportservice: ExportService,
    public datepipe: DatePipe
  ) { }

  ngOnInit() {
    this.org_id = localStorage.getItem('OrgId');
    this.empId = localStorage.getItem('Id');
    this.startdates = new Date();
    this.maxDate = new Date();
    const date = new Date(this.startdates);
    var startdates = new Date(date.getFullYear(), date.getMonth(), 1);
    this.today = this.datepipe.transform(startdates, 'YYYY-MM-DD');
    this.startdates = this.today
    this.projectFilterCtrl = new UntypedFormControl("", [Validators.required]);
    this.filtereddate.next(this.dateData.slice());
    this.getProjectDetails();
    // ***************load the initial employee list*************
    this.filteredproject.next(this.projectDetails.slice());

    // listen for search field value changes
    this.projectFilterCtrl.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        this.filterproject();
      });
  }
  /** list of client filtered by search keyword */
  public filteredproject: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);

  /** control for the selected start date range */
  public start: UntypedFormControl = new UntypedFormControl("", [Validators.required]);

  /** control for the selected end date  range */
  public end: UntypedFormControl = new UntypedFormControl("", [Validators.required]);

  /** control for the MatSelect filter keyword */
  public projectFilterCtrl: UntypedFormControl = new UntypedFormControl();

  /** control for the MatSelect filter keyword */
  public dateFilterCtrl: UntypedFormControl = new UntypedFormControl();

  public projectCtrl: UntypedFormControl = new UntypedFormControl

  projectDetails: any[] = [];
  orgId: any[];
  noProjects: boolean = false;

  protected _onDestroy = new Subject<void>();
  // --------------------------------Filter project field function---------------------------
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

  // To get projects
  getProjectDetails() {
    this.spinner.show();
    this.projectDetails = [];
    let formdata = {
      "empid": this.empId,
      "orgid": this.org_id
    }
    this.timeTrackerService.getProjectAndJobNames(formdata).subscribe(data => {
      var response = JSON.parse(data.map.data);
      var projectdetails = response[0].map.projectdetails.myArrayList;
      // var jobdetails = response[1].map.jobdetails.myArrayList;

      //remove the duplicate projects
      projectdetails = projectdetails.reduce((accumalator, current) => {
        if (!accumalator.some((item) => item.map.id === current.map.id && item.map.name === current.map.name)) {
          accumalator.push(current);
        } return accumalator;
      }, []);

      for (var i = 0; i < projectdetails.length; i++) {
        this.projectDetails.push({ "name": projectdetails[i].map.name, "id": projectdetails[i].map.id, "client_id": projectdetails[i].map.client_id });
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
      setTimeout(() => {
        this.spinner.hide();
      }, 3000);
    }, (error) => {
      this.spinner.hide();
    })
  }

  //  ! change Date field function
  selectChangeHandler(data) {
    if (data == "Custom Date") {
      this.customdate = true;
    }
    else {
      if (data == "Today") {
        this.enddates = moment().format("YYYY-MM-DD");
        this.startdates = moment().format("YYYY-MM-DD");
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

  // -----------------------To cancel form function-------------------------

  cancelform() {
    this.show = false;
    this.start = new UntypedFormControl("", [Validators.required]);
    this.end = new UntypedFormControl("", [Validators.required]);
    this.dateCtrl = new UntypedFormControl("", [Validators.required]);
    this.projectCtrl = new UntypedFormControl("", [Validators.required]);
    this.customdatevalidation = false;
    this.customdate = false;
  }

  empId: any = [];
  selectEmploy(event) {
    this.empId = event;
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
  // ----------------milliseconds to time converter function------------------
  millisecondsToStr(milliseconds) {
    // TIP: to find current time in milliseconds, use:
    // var  current_time_milliseconds = new Date().getTime();

    var value = "";

    var temp = Math.floor(milliseconds / 1000);
    var hours = Math.floor(temp / 60 / 60);
    if (hours) {
      // value+=  hours + ' hour ' + this.numberEnding(hours);
      value += hours + ' hours ';
    }
    var minutes = Math.floor((temp / 60 / 60 - hours) * 60);
    if (minutes) {
      // value+= minutes + ' minute ' + this.numberEnding(minutes);
      value += minutes + ' minutes ';
    }
    // var seconds = Math.floor(((temp / 60 / 60 - hours) * 60 - minutes) * 60);
    // if (seconds) {
    //   // value+= seconds + ' second' + this.numberEnding(seconds);
    //   value += seconds + ' second';
    //   // console.log(seconds );
    // }
    if (value == "") {
      value = 'less than a second'  //'just now' //or other string you like;
    }
    return value;


  }

  millisecondsToStr1(milliseconds) {
    // TIP: to find current time in milliseconds, use:
    // var  current_time_milliseconds = new Date().getTime();

    var value = "";

    var temp = Math.floor(milliseconds / 1000);
    var hours = Math.floor(temp / 60 / 60);
    if (hours) {
      if (hours < 10) {
        value += '0' + hours + ' : ';
      }
      else {
        value += hours + ' : ';
      }

    }
    var minutes = Math.floor((temp / 60 / 60 - hours) * 60);
    if (minutes) {
      if (minutes < 10) {
        value += ' 0' + minutes + ' : ';
      }
      else {
        value += minutes + ' : ';
      }

    }
    var seconds = Math.floor(((temp / 60 / 60 - hours) * 60 - minutes) * 60);
    if (seconds) {
      if (seconds < 10) {
        value += ' 0' + seconds;
      }
      else {
        value += seconds;
      }
    }
    if (value == "") {
      value = ' NA '  //'just now' //or other string you like;
    }
    return value + (' (HH:MM:SS)');


  }
  millisecondsToHrs(milliseconds) {
    var value = 0;
    var temp = Math.floor(milliseconds / 1000);
    var hours = Math.floor(temp / 60 / 60);
    if (hours) {
      value += hours;
    }
    var minutes = Math.floor((temp / 60 / 60 - hours) * 60);
    if (minutes) {
      // value = hours + (minutes / 60);
      value = hours + (minutes / 100);
    }
    return Math.round((value + Number.EPSILON) * 100) / 100;
  }


  // *********************************************************project and job section ****************************************************************


  no_data_found_project: boolean = false;
  tot_job_name: any = [];
  getProjectJobsReport() {
    this.Emp_logged_hours = 0;
    this.user_details = [];
    this.job_arr = [];
    this.no_data_found_project = false;
    this.export_data = [];
    this.spinner.show();
    if (this.customdate) {
      this.startdates = moment(this.start.value).format("YYYY-MM-DD");
      this.enddates = moment(this.end.value).format("YYYY-MM-DD");
    }
    let formdata = {
      "org_id": this.org_id,
      "start_date": this.startdates,
      "end_date": this.enddates,
      // "start_date": moment(this.start.value).format("YYYY-MM-DD"),
      // "end_date": moment(this.end.value).format("YYYY-MM-DD"),
      "project_id": this.projectCtrl.value.id,
      "project_name": this.projectCtrl.value.name,
    }
    let subscription1 = this.timeTrackerService.getProjectAndJobsReports(formdata).subscribe(data => {
      this.project_name = this.projectCtrl.value.name;
      if (data.map.statusMessage == "Success") {
          this.reportdata = data.map;   
          this.jobHoursOfEach = [];
          this.job_details = [];   
        if (this.reportdata.report != undefined) {
          for (let i = 0; i < this.reportdata.report.myArrayList.length; i++) {
            this.no_job = false;
            this.tot_hrs = this.reportdata.total_duration;
            this.job_Count = this.reportdata.job_count;
            this.tot_job = Object.keys(this.reportdata.report.myArrayList[i].map.details.map);
            this.tot_job_name = Object.keys(this.reportdata.report.myArrayList[i].map.details.map);
            for (var j = 0; j < this.tot_job_name.length; j++) {
              this.tot_job_name[j] = this.capitalizeFirstLetter(this.tot_job_name[j]);
            }
            // for (let i = 0; i < this.reportdata.report.myArrayList.length; i++) {
            this.user_details[i] = { 'name': this.reportdata.report.myArrayList[i].map.user, 'y': this.millisecondsToHrs(this.reportdata.report.myArrayList[i].map.hours), 'drilldown': this.reportdata.report.myArrayList[i].map.user, 'time': this.millisecondsToStr(this.reportdata.report.myArrayList[i].map.hours) }
            let sub_job_arr: any[] = [];
            // Define an empty object
            let myObject: {} = {};
            myObject["User Name"] = this.reportdata.report.myArrayList[i].map.user;
            for (let j = 0; j < this.tot_job.length; j++) {
              sub_job_arr.push({ 'name': this.tot_job_name[j], 'y': this.millisecondsToHrs(this.reportdata.report.myArrayList[i].map.details.map[this.tot_job[j]]), 'time': this.millisecondsToStr(this.reportdata.report.myArrayList[i].map.details.map[this.tot_job[j]]) })
              // Add a key-value pair to the object
              let tot_job_hr = this.millisecondsToStr(this.reportdata.report.myArrayList[i].map.details.map[this.tot_job[j]]);
              myObject[this.tot_job[j]] = tot_job_hr == 'less than a second' ? ' - ' : tot_job_hr;
              if(tot_job_hr != 'less than a second') {
              this.jobHoursOfEach.push({"Job":this.tot_job[j],tot_job_hr,"Milliseconds":this.reportdata.report.myArrayList[i].map.details.map[this.tot_job[j]]});
              } 
              else {
                tot_job_hr = '0';
                this.jobHoursOfEach.push({"Job":this.tot_job[j],tot_job_hr,"Milliseconds":0});
              }
            }           
            // myObject["Project Name"] = this.project_name;
            let tot_hr = this.millisecondsToStr(this.reportdata.report.myArrayList[i].map.hours);
            myObject["Total Working Hours"] = tot_hr == 'less than a second' ? ' - ' : tot_hr;
            // myObject["Date Range"] = moment(this.start.value).format("YYYY-MM-DD")+" to "+moment(this.end.value).format("YYYY-MM-DD");
            this.export_data.push(myObject);
            this.job_arr[i] = { 'name': this.reportdata.report.myArrayList[i].map.user, 'id': this.reportdata.report.myArrayList[i].map.user, 'data': sub_job_arr }
            // }
            // Iterate over the array and modify the names
            for (var k = 0; k < this.user_details.length; k++) {
              this.user_details[k].name = this.capitalizeFirstLetter(this.user_details[k].name);
            }
            let Objectdata: {} = {};
            let sDate = this.startdates;
            let eDate = this.enddates;
            sDate = this.datepipe.transform(sDate, 'dd-MM-YYYY');
            eDate = this.datepipe.transform(eDate, 'dd-MM-YYYY');
            let datacommon: string = sDate + " to " + eDate;
            Objectdata[`${this.project_name} (${datacommon})`] = "";
            this.export_data.push(Objectdata);
            this.tot_emp = this.reportdata.project_users;
            this.show = true;
            if (this.user_details.length < 1) {
              this.no_data_found_project = true;
            }
            setTimeout(() => {
              Highcharts.chart('project_job', this.setchartoption('column'));
            }, 1000);
          }
          let jobMap: any = [];
          if(this.jobHoursOfEach.length != 0) {
          this.jobHoursOfEach.forEach(job => {
            if(job.tot_job_hr != '0') {
            const [hoursStr, minutesStr] = job.tot_job_hr.split(' ');
            const hours = parseInt(hoursStr.replace('hours', ''), 10);
            const parts = job.tot_job_hr.split(' ');
            // Extract hours
            const hours1 = parseInt(parts[0], 10);
            let minutes;
            // Extract minutes using a regular expression
            if(parts[2] != "") {
            let minutesMatch = parts[2].match(/^(\d+)/);
             minutes = parseInt(minutesMatch[1], 10);
            } else {
              minutes = '0';
            }
            const totalMinutes = (hours * 60) + minutes;
            jobMap.push({ "Job": job.Job, "Minutes": totalMinutes, "MilliSeconds": job.Milliseconds })
            } else {
              jobMap.push({ "Job": job.Job, "Minutes": 0, "MilliSeconds": job.Milliseconds })
            }
          });
          let temp = [];
          let temp1 = [];
          this.jobHoursOfEach.map(job => {
            temp = jobMap.filter(val => val.Job == job.Job);
          })
          let totalmillisecond = 0;
          let totalMinutes = 0;
          let totalJob: any = [];
          // Total all duplicate job hours and minutes
          if (temp.length != 0) {
            for (let i = 0; i < temp.length; i++) {
              totalmillisecond = totalmillisecond + temp[i].MilliSeconds;
              totalMinutes = totalMinutes + temp[i].Minutes;
            }
            totalJob.push({ "Job": temp[0].Job, "Minutes": totalMinutes, "MilliSeconds": totalmillisecond });
          }
          this.jobHoursOfEach.map(job => {
            temp1 = jobMap.filter(val => val.Job != job.Job); // take unique job
          })
          // combine unique and duplicate Job
          temp1.push({ "Job": temp[0].Job, "Minutes": totalMinutes, "MilliSeconds": totalmillisecond });
          // forming data for barchart
          for (let i = 0; i < temp1.length; i++) {
            let totalMinutes = temp1[i].Minutes;
            let totalHours = Math.floor(totalMinutes / 60);
            const remainingMinutes = totalMinutes % 60;
            this.job_details[i] = { 'name': temp1[i].Job, 'y': this.millisecondsToHrs(temp1[i].MilliSeconds), 'drilldown': temp1[i].Job, 'time': `${totalHours} hours ${remainingMinutes} minutes` }
          }          
          this.jobCountDetails();
        } else {
          this.no_job = true;
        }
        }
        else {
          let response = data.map.user;
          this.no_job = true;
          for (let i = 0; i < response.myArrayList.length; i++) {
            this.tot_hrs = '00:00';
            this.job_Count = 0;
            // this.user_details[i] = { 'name': response[i], 'y': this.millisecondsToHrs(this.reportdata.report.myArrayList[i].map.hours), 'drilldown': this.reportdata.report.myArrayList[i].map.user, 'time': this.millisecondsToStr(this.reportdata.report.myArrayList[i].map.hours) }
            this.user_details[i] = { 'name': response.myArrayList[i].map.username, 'y': 0}
            for (var k = 0; k < this.user_details.length; k++) {
              this.user_details[k].name= this.capitalizeFirstLetter(this.user_details[k].name);
            }
            let Objectdata: {} = {};
            let sDate = this.startdates;
            let eDate = this.enddates;
            sDate = this.datepipe.transform(sDate, 'dd-MM-YYYY');
            eDate = this.datepipe.transform(eDate, 'dd-MM-YYYY');
            let datacommon: string = sDate + " to " + eDate;
            Objectdata[`${this.project_name} (${datacommon})`] = "";
            this.export_data.push(Objectdata);
            this.tot_emp = response.myArrayList.length;
            this.job_arr[i] = {};
            this.show = true;
            if(this.job_arr[0].length == undefined) {

            }
            if (this.user_details.length < 1 ) {
              this.no_data_found_project = true;
            }
            setTimeout(() => {
              Highcharts.chart('project_job', this.setchartoption1('column'));
            }, 1000);
          }
        }
      }       

        this.spinner.hide();
      }, (error) => {
        this.router.navigate(["/404"]);
      })
  }
  capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  // *********************** chart section for projects and jobs*****************************
  jobCountDetails() {

    setTimeout(() => {
      Highcharts.chart('job_hours', this.setchartoption2('column'));
    }, 1000);
  }
  setchartoption(e) {
    //pie chart
    this.options = {
      chart: {
        type: e
      },
      title: {
        text: 'Staff logged hours project report',
        enabled: false
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
      credits: {
        enabled: false
      },
      yAxis: {
        title: {
          text: 'Total logged hours'
        },

      },
      legend: {
        enabled: false
      },
      plotOptions: {
        series: {
          borderWidth: 0,
          dataLabels: {
            enabled: true,
          }
        }
      },
      tooltip: {
        pointFormat: '({point.time})'
      },
      series:
        [
          {
            name: "Staff",
            colorByPoint: true,
            data: this.user_details,
          }
        ],
      drilldown: {
        series:
          this.job_arr,

        drillUpButton: {
          relativeTo: 'spacingBox',
          position: {
            x: -50,
            y: 10,
          },
        },
      }
    }
    return this.options;
  }

  setchartoption1(e) {
    //pie chart
    this.options = {
      chart: {
        type: e
      },
      title: {
        text: 'Staff logged hours project report',
        enabled: false
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
      credits: {
        enabled: false
      },
      yAxis: {
        title: {
          text: 'Total logged hours'
        },

      },
      legend: {
        enabled: false
      },
      plotOptions: {
        series: {
          borderWidth: 0,
          dataLabels: {
            enabled: true,
          }
        }
      },
      series:
        [
          {
            name: "Staff",
            colorByPoint: true,
            data: this.user_details,            
          }
        ],
        tooltip: {
          pointFormat: 'No Job Found'
        },
    }
    return this.options;
  }
  setchartoption2(e) {
    //pie chart
    this.options = {
      chart: {
        type: e
      },
      title: {
        text: 'Staff logged hours job report',
        enabled: false
      },
      accessibility: {
        announceNewData: {
          enabled: true
        }
      },
      xAxis: {
        type: 'category'
      },
      credits: {
        enabled: false
      },
      yAxis: {
        title: {
          text: 'Total logged hours'
        },

      },
      legend: {
        enabled: false
      },
      plotOptions: {
        series: {
          borderWidth: 0,
          dataLabels: {
            enabled: true,
          }
        }
      },
      series:
        [
          {
            name: "Job",
            colorByPoint: true,
            data: this.job_details,            
          }
        ],
        // tooltip: {
        //   pointFormat: 'No Job Found'
        // },
    }
    return this.options;
  }
  exportAsXLSX(): void {
    this.exportservice.exportAsExcelFile(this.export_data, this.project_name + '_Repors', "xlsx");
  }
  exportAsXLS() {
    this.exportservice.exportAsExcelFile(this.export_data, this.project_name + '_Repors', "xls");
  }
  exportAsCSV() {
    this.exportservice.exportAsExcelFile(this.export_data, this.project_name + '_Repors', "csv");
  }
}
