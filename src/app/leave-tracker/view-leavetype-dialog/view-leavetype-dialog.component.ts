import { Component, OnInit,Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-view-leavetype-dialog',
  templateUrl: './view-leavetype-dialog.component.html',
  styleUrls: ['./view-leavetype-dialog.component.less']
})
export class ViewLeavetypeDialogComponent implements OnInit {
  
  allLeaveTypes:any;

  constructor(public dialogRef: MatDialogRef<any>,
    @Inject(MAT_DIALOG_DATA) public data: any) {
     }

  ngOnInit(): void {
    this.allLeaveTypes = this.data.leavetypes;
  }

}
