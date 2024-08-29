import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-org-user-limit-component',
  templateUrl: './org-user-limit-component.component.html',
  styleUrls: ['./org-user-limit-component.component.less']
})
export class OrgUserLimitComponentComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<any>,
    @Inject(MAT_DIALOG_DATA) public data: any,) { }

  ngOnInit(): void {
  }
  close(){
    this.dialogRef.close({data:true});
  }

}
