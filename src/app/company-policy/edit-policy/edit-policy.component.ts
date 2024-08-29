import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { NgxSpinnerService } from 'ngx-spinner';
import { CompanyPolicyService } from 'src/app/services/company-policy.service';
import { UtilService } from 'src/app/services/util.service';
import { errorMessage, alreadyExistMessage, validFormat, duplicateName } from 'src/app/util/constants';
import moment from 'moment-timezone';
import { DomSanitizer, SafeResourceUrl, SafeUrl } from '@angular/platform-browser';
@Component({
  selector: 'app-edit-policy',
  templateUrl: './edit-policy.component.html',
  styleUrls: ['./edit-policy.component.less']
})
export class EditPolicyComponent implements OnInit {

  @Output()
  open: EventEmitter<any> = new EventEmitter();
  Editor = ClassicEditor;
  addPolicyFromGroup: UntypedFormGroup;
  sanitizedBlobImageUrl: SafeUrl;
  selectedFile: any;
  filetype: String = "";
  attachmentName: String = "";
  attachmentCopy: File;
  url: any;
  fileSize: number = 0;
  attachment: File;
  msg = "";
  public description = new UntypedFormControl('', [Validators.required]);

  public policy_file = new UntypedFormControl('', [Validators.required]);

  public onReady(editor: any) {
    editor.ui.getEditableElement().parentElement.insertBefore(
      editor.ui.view.toolbar.element,
      editor.ui.getEditableElement()
    );
  }
  isAddPolicy: boolean = false;
  isUploadPolicy: boolean = false;
  booleanResult: any;
  updateId: any;
  existMessage = alreadyExistMessage;
  validFormatMessage = validFormat;
  requiredMessage = errorMessage;
  activePolicyNameList: any[] = [];
  isNameAvailable: boolean = true;
  isPolicyNmeAvail: Boolean = false;
  pdfUrl: SafeResourceUrl | undefined;
  pdfData: Blob | undefined;
  isPdfOrNot: boolean = false;
  pdfDocument: any;
  constructor(private spinner: NgxSpinnerService,
    private formBuilder: UntypedFormBuilder, private activatedRoute: ActivatedRoute,
    private policyService: CompanyPolicyService,
    public utilService: UtilService, public router: Router,private domSanitizer: DomSanitizer,) {
    this.addPolicyFromGroup = this.formBuilder.group({
      policy_name: ['', [Validators.required]],
      issued_date: ['', [Validators.required]],
      effective_from: ['', [Validators.required]],
    });
  }

