import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NgxSpinnerService } from 'ngx-spinner';
import { RegisterService } from 'src/app/services/register.service';
import { UtilService } from 'src/app/services/util.service';
import { RegisterCommonDialogComponent } from 'src/app/register/register-common-dialog/register-common-dialog.component';
import { NavigationEnd, Router } from '@angular/router';
import { SettingsService } from 'src/app/services/settings.service';
import { NotificationService } from 'src/app/services/notification.service';
import moment from 'moment';
import { ManagePricingPlanService } from 'src/app/services/super-admin/manage-pricing-plan/manage-pricing-plan.service';
import { ManageOrgService } from 'src/app/services/super-admin/manage-org/manage-org.service';
import { approvHeadMessage, approveContentMessage, rejectContetnMessage, rejectHeadMessage } from '../../util/constants';
@Component({
  selector: 'app-bulk-act-deact',
  templateUrl: './bulk-act-deact.component.html',
  styleUrls: ['./bulk-act-deact.component.less']
})
export class BulkActDeactComponent implements OnInit {

  approveHeadMsg = approvHeadMessage;
  approveContentMsg = approveContentMessage;
  rejectHeadMsg = rejectHeadMessage;
  rejectContent = rejectContetnMessage;

  active_plan: any;
  bulkDeactivate: boolean = false;
  bulkActivate: boolean = false;
  apprrove: boolean = false;
  reject: boolean = false;
  upgrade: boolean = false;
  bulkactivateformgroup: UntypedFormGroup;
  bulkdeactivateformgroup: UntypedFormGroup;
  statusFormgroup: UntypedFormGroup;
  upgradeplanFormgroup: UntypedFormGroup;
  renewplanFormgroup: UntypedFormGroup;
  isDeleted: boolean = false;
  isRejBulkDeleted: boolean = false;
  deleteId: any;
  listdata: any[] = [];
  selected_plan_module: any = [];
  selected_plan_id: number;

  public pricingarr: any = [];
  loginurl: string;
  loginstr: string;
  modifiedstring: string;
  login_str: string;
  renew: boolean;
  constructor(
    public dialogRef: MatDialogRef<BulkActDeactComponent>,
    private formBuilder: UntypedFormBuilder,
    @Inject(MAT_DIALOG_DATA) public data,
    private manageOrgService: ManageOrgService,
    private utilsService: UtilService,
    private router: Router,
    private spinner: NgxSpinnerService,
    private dialog: MatDialog,
    private managePricingPlanService: ManagePricingPlanService,
    private settingsService: SettingsService,
    private notificationService: NotificationService,
  ) {
    // for to get a current webpage url
    this.loginurl = window.location.href;
    this.modifiedstring = this.loginurl.slice(0, this.loginurl.length - 13);
    this.loginstr = "login";
    this.login_str = this.modifiedstring.concat(this.loginstr.toString());
  }
  pricingplandetails: any = [];
  ngOnInit() {
    setTimeout(() => {
      this.getAllPlanDetails();
    }, 200);
    if (this.data.header == "bulk-deactivate") {
      this.bulkDeactivate = true
      this.bulkdeactivateformgroup = this.formBuilder.group({
        comments: ['']
      });
    }
    else if (this.data.header == "bulk-activate") {
      this.bulkActivate = true;

      this.bulkactivateformgroup = this.formBuilder.group({
        comments: ['']
      });
    }
    else if (this.data.header == "Approved") {
      if (this.data.data.pricingPlanDetails) {
        this.pricingplandetails = this.data.data.pricingPlanDetails;
      }
      this.apprrove = true;
      this.statusFormgroup = this.formBuilder.group({
        statuscomments: ['']
      });
    }
    else if (this.data.header == "Rejected") {
      if (this.data.data.pricingPlanDetails) {
        this.pricingplandetails = this.data.data.pricingPlanDetails;
      }
      this.reject = true;
      this.statusFormgroup = this.formBuilder.group({
        statuscomments: ['', Validators.required]
      });
    }
    else if (this.data.header == "upgrade" || this.data.header == "upgradeRequest") {
      this.upgrade = true;
      this.active_plan = this.data.plan;
      this.upgradeplanFormgroup = this.formBuilder.group({
        plan: ['', Validators.required]
      });
      this.getallRolesbyOrgId(this.data.id);
      this.getOrgdetailsByid();
    }
    else if (this.data.header == "renew") {
      this.renew = true;
      this.active_plan = this.data.plan;
      this.selected_plan_id = this.data.plan_id;
      this.modified_plan_module = this.data.modules;
      this.renewplanFormgroup = this.formBuilder.group({
        plan: ['', Validators.required]
      });
      this.renewplanFormgroup.setValue({
        plan: this.active_plan
      })
      this.getOrgdetailsByid();
      // this.renewplanFormgroup.disable();
      this.getallRolesbyOrgId(this.data.id);
    } else if (this.data.isDel == "rejectedDelete") {
      this.isDeleted = true;
      let id = this.data.id;
      this.deleteId = id;
    } else if (this.data.isDel == "rejectedBulkDelete") {
      this.isRejBulkDeleted = true;
      let list = this.data.delList;
      this.listdata = list;
    }
  }


