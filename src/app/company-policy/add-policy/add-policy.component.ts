import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { NgxSpinnerService } from 'ngx-spinner';
import { CompanyPolicyService } from 'src/app/services/company-policy.service';
import { UtilService } from 'src/app/services/util.service';
import { errorMessage, alreadyExistMessage, validFormat, duplicateName } from 'src/app/util/constants';
import moment from 'moment-timezone';
@Component({
  selector: 'app-add-policy',
  templateUrl: './add-policy.component.html',
  styleUrls: ['./add-policy.component.less']
})
export class AddPolicyComponent implements OnInit {

  validFormatMessage = validFormat;
  requiredMessage = errorMessage;
  existMessage = alreadyExistMessage;
  duplicateName = duplicateName;
  isAddPolicy: boolean = false;
  isUploadPolicy: boolean = false;
  booleanResult: any;
  pdfDocument: any;
  activePolicyNameList: any[] = [];
  isNameAvailable: boolean = false;
  isPolicyNmeAvail: Boolean = false;

  @Output()
  open: EventEmitter<any> = new EventEmitter();
  Editor = ClassicEditor;
  addPolicyFromGroup: UntypedFormGroup;
  public description = new UntypedFormControl('', [Validators.required]);

  public policy_file = new UntypedFormControl('', [Validators.required]);

  public onReady(editor: any) {
    editor.ui.getEditableElement().parentElement.insertBefore(
      editor.ui.view.toolbar.element,
      editor.ui.getEditableElement()
    );
  }
  constructor(private spinner: NgxSpinnerService,
    private formBuilder: UntypedFormBuilder, private activatedRoute: ActivatedRoute,
    private policyService: CompanyPolicyService,
    public utilService: UtilService, public router: Router,) {
    this.addPolicyFromGroup = this.formBuilder.group({
      policy_name: ['', [Validators.required]],
      issued_date: ['', [Validators.required]],
      effective_from: ['', [Validators.required]],
    });
  }

  ngOnInit(): void {
    this.getActivePolicyNameList();
    this.booleanResult = this.activatedRoute.snapshot.params.id;
    if (this.booleanResult == "true") {
      this.isAddPolicy = true;
    } else {
      this.isUploadPolicy = true;
    }
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
  // save policy with content
  public fileEncode: any = {};
  savePolicyAsContent() {
    this.spinner.show();
    let zone = moment.tz.guess();
    let orgId = localStorage.getItem("OrgId");
    this.fileEncode = {
      "org_id": orgId,
      "policyname": this.addPolicyFromGroup.value.policy_name,
      "issuedDate": this.addPolicyFromGroup.value.issued_date,
      "effective_from": this.addPolicyFromGroup.value.effective_from,
      "description": this.description.value,
      "policy_pdfFormat":  null,
      "timezone" : zone
    }
    this.policyService.createPolicyDetails(this.fileEncode).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        this.utilService.openSnackBarAC("Policy added successfully", "OK");
        this.spinner.hide();
        setTimeout(() => {
          this.router.navigate(["/company-policy-settings"]);
        })
      } else {
        this.utilService.openSnackBarMC("Failed to add policy", "OK");
        this.spinner.hide();
      }
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
    });
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
          // console.log(base64EncodedString);      
      };
      reader.readAsArrayBuffer(selectedFile);
    }
  }
  
  async savePolicyAsPdf(event) {
    this.spinner.show();
    let zone = moment.tz.guess();
    let orgId = localStorage.getItem("OrgId");
    this.fileEncode = {
      "org_id": orgId,
      "policyname": this.addPolicyFromGroup.value.policy_name,
      "issuedDate": this.addPolicyFromGroup.value.issued_date,
      "effective_from": this.addPolicyFromGroup.value.effective_from,
      "policy_pdfFormat": this.pdfDocument,
      "description": null,
      "timezone" : zone
    }
    this.policyService.createPolicyDetails(this.fileEncode).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        this.utilService.openSnackBarAC("Policy added successfully", "OK");
        this.spinner.hide();
        setTimeout(() => {
          this.router.navigate(["/company-policy-settings"]);
        })
      } else {
        this.utilService.openSnackBarMC("Failed to add policy", "OK");
        this.spinner.hide();
      }
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
    });
  }
  cancel() {
    this.attachmentName = null;
    this.attachmentCopy = null;
    this.attachment = null;
    this.url = null;
  }
  // get the active policy name list by organization id
  getActivePolicyNameList() {
    this.spinner.show();
    let orgId = localStorage.getItem("OrgId");
    this.policyService.getActivePolicytNameListByOrgId(orgId).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        this.activePolicyNameList = JSON.parse(data.map.data);
      }
      this.spinner.hide();
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
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
    // check policy name is already exist or not
    for (let i = 0; i < this.activePolicyNameList.length; i++) {
      if (this.activePolicyNameList.find(x => x.toLowerCase() == event.toLowerCase())) {
        this.isPolicyNmeAvail = true;
      }
      else this.isPolicyNmeAvail = false;
    }
  }
}
