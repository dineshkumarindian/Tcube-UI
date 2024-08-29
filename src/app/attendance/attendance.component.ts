import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { VERSION } from '@angular/platform-browser-dynamic';
import { BehaviorSubject, Subject, Subscription, timer } from 'rxjs';
import { map, switchMap, takeUntil, tap } from 'rxjs/operators';
import { AttendanceServiceService } from '../services/attendance-service.service';
import { ActionComponent } from './action/action.component';
import * as moment from 'moment';
import { NgxSpinnerService } from 'ngx-spinner';
import { DomSanitizer } from '@angular/platform-browser';
import { ManageattendanceService } from '../services/manageattendance.service';
import { NoactionComponent } from './action/noaction/noaction.component';
import { SettingsService } from '../services/settings.service';
import { Router } from '@angular/router';
import { ReminderDetailsService } from '../services/reminder-details/reminder-details.service';
import { DpCommonDialogComponent } from '../day-planner/dp-common-dialog/dp-common-dialog.component';
import { UtilService } from '../services/util.service';
import { DayPlannerService } from '..//services/day-planner/day-planner.service';
import { ManageIntegrationService } from '../services/app-integration/manage-integration-service/manage-integration.service';
import { ManageOrgService } from '../services/super-admin/manage-org/manage-org.service';
import { element } from 'protractor';

@Component({
  selector: 'app-attendance',
  templateUrl: './attendance.component.html',
  styleUrls: ['./attendance.component.less']
})
export class AttendanceComponent implements OnInit, OnDestroy {
  subscriptions: Subscription[] = [];
  // @ViewChild('basicTimer', { static: true }) basicTimer: CdTimerComponent;

  Activetime: any = 0;
  activetime: boolean = false;
  actiontype: string;
  email: string;
  currentActivetime: number = 0;
  clockTimer: string = '00 Hrs : 00 Min :00 Sec';
  attendanceReminderDetails: any = [];
  submitReminderDetails: any = [];
  updateReminderDetails: any = [];
  planForTheDay: boolean = false;
  updatesForTheDay: boolean = false;
  isNotify: string = "No";
  workingDays: any[] = [];
  remainingDays:number[] = [];

  constructor(public dialog: MatDialog,
    private attendanceService: AttendanceServiceService,
    private spinner: NgxSpinnerService,
    private domSanitizer: DomSanitizer,
    private router: Router,
    private manageattendanceService: ManageattendanceService,
    private settingsService: SettingsService,
    private utilsService: UtilService,
    private dayPlannerService: DayPlannerService,
    private reminderDetailsService: ReminderDetailsService,
    private manageIntegrationService: ManageIntegrationService,
    private manageOrg: ManageOrgService) {
  }
  subscribe: any;
  totalTime: number;
  min: number;
  sec: number;
  hrs: number;
  mondaydata: any;
  tuesdaydata: any;
  wednesdaydata: any;
  thursdaydata: any;
  fridaydata: any;
  saturdaydata: any;
  sundaydata: any;
  monday: any;
  tuesday: any;
  wednesday: any;
  thursday: any;
  friday: any;
  saturday: any;
  sunday: any;
  lastaction: string;
  activeHours: string;
  nextaction: string;
  orgAttendanceCards = [];
  slackIntegrationDetails: any = [];
  whatsappIntegrationDetails: any = [];
  profileurl: any;
  profilename: string;
  reminderDialogAccess: boolean = false;
  // Dynamic_card: boolean = false;
  // Dynamic_card_saturday: boolean = false;
  // Dynamic_card_sunday: boolean = false;
  shiftName: string;
  shiftTiming: string;
  actioncards: any[] = [
    {
      "action": "I am in from office",
      "action_type": "in",
      "action_image": "../../../assets/images/punch-cards-icon/office-white.png",
      "current_section": "in",
      "next_section": "out"
    },
    {
      "action": "I am in from home",
      "action_type": "in",
      "action_image": "../../../assets/images/punch-cards-icon/home-white.png",
      "current_section": "in",
      "next_section": "out"
    },
    // {
    //   "action": "Off today",
    //   "action_type": "out",
    //   "action_image": "../../../assets/images/punch-cards-icon/leave-white.png",
    //   "current_section": "in",
    //   "next_section": "in"
    // },
    {
      "action": "Commuting",
      "action_type": "in",
      "action_image": "../../../assets/images/punch-cards-icon/travel-white.png",
      "current_section": "in",
      "next_section": "out"
    },
    {
      "action": "Out now will connect later",
      "action_type": "out",
      "action_image": "../../../assets/images/punch-cards-icon/cf-white.png",
      "current_section": "out",
      "next_section": "back"
    },
    {
      "action": "Out for personal work",
      "action_type": "out",
      "action_image": "../../../assets/images/punch-cards-icon/pwrk-white.png",
      "current_section": "out",
      "next_section": "back"
    },
    {
      "action": "Out for official work",
      "action_type": "out",
      "action_image": "../../../assets/images/punch-cards-icon/officialwork-white.png",
      "current_section": "out",
      "next_section": "back"
    },
    {
      "action": "Feeling sick will take rest",
      "action_type": "out",
      "action_image": "../../../assets/images/punch-cards-icon/sick-white.png",
      "current_section": "out",
      "next_section": "back"
    },
    {
      "action": "I am out",
      "action_type": "out",
      "action_image": "../../../assets/images/punch-cards-icon/out-sign-white.png",
      "current_section": "out",
      "next_section": "in"
    },
    {
      "action": "Out for break",
      "action_type": "out",
      "action_image": "../../../assets/images/punch-cards-icon/out_for_break.png",
      "current_section": "out",
      "next_section": "back"
    },
    {
      "action": "Out for Lunch",
      "action_type": "out",
      "action_image": "../../../assets/images/punch-cards-icon/out_for_lunch.png",
      "current_section": "out",
      "next_section": "back"
    },
    {
      "action": "Back to work",
      "action_type": "in",
      "action_image": "../../../assets/images/punch-cards-icon/back-work-white.png",
      "current_section": "back",
      "next_section": "out"
    }
  ];
  ngOnDestroy() {
    this.subscriptions.forEach(x => {
      if (!x.closed) {
        x.unsubscribe();
      }
    });
  }
  ngOnInit() {
    this.email = localStorage.getItem("Email")
    this.actiontype = "In";
    this.getCurrentStatus();
    this.getEmpDetailsById(localStorage.getItem('Id'));
    this.hrs = 0
    this.min = 0;
    this.sec = 1;
    this.hrs = this.hrs * 3600;
    this.min = this.min * 60;
    this.sec = this.sec % 60;
    this.totalTime = this.hrs + this.min + this.sec;
    this.getalldatereports();
    this.getworkingDaysOrgDetails();
    setTimeout(() => {
      // this.remainingDayReports();
      this.ActionCard();
      this.getslackDetails();
      this.getWhatsappDetails();
      this.getDayTaskDetails();
      this.getReminderDetails();
    },1000);
  }

