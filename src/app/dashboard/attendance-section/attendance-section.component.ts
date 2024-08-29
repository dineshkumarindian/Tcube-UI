import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import  moment from 'moment-timezone';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import {AttendanceServiceService} from '../../services/attendance-service.service';
import {noDataMessage} from '../../util/constants';
@Component({
  selector: 'app-attendance-section',
  templateUrl: './attendance-section.component.html',
  styleUrls: ['./attendance-section.component.less']
})
export class AttendanceSectionComponent implements OnInit {
  nodataMsg = noDataMessage;
  displayedColumns: string[] = ['date', 'firstIn', 'lastout', 'activehrs', 'timediff', 'Status'];
  dataSource: MatTableDataSource<any>;
  timesheet: boolean = true;
  timesheetloder: boolean = true;
  todaystatuscheck: string;
  email: string|null;
  yearofmonth: string;
  alldetails: any;
  startdates: any;
  enddates: any;
  constructor(private attendanceService: AttendanceServiceService,
    private spinner: NgxSpinnerService,public router: Router,) { }

  ngOnInit() {
    this.email = localStorage.getItem("Email");
    this.todaystatuscheck = moment().format("DD-MM-YYYY");
    this.alldetails = [];
    this.startdates = new Date();
    const date = new Date(this.startdates);
    this.startdates = new Date(date.getFullYear(), date.getMonth(), 1);
    this.enddates = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    this.getmonthlyReport();
  }

  //! To get current month attendace sheet data
  getmonthlyReport() {
    this.spinner.show();
    let formdata = {
      "email": this.email,
      "startdate": this.formatedate(this.startdates),
      "enddate": this.formatedate(this.enddates),
    }
    this.attendanceService.getMonthreportdata(formdata).subscribe(data => {
      this.timesheetloder = true;
      if (data.map.statusMessage == "Success") {
        // console.log(data);

        let response: any[] = JSON.parse(data.map.report);
        this.alldetails = JSON.parse(data.map.details);
        this.dataSource = new MatTableDataSource(response.reverse());
        this.timesheetloder = false;
        if (this.alldetails.length > 0) {
          this.timesheet = false;
        }

        setTimeout(() => {
          this.spinner.hide();
        }, 2000);
      }
      else {
        this.timesheetloder = false;
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

  //! date formate function
  formatedate(string: string) {
    var date = new Date(string),
      mnth = ("0" + (date.getMonth() + 1)).slice(-2),
      day = ("0" + date.getDate()).slice(-2);
    // this.yearofmonth=mnth+' '+date.getFullYear();
    this.yearofmonth = date.getMonth() + " " + date.getFullYear();
    return [day, mnth, date.getFullYear()].join("-");
  }
}
