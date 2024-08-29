import { Component, OnInit, ViewChild } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { Router } from '@angular/router';
import moment from 'moment-timezone';
import { NgxSpinnerService } from 'ngx-spinner';
import { TimesheetService } from 'src/app/services/timesheet.service';
import {noRecordMessage} from '../../util/constants';
import * as tablePageOption from '../../util/table-pagination-option';
import { UrlService } from 'src/app/services/url.service';

@Component({
  selector: 'app-approvals',
  templateUrl: './approvals.component.html',
  styleUrls: ['./approvals.component.less']
})
export class ApprovalsComponent implements OnInit {
  noRecordMsg = noRecordMessage;
  Filter: boolean;
  filterData: string;
  previousUrl: any;
  paginatorIndex: any = 0;
  statusClickCnt: any = 0;
  constructor(private router: Router,
     private spinner: NgxSpinnerService,
     private timesheetService: TimesheetService,private urlService: UrlService)
  { }

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  empId:any;
  totalCounts:any= 0;
  approvedCounts:any= 0;
  rejectedCounts:any= 0;
  pendingCounts:any= 0;
  allDetails:boolean= false;
  approvedDetails:boolean= false;
  pendingDetails:boolean= false;
  rejectedDetails:boolean= false;
  public filterInput: UntypedFormControl = new UntypedFormControl('');
  pageSize:any = 10;
  tablePaginationOption:number[];
  approvalStatus: any;
  ngOnInit() {
    this.urlService.previousUrl$.subscribe((previousUrl: string) => {
      this.previousUrl = previousUrl;
    });
    
    if(this.previousUrl == undefined || !this.previousUrl.includes("approve-logs")){
      this.clearSSIndexAndPageSize();
    }else{
      this.approvalStatus = sessionStorage.getItem("approval-status");
    }
    this.empId= localStorage.getItem('Id');
    if(this.approvalStatus === "Pending"){
      this.getActivePendingTaskDetails();
    }else if(this.approvalStatus === "Approved"){
      this.getActiveApprovedTaskDetails();
    }else if(this.approvalStatus === "Rejected"){
      this.getActiveRejectedTaskDetails();
    }else{
      this.getTaskDetails();
    }
  }
  displayedColumns: string[] = ['timesheet_name', 'emp_name', 'billable_total_time','non_billable_total_time','total_time', 'Status'];
  timeDataSource = new MatTableDataSource();

  approveReject(date , id , status, tId ,comments){
    sessionStorage.setItem("isApprovals" , "true");
    sessionStorage.setItem("dateOfRequest" , date);
    sessionStorage.setItem("tSheetStatus" , status);
    sessionStorage.setItem("requestedDate" , moment(new Date(date)).format('DD-MM-YYYY'));
    sessionStorage.setItem("tSheetId" , tId);
    if(status != "Pending"){
      sessionStorage.setItem("tSheetComments" , comments);
    }
    this.router.navigate(['/approve-logs/'+id]);
  }
  timesheetDetails:any[]=[];


  // get timesheets by reporter id (approver id)

  getTaskDetails(){
    this.spinner.show();
    this.statusClickCnt += 1; 
    //reset the filter
    this.filterInput= new UntypedFormControl('');
    this.pageSize = 10;
    this.timesheetService.getbyreporterid(this.empId).subscribe(data => {
      if(data.map.statusMessage == "Success"){
        sessionStorage.setItem("approval-status","Total");
        let res = JSON.parse(JSON.parse(data.map.data).map.details);
        
        for(let i=0 ; i< res.length ; i++){
          if(res[i].approval_status == "Submitted"){
            res[i].approval_status = "Pending";
          }
        }
        this.timesheetDetails= res;
        this.tablePaginationOption = tablePageOption.tablePaginationOption(this.timesheetDetails.length);
        if(this.timesheetDetails.length > 0){
          this.Filter = false;
        }
        this.approvedCounts =JSON.parse(JSON.parse(data.map.data).map.approved_counts);
        this.totalCounts =JSON.parse(JSON.parse(data.map.data).map.total_counts);
        this.rejectedCounts =JSON.parse(JSON.parse(data.map.data).map.rejected_counts);
        this.pendingCounts =JSON.parse(JSON.parse(data.map.data).map.pending_counts);
        this.timeDataSource = new MatTableDataSource(this.timesheetDetails);
        this.timeDataSource.sort = this.sort;
        if (this.statusClickCnt == 1 && sessionStorage.getItem("approvals-paginator-index") && sessionStorage.getItem("approvals-paginator-pageSize")) {
          this.paginatorIndex = sessionStorage.getItem("approvals-paginator-index");
          this.pageSize = sessionStorage.getItem("approvals-paginator-pageSize");

          this.paginator.pageSize = this.pageSize;
          this.paginator.pageIndex = this.paginatorIndex;
        }else{
          let index = 0, size = 10;
          this.paginator.pageSize = size;
          this.paginator.pageIndex = index;
          sessionStorage.setItem("approvals-paginator-index", index.toString());
          sessionStorage.setItem("approvals-paginator-pageSize", size.toString());
        }
        this.timeDataSource.paginator = this.paginator;
        this.allDetails = true;
        this.approvedDetails=false;
        this.pendingDetails=false;
        this.rejectedDetails=false;
        this.spinner.hide();
      }else{
        setTimeout(() => {
          this.spinner.hide();
        },2000)
      }
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
    })
  }

