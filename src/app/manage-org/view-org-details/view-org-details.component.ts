import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { error } from 'console';
import { NgxSpinnerService } from 'ngx-spinner';
import { ManageOrgService } from 'src/app/services/super-admin/manage-org/manage-org.service';
import { UtilService } from 'src/app/services/util.service';
import { PaymentService } from '../../services/payment/payment.service';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { SelectionModel } from '@angular/cdk/collections';
import * as tablePageOption from "../../util/table-pagination-option";
import { noDataMessage } from "../../util/constants";


@Component({
  selector: 'app-view-org-details',
  templateUrl: './view-org-details.component.html',
  styleUrls: ['./view-org-details.component.less']
})
export class ViewOrgDetailsComponent implements OnInit {

  heading: any;
  pricingplan: any = [];
  productId: any;
  orgDetails: any = [];
  backUrl:string;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  transactionDataSource = new MatTableDataSource();
  selection = new SelectionModel(true, []);
  //get all org details
  nodata: boolean = true;
  pageSize: number = 10;
  noDataMsg = noDataMessage;
  tablePaginationOption: number[];
  displayedColumns: string[] = ["transaction_id", "created_time", "amount", "payment_gateway", "status", "action"];

  constructor(private manageOrgService: ManageOrgService,
    private router: Router,
    private dialog: MatDialog,
    private spinner: NgxSpinnerService,
    private utilsService: UtilService,
    private activeRoute: ActivatedRoute,
    private paymentService: PaymentService) {
      this.backUrl = "/"+this.activeRoute.snapshot.paramMap.get('back');
     }

  ngOnInit() {
    this.productId = this.activeRoute.snapshot.paramMap.get('id');
  
    // console.log(this.productId);
    this.viewGetByOrgDetails();
    this.getByOrgAllTransactionDetails();
    
    // this.heading = this.data.header;
    // if(this.data.data.pricingPlanDetails){
    // this.pricingplan = this.data.data.pricingPlanDetails;
    // }
  }

  viewGetByOrgDetails() {
    this.spinner.show();
    this.orgDetails = [];
    this.pricingplan = [];
    this.manageOrgService.getOrgDetailsById(this.productId).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        let response: any = JSON.parse(data.map.data);
        this.orgDetails = response;
        // console.log(this.orgDetails);
        let pricingPlan: any = this.orgDetails.pricingPlanDetails;
        pricingPlan.modules = JSON.parse(pricingPlan.modules);
        this.pricingplan = pricingPlan;
        // console.log(response);
        this.spinner.hide();
      }
      else {
        this.spinner.hide();
      }
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
    })

  }

  transactionDetails: any[] = [];
  getByOrgAllTransactionDetails() {
    this.spinner.show();
    this.paymentService.getAllPaymentTransactionByOrg(this.productId).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        let response: any[] = JSON.parse(data.map.data);
        this.transactionDetails = response;
        // console.log(this.transactionDetails);
        this.tablePaginationOption = tablePageOption.tablePaginationOption(this.transactionDetails.length);
        if (response.length) {
          this.transactionDataSource = new MatTableDataSource(this.transactionDetails);
          this.transactionDataSource.sort = this.sort;
          this.transactionDataSource.paginator = this.paginator;
          this.nodata = false;
        } else {
          this.transactionDataSource = new MatTableDataSource();
          this.nodata = true;
        }
        this.spinner.hide();
      } else {
        this.spinner.hide();
      }
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
    })
  }

  //pagination size
  changePage(event) {
    this.pageSize = event.pageSize;
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
