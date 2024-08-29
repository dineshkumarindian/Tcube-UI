import { Component, OnInit ,Inject} from '@angular/core';
import { UntypedFormGroup ,UntypedFormBuilder,Validators} from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NgxSpinnerService } from 'ngx-spinner';
import {bulkActivateHeadMessage,activateContentMessage} from '../constants';
@Component({
  selector: 'app-bulk-activate-dialog',
  templateUrl: './bulk-activate-dialog.component.html',
  styleUrls: ['./bulk-activate-dialog.component.less']
})
export class BulkActivateDialogComponent implements OnInit {
bulkActivate = bulkActivateHeadMessage;
activemeg = activateContentMessage;
key :string;
showComment:boolean;
showContent :string = "";
  constructor(public dialogRef: MatDialogRef<any>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private formbuilder:UntypedFormBuilder) {
      // console.log(data);
   }
  bulkactiveformgroup: UntypedFormGroup =this.formbuilder.group({
    comments: ['', [Validators.required]],
  });
  ngOnInit() {
    this.key = this.data.key;
    this.showComment = this.data.showComment;
    if(this.key == "activate-user"){
      this.showContent = "The user will be enable from assigned project and jobs.";
    } else if( this.key == "activate-client"){
      this.showContent = "The projects and jobs will be enabled under this client.";
    } else if(this.key == "active-org"){
      this.showContent = "If activate the organization , all users activated under this organization.";
    }
  }
  activeDetails(){
    this.dialogRef.close({data:true,comments:this.bulkactiveformgroup.value.comments})
  }

}
