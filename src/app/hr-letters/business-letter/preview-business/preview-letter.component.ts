
// <!----- preview business_letter ----->

import { Component, Inject, OnInit,ViewEncapsulation} from '@angular/core';
import {MatDialog, MatDialogRef,MAT_DIALOG_DATA} from '@angular/material/dialog';

@Component({
  selector: 'app-preview-letter',
  templateUrl: './preview-letter.component.html',
  styleUrls: ['./preview-letter.component.less'],
  encapsulation:ViewEncapsulation.None
})
export class PreviewLetterComponent implements OnInit {
  isInternActiveId : boolean = false;
  description:any;
  constructor(public dialogRef:MatDialogRef<PreviewLetterComponent>,@Inject(MAT_DIALOG_DATA)public data:any) {
    // console.log("the data is..",data);
    console.log(data);
    this.isInternActiveId = data.activateId;
    this.description = data.description;
   }

  ngOnInit() {
  
  }

}
