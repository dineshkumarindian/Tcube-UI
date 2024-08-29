import { Component, Inject, OnInit } from '@angular/core';
import { FormGroup ,FormBuilder,Validators} from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import {viewIntegration} from '../constants';

@Component({
  selector: 'app-view-integration',
  templateUrl: './view-integration.component.html',
  styleUrls: ['./view-integration.component.less']
})
export class ViewIntegrationComponent implements OnInit {
  viewIntegration = viewIntegration;
  data:any;
  constructor(
    public dialogRef: MatDialogRef<any>,
    @Inject(MAT_DIALOG_DATA) public alldata: any,
  ) { }

  ngOnInit() {
     this.data = this.alldata.details;
    if(this.alldata.component === "whatsapp"){
      this.data.numbers = JSON.parse((this.data).numbers);
    }
  }

}
