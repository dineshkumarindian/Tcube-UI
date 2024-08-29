import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { ReleaseNotesService } from '../../../services/super-admin/release-notes/release-notes.service';
import { SettingsService } from '../../../services/settings.service';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { UtilService } from '../../../services/util.service';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { MatDialog } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';
import { ViewReleaseComponent } from '../view-release/view-release.component';
import { PreviewNotesComponent } from '../preview-notes/preview-notes.component'
import{errorMessage,characterLength} from '../../../util/constants';
var CKEDITOR: any;
@Component({
  selector: 'app-add-notes',
  templateUrl: './add-notes.component.html',
  styleUrls: ['./add-notes.component.less']
})
export class AddNotesComponent implements OnInit {
  
  requiredMessage = errorMessage;
  charLength = characterLength;
  annexure_validation: boolean = true;
  forms = ['Add-form'];
  maxDate = new Date();
  expandedIndex = 0;
  releaseForm: UntypedFormGroup;
  releaseType= new UntypedFormControl('',[Validators.required]);
  title = new UntypedFormControl('', [Validators.required])
  productName = new UntypedFormControl('',[Validators.required]);
  ReleaseVersion = new UntypedFormControl('', [Validators.required]);
  dor = new UntypedFormControl('', [Validators.required]);
  companyLogo = new UntypedFormControl('', [Validators.required]);
  // overView = new FormControl('',[Validators.required]);
  whatsNew = new UntypedFormControl('');
  improvement = new UntypedFormControl('');
  bugFixes = new UntypedFormControl('');
  comingSoon= new UntypedFormControl('');
  general = new UntypedFormControl('');

  // description = new FormControl('', [Validators.required]);
  // companyLink = new FormControl('', [Validators.required]);
  // contact = new FormControl('',[Validators.required]);


  isReleaseNotesActiveId: boolean = false;
  component: any;
  releaseId: any;
  releaseKey:any;
  // releaseId:any;
  fileString: any;
  fileEncode: any;
  url: any;
  msg: any;
  modifiedTime: any;

  @Output()
  open: EventEmitter<any> = new EventEmitter();
  Editor = ClassicEditor;


  // public editorData = '<p>Hello, world!</p>';
  // ckconfig = {};
  // public model = {
  //   editorData: '<p>Dear <b>""</b>,</p>'
  // };

  public onReady(editor: any) {

    editor.ui.getEditableElement().parentElement.insertBefore(
      editor.ui.view.toolbar.element,
      editor.ui.getEditableElement(),
    );
  }

  constructor(private router: Router, private spinner: NgxSpinnerService,
    public activeRoute: ActivatedRoute,
    private formBuilder: UntypedFormBuilder,
    private utilService: UtilService,
    public dialog: MatDialog,
    private settingsService: SettingsService,
    private releaseService: ReleaseNotesService,
    private http: HttpClient,
  ) { }

  ngOnInit() {
    this.releaseForm = new UntypedFormGroup({
      releaseType :this.releaseType,
      title : this.title,
      productName :this.productName,
      ReleaseVersion:this.ReleaseVersion,
      dor: this.dor,
      companyLogo:this.companyLogo,
      // overView:this.overView,
      whatsNew:this.whatsNew,
      improvement:this.improvement,
      bugFixes:this.bugFixes,
      comingSoon:this.comingSoon,
      general: this.general
      // companyLink:this.companyLink,
      // contact:this.contact
      // description: this.description,
      // companyLogo: this.companyLogo,
      // companyLink: this.companyLink,
      // notesTitle: this.notesTitle,


    })
    // this.releaseKey = this.activeRoute.snapshot.params.key;
    this.releaseId = this.activeRoute.snapshot.params.id;
    // console.log(this.releaseKey);
    // console.log(this.releaseKey +"and"+this.releaseId);
    if (this.releaseId != undefined ) {
      this.formValue();
      this.isReleaseNotesActiveId = true;
     
     } else {
      this.isReleaseNotesActiveId = false;
    }
  }

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
  cancel() {
    this.attachmentName = null;
    this.attachmentCopy = null;
    this.attachment = null;
    this.url = null;
  }


  position: any;
  joinDate: any;
  updateId: any;
  dateofrelease: any;
  workingPlace: any;
  releaseTitle : any;

