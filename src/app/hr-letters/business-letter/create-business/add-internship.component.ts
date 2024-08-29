
// <!-------  create business letter --------->

import { Component, OnInit, Output, EventEmitter, ElementRef, HostListener } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { InternshipletterService } from '../../../services/businessletter.service';
import { UtilService } from '../../../services/util.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ViewInternshipComponent } from '../view-business/view-internship.component';
import *as html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { MatDialog } from '@angular/material/dialog';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { NgxSpinnerService } from 'ngx-spinner';
import { DomSanitizer } from '@angular/platform-browser';
import { PreviewLetterComponent } from '../preview-business/preview-letter.component';
import { errorMessage, characterLength, validFormat, invalidFormat } from '../../../util/constants';

@Component({
  selector: 'app-add-internship',
  templateUrl: './add-internship.component.html',
  styleUrls: ['./add-internship.component.less']
})
export class AddInternshipComponent implements OnInit {
  requiredMessage = errorMessage;
  characterLength = characterLength;
  // validFormatMessage = validFormat;
  invalidFormatMsg =  invalidFormat;
  program_title: string[] = ['2 Month Of Internship Offer', '3 Month Of Internship Offer', '6 Month Of Internship Offer'];
  internshipForm: UntypedFormGroup;
  name = new UntypedFormControl('', [Validators.required,Validators.pattern('^[a-zA-Z ]+$')]);
  date = new UntypedFormControl('', [Validators.required]);
  address = new UntypedFormControl('', [Validators.required]);
  programtitle = new UntypedFormControl('', [Validators.required]);
  description = new UntypedFormControl('', [Validators.required, Validators.maxLength(2000)]);
  companyLogo = new UntypedFormControl('', [Validators.required]);
  directorSign = new UntypedFormControl('', [Validators.required]);
  directorName = new UntypedFormControl('', [Validators.required]);
  companyName = new UntypedFormControl('', [Validators.required]);
  companyAddress = new UntypedFormControl('', [Validators.required]);
  companyLink = new UntypedFormControl('', [Validators.required]);
  signatureRole = new UntypedFormControl('', [Validators.required]);

  component: any;
  fileString: any;
  fileEncode: any;
  isInternActiveId: boolean = false;
  internId: any;
  url: any;
  msg: any;
  urlSign: any;
  msgSign: any;


  @Output()
  open: EventEmitter<any> = new EventEmitter();
  // ClassicEditor.create(document.querySelector( '#editor1' ), )
  Editor = ClassicEditor;

  public editorData = '<p>Hello, world!</p>';
  ckconfig = {};
  public model = {
    editorData: '<p>Dear <b>Xxxx</b>,</p>'
  };
  public onReady(editor: any) {
    // editor.ui.view.editable.element.style.line_height = "1px";
    editor.ui.getEditableElement().parentElement.insertBefore(
      editor.ui.view.toolbar.element,
      editor.ui.getEditableElement()
    );
  }
  constructor(private http: HttpClient,
    private internService: InternshipletterService,
    private utilService: UtilService,
    private el: ElementRef,
    private router: Router, public dialog: MatDialog,
    public activeRoute: ActivatedRoute,
    private spinner: NgxSpinnerService,
    private domSanitizer: DomSanitizer) {
  }


  Space(event: any) {
    if (event.target.selectionStart === 0 && event.code === "Space") {
      event.preventDefault();
    }
  }

  // @HostListener('keydown', ['$event']) onKeyDown(event) {

  //   let e = <KeyboardEvent>event;
  //   /* 
  //     8 -  for backspace
  //     9 -  for tab
  //     13 - for enter
  //     27 - for escape
  //     46 - for delete
  //   */
  //   if ([8, 9, 13, 27, 46].indexOf(e.keyCode) !== -1 ||
  //     // Allow: Ctrl+A
  //     (e.keyCode === 65 && (e.ctrlKey || e.metaKey)) ||
  //     // Allow: Ctrl+C
  //     (e.keyCode === 67 && (e.ctrlKey || e.metaKey)) ||
  //     // Allow: Ctrl+V
  //     (e.keyCode === 86 && (e.ctrlKey || e.metaKey)) ||
  //     // Allow: Ctrl+X
  //     (e.keyCode === 88 && (e.ctrlKey || e.metaKey)) ||
  //     // Allow: home, end, left, right
  //     (e.keyCode >= 35 && e.keyCode <= 39)) {
  //     // let it happen, don't do anything
  //     return;
  //   }
  //   if (e.keyCode != 32 && ((e.keyCode < 65 || e.keyCode > 93))) {
  //     e.preventDefault();
  //   }
  // }

