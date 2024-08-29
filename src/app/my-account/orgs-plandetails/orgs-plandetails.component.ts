import { AfterViewInit, Component, OnInit, ViewChild, ViewEncapsulation, } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { RegisterService } from 'src/app/services/register.service';
import { ManagePricingPlanService } from 'src/app/services/super-admin/manage-pricing-plan/manage-pricing-plan.service';
import { MyAccountCommonDialogComponent } from '../my-account-common-dialog/my-account-common-dialog.component';
import { DataServiceService } from 'src/app/util/shared/data-service.service';
import { ShowingPlanDetailsComponent } from '../showing-plan-details/showing-plan-details.component';
import { MatTableDataSource } from '@angular/material/table';
import { ManageOrgService } from 'src/app/services/super-admin/manage-org/manage-org.service';
import { UtilService } from 'src/app/services/util.service';
import { PaymentService } from '../../services/payment/payment.service';
import { SelectionModel } from '@angular/cdk/collections';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { AuthenticateService } from "../../services/authenticate.service";
import { noDataMessage } from '../../util/constants';
import moment from 'moment';
interface Transaction {
  item: string;
  user: number;
  cost: number;
  additional_user: number;
  currency: string;
}
@Component({
  selector: 'app-orgs-plandetails',
  templateUrl: './orgs-plandetails.component.html',
  styleUrls: ['./orgs-plandetails.component.less'],
  encapsulation: ViewEncapsulation.None
})
export class OrgsPlandetailsComponent implements AfterViewInit {
  Org_id: string;
  pricingPlandetails: any = [];
  displayedColumns: string[] = ['item', 'user', 'additional_user', 'cost'];
  transactions: Transaction[] = [];
  pricing_modules: any;
  days: number = 363;
  futureDate: Date;
  DataSource = new MatTableDataSource();
  transactionDisplayedColumns: string[] = ["transaction_id", "created_time", "amount", "status", "action"];
  transactionDataSource = new MatTableDataSource();
  selection = new SelectionModel(true, []);
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  noDataMsg = noDataMessage;
  noDataMsgPlan: boolean = false;
  nodata: boolean = false;

  constructor(private registerService: RegisterService,
    private router: Router,
    private dialog: MatDialog,
    private spinner: NgxSpinnerService,
    private managePricingPlanService: ManagePricingPlanService,
    private manageOrgService: ManageOrgService,
    private utilsService: UtilService,
    private paymentService: PaymentService,
    private authenticateService: AuthenticateService) {

  }

  ngAfterViewInit() {
    this.Org_id = localStorage.getItem('OrgId');
    window.addEventListener('storage', this.handleStorageChange.bind(this));
    this.DataSource = new MatTableDataSource();
    this.authenticateUser();
    this.getOrgdetailsByid();
    this.getPaymentTransaction();
    // this.getAllPlanDetails();
  }

  handleStorageChange(event: StorageEvent) { 
    if (event.key === 'newTabId' && event.newValue === 'completed') { 
      window.close(); 
    } 
  }
  ngOnDestroy() { 
    window.removeEventListener('storage', this.handleStorageChange.bind(this)); 
  }

