import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { NotificationService } from 'src/app/services/notification.service';
import { RegisterService } from 'src/app/services/register.service';
import { UtilService } from 'src/app/services/util.service';
import moment from 'moment';
import { ManageOrgService } from 'src/app/services/super-admin/manage-org/manage-org.service';
@Component({
  selector: 'app-my-account-common-dialog',
  templateUrl: './my-account-common-dialog.component.html',
  styleUrls: ['./my-account-common-dialog.component.less']
})
export class MyAccountCommonDialogComponent implements OnInit {
upgrade:boolean;
renew: boolean;
plan: any;
  Emp_name: string;
  Emp_id: string;
  Org_id: string;
  constructor( public dialogRef: MatDialogRef<MyAccountCommonDialogComponent>,
    private formBuilder: UntypedFormBuilder,
    @Inject(MAT_DIALOG_DATA) public data,
    public dialog: MatDialog,
    private manageOrgService: ManageOrgService,
    private utilsService: UtilService,
    private router: Router,
    private spinner: NgxSpinnerService,
    private notificationService: NotificationService,) {
      // console.log(this.data.plan);
     }

  ngOnInit() {
    this.Emp_id = localStorage.getItem('Id');
    this.Emp_name = localStorage.getItem('Name');
    this.Org_id = localStorage.getItem('OrgId');
    if (this.data.header == "upgrade") {
      this.upgrade = true;
      this.plan = this.data.plan;
    }
    else if(this.data.header == "renew") {
      this.renew = true;
      this.plan = this.data.plan;
    }
  }
  pricingPlandetails = [];
  orgdetails = [];

  getOrgdetailsByid(){
    this.spinner.show();
    this.pricingPlandetails = [];
    this.orgdetails = [];
    this.manageOrgService.getOrgDetailsById(this.Org_id).subscribe(data =>{
      if(data.map.statusMessage == "Success"){
        let response: any = [];
        response =  JSON.parse(data.map.data);
        this.orgdetails = response;
        // console.log(response);
        this.pricingPlandetails = response.pricingPlanDetails;
        // console.log(this.pricingPlandetails)
      }
    })
  }

  //for upgrade plan details
  upgradeplanstatus(){
    this.spinner.show();
    let formdata = {
      "org_id": this.data.id,
      "plan_id": this.data.plan.id,
    }
   
    this.manageOrgService.updateplanupgradestatus(formdata).subscribe(data =>{
      if(data.map.statusMessage == "Success"){
        this.utilsService.openSnackBarAC("Upgrade pricing plan request submitted successfully","Ok");
        this.router.navigate(["/update-plan"]);
        this.dialog.closeAll();
       
      }
      else{
        this.utilsService.openSnackBarMC("Failed to submit request for upgrade pricing plan","Ok");
      }
      this.spinner.hide();
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
      this.dialog.closeAll();
    })
  }

  //for renew plan details
  renewplan(){
    this.spinner.show();
    this.manageOrgService.updateplanrenewalstatus(this.data.id).subscribe(data =>{
      if(data.map.statusMessage == "Success"){
        this.utilsService.openSnackBarAC("Renew pricing plan request submitted successfully","Ok");
        // this.notification();
        this.dialog.closeAll();
      }
      else{
        this.utilsService.openSnackBarMC("Failed to submit request for renew pricing plan","Ok");
      }
      this.spinner.hide();
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
      this.dialog.closeAll();
    })
  }

  notification(){
    let zone = moment.tz.guess();
    let message, submodule;
    if(this.data.header == "upgrade"){
       message = this.data.org_name +" submitted the request for the upgrade pricing plan to "+ this.plan.plan+".";
       submodule = "Upgrade_plan";
    }
    else if(this.data.header == "renew"){
      message = this.data.org_name +" requested to renew the current pricing plan of "+ this.plan.plan+".";
      submodule = "Renew_plan"
    }
    let formdata = {
     "org_id": 1,
     "message": message,
     "to_notify_id": 1,
     "notifier": this.Emp_id,
     "module_name": "Manage-org",
     "sub_module_name": submodule,
    //  "timesheet_id" : this.plan,
     "date_of_request" :  moment(new Date()).format("YYYY-MM-DD"),
     "approval_status" : "Pending",
     "timezone":zone
    }
    this.notificationService.postNotification(formdata).subscribe(data =>{
      if(data.map.statusMessage == "Success"){
      }
      else{
      }
    })
  }
}
