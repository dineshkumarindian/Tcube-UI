
import { Component, Inject, OnInit } from '@angular/core';
import { FormGroup ,FormBuilder,Validators} from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import {pauseContentMsg,pauseIntegration,resumeIntegration,resumeContentMsg} from '../constants';

@Component({
  selector: 'app-pause-resume-integration',
  templateUrl: './pause-resume-integration.component.html',
  styleUrls: ['./pause-resume-integration.component.less']
})
export class PauseResumeIntegrationComponent implements OnInit {
  
  pauseIntegration = pauseIntegration;
  pauseContent = pauseContentMsg;
  resumeIntegration = resumeIntegration;
  resumeContent = resumeContentMsg; 

  isPaused :string;

  constructor(
    public dialogRef: MatDialogRef<any>,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {
    // sconsole.log(data);
  }

  ngOnInit() {
    let isPaused = this.data.status;
    if(isPaused == "pause"){
      this.isPaused = "pause";
    } else{
      this.isPaused = "resume";

    }
  }

  pauseOrResume(){
    this.dialogRef.close({ data: true})
  }

}
