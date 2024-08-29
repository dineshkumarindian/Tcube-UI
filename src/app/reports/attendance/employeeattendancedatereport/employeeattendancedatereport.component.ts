import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort} from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatDatepickerInputEvent, } from '@angular/material/datepicker';
import moment from 'moment-timezone';
import { NgxSpinnerService } from 'ngx-spinner';
import { AttendanceServiceService } from '../../../services/attendance-service.service';
import * as Highcharts from 'highcharts';
import {noDataMessage} from '../../../util/constants';
import * as tablePageOption from '../../../util/table-pagination-option';

declare var require: any;
const More = require('highcharts/highcharts-more');
More(Highcharts);

import Histogram from 'highcharts/modules/histogram-bellcurve';
Histogram(Highcharts);

import highcharts3D from 'highcharts/highcharts-3d';
import { Router } from '@angular/router';
highcharts3D(Highcharts);

// const Exporting = require('highcharts/modules/exporting');
// Exporting(Highcharts);

const ExportData = require('highcharts/modules/export-data');
ExportData(Highcharts);

const Accessibility = require('highcharts/modules/accessibility');
Accessibility(Highcharts);

@Component({
  selector: 'app-employeeattendancedatereport',
  templateUrl: './employeeattendancedatereport.component.html',
  styleUrls: ['./employeeattendancedatereport.component.less']
})
export class EmployeeattendancedatereportComponent implements OnInit {

  nodataMsg = noDataMessage;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  constructor(private attendanceService: AttendanceServiceService, public datepipe: DatePipe, private spinner: NgxSpinnerService, private router : Router,) { }
  today: any;
  j: number = 0;
  dates: any;
  datepick: UntypedFormControl;
  displayedColumns: string[] = ['id', 'firstname','date', 'activehrs', 'present'];
  // displayedColumns: string[] = ['id', 'firstname', 'email', 'designation', 'role', 'date', 'activehrs', 'lastaction', 'present'];
  dataSource: MatTableDataSource<any>;
  alldetails: any;
  public activity;
  public xData;
  public label;
  options: any;
  optiontwo: any;
  Filter: boolean;
  filterData: string;
  maxDate: Date;
  todaydate: any;
  nextdisable: boolean = true;
  pageSize:number = 10;
  tablePaginationOption:number[];

  ngOnInit() {
    this.maxDate = new Date();
    this.datepick = new UntypedFormControl(new Date())
    this.today = moment().format("YYYY-MM-DD");
    this.todaydate = this.datepipe.transform(new Date(), 'dd-MM-yyyy');
    this.dates = new Date();
    let date = this.datepipe.transform(this.dates, 'dd-MM-yyyy');
    this.getAttendanceDateReport(date);
    // Highcharts.chart('container', this.setchartoneoption(1,0));
  }

  getAttendanceDateReport(date: any) {
    this.spinner.show();
    let formdata = {
      "date": date,
      "org_id": localStorage.getItem("OrgId")
    }
    this.attendanceService.getEmployeeDateAttendance(formdata).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        let response: any[] = JSON.parse(data.map.report);
        this.tablePaginationOption = tablePageOption.tablePaginationOption(response.length);
        this.dataSource = new MatTableDataSource(response);
        // console.log(data);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        Highcharts.chart('container', this.setchartoneoption(data.map.day_presents, data.map.day_absents));
        Highcharts.chart('containertwo', this.setcharttwooption(data.map.active_In, data.map.active_Out));
        setTimeout(() => {
          this.spinner.hide();
        }, 2000);
      }
      else {
        Highcharts.chart('container', this.setchartoneoption(0, 0));
        Highcharts.chart('containertwo', this.setcharttwooption(0, 0));
        setTimeout(() => {
          this.spinner.hide();
        }, 2000);
        // console.log(data);
      }
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
    })
  }

  setchartoneoption(data1: any, data2: any) {
    this.options = {
      chart: {
        type: 'pie',
        options3d: {
          enabled: true,
          alpha: 45,
          beta: 0
        }
      },
      title: {
        text: 'Attendance Details'
      },
      accessibility: {
        point: {
          valueSuffix: '%'
        }
      },
      tooltip: {
        pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
      },
      plotOptions: {
        pie: {
          allowPointSelect: true,
          cursor: 'pointer',
          depth: 35,
          dataLabels: {
            enabled: true,
            format: '{point.name}: {point.y}'
          }
        }
      },
      series: [{
        type: 'pie',
        name: 'Overall percentage',
        colorByPoint: true,
        data: [{
          name: 'Present',
          y: data1,
          sliced: true,
          selected: true,
          color: '#F05D23'
        }, {
          name: 'Absent',
          color: '#456173',
          y: data2
        }]
      }],
      credits: {
        enabled: false
      },

    };
    return this.options;
  }

  setcharttwooption(data1: any, data2: any) {
    this.optiontwo = {
      chart: {
        type: 'pie',
        options3d: {
          enabled: true,
          alpha: 45
        }
      },
      title: {
        text: 'Users Status'
      },
      subtitle: {
        text: ''
      },
      tooltip: {
        pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
      },
      plotOptions: {
        pie: {
          innerSize: 100,
          depth: 45,
          dataLabels: {
            enabled: true,
            format: '{point.name}: {point.y}'
          }
        }
      },
      series: [{
        type: 'pie',
        name: 'No. Of Users',
        colorByPoint: true,
        data: [{
          name: 'In',
          y: data1,
          color: '#69779B'
        }, {
          name: 'Out',
          color: '#BAE8E8',
          y: data2
        }]
      }],
      credits: {
        enabled: false
      },
    };
    return this.optiontwo;
  }


  formatedate(string: string) {
    var date = new Date(string),
      mnth = ("0" + (date.getMonth() + 1)).slice(-2),
      day = ("0" + date.getDate()).slice(-2);
    return [day, mnth, date.getFullYear()].join("-");
  }
  nextdate() {
    this.dates = new Date(+this.dates + 1 * 86400000);
    let datestr = this.datepipe.transform(this.dates, 'dd-MM-yyyy');
    if (this.todaydate == datestr) {
      this.nextdisable = true;
    }
    else {
      this.nextdisable = false;
    }
    this.datepick = new UntypedFormControl(this.dates);
    this.getAttendanceDateReport(datestr);
  }
  previousdate() {
    this.dates = new Date(+this.dates - 1 * 86400000);
    let datestr = this.datepipe.transform(this.dates, 'dd-MM-yyyy');
    if (this.todaydate == datestr) {
      this.nextdisable = true;
    }
    else {
      this.nextdisable = false;
    }
    this.datepick = new UntypedFormControl(this.dates);
    this.getAttendanceDateReport(datestr);
  }
  public onDateChange(event: MatDatepickerInputEvent<Date>): void {
    this.dates = event.value;
    let datestr = this.datepipe.transform(this.dates, 'dd-MM-yyyy');
    if (this.todaydate == datestr) {
      this.nextdisable = true;
    }
    else {
      this.nextdisable = false;
    }
    this.getAttendanceDateReport(datestr)
  }

  //filter
  applyFilter(event: Event) {
    this.Filter = false;
    this.filterData = (event.target as HTMLInputElement).value;
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.filteredData.length == 0) {
      this.Filter = true;
    }
    if (this.dataSource.paginator) {
      this.dataSource.paginator = this.paginator;
    }
  }
   //pagination size
   changePage(event){
    this.pageSize = event.pageSize;
  }
}
