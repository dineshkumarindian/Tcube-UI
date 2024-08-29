import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormArray, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators, AbstractControl } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { OfferLetterService } from '../../../services/offer-letter.service';
import { UtilService } from '../../../services/util.service';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { MatDialog } from '@angular/material/dialog';
import { ViewOfferComponent } from '../view-offer/view-offer.component';
import { PreviewOfferComponent } from '../preview-offer/preview-offer.component';
import { SettingsService } from '../../../services/settings.service';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { CdkAccordionModule } from '@angular/cdk/accordion';
// import { ThrowStmt } from '@angular/compiler';
// import * as moment from 'moment';
import { errorMessage, characterLength, invalidFormat } from '../../../util/constants';
var CKEDITOR: any;
@Component({
  selector: 'app-add-offer',
  templateUrl: './add-offer.component.html',
  styleUrls: ['./add-offer.component.less']
})
export class AddOfferComponent implements OnInit {
  requiredMessage = errorMessage;
  characterLength = characterLength;
  invalidFormatMsg =  invalidFormat;
  annexure_validation: boolean = true;
  forms = ['Add-form', 'Terms_conditions'];
  maxDate = new Date();
  expandedIndex = 0;
  offerForm: UntypedFormGroup;
  name = new UntypedFormControl('', [Validators.required,Validators.pattern('^[a-zA-Z ]+$')]);
  dob = new UntypedFormControl('', [Validators.required]);
  // doj = new FormControl('', [Validators.required]);
  // designation = new FormControl('', [Validators.required]);
  // location = new FormControl('', [Validators.required]);
  companyName = new UntypedFormControl('', [Validators.required]);
  companyLink = new UntypedFormControl('', [Validators.required]);
  companyAddress = new UntypedFormControl('', [Validators.required]);
  companyLogo = new UntypedFormControl('', [Validators.required]);
  signature = new UntypedFormControl('', [Validators.required]);
  signatureName = new UntypedFormControl('', [Validators.required]);
  signatureRole = new UntypedFormControl('', [Validators.required]);
  description = new UntypedFormControl('', [Validators.required, Validators.maxLength(5000)]);
  letterTitle = new UntypedFormControl('', [Validators.required]);
  letterTitle1 = new UntypedFormControl('', [Validators.required]);
  description1 = new UntypedFormControl('', [Validators.required, Validators.maxLength(3000)]);
  isOfferLetterActiveId: boolean = false;
  component: any;
  offerId: any;
  fileString: any;
  fileEncode: any;
  url: any;
  msg: any;
  urlSign: any;
  msgSign: any;
  modifiedTime: any;
  @Output()
  open: EventEmitter<any> = new EventEmitter();
  Editor = ClassicEditor;
  // ckconfig = {};

  public editorData = '<p>Hello, world!</p>';
  ckconfig = {};
  public model = {
    editorData: '<p>Dear <b>Xxxx</b>,</p>'
  };

  annexure_details: Array<any> = [
    {
      'letterTitle1': '',
      'description1': ''
    }
  ];
  newAttribute: any = { 'letterTitle1': '', 'description1': '' };

  public onReady(editor: any) {

    editor.ui.getEditableElement().parentElement.insertBefore(
      editor.ui.view.toolbar.element,
      editor.ui.getEditableElement()
    );
  }

  constructor(private router: Router, public activeRoute: ActivatedRoute, private formBuilder: UntypedFormBuilder, private spinner: NgxSpinnerService, private utilService: UtilService,
    private offerService: OfferLetterService, public dialog: MatDialog, private http: HttpClient, private settingsService: SettingsService,) {

  }

  Space(event: any) {
    if (event.target.selectionStart === 0 && event.code === "Space") {
      event.preventDefault();
    }
  }

  LtSpace(event: any) {
    if (event.target.selectionStart === 0 && event.code === "Space") {
      event.preventDefault();
    }
  }

  CnSpace(event: any) {
    if (event.target.selectionStart === 0 && event.code === "Space") {
      event.preventDefault();
    }
  }

  CaSpace(event: any) {
    if (event.target.selectionStart === 0 && event.code === "Space") {
      event.preventDefault();
    }
  }