  ngOnInit(): void {
    this.getActivePolicyNameList();
    this.booleanResult = this.activatedRoute.snapshot.params.ids;
    this.updateId = this.activatedRoute.snapshot.params.id;
    if (this.booleanResult == "true") {
    //   this.isAddPolicy = true;
      this.getPolicyById();     
    // } else {
    //   this.isUploadPolicy = true;
    }
  }
  eventPolicyFile: any;
  onFileChanged(event: any) {
    if (!(event.target.files[0] || event.target.files[0].length == 0)) {
      this.msg = "you must select an Image";
      return;
    }
    this.eventPolicyFile = event.target;
    this.handleFileInput(event);
    var mimeType = event.target.files[0].type;
    if (mimeType.match(/pdf\/*/) == null) {
      this.msg = "Accept pdf format";
    } else {
      if (event.target.files[0].size <= 1000000) {
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
        this.msg = "Image size should be accepted maximum of 700kb";
        // this.utilsService.openSnackBarMC("Please select below 500kb only", "OK");
        this.spinner.hide();
      }

    }
    this.fileSize = this.selectedFile.size;
    this.attachment = this.selectedFile;
  }
  getPolicyById() {
    this.spinner.show();
    this.policyService.getPolicybyId(this.updateId).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        let response = JSON.parse(data.map.data);

        if(response?.description){ 
          this.isAddPolicy = true;
        this.addPolicyFromGroup.get('policy_name').setValue(response.policyname);
        let issuedDate = new Date(response.issuedDate);
        this.addPolicyFromGroup.get('issued_date').setValue(issuedDate);
        let effectiveDate = new Date(response.effective_from);
        this.addPolicyFromGroup.get('effective_from').setValue(effectiveDate);
        this.description.setValue(response.description);
      } 
      else if(response?.policy_pdfFormat) {
        this.isUploadPolicy = true;
        this.addPolicyFromGroup.get('policy_name').setValue(response.policyname);
        let issuedDate = new Date(response.issuedDate);
        this.addPolicyFromGroup.get('issued_date').setValue(issuedDate);
        let effectiveDate = new Date(response.effective_from);
        this.addPolicyFromGroup.get('effective_from').setValue(effectiveDate);
        this.policy_file.setValue(response.policy_pdfFormat);
      let stringArray = new Uint8Array(response.policy_pdfFormat);
      const STRING_CHAR = stringArray.reduce((data, byte) => {
        return data + String.fromCharCode(byte);
      }, '');
      let base64String = btoa(STRING_CHAR);
      this.pdfDocument = base64String;
      const pdfName = response.policyname;
      const pdfBlob = this.dataURItoBlob(base64String);
      const pdfFile = new File([pdfBlob], pdfName, { type: 'application/pdf' });
      this.url = this.domSanitizer.bypassSecurityTrustUrl("data:application/pdf;base64," + base64String);
      this.attachmentName = pdfFile.name;
      this.attachmentCopy = pdfFile;
      this.attachment = pdfFile;
      }
      this.spinner.hide();
    }
    },(error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
    })  
  }
  base64ToFile(data: any, filename: any) {
    let data1 = data.name;
    const arr = data1.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    let u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  }
  cancel() {
    this.attachmentName = null;
    this.attachmentCopy = null;
    this.attachment = null;
    this.url = null;
  }

  dataURItoBlob(dataURI: any) {
    const byteString = window.atob(dataURI);
    const arrayBuffer = new ArrayBuffer(byteString.length);
    const int8Array = new Uint8Array(arrayBuffer);
    for (let i = 0; i < byteString.length; i++) {
      int8Array[i] = byteString.charCodeAt(i);
    }
    const blob = new Blob([int8Array], { type: 'image/png' });
    return blob;
  }
  uint8ArrayPolicy: any;
  handleFileInput(event:Event): void {
    const selectedFile = (event.target as HTMLInputElement).files[0];
let binaryString = '';
    if (selectedFile) {
      const reader = new FileReader();  
      reader.onload = () => {
        const fileDataArrayBuffer = reader.result as ArrayBuffer;
        const uint8Array = new Uint8Array(fileDataArrayBuffer);
        this.uint8ArrayPolicy = uint8Array;
        for (let i = 0; i <  this.uint8ArrayPolicy.length; i++) {
          binaryString += String.fromCharCode( this.uint8ArrayPolicy[i]);
          }          
          // Convert binary string to Base64-encoded string
          const base64EncodedString = btoa(binaryString);   // converting Uint8Array to base64 encoded string
          this.pdfDocument = base64EncodedString;
      };
      reader.readAsArrayBuffer(selectedFile);
    }
  }
  async updatePolicyAsContent() {
    this.spinner.show();
    let zone = moment.tz.guess();
    let OrgId = localStorage.getItem("OrgId");
    let data: Object = {
      "id": this.updateId,
      "org_id": OrgId,
      "policyname": this.addPolicyFromGroup.value.policy_name,
      "issuedDate": this.addPolicyFromGroup.value.issued_date,
      "effective_from": this.addPolicyFromGroup.value.effective_from,
      "description": this.description.value,
      "policy_pdfFormat":  null,
      "timezone" : zone
    }
    await this.policyService.updatePolicy(data).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        this.utilService.openSnackBarAC("Policy updated successfully", "OK");
        this.spinner.hide();
        setTimeout(() => {
        this.router.navigate(['/company-policy-settings']);
      }, 200);
      }
      else {
        this.utilService.openSnackBarMC("Failed to update policy", "OK");
        this.spinner.hide();
      }
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
    })
    // setTimeout(() => {
    //   this.spinner.hide();
    // }, 1000);
  }
  // get the active projects name list by organization id
 async  getActivePolicyNameList() {
    this.spinner.show();
    let orgId = localStorage.getItem("OrgId");
    await this.policyService.getActivePolicytNameListByOrgId(orgId).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        this.activePolicyNameList = JSON.parse(data.map.data);
      }
    })
  }
  policyNameCheck(event) {
    if (this.isNameAvailable) {
      for (let i = 0; i < this.activePolicyNameList.length; i++) {
        if (this.addPolicyFromGroup.get('policy_name').value == this.activePolicyNameList[i]) {
          this.activePolicyNameList.splice(i, 1);
        }
      }
      this.isNameAvailable = false;
    }
    // check project name is already exist or not
    for (let i = 0; i < this.activePolicyNameList.length; i++) {
      if (this.activePolicyNameList.find(x => x.toLowerCase() == event.toLowerCase())) {
        this.isPolicyNmeAvail = true;
      }
      else this.isPolicyNmeAvail = false;
    }
  }
 async savePolicyAsPdf() {
    this.spinner.show();
    let zone = moment.tz.guess();
    let OrgId = localStorage.getItem("OrgId");
    let data: Object = {
      "id": this.updateId,
      "org_id": OrgId,
      "policyname": this.addPolicyFromGroup.value.policy_name,
      "issuedDate": this.addPolicyFromGroup.value.issued_date,
      "effective_from": this.addPolicyFromGroup.value.effective_from,
      "policy_pdfFormat":  this.pdfDocument,
      "description": null,
      "timezone" : zone
    }
    await this.policyService.updatePolicy(data).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        this.utilService.openSnackBarAC("Policy updated successfully", "OK");
        this.spinner.hide();
        setTimeout(() => {
        this.router.navigate(['/company-policy-settings']);
      }, 200);
      }
      else {
        this.utilService.openSnackBarMC("Failed to update policy", "OK");
        this.spinner.hide();
      }
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
    })
    // setTimeout(() => {
    //   this.spinner.hide();
    // }, 1000);
  }
}
