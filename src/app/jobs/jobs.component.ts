import { animate, state, style, transition, trigger } from '@angular/animations';
import { SelectionModel } from '@angular/cdk/collections';
import { Component, OnInit, ViewChild } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ReplaySubject, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { JobsService } from '../services/jobs.service';
import { ProjectsService } from '../services/projects.service';
import { SettingsService } from '../services/settings.service';
import { AddAssigneeComponent } from './add-assignee/add-assignee.component';
import { BulkAssigneesComponent } from './bulk-assignees/bulk-assignees.component';
import { JobBulkDeleteComponent } from './job-bulk-delete/job-bulk-delete.component';
import { JobDeleteComponent } from './job-delete/job-delete.component';
import { JobStatusComponent } from './job-status/job-status.component';
import { ViewJobComponent } from './view-job/view-job.component';
import { noDataMessage } from '../util/constants';
import { UtilService } from '../services/util.service';
import { DeleteComponent } from '../util/delete/delete.component';
import { BulkDeleteDialogComponent } from '../util/bulk-delete-dialog/bulk-delete-dialog.component';
import * as tablePageOption from '../util/table-pagination-option';

// import {DeleteComponent} from '../util/delete/delete.component';
export interface assignee {
  Name: string;
  Estimated_Hours: string;
  Logged_Hours: string;
  Start_Date: string;
  End_Date: string;
}

const ELEMENT_DATAS: assignee[] = [
  { Name: 'Rio', Start_Date: '12-Jan-2022', End_Date: '12-Jan-2022', Estimated_Hours: '0 Hrs 0 Mins', Logged_Hours: '0 Hrs 0 Mins' },
  { Name: 'Bala', Start_Date: '12-Jan-2022', End_Date: '12-Jan-2022', Estimated_Hours: '0 Hrs 0 Mins', Logged_Hours: '0 Hrs 0 Mins' },
];

