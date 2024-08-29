import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-pause-resume',
  templateUrl: './pause-resume.component.html',
  styleUrls: ['./pause-resume.component.less']
})
export class PauseResumeComponent implements OnInit {
  component: any;
  status: any;

  constructor(
    public dialogRef: MatDialogRef<any>,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) { }

  ngOnInit() {
    this.component = this.data.component;
    this.status = this.data.status;
  }

  pauseOrResume(){
    this.dialogRef.close({ data: true})
  }

}
