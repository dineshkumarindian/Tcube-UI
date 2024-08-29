import { animate, state, style, transition, trigger } from '@angular/animations';
import { SelectionModel } from '@angular/cdk/collections';
import { AfterContentChecked, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { ThemePalette } from '@angular/material/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTreeModule } from '@angular/material/tree';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatCheckbox } from '@angular/material/checkbox';
import { Router } from '@angular/router';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { NgxSpinnerService } from 'ngx-spinner';
import { ReplaySubject, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { JobsService } from '../services/jobs.service';
import { ProjectsService } from '../services/projects.service';
import { SettingsService } from '../services/settings.service';
import { BulkDeleteComponent } from './bulk-delete/bulk-delete.component';
import { BulkUsersComponent } from './bulk-users/bulk-users.component';
import { ProjectDeleteComponent } from './project-delete/project-delete.component';
import { ProjectStatusComponent } from './project-status/project-status.component';
import { ViewProjectComponent } from './view-project/view-project.component';
import { ViewUsersComponent } from './view-users/view-users.component';
import { noDataMessage } from '../util/constants';
import { DeleteComponent } from '../util/delete/delete.component';
import { BulkDeleteDialogComponent } from '../util/bulk-delete-dialog/bulk-delete-dialog.component';
import { UtilService } from '../services/util.service';
import * as tablePageOption from '../util/table-pagination-option';
/**
 * @title Table with expandable rows
 */
@Component({
  selector: 'app-projects',
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.less'],
  animations: [
    trigger('detailExpand', [
      state('void', style({ height: '0px', minHeight: '0', visibility: 'hidden' })),
      state('*', style({ height: '*', visibility: 'visible' })),
      transition('void <=> *', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class ProjectsComponent implements OnInit, AfterContentChecked {
  nodataMsg = noDataMessage;

  selectColumnName: string = 'select';
  displayedColumns: string[] = ['select', 'project_name', 'client_name', 'start_date', 'end_date', 'Estimated_Hours', 'Logged_Hours', 'Status', 'Jobs'];
  // dataSource = new MatTableDataSource<PeriodicElement>(ELEMENT_DATA);
  displayedColumns1: string[] = ['selector', 'project_name', 'client_name', 'start_date', 'end_date', 'Head', 'Manager', 'Members', 'Logged_Hours', 'Jobs', 'actions'];
  // displayedColumns1: string[] = [ 'Project_Name', 'Client', 'Estimated_Hours', 'Logged_Hours', 'Status','assinees'];
  dataSource1 = new MatTableDataSource();
  selection = new SelectionModel(true, []);
  select_all: boolean = false;
  selected: boolean = false;
  expand_details: any;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  isExpansionDetailRow = (index, row) => row.hasOwnProperty('detailRow');

  projectdropdownList = [];
  projectselectedItems = [];
  clientDetailsList = [];
  clientselectedItems = [];
  headdropdownList = [];
  headselectedItems = [];
  managerselectedItems = [];
  managerdropdownList = [];
  statusselectedItems = [];
  statusdropdownList = [];
  dropdownSettings: IDropdownSettings = {};
  projectDetails = [];
  tempLength: any;
  userLength = [];
  newJobDetails = []
  jobDetails = [];
  newDetails = [];
  newJobData: any[] = [];
  matBadgeCounts: any = [];
  checkProjectList = [];
  Filter: boolean;
  Accesstoclient_settings: boolean;
  filterData: string;
  detailsLength: any;
  firstNoData: Boolean = false;
  secondNoData: Boolean = false;
  // matpagesize: number = 5;
  pageSize: number = 10;
  tablePaginationOption: number[];
  lastlog: number;
  selectedClientId: any;
  reset_filter_btn: Boolean = false;
  /** control for the selected project */
  public clientCtrl: UntypedFormControl = new UntypedFormControl("");

  /** control for the MatSelect filter keyword */
  public clientFilterCtrl: UntypedFormControl = new UntypedFormControl();

  /** list of head filtered by search keyword */
  public filteredclient: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);

  public filteredclient_bystatusinactiveprojects: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);

  public filteredclient_otherjobs: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);

  protected _onDestroy = new Subject<void>();
  inactiveProjectDetails: any[];
  inactiveProject: Boolean;
  inactiveProjects_bystatus: Boolean;
  completedProjects: Boolean;
  reset_filter_btn1: Boolean = false;
  inprogress_jobs: Boolean = false;
  reset_filter_btn_projectcompleted: boolean = false;
  reset_filter_btn_inactiveprojectstatus: boolean = false;

  constructor(private projectsService: ProjectsService,
    private jobsService: JobsService,
    private router: Router,
    private dialog: MatDialog,
    private spinner: NgxSpinnerService,
    private cdref: ChangeDetectorRef,
    private settingsService: SettingsService,
    private utilsService: UtilService) { }
  ngAfterContentChecked(): void {
    this.cdref.detectChanges();
  }
  org_Id: any;
  ngOnInit() {
    sessionStorage.removeItem("TT-projectName");
    sessionStorage.removeItem("projectId");
    sessionStorage.removeItem("TT-jobName");
    this.org_Id = localStorage.getItem("OrgId");
    this.inactiveProject = false;
    this.toggleActiveProject();
    this.getActiveJobDetails();
    this.accessCheck();
  }
  cancelfilter() {
    this.projectselectedItems = [];
    this.clientselectedItems = [];
    this.managerselectedItems = [];
    this.headselectedItems = [];
    this.statusselectedItems = [];

  }

  showFiller = false;
  applyFilter(filterValue: string) {
    filterValue = filterValue.trim(); // Remove whitespace
    filterValue = filterValue.toLowerCase(); // Datasource defaults to lowercase matches
    this.dataSource1.filter = filterValue;
  }
  Expandcondition: boolean = false;
  Expandindex: number = null;
  details(data: any, index: any) {
    this.Expandcondition == false ? this.Expandcondition = true  : this.Expandcondition = false;
    this.Expandindex = index;
    this.spinner.show();
    this.newDetails = [];
    this.detailsLength = 0;

    if (this.lastlog != undefined && this.lastlog != index) {
      var activelog = document.getElementById("logId" + this.lastlog);
      if (activelog != null) {
        activelog.click();
        this.newDetails = [];
      }


    }
    if (this.lastlog == index) {
      this.lastlog = undefined;
    }
    else {
      this.lastlog = index;
    }
    for (let j = 0; j < this.jobDetails.length; j++) {
      if (data == this.jobDetails[j].project_id) {
        this.newDetails.push(this.jobDetails[j]);
      }
    }
    this.detailsLength = this.newDetails.length;
    this.expand_details = this.newDetails;
    setTimeout(() => {
      this.spinner.hide();
    }, 500)
  }
  getProjectDetails(data: any) {
    this.spinner.show();
    this.newDetails = [];
    this.expand_details = [];
    for (let j = 0; j < this.jobDetails.length; j++) {
      if (data == this.jobDetails[j].project_id) {
        this.newDetails.push(this.jobDetails[j]);
      }
    }
    this.expand_details = this.newDetails;
    setTimeout(() => {
      this.spinner.hide();
    }, 500)
  }
  onSelectAll(items: any) {
    // console.log(items);
    this.selected = items;
    this.listProject = [];
    if (items == true) {
      for (let i = 0; i < this.projectDetails.length; i++) {
        this.listProject.push(this.projectDetails[i].id);
      }
    } else {
      this.listProject = [];
    }
  }

  // !mat table pagination call event for log report
  resetlog(event?: PageEvent) {
    // console.log("event...",event);
    this.pageSize = event.pageSize;
    // console.log("pageSize event...",this.pageSize);
    if (this.lastlog != undefined) {
      var activelog = document.getElementById("logId" + this.lastlog);

      if (activelog != null) {
        activelog.click();
        this.newDetails = [];
        this.lastlog = undefined;
      }
    }


  }

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource1.data.length;
    return numSelected === numRows;
  }
  masterToggle() {
    if (this.isAllSelected()) {
      this.selection.clear();
    } else {
      this.dataSource1.data.forEach(row => this.selection.select(row));
    }

  }
  listProject = [];
  mainTemp = [];
  userTemp = [];
  // subTemp = [];
  temp = [];
  // tempData=[];
  async toggleActiveProject() {
    this.clientCtrl = new UntypedFormControl("");
    this.dataSource1 = new MatTableDataSource();
    this.listProject = [];
    this.inactiveProject = false;
    this.completedProjects = false;
    this.inactiveProjects_bystatus = false;
    this.reset_filter_btn1 = false;
    this.selectedClientId = '';
    this.selection.clear();
    this.displayedColumns1 = ['selector', 'project_name', 'client_name', 'start_date', 'end_date', 'Logged_Hours', 'Head', 'Manager', 'Members', 'Jobs', 'actions'];
    await this.getProjectByOrgidandStatusCustomdata("'Inprogress'", true);
    await this.getClientsByOrgId();
  }
  async toggleInactiveProject() {
    this.dataSource1 = new MatTableDataSource();
    this.clientCtrl = new UntypedFormControl("");
    this.all_project_details = [];
    this.listProject = [];
    this.completedProjects = false;
    this.inactiveProjects_bystatus = false;
    this.inactiveProject = true;
    this.reset_filter_btn = false;
    this.selectedClientId = '';
    this.selection.clear();
    this.displayedColumns1 = ['project_name', 'client_name', 'start_date', 'end_date', 'Logged_Hours', 'Head', 'Manager', 'Members', 'Jobs',];
    await this.getProjectByOrgidandStatusCustomdata("'Inprogress','To-do','Closed','Completed'", false);
    await this.getInactiveClientsByOrgId();
  }
  async toggleInactiveProjectbyStatus() {
    this.dataSource1 = new MatTableDataSource();
    this.clientCtrl = new UntypedFormControl("");
    this.all_project_details = [];
    this.listProject = [];
    this.inactiveProject = false;
    this.completedProjects = false;
    this.inactiveProjects_bystatus = true;
    this.selectedClientId = '';
    this.displayedColumns1 = ['selector', 'project_name', 'client_name', 'start_date', 'end_date', 'Logged_Hours', 'Head', 'Manager', 'Members', 'Jobs', 'actions'];
    await this.getProjectByOrgidandStatusCustomdata("'Inactive'", true);
    await this.getClientsByOrgId();
    // this.setprojectdetailsinactivebystatus();
    // this.selectedProjectId = '';
  }
  async toggleOtherProjects() {
    this.dataSource1 = new MatTableDataSource();
    this.clientCtrl = new UntypedFormControl("");
    this.all_project_details = [];
    this.listProject = [];
    this.completedProjects = true;
    this.inactiveProject = false;
    this.inactiveProjects_bystatus = false;
    this.selectedClientId = '';
    this.displayedColumns1 = ['selector', 'project_name', 'client_name', 'start_date', 'end_date', 'Logged_Hours', 'Head', 'Manager', 'Members', 'Jobs', 'actions'];
    await this.getProjectByOrgidandStatusCustomdata("'Closed','Completed'", true);
    await this.getClientsByOrgId();
  }
  Movetoclients() {
    localStorage.setItem('RouteToInactiveClients', "true");
    this.router.navigate(["/project-jobs-settings"]);
  }

  all_project_details: any = [];
  getActiveJobDetails() {
    // this.spinner.show();
    let orgId = localStorage.getItem("OrgId");
    this.jobsService.getActiveJobDetailsByOrgIdnew(orgId).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        let response: any[] = JSON.parse(data.map.data);

        this.jobDetails = response;
      }
      // this.spinner.hide();
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
    })
  }

  clientData: any[] = [];
  activeClientdata: any[] = [];
  getClientsByOrgId() {
    // this.spinner.show();
    let orgId = localStorage.getItem("OrgId");
    if (this.activeClientdata.length == 0) {
      this.settingsService.getActiveClientDetailsByOrgId(orgId).subscribe(data => {
        if (data.map.statusMessage == "Success") {
          this.clientData = JSON.parse(data.map.data);
          this.activeClientdata = this.clientData;
          this.filteredclient.next(this.clientData.slice());

          // listen for search field value changes
          this.clientFilterCtrl.valueChanges
            .pipe(takeUntil(this._onDestroy))
            .subscribe(() => {
              this.filterclient();
            });
        }
        // this.spinner.hide();
      }, (error) => {
        this.router.navigate(["/404"]);
        this.spinner.hide();
      })
    }
    else {
      this.clientData = this.activeClientdata;
      this.filteredclient.next(this.clientData.slice());

      // listen for search field value changes
      this.clientFilterCtrl.valueChanges
        .pipe(takeUntil(this._onDestroy))
        .subscribe(() => {
          this.filterclient();
        });
    }

  }
  // to get inactve client details
  getInactiveClientsByOrgId() {
    // this.spinner.show();
    let orgId = localStorage.getItem("OrgId");
    this.settingsService.getInactiveClientDetailsByOrgId(orgId).subscribe(data => {
      this.reset_filter_btn1 = false;
      this.reset_filter_btn = false;
      if (data.map.statusMessage == "Success") {
        this.clientData = JSON.parse(data.map.data);
        this.filteredclient.next(this.clientData.slice());

        // listen for search field value changes
        this.clientFilterCtrl.valueChanges
          .pipe(takeUntil(this._onDestroy))
          .subscribe(() => {
            this.filterclient();
          });
      }
      // this.spinner.hide();
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
    })
  }
  // ****
  protected filterclient() {
    if (!this.clientData) {
      return;
    }
    // get the search keyword
    let search = this.clientFilterCtrl.value;
    if (!search) {
      this.filteredclient.next(this.clientData.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
    // filter the client
    this.filteredclient.next(
      this.clientData.filter(project => project.client_name.toLowerCase().indexOf(search) > -1)
    );
  }

  // filtering
  protected filterclient1() {
    if (!this.clientData) {
      return;
    }

    // get the search keyword
    let search = this.clientFilterCtrl.value;
    if (!search) {
      this.filteredclient.next(this.clientData.slice());
      return;
    } else {
      search = search.toLowerCase();
    }

    // filter the client
    this.filteredclient.next(
      this.clientData.filter(project => project.clientDetails.client_name.toLowerCase().indexOf(search) > -1)
    );
  }
  updateProject(id, details) {
    let resourceDetails: any[] = details;
    let managerIds: any[] = [];
    let managerRph: any[] = [];
    let userIds: any[] = [];
    let userRph: any[] = [];
    for (let i = 0; i < resourceDetails.length; i++) {
      if (resourceDetails[i].map.designation == "project_manager") {
        managerIds.push(resourceDetails[i].map.id);
        managerRph.push(resourceDetails[i].map.rate_per_hour);
      } else if (resourceDetails[i].map.designation == "team_members") {
        userIds.push(resourceDetails[i].map.id);
        userRph.push(resourceDetails[i].map.rate_per_hour);
      }
    }
    this.projectsService.setUsersIds(managerIds, managerRph, userIds, userRph);

    this.router.navigate(['editproject/' + id]);
  }

  viewProjectInformation(id) {
    this.projectsService.setProjectId(id);
    this.dialog.open(ViewProjectComponent);
  }
  jobs: any[] = [];
  tempEmpDetails: any;
  activeProjectDetailsList: any[] = [];
  filterJobsByProjectId(element) {
    this.jobs = [];
    this.activeProjectDetailsList = [];
    for (let i = 0; i < this.jobDetails.length; i++) {
      if (this.jobDetails[i].project_id == element.id) {
        this.jobs.push(this.jobDetails[i]);
      }
    }
    this.tempEmpDetails = element.resourceDetails;
    for (let i = 0; i < this.tempEmpDetails.length; i++) {
      if (this.tempEmpDetails[i].map.status == 'Active') {
        this.activeProjectDetailsList.push(this.tempEmpDetails[i]);
      }
    }
    var filterArray = this.activeProjectDetailsList.reduce((accumalator, current) => {
      if (
        !accumalator.some(
          (item) => item.map.id === current.map.id
        )
      ) {
        accumalator.push(current);
      }
      return accumalator;
    }, []);
    this.tempEmpDetails = filterArray;
    this.viewProject(element);
  }
  // }
  // }

  viewProject(element) {
    this.projectsService.setProjectId(element.id);
    this.dialog.open(ViewProjectComponent, {
      disableClose: true,
      width: '50%',
      maxHeight: '460px',
      panelClass: 'custom-viewdialogstyle',
      data: ({ projectData: element, jobs: this.jobs, totalUsers: this.tempEmpDetails.length, totalJobs: this.jobs.length }),
    });
  }

  changeStatus(id) {
    let dataFilter;
    if (this.filteredClientId != 0) {
      dataFilter = { value: this.filteredClientId };
    }
    this.disableProjectStatusChange();
    this.projectsService.setProjectId(id);
    const dialogRef = this.dialog.open(ProjectStatusComponent, {
      disableClose: true,
      width: '35%',
      data: this.inprogress_jobs,
      panelClass: 'custom-viewdialogstyle'
    });
    dialogRef.afterClosed().subscribe(
      async resp => {
        if (resp != undefined && resp != "") {
          if (resp.data == true) {
            if (this.completedProjects == true) {
              await this.toggleOtherProjects();
              if (this.filteredClientId != 0) {
                this.TriggerFilter(dataFilter)
              }
            }
            else if (this.inactiveProject == true) {
              await this.toggleInactiveProject();
              if (this.filteredClientId != 0) {
                this.TriggerFilter(dataFilter)
              }
            }
            else if (this.inactiveProjects_bystatus == true) {
              await this.toggleInactiveProjectbyStatus();
              if (this.filteredClientId != 0) {
                this.TriggerFilter(dataFilter)
              }
            }
            else {
              await this.toggleActiveProject();
              if (this.filteredClientId != 0) {
                this.TriggerFilter(dataFilter)
              }
            }
            this.projectDetails = [];
          }
        }
      }
    );
  }
  // ********************For disable project status update while any jobs is in progress under the project
  disableProjectStatusChange() {
    this.inprogress_jobs = false;
    for (let i = 0; i < this.expand_details.length; i++) {
      if (this.expand_details[i].job_status == "Inprogress") {
        this.inprogress_jobs = true;
        break;
      }
    }
  }

  projectName: any = []
  bulk_delete() {
    this.listProject = [];
    this.projectName = [];
    for (var i = 0; i < this.selection.selected.length; i++) {
      this.listProject.push(this.selection.selected[i].id)
      this.projectName += (i + 1 != this.selection.selected.length) ? (" " + this.selection.selected[i].project_name + ",") : this.selection.selected[i].project_name;
    }

  }

  //delete method start
  deleteProject(id) {
    this.projectsService.setProjectId(id);
    const dialogRef = this.dialog.open(DeleteComponent, {
      disableClose: true,
      width: '30%',
      panelClass: 'custom-viewdialogstyle',
      data: { key: "delete-project", showComment: false }
    });
    dialogRef.afterClosed().subscribe(
      resp => {
        if (resp != undefined && resp != "") {
          if (resp.data == true) {
            this.deleteDetails();
          }
        }
      }
    );
  }
  deleteDetails() {
    this.spinner.show();
    let dataFilter;
    if (this.filteredClientId != 0) {
      dataFilter = { value: this.filteredClientId };
    }
    let id = localStorage.getItem("projectId");
    this.projectsService.deleteProject(id).subscribe(async data => {
      if (data.map.statusMessage == "Success") {
        this.utilsService.openSnackBarAC("Project deleted successfully", "OK");
        if (this.completedProjects == true) {
          await this.toggleOtherProjects();
          if (this.filteredClientId != 0) {
            this.TriggerFilter(dataFilter)
          }
        }
        else if (this.inactiveProject == true) {
          await this.toggleInactiveProject();
          if (this.filteredClientId != 0) {
            this.TriggerFilter(dataFilter)
          }
        }
        else if (this.inactiveProjects_bystatus == true) {
          await this.toggleInactiveProjectbyStatus();
          if (this.filteredClientId != 0) {
            this.TriggerFilter(dataFilter)
          }
        }
        else {
          await this.toggleActiveProject();
          if (this.filteredClientId != 0) {
            this.TriggerFilter(dataFilter)
          }
        }
        this.projectDetails = [];
        // this.ngOnInit();
      }
      else {
        this.utilsService.openSnackBarMC("Failed to delete project details", "OK");
      }
      this.spinner.hide();
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
    })
  }

  // bulk delete for projects 
  bulkdelete() {
    const dialogRef = this.dialog.open(BulkDeleteDialogComponent, {
      disableClose: true,
      width: '30%',
      panelClass: 'custom-viewdialogstyle',
      data: { key: "delete-project", showComment: false }
      // data: { name: this.listProject },
    });
    dialogRef.afterClosed().subscribe(
      resp => {
        if (resp != undefined && resp != "") {
          if (resp.data == true) {
            this.bulkDeleteDetails(this.listProject);
          }
        }
        this.selection.clear();
        this.listProject = [];
        // this.ngOnInit();
      }
    );
  }
  bulkDeleteDetails(listOfData: any) {
    this.spinner.show();
    let dataFilter;
    if (this.filteredClientId != 0) {
      dataFilter = { value: this.filteredClientId };
    }
    let listdata = {
      "deleteIds": listOfData
    }
    this.projectsService.bulkDelet(listdata).subscribe(async data => {
      if (data.map.statusMessage == "Success") {
        this.utilsService.openSnackBarAC("Projects deleted successfully", "OK");
        this.selection.clear();
        if (this.completedProjects == true) {
          await this.toggleOtherProjects();
          if (this.filteredClientId != 0) {
            this.TriggerFilter(dataFilter)
          }
        }
        else if (this.inactiveProject == true) {
          await this.toggleInactiveProject();
          if (this.filteredClientId != 0) {
            this.TriggerFilter(dataFilter)
          }
        }
        else if (this.inactiveProjects_bystatus == true) {
          await this.toggleInactiveProjectbyStatus();
          if (this.filteredClientId != 0) {
            this.TriggerFilter(dataFilter)
          }
        }
        else {
          await this.toggleActiveProject();
          if (this.filteredClientId != 0) {
            this.TriggerFilter(dataFilter)
          }
        }
        this.listProject = [];
        // this.ngOnInit();
      }
      else {
        this.utilsService.openSnackBarMC("Failed to delete project details", "OK");
      }
      this.spinner.hide();
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
    })
  }

  viewUsers(id, headData, data) {
    this.selection.clear();
    this.listProject = [];
    let isActiveProject: boolean = false;
    if (!this.completedProjects && !this.inactiveProject && !this.inactiveProjects_bystatus) {
      isActiveProject = true;
    }
    else {
      isActiveProject = false;
    }
    let dataFilter;
    if (this.filteredClientId != 0) {
      dataFilter = { value: this.filteredClientId };
    }
    const dialogRef = this.dialog.open(ViewUsersComponent, {
      disableClose: true,
      width: '41%',
      panelClass: 'custom-viewdialogstyle',
      data: { id: id, header: headData, isActiveProject: isActiveProject, projectName: data }
    });
    dialogRef.afterClosed().subscribe(
      async resp => {
        if (resp != undefined && resp != "") {
          if (resp.data == true) {
            if (this.completedProjects == true) {
              await this.toggleOtherProjects();
              if (this.filteredClientId != 0) {
                this.TriggerFilter(dataFilter)
              }
            }
            else if (this.inactiveProject == true) {
              await this.toggleInactiveProject();
              if (this.filteredClientId != 0) {
                this.TriggerFilter(dataFilter)
              }
            }
            else if (this.inactiveProjects_bystatus == true) {
              await this.toggleInactiveProjectbyStatus();
              if (this.filteredClientId != 0) {
                this.TriggerFilter(dataFilter)
              }
            }
            else {
              await this.toggleActiveProject();
              if (this.filteredClientId != 0) {
                this.TriggerFilter(dataFilter)
              }
            }
            this.projectDetails = [];
          }
        }
      }
    );
  }

  // bulk users add for jobs 
  bulkAssignee() {
    const dialogRef = this.dialog.open(BulkUsersComponent, {
      disableClose: true,
      minWidth: '30%',
      panelClass: 'custom-viewdialogstyle',
      data: {isAssignee:"add-user",listproject: this.listProject, projectName: this.projectName }
    });
    dialogRef.afterClosed().subscribe(
      resp => {
        if (resp != undefined && resp != "") {
          if (resp.data == true) {
            this.selection.clear();
            this.jobDetails = [];
            this.listProject = [];
            this.ngOnInit();
          }
        }

      }
    );
  }

  //filter
  applyProjectFilter(event: Event) {
    this.Filter = false;
    this.filterData = (event.target as HTMLInputElement).value;
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource1.filter = filterValue.trim().toLowerCase();
    if (this.dataSource1.filteredData.length == 0) {
      this.Filter = true;
    }
    if (this.dataSource1.paginator) {
      this.dataSource1.paginator = this.paginator;
    }
  }

  //filter by client name
  tempProject: any = [];
  filteredClientId: any = 0;
  selectedClientEvent(event) {
    this.reset_filter_btn = true;
    this.firstNoData = false;
    this.secondNoData = true;
    this.tempProject = [];
    this.dataSource1 = new MatTableDataSource();
    this.tempProject = this.projectDetails.filter(a => a.clientId == event.value);
    this.mainTemp = [];
    this.userTemp = [];
    this.filteredClientId = event.value;

    for (let i = 0; i < this.tempProject.length; i++) {
      let rDetail = this.tempProject[i].resourceDetails;
      let temp1 = rDetail.filter(x => x.map.designation == 'project_manager')
      this.temp = [];
      for (var k = 0; k < temp1.length; k++) {
        this.temp.push({ "name": temp1[k].map.name, "role": temp1[k].map.role });
      }
      this.mainTemp.push(this.temp);
    }

    // for users list
    for (let i = 0; i < this.tempProject.length; i++) {
      let rDetail = this.tempProject[i].resourceDetails;
      this.temp = [];
      this.temp = rDetail.filter(x => x.map.designation == 'team_members' && x.map.status == 'Active');
      this.userTemp.push(this.temp);
    }

    this.dataSource1 = new MatTableDataSource(this.tempProject);
    this.dataSource1.sort = this.sort;
    this.dataSource1.paginator = this.paginator;

  }

  //to get the project details by orgid and project_status
  getProjectByOrgidandStatusCustomdata(status, is_Activated) {
    return new Promise<void>((resolve, reject) => {
      this.reset_filter_btn = false;
      this.secondNoData = false;
      this.Filter = false;
      this.pageSize = 10;
      this.selection.clear();
      this.spinner.show();
      let formdata = {
        "org_Id": this.org_Id,
        "status": status,
        "is_Activated": is_Activated
      }
      this.projectsService.getProjectByOrgidAndStatusCustomData(formdata).subscribe(data => {
        this.projectDetails = [];
        if (data.map.statusMessage == "Success") {
          let response: any[] = JSON.parse(data.map.data);
          this.tablePaginationOption = [];
          this.projectDetails = response;
          this.mainTemp = [];
          for (let i = 0; i < this.projectDetails.length; i++) {
            let rDetail = this.projectDetails[i].resourceDetails;
            let temp1 = rDetail.filter(x => x.map.designation == 'project_manager')
            this.temp = [];
            for (var k = 0; k < temp1.length; k++) {
              this.temp.push({ "name": temp1[k].map.name, "role": temp1[k].map.role });
            }
            this.mainTemp.push(this.temp);
          }
          // for users list
          this.userTemp = [];
          for (let i = 0; i < this.projectDetails.length; i++) {
            let rDetail = this.projectDetails[i].resourceDetails;
            this.temp = [];
            this.temp = rDetail.filter(x => x.map.designation == 'team_members' && x.map.status == 'Active');
            this.userTemp.push(this.temp);
          }
          for (let i = 0; i < this.projectDetails.length; i++) {
            this.projectDetails[i].managers = this.mainTemp[i].length > 0 ? this.mainTemp[i] : '-';
            this.projectDetails[i].users = this.userTemp[i];
          }
          this.tablePaginationOption = tablePageOption.tablePaginationOption(this.projectDetails.length);
          this.dataSource1 = new MatTableDataSource(this.projectDetails);
          this.dataSource1.sort = this.sort;
          this.dataSource1.paginator = this.paginator;
          setTimeout(() => {
            resolve(); // Resolve the promise when the operations are completed
            this.spinner.hide();
          }, 20);
        }
        else {
          this.firstNoData = true;
          this.dataSource1 = new MatTableDataSource();
          this.dataSource1.sort = this.sort;
          this.dataSource1.paginator = this.paginator;
          setTimeout(() => {
            this.spinner.hide();
          }, 2000);
        }
      }, (error) => {
        this.router.navigate(["/404"]);
        this.spinner.hide();
      })
    });
  }

  //reset the table for filter by client
  resetTableFilterByClient() {
    if (this.completedProjects == true) {
      this.toggleOtherProjects();
    }
    else if (this.inactiveProject == true) {
      this.toggleInactiveProject();
    }
    else if (this.inactiveProjects_bystatus == true) {
      this.toggleInactiveProjectbyStatus();
    }
    else {
      this.toggleActiveProject();
    }
  }
  redirectToJob(projectId) {
    sessionStorage.setItem('projectId', projectId);
    this.router.navigate(["/addjobs"]);
  }
  accessCheck() {
    let access = localStorage.getItem("emp_access");
    var access_to = [];
    if (access != null) {
      access_to = access.split(",");
    }
    this.Accesstoclient_settings = access_to.includes('client-settings');
  }
  async TriggerFilter(data) {
    this.selectedClientId = this.filteredClientId;
    await this.selectedClientEvent(data);
  }

}