  CLSpace(event: any) {
    if (event.target.selectionStart === 0 && event.code === "Space") {
      event.preventDefault();
    }
  }

  NsSpace(event: any) {
    if (event.target.selectionStart === 0 && event.code === "Space") {
      event.preventDefault();
    }
  }

  SrSpace(event: any) {
    if (event.target.selectionStart === 0 && event.code === "Space") {
      event.preventDefault();
    }
  }

  LTSpace(event: any) {
    if (event.target.selectionStart === 0 && event.code === "Space") {
      event.preventDefault();
    }
  }

  ngOnInit() {
    this.offerForm = new UntypedFormGroup({
      name: this.name,
      dob: this.dob,
      // doj: this.doj,
      // designation: this.designation,
      description: this.description,
      // location: this.location,
      companyLogo: this.companyLogo,
      companyName: this.companyName,
      companyLink: this.companyLink,
      companyAddress: this.companyAddress,
      signature: this.signature,
      signatureName: this.signatureName,
      signatureRole: this.signatureRole,
      letterTitle: this.letterTitle,
      letterTitle1: this.letterTitle1,
      description1: this.description1,
    })



    this.offerId = this.activeRoute.snapshot.params.id;
    if (this.offerId) {
      this.formValue();
      this.isOfferLetterActiveId = true;
    } else {
      this.isOfferLetterActiveId = false;
    }
    // this.getDesignationDetailsByOrgId();

  }
  // dummyDesignation: any[] = [];
  // getDesignationDetailsByOrgId() {
  //   const id = localStorage.getItem('OrgId');
  //   this.settingsService.getActiveDesignationDetailsByOrgId(id).subscribe(data => {
  //     let response = JSON.parse(data.map.data);
  //     //  this.dummyDesignation =response;
  //     for (let i = 0; i < response.length; i++) {
  //       this.dummyDesignation.push({ "name": response[i].designation });
  //     }
  //   })
  // }

  attachmentCopy: any;
  selectedFile: File = null;
  fileSize: number = 0;
  base64url: any;
  attachment_update: File = null;
  attachmentName: any;
  attachment: File = null;

