import { SelectionModel } from "@angular/cdk/collections";
import { Component, OnInit, ViewChild } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { MatTableDataSource } from "@angular/material/table";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { Router } from "@angular/router";
import { NgxSpinnerService } from "ngx-spinner";
import { ManagePricingPlanService } from "../../services/super-admin/manage-pricing-plan/manage-pricing-plan.service";
import { UtilService } from "../../../app/services/util.service";
import { DeleteComponent } from "../../util/delete/delete.component";
import { noDataMessage } from "../../util/constants";
import { BulkDeleteDialogComponent } from "../../util/bulk-delete-dialog/bulk-delete-dialog.component";
import * as tablePageOption from "../../util/table-pagination-option";
import { PaymentService } from "src/app/services/payment/payment.service";
import { ViewOrgDetailsComponent } from "src/app/manage-org/view-org-details/view-org-details.component";
import { ManageOrgService } from "src/app/services/super-admin/manage-org/manage-org.service";
import { RegisterService } from "src/app/services/register.service";

@Component({
  selector: "app-transactions",
  templateUrl: "./transactions.component.html",
  styleUrls: ["./transactions.component.less"],
})
export class TransactionsComponent implements OnInit {

  noDataMsg = noDataMessage;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  displayedColumns: string[] = ["transaction_id","orgName","plan","created_time","amount","payment_option","status","action"];
  // "payment_option",
  
  DataSource = new MatTableDataSource();
  selection = new SelectionModel(true, []);
  pageSize: number = 10;
  tablePaginationOption: number[];
  Filter: boolean;
  filterData: string;
  noDataMsgPlan: boolean = false;
  login_str: any;
  loginurl: any = '';
  modifiedstring: any;
  loginstr: string;

  constructor(
    private router: Router,
    private dialog: MatDialog,
    private spinner: NgxSpinnerService,
    private utilService: UtilService,
    private manageOrgService: ManageOrgService,
    private paymentService: PaymentService,private utilsService: UtilService,
    private registerService: RegisterService
  ) {
    this.loginurl = window.location.href;
    this.modifiedstring = this.loginurl.slice(0, this.loginurl.length - 8);
    this.loginstr = "login";
    this.login_str = this.modifiedstring.concat(this.loginstr.toString());
  }

  ngOnInit() {
    this.getAllTransactions();
  }

  nodata: boolean = false;
  allTransactions = [];
  //get all transaction details
  getAllTransactions() {
    this.spinner.show();
    this.allTransactions = [];
    this.paymentService.getAllTransactions().subscribe((data) => {
      if (data.map.statusMessage == "Success") {
        let response: any[] = JSON.parse(data.map.data);
        this.tablePaginationOption = tablePageOption.tablePaginationOption(
          response.length
        );
        this.allTransactions = response;
        this.DataSource = new MatTableDataSource(
          this.allTransactions.reverse()
        );
        this.DataSource.sort = this.sort;
        this.DataSource.paginator = this.paginator;
        this.nodata = false;
        this.noDataMsgPlan = true;
      } else {
        this.DataSource = new MatTableDataSource();
        this.nodata = true;
      }
      this.spinner.hide();
    });
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

  //view org details
  // viewOrgDetails(element) {
  //   this.spinner.show();
  //   this.manageOrgService.getOrgDetailsById(element.org_id).subscribe(
  //     (data) => {
  //       if (data.map.statusMessage == "Success") {
  //         let response: any = [];
  //         response = JSON.parse(data.map.data);
  //         if (response.pricingPlanDetails) {
  //           let word = response.pricingPlanDetails.currency;
  //           response.pricingPlanDetails.currency = word.split(' ').pop();
  //           response.pricingPlanDetails.modules = JSON.parse(response.pricingPlanDetails.modules);
  //         }
  //         this.spinner.hide();
  //         const dialogRef = this.dialog.open(ViewOrgDetailsComponent, {
  //           width: "500px",
  //           panelClass: "customvieworg-dialogstyle",
  //           data: { header: "View Organization Details", data: response },
  //         });
  //       } else {
  //         this.spinner.hide();
  //       }
  //     },
  //     (error) => {
  //       this.router.navigate(["/404"]);
  //       this.spinner.hide();
  //     }
  //   );
  // }

  
  openVieworg(orgId:any) {
    let url:string = window.location.href;
    let location:any[] = url.split('/');
    this.router.navigate(['/view-org',orgId,location[4]]);
  }

  //pagination size
  changePage(event) {
    this.pageSize = event.pageSize;
  }

  applyFilter(event: Event) {
    this.Filter = false;
    this.filterData = (event.target as HTMLInputElement).value;
    const filterValue = (event.target as HTMLInputElement).value;
    this.DataSource.filter = filterValue.trim().toLowerCase();
    if (this.DataSource.filteredData.length == 0) {
      this.Filter = true;
    }
    if (this.DataSource.paginator) {
      this.DataSource.paginator = this.paginator;
    }
  }
  emp_id:any;
   getEmpIdToResendMail(id) {
    this.spinner.show();
    this.manageOrgService.getOrgDetailsById(id).subscribe((data) => {
        if (data.map.statusMessage == "Success") {
          let response: any = [];
          response = JSON.parse(data.map.data);
          this.emp_id = response.emp_id;       
         this.resendMail(this.emp_id);
        }
      })
    }
  resendMail(id){
    this.spinner.show();
    let formdata = {
      "id": id,
      "login_str": this.login_str
    }
    this.registerService.resendMailToOrg(formdata).subscribe(data => {
      if(data.map.statusMessage == "Success" && data.map.data == "Mail sent successfully") {
        this.utilsService.openSnackBarAC("Mail sent successfully", "OK");
        this.getAllTransactions();
      } else  if(data.map.statusMessage == "Success" && data.map.Error == "Error in sending details due to invalid mail check the configuration details"){
        this.utilsService.openSnackBarMC("Mail configuration issue encountered", "OK");
      } else {
        this.utilsService.openSnackBarMC("Failed to send mail", "OK");
      }
      setTimeout(() => {
        this.spinner.hide();
      }, 2000);
    })
  }
  
  // viewReceipt(viewReceipt:any){
  //   window.open(viewReceipt, '_blank');
  // }
}
