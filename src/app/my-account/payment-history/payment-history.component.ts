import { Component, OnInit, ViewChild } from '@angular/core';
import { SelectionModel } from "@angular/cdk/collections";
// import { Component, OnInit, ViewChild } from "@angular/core";
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

@Component({
  selector: 'app-payment-history',
  templateUrl: './payment-history.component.html',
  styleUrls: ['./payment-history.component.less']
})
export class PaymentHistoryComponent implements OnInit {
  noDataMsg = noDataMessage;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  displayedColumns: string[] = [
    "payment_Id",
    "amount",
    "created_time",
    "payment_gateway",
    "status",
    "action"
  ];
  DataSource = new MatTableDataSource();
  selection = new SelectionModel(true, []);
  pageSize: number = 10;
  tablePaginationOption: number[];
  Filter: boolean;
  filterData: string;
  noDataMsgPlan: boolean = false;
  orgId: any;
  paymentTransaction: any = [];
  nodata: boolean = false;

  constructor(private router: Router,
    private dialog: MatDialog,
    private spinner: NgxSpinnerService,
    private utilService: UtilService,
    private paymentService: PaymentService) { }

  ngOnInit(): void {
    this.orgId = localStorage.getItem("OrgId");
    this.getAllPaymentHistory();
  }

  getAllPaymentHistory() {
    // debugger;
    this.spinner.show();
    this.paymentService.paymentHistoryofGetByOrg(this.orgId).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        let response: any[] = JSON.parse(data.map.data);
        this.tablePaginationOption = tablePageOption.tablePaginationOption(
          response.length
        );
        this.paymentTransaction = response;
        this.DataSource = new MatTableDataSource(this.paymentTransaction);
        this.DataSource.sort = this.sort;
        this.DataSource.paginator = this.paginator;
        this.nodata = false;
        this.noDataMsgPlan = true;
        this.spinner.hide();
      } else {
        this.DataSource = new MatTableDataSource();
        this.nodata = true;
        this.spinner.hide();
      }
    },(error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
    })
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

  downloadInvoicePdf(pdfcontent:any){
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