  // bulk deact for orgs
  deleteDetails() {
    this.spinner.show();
    let listdata = {
      "deleteIds": this.data.data,
      "comments": this.bulkdeactivateformgroup.value.comments,
      "login_str": this.login_str
    }

    if (this.data.header == "bulk-deactivate") {
      this.manageOrgService.bulkDeactivateOrg(listdata).subscribe(data => {
        if (data.map.statusMessage == "Success") {
          this.utilsService.openSnackBarAC("Organization details deactivated successfully", "OK");
          this.dialogRef.close();
        }
        else {
          this.utilsService.openSnackBarMC("Faild to deactivate organization details", "OK");
        }
        this.spinner.hide();
      }, (error) => {
        this.router.navigate(["/404"]);
        this.spinner.hide();
        this.dialogRef.close();
      })
    }
  }

  // Bulk act for orgs
  deleteDetails1() {
    this.spinner.show();
    let listdata = {
      "deleteIds": this.data.data,
      "comments": this.bulkactivateformgroup.value.comments,
      "login_str": this.login_str
    }

    if (this.data.header == "bulk-activate") {
      this.manageOrgService.bulkActivateOrg(listdata).subscribe(data => {
        if (data.map.statusMessage == "Success") {
          this.utilsService.openSnackBarAC("Organization details activated successfully", "OK");
          this.dialogRef.close();
        }
        else {
          this.utilsService.openSnackBarMC("Failed to activate organization details", "OK");
        }
        this.spinner.hide();
      }, (error) => {
        this.router.navigate(["/404"]);
        this.spinner.hide();
        this.dialogRef.close();
      })
    }
  }
  upgradeplanstatus() {
    this.spinner.show();
    let formdata = {
      "org_id": this.data.id,
      "plan_id": this.selected_plan_id,
    }
    this.manageOrgService.updateplanupgradestatus(formdata).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        this.utilsService.openSnackBarAC("Request for upgrade pricing plan details submitted successfullly", "Ok");
        // this.notification();
        // this.dialog.closeAll();
        this.dialogRef.close({ data: "Success" });
      }
      else {
        this.utilsService.openSnackBarMC("Failed to submit request for upgrade pricing plan details", "Ok");
      }
      this.spinner.hide();
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
      this.dialog.closeAll();
    })
  }
  //to update the status of the org details
  async updatestatus(status: any) {
    // debugger;
    this.spinner.show();
    let header = status;
    let comment = this.statusFormgroup.value.statuscomments;
    let formdata = {
      "id": this.data.data.org_id,
      "status": header,
      "comments": comment,
      "login_str": this.login_str
    }
    this.manageOrgService.updateStatus(formdata).subscribe(data => {
      if(data.map.statusMessage == "Success" && data.map.Error == "Error in sending mail due to mail configuration issue,check the configuration details") {
        this.dialogRef.close();
        if (this.apprrove) {
          this.utilsService.openSnackBarMC("Mail configuration issue encountered while approving organization", "OK");
         // this.dialogRef.close();
        }
        if (this.reject) {
          // this.utilsService.openSnackBarAC("Org details rejected successfully", "OK");
          this.utilsService.openSnackBarMC("Mail configuration issue encountered while rejecting organization", "OK");
          // this.dialogRef.close();
        }
      } else if (data.map.statusMessage == "Success") {
        this.dialogRef.close();
        if (this.apprrove) {
          this.utilsService.openSnackBarAC("Organization details approved successfully", "OK");
          setTimeout(() => { 
            this.dialogRef.close();
            this.spinner.hide(); 
          }, 500);
        }
        if (this.reject) {
          this.utilsService.openSnackBarAC("Organization details rejected successfully", "OK");
          setTimeout(() => { 
            this.dialogRef.close();
            this.spinner.hide(); 
          }, 500);
        }
      }
      else {
        if (this.apprrove) {
          this.utilsService.openSnackBarMC("Failed to approve organization details", "OK");
        }
        if (this.reject) {
          this.utilsService.openSnackBarMC("Failed to reject organization details", "OK");
        }
        this.spinner.hide();
      }
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
      this.dialogRef.close();
    })
  }

  modified_plan_module: any[] = [];
  //add unique settings module
  addSettings() {
    for (var i = 0; i < this.modified_plan_module.length; i++) {
      if (this.modified_plan_module[i] == "project/jobs") {
        this.modified_plan_module.splice(i + 1, 0, "client-settings");
        i = i + 1;
      }
      else if (this.modified_plan_module[i] == "time-tracker") {
        this.modified_plan_module.splice(i + 1, 0, "time-tracker-settings");
        i = i + 1;
      }
      else if (this.modified_plan_module[i] == "leave-tracker") {
        this.modified_plan_module.splice(i + 1, 0, "leave-tracker-settings");
        i = i + 1;
      }
      else if (this.modified_plan_module[i] == "attendance") {
        this.modified_plan_module.splice(i + 1, 0, "attendance-settings");
        i = i + 1;
      }
      else if (this.modified_plan_module[i] == "day-planner") {
        this.modified_plan_module.splice(i + 1, 0, "my-day-planner");
        this.modified_plan_module.splice(i + 2, 0, "day-planner-settings");
        i = i + 2;
      }
      else if (this.modified_plan_module[i] == "company-policy") {
        this.modified_plan_module.splice(i + 1, 0, "company-policy-settings");
        i = i + 1;
      }
    }
  }

  openpricingdetails() {
    let heading = this.upgradeplanFormgroup.value.plan + " - " + "Pricing details"
    let plandetails: any = [];
    for (var i = 0; i < this.allplandetails.length; i++) {
      if (this.upgradeplanFormgroup.value.plan == this.allplandetails[i].plan) {
        plandetails.push(this.allplandetails[i]);
        this.selected_plan_module = this.allplandetails[i].modules;
        this.selected_plan_id = this.allplandetails[i].id;
        this.modified_plan_module = this.allplandetails[i].modules;
      }
    }
    this.dialog.open(RegisterCommonDialogComponent, {
      width: '30%',
      // height: '85%',
      panelClass: 'custom-viewdialogstyle',
      data: [heading, plandetails]
    });
    if (this.data.header != "upgradeRequest") {
      this.compareRolesWithNewplan();
    }
  }

  // function to renew pricing plan dialog plan open
  openpricingdetailsforrenewal() {
    let heading = this.renewplanFormgroup.value.plan + " - " + "Pricing details"
    let plandetails: any = [];
    for (var i = 0; i < this.allplandetails.length; i++) {
      if (this.renewplanFormgroup.value.plan == this.allplandetails[i].plan) {
        plandetails.push(this.allplandetails[i]);
        this.selected_plan_module = this.allplandetails[i].modules;
        this.selected_plan_id = this.allplandetails[i].id;
        this.modified_plan_module = this.allplandetails[i].modules;
      }
    }
    this.dialog.open(RegisterCommonDialogComponent, {
      width: '30%',
      // height: '85%',
      panelClass: 'custom-viewdialogstyle',
      data: [heading, plandetails]
    });
    this.compareRolesWithNewplan();
  }
  url: any = [];
  //to update the plan of the org details
  updateplandetails() {
    this.spinner.show();
    this.addSettings();
    this.url = window.location.href;
    this.url = this.url.split("/");
    let formdata = {
      "id": this.data.id,
      "plan_id": this.selected_plan_id,
      "planrequest": this.data.req,
      "modules": JSON.stringify(this.modified_plan_module),
      "url": this.url[2]
    }
    this.manageOrgService.updatePlan(formdata).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        if (this.data.req == "upgrade") {
          this.utilsService.openSnackBarAC("Plan was upgraded", "OK");
          this.notification();
          this.compareRolesWithNewplan();
        }
        if (this.data.req == "renew") {
          this.notification();
          this.utilsService.openSnackBarAC("Plan renewed successfully", "OK");
        }
      }
      else {
        if (this.data.req == "upgrade") {
          this.utilsService.openSnackBarMC("Failed to update organization pricing plan details", "OK");
        }
        if (this.data.req == "renew") {
          this.utilsService.openSnackBarMC("Failed to renew organization pricing plan details", "OK");
        }
      }
      this.dialogRef.close();
      setTimeout(() => {
        this.spinner.hide();
      }, 2000);
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
      this.dialogRef.close();
    }
    )

  }

  panelOpenState: boolean = false;
  togglePanel() {
    this.panelOpenState = !this.panelOpenState;
  }

  deleteRejectedOrgDetails() {
    this.spinner.show();
    let rejDate = {
      "org_id": this.deleteId
    }
    this.manageOrgService.deleteOrgRejected(rejDate).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        this.utilsService.openSnackBarAC("Rejected organization details deleted successfully", "OK");
        this.dialogRef.close();
      } else {
        this.utilsService.openSnackBarMC("Failed to delete rejected organization details", "OK");
      }
      this.spinner.hide();
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
      this.dialogRef.close();
    })
  }
  bulkDeleteRejectedOrgDetails() {
    this.spinner.show();
    let rejDate = {
      "deleteIds": this.listdata
    }
    this.manageOrgService.bulkDeleteOrgRejected(rejDate).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        this.utilsService.openSnackBarAC("Rejected organization details deleted successfully", "OK");
        this.dialogRef.close();
      } else {
        this.utilsService.openSnackBarMC("Failed to delete rejected organization details", "OK");
      }
      this.spinner.hide();
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
      this.dialogRef.close();
    })
  }

  //get active pricing plan details
  allplandetails: any = [];
  getAllPlanDetails() {
    this.spinner.show();
    this.allplandetails = [];
    this.managePricingPlanService.getAllPlanDetails().subscribe(data => {
      if (data.map.statusMessage == "Success") {
        let response: any[] = JSON.parse(data.map.data);
        this.allplandetails = response;
        for (var i = 0; i < this.allplandetails.length; i++) {
          let word = this.allplandetails[i].currency;
          this.allplandetails[i].currency = word.split(' ').pop();
          this.allplandetails[i].modules = JSON.parse(this.allplandetails[i].modules);
          if (this.allplandetails[i].plan != "Trial plan") {
            this.pricingarr.push({ "name": this.allplandetails[i].plan, "id": this.allplandetails[i].id })
          }
        }
      }
      else {
      }
      this.spinner.hide();
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
    })
  }

  //get all role details based on the orgid
  roleDetails: any = [];
  getallRolesbyOrgId(id) {
    this.settingsService.getActiveRoleDetailsByClientId(id).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        let response = JSON.parse(data.map.data);
        for (var i = 0; i < response.length; i++) {
          this.roleDetails.push({ "id": response[i].id, "modules": response[i].access_to, "role": response[i].role })
        }
      }
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
    })
  }

  // compare the new palns with the previous role details, 
  // remove the older plan modules if it not contains in the new plana
  compareRolesWithNewplan() {
    let modules = [];
    let a1 = [];
    for (var i = 0; i < this.roleDetails.length; i++) {
      if (this.roleDetails[i].role != "OrgAdmin") {
        modules = JSON.parse(this.roleDetails[i].modules);
        a1 = modules.filter(x => !this.selected_plan_module.includes(x));
        for (var j = 0; j < a1.length; j++) {
          for (var k = 0; k < modules.length; k++) {
            if (modules[k] == a1[j]) {
              modules = modules.filter(element => element !== a1[j]);
            }
          }
        }
        let formdata = {
          "id": this.roleDetails[i].id,
          "roles": JSON.stringify(modules)
        }

        this.settingsService.updateRoleDetailsForEmployee(formdata).subscribe(data => {
          if (data.map.statusMessage == "Success") {

          }
          else {

          }
        })
      }
    }
  }
  org_id: any;
  emp_id: any;
  org_name: string;
  orgdetails: any;
  getOrgdetailsByid() {
    this.spinner.show();
    this.manageOrgService.getOrgDetailsById(this.data.id).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        let response: any = [];
        response = JSON.parse(data.map.data);
        this.orgdetails = response;
        this.emp_id = this.orgdetails.emp_id;
        this.org_id = this.orgdetails.org_id;
        this.org_name = this.orgdetails.company_name;
      }
      this.spinner.hide();
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
    })
  }
  notification() {
    let zone = moment.tz.guess();
    let message, submodule;
    if (this.data.req == "upgrade") {
      message = "Super admin upgraded the " + this.org_name + "'s pricing plan to " + this.upgradeplanFormgroup.value.plan + ".";
      submodule = "Upgrade_plan";
    }
    else if (this.data.req == "renew") {
      message = "Super admin renewed the " + this.org_name + "'s current pricing plan.";
      submodule = "Renew_plan"
    }
    let formdata = {
      "org_id": this.org_id,
      "message": message,
      "to_notify_id": this.emp_id,
      "notifier": "super_admin",
      "module_name": "subscription",
      "sub_module_name": submodule,
      //  "timesheet_id" : this.plan,
      "date_of_request": moment(new Date()).format("YYYY-MM-DD"),
      "approval_status": "Approved",
      "timezone": zone
    }
    this.notificationService.postNotification(formdata).subscribe(data => {
      if (data.map.statusMessage == "Success") {
      }
      else {
      }
    })
  }
}

