import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { SettingsService } from '../../services/settings.service';
import { RegisterService } from '../../services/register.service';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.less']
})
export class WelcomeComponent implements OnInit {
  
  constructor(
    private SettingsService: SettingsService, 
    public dialogRef: MatDialogRef<any>, 
    public router: Router, 
    private RegisterService: RegisterService, 
    private spinner: NgxSpinnerService, 
    ) {

  }

  btnClick() {
    this.spinner.show();
    setTimeout(() => {
      this.router.navigate(["/settings"]);
    }, 1000);

  }
  
  showPopup(){
    this.dialogRef.close({ data: true})
  }

  hidePopup(){
    this.dialogRef.close({ data: false})
  }
  ngOnInit() {
  
  }

}