  // @HostListener('keyup', ['$event']) onKeyup(event: KeyboardEvent) {
  //   this.validateFields(event);
  // }

  // @HostListener('paste', ['$event']) blockPaste(event: KeyboardEvent) {
  //   this.validateFields(event);
  // }

  // validateFields(event) {
  //   setTimeout(() => {
  //     this.el.nativeElement.value = this.el.nativeElement.value.replace(/[^A-Za-z ]/g, '')
  //     event.preventDefault();
  //   }, 100)
  // }



  ngOnInit() {

    this.internshipForm = new UntypedFormGroup({
      name: this.name,
      date: this.date,
      address: this.address,
      programtitle: this.programtitle,
      description: this.description,
      companyLogo: this.companyLogo,
      directorSign: this.directorSign,
      directorName: this.directorName,
      companyName: this.companyName,
      companyAddress: this.companyAddress,
      companyLink: this.companyLink,
      signatureRole: this.signatureRole

    })
    this.internId = this.activeRoute.snapshot.params.id;
    if (this.internId) {
      this.formValue();
      this.isInternActiveId = true;
    } else {
      this.isInternActiveId = false;
    }
  }


  attachmentCopy: any;
  selectedFile: File = null;
  fileSize: number = 0;
  base64url: any;
  attachment_update: File = null;
  attachmentName: any;
  attachment: File = null;
  todaydate: any;

