import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { SettingsService } from 'src/app/services/settings.service';
import { UtilService } from 'src/app/services/util.service';

@Component({
  selector: 'app-activate-client-user',
  templateUrl: './activate-client-user.component.html',
  styleUrls: ['./activate-client-user.component.less']
})
export class ActivateClientUserComponent implements OnInit {
  header: string;
  
  constructor(
    private settingsService: SettingsService,
    public dialogRef: MatDialogRef<ActivateClientUserComponent>,
    @Inject(MAT_DIALOG_DATA) public data,
    private utilsService: UtilService,
    private spinner: NgxSpinnerService,
    private formBuilder: UntypedFormBuilder,
    private router : Router,

  ) { }

  deactivateformgroup: UntypedFormGroup = this.formBuilder.group({
    comments: ['', []]
  });

  clientActDeact2:boolean = false;
  ngOnInit() {

    if (this.data.value == "activate") {
      this.header = "Activate User"
      this.clientActDeact2 =true;
    }
    else if (this.data.value =="activate client"){
      this.header ="Client Activate"
      this.clientActDeact2 =true;
    }
  }
  activateformgroup: UntypedFormGroup = this.formBuilder.group({
    comments: ['', []]
  });
  
  action() {
    if (this.data.value == "activate")
      this.activateUser();
    else if(this.data.value =="activate client"){
      this.activateClient();
    }
  }

  activateUser() {
    this.spinner.show();
    let data: Object = {
      "id": localStorage.getItem("EmpDeleteId"),
      "status": "activated",
      "comments": this.activateformgroup.value.comments,     
      "login_str":this.data.login_str
    }

    this.settingsService.activateEmployee(data).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        this.utilsService.openSnackBarAC("Employee activated successfully", "OK");
        this.dialogRef.close();
      }
      else {
        this.utilsService.openSnackBarMC("Faild to activate employee", "OK");
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
      "comments": this.activateformgroup.value.comments,
    }
    this.settingsService.activateClient(data).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        this.utilsService.openSnackBarAC("Client activated successfully", "OK");
        this.dialogRef.close();
      }
      else {
        this.utilsService.openSnackBarMC("Faild to activate client", "OK");
      }
      this.spinner.hide();
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
      this.dialogRef.close();
    })
  }
}