  ispublish:boolean;
  isRepublish:boolean;
  formValue() {
    this.spinner.show();
    this.releaseService.getReleaseNotesByIdDetails(this.releaseId).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        setTimeout(() => {
          /** spinner ends after 1 second */
          this.spinner.hide();
        }, 1000);
        let releasedata: any = JSON.parse(data.map.data);
        // console.log(releasedata);
        let dor = new Date(releasedata.dor);
        this.releaseForm.get('releaseType').setValue(releasedata.keyNote);
        this.releaseForm.get('title').setValue(releasedata.releaseNotesTitle);
        this.releaseForm.get('productName').setValue(releasedata.productName);
        this.releaseForm.get('ReleaseVersion').setValue(releasedata.version);
        this.releaseForm.get('dor').setValue(dor);
        this.releaseForm.get('whatsNew').setValue(releasedata.whatsNew);
        this.releaseForm.get('improvement').setValue(releasedata.improvement);
        this.releaseForm.get('bugFixes').setValue(releasedata.bugFixes);
        this.releaseForm.get('general').setValue(releasedata.general);
        this.releaseForm.get('comingSoon').setValue(releasedata.comingsoon);
        this.ispublish = releasedata.is_publish;
        this.isRepublish =releasedata.is_republish;
        // this.modifiedTime = releasedata.modified_time;
        // this.updateId = releasedata.id;
        // this.position = releasedata.designation;
        // this.dateofrelease = releasedata.dor;
        // let dor = new Date(releasedata.dor);
        // this.modifiedTime = releasedata.modified_time;
        // this.updateId = releasedata.id;
        // this.releaseTitle = releasedata.notesTitle;
        // this.releaseTitle.get('notesTitle').setValue(releasedata.notesTitle);
        // this.releaseForm.get('version').setValue(releasedata.version);
        // this.releaseForm.get('dor').setValue(releasedata.dor);
        // this.releaseForm.get('title').setValue(releasedata.notesTitle);
        // this.releaseForm.get('description').setValue(releasedata.description);
        // // this.releaseForm.get('companyLogo').setValue(releasedata.companyLogo)
        // this.releaseForm.get('companyLink').setValue(releasedata.companyLink);
        if (releasedata.companyLogo != undefined) {
          let stringArray = new Uint8Array(releasedata.companyLogo);
          const STRING_CHAR = stringArray.reduce((data, byte) => {
            return data + String.fromCharCode(byte);
          }, '');
          let base64String = btoa(STRING_CHAR);
          const imageName = releasedata.name;
          const imageBlob = this.dataURItoBlob(base64String);
          const imageFile = new File([imageBlob], imageName, { type: 'image/png,image/jpeg,image/jpg' });
          // this.url = this.domSanitizer.bypassSecurityTrustUrl(base64String);
          this.url = releasedata.companyLogo;
          // "data:image/jpeg;base64," + 
          this.attachmentName = releasedata.logoFileName;
          this.attachmentCopy = imageFile;
          this.attachment = imageFile;
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
      const dialogRef = this.dialog.open(ViewReleaseComponent, {
        width: '1200px',
        height: '550px',
        autoFocus: false,
        data: {
          key:this.releaseForm.value.releaseType,
          activateId: this.releaseId,
          title:this.releaseForm.value.title,
          productName:this.releaseForm.value.productName,
          version: this.releaseForm.value.ReleaseVersion, 
          dor: this.releaseForm.value.dor, 
          companyLogo: this.url, 
          logoFileName: this.attachmentName,
          whatsNew:this.releaseForm.value.whatsNew,
          improvement:this.releaseForm.value.improvement,
          bugFixes:this.releaseForm.value.bugFixes,
          comingSoon:this.releaseForm.value.comingSoon,
          general: this.releaseForm.value.general
        }
      });
      dialogRef.afterClosed().subscribe(result => {
      })
   
  }

  //update release notes data
  openDialogData() {
    const dialogRef = this.dialog.open(ViewReleaseComponent, {
        width: '1200px',
        height: '550px',
        autoFocus: false,
        data: {
          key:this.releaseForm.value.releaseType,
          activateId: this.releaseId,
          title:this.releaseForm.value.title,
          productName:this.releaseForm.value.productName,
          version: this.releaseForm.value.ReleaseVersion, 
          dor: this.releaseForm.value.dor, 
          companyLogo: this.url, 
          logoFileName: this.attachmentName,
          whatsNew:this.releaseForm.value.whatsNew,
          improvement:this.releaseForm.value.improvement,
          bugFixes:this.releaseForm.value.bugFixes,
          comingSoon:this.releaseForm.value.comingSoon,
          general: this.releaseForm.value.general,
          ispublish:this.ispublish,
          isRepublish:this.isRepublish
        }
      });
      dialogRef.afterClosed().subscribe(result => {
      })
    
  }

  previewDialogPdfData() {
    const dialogRef = this.dialog.open(PreviewNotesComponent, {
      width: '80%',
      panelClass: 'custom-previewdialogstyle',
      data: {
        activateId: this.isReleaseNotesActiveId,
        id: this.updateId,
        version: this.releaseForm.value.version, 
        dor: this.releaseForm.value.dor, 
        description: this.releaseForm.value.description, modified_time: new Date(),
        companyLogo: this.url, companyLink: this.releaseForm.value.companyLink,
        notesTitle: this.releaseForm.value.notesTitle,
        logoFileName: this.attachmentName,
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      // console.log(`Dialog result: ${result}`);
    });

  }
}
