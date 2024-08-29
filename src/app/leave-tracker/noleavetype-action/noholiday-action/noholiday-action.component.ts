import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, Validators, UntypedFormBuilder } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { findIndex, first, takeUntil } from 'rxjs/operators';
import { NgxSpinnerService } from 'ngx-spinner';
import { ReplaySubject, Subject } from 'rxjs';
import { SettingsService } from '../../../services/settings.service';
import * as moment from 'moment-timezone';

@Component({
  selector: 'app-noholiday-action',
  templateUrl: './noholiday-action.component.html',
  styleUrls: ['./noholiday-action.component.less']
})
export class NoholidayActionComponent implements OnInit {
  isManageGovHoliday: boolean;
  isDefaultHoliday: boolean = false;
  isresetHoliday: boolean;
  public countryFilterCtrl: UntypedFormControl = new UntypedFormControl();

  /** Subject that emits when the component has been destroyed. */
  protected _onDestroy = new Subject<void>();

  /** list of bill filtered by search keyword */
  public filteredCountry: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);

  defaultHolidayFormGroup: UntypedFormGroup = this.formBuilder.group({
    country_name: ['', [Validators.required]]
  });

  countryNames: any[] = [ //46
    { code: "australian", country: "Australia" },
    { code: "austrian", country: "Austria" },
    { code: "brazilian", country: "Brazil" },
    { code: "bulgarian", country: "Bulgaria" },
    { code: "canadian", country: "Canada" },
    { code: "china", country: "China" },
    { code: "croatian", country: "Croatia" },
    { code: "czech", country: "Czechia" },
    { code: "danish", country: "Denmark" },
    { code: "finnish", country: "Finland" },
    { code: "french", country: "France" },
    { code: "german", country: "Germany" },
    { code: "greek", country: "Greece" },
    { code: "hong_kong", country: "Hong Kong" },
    { code: "hungarian", country: "Hungary" },
    { code: "indian", country: "India" },
    { code: "indonesian", country: "Indonesia" },
    { code: "irish", country: "Ireland" },
    { code: "jewish", country: "Israel" },
    { code: "italian", country: "Italy" },
    { code: "japanese", country: "Japan" },
    { code: "latvian", country: "Latvia" },
    { code: "lithuanian", country: "Lithuania" },
    { code: "malaysia", country: "Malaysia" },
    { code: "mexican", country: "Mexico" },
    { code: "dutch", country: "Netherlands" },
    { code: "new_zealand", country: "New Zealand" },
    { code: "norwegian", country: "Norway" },
    { code: "philippines", country: "Philippines" },
    { code: "polish", country: "Poland" },
    { code: "portuguese", country: "Portugal" },
    { code: "romanian", country: "Romania" },
    { code: "russian", country: "Russia" },
    { code: "saudiarabian", country: "Saudi Arabia" },
    { code: "singapore", country: "Singapore" },
    { code: "slovak", country: "Slovakia" },
    { code: "slovenian", country: "Slovenia" },
    { code: "south_korea", country: "South Korea" },
    { code: "spain", country: "Spain" },
    { code: "swedish", country: "Sweden" },
    { code: "taiwan", country: "Taiwan" },
    // { code: "thai", country: "Thailand" },
    { code: "turkish", country: "Turkey" },
    { code: "ukrainian", country: "Ukraine" },
    { code: "usa", country: "United States - USA" },
    { code: "vietnamese", country: "Vietnam" },
  ];
  currentYearDefaultHolidays: any[];
  startOfYear: Date;
  endOfYear: Date;
  currentYear:any;
  leaveTypeYear:any;
  isCurrentYear:boolean = false;

  constructor(
    public formBuilder: UntypedFormBuilder,
    public router: Router,
    public dialogRef: MatDialogRef<any>,
    @Inject(MAT_DIALOG_DATA) public data,
    private spinner: NgxSpinnerService,
    private settingsService: SettingsService
  ) {
    // console.log(data);
  }
  ngOnInit() {
    this.startOfYear = moment().startOf('year').toDate();
    this.endOfYear = moment().endOf('year').toDate();
    this.currentYear = moment().year();
    this.leaveTypeYear = this.data.leaveTypeYear;
    // console.log(this.currentYear +""+ this.leaveTypeYear);
    if(this.currentYear == this.leaveTypeYear){
      this.isCurrentYear = true;
    } else {
      this.isCurrentYear = false;
    }
    this.isManageGovHoliday = false;
    this.isresetHoliday = this.data.isresetHoliday;
    this.countryFilterCtrl.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        this.filtercountry();
      });
      if(this.isresetHoliday){
        this.addDefaultGovtHoliday();
      }
  }


  countryName: any;
  countrySelectEvent(data) {
    // console.log(data);
    this.countryName = data;
    this.currentYearDefaultHolidays = [];
    this.getHolidaysList(data);


  }
  //move custom holidays
  manageCustomHoliday() {
    this.dialogRef.close("custom");
  }

  //add default govt holiday
  addDefaultGovtHoliday() {
    this.isManageGovHoliday = true;
    this.filtercountry();
  }
  protected filtercountry() {
    if (!this.countryNames) {
      return;
    }
    // get the search keyword
    let search = this.countryFilterCtrl.value;
    if (!search) {
      this.filteredCountry.next(this.countryNames.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
    // filter the client
    this.filteredCountry.next(
      this.countryNames.filter(data => data.code.toLowerCase().indexOf(search) > -1)
    );
  }

  //get holiday list of based on select country
  getHolidaysList(data) {
    this.spinner.show();
    this.settingsService.getHolidaysList(data).subscribe(data => {
      if (data.items.length > 0) {
        for (let i = 0; i < data.items.length; i++) {
          if (moment(data.items[i].start.date).toDate() >= this.startOfYear && moment(data.items[i].end.date).toDate() <= this.endOfYear) {
            this.currentYearDefaultHolidays.push({ holiday_name: data.items[i].summary, start: data.items[i].start.date, end: data.items[i].end.date, GCLink: data.items[i].htmlLink });
          }
        }

      }
      // console.log(this.currentYearDefaultHolidays);
      // this.currentYearDefaultHolidays.push(this.currentYearDefaultHolidays[0]);
      this.currentYearDefaultHolidays = Object.values(this.currentYearDefaultHolidays.reduce((acc,cur)=>Object.assign(acc,{[cur.start]:cur}),{}));
      // console.log(this.currentYearDefaultHolidays);
      this.spinner.hide();
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
    });

  }
  //add default holidays
  async addDefaultHoliday() {
    this.spinner.show();
    let zone = moment.tz.guess();
    for await (let defaultdata of this.currentYearDefaultHolidays) {
      let data: Object = {
        "org_id": localStorage.getItem("OrgId"),
        "created_by": localStorage.getItem('Id'),
        "leave_name": defaultdata.holiday_name,
        "leave_date": defaultdata.start,
        // "description": this.holidayFormGroup.value.description,
        "start_date": moment().startOf('year').toDate(),
        "end_date": moment().endOf('year').toDate(),
        "timezone": zone,
        "leave_date_str": defaultdata.start,
      }
      // console.log(data);
      this.settingsService.createHoliday(data).subscribe(data => {
      // this.spinner.hide();
      // this.dialogRef.close("default");
      });

    }
    // cancel the default holiday
    setTimeout(() => {
      this.spinner.hide();
      this.dialogRef.close("default");
    }, 3000);
  }
  deleteIds: any = [];

// reset holiday action 
  async addResetHoliday() {
    this.spinner.show();
    this.deleteIds = this.data.deleteIds;
    let length = this.deleteIds.length;
    let zone = moment.tz.guess();
    if (length != 0) {
      await this.deleteIdsHoliday();
      for await (let defaultdata of this.currentYearDefaultHolidays) {
        let data: Object = {
          "org_id": localStorage.getItem("OrgId"),
          "created_by": localStorage.getItem('Id'),
          "leave_name": defaultdata.holiday_name,
          "leave_date": defaultdata.start,
          // "description": this.holidayFormGroup.value.description,
          "start_date": moment().startOf('year').toDate(),
          "end_date": moment().endOf('year').toDate(),
          "timezone": zone,
          "leave_date_str": defaultdata.start,
        }
        // console.log(data);
        this.settingsService.createHoliday(data).subscribe(data => {
          
        });
        setTimeout(()=>{
          this.spinner.hide();
          this.dialogRef.close("reset");
        },3000);
      }
    } else {
      for await (let defaultdata of this.currentYearDefaultHolidays) {
        let data: Object = {
          "org_id": localStorage.getItem("OrgId"),
          "created_by": localStorage.getItem('Id'),
          "leave_name": defaultdata.holiday_name,
          "leave_date": defaultdata.start,
          // "description": this.holidayFormGroup.value.description,
          "start_date": moment().startOf('year').toDate(),
          "end_date": moment().endOf('year').toDate(),
          "timezone": zone,
          "leave_date_str": defaultdata.start,
        }
        // console.log(data);
        this.settingsService.createHoliday(data).subscribe(data => {
          this.spinner.hide();
          this.dialogRef.close("reset");
        });
      }

    }

    // console.log(length+""+data);

  }
  //delete holidays

  deleteIdsHoliday() {
    let data: Object = {
      "deleteIds": this.data.deleteIds,
    }
    // console.log(data);
    this.settingsService.bulkdeleteLeaveTypes(data).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        // this.utilsService.openSnackBarAC("Leave type details deleted successfully", "OK");
        // this.dialogRef.close("delete");
      }
    });

  }
  
  //skip holiday action
  skipHolidays() {
  let zone = moment.tz.guess();
    let date = moment(new Date()).format("DD/MM/YYYY HH:mm:ss");
    // console.log(date);
    let text = date.toString();
    // console.log(text);
    let data = {
      "is_skipped": true,
      "skipped_time": text,
      "id": localStorage.getItem("Id"),
      "timezone": zone
    }
    // console.log(data);
     this.settingsService.updateSkippedTime(data).subscribe(data => {
      // console.log(data);
      if (data.map.statusMessage == "Success") {
        this.dialogRef.close();
        // let response = JSON.parse(data.map.data)
        // console.log(response);

      } else {

      }
    })
    // console.log(date.getHours());
    // this.dialogRef.close("skip");
  }

}
