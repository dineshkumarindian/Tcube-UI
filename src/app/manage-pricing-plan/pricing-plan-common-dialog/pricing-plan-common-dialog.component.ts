import { Component, Inject, OnInit } from '@angular/core';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NgxSpinnerService } from 'ngx-spinner';
import { ManagePricingPlanService } from '../../services/super-admin/manage-pricing-plan/manage-pricing-plan.service';
import { UtilService } from 'src/app/services/util.service';

@Component({
  selector: 'app-pricing-plan-common-dialog',
  templateUrl: './pricing-plan-common-dialog.component.html',
  styleUrls: ['./pricing-plan-common-dialog.component.less']
})
export class PricingPlanCommonDialogComponent implements OnInit {
heading:any;
pricingPlanDetails:any =[];
  constructor(@Inject(MAT_DIALOG_DATA) public data,
  public dialog: MatDialog,
  private spinner: NgxSpinnerService,
  private managePricingPlanService: ManagePricingPlanService,
  private utilService: UtilService,) { }

  ngOnInit() {
    this.heading = this.data.header;
    this.pricingPlanDetails = this.data.data;
  }


  // //bulk delete
  // bulkdelete(){
  //   this.spinner.show()
  //   let ids = {
  //     "deleteIds": this.data.data
  //   }
  //   this.managePricingPlanService.bulkDeleteByIds(ids).subscribe(data =>{
  //     // console.log(data);
  //     if(data.map.statusMessage == "Success"){
  //       this.utilService.openSnackBarAC("Pricing plan details bulk deleted successfully","OK");
  //       this.dialog.closeAll();
  //     }
  //     else{
  //       this.utilService.openSnackBarAC("Failed to bulk delete pricing plan details","OK");
  //     }
  //     this.spinner.show();
  //   })
  // }
}
