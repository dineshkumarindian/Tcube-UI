import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';

@Component({
  selector: 'app-common-reminder-dialog',
  templateUrl: './common-reminder-dialog.component.html',
  styleUrls: ['./common-reminder-dialog.component.less']
})
export class CommonReminderDialogComponent implements OnInit {

  constructor(
    public router: Router,
    public dialog : MatDialogRef<CommonReminderDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) { }

  ngOnInit() {
    // console.log(this.data);
  }

  redirecctTo(){
    this.dialog.close();
    this.router.navigate(['/my-day-planner']);
  }
}
