import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-refresh-dialog',
  templateUrl: './refresh-dialog.component.html',
  styleUrls: ['./refresh-dialog.component.less']
})
export class RefreshDialogComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<any>,
    @Inject(MAT_DIALOG_DATA) public data: any,) { }

  ngOnInit(): void {
  }
  refresh(){
    this.dialogRef.close({data:true});
  }

}
