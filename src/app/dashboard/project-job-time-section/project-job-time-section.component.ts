import { DatePipe } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import  moment from 'moment';
import { NgxSpinnerService } from 'ngx-spinner';
import { Subscription } from 'rxjs';
import { JobsService } from 'src/app/services/jobs.service';
import { TimeTrackerService } from 'src/app/services/time-tracker.service';
import {noDataMessage} from '../../util/constants';
@Component({
  selector: 'app-project-job-time-section',
  templateUrl: './project-job-time-section.component.html',
  styleUrls: ['./project-job-time-section.component.less']
})
export class ProjectJobTimeSectionComponent implements OnInit, OnDestroy {

  noDataMsg = noDataMessage;
  isShown: boolean = false;
  dataSource4: MatTableDataSource<any>;
  myjobColumns: string[] = ['Job', 'Estimated_hours', 'logged_hours', 'started_date', 'end_date'];
  dataSource2: MatTableDataSource<any>;
  subscriptions : Subscription[] = [];
  myJob: any[] = [];
  myJobactive: any[] = [];
  totalJob: any[] = [];
  totalJobactive: any[] = [];
  myjobsdataloader: boolean = true;
  myjobsdata: boolean = true;
  timetabloder: boolean = true;
  timelogtabs = [];
  timetab = [];
  j: any;
  tabactvive: boolean = false;
  showBillSection: boolean = false;
  displayedColumnstimelog = ['task', 'time', 'status'];
  constructor(public dialog: MatDialog, public router: Router,
    private spinner: NgxSpinnerService,
    private timetrackerservice: TimeTrackerService,
    public datepipe: DatePipe,
    private jobsService: JobsService,
    ) { }

    ngOnDestroy() {
      this.subscriptions.forEach(x => {
        if(!x.closed) {
          x.unsubscribe();
        }
      });
    }
  ngOnInit() {
    this.j = 1;
    this.gettimelogs();
    if (localStorage.getItem("Role") === "org_admin") {
      this.isShown = true;
    } else {
      this.isShown = false;
    }
    let access = localStorage.getItem("emp_access");
    if (access.includes("time-tracker")) {
      this.showBillSection = true;
    }
    this.timetabloder = true;
    this.getActiveJobDetailsByOrgId();
    setTimeout(() => {
      this.timelogtabs = this.timelogtabs.sort(this.sortByProperty("value"));
      this.timetab = this.timelogtabs;
      this.timetab = this.timetab.reverse();
      this.tabactvive = true;
      this.timetabloder = false;
      // console.log(this.timelogtabs)
    }, 5000);
  }
  ///***** */ get the job details for table ****///

  getActiveJobDetailsByOrgId() {
    this.spinner.show();
    let orgId = localStorage.getItem("OrgId");
    let myId = localStorage.getItem("Id");
    let role = localStorage.getItem("Role");
    let subscription = this.jobsService.getActiveJobDetailsByOrgIdnew(orgId).subscribe(data => {
      this.myjobsdataloader = true;
      if (data.map.statusMessage == "Success") {
        let response: any[] = JSON.parse(data.map.data);
        // console.log(response);
        let jobDetails = response;
        if (role == "org_admin") {
          let projectlist = [];
          let mydata = [];

          for (let mpj = 0; mpj < jobDetails.length; mpj++) {
            // && jobDetails[mpj].is_activated == true

            if (!projectlist.includes(jobDetails[mpj].project_id) && jobDetails[mpj].is_deleted == false) {
              projectlist.push(jobDetails[mpj].project_Id);
            }
            for (let pd = 0; pd < jobDetails[mpj].jobAssigneeDetails.length; pd++) {
              if (jobDetails[mpj].jobAssigneeDetails[pd].map.id == myId) { 
                this.myJob.push(jobDetails[mpj]); 
                //  continue;
              }
              if (jobDetails[mpj].jobAssigneeDetails[pd].map.id == myId && jobDetails[mpj].is_activated == true) {
                this.myJobactive.push(jobDetails[mpj]);
                //  continue;
              }
            }
            if (jobDetails[mpj].jobAssigneeDetails) {
              this.totalJob.push(jobDetails[mpj]);
            }
            if (jobDetails[mpj].jobAssigneeDetails && jobDetails[mpj].is_activated == true) {
              this.totalJobactive.push(jobDetails[mpj]);
            }
          }
          this.myJob = JSON.parse(JSON.stringify(this.myJob));
          for(let i=0; i<this.myJob.length; i++){
            for(let j=0; j<this.myJob[i].jobAssigneeDetails.length;j++){
              if (this.myJob[i].jobAssigneeDetails[j].map.id == myId){
                this.myJob[i].logged_hours =this.myJob[i].jobAssigneeDetails[j].map.logged_hours;
              }
            }
          }
        } else {
          // let mydata = [];
          let projectlist = [];
          let clientcount = [];
          for (let mpj = 0; mpj < jobDetails.length; mpj++) {
            for (let pd = 0; pd < jobDetails[mpj].jobAssigneeDetails.length; pd++) {
              if (!projectlist.includes(jobDetails[mpj].project_id) && jobDetails[mpj].is_deleted == false) {
                projectlist.push(jobDetails[mpj].project_id);
              }
              if (jobDetails[mpj].jobAssigneeDetails[pd].map.id == myId) {
                this.myJob.push(jobDetails[mpj]);
                // continue;
              }
              if (jobDetails[mpj].jobAssigneeDetails[pd].map.id == myId && jobDetails[mpj].is_activated == true) {
                this.myJobactive.push(jobDetails[mpj]);
              }
            }
          }
          this.myJob = JSON.parse(JSON.stringify(this.myJob));
          for(let i=0; i<this.myJob.length; i++){
            for(let j=0; j<this.myJob[i].jobAssigneeDetails.length;j++){
              if (this.myJob[i].jobAssigneeDetails[j].map.id == myId){
                this.myJob[i].logged_hours =this.myJob[i].jobAssigneeDetails[j].map.logged_hours;
              }
            }
          }
          // console.log(this.totalJob);

        }
        this.myjobsdataloader = false;
        this.dataSource2 = new MatTableDataSource(this.myJob);
        this.dataSource4 = new MatTableDataSource(this.totalJob);
        if (this.myJob.length > 0) {
          this.myjobsdata = false;
        }
        setTimeout(() => {
          this.spinner.hide();
        }, 2000);
      }
      else {
        this.myjobsdataloader = false;
        setTimeout(() => {
          this.spinner.hide();
        }, 2000);
      }

    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
    })
    this.subscriptions.push(subscription);
  }

