import { Component,Inject, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { SettingsService } from 'src/app/services/settings.service';
import { UtilService } from 'src/app/services/util.service';

@Component({
  selector: 'app-settings-bulk-active-deactive',
  templateUrl: './settings-bulk-active-deactive.component.html',
  styleUrls: ['./settings-bulk-active-deactive.component.less']
})
export class SettingsBulkActiveDeactiveComponent implements OnInit {

  bulkDeactivateClient: boolean = false;
   bulkActivateClient: boolean = false;
   bulkDeactivateUser:boolean = false;
  bulkActiveUser:boolean = false;

  constructor( @Inject(MAT_DIALOG_DATA) public data,
  private spinner: NgxSpinnerService,
  private settingsService: SettingsService,
  private utilsService: UtilService,
  private router : Router,
  public dialogRef: MatDialogRef<SettingsBulkActiveDeactiveComponent>,
  private formBuilder: UntypedFormBuilder) {
   }


  deactivateClientformgroup: UntypedFormGroup = this.formBuilder.group({
    comments: ['', []]
  });
  ngOnInit() {
    if(this.data.header == "clientActivate"){
      this.bulkActivateClient = true;
    } else if(this.data.header == "clientDeactivate"){
      this.bulkDeactivateClient = true;
    }else if(this.data.header == "activateUser") {
      this.bulkActiveUser =true;
    }else if(this.data.header == "deactivateUser"){
      this.bulkDeactivateUser = true;
  }
  }

  // bulkDeactiveClient 
  bulkDeactiveClientDetails() {
    this.spinner.show();
    let data: Object = {
      "deleteIds": this.data.deleteList,
      "action": "activated",
      "comments": this.deactivateClientformgroup.value.comments
    }
    this.settingsService.bulkDeactivateClientDetails(data).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        this.utilsService.openSnackBarAC("Deactivate client details successfully", "OK");
        this.dialogRef.close();
      }
      else {
        this.utilsService.openSnackBarMC("Failed to deactive client details", "OK");
      }
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
      this.dialogRef.close();
    })
    setTimeout(() => {
      this.spinner.hide();
    }, 2000);
  }
  // bulk active client
  bulkactiveClientDetails() {
    this.spinner.show();
    let data: Object = {
      "deleteIds": this.data.deleteList,
      "action": "deactivated",
      "comments": this.deactivateClientformgroup.value.comments
    }
    this.settingsService.bulkActivateClientDetails(data).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        this.utilsService.openSnackBarAC("Activate client details deleted successfully", "OK");
        this.dialogRef.close();
      }
      else {
        this.utilsService.openSnackBarMC("Failed to delete activate details", "OK");
      }
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
      this.dialogRef.close();
    })
    setTimeout(() => {
      this.spinner.hide();
    }, 2000);

  }

// bulk deactivate User
deactivateUser(){
  this.spinner.show();
  let data:Object ={
    "deleteIds": this.data.deleteList,
    "action":"activated",
    "comments":this.deactivateClientformgroup.value.comments
  }
  this.settingsService.bulkDeactivateUserDetails(data).subscribe(data =>{
    if (data.map.statusMessage == "Success") {
      this.utilsService.openSnackBarAC("Users details deactivated successfully", "OK");
      this.dialogRef.close();
    }
    else {
      this.utilsService.openSnackBarMC("Failed to deactive user details", "OK");
    }
     this.spinner.hide();
  }, (error) => {
    this.router.navigate(["/404"]);
    this.spinner.hide();
    this.dialogRef.close();
  })
}

// bulk activate User
activateUser() {
  this.spinner.show();
  let data:Object ={
    "deleteIds": this.data.deleteList,
    "action":"deactivated",
    "comments":this.deactivateClientformgroup.value.comments,
    "login_str":this.data.login_str
  }

  this.settingsService.bulkActivateUserDetails(data).subscribe(data =>{
    if (data.map.statusMessage == "Success") {
      this.utilsService.openSnackBarAC(" Users details activated successfully", "OK");
      this.dialogRef.close();
    }
    else {
      this.utilsService.openSnackBarMC("Failed to active Users details", "OK");
    }
     this.spinner.hide();
  }, (error) => {
    this.router.navigate(["/404"]);
    this.spinner.hide();
    this.dialogRef.close();
  })
}

}
