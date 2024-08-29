import { Component, OnInit ,Inject} from '@angular/core';
// import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NgxSpinnerService } from 'ngx-spinner';
import {deleteContentMessage,BulkDeleteHeadMessage} from '../constants';
import { UntypedFormGroup ,UntypedFormBuilder,Validators} from '@angular/forms';
@Component({
  selector: 'app-bulk-delete-dialog',
  templateUrl: './bulk-delete-dialog.component.html',
  styleUrls: ['./bulk-delete-dialog.component.less']
})
export class BulkDeleteDialogComponent implements OnInit {
  deleteMsg = deleteContentMessage;
  deleteHeadMsg = BulkDeleteHeadMessage;

  key: string;
  isShowComment:boolean;
  dialogContent:String;
  deleteformgroup: UntypedFormGroup =this.formbuilder.group({
    comments: ['', [Validators.required]],
  });
  constructor(public dialogRef: MatDialogRef<any>,
    private formbuilder:UntypedFormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: any) {
      // console.log("bulk delete...",data);
     }

  ngOnInit() {
    this.key = this.data.key;
    this.isShowComment = this.data.showComment;
    if(this.key == "bulk-delete" && this.isShowComment == false){

    } else if(this.key != "bulk-delete" && this.isShowComment == false){
      if(this.key == 'delete-project'){
        this.dialogContent ="<p>This projects will be <b>deleted permanently</b> and their jobs also will be removed.<p>";
      } else if(this.key == "delete-job"){
        this.dialogContent ="<p>This jobs will be <b>deleted permanently</b>.<p>";
      }else if(this.key == "active-orgs"){
        this.dialogContent = "<p>This will be <b>deleted permanently</b>.</p>";
      } else if(this.key == "role"){
        this.dialogContent ="<p>This will be <b>deleted permanently</b>, if this role has been assigned to someone, please change it otherwise it will affect the user's login.</p>";
      } else if(this.key == "designation"){
        this.dialogContent ="<p>This will be <b>deleted permanently</b>, if this designation has been assigned to someone please change the designation.</p>";
      } else if(this.key == "employee-user"){
        this.dialogContent ="<p>The user will be <b>deleted permanently</b> and removed from assigned projects and jobs.</p>";
      } else if(this.key == "client-delete"){
        this.dialogContent ="<p>The client will be <b>deleted permanently</b> and all projects and jobs under this client will be removed.</p>";
      } else if(this.key == "reject-orgs"){
        this.dialogContent ="<p>This will be <b>deleted permanently</b>, If removed the organizations.</p>";
      } else if(this.key == "bulk-delete-time-tracker"){
        this.dialogContent ="<p>This will be <b>deleted permanently</b>.</p>";
      } else if(this.key == "leave-type-bulk-delete"){
        this.dialogContent ="<p>This will be <b>deleted permanently</b>.</p>";
      } else if(this.key =="holiday-bulk-delete"){
        this.dialogContent ="<p>This will be <b>deleted permanently</b>.</p>";
      } else if(this.key == "holiday-bulk-delete"){
        this.dialogContent ="<p>This will be <b>deleted permanently</b>.</p>";
      } else if(this.key == "day-planner-bulk-delete"){
        this.dialogContent ="<p>This will be <b>deleted permanently</b>.</p>";
      } else if(this.key == "business-bulk-delete"){
        this.dialogContent ="<p>This will be <b>deleted permanently</b>.</p>";
      } else if(this.key == "offer-bulk-delete"){
        this.dialogContent ="<p>This will be <b>deleted permanently</b>.</p>";
      } else if(this.key == "pricing-bulk-delete"){
        this.dialogContent ="<p>This will be <b>deleted permanently</b>.</p>";
      } else if(this.key == "release-bulk-delete"){
        this.dialogContent ="<p>This will be <b>deleted permanently</b>.</p>";
      }
      else if(this.key == "policy") {
        this.dialogContent = "<p>This will be <b>deleted permanently</b>.</p>";
      }
      else if(this.key == "attendance-bulk-delete"){
        this.dialogContent ="<p>This will be <b>deleted permanently</b>.</p>";
      }

    } else if(this.key != "bulk-delete" && this.isShowComment == true){
      // if(this.key == "active-orgs")
      // this.dialogContent = "If delete the organization, it will be the permanent delete better you can deactivate the organization";

    }

  }
  delete(){
    this.dialogRef.close({ data: true})
  }
  deleteDetails(){
    this.dialogRef.close({data:true,comment:this.deleteformgroup.value.comments})
  }
}
