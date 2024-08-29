import { Component, OnInit } from '@angular/core';
import { UntypedFormArray, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ReplaySubject, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { IntegrationsService } from 'src/app/services/general-components/integrations/integrations.service';
import { UtilService } from 'src/app/services/util.service';
import { DemoVideoComponent } from '../demo-video/demo-video.component';
import { IntegrationDocumentationComponent } from '../integration-documentation/integration-documentation.component';
import {errorMessage,validFormat} from '../../../util/constants';
@Component({
  selector: 'app-whatsapp-form',
  templateUrl: './whatsapp-form.component.html',
  styleUrls: ['./whatsapp-form.component.less']
})
export class WhatsappFormComponent implements OnInit {
  requiredMessage = errorMessage;
  validMessage = validFormat;
  moduleName: string;

  protected countryCode: any[] = [
    { country: "Afghanistan", code: "93", max: 9 }, { country: "Albania", code: "355", max: 8 },
    { country: "American Samoa", code: "1", max: 10 }, { country: "Algeria", code: "213", max: 8 },
    { country: "Andorra", code: "376", max: 6 }, { country: "244 - Angola", code: "244", max: 9 },
    { country: "Anguilla", code: "1", max: 10 }, { country: "Antigua and Barbuda", code: "1", max: 10 },
    { country: "Argentina", code: "54", max: 10 }, { country: "Armenia", code: "374", max: 8 },
    { country: "Aruba", code: "297", max: 7 }, { country: "Australia", code: "61", max: 9 },
    { country: "Austria", code: "43", max: 10 }, { country: "Azerbaijan", code: "994", max: 9 },
    { country: "Bahamas", code: "1", max: 10 }, { country: "Bahrain", code: "973", max: 8 },
    { country: "Bangladesh", code: "880", max: 8 }, { country: "Barbados", code: "1", max: 10 },
    { country: "Belarus", code: "375", max: 9 }, { country: "Belgium", code: "32", max: 8 },
    { country: "Belize", code: "501", max: 7 }, { country: "Benin", code: "229", max: 8 },
    { country: "Bermuda", code: "1", max: 10 }, { country: "Bhutan", code: "975", max: 7 },
    { country: "Bolivia", code: "591", max: 8 }, { country: "Bosnia and Herzegovina", code: "387", max: 8 },
    { country: "Botswana", code: "267", max: 7 }, { country: "Brazil", code: "55", max: 10 },
    { country: "British Indian Ocean Territory", code: "246", max: 7 }, { country: "British Virgin Islands", code: "1", max: 10 },
    { country: "Brunei", code: "673", max: 7 }, { country: "Bulgaria", code: "359", max: 7 },
    { country: "Burkina", code: "226", max: 8 }, { country: "Burundi", code: "257", max: 8 },
    { country: "Cambodia", code: "855", max: 8 }, { country: "Cameroon", code: "237", max: 9 },
    { country: "Canada", code: "1", max: 10 }, { country: "Cape Verde", code: "238", max: 7 },
    { country: "Caribbean Netherlands", code: "599", max: 7 }, { country: "Cayman Islands", code: "1", max: 10 },
    { country: "Central African Republic", code: "236", max: 8 }, { country: "Chad", code: "235", max: 8 },
    { country: "Chile", code: "56", max: 9 }, { country: "China", code: "86", max: 10 },
    { country: "Christmas Island", code: "61", max: 9 }, { country: "countryCocos Islands", code: "61", max: 9 },
    { country: "Colombia", code: "57", max: 8 }, { country: "Comoros", code: "269", max: 7 },
    { country: "Congo(DRC)", code: "243", max: 7 }, { country: "Congo (Congo-Brazzaville)", code: "242", max: 10 },
    { country: "Cook Islands", code: "682", max: 5 }, { country: "Costa Rica", code: "506", max: 8 },
    { country: "Côte d’Ivoire", code: "225", max: 8 }, { country: "Croatia (Hrvatska)", code: "385", max: 8 },
    { country: "Cuba", code: "53", max: 8 }, { country: "Curaçao", code: "599", max: 8 },
    { country: "Cyprus", code: "357", max: 8 }, { country: "Czech Republic", code: "420", max: 9 },
    { country: "Denmark", code: "45", max: 8 }, { country: "Djibouti", code: "253", max: 8 },
    { country: "Dominica", code: "1767", max: 10 }, { country: "Dominican", code: "1", max: 10 },
    { country: "Ecuador", code: "593", max: 8 }, { country: "Egypt", code: "20" },
    { country: "El Salvador", code: "503" }, { country: "Equatorial", code: "240" },
    { country: "Eritrea", code: "291" }, { country: "Estonia", code: "372" },
    { country: "Ethiopia", code: "251" }, { country: "Falkland Islands", code: "500" },
    { country: "Faroe Islands", code: "298" }, { country: "Fiji", code: "679" },
    { country: "Finland", code: "358" }, { country: "France", code: "33" },
    { country: "French", code: "594" }, { country: "French Polynesia", code: "689" },
    { country: "Gabon", code: "241" }, { country: "Gambia", code: "220" },
    { country: "Georgia", code: "995" }, { country: "Germany", code: "49" },
    { country: "Ghana", code: "233" }, { country: "Gibraltar", code: "350" },
    { country: "Greece", code: "30" }, { country: "Greenland", code: "299" },
    { country: "Grenada", code: "1473" }, { country: "Guadeloupe", code: "590" },
    { country: "Guam", code: "1" }, { country: "Guatemala", code: "502" },
    { country: "Guernsey", code: "44" }, { country: "Guinea", code: "224" },
    { country: "Guinea-Bissau", code: "245" }, { country: "Guyana", code: "592" },
    { country: "Haiti", code: "509" }, { country: "Honduras", code: "504" },
    { country: "Hong Kong ", code: "852" }, { country: "Hungary", code: "36" },
    { country: "Iceland", code: "354" }, { country: "India", code: "91" },
    { country: "Indonesia", code: "62" }, { country: "Iran", code: "98" },
    { country: "Iraq", code: "964" }, { country: "Ireland", code: "353" },
    { country: "Isle of Man", code: "44" }, { country: "Israel", code: "972" },
    { country: "Italy", code: "39" }, { country: "Jamaica", code: "1" },
    { country: "Japan", code: "81" }, { country: "Jersey", code: "44" },
    { country: "Jordan", code: "962" }, { country: "Kazakhstan", code: "7" },
    { country: "Kenya", code: "254" }, { country: "Kiribati", code: "686" },
    { country: "Kosovo", code: "383" }, { country: "Kuwait", code: "965" },
    { country: "Kyrgyzstan", code: "996" }, { country: "Laos", code: "856" },
    { country: "Latvia", code: "371" }, { country: "Lebanon", code: "961" },
    { country: "Lesotho", code: "266" }, { country: "Liberia", code: "231" },
    { country: "Libya", code: "218" }, { country: "Liechtenstein", code: "423" },
    { country: "Lithuania", code: "370" }, { country: "Luxembourg", code: "352" },
    { country: "Macau", code: "853" }, { country: "Macedonia", code: "389" },
    { country: "Madagascar", code: "261" }, { country: "Malawi", code: "265" },
    { country: "Malaysia", code: "60" }, { country: "Maldives", code: "960" },
    { country: "Mali", code: "223", }, { country: "Malta", code: "356" },
    { country: "Marshall Islands", code: "692" }, { country: "Martinique", code: "596" },
    { country: "Mauritania", code: "222" }, { country: "Mauritius", code: "230" },
    { country: "Mayotte", code: "262" }, { country: "Mexico", code: "52" },
    { country: "Micronesia", code: "691" }, { country: "Moldova", code: "373" },
    { country: "Monaco", code: "377" }, { country: "Mongolia", code: "976" },
    { country: "Montenegro", code: "382" }, { country: "Montserrat", code: "1" },
    { country: "Morocco", code: "212" }, { country: "Mozambique", code: "258" },
    { country: "Myanmar", code: "95" }, { country: "Namibia", code: "264" },
    { country: "Nauru", code: "674" }, { country: "Nepal", code: "977" },
    { country: "Netherlands", code: "31" }, { country: "New Caledonia", code: "687" },
    { country: "New Zealand", code: "64" }, { country: "Nicaragua", code: "505" },
    { country: "Niger", code: "227" }, { country: "Nigeria", code: "234" },
    { country: "Niue", code: "683" }, { country: "Norfolk Island", code: "672" },
    { country: "North Korea", code: "850" }, { country: "Northern Mariana Islands", code: "1670" },
    { country: "Norway", code: "47" }, { country: "Oman", code: "968" },
    { country: "Pakistan", code: "92" }, { country: "Palau", code: "680" },
    { country: "Palestine", code: "970" }, { country: "Panama", code: "507" },
    { country: "Papua New Guinea", code: "675" }, { country: "Paraguay", code: "595" },
    { country: "Peru", code: "51" }, { country: "Philippines", code: "63" },
    { country: "Poland", code: "48" }, { country: "Portugal", code: "351" },
    { country: "Puerto Rico", code: "1" }, { country: "Qatar", code: "974" },
    { country: "Réunion", code: "262" }, { country: "Romania", code: "40" },
    { country: "Russia", code: "7" }, { country: "Rwanda", code: "250" },
    { country: "Saint Barthélemy", code: "590" }, { country: "Saint Helena", code: "290" },
    { country: "Saint Kitts and Nevis", code: "1869" }, { country: "Saint Lucia", code: "1" },
    { country: "Saint Martin ", code: "590" }, { country: "Saint Pierre and Miquelon", code: "508" },
    { country: "Saint Vincent and the Grenadines", code: "1" }, { country: "Samoa", code: "685" },
    { country: "San Marino", code: "378" }, { country: "São Tomé and Príncipe", code: "239" },
    { country: "Saudi Arabia", code: "966" }, { country: "Senegal", code: "221" },
    { country: "Serbia", code: "381" }, { country: "Seychelles", code: "248" },
    { country: "Sierra Leone", code: "232" }, { country: "Singapore", code: "65" },
    { country: "Sint Maarten", code: "1" }, { country: "Slovakia", code: "421" },
    { country: "Slovenia", code: "386" }, { country: "Solomon Islands", code: "677" },
    { country: "Somalia", code: "252" }, { country: "South Africa", code: "27" },
    { country: "South Korea", code: "82" }, { country: "South Sudan", code: "211" },
    { country: "Spain", code: "34" }, { country: "Sri Lanka", code: "94" },
    { country: "Sudan", code: "249" }, { country: "Suriname", code: "597" },
    { country: "Svalbard and Jan Mayen", code: "47" }, { country: "Swaziland", code: "268" },
    { country: "Sweden", code: "46" }, { country: "Switzerland", code: "41" },
    { country: "Syria", code: "963" }, { country: "Taiwan", code: "886" },
    { country: "Tajikistan", code: "992" }, { country: "Tanzania", code: "255" },
    { country: "Thailand", code: "66" }, { country: "Timor-Leste", code: "670" },
    { country: "Togo", code: "228" }, { country: "Tokelau", code: "690" },
    { country: "Tonga", code: "676" }, { country: "Trinidad and Tobago", code: "1" },
    { country: "Tunisia", code: "216" }, { country: "Turkey", code: "90" },
    { country: "Turkmenistan", code: "993" }, { country: "Turks and Caicos Islands", code: "1649" },
    { country: "Tuvalu", code: "688" }, { country: "U.S. Virgin Islands", code: "1" },
    { country: "Uganda", code: "256" }, { country: "Ukraine", code: "380" },
    { country: "United Arab Emirates", code: "971" }, { country: "United Kingdom", code: "44" },
    { country: "United States", code: "1" }, { country: "Uruguay", code: "598" },
    { country: "Uzbekistan", code: "998" }, { country: "Vanuatu", code: "678" },
    { country: "Vatican City", code: "39" }, { country: "Venezuela", code: "58" },
    { country: "Vietnam", code: "84" }, { country: "Wallis and Futuna", code: "681" },
    { country: "Western Sahara", code: "212" }, { country: "Yemen", code: "967" },
    { country: "Zambia", code: "260" }, { country: "Zimbabwe", code: "263" },
    { country: "Åland Islands", code: "358" }
  ]
  countryCodeList: any = [];

  constructor(
    private spinner: NgxSpinnerService,
    private formBuilder: UntypedFormBuilder,
    private utilsService: UtilService,
    public matDialog: MatDialog,
    public integrationsService: IntegrationsService,
    private activatedRoute: ActivatedRoute,
    public router: Router,
  ) { }

  /** Subject that emits when the component has been destroyed. */
  protected _onDestroy = new Subject<void>();

  public countryFilterCtrl: UntypedFormControl = new UntypedFormControl();

  /** list of bill filtered by search keyword */
  public filteredCountry: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);

  whatsappIntegrationFormGroup: UntypedFormGroup = this.formBuilder.group({
    // msg_section: ['', [Validators.required]],
    url: ['', [Validators.required,Validators.pattern('(https?://)?([\\da-z.-]+)\\.([a-z.]{2,6})[/\\w .-]*/?')]],
    auth_token: ['', [Validators.required]],
    numbers: this.formBuilder.array([]), // form array used for get numbers
  })
  numbers(): UntypedFormArray {
    return this.whatsappIntegrationFormGroup.get('numbers') as UntypedFormArray;
  }

  numberOnly(event): boolean {
    const charCode = (event.which) ? event.which : event.keyCode;
      if (charCode > 31 && (charCode < 48 || charCode > 57)) {
         return false;
      }
      return true;
  
  }

  getControls() {
    return (this.whatsappIntegrationFormGroup.get('numbers') as UntypedFormArray).controls;
  }

  newNumbers(): UntypedFormGroup {
    return this.formBuilder.group({
      code: ['', [Validators.required]],
      number: ['', [Validators.required, Validators.pattern("^[0-9]*$")]], //,Validators.maxLength(12)
    })
  }

  addNewNumber() {
    this.numbers().push(this.newNumbers());
  }

  removeNumber(index) {
    // console.log(this.whatsappIntegrationFormGroup.get('numbers').get(index).get('number').value);
    // if(this.numbers().at(index).valid){console.log("True");}
    this.numbers().removeAt(index);
  }
  moduleDetails: any;
  integrationId: any;
  displayList = [
    { name: 'Day Planner', description: 'While submit the tasks, you will get notification to the given below number in whatsapp!', key: 'day-planner', reason: 'create-tasks', back_btn_tooltip_msg: "Back To Day Planner Settings" },
    { name: 'Leave Tracker', description: 'While approve or reject the leave request, you will get notification to the given below number in whatsapp!', key: 'leave-tracker', reason: 'approve-leave', back_btn_tooltip_msg: "Back To Leave Tracker Settings" },
    { name: 'Attendance', description: 'While users give attendance actions, you will get notification to the given below number in whatsapp!', key: 'attendance', reason: 'check-in', back_btn_tooltip_msg: "Back To Attendance Settings" }
  ]
  header:string;
  headerModule:string;
  addbtn:boolean = true;
  ngOnInit() {
    this.moduleName = localStorage.getItem('integrationModuleName');
    this.moduleDetails = this.displayList.find(d => d.key == this.moduleName);
    this.header = "Add";
    this.addbtn = true;
    // this.getslackDetails();
    this.integrationId = this.activatedRoute.snapshot.params.id;
    if (this.integrationId) {
      this.header = "Edit";
      this.addbtn = false;
      this.setWhatsappIntegrationFormValue();
    }
    else{
      this.viewWhatsappVideo();
      this.addNewNumber();
    }
    if(this.moduleName == "attendance"){
      this.headerModule = "Attendance";
    } else {
      this.headerModule = "Leave Tracker";
    }
    this.selectCountry();

    // load the country names
    this.filteredCountry.next(this.countryCodeList.slice());

    // listen for search field value changes
    this.countryFilterCtrl.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        this.filtercountry();
      });
  }

  selectCountry() {
    for (let j = 0; j < this.countryCode.length; j++) {
      this.countryCodeList.push({ "id": this.countryCode[j], "countrycode": this.countryCode[j].code + " - " + this.countryCode[j].country, "code": this.countryCode[j].code });
    }
  }

  CountrySelectEventOption(data) {
    this.whatsappIntegrationFormGroup.get('countrycode1').setValue(data);
  }

  protected filtercountry() {
    if (!this.countryCodeList) {
      return;
    }
    // get the search keyword
    let search = this.countryFilterCtrl.value;
    if (!search) {
      this.filteredCountry.next(this.countryCodeList.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
    // filter the client
    this.filteredCountry.next(
      this.countryCodeList.filter(data => data.countrycode.toLowerCase().indexOf(search) > -1)
    );
  }

  backToSetting() {
    // if (this.moduleName == 'day-planner') {
    //   this.router.navigate(['/dp-settings']);
    // } else if (this.moduleName == 'leave-tracker') {
    //   this.router.navigate(['/leave-tracker-settings']);
    // } else if (this.moduleName == 'attendance') {
    //   this.router.navigate(['/attendance-settings']);
    // }
    // localStorage.removeItem('integrationModuleName');

    //********* Redirecting - By using if else method */
    if(localStorage.getItem("fromWhatsappIntegration")=="true"){
      this.router.navigate(['/manage-whatsapp']);
      localStorage.removeItem('fromWhatsappIntegration');
    }
    else if (this.moduleName == 'day-planner') {
      this.router.navigate(['/dp-settings']);
    } else if (this.moduleName == 'leave-tracker') {
      this.router.navigate(['/leave-tracker-settings']);
    } else if (this.moduleName == 'attendance') {
      this.router.navigate(['/attendance-settings']);
    }
    localStorage.removeItem('integrationModuleName');

  }

  addWhatsappIntegration() {
    this.spinner.show();
    let data: Object = {
      "org_id": localStorage.getItem("OrgId"),
      "created_by": localStorage.getItem('Id'),
      "app_name": "whatsapp",
      "url": this.whatsappIntegrationFormGroup.value.url,
      "whatsapp_access_token": this.whatsappIntegrationFormGroup.value.auth_token,
      "numbers": JSON.stringify(this.whatsappIntegrationFormGroup.get('numbers').value),
      "module_name": this.moduleDetails.key,
      "reason": this.whatsappIntegrationFormGroup.value.msg_section,
    }
    this.integrationsService.createSlackIntegration(data).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        this.utilsService.openSnackBarAC("Whatsapp integration details added successfully", "OK");
        this.backToSetting();
        this.numbers().clear();
        this.spinner.hide();
      }
      else {
        this.utilsService.openSnackBarMC("Failed to create integration details. Please verify the integration", "OK");
        this.spinner.hide();
      }
    })
  }


  updateWhatsappIntegration() {
    this.spinner.show();

    let data: Object = {
      "id": this.integrationId,
      "org_id": localStorage.getItem("OrgId"),
      "created_by": localStorage.getItem('Id'),
      "app_name": "whatsapp",
      "url": this.whatsappIntegrationFormGroup.value.url,
      "whatsapp_access_token": this.whatsappIntegrationFormGroup.value.auth_token,
      "numbers": JSON.stringify(this.whatsappIntegrationFormGroup.get('numbers').value),
      "module_name": this.moduleDetails.key,
      "reason": this.whatsappIntegrationFormGroup.value.msg_section,

    }
    this.integrationsService.updateSlackIntegration(data).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        this.utilsService.openSnackBarAC("Whatsapp integration details updated successfully", "OK");
        this.backToSetting();
        this.numbers().clear();
        this.spinner.hide();
      } else {
        this.utilsService.openSnackBarMC("Failed to update integration details. Please verify the integration", "OK");
        this.spinner.hide();
      }
    })
  }

  setWhatsappIntegrationFormValue() {
    this.spinner.show();
    this.integrationsService.getIntegrationById(this.integrationId).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        let response = JSON.parse(data.map.data);
        let tempData = JSON.parse(response.numbers);
        // this.whatsappIntegrationFormGroup.get('msg_section').setValue(response.reason);
        this.whatsappIntegrationFormGroup.get('url').setValue(response.url);
        this.whatsappIntegrationFormGroup.get('auth_token').setValue(response.whatsapp_access_token);
        for(let i=0; i<tempData.length; i++) {
          this.addNewNumber();
          this.numbers().at(i).get('code').setValue(tempData[i].code);
          this.numbers().at(i).get('number').setValue(tempData[i].number);
        }
      }
      this.spinner.hide();
    })
  }

  //to open whatsapp integration documention
  documentationDialog(){
    let screenWidth = screen.availWidth;
      if (screenWidth <= 750) {
        const dialogRef = this.matDialog.open(IntegrationDocumentationComponent, {
          width: '90%',
          panelClass: 'custom-viewdialogstyle', data: "Whatsapp" ,
        });
      }else {
        const dialogRef = this.matDialog.open(IntegrationDocumentationComponent, {
          width: '70%',
          panelClass: 'custom-viewdialogstyle', data: "Whatsapp" ,
        });
      }
    }
//view the whatsapp integration demo video
viewWhatsappVideo(){
  let screenWidth = screen.availWidth;
  if (screenWidth <= 750) {
      const dialogRef = this.matDialog.open(DemoVideoComponent, {
        width: '90%',
        // height: '75%',
        panelClass: 'custom-viewdialogstyle'
      });
  }else {
      const dialogRef = this.matDialog.open(DemoVideoComponent, {
        width: '50%',
        // height: '75%',
        panelClass: 'custom-viewdialogstyle'
      });
  }
}
  
}
