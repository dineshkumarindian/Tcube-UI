import { Component, Inject, OnInit,ViewEncapsulation } from '@angular/core';
import {MatDialog, MatDialogRef,MAT_DIALOG_DATA} from '@angular/material/dialog';
@Component({
  selector: 'app-preview-offer',
  templateUrl: './preview-offer.component.html',
  styleUrls: ['./preview-offer.component.less']
})
export class PreviewOfferComponent implements OnInit {

  isOfferLetterActiveId :boolean = false;
  description : any;
  annexure_details:any;
  // description1 ; any;
  // description2 : any;
  constructor(public dialogRef: MatDialogRef<PreviewOfferComponent>,@Inject(MAT_DIALOG_DATA)public data:any ) {
    this.isOfferLetterActiveId = data.activateId;
    this.description = data.description;
    this.annexure_details = data.annexure_details;
    // this.description2 = data.description2;
    console.log(data);
     }

  ngOnInit() {
  }

  onNoClick(): void {
    this.dialogRef.close();
    }

 }
