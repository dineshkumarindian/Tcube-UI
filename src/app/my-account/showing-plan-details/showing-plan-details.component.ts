import { Component, Inject, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { UtilService } from 'src/app/services/util.service';

@Component({
  selector: 'app-showing-plan-details',
  templateUrl: './showing-plan-details.component.html',
  styleUrls: ['./showing-plan-details.component.less']
})
export class ShowingPlanDetailsComponent implements OnInit {
  pricing_plan_modules:any; 
  constructor(public dialogRef: MatDialogRef<ShowingPlanDetailsComponent>,
    @Inject(MAT_DIALOG_DATA) public data,
    public dialog: MatDialog,
    private utilsService: UtilService,
    private router: Router,
    private spinner: NgxSpinnerService,) { 
      this.pricing_plan_modules = data.modules;
      // console.log(this.pricing_plan_modules)
    }

  ngOnInit(): void {
  }

}
