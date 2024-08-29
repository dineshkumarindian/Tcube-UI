import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { NotificationService } from 'src/app/services/notification.service';
import { SettingsService } from 'src/app/services/settings.service';
import { TimeTrackerService } from 'src/app/services/time-tracker.service';
import { UtilService } from 'src/app/services/util.service';
import {ManageBranchDetailsService} from 'src/app/services/manage-branch/manage-branch-details.service'
@Component({
  selector: 'app-add-branch',
  templateUrl: './add-branch.component.html',
  styleUrls: ['./add-branch.component.less']
})
export class AddBranchComponent implements OnInit {
orgId: any;
  constructor(    public dialogRef: MatDialogRef<AddBranchComponent>,
    @Inject(MAT_DIALOG_DATA) public data,
    public timeTrackerService: TimeTrackerService,
    private formBuilder: UntypedFormBuilder,
    private utilsService: UtilService,
    private spinner: NgxSpinnerService,
    private router: Router,
    private manageBranchDetailsService: ManageBranchDetailsService) { }
  branchformGroup: UntypedFormGroup;
  ngOnInit(): void {
    this.orgId = localStorage.getItem("OrgId")
    this.branchformGroup = this.formBuilder.group({
      branch: ['', Validators.required],
    });
  }

  createBranch(){
    this.spinner.show();
    let formdata = {
      branch: this.branchformGroup.value.branch,
      orgid: this.orgId
    }
    this.manageBranchDetailsService.createBranchDetails(formdata).subscribe(data =>{
      if(data.map.statusMessage == "Success"){
        this.utilsService.openSnackBarAC("New Branch Created Successfully","OK");
        this.dialogRef.close({ data: true})
      }
      else if(data.map.statusMessage == "Failed"){
        this.utilsService.openSnackBarMC("Failed to create a new branch details","OK")
      }
      else if(data.map.statusMessage == "Error"){
        this.utilsService.openSnackBarMC("Error while creating new details","OK");
      }
    })
  }
}