  onFileChanged(event: any) {
    if (!(event.target.files[0] || event.target.files[0].length == 0)) {
      this.msg = "you must select an Image";
      return;
    }
    var mimeType = event.target.files[0].type;
    if (mimeType.match(/image\/*/) == null) {
      this.msg = "Accept jpg,png image format";
    } else {
      if (event.target.files[0].size <= 100000) {
        var reader = new FileReader();
        reader.readAsDataURL(event.target.files[0]);
        this.selectedFile = event.target.files[0];
        this.attachmentName = this.selectedFile.name;
        this.attachmentCopy = this.selectedFile;
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
      this.msgSign = "Accept jpg,png image format";
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
      } else {
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
  programHead: any;
  joinDate: any;
  updateId: any;
  // tooltipName:any;
  formValue() {
    this.spinner.show();
    this.internService.getByIdBusinessDetails(this.internId).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        let interndata: any = JSON.parse(data.map.data);

        this.updateId = interndata.id;
        this.todaydate = interndata.today_Date;
        // this.url= interndata.companyLogo;
        // this.urlSign = interndata.directorSign;
        this.programHead = interndata.program_title;
        // this.attachmentName = interndata.logoFileName;
        // this.attachmentNameSign = interndata.signFileName

        this.joinDate = interndata.doj;

        // let doj = new Date(interndata.doj);
        this.internshipForm.get('name').setValue(interndata.name);
        // this.internshipForm.get('date').setValue(doj);
        this.internshipForm.get('address').setValue(interndata.address);
        this.programtitle.setValue(this.programHead);
        this.internshipForm.get('directorName').setValue(interndata.directorName);
        this.internshipForm.get('description').setValue(interndata.description);
        this.internshipForm.get('companyName').setValue(interndata.companyName);
        this.internshipForm.get('companyLink').setValue(interndata.companySite);
        this.internshipForm.get('companyAddress').setValue(interndata.companyAddress);
        this.internshipForm.get('signatureRole').setValue(interndata.signatureRole);
        // this.internshipForm.get('companyLogo').setValue(this.url);
        // this.internshipForm.get('directorSign').setValue(this.urlSign);
        // console.log("the date is...",this.date.setValue(this.joinDate));
        if (interndata.companyLogo != undefined) {
          let stringArray = new Uint8Array(interndata.companyLogo);
          const STRING_CHAR = stringArray.reduce((data, byte) => {
            return data + String.fromCharCode(byte);
          }, '');
          let base64String = btoa(STRING_CHAR);
          const imageName = interndata.name;
          const imageBlob = this.dataURItoBlob(base64String);
          const imageFile = new File([imageBlob], imageName, { type: 'image/png,image/jpeg,image/jpg' });
          // this.url = this.domSanitizer.bypassSecurityTrustUrl("data:image/jpeg;base64," + base64String);
          this.url = interndata.companyLogo;
          // console.log(this.url);
          // "data:image/jpeg;base64," + 
          this.attachmentName = interndata.logoFileName;
          this.attachmentCopy = imageFile;
          this.attachment = imageFile;
        }
        if (interndata.directorSign != undefined) {
          let stringArraySign = new Uint8Array(interndata.directorSign);
          const STRING_CHARSIGN = stringArraySign.reduce((data, byte) => {
            return data + String.fromCharCode(byte);
          }, '');
          let base64String = btoa(STRING_CHARSIGN);
          const imageNameSign = interndata.name;
          const imageBlobSign = this.dataURItoBlob(base64String);
          const imageFileSign = new File([imageBlobSign], imageNameSign, { type: 'image/png,image/jpeg,image/jpg' })
          this.urlSign = interndata.directorSign;
          // this.urlSign = this.domSanitizer.bypassSecurityTrustUrl("data:image/jpeg;base64," + base64String);
          this.attachmentNameSign = interndata.signFileName;
          this.attachmentCopySign = imageFileSign;
          this.attachmentSign = imageFileSign;
        }
        this.spinner.hide();
      } else {

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
  cancelButton() {
    this.router.navigate(['/business_letter']);
  }


  // create business letter data
  openDialog() {
    // console.log(this.internshipForm.value.description);
    this.spinner.show();
    setTimeout(() => {
      this.spinner.hide();
      const dialogRef = this.dialog.open(ViewInternshipComponent, {
        width: '1200px',
        height: '500px',
        autoFocus: false,
        data: {
          activateId: this.isInternActiveId, name: this.internshipForm.value.name, date: this.internshipForm.value.date,
          address: this.internshipForm.value.address, programtitle: this.internshipForm.value.programtitle,
          description: this.internshipForm.value.description, companyLogo: this.url,
          directorName: this.internshipForm.value.directorName, directorSign: this.urlSign,
          companyName: this.internshipForm.value.companyName, companyAddress: this.internshipForm.value.companyAddress,
          companyLink: this.internshipForm.value.companyLink, signatureRole: this.internshipForm.value.signatureRole,
          logoFileName: this.attachmentName, signFileName: this.attachmentNameSign
        }

      });
      // setTimeout(()=>{
      //   this.spinner.hide();
      // },2000)
      dialogRef.afterClosed().subscribe(result => {
        // console.log('the dialog was closed');
      })
    }, 500);
  }

  //update business letter data
  openDialogData() {
    this.spinner.show();
    setTimeout(() => {
      this.spinner.hide();
      const dialogRef = this.dialog.open(ViewInternshipComponent, {
        width: '1200px',
        height: '500px',
        autoFocus: false,
        data: {
          activateId: this.isInternActiveId, id: this.updateId, name: this.internshipForm.value.name, date: this.internshipForm.value.date,
          address: this.internshipForm.value.address, programtitle: this.internshipForm.value.programtitle,
          description: this.internshipForm.value.description,
          companyLogo: this.url, directorName: this.internshipForm.value.directorName, directorSign: this.urlSign,
          companyName: this.internshipForm.value.companyName, companyAddress: this.internshipForm.value.companyAddress,
          companyLink: this.internshipForm.value.companyLink, signatureRole: this.internshipForm.value.signatureRole,
          logoFileName: this.attachmentName, signFileName: this.attachmentNameSign
        }
      });

      dialogRef.afterClosed().subscribe(result => {
      })
    }, 500);
  }

  //preview business letter
  previewDialogData() {
    const dialogRef = this.dialog.open(PreviewLetterComponent, {
      width: '80%',
      panelClass: 'custom-viewdialogstyle',
      data: { activateId: this.isInternActiveId }
    });
    dialogRef.afterClosed().subscribe(result => {
      // console.log(`Dialog result: ${result}`);
    });

  }

  //update business letter preview
  previewDialogPdfData() {
    const dialogRef = this.dialog.open(PreviewLetterComponent, {
      width: '80%',
      panelClass: 'custom-viewdialogstyle',
      data: {
        activateId: this.isInternActiveId, name: this.internshipForm.value.name, date: this.todaydate,
        address: this.internshipForm.value.address, programtitle: this.internshipForm.value.programtitle,
        description: this.internshipForm.value.description, companyLogo: this.url,
        directorName: this.internshipForm.value.directorName, directorSign: this.urlSign,
        companyName: this.internshipForm.value.companyName, companyAddress: this.internshipForm.value.companyAddress,
        companyLink: this.internshipForm.value.companyLink, signatureRole: this.internshipForm.value.signatureRole,
        logoFileName: this.attachmentName, signFileName: this.attachmentNameSign
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      // console.log(`Dialog result: ${result}`);
    });

  }


}
