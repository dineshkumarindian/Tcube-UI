import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { SettingsService } from 'src/app/services/settings.service';
import { UtilService } from 'src/app/services/util.service';

@Component({
  selector: 'app-activate-deactivate',
  templateUrl: './activate-deactivate.component.html',
  styleUrls: ['./activate-deactivate.component.less']
})
export class ActivateDeactivateComponent implements OnInit {
  header: string;
  
  constructor(
    private settingsService: SettingsService,
    public dialogRef: MatDialogRef<ActivateDeactivateComponent>,
    @Inject(MAT_DIALOG_DATA) public data,
    private utilsService: UtilService,
    private spinner: NgxSpinnerService,
    private formBuilder: UntypedFormBuilder,
    private router : Router,

  ) { }

  deactivateformgroup: UntypedFormGroup = this.formBuilder.group({
    comments: ['', []]
  });
  
  clientActDeact:boolean = false;

  clientActDeact1:boolean = false;

  clientActDeact2:boolean = false;
  ngOnInit() {
    if (this.data == "activate") {
      this.header = "Activate User"
      this.clientActDeact2 =true;
    }
    else if(this.data == "deactivate"){
      this.header = "Deactivate User"
      this.clientActDeact1 =true;
    }
    else if (this.data =="activate client"){
      this.header ="Client Activate"
      this.clientActDeact2 =true;
    }
    else if (this.data=="deactivate client"){
      this.header = "Client Deactivate"
      this.clientActDeact1 =true;
    }
    else if(this.data == "deactivate leavetype"){
      this.header = "Leave Type Deactivate";
      this.clientActDeact =true;
    }else if(this.data == "activate leavetype"){
      this.header = "Leave Type Activate";
      this.clientActDeact =true;
    }
  }
  action() {
    if (this.data == "activate")
      this.activateUser();
    else if(this.data == "deactivate"){
       this.deactivateUser();
    }
    else if(this.data =="activate client"){
      this.activateClient();
    }
    else if (this.data=="deactivate client"){
      this.deactivateClient();
    }else if(this.data == "deactivate leavetype"){
      this.deactivateLeaveType();
    }else if(this.data == "activate leavetype"){
      this.activateLeaveType();
    }
  }

  activateUser() {
    this.spinner.show();
    let id = localStorage.getItem("EmpDeleteId");
    this.settingsService.activateEmployee(id).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        this.utilsService.openSnackBarAC("Employee activated successfully", "OK");
        this.dialogRef.close();
      }
      else {
        this.utilsService.openSnackBarMC(data.map.data, "OK");
      }
      this.spinner.hide();
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
      this.dialogRef.close();
    })
  }
  deactivateUser() {
    this.spinner.show();
    let data: Object = {
      "id": localStorage.getItem("EmpDeleteId"),
      "status": "activated",
      "comments": this.deactivateformgroup.value.comments,
    }
    this.settingsService.deactivateEmployee(data).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        this.utilsService.openSnackBarAC("Employee deactivated successfully", "OK");
        this.dialogRef.close();
      }
      else {
        this.utilsService.openSnackBarMC(data.map.data, "OK");
      }
      this.spinner.hide();
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
      this.dialogRef.close();
    })
  }

  // Client
  activateClient() {
    this.spinner.show();
    let data: Object = {
      "id": localStorage.getItem("clientId"),
      "status": "activated",
      "comments": this.deactivateformgroup.value.comments,
    }
    this.settingsService.activateClient(data).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        this.utilsService.openSnackBarAC("Client activated successfully", "OK");
        this.dialogRef.close();
      }
      else {
        this.utilsService.openSnackBarMC(data.map.data, "OK");
      }
      this.spinner.hide();
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
      this.dialogRef.close();
    })
  }
  deactivateClient() {
    this.spinner.show();
    let data: Object = {
      "id": localStorage.getItem("clientId"),
      "status": "activated",
      "comments": this.deactivateformgroup.value.comments,
    }
    this.settingsService.deactivateClient(data).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        this.utilsService.openSnackBarAC("Client deactivated successfully", "OK");
        this.dialogRef.close();
      }
      else {
        this.utilsService.openSnackBarMC(data.map.data, "OK");
      }
      this.spinner.hide();
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
      this.dialogRef.close();
    })
  }

  activateLeaveType() {
    this.spinner.show();
    let data: object={
      "id":localStorage.getItem('leavetypeId'),
      "status": "activated",
      "comment": this.deactivateformgroup.value.comments,
    }
    this.settingsService.actDeactLeaveType(data).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        this.utilsService.openSnackBarAC("Leave type activated successfully", "OK");
        this.dialogRef.close();
      }
      else {
        this.utilsService.openSnackBarMC("Faild to activate leave type", "OK");
      }
      this.spinner.hide();
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
      this.dialogRef.close();
    })
  }
  deactivateLeaveType() {
    this.spinner.show();
    let data: object={
      "id":localStorage.getItem('leavetypeId'),
      "status": "deactivated",
      "comment": this.deactivateformgroup.value.comments,
    }
    this.settingsService.actDeactLeaveType(data).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        this.utilsService.openSnackBarAC("Leave type deactivated successfully", "OK");
        this.dialogRef.close();
      }
      else {
        this.utilsService.openSnackBarMC("Faild to deactivate leave type", "OK");
      }
      this.spinner.hide();
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
      this.dialogRef.close();
    })
  }
}
