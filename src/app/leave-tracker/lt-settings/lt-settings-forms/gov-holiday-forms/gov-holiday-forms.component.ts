import { Component, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import moment from 'moment-timezone';
import { NgxSpinnerService } from 'ngx-spinner';
import { ReplaySubject, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/internal/operators/takeUntil';
import { SettingsService } from 'src/app/services/settings.service';
import { UtilService } from 'src/app/services/util.service';
import { MatDialog } from '@angular/material/dialog';
import {MatOption } from '@angular/material/core';
import {MatSelect } from '@angular/material/select';
import {errorMessage,alreadyExistMessage} from '../../../../util/constants';
@Component({
  selector: 'app-gov-holiday-forms',
  templateUrl: './gov-holiday-forms.component.html',
  styleUrls: ['./gov-holiday-forms.component.less']
})
export class GovHolidayFormsComponent implements OnInit {
  exitMessage = alreadyExistMessage;
  requiredMessage = errorMessage;

  holidayFormGroup: UntypedFormGroup;
  existingHolidayFormGroup: UntypedFormGroup;
  public countryFilterCtrl: UntypedFormControl = new UntypedFormControl();
  public holidayFilterCtrl: UntypedFormControl = new UntypedFormControl();
  protected _onDestroy = new Subject<void>();
  public filteredholiday: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);
  public filteredCountry: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);
  currentYearPublicHolidays: any[] = [];
  updateHolidayNameselectedItems: any[] = [];
  govholidayform: boolean;
  startOfYear: Date;
  endOfYear: Date;
  heading: string;
  subheading: string;
  leavetypeId: number;
  holidayName: any[];
  holidayDate: any[];
  holidayTypeLength: number;
  holidayDetails: any[] = [];
  holidayLeaveName: any[];
  holidayLeaveDate: any[];
  leaveNameCustom: any;
  leaveDateCustom: any;
  customLeaveName: boolean;
  customHolidayDate: boolean;
  govHolidayLeaveDate: boolean;
  isLeaveHoliday: boolean;
  constructor(
    private formBuilder: UntypedFormBuilder,
    private router: Router,
    private spinner: NgxSpinnerService,
    private settingsService: SettingsService,
    private domSanitizer: DomSanitizer,
    private utilsService: UtilService,
    private activatedRoute: ActivatedRoute,
    private dialog: MatDialog
  ) { }

  /** Subject that emits when the component has been destroyed. */

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
  ngOnInit() {
    this.leavetypeId = this.activatedRoute.snapshot.params.id;
    //Global use
    this.startOfYear = moment().startOf('year').toDate();
    this.endOfYear = moment().endOf('year').toDate();
    this.holidayFormGroup = this.formBuilder.group({
      leave_name: ['', [Validators.required, Validators.pattern("^([A-Za-z]+ )+[A-Za-z]+$|^[A-Za-z]+$")]],
      leave_date: ['', [Validators.required]],
      description: [''],
    })
    this.getHolidaysByOrgId();
    this.govholidayform = true;
    this.heading = "Add Gov Holiday";
    this.subheading = "Create a goverment holiday"
    this.existingHolidayFormGroup = this.formBuilder.group({
      country_name: ['', [Validators.required]],
      leave_name: ['', [Validators.required]],
    })

    // load the country names
    this.filteredCountry.next(this.countryNames.slice());
    // listen for search field value changes 
    this.countryFilterCtrl.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        this.filtercountry();
      });
  }

  async addExistingHoliday() {
    this.spinner.show();
    this.holidayName = [];
    this.holidayDate = [];
    if (this.updateHolidayNameselectedItems[0] == undefined) {
      this.updateHolidayNameselectedItems.shift();
    }
    for await (let holidayData of this.updateHolidayNameselectedItems) {
      let zone = moment.tz.guess();
      let data: Object = {
        "org_id": localStorage.getItem("OrgId"),
        "created_by": localStorage.getItem('Id'),
        "leave_name": holidayData.holiday_name,
        "leave_date": holidayData.start,
        "start_date": moment().startOf('year').toDate(),
        "end_date": moment().endOf('year').toDate(),
        "timezone": zone,
        "leave_date_str": holidayData.start
      }
      if (!(this.holidayLeaveName.includes(holidayData.holiday_name,)) && (!this.holidayLeaveDate.includes(holidayData.start,))) {
        this.settingsService.createHoliday(data).subscribe(res => {
          if (res.map.statusMessage == "Success") {
            // this.utilsService.openSnackBarAC("Holiday created successfully", "OK");
          }
          else {
            this.utilsService.openSnackBarMC("Failed to create holiday", "OK");
          }

        }, (error) => {
          this.router.navigate(["/404"]);
          this.spinner.hide();
        })
      }
      // setTimeout(() => {
      //   this.spinner.hide();
      //   this.router.navigate(['/leave-tracker-settings']);
      // }, 3000);
    }

    this.utilsService.openSnackBarAC("Holiday added successfully", "OK");
    setTimeout(() => {
      this.spinner.hide();
      this.router.navigate(['/leave-tracker-settings']);

    }, 3000);
  }


  protected filtercountry() {
    if (!this.countryNames) {
      return;
    }
    // get the search keyword FFF
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



  // *************************************************** FUNCTIONS FOR CUSTOM HOLIDYAY *************************


  getHolidaysByOrgId() {
    this.spinner.show();
    this.holidayLeaveName = [];
    this.holidayLeaveDate = [];
    this.holidayTypeLength = 0;
    let zone = moment.tz.guess();

    let data: Object = {
      "org_id": localStorage.getItem("OrgId"),
      "start_date": moment(this.startOfYear).format("YYYY-MM-DD").toString(),
      "end_date": moment(this.endOfYear).format("YYYY-MM-DD").toString(),
      "timezone": zone,
    }
    this.settingsService.getActiveHolidayByOrgIdAndDates(data).subscribe(data => {
      // this.settingsService.getActiveHolidayByOrgId(localStorage.getItem("OrgId")).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        let response = JSON.parse(data.map.data);
        this.holidayDetails = response;
        this.holidayTypeLength = this.holidayDetails.length;
        for (let i = 0; i < this.holidayDetails.length; i++) {
          this.holidayLeaveName.push(this.holidayDetails[i].leave_name);
          this.holidayLeaveDate.push(this.holidayDetails[i].leave_date_str);
        }

      }
      this.spinner.hide();
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
    })
  }

  onLeaveName() {
    this.customLeaveName = false;
    this.leaveNameCustom = this.holidayFormGroup.get('leave_name').value;
    let length = this.holidayLeaveName.length;
    for (let j = 0; j < length; j++) {
      if (this.leaveNameCustom.toLowerCase() == this.holidayLeaveName[j].toLowerCase()) {
        this.customLeaveName = true;
      }

    }
  }
  holidayLeaveNameInclude(holidayName, holidayDate) {
    if (this.holidayLeaveName.includes(holidayName) || this.holidayLeaveDate.includes(holidayDate)) {
      return true;
    }
    else {
      return false;
    }
  }
  holidayLeaveNameTooltip(holidayName, holidayDate) {
    if (this.holidayLeaveName.includes(holidayName) || this.holidayLeaveDate.includes(holidayDate)) {
      return false;
    }
    else {
      return true;
    }

  }


  onLeaveDate(event: any) {
    this.customHolidayDate = false;
    let len = this.holidayLeaveDate.length;
    let dateValue = event;
    let d1 = new Date(dateValue);
    let v1 = d1.getDate();
    let v2 = d1.getMonth();
    let v3 = d1.getFullYear();
    for (let i = 0; i < len; i++) {
      let holidayDate = new Date(this.holidayLeaveDate[i]);
      if (v1 == holidayDate.getDate() && v2 == holidayDate.getMonth() && v3 == holidayDate.getFullYear()) {
        this.customHolidayDate = true;
      }
    }
  }

  weeksDatesFilter = (d: Date): boolean => {
    const day = d.getDay();
    /* Prevent Saturday and Sunday for select. */
    return day !== 0 && day !== 6;
  }


  togglecancelholiday() {
    this.govHolidayLeaveDate = false;
    this.isLeaveHoliday = false;
    this.holidayFormGroup.reset();
    this.router.navigate(["/leave-tracker-settings"]);
  }


  toggleExistingHoliday() {
    this.govHolidayLeaveDate = false;
    this.isLeaveHoliday = false;
    this.existingHolidayFormGroup.reset();
    this.router.navigate(["/leave-tracker-settings"]);
  }




  holidaySelectEvent(data) {
    this.isLeaveHoliday = false;
    const holidayName = this.existingHolidayFormGroup.get('leave_name');
    const holidayLeave = holidayName.value.holiday_name;
    for (let j = 0; j < this.holidayLeaveName.length; j++) {
      if (holidayLeave == this.holidayLeaveName[j]) {
        this.isLeaveHoliday = true;
        this.existingHolidayFormGroup.get('leave_date').setValue(null);
      }
    }
    if(this.currentYearPublicHolidays.length==this.updateHolidayNameselectedItems.length-1){
      this.allSelected=true
    }
    else{
      this.allSelected=false
    }
  }


  addHoliday() {
    this.spinner.show();
    let zone = moment.tz.guess();
    let addHolidayDate = moment(this.holidayFormGroup.value.leave_date).format("YYYY-MM-DD");
    let data: Object = {
      "org_id": localStorage.getItem("OrgId"),
      "created_by": localStorage.getItem('Id'),
      "leave_name": this.holidayFormGroup.value.leave_name,
      "leave_date": addHolidayDate,
      "start_date": moment().startOf('year').toDate(),
      "end_date": moment().endOf('year').toDate(),
      "timezone": zone,
      "leave_date_str": addHolidayDate,
    }
    this.settingsService.createHoliday(data).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        this.utilsService.openSnackBarAC("Holiday added successfully", "OK");
        this.spinner.hide();
        this.router.navigate(["/leave-tracker-settings"]);
      }
      else {
        this.utilsService.openSnackBarMC("Failed to create holiday", "OK");
        this.spinner.hide();
      }
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
    })
  }

  protected filterholiday() {
    if (!this.currentYearPublicHolidays) {
      return;
    }
    // get the search keyword
    let search = this.holidayFilterCtrl.value;
    if (!search) {
      this.filteredholiday.next(this.currentYearPublicHolidays.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
    // filter the client
    this.filteredholiday.next(
      this.currentYearPublicHolidays.filter(data => data.holiday_name.toLowerCase().indexOf(search) > -1)
    );
  }


  /// ******************** To select and unselect the holiday statrt ***********************//

  @ViewChild('select', { static: true }) select: MatSelect;
  allSelected = false;
  toggleAllSelection() {
    if (this.allSelected) {
      this.select.options.forEach((item: MatOption) => item.select());
    } else {
      this.select.options.forEach((item: MatOption) => item.deselect());
    }
  }


  countrySelectEvent(data) {
    this.currentYearPublicHolidays = [];
    this.existingHolidayFormGroup.get('leave_name').reset();
    this.getHolidaysList(data);
    this.allSelected = false;
  }
  getHolidaysList(data) {
    this.spinner.show();
    this.settingsService.getHolidaysList(data).subscribe(data => {
      if (data.items.length > 0) {
        for (let i = 0; i < data.items.length; i++) {
          if (moment(data.items[i].start.date).toDate() >= this.startOfYear && moment(data.items[i].end.date).toDate() <= this.endOfYear) {
            this.currentYearPublicHolidays.push({ holiday_name: data.items[i].summary, start: data.items[i].start.date, end: data.items[i].end.date, GCLink: data.items[i].htmlLink });
          }
        }
      }
      this.currentYearPublicHolidays = Object.values(this.currentYearPublicHolidays.reduce((acc, cur) => Object.assign(acc, { [cur.start]: cur }), {}));
      // load the country names
      this.filteredholiday.next(this.currentYearPublicHolidays.slice());


      // listen for search field value changes
      this.holidayFilterCtrl.valueChanges
        .pipe(takeUntil(this._onDestroy))
        .subscribe(() => {
          this.filterholiday();
        });
      this.spinner.hide();
    },  (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
    })
  }
}
