import { Component, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
// import moment from 'moment-timezone';
import moment from 'moment';
import { NgxSpinnerService } from 'ngx-spinner';
import { NotificationService } from 'src/app/services/notification.service';
import { SettingsService } from 'src/app/services/settings.service';

@Component({
  selector: 'app-mobile-notification',
  templateUrl: './mobile-notification.component.html',
  styleUrls: ['./mobile-notification.component.less']
})
export class MobileNotificationComponent implements OnInit {
  activeemploader: boolean = false;
  unread_msg: number;
  Emp_id: any;
  twoOrTwenty: boolean = false;
  isErrorNotification: boolean = false;
  refreshClicked: boolean = false;
  // topBtn:boolean = false;

  constructor(private router: Router,
    private notificationService: NotificationService, private spinner: NgxSpinnerService,
    private domSanitizer: DomSanitizer) { }

  ngOnInit() {
    this.Emp_id = localStorage.getItem("Id");
    // this.getNotification();
    this.getNotificationByEmpidAndDate();
    this.getunreadConts();
    // window.addEventListener('scroll', this.scrollEvent, true);

    //! check screen size for every second
    setInterval(() => { this.screenCheck() }, 1000);
  }
  //get notification by emp_id
  notification_data: any = [];
  image_url: any;

  // getNotification() {
  //   this.spinner.show();
  //   this.notificationService.getByTonotifyid(this.Emp_id).subscribe(data => {
  //     this.activeemploader = true;
  //     if (data.map.statusMessage == "Success") {
  //       let response: any[] = JSON.parse(data.map.data);
  //       for (var i = 0; i < response.length; i++) {
  //         if (response[i].to_notifier_prfl_img != undefined) {
  //           let stringArray = new Uint8Array(response[i].to_notifier_prfl_img);
  //           const STRING_CHAR = stringArray.reduce((data, byte) => {
  //             return data + String.fromCharCode(byte);
  //           }, '');
  //           let base64String = btoa(STRING_CHAR);
  //           this.image_url = this.domSanitizer.bypassSecurityTrustUrl("data:image/jpeg;base64," + base64String);
  //           response[i].to_notifier_prfl_img = this.image_url;
  //         }
  //         else {
  //           response[i].to_notifier_prfl_img = "assets/images/profile.png";
  //         }
  //       }
  //       this.notification_data = response.reverse();
  //     }
  //     this.activeemploader = false;
  //     setTimeout(() =>{
  //       this.spinner.hide();
  //     },100)
  //   })
  // }

  notifyInterval: any;
  notifyInterval2: any;
  getunreadConts() {
    if (document.hidden) {
      clearInterval(this.notifyInterval);
      clearInterval(this.notifyInterval2);
    } else {
      clearInterval(this.notifyInterval);
      clearInterval(this.notifyInterval2);
      this.notifyInterval = setInterval(() => {
        this.notificationService.getUnreadCountByTonotifyid(localStorage.getItem("Id")).subscribe(data => {
          if (data.map.statusMessage == "Success") {
            let response: number = JSON.parse(data.map.data);
            if (this.unread_msg != response) {
              this.getNotificationByEmpidAndDate();
              this.unread_msg = response;
            } else {
              this.unread_msg = response;
            }
          }
        }, (error) => {
          clearInterval(this.notifyInterval);
          clearInterval(this.notifyInterval2);
        })
      }, 10000);
    }
  }

  getBadgeCounts() {
    clearInterval(this.notifyInterval);
    clearInterval(this.notifyInterval2);
    this.notifyInterval2 = setInterval(() => {
      this.notificationService.getUnreadCountByTonotifyid(localStorage.getItem("Id")).subscribe(data => {
        if (data.map.statusMessage == "Success") {
          let response: number = JSON.parse(data.map.data);
          if (this.unread_msg != response) {
            this.getNotificationByEmpidAndDate();
            this.unread_msg = response;
          } else {
            this.unread_msg = response;
          }
        }
      }, (error) => {
        clearInterval(this.notifyInterval);
        clearInterval(this.notifyInterval2);
      })
    }, 10000);
  }

  //mark_as_read function
  markasread(id) {
    this.unread_msg = this.unread_msg - 1;
    for (var i = 0; i < this.notification_data.length; i++) {
      if (this.notification_data[i].id == id) {
        this.notification_data[i].is_read = true;
      }
    }
    let formdata = {
      "Ids": [id]
    }
    this.notificationService.updateMarkAsRead(formdata).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        // this.getNotification();
      }
    })
  }

  //mark all as read functionality
  markAllasread() {
    this.unread_msg = 0;
    let formdata;
    let ids = [];
    for (var i = 0; i < this.notification_data.length; i++) {
      if (this.notification_data[i].is_read == false) {
        ids.push(this.notification_data[i].id);
      }
    }
    for (var i = 0; i < this.notification_data.length; i++) {
      this.notification_data[i].is_read = true;
    }
    formdata = {
      "Ids": ids
    }
    this.notificationService.updateMarkAsRead(formdata).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        // this.getNotification();
      }
    })
  }
  redirecttomodule(data) {
    // console.log(data);
    if (data.sub_module_name == "My-Approvals") {
      localStorage.setItem("dateOfRequest", data.date_of_request);

      if (data.approval_status == "Submitted") {
        localStorage.setItem("tSheetStatus", "Pending");
      } else localStorage.setItem("tSheetStatus", data.approval_status);

      localStorage.setItem("tSheetId", data.timesheet_id);
      localStorage.setItem("requestedDate", moment(new Date(data.date_of_request)).format('MM-DD-YYYY'));
      if (data.approval_status != "Submitted") {
        if (!data.approval_comments) {
          localStorage.setItem("tSheetComments", " ");
        } else localStorage.setItem("tSheetComments", data.approval_comments);

      }
      window.open('/#/approve-logs/' + encodeURIComponent(data.notifier), '_blank');
      // this.router.navigate([]).then(result => {  window.open('/#/approve-logs/' + encodeURIComponent(data.notifier), '_blank'); });
      // this.router.navigate(['approvals']);
    }
    if (data.sub_module_name == "My-Timesheets") {
      this.router.navigate(['timesheets']);
    }
    if (data.sub_module_name == "Requests") {
      localStorage.setItem("customTab", "1");
      // this.router.navigate(['leave-tracker']);
      window.open('/#/leave-tracker', '_blank');

    } else if (data.sub_module_name == "My-Leaves") {
      localStorage.setItem("customTab", "0");
      this.router.navigate(['leave-tracker']);
    }
  }

  tempData: Object;
  getNotificationByEmpidAndDate() {
    if (this.twoOrTwenty == false) {
      this.tempData = {
        "org_id": localStorage.getItem("OrgId"),
        "to_notify_id": localStorage.getItem("Id"),
        "created_time": moment().subtract(2, "days").startOf("day").toDate(),
        "modified_time": moment().toDate(),
      }
    } else if (this.twoOrTwenty == true) {
      this.tempData = {
        "org_id": localStorage.getItem("OrgId"),
        "to_notify_id": localStorage.getItem("Id"),
        "created_time": moment().subtract(30, "days").startOf("day").toDate(),
        "modified_time": moment().toDate(),
      }
    }
    // console.log(data);
    this.refreshClicked = true;
    this.notificationService.getNotificationsByEmpidAndDate(this.tempData).subscribe(data => {
      // console.log(data);
      this.activeemploader = true;
      if (data.map.statusMessage == "Success") {
        this.isErrorNotification = false;
        let response: any[] = JSON.parse(data.map.data);
        // console.log(response);
        for (var i = 0; i < response.length; i++) {
          if (response[i].to_notifier_prfl_img != undefined) {
            let stringArray = new Uint8Array(response[i].to_notifier_prfl_img);
            const STRING_CHAR = stringArray.reduce((data, byte) => {
              return data + String.fromCharCode(byte);
            }, '');
            let base64String = btoa(STRING_CHAR);
            this.image_url = this.domSanitizer.bypassSecurityTrustUrl("data:image/jpeg;base64," + base64String);
            response[i].to_notifier_prfl_img = this.image_url;
          }
          else {
            response[i].to_notifier_prfl_img = "assets/images/user_person.png";
          }
        }
        this.notification_data = response.reverse();
      }
      this.activeemploader = false;
      this.refreshClicked = false;
    }, (error) => {
      // this.router.navigate(["/404"]);
      // console.log("Error in getting notigications \"Counts \"");
      this.isErrorNotification = true;
      this.refreshClicked = false;
      clearInterval(this.notifyInterval);
      clearInterval(this.notifyInterval2);
    })
  }

  loadMore() {
    // console.log("twoOrTwenty = true");
    this.twoOrTwenty = true;
    // document.getElementById("topNot").scrollIntoView();
    // this.notification_data =[];
    this.getNotificationByEmpidAndDate();
  }
  cancelMore() {
    // console.log("twoOrTwenty = false");
    this.twoOrTwenty = false;
    this.getNotificationByEmpidAndDate();
  }

  //Screen size check for not to show in big screen
  screenCheck() {
    let screenWidth = screen.availWidth;
    if (screenWidth > 960) {
      this.router.navigate(["/dashboard"]);
    }
  }

  // in notification toglllr --> while srcolling to enable the 'go to top' button
  //  scrollEvent = (event: any): void => {
  //   // const number = event.srcElement.scrollTop;
  //   const currentScroll = event.target.scrollTop;
  //   const totalHeight = event.target.scrollHeight;
  //   let check = totalHeight/2;
  //   if(currentScroll >= check){
  //     this.topBtn = true;
  //   }else{
  //     this.topBtn = false;
  //   }
  //   // console.log('scrollHeight --> Test --> ' +event.target.scrollHeight);
  //   // console.log('scrollHeight --> documentElement --> ' + document.documentElement.scrollHeight);
  //   // console.log('scrollHeight --> body -- > ' + document.body.scrollHeight);
  //   // console.log('clientHeight --> documentElement --> ' + document.documentElement.clientHeight);
  //   // console.log('clientHeight --> body -- > ' + document.body.clientHeight);
  // }

}