  // get pending timesheets by reporter id (approver id)
  getActivePendingTaskDetails(){
    this.spinner.show();
    this.statusClickCnt += 1;
    //reset the filter
    this.filterInput= new UntypedFormControl('');
    this.pageSize = 10;
    this.timesheetService.getactivependingtimesheetsbyreporterid(this.empId).subscribe(data => {
      if(data.map.statusMessage == "Success"){
        sessionStorage.setItem("approval-status","Pending");
        let res = JSON.parse(JSON.parse(data.map.data).map.details);
        
        for(let i=0 ; i< res.length ; i++) {
          if(res[i].approval_status == "Submitted"){
            res[i].approval_status = "Pending";
          }
        }
        this.timesheetDetails= res;
        this.tablePaginationOption = tablePageOption.tablePaginationOption(this.timesheetDetails.length);
        if(this.timesheetDetails.length > 0){
          this.Filter = false;
        }
        this.approvedCounts =JSON.parse(JSON.parse(data.map.data).map.approved_counts);
        this.rejectedCounts =JSON.parse(JSON.parse(data.map.data).map.rejected_counts);
        this.pendingCounts =JSON.parse(JSON.parse(data.map.data).map.pending_counts);
        this.totalCounts = this.approvedCounts + this.rejectedCounts + this.pendingCounts;
        this.timeDataSource = new MatTableDataSource(this.timesheetDetails);
        this.timeDataSource.sort = this.sort;
        if (this.statusClickCnt == 1 && sessionStorage.getItem("approvals-paginator-index") && sessionStorage.getItem("approvals-paginator-pageSize")) {
          this.paginatorIndex = sessionStorage.getItem("approvals-paginator-index");
          this.pageSize = sessionStorage.getItem("approvals-paginator-pageSize");

          this.paginator.pageSize = this.pageSize;
          this.paginator.pageIndex = this.paginatorIndex;
        }else{
          let index = 0, size = 10;
          this.paginator.pageSize = size;
          this.paginator.pageIndex = index;
          sessionStorage.setItem("approvals-paginator-index", index.toString());
          sessionStorage.setItem("approvals-paginator-pageSize", size.toString());
        }
        this.timeDataSource.paginator = this.paginator;
        this.allDetails = false;
        this.approvedDetails=false;
        this.pendingDetails=true;
        this.rejectedDetails=false;
        this.spinner.hide();
      }else{
        setTimeout(() => {
          this.spinner.hide();
        },2000)
      }
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
    })
  }
   // get approved timesheets by reporter id (approver id)
  getActiveApprovedTaskDetails(){
    this.spinner.show();
    this.statusClickCnt += 1; 
    //reset the filter
    this.filterInput= new UntypedFormControl('');
    this.pageSize = 10;
    this.timesheetService.getactiveapprovedtimesheetsbyreporterid(this.empId).subscribe(data => {
      if(data.map.statusMessage == "Success"){
        sessionStorage.setItem("approval-status","Approved");
        let res = JSON.parse(JSON.parse(data.map.data).map.details);
       
        for(let i=0 ; i< res.length ; i++){
          if(res[i].approval_status == "Submitted"){
            res[i].approval_status = "Pending";
          }
        }
        this.timesheetDetails= res;
        this.tablePaginationOption = tablePageOption.tablePaginationOption(this.timesheetDetails.length);
        if(this.timesheetDetails.length > 0){
          this.Filter = false;
        }
        this.approvedCounts =JSON.parse(JSON.parse(data.map.data).map.approved_counts);
        this.rejectedCounts =JSON.parse(JSON.parse(data.map.data).map.rejected_counts);
        this.pendingCounts =JSON.parse(JSON.parse(data.map.data).map.pending_counts);
        this.totalCounts = this.approvedCounts + this.rejectedCounts + this.pendingCounts;

        this.timeDataSource = new MatTableDataSource(this.timesheetDetails);
        this.timeDataSource.sort = this.sort;
        if (this.statusClickCnt == 1 && sessionStorage.getItem("approvals-paginator-index") && sessionStorage.getItem("approvals-paginator-pageSize")) {
          this.paginatorIndex = sessionStorage.getItem("approvals-paginator-index");
          this.pageSize = sessionStorage.getItem("approvals-paginator-pageSize");

          this.paginator.pageSize = this.pageSize;
          this.paginator.pageIndex = this.paginatorIndex;
        }else{
          let index = 0, size = 10;
          this.paginator.pageSize = size;
          this.paginator.pageIndex = index;
          sessionStorage.setItem("approvals-paginator-index", index.toString());
          sessionStorage.setItem("approvals-paginator-pageSize", size.toString());
        }
        this.timeDataSource.paginator = this.paginator;
        this.allDetails = false;
        this.approvedDetails=true;
        this.pendingDetails=false;
        this.rejectedDetails=false;
        this.spinner.hide();
      }else{
        setTimeout(() => {
          this.spinner.hide();
        },2000)
      }
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
    })
  }