  //! To set active mat tab
  sortByProperty(property) {
    return function (a, b) {
      if (a[property] > b[property])
        return 1;
      else if (a[property] < b[property])
        return -1;

      return 0;
    }
  }

  //! To get timelogs
  gettimelogs() {
    this.timelogtabs = [];
    var date1, date2, date3, date4, date5;
    var v1, v2, v3, v4, v5;
    this.j -= 1;
    date1 = moment().add(this.j, 'days').format("YYYY-MM-DD");
    v1 = this.gettimesheetbydate(date1, 1);
    this.j -= 1;
    date2 = moment().add(this.j, 'days').format("YYYY-MM-DD");
    v2 = this.gettimesheetbydate(date2, 2);
    this.j -= 1;
    date3 = moment().add(this.j, 'days').format("YYYY-MM-DD");
    v3 = this.gettimesheetbydate(date3, 3);
    this.j -= 1;
    date4 = moment().add(this.j, 'days').format("YYYY-MM-DD");
    v4 = this.gettimesheetbydate(date4, 4);
    this.j -= 1;
    date5 = moment().add(this.j, 'days').format("YYYY-MM-DD");
    v5 = this.gettimesheetbydate(date5, 5);

  }

  //! To get timesheet data 
  gettimesheetbydate(date, order) {
    this.spinner.show();
    let formdata = {
      "emp_id": localStorage.getItem('Id'),
      "date_of_request": date
    }

   let subscription = this.timetrackerservice.getbyempidanddate(formdata).subscribe(data => {
      var details;
      // console.log(formdata.date_of_request)
      if (data.map.statusMessage == "Success") {
        var ms = data.map.total_time;
        var data1 = JSON.parse(data.map.details);
        var seconds: any = Math.floor((ms / 1000) % 60);
        var minutes: any = Math.floor((ms / (1000 * 60)) % 60);
        var hours: any = Math.floor((ms / (1000 * 60 * 60)) % 24);

        hours = (hours < 10) ? "0" + hours : hours;
        minutes = (minutes < 10) ? "0" + minutes : minutes;
        seconds = (seconds < 10) ? "0" + seconds : seconds;

        details = {
          date: this.datepipe.transform(new Date(formdata.date_of_request), 'dd EEE'), data: data1,
          value: order,
          total_time: hours + ":" + minutes + ":" + seconds
        }
        this.timelogtabs.push(details);
        setTimeout(() => {
          this.spinner.hide();
        }, 2000);
      }
      else {
        details = {
          date: this.datepipe.transform(new Date(formdata.date_of_request), 'dd EEE'), data: [],
          value: order
        }
        this.timelogtabs.push(details);
        setTimeout(() => {
          this.spinner.hide();
        }, 2000);
      }

    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
    })
    // this.j-=1;           
    this.subscriptions.push(subscription);
  }
}
