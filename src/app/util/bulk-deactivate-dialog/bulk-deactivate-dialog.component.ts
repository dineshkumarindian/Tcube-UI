import { Component, OnInit ,Inject} from '@angular/core';
import { UntypedFormGroup ,UntypedFormBuilder,Validators} from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NgxSpinnerService } from 'ngx-spinner';
import { of } from 'rxjs';
import {bulkDeactivateHeadMessage,deactivateContentMessage} from '../constants';

@Component({
  selector: 'app-bulk-deactivate-dialog',
  templateUrl: './bulk-deactivate-dialog.component.html',
  styleUrls: ['./bulk-deactivate-dialog.component.less']
})
export class BulkDeactivateDialogComponent implements OnInit {
  bulkDeactivate = bulkDeactivateHeadMessage;
  bulkdeactivateContent = deactivateContentMessage;
  key :string;
  showcomment:boolean;
  showContent:string; 
  constructor(public dialogRef: MatDialogRef<any>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private formbuilder:UntypedFormBuilder) { 
      // console.log(data);
    }
    bulkdeactiveformgroup: UntypedFormGroup =this.formbuilder.group({
      comments: ['', [Validators.required]],
    });
  ngOnInit() {
    this.key = this.data.key;  
    // console.log(this.key);
    this.showcomment = this.data.showComment;
    if(this.key == "client-deactivate"){
      this.showContent ="The project and jobs will be deactivated under this client.";
    } else if(this.key == "deactivate-user"){
      this.showContent ="The user will be disabled from assigned projects and jobs and if these users were assigned as reporting manager to someone, the org admin will be replaced that user.";
    } else if(this.key == "deactivate-org"){
      this.showContent ="If deactivate the organization, all users deactivated under this organization.";
    }
  }
  DeactiveDetails(){
    this.dialogRef.close({data:true, comments:this.bulkdeactiveformgroup.value.comments})
  }
}
