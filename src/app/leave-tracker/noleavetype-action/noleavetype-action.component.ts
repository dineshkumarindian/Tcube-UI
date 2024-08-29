import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import moment from 'moment-timezone';
import { NgxSpinnerService } from 'ngx-spinner';
import { UtilService } from 'src/app/services/util.service';
import { SettingsService } from '../../services/settings.service';

@Component({
  selector: 'app-noleavetype-action',
  templateUrl: './noleavetype-action.component.html',
  styleUrls: ['./noleavetype-action.component.less']
})
export class NoleavetypeActionComponent implements OnInit {


  // startOfYear: any = moment().startOf('year').toDate();
  // endOfYear: any = moment().endOf('year').toDate();
  // leaveTypeYear: any = moment().year();
  startOfYear: any = this.data.st_date;
  endOfYear: any = this.data.ed_date;
  leaveTypeYear: any = moment(this.data.st_date).year();
  zone = moment.tz.guess();

  leaveTypeData: any[] = [
    {
      "leave_type": "Casual leave",
      "start_date": this.startOfYear,
      "end_date": this.endOfYear,
      "year": this.leaveTypeYear,
      "available_days": 10,
      "image_name": "casual.jpg",
      "image_file": "../../../assets/images/casual-leave.png",
      "timezone": this.zone,
      'before_request_leave':2
    },
    {
      "leave_type": "Sick leave",
      "start_date": this.startOfYear,
      "end_date": this.endOfYear,
      "year": this.leaveTypeYear,
      "available_days": 10,
      "image_name": "sick.jpg",
      "image_file": "../../../assets/images/sick.png",
      "timezone": this.zone,
      'before_request_leave':0
    }
  ];
  constructor(
    public router: Router,
    public dialogRef: MatDialogRef<any>,
    private spinner: NgxSpinnerService,
    public settingService: SettingsService,
    private utilsService: UtilService,
    @Inject(MAT_DIALOG_DATA) public data,
  ) { }

  ngOnInit() {
    //  console.log(this.leaveTypeData);
  }
  

  //default leave type action
  async defaultleaveType() {
    this.spinner.show();
    for await (let leaveData of this.leaveTypeData) {
      // console.log(leaveData);
      var formData = new FormData();
      var file = await this.getFileFromUrl(leaveData.image_file, 'image.jpg');
      formData.append("image", file);
      // console.log(file);
      let data = {
        'created_by': localStorage.getItem('Id'),
        'leave_type': leaveData.leave_type,
        'start_date': leaveData.start_date,
        'end_date': leaveData.end_date,
        'year': leaveData.year,
        'available_days': leaveData.available_days,
        'image_name': leaveData.image_name,
        'timezone': leaveData.timezone,
        'before_request_leave':leaveData.before_request_leave
      }
      // console.log(data);
      formData.append('org_id', localStorage.getItem("OrgId"));
      formData.append("data", JSON.stringify(data));
      this.settingService.createLeaveTypeDetails(formData).subscribe(res => {
        if (res.map.statusMessage == "Success") {
          setTimeout(() => {
            // this.utilsService.openSnackBarAC("This leave types created current year only", "OK"); 
            this.spinner.hide();
            this.dialogRef.close("refresh");
          }, 2000);
        }
      }, (error) => {
        this.router.navigate(["/404"]);
        this.spinner.hide();
      })
    }
  }
  //add leave types
  manageLeaveType() {
    this.dialogRef.close("create");
  }

  //skip leave type action
  skipLeaveType() {
    let zone = moment.tz.guess();
    let date = moment(new Date()).format("DD/MM/YYYY HH:mm:ss");
    let text = date.toString();
    let data = {
      "is_skipped": true,
      "skipped_time": text,
      "id": localStorage.getItem("Id"),
      "timezone": zone
    }
    this.settingService.updateSkippedTime(data).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        this.dialogRef.close();
      } else {}
    })
  }

  ///****************** URL to file function***************///
  async getFileFromUrl(url, name, defaultType = 'image/jpeg') {
    const response = await fetch(url);
    const data = await response.blob();
    return new File([data], name, {
      type: data.type || defaultType,
    });
  }


}
