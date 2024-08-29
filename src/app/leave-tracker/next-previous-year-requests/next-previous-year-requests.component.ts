import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-next-previous-year-requests',
  templateUrl: './next-previous-year-requests.component.html',
  styleUrls: ['./next-previous-year-requests.component.less']
})
export class NextPreviousYearRequestsComponent implements OnInit {
header: any;
year: any;
count: any;
content: any;
  constructor(@Inject(MAT_DIALOG_DATA) public data,
  public dialogRef: MatDialogRef<any>) { }

  ngOnInit() {
    this.year = this.data.year;
    this.count = this.data.count;
    this.header = "Leave request for "+this.year;
    this.content = this.count+" Pending request for the "+this.year;
  }

redirect(){
    this.dialogRef.close({ data: this.year});
  }

}