   // get rejected timesheets by reporter id (approver id)
  getActiveRejectedTaskDetails(){
    this.spinner.show();
    this.statusClickCnt += 1;
    //reset the filter
    this.filterInput= new UntypedFormControl('');
    this.pageSize = 10;
    this.timesheetService.getactiverejectedtimesheetsbyreporterid(this.empId).subscribe(data => {
      if(data.map.statusMessage == "Success"){
        sessionStorage.setItem("approval-status","Rejected");
        let res = JSON.parse(JSON.parse(data.map.data).map.details);
        for(let i=0 ; i< res.length ; i++){
          if(res[i].approval_status == "Submitted"){
            res[i].approval_status = "Pending";
          }
        }
        this.timesheetDetails= res;

        this.tablePaginationOption = tablePageOption.tablePaginationOption(this.timesheetDetails.length);
        if(this.timesheetDetails.length > 0){
          this.Filter = false;
        }
        this.approvedCounts =JSON.parse(JSON.parse(data.map.data).map.approved_counts);
        this.rejectedCounts =JSON.parse(JSON.parse(data.map.data).map.rejected_counts);
        this.pendingCounts =JSON.parse(JSON.parse(data.map.data).map.pending_counts);
        this.totalCounts = this.approvedCounts + this.rejectedCounts + this.pendingCounts;

        this.timeDataSource = new MatTableDataSource(this.timesheetDetails);
        this.timeDataSource.sort = this.sort;
        if (this.statusClickCnt == 1 && sessionStorage.getItem("approvals-paginator-index") && sessionStorage.getItem("approvals-paginator-pageSize")) {
          this.paginatorIndex = sessionStorage.getItem("approvals-paginator-index");
          this.pageSize = sessionStorage.getItem("approvals-paginator-pageSize");

          this.paginator.pageSize = this.pageSize;
          this.paginator.pageIndex = this.paginatorIndex;
        }else{
          let index = 0, size = 10;
          sessionStorage.setItem("approvals-paginator-index", index.toString());
          sessionStorage.setItem("approvals-paginator-pageSize", size.toString());
        }
        this.timeDataSource.paginator = this.paginator;
        this.allDetails = false;
        this.approvedDetails=false;
        this.pendingDetails=false;
        this.rejectedDetails=true;
        this.spinner.hide();
      }else{
        setTimeout(() => {
          this.spinner.hide();
        },2000)
      }
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
    })
  }
  //filter
  applyProjectFilter(event: Event) {
    this.Filter = false;
    this.filterData = (event.target as HTMLInputElement).value;
    const filterValue = (event.target as HTMLInputElement).value;
    this.timeDataSource.filter = filterValue.trim().toLowerCase();
    if (this.timeDataSource.filteredData.length == 0) {
      this.Filter = true;
    }
    if (this.timeDataSource.paginator) {
      this.timeDataSource.paginator = this.paginator;
    }
  }
//pagination size
changePage(event){
  this.pageSize = event.pageSize;
  sessionStorage.setItem("approvals-paginator-index", event.pageIndex.toString());
  sessionStorage.setItem("approvals-paginator-pageSize", event.pageSize.toString());
}

//clear Session storage
clearSSIndexAndPageSize(){
  sessionStorage.removeItem("approvals-paginator-pageSize");
  sessionStorage.removeItem("approvals-paginator-index");
  sessionStorage.removeItem("approval-status");
}
}

