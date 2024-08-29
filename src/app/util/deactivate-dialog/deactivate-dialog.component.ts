import { Component, OnInit ,Inject} from '@angular/core';
import { UntypedFormGroup ,UntypedFormBuilder,Validators} from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NgxSpinnerService } from 'ngx-spinner';
import {deactivateHeadMessage,deactivateContentMessage} from '../constants';

@Component({
  selector: 'app-deactivate-dialog',
  templateUrl: './deactivate-dialog.component.html',
  styleUrls: ['./deactivate-dialog.component.less']
})
export class DeactivateDialogComponent implements OnInit {
deactivateheadMsg = deactivateHeadMessage;
deactivateContentMsg = deactivateContentMessage;
key:string;
isshowComment:boolean;
showDeactivateContent :string; 
  constructor(public dialogRef: MatDialogRef<any>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private formbuilder:UntypedFormBuilder) { }
    
    deactiveformgroup: UntypedFormGroup =this.formbuilder.group({
      comments: ['', [Validators.required]],
    });
  ngOnInit() {
    this.key = this.data.key;
    this.isshowComment = this.data.showComment;
    if(this.key =="deactivate"){
      this.showDeactivateContent = "The project and jobs will be deactivated under this client.";
    }
    else if(this.key =="deactivate-user"){
      this.showDeactivateContent ="The user will be disabled from assigned projects and jobs and if this user is assigned as reporting manager to someone, the org admin will be replaced that user.";
    } else if(this.key == "deactivate-org"){
      this.showDeactivateContent ="If deactivate the organization, all users deactivated under this organization.";
    }
  }
  DeactiveDetails(){
    this.dialogRef.close({data:true,comments:this.deactiveformgroup.value.comments});
  }
}