  getalldatereports() {
    this.spinner.show();
    // debugger;
    var curr = new Date(); // get current date
    var today = new Date();
    var first = (curr.getDate() - curr.getDay()) + 1; // First day is the day of the month - the day of the week + 1 for start from monday
    const date = new Date(today.setDate(first));
    this.monday = moment(date).format("DD-MM-YYYY") ;

    date.setDate(date.getDate() + 1); //tuesday
    var second = JSON.stringify(date).slice(1, 11);
    this.tuesday = moment(second).format('DD-MM-YYYY');

    date.setDate(date.getDate() + 1); // wednesday
    var third = JSON.stringify(date).slice(1, 11);
    this.wednesday = moment(third).format('DD-MM-YYYY');

    date.setDate(date.getDate() + 1); //thursday
    var fourth = JSON.stringify(date).slice(1, 11);
    this.thursday = moment(fourth).format('DD-MM-YYYY');

    date.setDate(date.getDate() + 1); //friday
    var fifth = JSON.stringify(date).slice(1, 11);
    this.friday = moment(fifth).format('DD-MM-YYYY');

    date.setDate(date.getDate() + 1); //saturday
    var sixth = JSON.stringify(date).slice(1, 11);
    this.saturday = moment(sixth).format('DD-MM-YYYY');
    // *****************get last sunday date of every week**********************

    let last = curr.getDate() - curr.getDay(); //sunday
    let sundayDate = new Date(curr.setDate(last));
    let Sunday_date = moment(sundayDate).format('DD-MM-YYYY');
    this.sunday = Sunday_date;
    // console.log(this.sunday,"....",this.monday,"....",this.tuesday,"...",this.wednesday,"....",this.thursday,"....",this.friday,".....",this.saturday);
    // var last = (curr.getDate() - curr.getDay()) + 0;
    // console.log("last",last);
    // const date2 = new Date(today.setDate(last));
    // console.log(date2);
    // let sunday_date = JSON.stringify(date2);
    // sunday_date = sunday_date.slice(1, 11);

    // let Sunday_date = moment(sunday_date).format("DD-MM-YYYY");
    // console.log(sunday_date);
    // // if the logged date is sunday

    // if (current_date == Sunday_date) {
    //   var first = (curr.getDate() - curr.getDay()) - 6;
    //   const date = new Date(today.setDate(first));
    //   date.setDate(date.getDate() + 1);
    //   var second = JSON.stringify(date).slice(1, 11);
    //   date.setDate(date.getDate() + 1);
    //   var third = JSON.stringify(date).slice(1, 11);
    //   date.setDate(date.getDate() + 1);
    //   var fourth = JSON.stringify(date).slice(1, 11);
    //   date.setDate(date.getDate() + 1);
    //   var fifth = JSON.stringify(date).slice(1, 11);
    //   date.setDate(date.getDate() + 1);
    //   var sixth = JSON.stringify(date).slice(1, 11);

    //   this.monday = this.formatDate(new Date(curr.setDate(first)));
    //   this.tuesday = this.formatDate1(second);
    //   this.wednesday = this.formatDate1(third);
    //   this.thursday = this.formatDate1(fourth);
    //   this.friday = this.formatDate1(fifth);
    //   this.saturday = this.formatDate1(sixth);
    //   this.sunday = Sunday_date;

    // }


    // this.monday = this.formatDate(new Date(curr.setDate(first)));
    // this.tuesday = this.formatDate(new Date(curr.setDate(second)));
    // this.wednesday = this.formatDate(new Date(curr.setDate(third)));
    // this.thursday = this.formatDate(new Date(curr.setDate(fourth)));
    // this.friday = this.formatDate(new Date(curr.setDate(fiveth)));
    // this.monday = this.formatDate(new Date(curr.setDate(first)));
    // this.tuesday = this.formatDate1(second);
    // this.wednesday = this.formatDate1(third);
    // this.thursday = this.formatDate1(fourth);
    // this.friday = this.formatDate1(fifth);
    // this.saturday = this.formatDate1(sixth);
    // console.log("saterday...",this.saturday);
    // this.sunday = Sunday_date;
    // console.log(this.workingDays.length);
    //   for(let i=0;i<this.workingDays.length;i++){
    //     console.log(this.workingDays[i].id);
    //     if(this.workingDays[i].id == 1){
    //   this.getdatereport(this.monday, 1);
    //     } else if(this.workingDays[i].id == 2){
    //   this.getdatereport(this.tuesday, 2);
    //     } else if(this.workingDays[i].id == 3){
    //   this.getdatereport(this.wednesday, 3);
    //     } else if(this.workingDays[i].id == 4){
    //   this.getdatereport(this.thursday, 4);
    //     } else if(this.workingDays[i].id == 5){
    //   this.getdatereport(this.friday, 5);
    //   } else if(this.workingDays[i].id == 6){
    //     this.getdatereport(this.saturday, 6);
    //   } else if(this.workingDays[i].id == 0){
    //   this.getdatereport(this.sunday, 7);
    //   }
    // }
    // ---------------------Getting report for saturday sunday user worked--------------------------------
    // if (this.saturday == current_date || this.sunday == current_date) {
    //   if (this.saturday == current_date) {
    //     this.getdatereport(this.saturday, 6);
    //     this.Dynamic_card = true;
    //     this.Dynamic_card_saturday = true;
    //   }
    //   else {
    //     this.getdatereport(this.saturday, 6);
    //     this.getdatereport(this.sunday, 7);
    //     this.Dynamic_card = true;
    //     this.Dynamic_card_sunday = true;
    //   }

    // }
    // else if (this.sunday == current_date) {
    //   this.getdatereport(this.sunday, 7);
    // }
  }
  //** formate date   */
  // formatDate1(input) {
  //   var arrDate = input.split("-");
  //   return arrDate[2] + "-" + arrDate[1] + "-" + arrDate[0];
  // }
  // formatDate(d) {
  //   var month = '' + (d.getMonth() + 1);
  //   var day = '' + d.getDate();
  //   var year = d.getFullYear();

