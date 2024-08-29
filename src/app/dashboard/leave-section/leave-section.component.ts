import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { DomSanitizer } from '@angular/platform-browser';
import moment from 'moment-timezone';
import { NgxSpinnerService } from 'ngx-spinner';
import { Subscription } from 'rxjs';
import { ApprovedLeaveDetailsService } from '..//../services/approved-leave-details.service';
import { LeaveTrackerService } from '..//../services/leave-tracker.service';
import { SettingsService } from '..//../services/settings.service';
import { Router } from '@angular/router';
import { noDataMessage } from '../../util/constants';
import { ReminderDetailsService } from '../../services/reminder-details/reminder-details.service';
import { MatDialog } from '@angular/material/dialog';
import { LtCommonDialogComponent } from '../../leave-tracker/lt-settings/lt-common-dialog/lt-common-dialog.component';
import { JsonPipe } from '@angular/common';


@Component({
  selector: 'app-leave-section',
  templateUrl: './leave-section.component.html',
  styleUrls: ['./leave-section.component.less']
})
export class LeaveSectionComponent implements OnInit, OnDestroy {

  nodataMsg = noDataMessage;
  Today_leaves: any[];
  dataSourceleave: MatTableDataSource<any>;
  todayleavesloader: boolean = true;
  leaveontoday: boolean = true;
  myleavesdata: boolean = false;
  myleavedataloader: boolean = true;
  newLeaveTypeDetails: any[] = [];
  displayedactiveLeaveColumns: string[] = ['image', 'name', 'Leavetype', 'Status'];
  displayedColumnsforholidays: string[] = ['leavetype', 'date'];
  displayedColumnsUpComingLeaves:string[] = ['name','leavetype','duration','days'];
  upcomingholidaysloader: boolean = true;
  holiday: boolean = true;
  dataSource_up: MatTableDataSource<any>;

  upComingLeavesDataSource:MatTableDataSource<any>;
  upComingLeaves:boolean = true;
  isLeaves:boolean = true;

  todaystatuscheck: string;
  LeaveTypeArr: any[] = [];
  startOfYear: any;
  endOfYear: any;
  image_url: any;
  subscriptions: Subscription[] = [];
  tempData: any;
  approvedCounts: any = [];
  TodayData: any = [];
  todaydate: any;
  holidayDetails: any[] = [];
  tommorrow: any;
  attendanceReminder: any;
  skippedLeave: string;
  todaySkippedLeave: boolean = true;
  isAccessModule: boolean = false;

  constructor(private spinner: NgxSpinnerService,
    private settingsService: SettingsService,
    private leavetrackerService: LeaveTrackerService,
    private domSanitizer: DomSanitizer,
    private approvedLeaveDetailsService: ApprovedLeaveDetailsService,
    public router: Router,
    public reminderDetailsService: ReminderDetailsService,
    public dialog: MatDialog,
    private leaveTrackerService: LeaveTrackerService,
  ) { }

  ngOnDestroy() {
    this.subscriptions.forEach(x => {
      if (!x.closed) {
        x.unsubscribe();
      }
    });
  }

  ngOnInit() {
    this.todaystatuscheck = moment().format("DD-MM-YYYY");
    this.startOfYear = moment().startOf('year').toDate();
    this.endOfYear = moment().endOf('year').toDate();
    this.todaydate = moment().toDate();
    this.tommorrow = moment().add(1, 'days').format("YYYY-MM-DD").toString();
    // this.getEmployeeId();
    // this.getTodayLeaveDetails();
    this.LeaveTypeByOrgIdAndDates();
    this.getHolidaysByOrgId();
    this.TodayLeaves();
    this.getUpComingLeavesList();
    // this.getTrueEmployee();

  }

  // getTrueEmployee(){
  //   this.settingsService.getskippedLeaveDetails().subscribe(data =>{
  //     console.log(data);
  //     // console.log("getTrueEmployee",JSON.parse(data.map.data));

  //   })
  // }

