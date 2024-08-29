import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-error-alert-dialog',
  templateUrl: './error-alert-dialog.component.html',
  styleUrls: ['./error-alert-dialog.component.less']
})
export class ErrorAlertDialogComponent implements OnInit {

  alertForRoleIssue:Boolean = false;

  constructor(@Inject(MAT_DIALOG_DATA) public data: any,) { }

  ngOnInit() {
    if(this.data == "roleError"){
      this.alertForRoleIssue = true;
    }
  }

}
