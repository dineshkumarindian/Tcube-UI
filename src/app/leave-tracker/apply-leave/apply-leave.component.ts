import { Component, OnInit } from "@angular/core";
import {
  UntypedFormArray,
  UntypedFormBuilder,
  UntypedFormControl,
  UntypedFormGroup,
  Validators,
} from "@angular/forms";
import { Router } from "@angular/router";
import moment from "moment-timezone";
import { NgxSpinnerService } from "ngx-spinner";
import { ReplaySubject, Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { ApprovedLeaveDetailsService } from "src/app/services/approved-leave-details.service";
import { LeaveTrackerService } from "src/app/services/leave-tracker.service";
import { NotificationService } from "src/app/services/notification.service";
import { SettingsService } from "src/app/services/settings.service";
import { UtilService } from "src/app/services/util.service";
import { DateAdapter } from "@angular/material/core";
import { MAT_DATE_FORMATS } from "@angular/material/core";
// import * as moment from 'moment-timezone';
import { Moment } from "moment-timezone";
import { errorMessage } from "../../util/constants";
import { ManageOrgService } from '../../services/super-admin/manage-org/manage-org.service';
import { element } from "protractor";
@Component({
  selector: "app-apply-leave",
  templateUrl: "./apply-leave.component.html",
  styleUrls: ["./apply-leave.component.less"],
})
export class ApplyLeaveComponent implements OnInit {
  requiredMessage = errorMessage;
  leaveFormGroup: UntypedFormGroup;
  emp_id_leave: any;
  startDate: string;
  endDate: string;
  full_halfDay: string;
  full_halfDay1: string;
  first_SecondHalf: string;
  leave_id: any;
  totalDays: any;
  fullHalfDay = ["Full Day", "Half Day"];
  firstSecondHalf = ["First Half", "Second Half"];

  leaveTypes = ["Sick Leave", "Casual Leave"];

  slackIntegrationDetails: any = null;
  /** control for the MatSelect filter keyword */
  public leaveFilterCtrl: UntypedFormControl = new UntypedFormControl();

  /** list of head filtered by search keyword */
  public filteredleave: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);

  protected _onDestroy = new Subject<void>();
  newLeaveTypeDetails: any;
  startOfYear: any;
  endOfYear: any;
  takenDays: any;
  isLeaveAvailable: Boolean = false;
  isLeaveData: Boolean = false;
  availableDays: any;
  empDetails: any;
  LeaveTypeArr: any[] = [];
  approvedCounts: any = [];
  choosenDates: any = [];
  newTotalDays: number = 0;
  selectYear: any;
  selectLeaveType: boolean;
  dates = [];
  holidayDates: any[];
  leaveTypeDate: Date;
  loginstr: string;
  loginurl: any = "";
  leave_tracker_url_str: any;
  modifiedstring: any;
  reporterId: string;
  slackconfigurations: any[] = [];
  slackleaveTimeData: any;
  // workingDays: any[] = [];
  notselectedDayValue = [];
  afterLeaveRequestDate: any;
  hideTheafterLeaveRequestDate: any[] = [];
  leaveTypeHintMsg: string = '';

  constructor(
    private leaveTrackerService: LeaveTrackerService,
    private _formbuilder: UntypedFormBuilder,
    private spinner: NgxSpinnerService,
    private utilsService: UtilService,
    private router: Router,
    private settingsService: SettingsService,
    private approvedLeaveDetailsService: ApprovedLeaveDetailsService,
    private notificationService: NotificationService,
    private dateAdapter: DateAdapter<Date>,
    private manageOrg: ManageOrgService
  ) {
    this.dateAdapter.setLocale("en-GB");
    this.loginurl = window.location.href;
    this.modifiedstring = this.loginurl.slice(0, this.loginurl.length - 10);
    this.loginstr = "leave-tracker";
    this.leave_tracker_url_str = this.modifiedstring.concat(
      this.loginstr.toString()
    );
  }

  ngOnInit() {
    this.leaveTypeDate = new Date(localStorage.getItem("lt-date"));
    this.selectLeaveType = false;
    this.startOfYear = moment(this.leaveTypeDate).startOf("year").toDate();
    this.endOfYear = moment(this.leaveTypeDate).endOf("year").toDate();
    this.getslackDetails();
    this.emp_id_leave = localStorage.getItem("Id");
    this.emp_id_leave = new UntypedFormControl(this.emp_id_leave);
    this.leaveFormGroup = this._formbuilder.group({
      leave_type: ["", [Validators.required]],
      startDate: ["", [Validators.required]],
      endDate: ["", [Validators.required]],
      reason_for_leave: [""],
      months: [0],
      days: [0],
      years: [0],
      date1: "",
      month1: "",
      year1: "",
      date2: "",
      month2: "",
      year2: "",
      full_halfDays: this._formbuilder.array([]),
    });
    this.getHolidaysByOrgId();
    this.getActiveLeaveTypeByOrgIdAndDates();
    this.getEmpDetails();
    this.getStartDateEndDate();
    this.getOrgDetailsById();
  }
  //formarray of full half day
  get full_halfDays(): UntypedFormArray {
    return this.leaveFormGroup.get("full_halfDays") as UntypedFormArray;
  }

  newSkill(): UntypedFormGroup {
    return this._formbuilder.group({
      full_half: "Full Day",
      first_second: "",
    });
  }
  //While choose the start , end date --> this formgroup pushed into the above array
  addlists() {
    this.full_halfDays.push(this.newSkill());
  }
  getOrgDetailsById() {
    this.spinner.show();
    this.manageOrg.getOrgDetailsById(localStorage.getItem("OrgId")).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        let response = JSON.parse(data.map.data);
        let workingDays: any[] = JSON.parse(response.working_days);
        let dayValue: any[] = [0, 1, 2, 3, 4, 5, 6];
        let notselectedDay: any[] = [];
        workingDays.forEach(element => {
          notselectedDay.push(element.id);
        })
        dayValue.forEach(value => {
          if (!notselectedDay.includes(value)) {
            this.notselectedDayValue.push(value);
          }
        });
      }
    });
  }

  protected filterleave() {
    if (!this.newLeaveTypeDetails) {
      return;
    }
    // get the search keyword
    let search = this.leaveFilterCtrl.value;
    if (!search) {
      this.filteredleave.next(this.newLeaveTypeDetails.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
    // filter the client
    this.filteredleave.next(
      this.newLeaveTypeDetails.filter(
        (data) => data.leave_type.toLowerCase().indexOf(search) > -1
      )
    );
  }


  //start date --> datepicker filter
  weekendsStartDatesFilter = (d: Date): boolean => {
    const day = new Date(d).getDay();
    const time = new Date(d).getTime();
    const year = new Date(d).getFullYear();
    if (year == this.selectYear) {
      /* Prevent Saturday , Sunday and applied and pending leave dates for select.  day !== 6 &&*/
      return (
        !this.notselectedDayValue.includes(day) &&
        !this.dates.find((x) => new Date(x).getTime() == time) &&
        !this.holidayDates.find((x) => new Date(x).getTime() == time) &&
        !this.hideTheafterLeaveRequestDate.includes(moment(d).format('YYYY-MM-DD'))
      );
    } else {
      return (
        day !== 0 &&
        day !== 1 &&
        day !== 2 &&
        day !== 3 &&
        day !== 4 &&
        day !== 5 &&
        day !== 6
      );
    }
  };
  //end date --> datepicker filter
  weekendsEndDatesFilter = (d: Date): boolean => {
    const day = new Date(d).getDay();
    const time = new Date(d).getTime();
    const year = new Date(d).getFullYear();
    // const day = d.getDate();
    // const time = d.getTime();
    // const year = d.getFullYear();
    if (year == this.selectYear) {
      /* Prevent Saturday , Sunday and applied and pending leave dates for select.   day !== 6 &&*/
      return (
        // day !== 0 &&
        !this.notselectedDayValue.includes(day) &&
        !this.dates.find((x) => new Date(x).getTime() == time) &&
        !this.holidayDates.find((x) => new Date(x).getTime() == time) &&
        !this.hideTheafterLeaveRequestDate.includes(moment(d).format('YYYY-MM-DD'))
      );
    } else {
      return (
        day !== 0 &&
        day !== 1 &&
        day !== 2 &&
        day !== 3 &&
        day !== 4 &&
        day !== 5 &&
        day !== 6
      );
    }
  };

  tempErrDates: any = [];
  startDateClicked() {
    let date1 = this.leaveFormGroup.controls["startDate"].value;
    this.leaveFormGroup.controls["endDate"].setValue(date1);
    // To get the list of choosed dates
    if (this.leaveFormGroup.controls["endDate"].value != null) {
      let ed_date = new Date(this.leaveFormGroup.controls["endDate"].value);
      this.getDateList(new Date(date1), ed_date);
    }
  }

  endDateClicked() {
    let date1 = this.leaveFormGroup.controls["endDate"].value;
    // To get the list of choosed dates
    let sd_date = new Date(this.leaveFormGroup.controls["startDate"].value);
    this.getDateList(sd_date, new Date(date1));
  }

  // To get the list of choosed dates
  getDateList(sd, ed) {
    this.choosenDates = [];
    this.newTotalDays = 0;

    while (sd <= ed) {
      let isweekEnd = moment(sd).format("dddd");
      let isSameDay = moment(sd).toDate().getTime();
      const day = new Date(sd).getDay();
      // isweekEnd != "Sunday" && isweekEnd != "Saturday"
      if (
        // isweekEnd != "Sunday" &&
        !this.notselectedDayValue.includes(day) &&
        !this.dates.find((x) => moment(x).toDate().getTime() == isSameDay) &&
        !this.holidayDates.find((x) => new Date(x).getTime() == isSameDay)
      ) {
        this.choosenDates.push({
          date: moment(sd).format("YYYY-MM-DD"),
          full_half: "Full Day",
          first_second: "First Half",
        });
      }
      sd.setDate(sd.getDate() + 1);
    }
    //while choose the end date clear the existing form array
    while (this.full_halfDays.length !== 0) {
      this.full_halfDays.removeAt(0);
    }
    // again set the form(form array) newly for choosen dates
    for (let i = 0; i < this.choosenDates.length; i++) {
      this.addlists();
    }

    //set the half day value and disable the form array of i
    for (let i = 0; i < this.choosenDates.length; i++) {
      for (let j = 0; j < this.halfDayDates.length; j++) {
        if (
          moment(this.choosenDates[i].date).toDate().getTime() ==
          moment(this.halfDayDates[j].date).toDate().getTime()
        ) {
          this.choosenDates[i].full_half = "Half Day";
          if (this.halfDayDates[j].first_second == "First Half") {
            this.full_halfDays.at(i).get("full_half").setValue("Half Day");
            this.full_halfDays
              .at(i)
              .get("first_second")
              .setValue("Second Half");
            this.full_halfDays.at(i).get("full_half").disable();
            this.full_halfDays.at(i).get("first_second").disable();
            this.choosenDates[i].first_second = "Second Half";
          } else if (this.halfDayDates[j].first_second == "Second Half") {
            this.full_halfDays.at(i).get("full_half").setValue("Half Day");
            this.full_halfDays.at(i).get("first_second").setValue("First Half");
            this.full_halfDays.at(i).get("full_half").disable();
            this.full_halfDays.at(i).get("first_second").disable();
            this.choosenDates[i].first_second = "First Half";
          }
        }
      }
      this.full_halfDays.at(i).get("first_second").disable();
    }

    for (let i = 0; i < this.choosenDates.length; i++) {
      if (this.choosenDates[i].full_half == "Half Day") {
        this.newTotalDays = this.newTotalDays + 0.5;
      } else if (this.choosenDates[i].full_half == "Full Day") {
        this.newTotalDays = this.newTotalDays + 1;
      }
    }

    this.leaveFormGroup.controls["days"].setValue(this.newTotalDays);
    if (this.availableDays == 0) {
      this.isLeaveAvailable = false;
    } else {
      if (this.availableDays < this.newTotalDays + this.takenDays) {
        this.isLeaveAvailable = true;
      } else this.isLeaveAvailable = false;
    }
  }

  fullHalfClicked1(event, i) {
    if (event.value == "Half Day") {
      this.full_halfDays.at(i).get("first_second").enable();
      this.full_halfDays.at(i).get("first_second").setValue("First Half");
      this.newTotalDays -= 0.5;
    }
    if (event.value == "Full Day") {
      this.full_halfDays.at(i).get("first_second").disable();
      this.choosenDates[i].first_second = "";
      this.newTotalDays += 0.5;
    }
    if (this.availableDays == 0) {
      this.isLeaveAvailable = false;
    } else {
      if (this.availableDays < this.newTotalDays + this.takenDays) {
        this.isLeaveAvailable = true;
      } else this.isLeaveAvailable = false;
    }
    this.choosenDates[i].full_half = event.value;
  }

  firstSecondHalfClicked(event, i) {
    this.choosenDates[i].first_second = event.value;
  }

  /// create leave
  leaveDetails: any;
  createLeave() {
    this.spinner.show();
    for (let i = 0; i < this.choosenDates.length; i++) {
      if (this.choosenDates[i].full_half == "Full Day") {
        this.choosenDates[i].first_second = "";
      }
    }
    let zone = moment.tz.guess();
    let orgId = localStorage.getItem("OrgId");
    let data: Object = {
      org_id: orgId,
      emp_id: localStorage.getItem("Id"),
      leave_type: this.leaveFormGroup.value.leave_type.leave_type,
      leave_type_id: this.leaveFormGroup.value.leave_type.id,
      total_days: this.newTotalDays,
      start_date: this.leaveFormGroup.value.startDate,
      end_date: this.leaveFormGroup.value.endDate,
      half_full_day: JSON.stringify(this.choosenDates),
      reason_for_leave: this.leaveFormGroup.value.reason_for_leave,
      start_date_str: this.leaveFormGroup.value.startDate,
      end_date_str: this.leaveFormGroup.value.endDate,
      timezone: zone,
      leave_tracker_url: this.leave_tracker_url_str,
    };
    this.leaveTrackerService.createLeaveDetails(data).subscribe(
      (data) => {
        if(data.map.statusMessage == "Success" && data.map.Error == "Error in creating leave details due to mail configuration check the configuration details") {
          this.utilsService.openSnackBarAC("Leave applied successfully", "OK");       
          this.notification();
          this.notificationWithEmailMsg();
          this.leaveDetails = data.map.detail;
          if (this.slackIntegrationDetails != null && !this.slackIntegrationDetails.is_paused) {
            this.slackNotificationForApprovals(
              data.map.detail.id,
              this.choosenDates,
            );
          }
          setTimeout(() => {
            this.router.navigate(["/leave-tracker"]);
          }, 2000);
          localStorage.removeItem("lt-date"); 
        } else if(data.map.statusMessage == "Success") {
          // this.resetform();
          this.utilsService.openSnackBarAC("Leave applied successfully", "OK");
          this.notification();
          this.leaveDetails = data.map.detail;
          if (this.slackIntegrationDetails != null && !this.slackIntegrationDetails.is_paused) {
            this.slackNotificationForApprovals(
              data.map.detail.id,
              this.choosenDates,
            );
          }
          setTimeout(() => {
            this.router.navigate(["/leave-tracker"]);
          }, 2000);
          localStorage.removeItem("lt-date");
        } 
        else {
          this.utilsService.openSnackBarMC(data.map.data, "OK");
        }
        this.spinner.hide();
      },
      (error) => {
        this.router.navigate(["/404"]);
        this.spinner.hide();
      }
    );
  }

  // notification create
  async notification() {
    this.spinner.show();
    let notify_id;
    let zone = moment.tz.guess();
    let message =
      this.empDetails.firstname +
      " " +
      this.empDetails.lastname +
      " applied leave and waiting for your approval.";

    if (
      this.empDetails.roleDetails.role == "OrgAdmin" &&
      !this.empDetails.reporting_manager
    ) {
      notify_id = this.empDetails.id;
    } else {
      notify_id = this.empDetails.reporting_manager;
    }
    let formdata = {
      org_id: localStorage.getItem("OrgId"),
      message: message,
      to_notify_id: notify_id,
      notifier: this.empDetails.id,
      module_name: "Leave-Tracker",
      sub_module_name: "Requests",
      //  "timesheet_id" : this.timesheetDetails.id ,
      date_of_request: moment().format("YYYY-MM-DD"),
      approval_status: "Submitted",
      timezone: zone,
    };
    await this.notificationService
      .postNotification(formdata)
      .subscribe((data) => {
        if (data.map.statusMessage == "Success") {
          this.spinner.hide();
        } else {
          this.spinner.hide();
        }
      });
  }

  // send notification with mail expired info message
  async notificationWithEmailMsg() {
    this.spinner.show();
    let notify_id;
    let zone = moment.tz.guess();
    let message =
      "Mail configuration issue encountered while  "+this.empDetails.id+" applying for leave.";
    let formdata = {
      org_id: localStorage.getItem("OrgId"),
      message: message,
      to_notify_id: this.empDetails.orgDetails.emp_id,
      notifier: this.empDetails.id,
      keyword: "mail-issue",
      timezone: zone,
    };
    await this.notificationService
      .postNotification(formdata)
      .subscribe((data) => {
        if (data.map.statusMessage == "Success") {
          this.spinner.hide();
        } else {
          this.spinner.hide();
        }
      });
  }
  calcBusinessDays(startDate, endDate) {
    var elapsed, daysAfterLastSunday;
    var ifThen = function (a, b, c) {
      return a == b ? c : a;
    };
    elapsed = endDate - startDate;
    elapsed /= 86400000;

    let daysBeforeFirstSunday = (7 - startDate.getDay()) % 7;
    daysAfterLastSunday = endDate.getDay();

    elapsed -= daysBeforeFirstSunday + daysAfterLastSunday;
    elapsed = (elapsed / 7) * 5;
    elapsed +=
      ifThen(daysBeforeFirstSunday - 1, -1, 0) +
      ifThen(daysAfterLastSunday, 6, 5);

    return Math.ceil(elapsed);
  }

  leavetypeData: any[] = [];
  uniq: any[] = [];

  getActiveLeaveTypeByOrgIdAndDates() {
    this.spinner.show();
    let zone = moment.tz.guess();
    let data: Object = {
      org_id: localStorage.getItem("OrgId"),
      start_date: this.startOfYear,
      end_date: this.endOfYear,
      timezone: zone,
    };
    this.settingsService.getActiveLeaveTypeByOrgIdAndDates(data).subscribe(
      async (data) => {
        if (data.map.statusMessage == "Success") {
          let response = JSON.parse(data.map.data);
          this.newLeaveTypeDetails = response;
          for (var i = 0; i < this.newLeaveTypeDetails.length; i++) {
            this.LeaveTypeArr.push(this.newLeaveTypeDetails[i].id);
            // this.leavetypeData.push(this.newLeaveTypeDetails[i].leave_type)
          }
          if (this.newLeaveTypeDetails == 0) {
            this.isLeaveData = true;
          } else {
            this.isLeaveData = false;
          }
          // this.getapprovedLeaveCountsByEmpIdAndLTId();
          this.getActiveLeaveTypeByOrgIdAndDatesForData();
        }
        // this.spinner.hide();
      },
      (error) => {
        this.router.navigate(["/404"]);
        this.spinner.hide();
      }
    );
  }
  getActiveLeaveTypeByOrgIdAndDatesForData() {
    this.spinner.show();
    let data: Object = {
      emp_id: localStorage.getItem("Id"),
      org_id: localStorage.getItem("OrgId"),
      start_date: this.startOfYear,
      end_date: this.endOfYear,
    };
    this.leaveTrackerService
      .getActiveleaveByEmpIdAndYearByOrgid(data)
      .subscribe(
        (data) => {
          if (data.map.statusMessage == "Success") {
            let response = JSON.parse(data.map.data);
            for (let i = 0; i < response.length; i++) {
              if (
                response[i].approval_status == "Pending" ||
                response[i].approval_status == "Approved"
              ) {
                this.leavetypeData.push(response[i]);
              }
            }
          }
          for (let i = 0; i < this.newLeaveTypeDetails.length; i++) {
            let count = 0;
            for (let j = 0; j < this.leavetypeData.length; j++) {
              if (
                this.newLeaveTypeDetails[i].leave_type ==
                this.leavetypeData[j].leave_type
              ) {
                count = count + this.leavetypeData[j].total_days;
                // this.approvedCounts.push({ "id": this.LeaveTypeArr[i], "count": count });
              }
            }
            this.approvedCounts.push({
              id: this.LeaveTypeArr[i],
              count: count,
            });
            // this.approvedCounts.push({ "id": this.LeaveTypeArr[i], "count": count });
          }
          for (let x = 0; x < this.newLeaveTypeDetails.length; x++) {
            for (let y = 0; y < this.approvedCounts.length; y++) {
              if (this.newLeaveTypeDetails[x].id == this.approvedCounts[y].id) {
                this.newLeaveTypeDetails[x].counts =
                  this.approvedCounts[y].count;
              }
            }
          }
          // listen for search field value changes
          this.leaveFilterCtrl.valueChanges
            .pipe(takeUntil(this._onDestroy))
            .subscribe(() => {
              this.filterleave();
            });

          this.filteredleave.next(this.newLeaveTypeDetails.slice());
          // this.getActiveLeaveTypeByOrgIdAndDates1();
          this.spinner.hide();
          // getActiveLeaveTypeByOrgIdAndDates1
        },
        (error) => {
          this.router.navigate(["/404"]);
          this.spinner.hide();
        }
      );
  }
  // tempData: any;
  // getapprovedLeaveCountsByEmpIdAndLTId() {
  //   this.spinner.show();
  //   for (let i = 0; i < this.LeaveTypeArr.length; i++) {
  //     let data: Object = {
  //       "org_id": localStorage.getItem("OrgId"),
  //       "emp_id": localStorage.getItem("Id"),
  //       "leave_type_id": this.LeaveTypeArr[i]
  //     }
  //     this.approvedLeaveDetailsService.getActiveleaveByEmpIdAndYearByOrgid(data).subscribe(async data => {
  //       if (data.map.statusMessage == "Success") {
  //         let response = JSON.parse(data.map.data);
  //         this.tempData = response;
  //         this.approvedCounts.push({ "id": this.LeaveTypeArr[i], "count": this.tempData });
  //         // console.log(this.approvedCounts);
  //         this.getActiveLeaveTypeByOrgIdAndDates1();
  //       }
  //       // console.log(this.newLeaveTypeDetails);
  //       this.spinner.hide();
  //     })
  //   }
  // }
  // getActiveLeaveTypeByOrgIdAndDates1() {

  //   // console.log(this.newLeaveTypeDetails);
  // }

  checkAvailableDays(event) {
    this.selectLeaveType = true;
    let year = event.year;
    this.selectYear = parseInt(year);
    this.isLeaveAvailable = false;
    this.leaveTypeHintMsg = '';
    this.availableDays = event.available_days;
    this.hideTheafterLeaveRequestDate = [];
    for (let i = 0; i < this.approvedCounts.length; i++) {
      if (event.id == this.approvedCounts[i].id) {
        this.takenDays = this.approvedCounts[i].count;
      }
    }
    if (this.availableDays == 0) {
      this.isLeaveAvailable = false;
    } else {
      if (this.availableDays < this.newTotalDays + this.takenDays) {
        this.isLeaveAvailable = true;
      } else this.isLeaveAvailable = false;
    }
    if (event.before_request_leave != null) {
      let currentDate = moment(new Date()).format('YYYY-MM-DD');
      this.afterLeaveRequestDate = moment().add(event.before_request_leave, 'days').format('YYYY-MM-DD');
      let count = 0;
      for (let temp = 0; count < event.before_request_leave; temp++) {
        const date = moment().add(temp, 'days').format('YYYY-MM-DD');
        // console.log(date);
        const check_date = new Date(date);
        if (!this.notselectedDayValue.includes(check_date.getDay())) {
          this.hideTheafterLeaveRequestDate.push(date);
          count++;
        }
      }
    }
    // console.log(this.hideTheafterLeaveRequestDate);
    if (this.hideTheafterLeaveRequestDate.length != 0) {
      if (this.hideTheafterLeaveRequestDate.length == 1) {
        this.leaveTypeHintMsg = 'Selected leave type should be able to apply before a day of current date';
      } else {
        this.leaveTypeHintMsg = "Selected leave type should be able to apply before " + this.hideTheafterLeaveRequestDate.length + " days of current date";
      }
      // this.leaveTypeHintMsg ='Submit leave requests at least '+ this.hideTheafterLeaveRequestDate.length +' days in advance, starting from the current date';
    }
  }

  async getEmpDetails() {
    // this.spinner.show();
    await this.settingsService
      .getActiveEmpDetailsById(localStorage.getItem("Id"))
      .subscribe(
        async (data) => {
          if (data.map.statusMessage == "Success") {
            let response = JSON.parse(data.map.data);
            this.empDetails = response;
            if (response.reporting_manager) {
              this.reporterId = response.reporting_manager;
            } else {
              this.reporterId = response.orgDetails.emp_id;
            }
          }
          // this.spinner.hide();
        },
        (error) => {
          this.router.navigate(["/404"]);
          this.spinner.hide();
        }
      );
  }

  fullDayDates: any = [];
  halfDayDates: any = [];
  async getStartDateEndDate() {
    this.dates = [];
    let data = {
      org_id: localStorage.getItem("OrgId"),
      emp_id: localStorage.getItem("Id"),
      start_date: this.startOfYear,
      end_date: this.endOfYear,
    };
    await this.leaveTrackerService
      .getLeavebyEmpIdAndYearAndOrgIdforleavetype(data)
      .subscribe(
        (data) => {
          if (data.map.statusMessage == "Success") {
            let response = JSON.parse(data.map.data);
            for (let d = 0; d < response.length; d++) {
              let arraylist = response[d];
              let tempData = JSON.parse(arraylist[3]);
              for (let v = 0; v < tempData.length; v++) {
                if (arraylist[2] == "Approved" || arraylist[2] == "Pending") {
                  if (tempData[v].full_half == "Full Day") {
                    this.fullDayDates.push(
                      moment(tempData[v].date).format("MM/DD/YYYY")
                    );
                  } else {
                    this.halfDayDates.push({
                      date: moment(tempData[v].date).format("MM/DD/YYYY"),
                      first_second: tempData[v].first_second,
                    });
                  }
                }
              }
            }
            // get duplicate objects
            const copyValues = [...this.halfDayDates];
            const duplicateObjects = this.halfDayDates.filter(
              (v) => copyValues.filter((cp) => cp.date === v.date).length > 1
            );

            // remove duplicate objects
            let removeData = duplicateObjects.reduce((accumalator, current) => {
              if (!accumalator.some((item) => item.date === current.date)) {
                accumalator.push(current);
              }
              return accumalator;
            }, []);

            for (let i = 0; i < removeData.length; i++) {
              this.fullDayDates.push(removeData[i].date);
              for (let j = 0; j < this.halfDayDates.length; j++) {
                if (this.halfDayDates[j].date == removeData[i].date) {
                  this.halfDayDates.splice(j, 1);
                  j--;
                }
              }
            }
          }
          this.dates = this.fullDayDates;
        },
        (error) => {
          this.router.navigate(["/404"]);
          this.spinner.hide();
        }
      );
  }
  async getHolidaysByOrgId() {
    this.spinner.show();
    let zone = moment.tz.guess();
    this.holidayDates = [];
    let data: Object = {
      org_id: localStorage.getItem("OrgId"),
      // "start_date":this.startOfYear,
      // "end_date":this.endOfYear,
      start_date: moment(this.startOfYear).format("YYYY-MM-DD").toString(),
      end_date: moment(this.endOfYear).format("YYYY-MM-DD").toString(),
      timezone: zone,
    };
    await this.settingsService
      .getActiveHolidayByOrgIdAndDates(data)
      .subscribe((data) => {
        if (data.map.statusMessage == "Success") {
          let response = JSON.parse(data.map.data);
          for (let i = 0; i < response.length; i++) {
            let leaveValue = moment(response[i].leave_date).format(
              "MM/DD/YYYY"
            );
            this.holidayDates.push(leaveValue);
          }
        }
      });
  }

  getControls() {
    return (this.leaveFormGroup.get("full_halfDays") as UntypedFormArray)
      .controls;
  }
  // Sending leave request to slack for approvals
  async slackNotificationForApprovals(Request_id, choosenDates) {
    let zone = moment.tz.guess();
    let orgId = localStorage.getItem("OrgId");
    let currentUrl = window.location.href;
    let updatedStr = currentUrl.slice(0, currentUrl.length - 13);
    let loginstr = updatedStr.concat("/login");
    let leave_applied_date = this.leaveDetails.created_time;
    let timeoffNotification =
      await this.leaveTrackerService.createLeaveTemplate(
        this.leaveDetails,
        "Approved"
      );
    let timeoffNotify = false;
    if (this.slackleaveTimeData.is_paused == false) {
      timeoffNotify = true;
    }

    let userdataApprove = {
      id: Request_id,
      emp_id: localStorage.getItem("Id"),
      reporter_id: this.reporterId,
      status: "Approved",
      comments: "",
      oauthToken: this.slackIntegrationDetails.whatsapp_access_token,
      webhook: this.slackIntegrationDetails.url,
      url: loginstr,
      timezone: zone,
      timeoffNotify: timeoffNotify,
      timeoffNotification: timeoffNotification,
      timeoffUrl: this.slackleaveTimeData.url,
    };
    let userdataReject = {
      id: Request_id,
      emp_id: localStorage.getItem("Id"),
      reporter_id: this.reporterId,
      status: "Rejected",
      comments: "",
      oauthToken: this.slackIntegrationDetails.whatsapp_access_token,
      webhook: this.slackIntegrationDetails.url,
      url: loginstr,
      timeoffNotify: timeoffNotify,
      timezone: zone,
      timeoffNotification: timeoffNotification,
      timeoffUrl: this.slackleaveTimeData.url
    };
    let details = await this.leaveTrackerService.createLeaveApprovalsPayload(
      userdataApprove,
      userdataReject,
      this.empDetails,
      choosenDates,
      this.newTotalDays,
      leave_applied_date

    );
    let slackDetails = await this.leaveTrackerService
      .sendToSlackForApprovals(
        this.slackIntegrationDetails.url,
        JSON.stringify(details)
      )
      .subscribe(async (data) => { });
  }

  //get slack details
  getslackDetails() {
    this.spinner.show();
    let data: Object = {
      org_id: localStorage.getItem("OrgId"),
      module_name: "approvals",
      reason: "approve-reject",
      app_name: "slack",
    };
    this.leaveTrackerService.getslackDetails(data).subscribe(
      (data) => {
        if (data.map.statusMessage == "Success") {
          let response = data.map.data;
          this.slackIntegrationDetails = response;
        } else if (data.map.statusMessage == "Error") {
        }
        // this.spinner.hide();
        this.getLeaveSlackDetails();
      },
      (error) => {
        this.router.navigate(["/404"]);
        this.spinner.hide();
      }
    );
  }
  getLeaveSlackDetails() {
    let data: Object = {
      "org_id": localStorage.getItem("OrgId"),
      "module_name": "leave-tracker",
      "reason": "approve-leave",
      "app_name": "slack"
    }
    this.leaveTrackerService.getslackDetails(data).subscribe(
      (data) => {
        if (data.map.statusMessage == "Success") {
          let response = data.map.data;
          this.slackleaveTimeData = response;
        } else if (data.map.statusMessage == "Error") {
        }
        this.spinner.hide();
      },
      (error) => {
        this.router.navigate(["/404"]);
        this.spinner.hide();
      }
    );
  }

  sendApprovalResponse() {
    const approveButton = document.getElementById("approve-button");
    approveButton.addEventListener("click", (event) => {
      // Prevent the default behavior of the button (navigation)
      event.preventDefault();
    });
  }
}