  onFileChanged(event: any) {
    if (!(event.target.files[0] || event.target.files[0].length == 0)) {
      this.msg = "you must select an Image";
      return;
    }
    var mimeType = event.target.files[0].type;
    if (mimeType.match(/image\/*/) == null) {
      this.msg = "Accepts only jpg,png image format";
    } else {
      if (event.target.files[0].size <= 100000) {
        var reader = new FileReader();
        reader.readAsDataURL(event.target.files[0]);
        this.selectedFile = event.target.files[0];
        this.attachmentName = this.selectedFile.name;
        this.attachmentCopy = this.selectedFile;
        // this.selectedFile = event.target.files[0];
        reader.onload = (_event) => {
          this.msg = "";
          this.url = reader.result;
        }
        this.fileSize = this.selectedFile.size;
        this.attachment = this.selectedFile;
      } else {
        this.msg = "Image size should be accepted maximum of 100KB";
      }
    }
  }

  attachmentCopySign: any;
  selectedFileSign: File = null;
  fileSizeSign: number = 0;
  base64urlSign: any;
  attachment_updateSign: File = null;
  attachmentNameSign: any;
  attachmentSign: File = null;


  onFileChangedSign(event: any) {
    let imageFile: any;
    if (!(event.target.files[0] || event.target.files[0].length == 0)) {
      this.msgSign = "you must select an Image";
      return;
    }
    var mimeType = event.target.files[0].type;
    if (mimeType.match(/image\/*/) == null) {
      this.msgSign = "Accepts only jpg,png image format";
    } else {
      if (event.target.files[0].size <= 100000) {
        var reader = new FileReader();
        reader.readAsDataURL(event.target.files[0]);
        this.selectedFileSign = event.target.files[0];
        this.attachmentNameSign = this.selectedFileSign.name;
        this.attachmentCopySign = this.selectedFileSign;
        reader.onload = (_event) => {
          this.msgSign = "";
          this.urlSign = reader.result;
        }
        this.fileSizeSign = this.selectedFileSign.size;
        this.attachmentSign = this.selectedFileSign;
      }
      else {
        this.msgSign = "Image size should be accepted maximum of 100KB";
      }
    }
  }
  cancel() {
    this.attachmentName = null;
    this.attachmentCopy = null;
    this.attachment = null;
    this.url = null;
  }
  onCancelSign() {
    this.attachmentNameSign = null;
    this.attachmentCopySign = null;
    this.attachmentSign = null;
    this.urlSign = null;
  }
  position: any;
  joinDate: any;
  updateId: any;
  dateofbirth: any;
  workingPlace: any;
  formValue() {
    this.spinner.show();
    this.offerService.getOfferLetterByIdDetails(this.offerId).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        setTimeout(() => {
          /** spinner ends after 1 second */
          this.spinner.hide();
        }, 1000);
        let offerdata: any = JSON.parse(data.map.data);
        this.modifiedTime = offerdata.modified_time;
        this.annexure_details = JSON.parse(offerdata.annexure_details);
        this.updateId = offerdata.id;
        this.position = offerdata.designation;
        // this.workingPlace = offerdata.location;
        // this.joinDate = offerdata.doj;
        // let doj = new Date(offerdata.doj);
        this.dateofbirth = offerdata.dob;
        let dob = new Date(offerdata.dob);
        this.offerForm.get('name').setValue(offerdata.name);
        // this.offerForm.get('doj').setValue(doj);
        this.offerForm.get('dob').setValue(dob);
        // this.designation.setValue(this.position);
        // this.location.setValue(this.workingPlace);
        this.offerForm.get('companyName').setValue(offerdata.companyName);
        this.offerForm.get('companyLink').setValue(offerdata.companyLink);
        this.offerForm.get('companyAddress').setValue(offerdata.companyAddress);
        this.offerForm.get('signatureName').setValue(offerdata.signatureName);
        this.offerForm.get('signatureRole').setValue(offerdata.signatureRole);
        this.offerForm.get('description').setValue(offerdata.description);
        this.offerForm.get('letterTitle').setValue(offerdata.letterTitle);
        // this.offerForm.get('annexure_details').setValue(offerdata.annexure_details);
        // this.offerForm.get('description1').setValue(offerdata.description1);
        // this.offerForm.get('letterTitle1').setValue(offerdata.letterTitle1);
        if (offerdata.companyLogo != undefined) {
          let stringArray = new Uint8Array(offerdata.companyLogo);
          const STRING_CHAR = stringArray.reduce((data, byte) => {
            return data + String.fromCharCode(byte);
          }, '');
          let base64String = btoa(STRING_CHAR);
          const imageName = offerdata.name;
          const imageBlob = this.dataURItoBlob(base64String);
          const imageFile = new File([imageBlob], imageName, { type: 'image/png,image/jpeg,image/jpg' });
          // this.url = this.domSanitizer.bypassSecurityTrustUrl(base64String);
          this.url = offerdata.companyLogo;
          // "data:image/jpeg;base64," + 
          this.attachmentName = offerdata.logoFileName;
          this.attachmentCopy = imageFile;
          this.attachment = imageFile;
        }
        if (offerdata.signature != undefined) {
          let stringArraySign = new Uint8Array(offerdata.signature);
          const STRING_CHARSIGN = stringArraySign.reduce((data, byte) => {
            return data + String.fromCharCode(byte);
          }, '');
          let base64String = btoa(STRING_CHARSIGN);
          const imageNameSign = offerdata.name;
          const imageBlobSign = this.dataURItoBlob(base64String);
          const imageFileSign = new File([imageBlobSign], imageNameSign, { type: 'image/png,image/jpeg,image/jpg' })
          this.urlSign = offerdata.signature;
          this.attachmentNameSign = offerdata.signFileName;
          this.attachmentCopySign = imageFileSign;
          this.attachmentSign = imageFileSign;
        }
        this.spinner.hide();
      } else {
        // this.spinner.hide();
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
    const blob = new Blob([int8Array], { type: 'image/png,image/jpeg,image/jpg' });
    return blob;
  }

