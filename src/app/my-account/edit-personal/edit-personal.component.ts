import { Component, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MatSelect } from '@angular/material/select';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import * as moment from 'moment-timezone';
import { NgxSpinnerService } from 'ngx-spinner';
import { ReplaySubject, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { SettingsService } from 'src/app/services/settings.service';
import { UtilService } from 'src/app/services/util.service';
import {errorMessage,numberMessage,validFormat} from '../../util/constants';

@Component({
  selector: 'app-edit-personal',
  templateUrl: './edit-personal.component.html',
  styleUrls: ['./edit-personal.component.less'],
})
export class EditPersonalComponent implements OnInit {
  requiredMessage = errorMessage;
  numberMessage = numberMessage;
  validFormat = validFormat;
  empId: any;
  dob: any;
  attachment: File = null;
  protected _onDestroy = new Subject<void>();
  today:any;

  constructor(
    private formBuilder: UntypedFormBuilder,
    private utilsService: UtilService,
    private router: Router,
    private settingsService: SettingsService,
    private domSanitizer: DomSanitizer,
    private spinner: NgxSpinnerService
  ) {
    this.today = new Date();
    console.log(this.today);
   }

  /** control for the selected project */
  public statusCtrl: UntypedFormControl = new UntypedFormControl("");

  /** control for the MatSelect filter keyword */
  public statusFilterCtrl: UntypedFormControl = new UntypedFormControl();

  /** list of head filtered by search keyword */
  public filteredstatus: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);

  /** control for the selected project */
  public genderCtrl: UntypedFormControl = new UntypedFormControl("");

  /** control for the MatSelect filter keyword */
  public genderFilterCtrl: UntypedFormControl = new UntypedFormControl();

  /** list of head filtered by search keyword */
  public filteredgender: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);

  @ViewChild('singleSelect', { static: true }) singleSelect: MatSelect;

  protected status: any[] = [
    { name: 'Single', id: 1 },
    { name: 'Married', id: 2 },
  ];
  protected gender: any[] = [
    { name: 'Male', id: 1 },
    { name: 'Female', id: 2 },
  ];

  FormGroup: UntypedFormGroup = this.formBuilder.group({
    fName: ['', [Validators.required]],
    lName: ['', [Validators.required]],
    dob: ['', [Validators.required]],
    blood_group: ['', [Validators.required,Validators.pattern(/(?!^\d+$)^.+$/)]],
    personal_mobile_number: ['', [Validators.required,Validators.pattern(/^([+]\d{2}[ ])?\d{10}$/)]],
    personal_email: ['', [Validators.required, Validators.email,Validators.pattern(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)]],
    present_address: ['', [Validators.required]],
    permanent_address: ['', [Validators.required]],

  })

  ngOnInit() {

    this.empId = localStorage.getItem('Id');
    const role = localStorage.getItem('Role');
    // console.log(this.empId, role);
    this.getEmpById();

    // load the initial bill list
    this.filteredstatus.next(this.status.slice());

    // listen for search field value changes
    this.statusFilterCtrl.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        this.filterstatus();
      });
    // load the initial bill list
    this.filteredgender.next(this.gender.slice());

    // listen for search field value changes
    this.genderFilterCtrl.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        this.filtergender();
      });
  }

  url :any= "";
  selectedFile: File = null;
  fileSize: number = 0;
  attachmentName: any;
  attachmentCopy: any;
  base64url: any;
  attachment_update: File = null;

  onSelectFile(event) {
    event.stopPropagation();
    if (event.target.files) {
      let reader = new FileReader();
      reader.readAsDataURL(event.target.files[0]);
      this.selectedFile = event.target.files[0];
      this.attachmentName = this.selectedFile.name;
      this.attachmentCopy = this.selectedFile;
      // this.isCreatefile = true;
      reader.onload = (e: any) => {
        this.url = e.target.result;

      };
      this.fileSize = this.selectedFile.size;
    }
    this.attachment = this.selectedFile;
  }
  cancel() {
    this.attachmentName = null;
    this.attachmentCopy = null;
    this.attachment = null;
  }


  protected filterstatus() {
    if (!this.status) {
      return;
    }
    // get the search keyword
    let search = this.statusFilterCtrl.value;
    if (!search) {
      this.filteredstatus.next(this.status.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
    // filter the client
    this.filteredstatus.next(
      this.status.filter(bill => bill.name.toLowerCase().indexOf(search) > -1)
    );
  }
  protected filtergender() {
    if (!this.gender) {
      return;
    }
    // get the search keyword
    let search = this.genderFilterCtrl.value;
    if (!search) {
      this.filteredgender.next(this.gender.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
    // filter the client
    this.filteredgender.next(
      this.gender.filter(gender => gender.name.toLowerCase().indexOf(search) > -1)
    );
  }

  getEmpById() {
    this.spinner.show();
    this.settingsService.getActiveEmpDetailsById(this.empId).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        let res = JSON.parse(data.map.data);
        this.FormGroup.get('fName').setValue(res.firstname);
        this.FormGroup.get('lName').setValue(res.lastname);
        this.dob = new Date(res.date_of_birth);
        this.FormGroup.get('dob').setValue(this.dob);
        this.FormGroup.get('blood_group').setValue(res.blood_group);
        this.statusCtrl.setValue(res.marital_status);
        this.genderCtrl.setValue(res.gender);
        this.FormGroup.get('personal_mobile_number').setValue(res.personal_mobile_number);
        this.FormGroup.get('personal_email').setValue(res.personal_email);
        this.FormGroup.get('present_address').setValue(res.present_address);
        this.FormGroup.get('permanent_address').setValue(res.permanent_address);

        if (res.profile_image != undefined) {
          let stringArray = new Uint8Array(res.profile_image);
          const STRING_CHAR = stringArray.reduce((data, byte) => {
            return data + String.fromCharCode(byte);
          }, '');
          let base64String = btoa(STRING_CHAR);
          const imageName = res.firstname + " " + res.lastname;
          const imageBlob = this.dataURItoBlob(base64String);
          const imageFile = new File([imageBlob], imageName, { type: 'image/png,image/jpeg,image/jpg' });
          this.url = this.domSanitizer.bypassSecurityTrustUrl("data:image/jpeg;base64," + base64String);
          this.attachmentName = imageFile.name;
          this.attachmentCopy = imageFile;
          this.attachment = imageFile;
        }
        this.spinner.hide();
      }
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


  updateDetails() {
    this.spinner.show();
    let zone = moment.tz.guess();
    // let formData: any = new FormData();
    let data: Object = {
      "id": this.empId,
      "date_of_birth": this.FormGroup.value.dob,
      "marital_status": this.statusCtrl.value,
      "blood_group": this.FormGroup.value.blood_group,
      "gender": this.genderCtrl.value,
      "personal_mobile_number": this.FormGroup.value.personal_mobile_number,
      "personal_email": this.FormGroup.value.personal_email,
      "present_address": this.FormGroup.value.present_address,
      "permanent_address": this.FormGroup.value.permanent_address,
      "timezone" :zone
    }
    // formData.append("data", JSON.stringify(data));
    // formData.append("employee_photo", this.attachment);
    this.settingsService.updateEmployeePersonalDetails(data).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        this.utilsService.openSnackBarAC("Personal details updated successfully", "OK");
        setTimeout(() => {
          this.router.navigate(["/my-profile"]);
        }, 2000);
      }
      else {
        this.utilsService.openSnackBarMC("Failed to update details", "OK");
      }
      this.spinner.hide();
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
    })

  }
}

