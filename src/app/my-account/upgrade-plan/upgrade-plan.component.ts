import { Component, OnInit } from '@angular/core';
import { ManagePricingPlanService } from 'src/app/services/super-admin/manage-pricing-plan/manage-pricing-plan.service';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { RegisterService } from 'src/app/services/register.service';
import { MyAccountCommonDialogComponent } from '../my-account-common-dialog/my-account-common-dialog.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-upgrade-plan',
  templateUrl: './upgrade-plan.component.html',
  styleUrls: ['./upgrade-plan.component.less']
})
export class UpgradePlanComponent implements OnInit {
  Org_id: string;
  pricingPlandetails: any = [];
  pricing_modules:any;

  constructor( private registerService: RegisterService,private spinner: NgxSpinnerService,
    private managePricingPlanService: ManagePricingPlanService,
    private router: Router,
    private dialog: MatDialog,
  ) { }

  ngOnInit(): void {
    this.Org_id = localStorage.getItem('OrgId');
    this.getOrgdetailsByid();
    this.getAllPlanDetails();
  }
  active_plan:any;
  orgdetails: any = [];

  getOrgdetailsByid(){
    this.spinner.show();
    this.registerService.getOrgDetailsById(this.Org_id).subscribe(data =>{
      if(data.map.statusMessage == "Success"){
        let response: any = [];
        response =  JSON.parse(data.map.data);
        this.orgdetails = response;
        this.pricingPlandetails = response.pricingPlanDetails;
          let word = this.pricingPlandetails.currency;
          this.pricingPlandetails.currency = word.split(' ').pop();
           this.pricingPlandetails.modules = JSON.parse(this.pricingPlandetails.modules);
            this.pricing_modules = this.pricingPlandetails.modules;
           this.active_plan = this.pricingPlandetails.plan;
       
         
        this.spinner.hide();
      }
      
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
    })
  }

  allplandetails = [];
  //get pricing plan details 
  getAllPlanDetails(){
    this.spinner.show();
    this.allplandetails = [];
    this.managePricingPlanService.getAllPlanDetails().subscribe(data => {
      if(data.map.statusMessage == "Success"){
        let response: any[] = JSON.parse(data.map.data);
        this.allplandetails = response;
        // console.log(this.allplandetails);
        for(var i=0;i<this.allplandetails.length;i++){
         let word = this.allplandetails[i].currency;
         this.allplandetails[i].currency = word.split(' ').pop();
          this.allplandetails[i].modules = JSON.parse(this.allplandetails[i].modules);
        }
        // console.log(this.allplandetails);
        this.spinner.hide();
        // console.log(this.allplandetails);
      }
      else{
        this.spinner.hide();
      }
    
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
    })
  }

  openUpgradeplan(plan) {
    const dialogRef = this.dialog.open(MyAccountCommonDialogComponent, {
      width: '40%',
      // height: '235px',
      panelClass: 'custom-macommondialogstyle',
      data: { header : "upgrade",id:this.orgdetails.org_id,plan:plan,org_name:this.orgdetails.company_name},
    });
    dialogRef.afterClosed().subscribe(
      resp => { 
      }
    );
  }
}
