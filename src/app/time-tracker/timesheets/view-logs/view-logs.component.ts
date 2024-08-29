import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import moment from 'moment';
import { NgxSpinnerService } from 'ngx-spinner';
import { TimeTrackerService } from 'src/app/services/time-tracker.service';
import { UtilService } from 'src/app/services/util.service';

@Component({
  selector: 'app-view-logs',
  templateUrl: './view-logs.component.html',
  styleUrls: ['./view-logs.component.less']
})
export class ViewLogsComponent implements OnInit {
  arraydata: any[];
  total_task_duration: any;
  no_data: any[];
  task_time: any;
  billable_time: any;
  newData: any[]=[];
  tempData: any[]=[];
  timeIntervals: any[]=[];
  tSheetStatus: string;
  tSheetId:any;
  requestedDate: string;
  comments: any;
  constructor(
    public timeTrackerService: TimeTrackerService,
    public utilsService: UtilService,
    private spinner: NgxSpinnerService,
    private router: Router,

  ) { }

  todayDate: any = new Date();
  empId: any = localStorage.getItem('Id');

  ngOnInit() {
   this.todayDate= localStorage.getItem('dateOfRequest');
   this.tSheetStatus = localStorage.getItem('tSheetStatus');
   this.tSheetId = localStorage.getItem('tSheetId');
   this.requestedDate = localStorage.getItem('requestedDate');
   this.comments = localStorage.getItem('tSheetComments');
   if(this.comments == "" || this.comments ==null){
     this.comments = "No comments";
   }
    this.getTasksByEmpidAndDate();
  }

  millisToMinutesAndSeconds(ms) {
    //  this.task_time = '00:00:00';
    var seconds: any = Math.floor((ms / 1000) % 60);
    var minutes: any = Math.floor((ms / (1000 * 60)) % 60);
    var hours: any = Math.floor((ms / (1000 * 60 * 60)) % 24);

    hours = (hours < 10) ? "0" + hours : hours;
    minutes = (minutes < 10) ? "0" + minutes : minutes;
    seconds = (seconds < 10) ? "0" + seconds : seconds;
    this.task_time = hours + ":" + minutes + ":" + seconds;
  }

  // get method for task details
  getTasksByEmpidAndDate() {
    this.spinner.show();
    let formdata = {
      "emp_id": this.empId,
      "date_of_request": this.todayDate,
      "timesheet_id" : this.tSheetId
    }
    this.timeTrackerService.getsubmittedbyempidanddate(formdata).subscribe(data => {
      this.arraydata = [];
      var total_time = data.map.total_time;
      var billable_total_time = data.map.billable_total_time;
      this.millisToMinutesAndSeconds(total_time);
      this.total_task_duration = this.task_time;
      this.millisToMinutesAndSeconds(billable_total_time);
      this.billable_time = billable_total_time;
      if (data.map.statusMessage == "Success") {
        var data1 = JSON.parse(data.map.details);

        if (data1.length > 0) {
          for (var i = 0; i < data1.length; i++) {
            this.arraydata.push(data1[i]);
            /// * * * * * * If the task is quick add task so we need to push string 
            if(data1[i].time_interval){
              var timeInterval = JSON.parse(data1[i].time_interval);
              this.newData.push(timeInterval);
            }else{
              var timeInterval1 = ["null"];
              this.newData.push(timeInterval1);
            }
          }

          /// this for From- To time gerating array
          for (let i = 0; i < this.newData.length; i++) {
            /// * * * * * * If the arrxxx[i] is equal to null it push "-" or otherwise go to else
            if(this.newData[i] == "null"){
              this.tempData = [];
              this.tempData.push("-");
              this.timeIntervals.push(this.tempData);
            }else{
              this.tempData = [];
              var newData1 = this.newData[i];
              for (let j = 0; j < newData1.length; j++) {
                var stTime = moment(newData1[j].start_time).format('hh:mm A');
                var etTime = moment(newData1[j].end_time).format('hh:mm A');
                this.tempData.push({ stTime, etTime });
              }
              this.timeIntervals.push(this.tempData.reverse());
            }

          }
          this.dataSource =new MatTableDataSource(this.arraydata);
          this.no_data = this.arraydata;
        }
        else {
          this.total_task_duration = '00:00:00'
          this.dataSource = new MatTableDataSource();
          this.no_data = [];
        }
      }
      else {
        this.dataSource = new MatTableDataSource();
        this.total_task_duration = '00:00:00'
      }
      this.spinner.hide();
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
    })
  }
  displayedColumns: string[] = ['task', 'project','bill','fromToTime', 'hours'];
  // displayedColumns: string[] = ['position', 'name', 'weight', 'symbol'];
  dataSource = new MatTableDataSource();

  getStatusClass(){
    if(this.tSheetStatus == "Approved"){
      return "active-btn";
    }else if(this.tSheetStatus == "Rejected"){
      return "inactive-btn";
    }else if(this.tSheetStatus == "Pending"){
      return "pending-btn" ;
    }
  }
  back(){
    localStorage.removeItem('dateOfRequest');
    localStorage.removeItem('tSheetStatus');
    localStorage.removeItem('tSheetId');
    localStorage.removeItem('requestedDate');
    localStorage.removeItem('tSheetComments');
  }
}