@Component({
  selector: 'app-jobs',
  templateUrl: './jobs.component.html',
  styleUrls: ['./jobs.component.less'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class JobsComponent implements OnInit {

  noDataMsg = noDataMessage;
  projectList: any[] = [];
  displayedColumns1: string[] = ['Name', 'start_date', 'end_date', 'hours', 'logged_hours'];
  dataSource1 = ELEMENT_DATAS;
  selectColumnName: string = 'select';
  displayedColumns: string[] = ['select', 'job_name', 'project_name', 'start_date', 'end_date', 'hours', 'logged_hours', 'Status', 'Users'];
  dataSource = new MatTableDataSource();
  displayedColumns2: string[] = ['job_name', 'project_name', 'start_date', 'end_date', 'hours', 'logged_hours', 'assinees', 'actions'];
  dataSource2 = new MatTableDataSource();
  expand_details: any;
  expandedElement: any[];
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  jobDetails: any[] = [];
  jobAssigneeDetails: any[] = [];
  isExpansionDetailRow = (index, row) => row.hasOwnProperty('detailRow');
  assignedbydropdownList = [];
  managerselectedItems = [];
  managerdropdownList = [];
  select_all: boolean = false;
  selected: boolean = false;
  Accesstoclient_settings: boolean = false;
  listProject: any = [];
  listJob: any = [];
  Filter: boolean;
  filterData: string;
  bulk_delete_data: any[] = [];
  OrgId: any;
  ProjectDetailsList: any[] = [];
  selectedProjectId: any;
  reset_filter_btn: Boolean = false;
  check_active = "active";
  pageSize: number = 10;
  tablePaginationOption: number[];
  /** control for the selected project */
  public projectCtrl: UntypedFormControl = new UntypedFormControl("");

  /** control for the MatSelect filter keyword */
  public projectFilterCtrl: UntypedFormControl = new UntypedFormControl();

  /** list of head filtered by search keyword */
  public filteredproject: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);

  public filteredproject_otherjobs: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);

  public filteredproject_bystatusinactivejobs: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);

  protected _onDestroy = new Subject<void>();
  inactivejobs: boolean;
  inactivejobs_bystatus: boolean;
  completedjobs: boolean = false;
  inactiveClient: boolean;
  reset_filter_btn1: boolean = false;
  reset_filter_btn_jobcompleted: boolean = false;
  reset_filter_btn_inactivejobstatus: boolean = false;

  constructor(private jobsService: JobsService,
    private router: Router,
    private projectsService: ProjectsService,
    private dialog: MatDialog,
    private spinner: NgxSpinnerService,
    private utilsService: UtilService) { }
  ngOnInit() {
    this.OrgId = localStorage.getItem('OrgId');
    sessionStorage.removeItem("projectId");
    sessionStorage.removeItem("TT-jobName");
    // this.getActiveJobDetailsByOrgId();
    this.check_active = "active";
    this.toggleActivejobs();
    // this.getActiveJobDetailsByOrgIdnew();
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.accessCheck();
  }
  
  ///***** */ get the job details for table ****///
  async toggleActivejobs() {
    this.DataClear();
    this.inactivejobs = false;
    this.completedjobs = false;
    this.inactivejobs_bystatus = false;
    this.displayedColumns2 = ['job_name', 'project_name', 'start_date', 'end_date', 'hours', 'logged_hours', 'assinees', 'actions'];
    await this.getJobsByOrgidandStatusCustomdata("'Inprogress'", true);
    await this.getProjectsByOrgId();
  }
  async toggleinactivejobs() {
    this.DataClear();
    this.inactivejobs = true;
    this.completedjobs = false;
    this.inactivejobs_bystatus = false;
    this.displayedColumns2 = ['job_name', 'project_name', 'start_date', 'end_date', 'hours', 'logged_hours'];
    await this.getJobsByOrgidandStatusCustomdata("'Inprogress','Todo','Completed','Inactive','Closed'", false);
    await this.getInactiveProjectsByOrgId();
  }
  async toggleinactivejobsbystatus() {
    this.DataClear();
    this.inactivejobs = false;
    this.completedjobs = false;
    this.inactivejobs_bystatus = true;
    this.displayedColumns2 = ['select', 'job_name', 'project_name', 'start_date', 'end_date', 'hours', 'logged_hours', 'actions'];
    await this.getJobsByOrgidandStatusCustomdata("'Inactive'", true);
    await this.getProjectsByOrgId();

  }
  async togglecompletedjobs() {
    this.DataClear();
    this.completedjobs = true;
    this.inactivejobs = false;
    this.inactivejobs_bystatus = false;
    this.displayedColumns2 = ['select', 'job_name', 'project_name', 'start_date', 'end_date', 'hours', 'logged_hours', 'actions'];
    await this.getJobsByOrgidandStatusCustomdata("'Completed','Closed'", true);
    await this.getProjectsByOrgId();
  }
  DataClear() {
    this.listJob = [];
    this.dataSource2.data = [];
    this.projectCtrl = new UntypedFormControl("");
    this.selectedProjectId = '';
    this.selection.clear();
    this.dataSource2.filter = '';
    this.Filter = false;
    this.filterData ='';
  }
  Movetoclients() {
    localStorage.setItem('RouteToInactiveClients', "true");
    this.router.navigate(["/project-jobs-settings"]);
  }
  no_data: any = [];
  getJobsByOrgidandStatusCustomdata(status, is_activated) {
    this.dataSource2.filter = '';
    this.Filter = false;
    this.filterData ='';
    return new Promise<void>((resolve, reject) => {
      this.spinner.show();
      this.projectCtrl = new UntypedFormControl("");
      if (this.reset_filter_btn) {
        this.reset_filter_btn = false;
      }
      this.jobDetails = [];
      this.ProjectDetailsList = [];
      this.jobAssigneeDetails = [];
      this.pageSize = 10;
      let formdata = {
        "org_Id": localStorage.getItem("OrgId"),
        "status": status,
        "is_Activated": is_activated
      }
      this.jobsService.getAllJobsByStatusByOrgId(formdata).subscribe(data => {
        if (data.map.statusMessage == "Success") {
          this.selectedProjectId = '';
          let response: any[] = JSON.parse(data.map.data);
          this.jobDetails = response;
          this.tablePaginationOption = tablePageOption.tablePaginationOption(this.jobDetails.length);
          this.dataSource2 = new MatTableDataSource(this.jobDetails);
          this.no_data = this.jobDetails;
          this.dataSource2.sort = this.sort;
          this.dataSource2.paginator = this.paginator;
          for (let i = 0; i < this.jobDetails.length; i++) {
            this.jobAssigneeDetails.push(this.jobDetails[i].jobAssigneeDetails);
          }
          setTimeout(() => {
            this.spinner.hide();
            resolve(); // Resolve the promise when the operations are completed
          }, 20);
        }
      }, error => {
        reject(error); // Reject the promise if an error occurs
        this.router.navigate(["/404"]);
        this.spinner.hide();
      });
    });
  }
  // table_refresh = false;
  // all_job_details: any = [];
  // all_job_details1: any = [];
  // all_activejob_details: any = [];
  // all_inactivejob_details: any = [];
  // all_inactivejob_details_bystatus: any = [];
  // getActiveJobDetailsByOrgIdnew() {
  //   this.getProjectsByOrgId();
  //   this.spinner.show();
  //   this.table_refresh = true;
  //   this.pageSize = 10;
  //   if (this.reset_filter_btn) {
  //     this.reset_filter_btn = false;
  //     this.projectCtrl = new UntypedFormControl("");
  //   }
  //   let orgId = localStorage.getItem("OrgId");
  //   this.jobsService.getActiveJobDetailsByOrgIdnew(orgId).subscribe(data => {
  //     if (data.map.statusMessage == "Success") {
  //       this.selectedProjectId = '';
  //       let response: any[] = JSON.parse(data.map.data);

  //       this.all_job_details = response;
  //       for (var i = 0; i < this.all_job_details.length; i++) {
  //         if (this.all_job_details[i].is_activated == true && this.all_job_details[i].job_status == "Inprogress") {
  //           this.jobDetails.push(this.all_job_details[i]);
  //         }
  //       }
  //       // this.jobDetails = response;
  //       this.tablePaginationOption = tablePageOption.tablePaginationOption(this.jobDetails.length);
  //       this.dataSource2 = new MatTableDataSource(this.jobDetails);
  //       this.no_data = this.jobDetails;
  //       this.dataSource2.sort = this.sort;
  //       this.dataSource2.paginator = this.paginator;
  //       for (let i = 0; i < this.jobDetails.length; i++) {
  //         this.jobAssigneeDetails.push(this.jobDetails[i].jobAssigneeDetails);
  //       }
  //       setTimeout(() => {
  //         this.spinner.hide();
  //       }, 2000);
  //     }
  //     else {
  //       setTimeout(() => {
  //         this.spinner.hide();
  //       }, 2000);
  //     }
  //   }, (error) => {
  //     this.router.navigate(["/404"]);
  //     this.spinner.hide();
  //   })
  // }
  // to get active jobs
  // setjobdetailsactive() {
  //   this.projectCtrl = new UntypedFormControl("");
  //   this.getProjectsByOrgId();
  //   this.spinner.show();
  //   if (this.reset_filter_btn) {
  //     this.reset_filter_btn = false;
  //   }
  //   this.jobDetails = [];
  //   this.ProjectDetailsList = [];
  //   this.jobAssigneeDetails = [];
  //   this.pageSize = 10;
  //   let orgId = localStorage.getItem("OrgId");
  //   this.jobsService.getActiveJobDetailsByOrgIdnew(orgId).subscribe(data => {
  //     if (data.map.statusMessage == "Success") {
  //       this.selectedProjectId = '';
  //       let response: any[] = JSON.parse(data.map.data);

  //       this.all_activejob_details = response;
  //       for (var i = 0; i < this.all_activejob_details.length; i++) {
  //         if (this.all_activejob_details[i].is_activated == true && this.all_activejob_details[i].job_status == "Inprogress") {
  //           this.jobDetails.push(this.all_activejob_details[i]);
  //         }
  //       }
  //       this.displayedColumns2 = ['job_name', 'project_name', 'start_date', 'end_date', 'hours', 'logged_hours', 'assinees', 'actions'];

  //       this.tablePaginationOption = tablePageOption.tablePaginationOption(this.jobDetails.length);
  //       this.dataSource2 = new MatTableDataSource(this.jobDetails);
  //       this.no_data = this.jobDetails;
  //       this.dataSource2.sort = this.sort;
  //       this.dataSource2.paginator = this.paginator;
  //       for (let i = 0; i < this.jobDetails.length; i++) {
  //         this.jobAssigneeDetails.push(this.jobDetails[i].jobAssigneeDetails);
  //       }
  //       setTimeout(() => {
  //         this.spinner.hide();
  //       }, 2000);
  //     }
  //   })
  // }
  // to get inactive jobs
  // setjobdetailsinactive() {
  //   this.projectCtrl = new UntypedFormControl("");
  //   this.getInactiveProjectsByOrgId();
  //   this.spinner.show();
  //   if (this.reset_filter_btn1) {
  //     this.reset_filter_btn1 = false;
  //   }
  //   this.jobDetails = [];
  //   this.ProjectDetailsList = [];
  //   this.jobAssigneeDetails = [];
  //   this.pageSize = 10;
  //   let orgId = localStorage.getItem("OrgId");
  //   this.jobsService.getActiveJobDetailsByOrgIdnew(orgId).subscribe(data => {
  //     if (data.map.statusMessage == "Success") {
  //       this.selectedProjectId = '';
  //       let response: any[] = JSON.parse(data.map.data);

  //       this.all_inactivejob_details = response;
  //       for (var i = 0; i < this.all_inactivejob_details.length; i++) {
  //         if (this.all_inactivejob_details[i].is_activated == false) {
  //           this.jobDetails.push(this.all_inactivejob_details[i]);
  //         }
  //       }
  //       this.displayedColumns2 = ['job_name', 'project_name', 'start_date', 'end_date', 'hours', 'logged_hours'];
  //       this.tablePaginationOption = tablePageOption.tablePaginationOption(this.jobDetails.length);
  //       this.dataSource2 = new MatTableDataSource(this.jobDetails);
  //       this.no_data = this.jobDetails;
  //       this.dataSource2.sort = this.sort;
  //       this.dataSource2.paginator = this.paginator;
  //       for (let i = 0; i < this.jobDetails.length; i++) {
  //         this.jobAssigneeDetails.push(this.jobDetails[i].jobAssigneeDetails);
  //       }
  //       setTimeout(() => {
  //         this.spinner.hide();
  //       }, 2000);
  //     }
  //   })
  // }

  //To get inactive jobs by status  
  // jobDetails2 = [];
  // setjobdetailsinactivebystatus() {
  //   this.reset_filter_btn_inactivejobstatus = false;
  //   this.projectCtrl = new UntypedFormControl("");
  //   this.getInactiveProjectsByOrgId();
  //   this.spinner.show();
  //   if (this.reset_filter_btn1) {
  //     this.reset_filter_btn1 = false;
  //   }
  //   this.jobDetails = [];
  //   this.ProjectDetailsList = [];
  //   this.jobAssigneeDetails = [];
  //   this.pageSize = 10;
  //   let orgId = localStorage.getItem("OrgId");
  //   this.jobsService.getActiveJobDetailsByOrgIdnew(orgId).subscribe(data => {
  //     if (data.map.statusMessage == "Success") {
  //       this.selectedProjectId = '';
  //       let response: any[] = JSON.parse(data.map.data);

  //       this.all_inactivejob_details_bystatus = response;
  //       this.ProjectDetailsList = [];
  //       for (var i = 0; i < this.all_inactivejob_details_bystatus.length; i++) {
  //         if (this.all_inactivejob_details_bystatus[i].is_activated == true && this.all_inactivejob_details_bystatus[i].job_status == "Inactive") {
  //           this.jobDetails.push(this.all_inactivejob_details_bystatus[i]);
  //           // if(!(this.ProjectDetailsList.includes(this.all_inactivejob_details_bystatus[i].project_name))){
  //           //   this.ProjectDetailsList.push(this.all_inactivejob_details_bystatus[i].project_name);
  //           // }            

  //         }
  //       }

  //       this.displayedColumns2 = ['select', 'job_name', 'project_name', 'start_date', 'end_date', 'hours', 'logged_hours', 'actions'];
  //       this.tablePaginationOption = tablePageOption.tablePaginationOption(this.jobDetails.length);
  //       this.dataSource2 = new MatTableDataSource(this.jobDetails);
  //       this.no_data = this.jobDetails;
  //       this.dataSource2.sort = this.sort;
  //       this.dataSource2.paginator = this.paginator;
  //       for (let i = 0; i < this.jobDetails.length; i++) {
  //         this.jobAssigneeDetails.push(this.jobDetails[i].jobAssigneeDetails);
  //       }
  //       setTimeout(() => {
  //         this.ProjectDetailsList = this.jobDetails;
  //         // load the initial project list
  //         this.ProjectDetailsList = this.ProjectDetailsList.reduce((accumalator, current) => {
  //           if (
  //             !accumalator.some(
  //               (item) => item.project_name === current.project_name
  //             )
  //           ) {
  //             accumalator.push(current);
  //           }
  //           return accumalator;
  //         }, []);
  //         this.filteredproject_bystatusinactivejobs.next(this.ProjectDetailsList.slice());
  //         // listen for search field value changes
  //         this.projectFilterCtrl.valueChanges
  //           .pipe(takeUntil(this._onDestroy))
  //           .subscribe(() => {
  //             this.filterproject();
  //           });
  //         this.spinner.hide();
  //       }, 2000);
  //     }
  //   })
  // }

  // to get completed job list
  // setjobdetailscompleted() {
  //   this.projectCtrl = new UntypedFormControl("");
  //   this.getProjectsByOrgId();
  //   this.spinner.show();
  //   if (this.reset_filter_btn) {
  //     this.reset_filter_btn = false;
  //   }
  //   this.jobDetails = [];
  //   this.ProjectDetailsList = [];
  //   this.jobAssigneeDetails = [];
  //   this.pageSize = 10;
  //   let orgId = localStorage.getItem("OrgId");
  //   this.jobsService.getActiveJobDetailsByOrgIdnew(orgId).subscribe(data => {
  //     if (data.map.statusMessage == "Success") {
  //       this.selectedProjectId = '';
  //       let response: any[] = JSON.parse(data.map.data);

  //       this.all_job_details1 = response;
  //       // console.log(this.all_job_details1);
  //       for (var i = 0; i < this.all_job_details1.length; i++) {
  //         if (this.all_job_details1[i].is_activated == true && (this.all_job_details1[i].job_status == "Completed" || this.all_job_details1[i].job_status == "Closed")) {
  //           this.jobDetails.push(this.all_job_details1[i]);
  //         }
  //       }
  //       this.displayedColumns2 = ['select', 'job_name', 'project_name', 'start_date', 'end_date', 'hours', 'logged_hours', 'actions'];
  //       this.tablePaginationOption = tablePageOption.tablePaginationOption(this.jobDetails.length);
  //       this.dataSource2 = new MatTableDataSource(this.jobDetails);
  //       this.no_data = this.jobDetails;
  //       this.dataSource2.sort = this.sort;
  //       this.dataSource2.paginator = this.paginator;
  //       for (let i = 0; i < this.jobDetails.length; i++) {
  //         this.jobAssigneeDetails.push(this.jobDetails[i].jobAssigneeDetails);
  //       }
  //       setTimeout(() => {
  //         this.ProjectDetailsList = this.jobDetails;
  //         // load the initial project list
  //         this.ProjectDetailsList = this.ProjectDetailsList.reduce((accumalator, current) => {
  //           if (
  //             !accumalator.some(
  //               (item) => item.project_name === current.project_name
  //             )
  //           ) {
  //             accumalator.push(current);
  //           }
  //           return accumalator;
  //         }, []);

  //         this.filteredproject_otherjobs.next(this.ProjectDetailsList.slice());
  //         console.log(this.filteredproject_otherjobs);

  //         // listen for search field value changes
  //         this.projectFilterCtrl.valueChanges
  //           .pipe(takeUntil(this._onDestroy))
  //           .subscribe(() => {
  //             this.filterproject();
  //           });
  //         this.spinner.hide();
  //       }, 2000);
  //     }
  //   })
  // }

  // getActiveProjectDetailsByOrgId(){
  //   this.spinner.show();
  //   this.projectsService.getActiveProjectDetailsByOrgId(this.OrgId).subscribe(data => {
  //     if(data.map.statusMessage == "Success"){
  //       let response:any[] = JSON.parse(data.map.data);
  //       for (let i = 0; i < this.jobDetails.length; i++){
  //         for(let j = 0; j < response.length ; j++){
  //           if(this.jobDetails[i].project_id == response[j].id){
  //             this.projectList.push(response[j].project_name);
  //           }
  //         }
  //       }

  //       setTimeout(() => {
  //         this.spinner.hide();
  //       }, 2000);
  //       console.log(this.projectList);
  //     }
  //   })
  // }

  getProjectsByOrgId() {
    this.dataSource2.filter = '';
    this.Filter = false;
    this.filterData ='';
    return new Promise<void>((resolve, reject) => {
      this.ProjectDetailsList = [];
      this.reset_filter_btn = false;
      this.reset_filter_btn1 = false;
      this.reset_filter_btn_jobcompleted = false;
      this.projectsService.getActiveProjectDetailsByOrgIdForFilter(this.OrgId).subscribe(data => {
        if (data.map.statusMessage == "Success") {
          this.ProjectDetailsList = JSON.parse(data.map.data);
          // load the initial project list
          this.filteredproject.next(this.ProjectDetailsList.slice());

          // listen for search field value changes
          this.projectFilterCtrl.valueChanges
            .pipe(takeUntil(this._onDestroy))
            .subscribe(() => {
              this.filterproject();
            });

          resolve(); // Resolve the promise when the operations are completed
        }
      }, error => {
        reject(error); // Reject the promise if an error occurs
        this.router.navigate(["/404"]);
        this.spinner.hide();
      });
    });
  }
  // get inactive project by orgId
  getInactiveProjectsByOrgId() {
    this.ProjectDetailsList = []
    this.reset_filter_btn = false;
    this.reset_filter_btn1 = false;
     this.dataSource2.filter = '';
    this.Filter = false;
    this.filterData ='';
    this.projectsService.getInactiveProjectDetailsByOrgId(this.OrgId).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        this.ProjectDetailsList = JSON.parse(data.map.data);
        this.ProjectDetailsList = this.ProjectDetailsList.map(a => [a.id, a.project_name, a.project_status])
        // load the initial project list
        this.filteredproject.next(this.ProjectDetailsList.slice());
        // listen for search field value changes
        this.projectFilterCtrl.valueChanges
          .pipe(takeUntil(this._onDestroy))
          .subscribe(() => {
            if (!this.ProjectDetailsList) {
              return;
            }
            // get the search keyword
            let search = this.projectFilterCtrl.value;
            if (!search) {
              this.filteredproject.next(this.ProjectDetailsList.slice());
              return;
            } else {
              search = search.toLowerCase();
            }
            // filter the client
            this.filteredproject.next(
              this.ProjectDetailsList.filter(project => project.project_name.toLowerCase().indexOf(search) > -1)
            );
          });
      }
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
    })
  }

  protected filterproject() {
    if (!this.ProjectDetailsList) {
      return;
    }
    // get the search keyword
    let search = this.projectFilterCtrl.value;
    if (!search) {
      this.filteredproject.next(this.ProjectDetailsList.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
    // filter the client
    this.filteredproject.next(
      this.ProjectDetailsList.filter(project => project[1].toLowerCase().indexOf(search) > -1)
    );
  }

  updateJob(id, project_id, assignees) {
    let assigneeDetails: any[] = assignees;
    let assigneeIds: any[] = [];
    let assigneeRph: any[] = [];
    let assignee_cost: any[] = [];
    let assignee_hours: any[] = [];
    // console.log(assigneeDetails);
    for (let i = 0; i < assigneeDetails.length; i++) {
      if (assigneeDetails[i].map.status == "Active") {
        assigneeIds.push(assigneeDetails[i].map.id);
        assigneeRph.push(assigneeDetails[i].map.rate_per_hour);
        assignee_cost.push(assigneeDetails[i].map.assignee_cost);
        assignee_hours.push(assigneeDetails[i].map.assignee_hours);
      }
    }
    this.jobsService.setAssigneesIds(assigneeIds, assigneeRph, assignee_cost, assignee_hours);
    this.projectsService.setProjectId(project_id);
    this.router.navigate(['editjob/' + id]);
  }
  async jobrefresh() {
    if (this.completedjobs === true) {
      await this.togglecompletedjobs();
    }

    else if (this.inactivejobs == true) {
      await this.toggleinactivejobs();
    }
    else if (this.inactivejobs_bystatus == true) {
      await this.toggleinactivejobsbystatus();
    }
    else {
      await this.toggleActivejobs();
    }
  }


  changeStatus(id) {
    // debugger;
    this.jobsService.setJobId(id);
    let data;
    if (this.filteredProjectId != 0) {
      data = { value: this.filteredProjectId };
    }
    const dialogRef = this.dialog.open(JobStatusComponent, {
      disableClose: true,
      width: '33%',
      height: '280px',
      panelClass: 'custom-viewdialogstyle',
    });
    dialogRef.afterClosed().subscribe(
      async resp => {
        // debugger;
        if (resp != undefined && resp != "") {
          if (resp.data == true) {
            // this.ngOnInit();
            if (this.completedjobs === true) {
              await this.togglecompletedjobs();
              if (this.filteredProjectId != 0) {
                this.TriggerFilter(data)
              }
            }

            else if (this.inactivejobs == true) {
              await this.toggleinactivejobs();
              if (this.filteredProjectId != 0) {
                this.TriggerFilter(data)
              }
            }
            else if (this.inactivejobs_bystatus == true) {
              await this.toggleinactivejobsbystatus();
              if (this.filteredProjectId != 0) {
                this.TriggerFilter(data)
              }
            }
            else {
              await this.toggleActivejobs();
              if (this.filteredProjectId != 0) {
                this.TriggerFilter(data)
              }
            }
            // }
            // else if(this.completedjobs = true){
            //   this.setjobdetailscompleted();
            // }
            // this.getActiveJobDetailsByOrgIdnew();
            sessionStorage.setItem("filterProjectId", this.projectFilterCtrl.value);
            // this.jobDetails = [];
          }
        }
      }
    );
  }


  addAssignees(id, projectId, assignee, jobName) {
    let dataFilter;
    if (this.filteredProjectId != 0) {
      dataFilter = { value: this.filteredProjectId };
    }
    this.jobsService.setJobId(id);
    const dialogRef = this.dialog.open(AddAssigneeComponent, {
      minWidth: '600px',
      panelClass: 'custom-viewdialogstyle',
      data: [projectId, assignee, jobName]
    });
    dialogRef.afterClosed().subscribe(
      async resp => {
        if (resp != undefined && resp != "") {
          if (resp.data == true) {
            if (this.completedjobs === true) {
              await this.togglecompletedjobs();
              if (this.filteredProjectId != 0) {
                this.TriggerFilter(dataFilter)
              }
            }

            else if (this.inactivejobs == true) {
              await this.toggleinactivejobs();
              if (this.filteredProjectId != 0) {
                this.TriggerFilter(dataFilter)
              }
            }
            else if (this.inactivejobs_bystatus == true) {
              await this.toggleinactivejobsbystatus();
              if (this.filteredProjectId != 0) {
                this.TriggerFilter(dataFilter)
              }
            }
            else {
              await this.toggleActivejobs();
              if (this.filteredProjectId != 0) {
                this.TriggerFilter(dataFilter)
              }
            }
          }
        }
      }
    );
  }
  deleteJob(id) {
    this.jobsService.setJobId(id);
    const dialogRef = this.dialog.open(DeleteComponent, {
      width: '35%',
      panelClass: 'custom-viewdialogstyle',
      data: { key: "job-delete", showComment: false }
    });
    dialogRef.afterClosed().subscribe(
      resp => {
        if (resp != undefined && resp != "") {
          if (resp.data == true) {
            this.deleteDetails();
          }
        }
        this.jobDetails = [];
        // this.ngOnInit();
      }
    );
  }
  deleteDetails() {
    let dataFilter;
    if (this.filteredProjectId != 0) {
      dataFilter = { value: this.filteredProjectId };
    }
    
    this.spinner.show();
    let id = localStorage.getItem("jobId");
    this.jobsService.deleteJob(id).subscribe(async data => {
      if (data.map.statusMessage == "Success") {
        this.utilsService.openSnackBarAC("Job deleted successfully", "OK");
        this.jobDetails = [];
        if (this.completedjobs === true) {
          await this.togglecompletedjobs();
          if (this.filteredProjectId != 0) {
            this.TriggerFilter(dataFilter)
          }
        }

        else if (this.inactivejobs == true) {
          await this.toggleinactivejobs();
          if (this.filteredProjectId != 0) {
            this.TriggerFilter(data)
          }
        }
        else if (this.inactivejobs_bystatus == true) {
          await this.toggleinactivejobsbystatus();
          if (this.filteredProjectId != 0) {
            this.TriggerFilter(data)
          }
        }
        else {
          await this.toggleActivejobs();
          if (this.filteredProjectId != 0) {
            this.TriggerFilter(data)
          }
        }
        // this.dialogRef.close();
      }
      else {
        this.utilsService.openSnackBarMC("Failed to delete job details", "OK");
      }
      this.spinner.hide();
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
      // this.dialogRef.close();
    })
  }
  showFiller = false;
  applyFilter(filterValue: string) {
    filterValue = filterValue.trim(); // Remove whitespace
    filterValue = filterValue.toLowerCase(); // Datasource defaults to lowercase matches
    this.dataSource.filter = filterValue;
  }

  details(data: any) {
    this.expand_details = data;
  }


  // dataSource = new MatTableDataSource<PeriodicElement>(ELEMENT_DATA);
  selection = new SelectionModel(true, []);
  // columnsToDisplay = ['select', 'name', 'weight', 'symbol', 'position'];
  columnsToDisplay = ['select', 'Job_Name', 'Project', 'Start_Date', 'End_Date', 'Estimated_Hours', 'Logged_Hours', 'Status', 'Users'];

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource2.data.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    if (this.isAllSelected()) {
      this.selection.clear();
      return;
    }

    this.selection.select(...this.dataSource2.data);
  }

  bulk_delete() {
    this.listJob = [];
    for (var i = 0; i < this.selection.selected.length; i++) {
      this.listJob.push(this.selection.selected[i].id)
    }
    // console.log(this.listJob);
  }

  // change event for getting all job id
  onSelectAll(items: any) {
    // console.log(items);
    this.selected = items;
    this.listJob = [];
    if (items == true) {
      for (let i = 0; i < this.jobDetails.length; i++) {
        this.listJob.push(this.jobDetails[i].id);
      }
    } else {
      this.listJob = [];
    }
    // console.log(this.listJob);
  }

  // change event for getting particular job id
  jobCheck(ob: MatCheckboxChange, id) {
    this.select_all = !this.select_all;
    // console.log(ob.checked);
    // console.log(ob.checked + " => " + ob.source.id);
    if (ob.checked == true) {
      this.listJob.push(id);
    } else if (ob.checked == false) {
      this.listJob = [];
    }
    // console.log(this.listJob);
  }
  jobCheck1(ob: MatCheckboxChange, id) {
    // console.log(ob.checked);
    // console.log(ob.checked + " => " + ob.source.id);
    if (ob.checked == true) {
      this.listJob.push(id);
    } else if (ob.checked == false) {
      for (let i = 0; i < this.listJob.length; i++) {
        if (id == this.listJob[i]) {
          this.listJob.splice(i, 1);
        }
      }
    }
    // console.log(this.listJob);
  }

  // bulk delete for jobs 
  bulkdelete() {
    const dialogRef = this.dialog.open(BulkDeleteDialogComponent, {
      width: '40%',
      panelClass: 'custom-viewdialogstyle',
      data: { key: "delete-job", showComment: false }
      // data: this.listJob,
    });
    dialogRef.afterClosed().subscribe(
      resp => {
        // this.selection.clear();
        // this.jobDetails = [];
        // this.listJob = [];
        if (resp != undefined && resp != "") {
          if (resp.data == true) {
            this.bulkDeleteDetails(this.listJob);
            // this.ngOnInit();
          }
        }
        this.selection.clear();
        this.jobDetails = [];
        this.listJob = [];
      }
    );
  }
  // Bulk delete for jobs
  bulkDeleteDetails(data: any) {
    this.spinner.show();
    let dataFilter;
    if (this.filteredProjectId != 0) {
      dataFilter = { value: this.filteredProjectId };
    }
    let listdata = {
      "deleteIds": data,
    }
    this.jobsService.bulkDeleteJob(listdata).subscribe(async data => {
      if (data.map.statusMessage == "Success") {
        this.utilsService.openSnackBarAC("Jobs deleted successfully", "OK");
        this.selection.clear();
        this.jobDetails = [];
        this.listJob = [];
        if (this.completedjobs === true) {
          await this.togglecompletedjobs();
          if (this.filteredProjectId != 0) {
            this.TriggerFilter(dataFilter)
          }
        }

        else if (this.inactivejobs == true) {
          await this.toggleinactivejobs();
          if (this.filteredProjectId != 0) {
            this.TriggerFilter(data)
          }
        }
        else if (this.inactivejobs_bystatus == true) {
          await this.toggleinactivejobsbystatus();
          if (this.filteredProjectId != 0) {
            this.TriggerFilter(data)
          }
        }
        else {
          await this.toggleActivejobs();
          if (this.filteredProjectId != 0) {
            this.TriggerFilter(data)
          }
        }
        // this.ngOnInit();
      }
      else {
        this.utilsService.openSnackBarMC("Faild to delete jobs", "OK");
      }
      this.spinner.hide();
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
    })
  }

  // bulk Assignees add for jobs 
  bulkAssignee() {
    let data;
    if (this.filteredProjectId != 0) {
      data = { value: this.filteredProjectId };
    }
    const dialogRef = this.dialog.open(BulkAssigneesComponent, {
      disableClose: true,
      minWidth: '600px',
      panelClass: 'custom-viewdialogstyle',
      data: { ProjectId: this.filteredProjectId, JobList: this.listJob }
    });
    dialogRef.afterClosed().subscribe(
      async resp => {
        // this.selection.clear();
        // this.jobDetails = [];
        // this.listJob = [];
        if (resp != undefined && resp != "") {
          if (resp.data == true) {
            if (this.completedjobs === true) {
              await this.togglecompletedjobs();
              if (this.filteredProjectId != 0) {
                this.TriggerFilter(data)
              }
            }

            else if (this.inactivejobs == true) {
              await this.toggleinactivejobs();
              if (this.filteredProjectId != 0) {
                this.TriggerFilter(data)
              }
            }
            else if (this.inactivejobs_bystatus == true) {
              await this.toggleinactivejobsbystatus();
              if (this.filteredProjectId != 0) {
                this.TriggerFilter(data)
              }
            }
            else {
              await this.toggleActivejobs();
              if (this.filteredProjectId != 0) {
                this.TriggerFilter(data)
              }
            }
          }
        }
      }
    );
  }

  //to view job details
  viewJob(element) {
    // console.log(element);
    // this.projectsService.setProjectId(element.id);
    // this.jobsService.setJobId(element.id);
    this.dialog.open(ViewJobComponent, {
      width: '50%',
      maxHeight: '460px',
      panelClass: 'custom-viewdialogstyle',
      data: element
    });
  }

  //filter
  applyJobFilter(event: Event) {
    this.Filter = false;
    this.filterData = (event.target as HTMLInputElement).value;
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource2.filter = filterValue.trim().toLowerCase();
    if (this.dataSource2.filteredData.length == 0) {
      this.Filter = true;
    }
    if (this.dataSource2.paginator) {
      this.dataSource2.paginator = this.paginator;
    }
  }
  newJobData: any[] = [];
  filteredProjectId: any = 0;
  selectedProjectEvent(event) {
    // debugger;
    this.filteredProjectId = 0;
    this.spinner.show();
    this.filterData ='';
    this.Filter = false;
    this.dataSource2.filter = '';
    this.reset_filter_btn1 = false;
    this.reset_filter_btn = true;
    this.reset_filter_btn_jobcompleted = true;
    this.newJobData = [];
    for (let i = 0; i < this.jobDetails.length; i++) {
      if (event.value == this.jobDetails[i].project_id) {
        this.newJobData.push(this.jobDetails[i]);
      }
    }
    this.filteredProjectId = event.value;
    this.dataSource2 = new MatTableDataSource();
    this.no_data = [];
    this.dataSource2 = new MatTableDataSource(this.newJobData);
    this.no_data = this.newJobData;
    this.dataSource2.sort = this.sort;
    this.dataSource2.paginator = this.paginator;

    //*************** */ The below code is for to assign bulk users in jobs in slected projet based on filter dropdown ************************
    if (this.completedjobs === true || this.inactivejobs_bystatus == true) {
      this.displayedColumns2 = ['select', 'job_name', 'project_name', 'start_date', 'end_date', 'hours', 'logged_hours', 'actions'];
    }
    else if (this.inactivejobs == true) {
      this.displayedColumns2 = ['job_name', 'project_name', 'start_date', 'end_date', 'hours', 'logged_hours'];
    }
    else {
      this.displayedColumns2 = ['select', 'job_name', 'project_name', 'start_date', 'end_date', 'hours', 'logged_hours', 'assinees', 'actions'];
    }
    this.spinner.hide();

  }
  selectedProjectinactiveEvent(event) {
    this.spinner.show();
    this.reset_filter_btn1 = true;
    this.reset_filter_btn = false;
    this.newJobData = [];
    for (let i = 0; i < this.jobDetails.length; i++) {
      if (event.value == this.jobDetails[i].project_id) {
        this.newJobData.push(this.jobDetails[i]);
      }
    }
    this.dataSource2 = new MatTableDataSource();
    this.no_data = [];
    this.dataSource2 = new MatTableDataSource(this.newJobData);
    this.no_data = this.newJobData;
    this.dataSource2.sort = this.sort;
    this.dataSource2.paginator = this.paginator;
    this.spinner.hide();
  }

  // Filter event for inactive jobs by job status
  selectedProjectinactiveEventByJobStatus(event) {
    this.spinner.show();
    this.reset_filter_btn1 = false;
    this.reset_filter_btn = false;
    this.reset_filter_btn_jobcompleted = false;
    this.reset_filter_btn_inactivejobstatus = true;
    this.newJobData = [];
    for (let i = 0; i < this.jobDetails.length; i++) {
      if (event.value == this.jobDetails[i].project_id) {
        this.newJobData.push(this.jobDetails[i]);
      }
    }
    this.dataSource2 = new MatTableDataSource();
    this.no_data = [];
    this.dataSource2 = new MatTableDataSource(this.newJobData);
    this.no_data = this.newJobData;
    this.dataSource2.sort = this.sort;
    this.dataSource2.paginator = this.paginator;
    this.spinner.hide();
  }
  // Filter event for other jobs
  selectedProjectEventByOtherJobs(event) {
    this.spinner.show();
    this.reset_filter_btn1 = false;
    this.reset_filter_btn = false;
    this.reset_filter_btn_jobcompleted = true;
    this.reset_filter_btn_inactivejobstatus = false;
    this.newJobData = [];
    for (let i = 0; i < this.jobDetails.length; i++) {
      if (event.value == this.jobDetails[i].project_id) {
        this.newJobData.push(this.jobDetails[i]);
      }
    }
    this.dataSource2 = new MatTableDataSource();
    this.no_data = [];
    this.dataSource2 = new MatTableDataSource(this.newJobData);
    this.no_data = this.newJobData;
    this.dataSource2.sort = this.sort;
    this.dataSource2.paginator = this.paginator;
    this.spinner.hide();
  }
  //pagination size
  changePage(event) {
    this.pageSize = event.pageSize;
  }

  accessCheck() {
    let access = localStorage.getItem("emp_access");
    var access_to = [];
    if (access != null) {
      access_to = access.split(",");
    }
    this.Accesstoclient_settings = access_to.includes('client-settings');
  }

  //filter by project
  async TriggerFilter(data) {
    this.selectedProjectId = this.filteredProjectId;
    await this.selectedProjectEvent(data);
  }
}