  openDialog() {
    this.spinner.show();
    setTimeout(() => {
      this.spinner.hide();
      let maxLengthReached = false;
      this.annexure_details.forEach(value => {
        if (value.description1.length > 3000) {
          maxLengthReached = true;
        }
      });
      if (maxLengthReached) return;
      const dialogRef = this.dialog.open(ViewOfferComponent, {
        width: '1200px',
        height: '500px',
        autoFocus: false,
        data: {
          activateId: this.isOfferLetterActiveId,
          name: this.offerForm.value.name, dob: this.offerForm.value.dob, description: this.offerForm.value.description, modified_time: new Date(),
          // doj: this.offerForm.value.doj, designation: this.offerForm.value.designation, location: this.offerForm.value.location,
          companyLogo: this.url, companyName: this.offerForm.value.companyName, companyAddress: this.offerForm.value.companyAddress, companyLink: this.offerForm.value.companyLink,
          signatureName: this.offerForm.value.signatureName, signature: this.urlSign, signatureRole: this.offerForm.value.signatureRole, letterTitle: this.offerForm.value.letterTitle,
          logoFileName: this.attachmentName, signFileName: this.attachmentNameSign, annexure_details: this.annexure_details
        }
      });

      dialogRef.afterClosed().subscribe(result => {
      })
    }, 500);

  }
  openDialogData() {
    this.spinner.show();
    setTimeout(() => {
      this.spinner.hide();
      let maxLengthReached = false;
      this.annexure_details.forEach(value => {
        if (value.description1.length > 3000) {
          maxLengthReached = true;
        }
      });
      if (maxLengthReached) return;
      const dialogRef = this.dialog.open(ViewOfferComponent, {
        width: '1200px',
        height: '500px',
        autoFocus: false,
        data: {
          activateId: this.isOfferLetterActiveId, id: this.updateId,
          name: this.offerForm.value.name, dob: this.offerForm.value.dob, description: this.offerForm.value.description, modified_time: new Date(),
          // doj: this.offerForm.value.doj, designation: this.offerForm.value.designation, location: this.offerForm.value.location,
          companyLogo: this.url, companyName: this.offerForm.value.companyName, companyAddress: this.offerForm.value.companyAddress,
          companyLink: this.offerForm.value.companyLink, signatureName: this.offerForm.value.signatureName, signatureRole: this.offerForm.value.signatureRole, signature: this.urlSign,
          logoFileName: this.attachmentName, annexure_details: this.annexure_details, signFileName: this.attachmentNameSign,
          letterTitle: this.offerForm.value.letterTitle
        }
      });
      dialogRef.afterClosed().subscribe(result => {
      })
    }, 500);

  }

  previewPdf() {
    const dialogRef = this.dialog.open(PreviewOfferComponent, {
      width: '80%',
      panelClass: 'custom-viewdialogstyle',
      data: { activateId: this.isOfferLetterActiveId }
    });
    dialogRef.afterClosed().subscribe(result => {
    })
    return false;
  }
  previewDialogPdfData() {
    const dialogRef = this.dialog.open(PreviewOfferComponent, {
      width: '80%',
      panelClass: 'custom-viewdialogstyle',
      data: {
        activateId: this.isOfferLetterActiveId, id: this.updateId,
        name: this.offerForm.value.name, dob: this.offerForm.value.dob, description: this.offerForm.value.description, modified_time: this.modifiedTime,
        // doj: this.offerForm.value.doj, designation: this.offerForm.value.designation, location: this.offerForm.value.location,
        companyLogo: this.url, companyName: this.offerForm.value.companyName, companyAddress: this.offerForm.value.companyAddress,
        companyLink: this.offerForm.value.companyLink, signatureName: this.offerForm.value.signatureName, signatureRole: this.offerForm.value.signatureRole, signature: this.urlSign,
        logoFileName: this.attachmentName, annexure_details: this.annexure_details, signFileName: this.attachmentNameSign, letterTitle: this.offerForm.value.letterTitle
      }
    })
  }

  addDescription() {
    let limit = 5;
    if (this.annexure_details.length < limit) {
      this.annexure_details.push({ 'letterTitle1': '', 'description1': '' });
      this.annexureValidate();
    } else {
      return;

    }
  }

  deleteFieldValue(index) {
    this.annexure_details.splice(index, 1);
    this.annexureValidate();
  }
  annexureValidate() {
    if (this.annexure_details[0].letterTitle1.length > 0 && this.annexure_details[0].description1.length) {
      this.annexure_validation = false;
    } else {
      this.annexure_validation = true;
    }
  }
}
