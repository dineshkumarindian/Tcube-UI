import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormGroup ,UntypedFormBuilder,Validators} from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NgxSpinnerService } from 'ngx-spinner';
import { SettingsService } from 'src/app/services/settings.service';
import { UtilService } from 'src/app/services/util.service';
import {deleteHeadMessage,deleteContentMessage,BulkDeleteHeadMessage} from '../constants';
@Component({
  selector: 'app-delete',
  templateUrl: './delete.component.html',
  styleUrls: ['./delete.component.less']
})
export class DeleteComponent implements OnInit {

  // UserDelete: boolean = false;
  deleteheadMsg = deleteHeadMessage;
  deleteContentMsg = deleteContentMessage;
  bulkdeleteContent = BulkDeleteHeadMessage;

  constructor(public dialogRef: MatDialogRef<any>,
     @Inject(MAT_DIALOG_DATA) public data: any,
     private settingsService: SettingsService,
    private utilsService: UtilService,
    private spinner: NgxSpinnerService,
    private formbuilder:UntypedFormBuilder,

     ) {
      // console.log("delete..",data);
      }
  
  key: string;
  isShowComment:boolean;
  dialogContent:String;
  deleteformgroup: UntypedFormGroup =this.formbuilder.group({
    comments: ['', [Validators.required]],
  });

  ngOnInit() {
    this.key = this.data.key;
    this.isShowComment = this.data.showComment;
    // console.log(this.key +"and..."+this.isShowComment);
    if(this.key == "delete" && this.isShowComment == false){

    } else if(this.key != "delete" && this.isShowComment == false){
      if(this.key == 'delete-project'){
        this.dialogContent ="<p> This project will be <b>deleted permanently</b>, and their jobs also will be removed.</p>";
      } else if(this.key == 'delete-user'){
        this.dialogContent = "<p>The user will be <b>deleted permanently</b> and removed from assigned projects and jobs.</p>";
      } else if(this.key == 'delete-client'){
        this.dialogContent ="<p>The client will be <b>deleted permanently</b> and all projects and jobs under this client will be removed.</p>";
      } else if(this.key =="job-delete"){
        this.dialogContent ="<p>This jobs will be <b>deleted permanently</b>.</p>";
      } else if(this.key == "role-delete"){
        this.dialogContent ="<p>This will be <b>deleted permanently</b>, if this role has been assigned to someone, please change it otherwise it will affect the user's login.</p>";
      } else if(this.key == "designation-delete"){
        this.dialogContent ="<p>This will be <b>deleted permanently</b>, if this designation has been assigned to someone please change the designation.</p>";
      } else if(this.key == 'reject-orgs'){
        this.dialogContent ="<p>This will be <b>deleted permanently</b>, if removed the organizations.</p>";
      } else if(this.key =="attendance-delete"){
        this.dialogContent ="<p>This will be <b>deleted permanently</b>.</p>";
      } else if(this.key =="leave-type-delete"){
        this.dialogContent ="<p>This will be <b>deleted permanently</b>.</p>";
      } else if(this.key == "delete-holiday"){
        this.dialogContent ="<p>This will be <b>deleted permanently</b>.</p>";
      } else if(this.key == "day-planner-delete"){
        this.dialogContent ="<p>This will be <b>deleted permanently</b>.</p>";
      } else if(this.key == "business-delete"){
        this.dialogContent ="<p>This will be <b>deleted permanently</b>.</p>";
      } else if(this.key == "offer-delete"){
        this.dialogContent ="<p>This will be <b>deleted permanently</b>.</p>";
      }else if(this.key == "slack-whats-delete"){
        this.dialogContent ="<p>This will be <b>deleted permanently</b>.</p>";
      } else if(this.key == "pricing-delete"){
        this.dialogContent ="<p>This will be <b>deleted permanently</b>.</p>";
      } else if(this.key == "release-delete"){
        this.dialogContent ="<p>This will be <b>deleted permanently</b>.</p>";
      } 
      else if(this.key == "Integration-delete"){
        this.dialogContent ="<p>This will be <b>deleted permanently</b>.</p>";
      } 
      else if(this.key == "branch-delete"){
        this.dialogContent ="<p>This branch will be <b>deleted permanently</b>, if this branch has been assigned to someone please change the branch.</p>";
      } else if(this.key == "stafftype-delete") {
        this.dialogContent ="<p>This staff type will be <b>deleted permanently</b>, if this staff type has been assigned to someone please change the staff type.</p>";
      } else if(this.key == "policy-delete") {
        this.dialogContent = "<p>This policy will be <b>deleted permanently</b>.</p>";
      }

    } else if(this.key != "delete" && this.isShowComment == true){
      if(this.key == 'active-org'){
        this.dialogContent ="<p>This will be <b>deleted permanently</b>.</p>";
      }

    }
}

delete(){
    this.dialogRef.close({ data: true})
  }
  deleteDetails(){
    this.dialogRef.close({data:true,
      comment:this.deleteformgroup.value.comments})
  }
}
