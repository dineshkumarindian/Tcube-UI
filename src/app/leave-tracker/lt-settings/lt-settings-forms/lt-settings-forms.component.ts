import { Component, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import  moment from 'moment-timezone';
import { NgxSpinnerService } from 'ngx-spinner';
import { ReplaySubject, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/internal/operators/takeUntil';
import { SettingsService } from 'src/app/services/settings.service';
import { UtilService } from 'src/app/services/util.service';
import { NoleavetypeActionComponent } from '../../noleavetype-action/noleavetype-action.component';
import { NoholidayActionComponent } from '../../noleavetype-action/noholiday-action/noholiday-action.component';
import { MatDialog } from '@angular/material/dialog';
import {MatOption } from '@angular/material/core';
import {MatSelect } from '@angular/material/select';
import { errorMessage, validFormat, alreadyExistMessage } from '../../../util/constants';
@Component({
  selector: 'app-lt-settings-forms',
  templateUrl: './lt-settings-forms.component.html',
  styleUrls: ['./lt-settings-forms.component.less']
})
export class LtSettingsFormsComponent implements OnInit {
  requiredMessage = errorMessage;
  exitMessage = alreadyExistMessage;
  validMessage = validFormat;
  heading: string;
  subheading: string;
  routingurl: any;
  leaveTypeLength: number;
  leaveTypes: any[] = [];
  leaveTypeDetails: any[] = [];
  minDateLT: any;
  maxDateLT: any;
  leaveTypeStartDate: any;
  leaveTypeEndDate: any;
  isYearPickerOff: boolean = false;
  leaveTypeYear: any;
  buttonactivate_addleavetype: boolean = true;
  leaveTypeIdUpdate: boolean = false;
  leavetypeform: boolean;
  holidayform: boolean;
  govholidayform: boolean;
  startOfYear: Date;
  endOfYear: Date;
  addltform: boolean;
  editltform: boolean;
  updateHolidayNameselectedItems: any[] = [];

  constructor(
    private formBuilder: UntypedFormBuilder,
    private router: Router,
    private spinner: NgxSpinnerService,
    private settingsService: SettingsService,
    private domSanitizer: DomSanitizer,
    private utilsService: UtilService,
    private activatedRoute: ActivatedRoute,
    private dialog: MatDialog
  ) {
    this.router.events.subscribe((ev) => {

      if (ev instanceof NavigationEnd) {

        /* Your code goes here on every router change */
        let url = (window.location.href).split("/");
        this.routingurl = url[url.length - 1];
      }
    });
  }
  LeaveTypeFormGroup: UntypedFormGroup;
  holidayFormGroup: UntypedFormGroup;
  existingHolidayFormGroup: UntypedFormGroup;
  leavetypeId: number;
  // startDateHoliday:any;
  // endDateHoliday:any;
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
    if (this.routingurl === "add-leave-types") {
      // this.getActiveLeaveTypeDetailsByOrgId();
      this.addltform = true;
      this.leavetypeform = true;
      this.heading = "Add Leave Type";
      this.subheading = "Leave Type Configuration Details"
      this.LeaveTypeFormGroup = this.formBuilder.group({
        leavetype: ['', [Validators.required, Validators.pattern("[a-zA-Z][a-zA-Z ]+")]],
        leave_type_image: [''],
        st_year_int: ['', [Validators.required]],
        ed_year_int: ['', [Validators.required]],
        available_days: ['', [Validators.required, Validators.minLength(0), Validators.maxLength(365)]],
        duration_before_request_leave:[0,[Validators.required,Validators.minLength(0), Validators.maxLength(365)]]
      })
      // this.minDateLT = moment().startOf('year').toDate();
      // this.maxDateLT = moment().endOf('year').toDate();
      const currentYear = new Date().getFullYear();
      this.minDateLT = new Date(currentYear - 0, 0, 1);
      this.maxDateLT = new Date(currentYear + 1, 11, 31);
    }
    else if (this.routingurl === "add-holiday") {
      let year = new Date(localStorage.getItem("lt-year"));
      this.startOfYear = moment(year).startOf('year').toDate();
      this.endOfYear = moment(year).endOf('year').toDate();
      this.getHolidaysByOrgId();
      this.holidayform = true;
      this.heading = "Add Holiday";
      this.subheading = "Create a custom holiday"
      // this.holidayFormGroup = this.formBuilder.group({
      //   leave_name: ['', [Validators.required, Validators.pattern("^([A-Za-z]+ )+[A-Za-z]+$|^[A-Za-z]+$")]],
      //   leave_date: ['', [Validators.required]],
      //   description: [''],
      // })
    }
    else if (this.routingurl === "add-gov-holiday") {
      this.getHolidaysByOrgId();
      this.govholidayform = true;
      this.heading = "Add Gov Holiday";
      this.subheading = "Create a goverment holiday"
      this.existingHolidayFormGroup = this.formBuilder.group({
        country_name: ['', [Validators.required]],
        leave_name: ['', [Validators.required]],
        // leave_date: ['', [Validators.required]],
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
    else if (this.leavetypeId) {
      // this.getActiveLeaveTypeDetailsByOrgId();
      this.editltform = true;
      this.leavetypeform = true;
      this.heading = "Edit Leave Type";
      this.subheading = "Edit Leave Type Configuration Details"
      this.LeaveTypeFormGroup = this.formBuilder.group({
        leavetype: ['', [Validators.required, Validators.pattern("^([A-Za-z]+ )+[A-Za-z]+$|^[A-Za-z]+$")]],
        leave_type_image: [''],
        st_year_int: ['', [Validators.required]],
        ed_year_int: ['', [Validators.required]],
        available_days: ['', [Validators.required, Validators.min(0), Validators.max(365)]],
        duration_before_request_leave:[0,[Validators.required]]
      })
      // this.minDateLT = moment().startOf('year').toDate();
      // this.maxDateLT = moment().endOf('year').toDate();
      const currentYear = new Date().getFullYear();
      this.minDateLT = new Date(currentYear - 0, 0, 1);
      this.maxDateLT = new Date(currentYear + 1, 11, 31);
      this.leaveTypeFormValue();
    }
  }

  numberOnly(event): boolean {
      const charCode = (event.which) ? event.which : event.keyCode;
        if (charCode > 31 && (charCode < 48 || charCode > 57)) {
           return false;
        }
        return true;
    
    }
  

  //get active leave type org id
  //remove duplicate leave type 
  onLeavetType: boolean = false;
  isLeaveTypeAvailable: boolean = false;
  onCreateLeave() {
    if (this.LeaveTypeFormGroup.value.leavetype) {
      if (this.leaveTypeDetails.find(x => x.toLowerCase() == (this.LeaveTypeFormGroup.value.leavetype).toLowerCase()))
        this.onLeavetType = true;
      else this.onLeavetType = false;
    }


  }
  isavailableDays: boolean;
  onAvailableDays(event) {
    let value = event;
    this.isavailableDays = false;
    if (event >= 0 && event <= 365) {
      this.isavailableDays = false;
    } else {
      this.isavailableDays = true;
    }
  }

  //to get active leave type details org id
  defaultActionDelete: boolean = false;
  getActiveLeaveTypeDetailsByOrgId() {
    this.spinner.show();
    this.leaveTypeDetails = [];
    this.leaveTypeLength = 0;
    // debugger
    let OrgId = localStorage.getItem("OrgId");
    this.settingsService.getActiveLeaveDetailsByOrgId(OrgId).subscribe(data => {
      // debugger
      if (data.map.statusMessage == "Success") {
        let response = JSON.parse(data.map.data);
        // this for getting leave type image
        for (var i = 0; i < response.length; i++) {
          if (response[i].image != undefined) {
            let stringArray = new Uint8Array(response[i].image);
            const STRING_CHAR = stringArray.reduce((data, byte) => {
              return data + String.fromCharCode(byte);
            }, '');
            let base64String = btoa(STRING_CHAR);
            response[i].image = this.domSanitizer.bypassSecurityTrustUrl("data:image/jpeg;base64," + base64String);
          }
        }
        this.leaveTypes = response;

        for (let k = 0; k < this.leaveTypes.length; k++) {
          // this.leaveTypeDetails.push(this.leaveTypes[k].leave_type.toLowerCase());

          if (this.leavetypeId != this.leaveTypes[k].id) {
            this.leaveTypeDetails.push(this.leaveTypes[k].leave_type.toLowerCase());
          }
        }
        // console.log(this.leaveTypeDetails);
        this.leaveTypeDetails = [...new Set(this.leaveTypeDetails)];
        this.leaveTypeLength = this.leaveTypeDetails.length;
        // console.log(this.leaveTypeLength);
      }
      this.spinner.hide();
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
    })
  }

  //to get the leave type details based on the year
  getActiveLeaveTypeDetailsByOrgIdAndtz() {
    this.spinner.show();
    this.startOfYear = moment(this.selectedStDate).startOf('year').toDate();
    this.endOfYear = moment(this.selectedStDate).endOf('year').toDate();
    this.leaveTypeDetails = [];
    let zone = moment.tz.guess();
    let data: Object = {
      "org_id": localStorage.getItem("OrgId"),
      "start_date": this.startOfYear,
      "end_date": this.endOfYear,
      "timezone": zone,
    }
    this.settingsService.getActiveLeaveTypeByOrgIdAndDates(data).subscribe(async data => {
      if (data.map.statusMessage == "Success") {
        let response = JSON.parse(data.map.data);
        if (response.length > 0) {
          this.leaveTypes = response;

          for (let k = 0; k < this.leaveTypes.length; k++) {
            if (this.leavetypeId != this.leaveTypes[k].id) {
              this.leaveTypeDetails.push(this.leaveTypes[k].leave_type.toLowerCase());
            }
          }
        }
        else if (response.length == 0) {
          this.leaveTypeDetails = [];
        }
      }
      setTimeout(() => {
        this.spinner.hide();
      }, 500);
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
    })
  }

  selectedStDate: Date;
  chosenYearHandler1(ev, input) {
    this.isYearPickerOff = true;
    this.selectedStDate = moment(ev).toDate();
    this.leaveTypeStartDate = moment(ev).startOf('year').toDate();
    this.leaveTypeEndDate = moment(ev).endOf('year').toDate();
    this.leaveTypeYear = moment(ev).year();
    input.close();
    this.LeaveTypeFormGroup.get('st_year_int').setValue(this.leaveTypeStartDate);
    this.LeaveTypeFormGroup.get('ed_year_int').setValue(moment(this.leaveTypeEndDate).format("DD/MM/YYYY"));
    this.LeaveTypeFormGroup.controls['leavetype'].reset();
    this.LeaveTypeFormGroup.controls['available_days'].reset();
    this.cancel();
    this.onLeavetType = false;
    this.getActiveLeaveTypeDetailsByOrgIdAndtz();
  }

  msg: any;
  selectedFile: File = null;
  fileSize: number = 0;
  base64url: any;
  attachment_update: File = null;
  attachmentName: any;
  attachment: File = null;
  attachmentCopy: any;
  url: any;
  filetype: any;
  onFileChanged(event: any) {
    if (!(event.target.files[0] || event.target.files[0].length == 0)) {
      this.msg = "you must select an Image";
      return;
    }
    var mimeType = event.target.files[0].type;
    if (mimeType.match(/image\/*/) == null) {
      this.msg = "Accept jpg,png image format";
    } else {
      if (event.target.files[0].size <= 500000) {
        var reader = new FileReader();
        reader.readAsDataURL(event.target.files[0]);
        this.selectedFile = event.target.files[0];
        this.filetype = this.selectedFile.type;
        this.attachmentName = this.selectedFile.name;
        this.attachmentCopy = this.selectedFile;
        reader.onload = (_event) => {
          this.msg = "";
          this.url = reader.result;
        }
      }
      else {
        // this.utilsService.openSnackBarMC("Please select below 500kb only", "OK");
        this.msg = "Image size should be accepted maximum of 500KB";
        this.spinner.hide();
      }

    }
    this.fileSize = this.selectedFile.size;
    this.attachment = this.selectedFile;
    this.imagerestriction();
  }

  //reset the image
  cancel() {
    this.attachmentName = null;
    this.attachmentCopy = null;
    this.attachment = null;
    this.fileSize = null;
    this.selectedFile = null;
    this.url = null;
    this.buttonactivate_addleavetype = true;
    // this.LeaveTypeFormGroup.get("actimg").setValue('');
  }
  // for image restruction on add leave type
  imagerestriction() {
    if ((this.filetype == 'image/png') || (this.filetype == 'image/jpeg') || (this.filetype == 'image/jpg') || (this.filetype == 'image/webp')) {
      this.buttonactivate_addleavetype = true;
    }
    else {
      this.buttonactivate_addleavetype = false;
    }
  }


  ///****************** URL to file function***************///
  async getFileFromUrl(url, name, defaultType = 'image/jpeg') {
    const response = await fetch(url);
    const data = await response.blob();
    this.attachmentName = name;
    return new File([data], name, {
      type: data.type || defaultType,
    });
  }

  //create method for leave type
  async addLeaveType() {
    this.spinner.show();
    let zone = moment.tz.guess();
    let formData: any = new FormData();
    this.buttonactivate_addleavetype = true;
    if (this.attachmentCopy == "" || this.attachmentCopy == null) {
      var file = await this.getFileFromUrl("../../../assets/images/default.png", 'default.jpg');
      formData.append('image', file);
    } else {
      formData.append("image", this.attachmentCopy);
    }
    if (this.LeaveTypeFormGroup.value.available_days == null) {
      this.LeaveTypeFormGroup.get('available_days').setValue(0);
    }

    let data: Object = {
      "created_by": localStorage.getItem('Id'),
      "leave_type": this.LeaveTypeFormGroup.value.leavetype,
      "start_date": this.leaveTypeStartDate,
      "end_date": this.leaveTypeEndDate,
      "year": this.leaveTypeYear,
      "image_name": this.attachmentName,
      "available_days": this.LeaveTypeFormGroup.value.available_days,
      "timezone": zone,
      "before_request_leave":this.LeaveTypeFormGroup.value.duration_before_request_leave
    }
    // console.log(data);
    let orgId = localStorage.getItem("OrgId");
    formData.append("data", JSON.stringify(data));
    formData.append("org_id", orgId);
    this.settingsService.createLeaveTypeDetails(formData).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        this.utilsService.openSnackBarAC("Leave type added successfully", "OK");
        // this.getActiveLeaveTypeDetailsByOrgId();
        this.spinner.hide();
        this.router.navigate(["/leave-tracker-settings"]);
      }
      else {
        this.utilsService.openSnackBarMC("Failed to create leave type", "OK");
        this.spinner.hide();
      }
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
    })
  }

  //click the cancel btn to reset the form and redirect to settings page
  togglecancelleavetype() {
    setTimeout(() => {
      this.attachmentCopy = null;
      this.attachmentName = null;
      this.leaveTypeIdUpdate = null;
      this.buttonactivate_addleavetype = true;
    }, 500);
    this.onLeavetType = false;
    this.LeaveTypeFormGroup.reset();
    this.router.navigate(["/leave-tracker-settings"]);
  }

  idLeaveType: any;
  //set value after click edit
  leaveTypeFormValue() {
    this.spinner.show();
    this.settingsService.getLeaveTypeById(this.leavetypeId).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        let response = JSON.parse(data.map.data);
        // console.log(response)
        this.LeaveTypeFormGroup.get('leavetype').setValue(response.leave_type);
        let st_date = new Date(response.start_date);
        let ed_date = new Date(response.end_date);
        this.idLeaveType = response.leave_type;
        // console.log(this.idLeaveType);
        this.selectedStDate = moment(response.start_date).toDate();
        this.getActiveLeaveTypeDetailsByOrgIdAndtz();
        let end_date = moment(ed_date).format('DD/MM/YYYY');
        this.leaveTypeStartDate = moment(st_date).startOf('year').toDate();
        this.leaveTypeEndDate = moment(ed_date).endOf('year').toDate();

        this.LeaveTypeFormGroup.get('st_year_int').setValue(st_date);
        this.LeaveTypeFormGroup.get('ed_year_int').setValue(end_date);
        this.leaveTypeYear = moment(st_date).year();
        this.LeaveTypeFormGroup.get('available_days').setValue(response.available_days);
        if (response.image != undefined) {
          let stringArray = new Uint8Array(response.image);
          const STRING_CHAR = stringArray.reduce((data, byte) => {
            return data + String.fromCharCode(byte);
          }, '');
          let base64String = btoa(STRING_CHAR);
          this.url = this.domSanitizer.bypassSecurityTrustUrl("data:image/jpeg;base64," + base64String);
          this.attachmentName = response.image_name;
          const imageName = response.image_name;
          const imageBlob = this.dataURItoBlob(base64String);
          const imageFile = new File([imageBlob], imageName, { type: 'image/png' });
          this.attachmentCopy = imageFile;
        }
        this.LeaveTypeFormGroup.get('duration_before_request_leave').setValue(response.before_request_leave);
      }
      this.spinner.hide();
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
    })
  }

  dataURItoBlob(dataURI) {
    const byteString = window.atob(dataURI);
    const arrayBuffer = new ArrayBuffer(byteString.length);
    const int8Array = new Uint8Array(arrayBuffer);
    for (let i = 0; i < byteString.length; i++) {
      int8Array[i] = byteString.charCodeAt(i);
    }
    const blob = new Blob([int8Array], { type: 'image/png' });
    return blob;
  }

  async updateLeaveType() {
    this.spinner.show();
    let zone = moment.tz.guess();
    let formData: any = new FormData();
    let leave_type;
    if (this.attachmentCopy == "" || this.attachmentCopy == null) {
      var file = await this.getFileFromUrl("../../../assets/images/default.png", 'default.jpg');
      formData.append('image', file);
    } else {
      formData.append("image", this.attachmentCopy);
    }
    if(this.idLeaveType != this.LeaveTypeFormGroup.value.leavetype){
      leave_type = this.LeaveTypeFormGroup.value.leavetype;
    } else{
      leave_type = this.idLeaveType;
    }
    let data: Object = {
      "id": this.leavetypeId,
      "created_by": localStorage.getItem('Id'),
      "leave_type": leave_type,
      "start_date": this.leaveTypeStartDate,
      "end_date": this.leaveTypeEndDate,
      "year": this.leaveTypeYear,
      "image_name": this.attachmentName,
      "available_days": this.LeaveTypeFormGroup.value.available_days,
      "timezone": zone,
      "before_request_leave":this.LeaveTypeFormGroup.value.duration_before_request_leave
    }
    let orgId = localStorage.getItem("OrgId");
    formData.append("data", JSON.stringify(data));
    formData.append("org_id", orgId);
    formData.append("image", this.attachmentCopy);
    // formData.append("oldleavetype", this.idLeaveType)
    // console.log(data);
    
    this.settingsService.updateLeaveType(formData).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        this.utilsService.openSnackBarAC("Leave type updated successfully", "OK");
        this.spinner.hide();
        this.togglecancelleavetype();
      }
      else {
        this.utilsService.openSnackBarMC("Failed to update leave type", "OK");
      }
      this.spinner.hide();
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
    })
  }
  // *************************************************** FUNCTIONS FOR CUSTOM HOLIDYAY *************************
  holidayTypeLength: number;
  holidayDetails: any[] = [];
  holidayLeaveName: any[];
  holidayLeaveDate: any[];
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
        // console.log(this.holidayLeaveName);
        // console.log(this.holidayLeaveDate);
      }
      this.spinner.hide();
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
    })
  }
  leaveNameCustom: any;
  leaveDateCustom: any;
  customLeaveName: boolean;
  customHolidayDate: boolean;
  govHolidayLeaveDate: boolean;
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
    // console.log(d);
    const day = new Date(d).getDay();

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



  isLeaveHoliday: boolean;
  holidaySelectEvent(data) {

    // console.log(data);
    // console.log(this.updateHolidayNameselectedItems);
    this.isLeaveHoliday = false;
    const holidayName = this.existingHolidayFormGroup.get('leave_name');
    const holidayLeave = holidayName.value.holiday_name;
    // console.log(this.holidayLeaveName);

    for (let j = 0; j < this.holidayLeaveName.length; j++) {
      if (holidayLeave == this.holidayLeaveName[j]) {
        this.isLeaveHoliday = true;
        this.existingHolidayFormGroup.get('leave_date').setValue(null);
      }
    }

    // if (this.holidayLeaveName.length==0) {
    //   this.allSelected = true;
    //   console.log("fuihdfsbi");
    // }
    // else {
    //   this.allSelected = false;
    //   console.log("fuihdfsvdsvbffbngdi");
    // }
    // if (this.isLeaveHoliday == false) {

    //   this.existingHolidayFormGroup.get('leave_date').setValue(data.start);
    //   this.existingHolidayFormGroup.controls['leave_date'].enable();
    // }
  }

  addHoliday() {
    this.spinner.show();
    let zone = moment.tz.guess();
    // console.log(this.holidayFormGroup.value.leave_date);
    let addHolidayDate = moment(this.holidayFormGroup.value.leave_date).format("YYYY-MM-DD");
    // console.log(addHolidayDate);
    let data: Object = {
      "org_id": localStorage.getItem("OrgId"),
      "created_by": localStorage.getItem('Id'),
      "leave_name": this.holidayFormGroup.value.leave_name,
      "leave_date": addHolidayDate,
      // "description": this.holidayFormGroup.value.description,
      "start_date": moment().startOf('year').toDate(),
      "end_date": moment().endOf('year').toDate(),
      "timezone": zone,
      "leave_date_str": addHolidayDate,
    }
    // console.log(data);
    this.settingsService.createHoliday(data).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        this.utilsService.openSnackBarAC("Holiday created successfully", "OK");
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

  // ************************************************FUNCTION FOR GOV HOLIDAYs********************************
  currentYearPublicHolidays: any[] = [];
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

  /** Subject that emits when the component has been destroyed. */
  protected _onDestroy = new Subject<void>();

  /** control for the MatSelect filter keyword */
  public countryFilterCtrl: UntypedFormControl = new UntypedFormControl();

  /** list of bill filtered by search keyword */
  public filteredCountry: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);

  /** control for the MatSelect filter keyword */
  public holidayFilterCtrl: UntypedFormControl = new UntypedFormControl();

  /** list of bill filtered by search keyword */
  public filteredholiday: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);

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
  countrySelectEvent(data) {
    // console.log(data);
    this.currentYearPublicHolidays = [];
    this.existingHolidayFormGroup.get('leave_name').reset();
    // this.existingHolidayFormGroup.get('leave_date').reset();
    this.getHolidaysList(data);
    // this.allSelected=false;
  }


  getHolidaysList(data) {
    this.spinner.show();
    // this.currentYearPublicHolidays = [];
    this.settingsService.getHolidaysList(data).subscribe(data => {
      if (data.items.length > 0) {
        for (let i = 0; i < data.items.length; i++) {
          if (moment(data.items[i].start.date).toDate() >= this.startOfYear && moment(data.items[i].end.date).toDate() <= this.endOfYear) {
            this.currentYearPublicHolidays.push({ holiday_name: data.items[i].summary, start: data.items[i].start.date, end: data.items[i].end.date, GCLink: data.items[i].htmlLink });
          }
        }
      }
      this.currentYearPublicHolidays = Object.values(this.currentYearPublicHolidays.reduce((acc, cur) => Object.assign(acc, { [cur.start]: cur }), {}));
      // console.log(this.currentYearPublicHolidays);
      // load the country names
      this.filteredholiday.next(this.currentYearPublicHolidays.slice());

      // listen for search field value changes
      this.holidayFilterCtrl.valueChanges
        .pipe(takeUntil(this._onDestroy))
        .subscribe(() => {
          this.filterholiday();
        });

      // }
      this.spinner.hide();
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
    })
  }
  protected filterholiday() {
    // console.log(this.filteredholiday);
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

  ///event for country selsction



  holidayName: any[];
  holidayDate: any[];
  async addExistingHoliday() {
    this.spinner.show();
    this.holidayName = [];
    this.holidayDate = [];
    // console.log(this.updateHolidayNameselectedItems);
    // for(let i=0;i<this.updateHolidayNameselectedItems.length ;i++){
    //   this.holidayName.push(this.updateHolidayNameselectedItems[i].holiday_name);
    //   this.holidayDate.push(this.updateHolidayNameselectedItems[i].start);
    // }
    // console.log(this.holidayName);
    // console.log(this.holidayDate);
    // this.existingHolidayFormGroup.controls['leave_date'].enable();
    for await (let holidayData of this.updateHolidayNameselectedItems) {
      let zone = moment.tz.guess();
      let data: Object = {
        "org_id": localStorage.getItem("OrgId"),
        "created_by": localStorage.getItem('Id'),
        "leave_name": holidayData.holiday_name,
        "leave_date": holidayData.start,
        // "description": this.holidayFormGroup.value.description,
        "start_date": moment().startOf('year').toDate(),
        "end_date": moment().endOf('year').toDate(),
        "timezone": zone,
        "leave_date_str": holidayData.start
      }
      // console.log(data);
      this.settingsService.createHoliday(data).subscribe(res => {
        if (res.map.statusMessage == "Success") {
          this.utilsService.openSnackBarAC("Holiday created successfully", "OK");
          // this.router.navigate(["/leave-tracker-settings"]);
        }
        else {
          this.utilsService.openSnackBarMC("Failed to create holiday", "OK");
        }

      }, (error) => {
        this.router.navigate(["/404"]);
        this.spinner.hide();
      })
      setTimeout(() => {
        this.spinner.hide();
        this.router.navigate(['/leave-tracker-settings']);

      }, 3000);
    }
    // setTimeout(() =>{
    // this.spinner.hide();
    // },2000);
  }
  // addExistingHoliday() {

  //   this.spinner.show();
  //   this.existingHolidayFormGroup.controls['leave_date'].enable();
  //   let holidayDate = this.existingHolidayFormGroup.value.leave_date;
  //   let zone = moment.tz.guess();
  //   let data: Object = {
  //     "org_id": localStorage.getItem("OrgId"),
  //     "created_by": localStorage.getItem('Id'),
  //     "leave_name": this.existingHolidayFormGroup.value.leave_name.holiday_name,
  //     "leave_date": this.existingHolidayFormGroup.value.leave_date,
  //     // "description": this.holidayFormGroup.value.description,
  //     "start_date": moment().startOf('year').toDate(),
  //     "end_date": moment().endOf('year').toDate(),
  //     "timezone": zone,
  //     "leave_date_str": holidayDate,

  //   }
  //   // console.log(data);
  //   this.settingsService.createHoliday(data).subscribe(data => {
  //     if (data.map.statusMessage == "Success") {
  //       this.utilsService.openSnackBarAC("Holiday created successfully", "OK");
  //       this.spinner.hide();
  //       this.router.navigate(["/leave-tracker-settings"]);
  //     }
  //     else {
  //       this.utilsService.openSnackBarMC("Failed to create holiday", "OK");
  //       this.spinner.hide();
  //     }
  //   })
  // }
  onGovLeaveDate(event: any) {
    this.govHolidayLeaveDate = false;
    let dateValue1 = event;
    let dateVal = new Date(dateValue1);
    let v1 = dateVal.getDate();
    let v2 = dateVal.getMonth();
    let v3 = dateVal.getFullYear();
    for (let j = 0; j < this.holidayLeaveDate.length; j++) {
      let govLeaveDate = new Date(this.holidayLeaveDate[j]);
      if (v1 == govLeaveDate.getDate() && v2 == govLeaveDate.getMonth() && v3 == govLeaveDate.getFullYear()) {
        this.govHolidayLeaveDate = true;
      }
    }
  }
}