  async authenticateUser() {

    this.spinner.show();
    let formdata = {
      "org_id": localStorage.getItem('OrgId'),
      "user_id": localStorage.getItem('Id') != null ? localStorage.getItem('Id') : "",
      "role": localStorage.getItem('Role')
    }
    // console.log(formdata);
    await this.authenticateService.getauthenticatedUser(formdata).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        let details = data.map.details;
        if (details.status === "Expired") {
          localStorage.setItem("OrganizationPlan", "expired");
          this.spinner.hide();
        } else {
          this.spinner.hide();
        }
      }
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
    })
  }

  //      
  isShowDivIf = false;
  isActiveProject: boolean = false;
  //   showPriceCard() {
  //     this.isShowDivIf = !this.isShowDivIf;
  //   setTimeout(() => {
  //     const element = document.getElementById("scrollToPricingPlan");
  //     element.scrollIntoView({ behavior: "smooth", block: "center", inline: "center"});
  //   }, 100);
  // }

  active_plan: any;
  orgdetails: any = [];
  is_expire_renewal_Date: boolean = false;
  payment_key: string = '';
  additional_user_count: number = 0;
  additional_user_amount: number = 0;
  per_user_amount: number = 0;
  total_amount: number = 0;
  orgId :any;
  //get org detials by org id
  async getOrgdetailsByid() {
    this.spinner.show();
    this.pricingPlandetails = [];
    this.orgdetails = [];
    this.transactions = [];
    await this.registerService.getOrgDetailsById(this.Org_id).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        let response: any = [];
        response = JSON.parse(data.map.data);
        this.orgdetails = response;
        this.orgId = this.orgdetails.org_id;
        // console.log(response);
        this.pricingPlandetails = response.pricingPlanDetails;
        // console.log(this.pricingPlandetails)
        let word = this.pricingPlandetails.currency;
        this.pricingPlandetails.currency = word.split(' ').pop();
        this.pricingPlandetails.modules = JSON.parse(this.pricingPlandetails.modules);
        this.pricing_modules = this.pricingPlandetails.modules;
        this.active_plan = this.pricingPlandetails.plan;

        let org_user_limit = parseInt(this.orgdetails.userslimit);
        let pricing_user_limit = parseInt(this.pricingPlandetails.userslimit);

        this.per_user_amount = this.pricingPlandetails.amount / pricing_user_limit;

        if (org_user_limit > pricing_user_limit) {
          this.additional_user_count = org_user_limit - pricing_user_limit;
          this.total_amount = this.per_user_amount * org_user_limit;
          this.additional_user_amount = this.additional_user_count * this.per_user_amount;
        } else {
          this.total_amount = this.per_user_amount * pricing_user_limit;
        }
        // console.log(this.per_user_amount);
        this.transactions.push({ item: this.active_plan, user: parseInt(this.pricingPlandetails.userslimit), cost: this.pricingPlandetails.amount, currency: this.pricingPlandetails.currency, additional_user: this.additional_user_count });
        this.DataSource = new MatTableDataSource(this.transactions);
        const targetDate = new Date(this.orgdetails.expiry_date);
        const currentDate = new Date();
        const fiveDaysBeforeTarget = new Date(targetDate);
        fiveDaysBeforeTarget.setDate(targetDate.getDate() - 5);
        let todayDate = moment(currentDate).format('YYYY-MM-DD');
        let fiveDayBeforeDate = moment(fiveDaysBeforeTarget).format('YYYY-MM-DD');
        let date_of_expire = moment(targetDate).format('YYYY-MM-DD');
        // console.log(currentDate,"moment Date...",todayDate)
        // console.log(fiveDaysBeforeTarget,"fivedaysbeforetarget...",fiveDayBeforeDate)
        // console.log(targetDate,"moment date...",date_of_expire)
        // Enable the button if the current date is within 5 days before the target date
        if (todayDate >= fiveDayBeforeDate && todayDate <= date_of_expire) {
          this.is_expire_renewal_Date = true;
        }
        else if (date_of_expire <= todayDate) {
          this.is_expire_renewal_Date = true;
        }

        //  this.getPaymentTransaction();
        this.spinner.hide();
      }

    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
    })
  }


  // getTotalCost() {
  //   return this.transactions.map(t => t.cost).reduce((acc, value) => acc + value, 0);
  // }

  isActivatedStripe: boolean = false;
  isActivatedRazorPay: boolean = false;
  isActivatedCashFree: boolean = false;
  paymentTransactionLength:number;
  async getPaymentTransaction() {
    this.spinner.show();
    this.paymentTransactionLength = 0;
    // debugger;
    await this.paymentService.getFewPaymentTransaction(this.Org_id).subscribe(data => {
      // console.log(data);
      if (data.map.statusMessage == "Success") {
        let response:any[] = JSON.parse(data.map.data);
        // console.log(response);
        if (response.length > 0) {
          this.payment_key = response[0].key_note;
          if (this.payment_key == 'Stripe') {
            this.isActivatedStripe = true;
          } else if (this.payment_key == 'Razorpay') {
            this.isActivatedRazorPay = true;
          } else if (this.payment_key == 'Cashfree') {
            this.isActivatedCashFree == true;
          }
          this.paymentTransactionLength = response.length;
          this.transactionDataSource = new MatTableDataSource(response);
          this.nodata = false;
          this.noDataMsgPlan = false;
        } else {
          this.transactionDataSource = new MatTableDataSource();
          this.noDataMsgPlan = true;
          this.nodata = true;
        }
      } else {
        this.transactionDataSource = new MatTableDataSource();
        this.noDataMsgPlan = true;
        this.nodata = true;
      }
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
    })
  }

  allplandetails = [];
  //get pricing plan details 
  // getAllPlanDetails(){
  //   this.spinner.show();
  //   this.allplandetails = [];
  //   this.managePricingPlanService.getAllPlanDetails().subscribe(data => {
  //     if(data.map.statusMessage == "Success"){
  //       let response: any[] = JSON.parse(data.map.data);
  //       this.allplandetails = response.reverse();
  //       console.log(this.allplandetails);
  //       for(var i=0;i<this.allplandetails.length;i++){
  //        let word = this.allplandetails[i].currency;
  //        this.allplandetails[i].currency = word.split(' ').pop();
  //         this.allplandetails[i].modules = JSON.parse(this.allplandetails[i].modules);
  //       }
  //       this.spinner.hide();
  //       // console.log(this.allplandetails);
  //     }
  //     else{
  //       this.spinner.hide();
  //     }

  //   }, (error) => {
  //     this.router.navigate(["/404"]);
  //     this.spinner.hide();
  //   })
  // }

  openUpgradeplan(plan) {
    const dialogRef = this.dialog.open(MyAccountCommonDialogComponent, {
      width: '40%',
      // height: '235px',
      panelClass: 'custom-macommondialogstyle',
      data: { header: "upgrade", id: this.orgdetails.org_id, plan: plan, org_name: this.orgdetails.company_name },
    });
    dialogRef.afterClosed().subscribe(
      resp => {
        // this.ngOnInit();
        this.router.navigate(["/payments"]);
        // this.showPriceCard();
      }
    );
  }

  openRenewplan(plan) {
    const dialogRef = this.dialog.open(MyAccountCommonDialogComponent, {
      width: '45%',
      // height: '235px',
      panelClass: 'custom-macommondialogstyle',
      data: { header: "renew", id: this.orgdetails.org_id, plan: plan, org_name: this.orgdetails.company_name },
    });
    dialogRef.afterClosed().subscribe(
      resp => {
        // this.ngOnInit();
        this.router.navigate(["/renew"]);
        // this.isShowDivIf = false;
      }
    );
  }
  viewplan(pricingPlan: any) {
    const dialogRef = this.dialog.open(ShowingPlanDetailsComponent, {
      width: '45%',
      // height: '235px',
      panelClass: 'custom-macommondialogstyle',
      data: { modules: pricingPlan },
    });
    dialogRef.afterClosed().subscribe(
      resp => {
        this.ngAfterViewInit();
        // this.router.navigate(["/payments"]);
        // this.isShowDivIf = false;
      }
    );
  }
  async renewalPlandDetails() {
    this.spinner.show();
    await this.manageOrgService.updateplanrenewalstatus(this.orgdetails.org_id).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        // this.utilsService.openSnackBarAC("Renew pricing plan request submitted successfully","Ok");
        this.router.navigate(["/renewal-plan"])
        this.spinner.hide();
      } else {
        this.utilsService.openSnackBarMC("Failed to submit request for renewal pricing plan", "Ok");
        this.spinner.hide();
      }
    })
  }


  //to open mail with the sales email id
  mailTo() {
    let mail = "mailto:sales@servx.global";
    window.location.href = mail;
  }

  downloadInvoicePdf(pdfcontent: any) {
    let stringArray = new Uint8Array(pdfcontent);
    const String_Char = stringArray.reduce((data, byte) => {
      return data + String.fromCharCode(byte);
    }, '');
    let base64String = btoa(String_Char);
    const imageBlob = this.dataUritoBlob(base64String);
    var link = document.createElement('a');
    link.href = window.URL.createObjectURL(imageBlob);
    link.download = 'Receipt.pdf';
    link.click();
    window.URL.revokeObjectURL(link.href);
  }

  dataUritoBlob(dataURI) {
    const byteString = window.atob(dataURI);
    const arrayBuffer = new ArrayBuffer(byteString.length);
    const int8Array = new Uint8Array(arrayBuffer);
    for (let i = 0; i < byteString.length; i++) {
      int8Array[i] = byteString.charCodeAt(i);
    }
    const blob = new Blob([int8Array], { type: 'application/pdf' });
    return blob;
  }

  // viewReceipt(viewReceipt:any){
  //   window.open(viewReceipt, '_blank');
  // }
}