  //   if (month.length < 2)
  //     month = '0' + month;
  //   if (day.length < 2)
  //     day = '0' + day;

  //   return [day, month, year].join('-');
  // }

  async getworkingDaysOrgDetails() {
    this.spinner.show();
    this.remainingDays = [];
    await this.manageOrg.getOrgDetailsById(localStorage.getItem("OrgId")).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        let response = JSON.parse(data.map.data);
        this.workingDays = JSON.parse(response.working_days);
        // console.log(this.workingDays);
        let defaultDay =[1,2,3,4,5,6,7];
        let workingDayData = [];
        for (let i = 0; i < this.workingDays.length; i++) {
          // console.log(this.workingDays[i].id);
          let dayValue;
          if (this.workingDays[i].id == 1) {
            dayValue = 1; 
            this.getdatereport(this.monday, 1);
          } else if (this.workingDays[i].id == 2) {
            dayValue = 2;
            this.getdatereport(this.tuesday, 2);
          } else if (this.workingDays[i].id == 3) {
            dayValue = 3;
            this.getdatereport(this.wednesday, 3);
          } else if (this.workingDays[i].id == 4) {
            dayValue = 4;
            this.getdatereport(this.thursday, 4);
          } else if (this.workingDays[i].id == 5) {
            dayValue = 5;
            this.getdatereport(this.friday, 5);
          } else if (this.workingDays[i].id == 6) {
            dayValue = 6;
            this.getdatereport(this.saturday, 6);
          } else if (this.workingDays[i].id == 0) {
            dayValue = 7;
            this.getdatereport(this.sunday, 7);
          }
          workingDayData.push(dayValue); 
        }
        defaultDay = defaultDay.filter(val => !workingDayData.includes(val));
        this.remainingDays = defaultDay;
        // console.log(this.remainingDays);
        if(this.remainingDays.length > 0){
          // debugger;
          this.remainingDayReports(this.remainingDays);
        }
      }
    })
  }

    remainingDayReports(remainingDays:number[]){
      // debugger;
      this.spinner.show();
      let remainDaysData:any[] = remainingDays;
      for (let j = 0; j < remainDaysData.length ; j++) {
        if (remainDaysData[j] == 1) {
          this.remaindaysreport(this.monday, 1);
        } else if (remainDaysData[j] == 2) {
          this.remaindaysreport(this.tuesday, 2);
        } else if (remainDaysData[j] == 3) {
          this.remaindaysreport(this.wednesday, 3);
        } else if (remainDaysData[j] == 4) {
          this.remaindaysreport(this.thursday, 4);
        } else if (remainDaysData[j] == 5) {
          this.remaindaysreport(this.friday, 5);
        } else if (remainDaysData[j] == 6) {
          this.remaindaysreport(this.saturday, 6);
        } else if (remainDaysData[j] == 7) {
          this.remaindaysreport(this.sunday, 7);
        }
      } 
  }

  async remaindaysreport(date,day){
    this.spinner.show();
    let subscription = await this.attendanceService.getactiondatereportdata(date, this.email).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        var details = (data.map);
        if (day == 1) {
          this.mondaydata = details;
        }
        else if (day == 2) {
          this.tuesdaydata = details;
        }
        else if (day == 3) {
          this.wednesdaydata = details;
        }
        else if (day == 4) {
          this.thursdaydata = details;
        }
        else if (day == 5) {
          this.fridaydata = details;
        }
        else if (day == 6) {
          this.saturdaydata = details;
        }
        else if (day == 7) {
          this.sundaydata = details;
        }
      } else {
        if (day == 1) {
          this.mondaydata = null;
        }
        else if (day == 2) {
          this.tuesdaydata = null;
        }
        else if (day == 3) {
          this.wednesdaydata = null;
        }
        else if (day == 4) {
          this.thursdaydata = null;
        }
        else if (day == 5) {
          this.fridaydata = null;
        }
        else if (day == 6) {
          this.saturdaydata = null;
        }
        else if (day == 7) {
          this.sundaydata = null;
        }
      }
  })
}

  async getdatereport(date, day) {
    this.spinner.show();
    let subscription = await this.attendanceService.getactiondatereportdata(date, this.email).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        var details = (data.map);
        if (day == 1) {
          this.mondaydata = details;
        }
        else if (day == 2) {
          this.tuesdaydata = details;
        }
        else if (day == 3) {
          this.wednesdaydata = details;
        }
        else if (day == 4) {
          this.thursdaydata = details;
        }
        else if (day == 5) {
          this.fridaydata = details;
        }
        else if (day == 6) {
          this.saturdaydata = details;
        }
        else if (day == 7) {
          this.sundaydata = details;
        }
      }
      else {
        if (day == 1) {
          this.mondaydata = "no data";
        }
        else if (day == 2) {
          this.tuesdaydata = "no data";
        }
        else if (day == 3) {
          this.wednesdaydata = "no data";
        }
        else if (day == 4) {
          this.thursdaydata = "no data";
        }
        else if (day == 5) {
          this.fridaydata = "no data";
        }
        else if (day == 6) {
          this.saturdaydata = "no data";
        }
        else if (day == 7) {
          this.sundaydata = "no data";
        }
      }
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
    })
    this.subscriptions.push(subscription);


    // this.attendanceService.getdatereportdata(date, this.email).subscribe(data => {
    //   if (data.map.statusMessage == "Success") {
    //     var details = JSON.parse((data.map.data));
    //     if(day==1){
    //       this.mondaydata = details;
    //     }
    //     else if(day==2){
    //       this.tuesdaydata = details;
    //     }
    //     else if(day==3){
    //       this.wednesdaydata = details;
    //     }
    //     else if(day==4){
    //       this.thursdaydata = details;
    //     }
    //     else if(day==5){
    //       this.fridaydata = details;
    //     }
    //   }
    //   else {
    //     if(day==1){
    //       this.mondaydata = "no data";
    //     }
    //     else if(day==2){
    //       this.tuesdaydata = "no data";
    //     }
    //     else if(day==3){
    //       this.wednesdaydata = "no data";
    //     }
    //     else if(day==4){
    //       this.thursdaydata = "no data";
    //     }
    //     else if(day==5){
    //       this.fridaydata = "no data";
    //     }
    //   }
    // })
  }


  //****************************************************Attendance Action post method integration********************************************//
  DoAction(action) {
    const DATE_TIME_FORMAT = 'YYYY-MM-DDTHH:mm';
    let _now: any;
    _now = moment(new Date(), DATE_TIME_FORMAT);
    let zone = moment.tz.guess();
    let formdata = {
      "email": this.email,
      "org_id": +localStorage.getItem("OrgId"),
      "action": action.action,
      "actionType": action.action_type,
      "timezone": zone,
      "next_action_section": action.next_section
    }
    let subscription = this.attendanceService.createAttendanceDetails(formdata).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        // ? ************************** Post attendance message in slack integration ************************ //
        if (this.slackIntegrationDetails.is_paused == false && this.isNotify === "Yes") {
          this.attendanceService.attendanceSendToSlack(this.slackIntegrationDetails.url, data.map.data, localStorage.getItem("Name")).subscribe();
        }

        // ? ************************** Post attendance message in Whatsapp integration ************************ //
        if (this.whatsappIntegrationDetails.is_paused == false) {
          // let templateData = this.attendanceService.sendWhatsAppTemplate(data.map.data, this.profilename, this.whatsappIntegrationDetails.country_code_1+this.whatsappIntegrationDetails.mobile_number_1)
          // this.attendanceService.sendToWhatsApp(this.whatsappIntegrationDetails.url, this.whatsappIntegrationDetails.whatsapp_access_token, JSON.stringify(templateData)).subscribe();
          // if (this.whatsappIntegrationDetails.mobile_number_2 != undefined) {
          //   let templateData = this.attendanceService.sendWhatsAppTemplate(data.map.data, this.profilename, this.whatsappIntegrationDetails.country_code_2+this.whatsappIntegrationDetails.mobile_number_2)
          //   this.attendanceService.sendToWhatsApp(this.whatsappIntegrationDetails.url, this.whatsappIntegrationDetails.whatsapp_access_token, JSON.stringify(templateData)).subscribe();
          // }
          let tempData = JSON.parse(this.whatsappIntegrationDetails.numbers);
          for (let i = 0; i < tempData.length; i++) {
            let templateData = this.attendanceService.sendWhatsAppTemplate(data.map.data, this.profilename, tempData[i].code + tempData[i].number)
            this.attendanceService.sendToWhatsApp(this.whatsappIntegrationDetails.url, this.whatsappIntegrationDetails.whatsapp_access_token, JSON.stringify(templateData)).subscribe();
          }
        }
        this.getCurrentStatus();
        this.getalldatereports();
        // this.getworkingDaysOrgDetails();
        //for call the reminder dialog for submit the day planner tasks
        if (this.reminderDialogAccess) {
          if (this.planForTheDay) {
            if (action.action.toLowerCase() == 'i am in from office' || action.action.toLowerCase() == 'i am in from home'
              || action.action.toLowerCase() == 'i am in' || action.action.toLowerCase() == 'i\'m in' || action.action.toLowerCase() == 'in') {
              if (this.attendanceReminderDetails != null) {
                if (this.attendanceReminderDetails.is_active == true) {
                  let isActive = false;
                  if (this.submitReminderDetails != null) {
                    if (this.submitReminderDetails.is_active == true) {
                      if (this.submitReminderDetails.reminder_type == 'Once') {
                        if (moment().toDate() < moment(this.submitReminderDetails.reminder_date).toDate()) {
                          isActive = true;
                        }
                      } else if (this.submitReminderDetails.reminder_type == 'Daily') {
                        let date = moment().format('YYYY-MM-DD') + " " + this.submitReminderDetails.reminder_time_str;
                        if (moment().toDate() < moment(date).toDate()) {
                          isActive = true;
                        }
                      }
                    }
                  }
                  const dialogRef = this.dialog.open(DpCommonDialogComponent, { width: '30%', panelClass: 'custom-viewdialogstyle', data: { component: 'Day Planner Tasks', key: 'attendanceSubmit', key2: isActive } });
                  dialogRef.afterClosed().subscribe(result => {
                    if (result.data == true) {
                      this.updateEmpDetails('attendanceSubmit');
                    }
                  });
                }
              }
            }
            //for call the reminder dialog for update the day planner tasks
          }

          if (this.updatesForTheDay) {
            if (action.action.toLowerCase() == 'i am out' || action.action.toLowerCase() == 'i\'m out' || action.action.toLowerCase() == 'out') {
              if (this.attendanceReminderDetails != null) {
                if (this.attendanceReminderDetails.is_active == true) {
                  let isActive = false;
                  if (this.updateReminderDetails != null) {
                    if (this.updateReminderDetails.is_active == true) {
                      if (this.updateReminderDetails.reminder_type == 'Once') {
                        if (moment().toDate() < moment(this.updateReminderDetails.reminder_date).toDate()) {
                          isActive = true;
                        }
                      } else if (this.updateReminderDetails.reminder_type == 'Daily') {
                        let date = moment().format('YYYY-MM-DD') + " " + this.updateReminderDetails.reminder_time_str;
                        if (moment().toDate() < moment(date).toDate()) {
                          isActive = true;
                        }
                      }
                    }
                  }
                  const dialogRef = this.dialog.open(DpCommonDialogComponent, { width: '30%', panelClass: 'custom-viewdialogstyle', data: { component: 'Day Planner Tasks', key: 'attendanceUpdate', key2: isActive } });
                  dialogRef.afterClosed().subscribe(result => {
                    if (result.data == true) {
                      this.updateEmpDetails('attendanceUpdate');
                    }
                  });
                }
              }
            }
          }
        }
      }
      else {
      }
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
    })
    this.subscriptions.push(subscription);
  }
  //************** */ update the emp details in reminder details ************************//
  reminderEmpList: any = [];
  updateEmpDetails(keyData) {
    if (keyData == 'attendanceSubmit') {
      if (this.submitReminderDetails != null) {
        if (this.submitReminderDetails.key_secondary) {
          this.reminderEmpList = JSON.parse(this.submitReminderDetails.key_secondary);
        }
      }
      if (!(this.reminderEmpList.find(emp => emp == localStorage.getItem("Id")))) {
        this.reminderEmpList.push(localStorage.getItem("Id"));
        let data: Object = {
          "id": this.submitReminderDetails.id,
          "emps_arr": JSON.stringify(this.reminderEmpList)
        }
        this.reminderDetailsService.updateReminderEmpDetails(data).subscribe(details => {
          if (details.map.statusMessage == "Success") {
            this.utilsService.openSnackBarAC("Reminder updated successfully", "OK");
          } else {
            this.utilsService.openSnackBarMC("Failed to update reminder", "OK");
          }
        })
      } else {
        this.utilsService.openSnackBarAC("Reminder updated successfully", "OK");
      }
    } else if (keyData == 'attendanceUpdate') {
      if (this.updateReminderDetails != null) {
        if (this.updateReminderDetails.key_secondary) {
          this.reminderEmpList = JSON.parse(this.updateReminderDetails.key_secondary);
        }
      }
      if (!(this.reminderEmpList.find(emp => emp == localStorage.getItem("Id")))) {
        this.reminderEmpList.push(localStorage.getItem("Id"));
        let data: Object = {
          "id": this.updateReminderDetails.id,
          "emps_arr": JSON.stringify(this.reminderEmpList)
        }
        this.reminderDetailsService.updateReminderEmpDetails(data).subscribe(details => {
          if (details.map.statusMessage == "Success") {
            this.utilsService.openSnackBarAC("Reminder updated successfully", "OK");
          } else {
            this.utilsService.openSnackBarMC("Failed to update reminder", "OK");
          }
        });
      } else {
        this.utilsService.openSnackBarAC("Reminder updated successfully", "OK");
      }
    }

  }

  // get the current day task details
  getDayTaskDetails() {
    this.spinner.show();
    let data = {
      "org_id": localStorage.getItem("OrgId"),
      "emp_id": localStorage.getItem("Id"),
      "date": moment().format("YYYY-MM-DD"),
    }
    let subscription = this.dayPlannerService.getDayTaskDetailsByEmpIdAndOrgIdAndDate(data).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        let response = JSON.parse(data.map.data);
        this.planForTheDay = !(response.find(dayTask => dayTask.is_submitted == true));
        this.updatesForTheDay = !(response.find(dayTask => dayTask.is_updated == true));
      }
      this.spinner.hide();
    });
    this.subscriptions.push(subscription);
  }

  //****************Get current Status of user****************//
  getCurrentStatus() {
    this.spinner.show();
    let subscription = this.attendanceService.getCurrentstatusattendance(this.email).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        // var details = JSON.parse((data.map.data));
        var details = (data.map.data);
        this.lastaction = details;
        this.activeHours = details.activeHours;
        this.currentActivetime = details.activeHours / 1000;
        this.nextaction = details.next_section;
        this.activetime = true;
        this.Activetime = this.currentActivetime;
        this.totalTime = this.Activetime;
        if (details.actionType === "in") {
          this.actiontype = "Out";
          // this.basicTimer.startTime=this.currentActivetime;
          this.timerClock();
        }
        else {
          this.actiontype = "In";
          this.stopBtnClicked();
        }
        this.spinner.hide();
      }
      else {
        this.spinner.hide();
      }
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
    })
    this.subscriptions.push(subscription);
    // setTimeout(() => {
    //   /** spinner ends after 3 seconds */
    //   this.spinner.hide();
    // }, 3000);
  }



  stopBtnClicked() {
    if (this.clockTimer != "00 Hrs : 00 Min :00 Sec") {
      this.subscribe.unsubscribe();
    }
    let minutes, seconds, hours, formatedMinutes, formatedSeconds, formatedHours;
    hours = Math.floor(this.totalTime / 3600) % 24;
    minutes = Math.floor(this.totalTime / 60) % 60;
    seconds = Math.floor((this.totalTime % 60));
    formatedHours = hours > 9 ? hours : '0' + hours;
    formatedMinutes = minutes > 9 ? minutes : '0' + minutes;
    formatedSeconds = seconds > 9 ? seconds : '0' + seconds;

    this.clockTimer = `${formatedHours} Hrs : ${formatedMinutes} Min : ${formatedSeconds} Sec`;
  }

  timerClock() {
    let minutes, seconds, hours, formatedMinutes, formatedSeconds, formatedHours;
    let nTime = this.totalTime;
    const source = timer(1, 1000);
    this.subscribe = source.subscribe((val) => {
      hours = Math.floor(this.totalTime / 3600) % 24;
      minutes = Math.floor(this.totalTime / 60) % 60;
      seconds = Math.floor((this.totalTime % 60));
      formatedHours = hours > 9 ? hours : '0' + hours;
      formatedMinutes = minutes > 9 ? minutes : '0' + minutes;
      formatedSeconds = seconds > 9 ? seconds : '0' + seconds;
      this.totalTime = nTime + val;

      this.clockTimer = `${formatedHours} Hrs : ${formatedMinutes} Min : ${formatedSeconds} Sec`;
    });
  }
  
  // doActionBasicTimer(action: String) {
  //   switch (action) {
  //     case 'start':
  //       this.basicTimer.start();
  //       break;
  //     case 'resume':
  //       this.basicTimer.resume();
  //       break;
  //     case 'reset':
  //       this.basicTimer.reset();
  //       break;
  //     default:
  //       this.basicTimer.stop();
  //       break;
  //   }
  // }

  //***********************************************Org action card************************************************* *//
  ActionCard() {
    this.spinner.show();
    let subscription = this.manageattendanceService.getAllActionCardByOrgId(localStorage.getItem("OrgId")).subscribe(async data => {

      if (data.map.statusMessage == "Success") {
        // let response: any[] = JSON.parse(data.map.data);
        let response: any[] = data.map.data.myArrayList;
        if (response.length == 0) {
          if (localStorage.getItem("settingAccess") === "true") {
            const dialogRef = this.dialog.open(NoactionComponent, { width: '50%', panelClass: 'custom-viewdialogstyle', });
            dialogRef.afterClosed().subscribe(result => {
              if (result == true) {
                this.ActionCard();
              }

            });
          }
          // for(let i =0; i < this.actioncards.length; i++){
          //   var formData = new FormData();
          //   formData.append('org_id', localStorage.getItem("OrgId"));
          //   formData.append('action', this.actioncards[i].action);
          //   formData.append('action_type', this.actioncards[i].action_type);
          //   formData.append('current_section', this.actioncards[i].current_section);
          //   formData.append('next_section', this.actioncards[i].next_section);
          //   // `await` can only be used in an async body, but showing it here for simplicity.
          //   var file = await this.getFileFromUrl(this.actioncards[i].action_image, 'image.jpg');
          //   formData.append('action_img', file , file.name);
          //   this.manageattendanceService.createActionCard(formData).subscribe(res => {
          //   })

          // }
        }
        else {
          // let response: any[] = JSON.parse(data.map.data);          
          for (var i = 0; i < response.length; i++) {
            let stringArray = new Uint8Array(response[i].map.action_image.myArrayList);
            const STRING_CHAR = stringArray.reduce((data, byte) => {
              return data + String.fromCharCode(byte);
            }, '');
            let base64String = btoa(STRING_CHAR);
            response[i].map.action_image = this.domSanitizer.bypassSecurityTrustUrl("data:image/jpeg;base64," + base64String);

          }
          this.orgAttendanceCards = response;
        }

        this.spinner.hide();
      }
      else {
        this.spinner.hide();
      }

    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
    })
    this.subscriptions.push(subscription);
  }

  ///****************** URL to file function***************///
  async getFileFromUrl(url, name, defaultType = 'image/jpeg') {
    const response = await fetch(url);
    const data = await response.blob();
    return new File([data], name, {
      type: data.type || defaultType,
    });
  }

  openDialog(type: string) {
    let screenWidth = screen.availWidth;
    if (screenWidth <= 750) {
      const dialogRef = this.dialog.open(ActionComponent, { width: '90%', panelClass: 'custom-viewdialogstyle', data: { actiontype: type, action: this.lastaction, actioncards: this.orgAttendanceCards, actionsection: this.nextaction }, });
      dialogRef.afterClosed().subscribe(result => {
        this.ActionCard();
        if (result != undefined) {
          let data = result.data;
          let type = result.type;
          // this.DoAction(data, type);
          this.DoAction(data);
        }
      });
    } else {
      const dialogRef = this.dialog.open(ActionComponent, { width: '50%', panelClass: 'custom-viewdialogstyle', data: { actiontype: type, action: this.lastaction, actioncards: this.orgAttendanceCards, actionsection: this.nextaction }, });
      dialogRef.afterClosed().subscribe(result => {
        this.ActionCard();
        if (result != undefined) {
          let data = result.data;
          let type = result.type;
          // this.DoAction(data, type);
          this.DoAction(data);
        }
      });
    }
    // const dialogRef = this.dialog.open(ActionComponent, { data: { actiontype: type, action: this.lastaction, activeHours: this.activeHours }, });

  }

  // ? ************************** get slack details ************************ //
  getslackDetails() {
    this.spinner.show();
    let data: Object = {
      "org_id": localStorage.getItem("OrgId"),
      "module_name": "attendance",
      "reason": "check-in",
      "app_name": "slack"
    }
    let subscription = this.attendanceService.getslackDetails(data).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        // let response = JSON.parse(data.map.data);
        let response = data.map.data;
        this.slackIntegrationDetails = response;
      } else if (data.map.statusMessage == "Error") {
      }
      this.spinner.hide();
      this.getSlackConfig();
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
    })
    this.subscriptions.push(subscription);
  }
  getSlackConfig() {
    this.spinner.show();
    let OrgId = localStorage.getItem("OrgId");
    let data: Object = {
      org_id: OrgId,
      app: "slack",
      module: "all",
    };
    let subscription = this.manageIntegrationService.getIntegrationAccessData(data).subscribe(
      (data) => {
        if (data.map.statusMessage == "Success") {
          let out = data.map.data;
          if (out.isActive == true) {
            this.isNotify = "Yes";
          } else {
            this.isNotify = "No";
          }
        } else {
          this.isNotify = "No";
        }
        this.spinner.hide();
      },
      (error) => {
        this.router.navigate(["/404"]);
        this.spinner.hide();
      }
    );
    this.subscriptions.push(subscription);
  }


  // ? ************************** get employee information ************************************************//
  getEmpDetailsById(id) {
    let subscription = this.settingsService.getActiveEmpDetailsById(id).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        let response = JSON.parse(data.map.data);
        if (response?.manageShiftDetails) {
          this.shiftName = response?.manageShiftDetails.shift;
          let st_time = new Date(moment().format("YYYY-MM-DD") + " " + response?.manageShiftDetails.start_time);
          let ed_time = new Date(moment().format("YYYY-MM-DD") + " " + response?.manageShiftDetails.end_time);
          this.shiftTiming = "[ " + moment(st_time).format("HH:mm A") + " - " + moment(ed_time).format("hh:mm A") + " ]";
        }
        if (JSON.parse(response.roleDetails.access_to).find(access => access == 'day-planner')) {
          this.reminderDialogAccess = true;
        } else this.reminderDialogAccess = false;
        this.profilename = response.firstname + " " + response.lastname;
        if (response.profile_image != undefined) {
          let stringArray = new Uint8Array(response.profile_image);
          const STRING_CHAR = stringArray.reduce((data, byte) => {
            return data + String.fromCharCode(byte);
          }, '');
          let base64String = btoa(STRING_CHAR);
          // this.profileurl = this.domSanitizer.bypassSecurityTrustUrl("data:image/jpeg;base64," + base64String);
          // this.profileurl =  base64String;
          this.profileurl = "https://uat.tcube.io/assets/images/user_person.png";

        } else {
          this.profileurl = "https://uat.tcube.io/assets/images/user_person.png";
        }
      }
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
    })
    this.subscriptions.push(subscription);
  }

  //get Whatsapp details
  getWhatsappDetails() {
    this.spinner.show();
    let data: Object = {
      "org_id": localStorage.getItem("OrgId"),
      "module_name": "attendance",
      "reason": "check-in",
      "app_name": "whatsapp"
    }
    let subscription = this.attendanceService.getslackDetails(data).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        // let response = JSON.parse(data.map.data);
        let response = data.map.data;
        this.whatsappIntegrationDetails = response;
      } else if (data.map.statusMessage == "Error") {
      }
      this.spinner.hide();
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
    })
    this.subscriptions.push(subscription);
  }

  //get reminder details
  getReminderDetails() {
    this.spinner.show();
    let data: Object = {
      "org_id": localStorage.getItem("OrgId"),
      "module_name": "day-planner"
    }
    let subscription = this.reminderDetailsService.getReminderByOrgIdAndModule(data).subscribe(data => {
      // console.log(data);
      if (data.map.statusMessage == "Success") {
        let response = JSON.parse(data.map.data);
        this.submitReminderDetails = response.find(r => r.key_primary == 'submit-tasks');
        this.updateReminderDetails = response.find(r => r.key_primary == 'update-tasks');
        this.attendanceReminderDetails = response.find(r => r.key_primary == 'attendance');
        if (this.attendanceReminderDetails != null) {
          // console.log(this.attendanceReminderDetails);
        }
      } else if (data.map.statusMessage == "Error") {
      }
      this.spinner.hide();
    })
    this.subscriptions.push(subscription);
  }

  // getAttendanceUserList(){
  //   this.attendanceService.getAttendanceUserlist().subscribe(data =>{
  //     console.log(data);
  //     if(data.map.statusMessage == "Success"){
  //       let response = data.map.data;
  //       console.log(response);
  //     }
  //   })
  // }

}
