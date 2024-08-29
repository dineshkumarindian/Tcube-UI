import { Component, Inject, OnInit } from '@angular/core';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatDialogRef} from '@angular/material/dialog';

@Component({
  selector: 'app-register-common-dialog',
  templateUrl: './register-common-dialog.component.html',
  styleUrls: ['./register-common-dialog.component.less']
})
export class RegisterCommonDialogComponent implements OnInit {

  heading: any;
  plandetails: any[];
  constructor(@Inject(MAT_DIALOG_DATA) public data,
  public dialogRef: MatDialogRef<RegisterCommonDialogComponent>,
              public dialog: MatDialog,) { }

  ngOnInit() {
    this.heading = this.data[0];
    this.plandetails = this.data[1];
  }
  cancel(): void{
    this.dialogRef.close({data:'Cancel'});
  }
}
