import { Component, OnInit, Inject, ViewEncapsulation } from '@angular/core';
import {MatDialog, MatDialogRef,MAT_DIALOG_DATA} from '@angular/material/dialog';

@Component({
  selector: 'app-preview-notes',
  templateUrl: './preview-notes.component.html',
  styleUrls: ['./preview-notes.component.less']
})
export class PreviewNotesComponent implements OnInit {

  isInternActiveId : boolean = false;
  description:any;

  constructor(
    public dialogRef:MatDialogRef<PreviewNotesComponent>,
    @Inject(MAT_DIALOG_DATA)public data:any) {
      this.isInternActiveId = data.activateId;
      this.description = data.description;
     }

  ngOnInit() {
  }

}