  // getEmployeeId(){
  //   let id = localStorage.getItem('Id');
  //   // console.log(id);
  //    this.settingsService.getActiveEmpDetailsById(id).subscribe(data =>{
  //     // console.log(data);
  //     if(data.map.statusMessage == "Success"){
  //       let response = JSON.parse(data.map.data);
  //       // console.log(response);
  //     if (JSON.parse(response.roleDetails.access_to).find(access => access == 'leave-tracker')) {
  //       this.todaySkippedLeave = response.skipped_leave;
  //       this.isAccessModule = true;
  //     }else{
  //       this.isAccessModule = false;
  //     }
  //       // console.log("getEmployeeId",response);
  //       // console.log("get todaySkippedLeave",this.todaySkippedLeave);
  //     } 
  //    })
  // }
  //! To get my leave data
  async LeaveTypeByOrgIdAndDates() {
    this.LeaveTypeArr = [];
    let zone = moment.tz.guess();
    // this.spinner.show();
    let data: Object = {
      "org_id": localStorage.getItem("OrgId"),
      "start_date": this.startOfYear,
      "end_date": this.endOfYear,
      "timezone": zone,
    }

    let subscription = await this.settingsService.getActiveLeaveTypeByOrgIdAndDates(data).subscribe(async data => {
      this.myleavedataloader = true;
      if (data.map.statusMessage == "Success") {
        let response = JSON.parse(data.map.data);
        this.newLeaveTypeDetails = response;
        for (var i = 0; i < this.newLeaveTypeDetails.length; i++) {
          this.LeaveTypeArr.push(this.newLeaveTypeDetails[i].id);
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
        this.myleavedataloader = false;
        if (this.newLeaveTypeDetails.length > 0) {
          this.myleavesdata = true;
        }
        this.getActiveLeaveTypeByOrgIdAndDatesForData();
      }
    })
    this.subscriptions.push(subscription);
  }

  //! To get approved leave counts
  // async getapprovedLeaveCountsByEmpIdAndLTId() {
  //   // this.spinner.show();
  //   // console.log("this.LeaveTypeArr");
  //   // console.log(this.LeaveTypeArr);
  //   // console.log("2 -->" + this.LeaveTypeArr);
  //   for (let i = 0; i < this.LeaveTypeArr.length; i++) {
  //     let data: Object = {
  //       "org_id": localStorage.getItem("OrgId"),
  //       "emp_id": localStorage.getItem("Id"),
  //       "leave_type_id": this.LeaveTypeArr[i]
  //     }
  //     await this.approvedLeaveDetailsService.getActiveleaveByEmpIdAndYearByOrgid(data).subscribe(async data => {
  //       if (data.map.statusMessage == "Success") {
  //         let response = JSON.parse(data.map.data);
  //         this.tempData = response;
  //         this.approvedCounts.push({ "id": this.LeaveTypeArr[i], "count": this.tempData });
  //         this.getActiveLeaveTypeByOrgIdAndDates();
  //       }
  //       // this.spinner.hide();
  //     })
  //   }
  // }

  getActiveLeaveTypeByOrgIdAndDatesForData() {
    this.approvedCounts = [];
    this.spinner.show();
    this.tempData = [];
    let data: Object = {
      "emp_id": localStorage.getItem('Id'),
      "org_id": localStorage.getItem("OrgId"),
      "start_date": this.startOfYear,
      "end_date": this.endOfYear,
    }
    this.leaveTrackerService.getActiveleaveByEmpIdAndYearByOrgid(data).subscribe(data => {
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

      // console.log(this.approvedCounts);
      this.getActiveLeaveTypeByOrgIdAndDates();
      this.spinner.hide();
      // getActiveLeaveTypeByOrgIdAndDates1
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
    });
  }

  //! To get active leave type
  getActiveLeaveTypeByOrgIdAndDates() {
    // console.log("3 -->" + this.newLeaveTypeDetails);
    for (let x = 0; x < this.newLeaveTypeDetails.length; x++) {
      for (let y = 0; y < this.approvedCounts.length; y++) {
        if (this.newLeaveTypeDetails[x].id == this.approvedCounts[y].id) {
          this.newLeaveTypeDetails[x].available_days = this.newLeaveTypeDetails[x].available_days - this.approvedCounts[y].count;
          this.newLeaveTypeDetails[x].counts = this.approvedCounts[y].count;
        }
      }
      // console.log(this.newLeaveTypeDetails);

    }
  }
  getTodayLeaves: any[] = [];
  isTodayLeaves: boolean;
  //! Today leaves details
  async TodayLeaves() {
    // this.spinner.show();
    let zone = moment.tz.guess();
    this.getTodayLeaves = [];
    this.isTodayLeaves = false;
    let data: Object = {
      "org_id": localStorage.getItem("OrgId"),
      "start_date": moment().startOf('day').toDate(),
      "timezone": zone,
    }
    let subscription = await this.leavetrackerService.getTodayLeavesByOrgid(data).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        let response: any[] = JSON.parse(data.map.data);
        // console.log(response);
        // for (var i = 0; i < response.length; i++) {
        //   if (response[i].emp_img != undefined) {
        //     let stringArray = new Uint8Array(response[i].emp_img);
        //     const STRING_CHAR = stringArray.reduce((data, byte) => {
        //       return data + String.fromCharCode(byte);
        //     }, '');
        //     let base64String = btoa(STRING_CHAR);
        //     response[i].emp_img = this.domSanitizer.bypassSecurityTrustUrl("data:image/jpeg;base64," + base64String);
        //   }
        //   else {
        //     response[i].emp_img = "assets/images/profile.png";
        //   }
        // }
        // for to show half day or full day in dashboard today leave section
        let tempDate = moment().format('YYYY-MM-DD');
        for (let i = 0; i < response.length; i++) {
          this.TodayData = JSON.parse(response[i].half_full_day);
          // console.log(this.TodayData);
          for (let j = 0; j < this.TodayData.length; j++) {
            if (tempDate == this.TodayData[j].date) {
              if (this.TodayData[j].full_half == 'Full Day') {
                response[i].half_full_day = this.TodayData[j].full_half;
              } else {
                response[i].half_full_day = this.TodayData[j].first_second;
              }
            } else {}
          }
        }
        this.getEmpImages([...new Set(response.map(item => item.emp_id))]);
        this.todayleavesloader = true;
        this.Today_leaves = response;
        this.dataSourceleave = new MatTableDataSource(response.reverse());
        this.todayleavesloader = false;
        if (response.length > 0) {
          this.leaveontoday = false;
        }

        this.getTodayLeaves = response;

        // setTimeout(()=>{// console.log(this.getTodayLeaves);
        // this.todayLeavePopupChanges(this.getTodayLeaves);
        // },1000);
      }
    }, (error) => {
      this.router.navigate(["/404"]);
      // this.spinner.hide();
    })
    this.subscriptions.push(subscription);
  }

  empObjWithImg: [] = [];
  isGettingEMpImage: boolean = true;
  getEmpImages(ids) {
    this.isGettingEMpImage = true;
    let data = {
      "emp_ids": ids,
    }
    this.settingsService.getEmployeeImagesByIds(data).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        this.empObjWithImg = JSON.parse(data.map.data).map;
        for (let i = 0; i < this.Today_leaves.length; i++) {
          if (this.empObjWithImg[this.Today_leaves[i].emp_id] != '') {
            let stringArray = new Uint8Array(this.empObjWithImg[this.Today_leaves[i].emp_id]);
            const STRING_CHAR = stringArray.reduce((data, byte) => {
              return data + String.fromCharCode(byte);
            }, '');
            let base64String = btoa(STRING_CHAR);
            this.Today_leaves[i].emp_img = this.domSanitizer.bypassSecurityTrustUrl("data:image/jpeg;base64," + base64String);
          } else {
            this.Today_leaves[i].emp_img = 'assets/images/user_person.png';
          }
        }
        this.isGettingEMpImage = false;
      } else {
        this.Today_leaves.map((e) => e.emp_img = 'assets/images/user_person.png');
        this.isGettingEMpImage = false;
      }
    }, (err) => {
      this.Today_leaves.map((e) => e.emp_img = 'assets/images/user_person.png');
      this.isGettingEMpImage = false;
    });
  }

  isGetLeaves: boolean = false;
  // getTodayLeaveDetails() {
  //     // this.spinner.show();
  //     this.attendanceReminder = [];
  //     let data: Object = {
  //       "org_id": localStorage.getItem('OrgId'),
  //       "module_name": "leave-tracker"
  //     }
  //     this.reminderDetailsService.getReminderByOrgIdAndModule(data).subscribe(data => {
  //       if (data.map.statusMessage == "Success") {
  //         let response = JSON.parse(data.map.data);
  //         // this.reminderDetailsList = response;
  //         this.attendanceReminder = response.find(r => r.key_primary == 'today-leaves');
  //         // console.log(this.attendanceReminder);
  //         if(this.attendanceReminder != undefined){
  //         // console.log(typeof  this.attendanceReminder);
  //         if (this.attendanceReminder.is_active == true) {
  //           this.isGetLeaves = true;
  //           this.getEmployeeId();
  //         } else {
  //           this.isGetLeaves = false;
  //         }
  //       }

  //       }
  //     });
  //     // this.spinner.hide();
  //   }

  //! To get upcoming holiday
  getHolidaysByOrgId() {
    let zone = moment.tz.guess();
    let data: Object = {
      "org_id": localStorage.getItem("OrgId"),
      "start_date": moment(this.todaydate).format("YYYY-MM-DD").toString(),
      "end_date": moment(this.endOfYear).format("YYYY-MM-DD").toString(),
      "timezone": zone,
    }
    // console.log(data);
    let subscription = this.settingsService.getActiveHolidayByOrgIdAndDates(data).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        let response = JSON.parse(data.map.data);
        this.upcomingholidaysloader = true;
        this.holidayDetails = response;
        for (let i = 0; i < this.holidayDetails.length; i++) {
          if (this.holidayDetails[i].leave_date_str == this.tommorrow) {
            this.holidayDetails[i].leave_date_str = "Tommorrow";
          }
        }
        this.upcomingholidaysloader = false;
        this.dataSource_up = new MatTableDataSource(response);
        if (response.length > 0) {
          this.holiday = false;
        }
      }
    })
    this.subscriptions.push(subscription);
  }

  getUpComingLeavesList(){
    this.spinner.show();
    let zone = moment.tz.guess();
    const currentDate = moment();
    const currentDate_after_ten_date = currentDate.add(10, 'days');
    // console.log(currentDate_after_ten_date);
    let data: Object = {
      "org_id": localStorage.getItem("OrgId"),
      "start_date": moment(this.todaydate).format("YYYY-MM-DD").toString(),
      "end_date": moment(currentDate_after_ten_date).format("YYYY-MM-DD").toString(),
      "timezone": zone,
    }
    // console.log(data);
    // debugger;
    this.leaveTrackerService.getUpcomingLeaveDays(data).subscribe(e =>{
      // console.log(e);
      if(e.map.statusMessage == "Success") {
        let response:any[] = JSON.parse(e.map.data);
        // console.log(response);
        if(response.length > 0){
        this.upComingLeaves = false;
        this.isLeaves = false;
        this.upComingLeavesDataSource = new MatTableDataSource(response);
      } 
      if (response.length == 0) {
        this.upComingLeaves = false;
        this.isLeaves = true;
      }
      this.spinner.show();
    }
    })
  }

  // todayLeavePopupChanges(leaves: any) {
  //   let todayLeaves = leaves;
  //   // console.log(todayLeaves);
  //   if(todayLeaves.length>0 ){
  //   if (this.isGetLeaves == true && this.todaySkippedLeave == false && this.isAccessModule == true) {
  //     this.isTodayLeaves = true;
  //     const dialogRef = this.dialog.open(LtCommonDialogComponent, {
  //       width: '30%',
  //       panelClass: 'custom-viewdialogstyle',
  //       data:{todayleaves:todayLeaves,remainder:this.attendanceReminder}
  //     });
  //     dialogRef.afterClosed().subscribe(result => {

  //         this.updateLeavePopupChanges();
  //         // this.updateEmpDetails('attendanceSubmit');

  //     });
  //   } 
  // }else {
  //     this.isTodayLeaves = false;
  //   }
  // }
  //  async updateLeavePopupChanges(){
  //     let id = localStorage.getItem('Id');
  //     let data  = {
  //       "id":id
  //     }
  //     await this.settingsService.updateskippedLeaveDetails(data).subscribe(data =>{
  //       // console.log("updateskippedLeaveDetails",data);
  //     })
  //   }
  applyLeave() {
    localStorage.setItem('lt-date', this.startOfYear);
    setTimeout(() => {
      this.router.navigate(["/applyleave"]);
    }, 500);
  }

}
