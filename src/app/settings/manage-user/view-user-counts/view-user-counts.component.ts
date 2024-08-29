import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-view-user-counts',
  templateUrl: './view-user-counts.component.html',
  styleUrls: ['./view-user-counts.component.less']
})
export class ViewUserCountsComponent implements OnInit {

  list :any[]=[];
  inactiveUser:boolean = false;
  headerData: string;
  constructor(
    public dialogRef: MatDialogRef<ViewUserCountsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) { }

  ngOnInit() {
    if(this.data.inactiveUser == false){
      this.headerData = "View Active User Counts";
    }else{
      this.headerData = "View Inactive User Counts";
    }
    this.list = this.data.list;
    this.inactiveUser =this.data.inactiveUser;
  }
  getColor(i){
    return this.data.list[i].color;
  }
}
