import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-view-job',
  templateUrl: './view-job.component.html',
  styleUrls: ['./view-job.component.less']
})
export class ViewJobComponent implements OnInit {
 description:string;
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private spinner: NgxSpinnerService
  ) { 
    this.description = this.data.description;
  }

  assignees:any[]=[];
  isBill:Boolean = false;
  ngOnInit() {
    this.assignees = this.data.jobAssigneeDetails;
    // console.log(this.data);
    if(this.data.bill == "")
    this.isBill = false ;
    else this.isBill  = true;
  }

}
