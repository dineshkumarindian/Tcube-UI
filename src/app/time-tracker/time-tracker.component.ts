import { SelectionModel } from '@angular/cdk/collections';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import moment from 'moment';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDatepickerInputEvent, } from '@angular/material/datepicker';
import { MatDialog } from '@angular/material/dialog';
import { MatSelect } from '@angular/material/select';
import { MatTableDataSource } from '@angular/material/table';
import { ReplaySubject, Subject, timer } from 'rxjs';
import { EditTimeTrackerComponent } from './edit-time-tracker/edit-time-tracker.component';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { filter, takeUntil } from 'rxjs/operators';
import { JsonpClientBackend } from '@angular/common/http';
import { TimeTrackerService } from '../services/time-tracker.service';
import { UtilService } from '../services/util.service';
import { ProjectsService } from '../services/projects.service';
import { JobsService } from '../services/jobs.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { TaskBulkDeleteComponent } from './task-bulk-delete/task-bulk-delete.component';
import { ExportService } from '../services/export.service';
import { SettingsService } from '../services/settings.service';
import { TimelogSubmitComponent } from './timelog-submit/timelog-submit.component';
import { DatePipe, Time } from '@angular/common';
import { Router } from '@angular/router';
// import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
import { errorMessage, noRecordMessage } from '../util/constants';
import { BulkDeleteDialogComponent } from '../util/bulk-delete-dialog/bulk-delete-dialog.component';
import { NotificationService } from '../services/notification.service';

interface Food {
  value: string;
  viewValue: string;
}

export interface data {

  emp_id: any;
  date_of_request: any;
  time_interval: string;
  is_active: boolean;
  id: number;
  task: string;
  job: string;
  project: string;
  bill: string;
  task_duration: string;
  approval_status: string;
  task_duration_ms: number;
}
export interface interval_data {
  id: number;
  start_time: any;
  end_time: any;
  duration: any;
  actions: any;
  // task_id: any;
}
export interface PeriodicElement {
  id: number;
  task: string;
  bill: string;
  project: string;
  job: string;
  task_duration: string;
  // is_active: any;
}

const ELEMENT_DATA: PeriodicElement[] = [
  { task: 'plan for the day', id: 1, project: 'COI-SILM', job: 'Others', bill: 'Non-Billable', task_duration: '00:04' },
  { task: 'To add the tooltip for the entity icons in the active  in the new site apps onboarding page', id: 2, project: 'COI-SILM', job: 'Design', bill: 'Billable', task_duration: '02:20' },
  { task: 'updates for the day', id: 3, project: 'COI-SILM', job: 'Others', bill: 'Non-Billable', task_duration: '00:04' }
];

@Component({
  selector: 'app-time-tracker',
  templateUrl: './time-tracker.component.html',
  styleUrls: ['./time-tracker.component.less']
})
export class TimeTrackerComponent implements OnInit {
  requiredMessage = errorMessage;
  noRecordMsg = noRecordMessage;
  isPause: boolean = true;
  dates: any;
  clockTimer: string = '00:00:00';
  tableTimer: string = '00:00';
  warning: string;
  deleted: boolean = true;
  drawer_deleted: boolean = true;
  pauseBtn = 'Pause';
  subscribe_create: any;
  subscribe_active: any;
  subscribe_resume: any;
  totalTime: number;
  min: number;
  sec: number;
  hrs: number;
  tabledata: any;
  isRunning = true;
  newtask: UntypedFormGroup;
  timer_button: boolean = true;
  timer_edit: boolean = true;
  edit_timer_id: any;
  dropdownSettings: IDropdownSettings = {};
  perioddropdownsetting: IDropdownSettings = {};
  active_timer_id: any;
  delete_id: any;
  drawer_delete_id: any;
  emp_id: any;
  Org_id: any;
  today_date: any;
  no_data: any[] = [];
  bulk_delete_data = [];
  show: boolean = true;
  client_id: any;
  emp_name: any;
  checkbox_disabled: boolean = false;
  ngmodel_task: any = "";
  reset_filter_btn: boolean = false;
  filter_valid: boolean = false;
  datepicker: UntypedFormControl;
  maxDate: Date;
  nextdisable: boolean = true;
  pre_date: any;
  isEditTimeInterval: boolean = false;
  /** list of project */
  public project: any[] = [];

  /** list of bill */
  public bill: any[] = [
    { name: 'Billable', id: 1 },
    { name: 'Non Billable', id: 2 }
  ];

  /** list of bill */
  public job: any[] = [];

  taskForm: UntypedFormGroup;
  filterform: UntypedFormGroup;
  resetform: UntypedFormGroup;
  start: UntypedFormGroup;
  end: UntypedFormGroup;
  submitted = false;
  arraydata: data[] = [];
  // arraydata2: data[] = [{ id: 0, task: 'plan for the day', project: 'COI_SILM', job: 'Others', bill: 'Non-Billable', task_duration: '00:04:10' }, { id: 1, task: 'Updates for the day', project: 'COI_SILM', job: 'Others', bill: 'Non-Billable', task_duration: '00:04:10' }];

  displayedColumns: string[] = ['select', 'task', 'project', 'bill', 'task_duration', 'actions'];
  dataSource = new MatTableDataSource<PeriodicElement>(ELEMENT_DATA);
  dataSource1 = new MatTableDataSource(this.arraydata);
  // dataSource2 = new MatTableDataSource(this.arraydata2);
  timerdata: interval_data[] = [];
  timer_editdata: interval_data[] = [];
  time_interval_displayedcolumns: string[] = ['start_time', 'end_time', 'duration', 'actions'];
  time_interval_datasource = new MatTableDataSource(this.timerdata);
  yearofmonth: any;

  selection = new SelectionModel<PeriodicElement>(true, []);
  isDropdown: any;
  loginurl: string;
  modifiedstring: string;
  loginstr: string;
  login_str: string;

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource1.data.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    if (this.isAllSelected()) {
      this.selection.clear();
      return;
    }
    this.selection.select(...this.dataSource1.data);
  }

  bulk_delete() {
    this.bulk_delete_data = [];
    for (var i = 0; i < this.selection.selected.length; i++) {
      this.bulk_delete_data.push(this.selection.selected[i].id)
    }
  }
  /** The label for the checkbox on the passed row */
  checkboxLabel(row?: PeriodicElement): string {
    if (!row) {
      return `${this.isAllSelected() ? 'deselect' : 'select'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1}`;
  }

  perioddropdownList = [];
  periodselectedItems = [];
  clientdropdownList = [];
  clientselectedItems = [];
  projectdropdownList = [];
  projectselectedItems = [];
  jobsdropdownList = [];
  jobsselectedItems = [];
  billdropdownList = [];
  billselectedItems = [];
  approvedropdownList = [];
  approveselectedItems = [];

  filteredBanks = [];
  orgEmpDetails: any;



  /** control for the MatSelect filter keyword */
  public projectFilterCtrl: UntypedFormControl = new UntypedFormControl();

  /** list of project filtered by search keyword */
  public filteredproject: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);


  /** control for the MatSelect filter keyword */
  public billFilterCtrl: UntypedFormControl = new UntypedFormControl();

  /** list of bill filtered by search keyword */
  public filteredbill: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);


  /** control for the MatSelect filter keyword */
  public jobFilterCtrl: UntypedFormControl = new UntypedFormControl();

  /** list of job filtered by search keyword */
  public filteredjob: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);

  @ViewChild('singleSelect', { static: true }) singleSelect: MatSelect;
  /** Subject that emits when the component has been destroyed. */
  protected _onDestroy = new Subject<void>();
  constructor(private formBuilder: UntypedFormBuilder,
    private formBuilder_srt: UntypedFormBuilder,
    private formBuilder_ed: UntypedFormBuilder,
    public dialog: MatDialog,
    public timeTrackerService: TimeTrackerService,
    public utilsService: UtilService,
    private projectsService: ProjectsService,
    private jobsService: JobsService,
    private spinner: NgxSpinnerService,
    private exportservice: ExportService,
    public datepipe: DatePipe,
    private router: Router,
    private settingsService: SettingsService,  private notificationService: NotificationService) {
    // for to get a current webpage url
    this.loginurl = window.location.href;
    this.modifiedstring = this.loginurl.slice(0, this.loginurl.length - 12);
    this.loginstr = "login";
    this.login_str = this.modifiedstring.concat(this.loginstr.toString());

  }
  checkdate: any;
  today_date_str: any;
  pre_date_str: any;
  export_data: any = [];
  exportAsXLSX(): void {
    this.export_data = [];
    for (var i = 0; i < this.arraydata.length; i++) {
      this.export_data.push({ "Employee_Id": this.arraydata[i].emp_id, "Date": this.arraydata[i].date_of_request, "Project": this.arraydata[i].project, "Job": this.arraydata[i].job, "Task": this.arraydata[i].task, "Duration": this.arraydata[i].task_duration, "Billing Status": this.arraydata[i].bill })
    }
    this.exportservice.exportAsExcelFile(this.export_data, this.emp_name + '_Timelog_data', "xlsx");
  }
  exportAsXLS() {
    this.export_data = [];
    for (var i = 0; i < this.arraydata.length; i++) {
      this.export_data.push({ "Employee_Id": this.arraydata[i].emp_id, "Date": this.arraydata[i].date_of_request, "Project": this.arraydata[i].project, "Job": this.arraydata[i].job, "Task": this.arraydata[i].task, "Duration": this.arraydata[i].task_duration, "Billing Status": this.arraydata[i].bill })
    }
    this.exportservice.exportAsExcelFile(this.export_data, this.emp_name + '_Timelog_data', "xls");
  }
  exportAsCSV() {
    this.export_data = [];
    for (var i = 0; i < this.arraydata.length; i++) {
      this.export_data.push({ "Employee_Id": this.arraydata[i].emp_id, "Date": this.arraydata[i].date_of_request, "Project": this.arraydata[i].project, "Job": this.arraydata[i].job, "Task": this.arraydata[i].task, "Duration": this.arraydata[i].task_duration, "Billing Status": this.arraydata[i].bill })
    }
    this.exportservice.exportAsExcelFile(this.export_data, this.emp_name + '_Timelog_data', "csv");
  }
  Space(event: any) {
    if (event.target.selectionStart === 0 && event.code === "Space") {
      event.preventDefault();
    }
  }
  ngOnInit() {
    sessionStorage.removeItem("TT-projectName");
    sessionStorage.removeItem("projectId");
    sessionStorage.removeItem("TT-jobName");
    this.toCheckProjectJobsAccessTo();
    this.isDropdown = true;
    this.spinner.show();
    this.maxDate = new Date();
    this.reset_filter_btn = false;
    this.filter_valid = false;
    this.emp_name = localStorage.getItem('Name');
    this.emp_id = localStorage.getItem('Id');
    this.Org_id = localStorage.getItem('OrgId');
    this.today_date = moment().format("YYYY-MM-DD");
    this.datepicker = new UntypedFormControl(new Date());
    this.today_date_str = this.today_date.toString();
    this.checkdate = moment().format("YYYY-MM-DD").toString();
    this.dates = new Date();
    this.bulk_delete_data = [];
    this.geEmployeeDetailsByOrgId();
    // this.getprojectbyorgid();
    // this.getjobdetailsbyorgid();
    this.getprojectjobdrodown();
    this.filterform = this.formBuilder.group({
      period: ['', Validators.required],
      from_date: [''],
      to_date: [''],
      client: ['', Validators.required],
      fltr_projects: ['', Validators.required],
      fltr_bill: ['', Validators.required],
      fltr_jobs: ['', Validators.required],
      status: ['', Validators.required],
    });
    this.getactivetask();
    this.getActiveClientDetailsByOrgId();
    this.filter_valid = true;
    setTimeout(() => {
      this.gettaskbyempiddate();
    }, 2500);
    setTimeout(() => {
      this.spinner.hide();
    }, 4000);
    window.addEventListener("visibilitychange", (evt) => this.getactivetask());
    this.tabledata = this.dataSource1;
    this.perioddropdownList = [
      { item_id: 1, item_text: 'Today' },
      { item_id: 2, item_text: 'Yesterday' },
      { item_id: 3, item_text: 'This Week' },
      { item_id: 4, item_text: 'Last Week' },
      { item_id: 5, item_text: 'This Month' },
      { item_id: 6, item_text: 'Last Month' },
      { item_id: 7, item_text: 'Custom' }
    ];
    this.periodselectedItems = [];
    this.clientselectedItems = [];
    this.projectselectedItems = []
    this.jobsselectedItems = [];
    this.billdropdownList = [
      { item_id: 1, item_text: 'Non Billable' },
      { item_id: 2, item_text: 'Billable' }
    ];
    this.billselectedItems = [];
    this.approvedropdownList = [
      { item_id: 1, item_text: 'Approved' },
      { item_id: 2, item_text: 'Not submitted' },
      { item_id: 3, item_text: 'Submitted' },
      { item_id: 4, item_text: 'Rejected' }
    ];
    this.approveselectedItems = [];
    this.dropdownSettings = {
      singleSelection: false,
      idField: 'item_id',
      textField: 'item_text',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      itemsShowLimit: 3,
      allowSearchFilter: true
    };
    this.perioddropdownsetting = {
      singleSelection: true,
      idField: 'item_id',
      textField: 'item_text',
      itemsShowLimit: 1,
      allowSearchFilter: true
    }
    this.taskForm = this.formBuilder.group({
      task: ['', Validators.required],
      project: ['', Validators.required],
      job: ['', Validators.required],
      bill: ['', Validators.required]
    });

    this.start = this.formBuilder_srt.group({
      srt_time: ['']
    })
    this.end = this.formBuilder_ed.group({
      ed_time: ['']
    })
    this.hrs = 0
    this.min = 0;
    this.sec = 1;
    this.hrs = this.hrs * 3600;
    this.min = this.min * 60;
    this.sec = this.sec % 60;
    this.totalTime = this.hrs + this.min + this.sec;

    // this.dates=this.dates.setDate(Date.now());

    // load the initial project list
    this.filteredproject.next(this.project.slice());

    // listen for search field value changes
    this.projectFilterCtrl.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        this.filterproject();
      });

    // load the initial bill list
    this.filteredbill.next(this.bill.slice());

    // listen for search field value changes
    this.billFilterCtrl.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        this.filterbill();
      });

    // load the initial bill list
    this.filteredjob.next(this.job.slice());

    // listen for search field value changes
    this.jobFilterCtrl.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        this.filterjob();
      });

  }
  // getclient(client, fltr_projects) {
  //   this.spinner.show();
  //   this.filterform = this.formBuilder.group({
  //     period: ['', Validators.required],
  //     from_date: [''],
  //     to_date: [''],
  //     client: ['', Validators.required],
  //     fltr_projects: ['', Validators.required],
  //     fltr_bill: ['', Validators.required],
  //     fltr_jobs: ['', Validators.required],
  //     status: ['', Validators.required],
  //   });
  //   this.spinner.hide();
  //   this.filterform.reset({ client: '' })
  // }

  protected filterproject() {
    if (!this.project) {
      return;
    }
    // get the search keyword
    let search = this.projectFilterCtrl.value;
    if (!search) {
      this.filteredproject.next(this.project.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
    // filter the client
    this.filteredproject.next(
      this.project.filter(project => project.name.toLowerCase().indexOf(search) > -1)
    );
  }

  protected filterbill() {
    if (!this.bill) {
      return;
    }
    // get the search keyword
    let search = this.billFilterCtrl.value;
    if (!search) {
      this.filteredbill.next(this.bill.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
    // filter the bill
    this.filteredbill.next(
      this.bill.filter(bill => bill.name.toLowerCase().indexOf(search) > -1)
    );
  }

  protected filterjob() {
    if (!this.job) {
      return;
    }
    // get the search keyword
    let search = this.jobFilterCtrl.value;
    if (!search) {
      this.filteredjob.next(this.job.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
    // filter the job
    this.filteredjob.next(
      this.job.filter(job => job.name.toLowerCase().indexOf(search) > -1)
    );
  }
  onItemSelect(item: any) {
  }

  custom_date: any;
  periodchange(eve) {
    document.getElementById('clickout').click();
    if (eve.length == 1) {
      if (eve[0].item_text === 'Custom') {
        this.custom_date = eve[0].item_text;
      }
      else {
        this.filterform.controls['from_date'].setValue("");
        this.filterform.controls['to_date'].setValue("");
        this.filterform.controls['from_date'].reset();
        this.filterform.controls['to_date'].reset();
        this.custom_date = eve[0].item_text;
      }
    }
    if (eve.length == 0) {
      this.filterform.controls['from_date'].setValue("");
      this.filterform.controls['to_date'].setValue("");
      this.filterform.controls['from_date'].reset();
      this.filterform.controls['to_date'].reset();
      this.custom_date = '';
    }
  }

  onSelectAll(items: any) {
    // console.log(items);
  }
  pauseBtnClicked(data) {
    if (this.isPause == true) {
      // this.setjobsbyprojectid(data.project);
      this.clockTimer = data.task_duration;
      this.updateresume(data.id, data.time_interval, data);
      setTimeout(() => {
        this.getactivetaskresume();
      }, 1000);
    } else {
      this.active_timer_id = null;
      this.timer_button = true;
      this.isPause = !this.isPause;
      this.isPause = true;
      this.taskForm.reset();
      this.taskForm.enable();
      this.timer_button = true;
    }
  }

  stopBtnClicked() {
    this.checkbox_disabled = !this.checkbox_disabled;
    this.updateendtime();
    if (this.activetimer_running) {
      this.subscribe_active.unsubscribe();
    }
    if (this.createtimer_running) {
      this.subscribe_create.unsubscribe();
    }
    if (this.resumetimer_running) {
      this.subscribe_resume.unsubscribe();
    }
    this.timer_button = true;
    // this.gettaskbyempiddate();
    this.clockTimer = '00:00:00';
    this.isPause = true;
    this.totalTime = this.min + this.sec;
    this.taskForm.enable();
    // this.taskForm.reset();
    this.taskForm.reset({ task: '', project: '', job: '', bill: '' });
    this.taskForm.markAsUntouched();
    this.active_timer_id = 0;
    let datestr = moment().format("YYYY-MM-DD").toString();
    if (this.today_date == datestr) {
      this.taskForm.enable();
    }
    else {
      this.nextdisable = false;
      this.taskForm.disable();
      // if (this.taskForm.value.job != '' || this.taskForm.value.task!=''|| this.taskForm.value.project!='') {
      //   setTimeout(() => {
      //     this.taskForm.controls['bill'].disable();
      //   }, 100);
      //   // this.taskForm.controls['task'].clearValidators();
      // }
      // setTimeout(() => {
      //   this.taskForm.controls['bill'].disable();
      //   }, 300);
    }
  }

  //timer for create tasks
  createtimer_running: boolean = false;
  timerClock() {
    this.createtimer_running = true;
    var origStr = this.clockTimer;
    var n = origStr.search(":");
    var hrPart = origStr.substring(0, n);
    var str = origStr.substring(n + 1, origStr.length);
    var n = str.search(":");
    var minPart = str.substring(0, 2);

    var str = str.substring(n + 1, str.length);
    var n = str.search(":");
    var secPart = str.substring(0, 2);
    var hrs = Number(hrPart) * 3600;
    var min = Number(minPart) * 60;
    var sec = Number(secPart) % 60;
    this.totalTime = hrs + min + sec;
    this.taskForm.disable();
    let minutes, seconds, hours, formatedMinutes, formatedSeconds, formatedHours;
    let nTime = this.totalTime;
    const source = timer(1, 1000);
    this.subscribe_create = source.subscribe((val) => {
      hours = Math.floor(this.totalTime / 3600) % 24;
      minutes = Math.floor(this.totalTime / 60) % 60;
      seconds = Math.floor((this.totalTime % 60));
      formatedHours = hours > 9 ? hours : '0' + hours;
      formatedMinutes = minutes > 9 ? minutes : '0' + minutes;
      formatedSeconds = seconds > 9 ? seconds : '0' + seconds;
      this.totalTime = nTime + val;

      this.clockTimer = `${formatedHours}:${formatedMinutes}:${formatedSeconds}`;
      this.tableTimer = `${formatedHours}:${formatedMinutes}`;
    });
    // if (this.timer_button) {
    //   this.timer_button = !this.timer_button;
    // this.isPause = !this.isPause;
    // }
    // else {
    //   this.timer_button = !this.timer_button;
    // this.isPause = !this.isPause;
    // }
  }

  //timer stat for the resume method
  resumetimer_running: boolean = false;
  timerclock_resume() {
    this.resumetimer_running = true;
    this.timer_button = true;
    var origStr = this.clockTimer;
    var n = origStr.search(":");
    var hrPart = origStr.substring(0, n);
    var str = origStr.substring(n + 1, origStr.length);
    var n = str.search(":");
    var minPart = str.substring(0, 2);

    var str = str.substring(n + 1, str.length);
    var n = str.search(":");
    var secPart = str.substring(0, 2);
    var hrs = Number(hrPart) * 3600;
    var min = Number(minPart) * 60;
    var sec = Number(secPart) % 60;
    this.totalTime = hrs + min + sec;
    this.taskForm.disable();
    let minutes, seconds, hours, formatedMinutes, formatedSeconds, formatedHours;
    let nTime = this.totalTime;
    const source = timer(1, 1000);
    this.subscribe_resume = source.subscribe((val) => {
      hours = Math.floor(this.totalTime / 3600) % 24;
      minutes = Math.floor(this.totalTime / 60) % 60;
      seconds = Math.floor((this.totalTime % 60));
      formatedHours = hours > 9 ? hours : '0' + hours;
      formatedMinutes = minutes > 9 ? minutes : '0' + minutes;
      formatedSeconds = seconds > 9 ? seconds : '0' + seconds;
      this.totalTime = nTime + val;

      this.clockTimer = `${formatedHours}:${formatedMinutes}:${formatedSeconds}`;
      this.tableTimer = `${formatedHours}:${formatedMinutes}`;
    });
    if (this.timer_button) {
      this.timer_button = !this.timer_button;
      // this.isPause = !this.isPause;
    }
    else {
      this.timer_button = !this.timer_button;
      // this.isPause = !this.isPause;
    }
  }

  //timer stat for the get active tasks method
  activetimer_running: boolean = false;
  timerclock_active() {
    this.timer_button = true;
    var origStr = this.clockTimer;
    var n = origStr.search(":");
    var hrPart = origStr.substring(0, n);
    var str = origStr.substring(n + 1, origStr.length);
    var n = str.search(":");
    var minPart = str.substring(0, 2);

    var str = str.substring(n + 1, str.length);
    var n = str.search(":");
    var secPart = str.substring(0, 2);
    var hrs = Number(hrPart) * 3600;
    var min = Number(minPart) * 60;
    var sec = Number(secPart) % 60;
    this.totalTime = hrs + min + sec;
    this.taskForm.disable();
    let minutes, seconds, hours, formatedMinutes, formatedSeconds, formatedHours;
    let nTime = this.totalTime;
    const source = timer(1, 1000);
    if (this.activetimer_running) {
      this.subscribe_active.unsubscribe();
      this.activetimer_running = false;
    }
    if (this.createtimer_running) {
      this.subscribe_create.unsubscribe();
      this.createtimer_running = false;
    }
    if (this.resumetimer_running) {
      this.subscribe_resume.unsubscribe();
      this.resumetimer_running = false;
    }
    if (!this.activetimer_running) {
      this.subscribe_active = source.subscribe((val) => {
        hours = Math.floor(this.totalTime / 3600) % 24;
        minutes = Math.floor(this.totalTime / 60) % 60;
        seconds = Math.floor((this.totalTime % 60));
        formatedHours = hours > 9 ? hours : '0' + hours;
        formatedMinutes = minutes > 9 ? minutes : '0' + minutes;
        formatedSeconds = seconds > 9 ? seconds : '0' + seconds;
        this.totalTime = nTime + val;

        this.clockTimer = `${formatedHours}:${formatedMinutes}:${formatedSeconds}`;
        this.tableTimer = `${formatedHours}:${formatedMinutes}`;
      });
      this.activetimer_running = true;
    }
    if (this.timer_button) {
      this.timer_button = !this.timer_button;
      // this.isPause = !this.isPause;
    }
    else {
      this.timer_button = !this.timer_button;
      // this.isPause = !this.isPause;
    }
  }
  //edit methood
  // { width: "50%", height: "80%" }
  quickTask: boolean;
  edittaskdetails(data) {
    this.quickTask = false;
    const dialogRef = this.dialog.open(EditTimeTrackerComponent,
      {
        width: '650px',
        panelClass: 'custom-viewdialogstyle',
        data: [data, this.project, this.jobdetails, this.quickTask]
      }
    );

    dialogRef.afterClosed().subscribe(result => {
      this.getalltaskdata();
    });
  }
  editQuickAddTask(data) {
    this.quickTask = true;
    let taskdata = true;
    const dialogRef = this.dialog.open(EditTimeTrackerComponent,
      {
        width: '650px',
        panelClass: 'custom-viewdialogstyle',
        data: [data, this.project, this.jobdetails, this.quickTask, taskdata, this.today_date]
      }
    );


    dialogRef.afterClosed().subscribe(result => {
      this.getalltaskdata();
    });

  }
  quickAddTask() {
    this.quickTask = true;
    let dataId = true;
    let taskdata = false;
    const dialogRef = this.dialog.open(EditTimeTrackerComponent,
      {
        width: '650px',
        panelClass: 'custom-viewdialogstyle',
        data: [dataId, this.project, this.jobdetails, this.quickTask, taskdata, this.today_date,
          { callback: this.callBack.bind(this) }]
      }
    );
    // dialogRef.beforeClosed().subscribe(result =>{
    //   // this.today_date = date;
    //   this.getalltaskdata();
    // })
    // dialogRef.beforeClosed().subscribe(result => { 
    //   this.getalltaskdata();
    // });
    // dialogRef.afterClosed().subscribe(result => { 
    //   this.getalltaskdata();
    // });
  }
  callBack(date) {
    // this.today_date = date;
    this.dates = new Date(date);
    this.today_date = moment(this.dates).format("YYYY-MM-DD");
    this.today_date_str = this.today_date.toString();
    // this.datepicker = new FormControl(this.dates);
    // this.today_date_str = this.today_date.toString();
    this.getalltaskdata();
    let datestr = moment().format("YYYY-MM-DD").toString();
    this.datepicker = new UntypedFormControl(this.dates);
    // if(!this.checkbox_disabled){
    //   this.taskForm.controls['task'].reset();
    //   this.taskForm.controls['task'].setValue("");
    // }
    if (this.today_date == datestr) {
      this.nextdisable = true;
    }
    else {
      this.nextdisable = false;
    }

  }
  //delete method
  delete(id) {
    this.delete_id = id;
    this.deleted = !this.deleted;
  }
  //drawer time interval delete
  drawer_delete(id) {
    this.drawer_delete_id = id;
    this.drawer_deleted = !this.drawer_deleted;
  }
  //edit timer function to setvalue to input
  edittimer(id, start, end) {
    this.time_interval_datasource.data = this.timerdata;
    this.timer_edit = !this.timer_edit;
    if (this.timer_edit == false) {
      this.edit_timer_id = id;
      for (var i = 0; i < this.timer_editdata.length; i++) {
        if (this.timer_editdata[i].id == id) {
          this.start.setValue({
            srt_time: this.timer_editdata[i].start_time,
          })
          this.end.setValue({
            ed_time: this.timer_editdata[i].end_time,
          })
        }

      }
    }
  }
  i = 0;
  j = 0;
  nextdate() {
    this.selection.clear();
    this.bulk_delete_data = [];
    // this.j = this.j + 1;
    // var date = new Date(); // Now
    // date.setDate(date.getDate() + this.j);
    // this.dates = date;
    // var  next_date= moment().add(this.j,'days').format("YYYY-MM-DD");
    // this.datepicker = new FormControl(moment().add(this.j,'days'));
    // this.today_date =next_date;

    this.dates = new Date(+this.dates + 1 * 86400000);
    // let datestr =this.datepipe.transform(this.dates, 'YYYY-MM-DD');
    this.today_date = moment(this.dates).format("YYYY-MM-DD");
    this.today_date_str = this.today_date.toString();
    this.pre_date = moment(this.dates).format("YYYY-MM-DD")
    this.pre_date_str = this.pre_date.toString();
    this.getalltaskdata();
    let datestr = moment().format("YYYY-MM-DD").toString();
    if (this.today_date == datestr) {
      this.nextdisable = true;
      this.taskForm.enable();
    }
    else {
      this.nextdisable = false;
      this.taskForm.disable();
      setTimeout(() => {
        this.taskForm.controls['bill'].disable();
        this.taskForm.reset();
      }, 100);
    }
    this.datepicker = new UntypedFormControl(this.dates);
    if (!this.checkbox_disabled) {
      this.taskForm.controls['task'].reset();
      this.taskForm.controls['task'].setValue("");
    }
  }
  previousdate() {
    this.selection.clear();
    this.bulk_delete_data = [];
    // this.j = this.j - 1;
    // this.dates = new Date(this.dates - (1 * 24 * 60 * 60 * 1000));
    // this.datepicker = new FormControl(this.dates);
    // var prevoius_date = moment().add(this.j,'days').format("YYYY-MM-DD");
    // this.today_date =prevoius_date;

    this.dates = new Date(+this.dates - 1 * 86400000);
    this.today_date = moment(this.dates).format("YYYY-MM-DD");
    this.today_date_str = this.today_date.toString();
    this.pre_date = moment(this.dates).format("YYYY-MM-DD")
    this.pre_date_str = this.pre_date.toString();
    this.getalltaskdata();
    if (!this.checkbox_disabled) {
      this.taskForm.controls['task'].reset();
      this.taskForm.controls['task'].setValue("");
    }
    let datestr = moment().format("YYYY-MM-DD").toString();
    if (this.today_date == datestr) {
      this.nextdisable = true;
      this.taskForm.enable();
    }
    else {
      this.nextdisable = false;
      this.taskForm.disable();
      setTimeout(() => {
        this.taskForm.controls['bill'].disable();
        // this.taskForm.reset();
      }, 100);
    }

    this.datepicker = new UntypedFormControl(this.dates);
    if (!this.checkbox_disabled) {
      this.taskForm.controls['task'].reset();
      this.taskForm.controls['task'].setValue("");
    }
  }
  //datepicker with get method intwgration
  public onDateChange(event: MatDatepickerInputEvent<Date>) {
    // this.i = 0;
    // this.j = 0;
    this.dates = new Date(event.value);
    this.datepicker = new UntypedFormControl(this.dates);
    this.today_date = moment(event.value).format("YYYY-MM-DD");
    this.today_date_str = this.today_date.toString();
    this.pre_date = moment(this.dates).format("YYYY-MM-DD")
    this.pre_date_str = this.pre_date.toString();
    this.getalltaskdata();
    if (!this.checkbox_disabled) {
      this.taskForm.controls['task'].reset();
      this.taskForm.controls['task'].setValue("");
    }
    let datestr = moment().format("YYYY-MM-DD").toString();
    if (this.today_date == datestr) {
      this.nextdisable = true;
      this.taskForm.enable();
    }
    else {
      this.nextdisable = false;
      this.taskForm.disable();
      setTimeout(() => {
        this.taskForm.controls['bill'].disable();
        this.taskForm.reset();
      }, 100);
    }
  }
  ///***************Integration ******************///
  getalltaskdata() {
    this.spinner.show();
    this.reset_filter_btn = false;
    this.arraydata = [];
    let formdata = {
      "emp_id": this.emp_id,
      "date_of_request": this.today_date
    }
    this.timeTrackerService.getbyempidanddate(formdata).subscribe(data => {
      // this.no_data = [];
      var total_time = data.map.total_time;
      this.millisToMinutesAndSeconds(total_time);
      this.total_task_duration = this.task_time;
      if (data.map.statusMessage == "Success") {
        var data1 = JSON.parse(data.map.details);
        this.displayedColumns = ['select', 'task', 'project', 'bill', 'task_duration', 'actions'];
        if (data1.length > 0) {
          for (var i = 0; i < data1.length; i++) {
            this.arraydata.push(data1[i]);
          }
          this.no_data = this.arraydata;
          this.dataSource1.data = this.arraydata;
          this.checkTaskStatus();
          for (var i = 0; i < this.dataSource1.data.length; i++) {
            if (this.dataSource1.data[i].is_active == true) {
              this.taskForm.setValue({
                task: this.dataSource1.data[i].task,
                project: this.dataSource1.data[i].project,
                job: this.dataSource1.data[i].job,
                bill: this.dataSource1.data[i].bill
              })
              this.taskForm.disable();
              this.active_timer_id = this.dataSource1.data[i].id;
              this.task_id = this.dataSource1.data[i].id;
              let activetask_ti = this.dataSource1.data[i].time_interval;
              let time1 = JSON.parse(activetask_ti);
              this.activetask_time = time1;
            }
          }
        }
      }
      else if (data.map.statusMessage == "Failed") {
        this.displayedColumns = ['select', 'task', 'project', 'bill', 'task_duration', 'actions'];
        this.total_task_duration = '00:00:00'
        this.dataSource1.data = [];
        this.no_data = [];
        this.checkTaskStatus();
      }
      else {
        this.dataSource1.data = [];
        this.total_task_duration = '00:00:00';
      }
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
    })
    setTimeout(() => {
      this.spinner.hide();
    }, 2000);
  }
  time_interval = [];
  //post method START
  createtask() {
    this.checkbox_disabled = !this.checkbox_disabled;
    this.spinner.show();
    this.taskForm.controls['bill'].enable();
    this.timer_button = false;
    var current_time: any = new Date().getTime();
    this.time_interval = [{ "start_time": current_time, "end_time": current_time }];
    let formdata = {
      "org_id": this.Org_id,
      "emp_id": this.emp_id,
      "client_id": this.client_id,
      "task": this.taskForm.value.task,
      "project": this.taskForm.value.project,
      "job": this.taskForm.value.job,
      "bill": this.taskForm.value.bill,
      "time_interval": (JSON.stringify(this.time_interval)),
      "task_duration": '00:00:00',
      "task_duration_ms": 0,
      "date_of_request": this.today_date,
      "login_str": this.login_str
    }
    this.timeTrackerService.createTaskDetails(formdata).subscribe(data => {
      if (data.map.statusMessage == "Success" && data.map.Error == "Error in sending mail while creating timesheet due to mail configuration check the configuration details") {
        this.getalltaskdata();
        this.utilsService.openSnackBarAC("Task added successfully", "OK");
        this.notificationWithEmailMsg();
        setTimeout(() => {
          this.timerClock();
        }, 500);

      } else if (data.map.statusMessage == "Success") {
        this.getalltaskdata();
        this.utilsService.openSnackBarAC("Task added successfully", "OK");
        setTimeout(() => {
          this.timerClock();
        }, 500);

      }
      else {
        this.utilsService.openSnackBarMC("Failed to add task", "OK");
      }
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
    })

    setTimeout(() => {
      this.spinner.hide();
    }, 3000);

  }
  // post method END
  async notificationWithEmailMsg() {
    this.spinner.show();
    let notify_id;
    let zone = moment.tz.guess();
    let message =
    "Mail configuration issue encountered during  "+this.emp_id +"  timesheet submission.";
    let formdata = {
      "org_id": this.Org_id,
      "message": message,
      "to_notify_id":  this.orgEmpDetails,
      "notifier": this.emp_id,
      "keyword": "mail-issue",
      "timezone": zone,
    };
    await this.notificationService
      .postNotification(formdata)
      .subscribe((data) => {
        if (data.map.statusMessage == "Success") {
          this.spinner.hide();
        } else {
          this.spinner.hide();
        }
      });
  }
  //get active task details START
  task_id: any;// for to use in update end time
  activetask_time: any;
  getactivetaskresume() {
    this.timeTrackerService.getTaskDetailsByActive(this.emp_id).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        this.task_id = JSON.parse(data.map.data).id;
        var time1 = JSON.parse(JSON.parse(data.map.data).time_interval);
        this.activetask_time = time1;
      }
      else {
      }
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
    })
  }
  getactivetask() {
    this.timeTrackerService.getTaskDetailsByActive(this.emp_id).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        this.task_id = JSON.parse(data.map.data).id;
        var time1 = JSON.parse(JSON.parse(data.map.data).time_interval);
        let data1 = JSON.parse(data.map.data);
        this.activetask_time = time1;
        if (this.task_id == data1.id) {
          this.checkbox_disabled = true;
          this.taskForm.setValue({
            task: data1.task,
            project: data1.project,
            job: data1.job,
            bill: data1.bill
          })
          var previous_time = JSON.parse(data.map.data).task_duration;
          this.timetomillsecond(previous_time);
          var current_time: any = new Date().getTime();
          var task_duration_active = (current_time - this.activetask_time[0].start_time) + this.total_previous_time;
          this.millisToMinutesAndSeconds(task_duration_active);
          this.clockTimer = this.task_time;
          this.totalTime = task_duration_active;
          this.timerclock_active();
          this.timer_button = false;
          this.isPause = false;
          this.active_timer_id = data1.id;
        }
        this.taskForm.disable();
      }
      else {
      }
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
    })
  }
  //get active task details END

  //update method to update end time START
  updateendtime() {
    this.spinner.show();
    var task_duration = 0;
    var time = 0;
    var task_duration_ms = 0;
    var current_time: any = new Date().getTime();
    var update_endtime: any;
    this.time_interval = [];
    for (var i = 0; i < this.activetask_time.length; i++) {
      if (i == 0) {
        update_endtime = [{ "start_time": this.activetask_time[0].start_time, "end_time": current_time }];
        this.time_interval.push(update_endtime[0]);
      }
      else if (i != 0) {
        this.time_interval.push(this.activetask_time[i]);
      }
      time = this.time_interval[i].end_time - this.time_interval[i].start_time;
      task_duration = task_duration + time;
    }
    task_duration_ms = task_duration;
    this.millisToMinutesAndSeconds(task_duration);
    task_duration = this.task_time
    let formdata = {
      "id": this.task_id,
      "time_interval": (JSON.stringify(this.time_interval)),
      "task_duration": task_duration,
      "task_duration_ms": task_duration_ms,
      "login_str": this.login_str
    }
    this.timeTrackerService.updatEndTime(formdata).subscribe(data => {
      if (data.map.statusMessage == "Success" && data.map.Error == "Error in updating the hours due to mail configuration check the configuration details") {
        this.utilsService.openSnackBarAC("Timer stopped successfully", "OK"); 
        this.notificationWithEmailMsg();
        if (this.activetimer_running) {
          this.subscribe_active.unsubscribe();
        }
        if (this.createtimer_running) {
          this.subscribe_create.unsubscribe();
        }
        if (this.resumetimer_running) {
          this.subscribe_resume.unsubscribe();
        }
        this.project = [];
        this.projectdropdownList = [];
        this.job = [];
        this.jobdetails = [];
        this.getprojectjobdrodown();
        this.spinner.hide();
      }
      else if (data.map.statusMessage == "Success") {
        this.utilsService.openSnackBarAC("Timer stopped successfully", "OK");
        if (this.activetimer_running) {
          this.subscribe_active.unsubscribe();
        }
        if (this.createtimer_running) {
          this.subscribe_create.unsubscribe();
        }
        if (this.resumetimer_running) {
          this.subscribe_resume.unsubscribe();
        }
        this.project = [];
        this.projectdropdownList = [];
        this.job = [];
        this.jobdetails = [];
        this.getprojectjobdrodown();
        this.spinner.hide();
      }
      else {
        this.utilsService.openSnackBarMC("Failed to update end time ", "OK");
        this.spinner.hide();
      }
      this.getalltaskdata();
      this.spinner.hide();
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
    })
    this.taskForm.controls['task'].reset();
    this.taskForm.controls['task'].setValue("");
  }
  // async notificationWithEmailMsg() {
  //   this.spinner.show();
  //   let notify_id;
  //   let zone = moment.tz.guess();
  //   let message =
  //     "Facing some issue in mail configuration, please check it";
  //   let formdata = {
  //     org_id: localStorage.getItem("OrgId"),
  //     message: message,
  //     to_notify_id:  localStorage.getItem("OrgId"),
  //     notifier:  this.orgAdminId,
  //     keyword: "mail-issue",
  //     timezone: zone,
  //   };
  //   await this.notificationService
  //     .postNotification(formdata)
  //     .subscribe((data) => {
  //       if (data.map.statusMessage == "Success") {
  //         this.spinner.hide();
  //       } else {
  //         this.spinner.hide();
  //       }
  //     });
  // }
  //update method to update end time END

  //get method by emp_id and date START
  total_task_duration: any;
  gettaskbyempiddate() {
    let resubmitteddate = sessionStorage.getItem("resubmitted-date");
    if (resubmitteddate) {
      this.today_date = resubmitteddate;
      this.dates = new Date(resubmitteddate);
      sessionStorage.removeItem("resubmitted-date");
    }
    let formdata = {
      "emp_id": this.emp_id,
      "date_of_request": this.today_date
    }
    this.timeTrackerService.getbyempidanddate(formdata).subscribe(data => {
      this.arraydata = [];
      var total_time = data.map.total_time;
      this.millisToMinutesAndSeconds(total_time);
      this.total_task_duration = this.task_time;
      if (data.map.statusMessage == "Success") {
        var data1 = JSON.parse(data.map.details);
        if (data1.length > 0) {
          for (var i = 0; i < data1.length; i++) {
            this.arraydata.push(data1[i]);
          }
          this.dataSource1.data = this.arraydata;
          this.no_data = this.arraydata;
          this.checkTaskStatus();
        }
        else {
          this.total_task_duration = '00:00:00'
          this.dataSource1.data = [];
          this.no_data = [];
          this.checkTaskStatus();
        }
      }
      else {
        this.dataSource1.data = [];
        this.total_task_duration = '00:00:00';
        this.no_data = [];
      }

    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
    })
  }
  //get method by emp_id and date END

  //Delete by id START
  deletetask(id) {
    this.spinner.show();
    this.timeTrackerService.deleteById(id).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        this.utilsService.openSnackBarAC("Task deleted successfully ", "OK");
        this.delete_id = id;
        this.deleted = !this.deleted;
        this.getalltaskdata();
      }
      else {
        this.utilsService.openSnackBarMC("Failed to delete tasks", "OK");
      }
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
    })
    setTimeout(() => {
      this.spinner.hide();
    }, 2000);

  }
  //Delete by id END

  //Update the new time interval for resume scenario START
  updateresume(id, interval, rowdata) {
    this.spinner.show();
    let setdata = rowdata;
    var current_time: any = new Date().getTime();
    var new_time = [{ "start_time": current_time, "end_time": current_time }];
    var old_time = JSON.parse(interval);
    for (var i = 0; i < old_time.length; i++) {
      new_time.push(old_time[i]);
    }
    let formdata = {
      "id": id,
      "time_interval": JSON.stringify(new_time),
      "login_str": this.login_str
    }
    this.timeTrackerService.updateNewTime(formdata).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        this.timer_button = false;
        this.isPause = false;
        this.setjobsbyprojectid(setdata.project);
        this.taskForm.reset();
        this.taskForm.setValue({
          task: setdata.task,
          project: setdata.project,
          job: setdata.job,
          bill: setdata.bill
        })
        this.taskForm.disable();
        this.checkbox_disabled = !this.checkbox_disabled;
        this.active_timer_id = setdata.id;
        this.timerclock_resume();
        this.utilsService.openSnackBarAC("Task resumed successfully", "OK");
      }
      else {
        this.utilsService.openSnackBarMC("Failed to resume task ", "OK");
      }
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
    })
    setTimeout(() => {
      this.spinner.hide();
    }, 3000);
  }
  //Update the new time interval for resume scenario END
  task_time: any;
  millisToMinutesAndSeconds(ms) {
    //  this.task_time = '00:00:00';
    var seconds: any = Math.floor((ms / 1000) % 60);
    var minutes: any = Math.floor((ms / (1000 * 60)) % 60);
    var hours: any = Math.floor((ms / (1000 * 60 * 60)) % 24);
    var days: any = Math.floor((ms / (1000 * 60 * 60 * 24)));
    if (days > 0) {
      hours = (days * 24) + hours;
    }
    hours = (hours < 10) ? "0" + hours : hours;
    minutes = (minutes < 10) ? "0" + minutes : minutes;
    seconds = (seconds < 10) ? "0" + seconds : seconds;
    this.task_time = hours + ":" + minutes + ":" + seconds;
  }
  total_previous_time: any;
  timetomillsecond(time) {
    var origStr = time;
    var n = origStr.search(":");
    var hrPart = origStr.substring(0, n);
    var str = origStr.substring(n + 1, origStr.length);
    var n = str.search(":");
    var minPart = str.substring(0, 2);

    var str = str.substring(n + 1, str.length);
    var n = str.search(":");
    var secPart = str.substring(0, 2);
    var hrs = Number(hrPart) * 3600;
    var min = Number(minPart) * 60;
    var sec = Number(secPart) % 60;
    this.total_previous_time = (hrs + min + sec) * 1000;
  }

  //to show the time _intervals and duration for the particular tasks in the drawer
  total_task_time: any;
  time_interval_data = [];
  task_time_intervals(id, interval) {
    this.timer_edit = true;
    this.timerdata = [];
    let converted_timerdata = [];
    let converted_editdata = [];
    this.task_id = id;
    if (interval != null) {
      var data1 = JSON.parse(interval);
      var interval_diff;
      var time = 0;
      this.total_task_time = 0;
      for (var i = 0; i < data1.length; i++) {
        interval_diff = data1[i].end_time - data1[i].start_time;
        this.millisToMinutesAndSeconds(interval_diff)
        converted_editdata = [{ "id": i + 1, "start_time": moment(data1[i].start_time).format('HH:mm'), "end_time": moment(data1[i].end_time).format('HH:mm'), "duration": this.task_time }];
        converted_timerdata = [{ "id": i + 1, "start_time": moment(data1[i].start_time).format('hh:mm:ss A'), "end_time": moment(data1[i].end_time).format('hh:mm:ss A'), "duration": this.task_time}];
        // converted_editdata = [{ "id": i + 1, "start_time": moment(data1[i].start_time).format('HH:mm'), "end_time": moment(data1[i].end_time).format('HH:mm'), "duration": this.task_time,"task_id":this.task_id }];
        // converted_timerdata = [{ "id": i + 1, "start_time": moment(data1[i].start_time).format('hh:mm:ss A'), "end_time": moment(data1[i].end_time).format('hh:mm:ss A'), "duration": this.task_time,"task_id":this.task_id }];
        this.timerdata.push(converted_timerdata[0]);
        this.timer_editdata.push(converted_editdata[0]);
        this.total_task_time = data1[i].end_time - data1[i].start_time;
        time = time + this.total_task_time;
      }
      this.millisToMinutesAndSeconds(time);
      this.total_task_time = this.task_time
      this.time_interval_datasource.data = this.timerdata;
    }
  }
  //drawer_confirm_delete
  drawer_confirm_delete(id) {
    this.isEditTimeInterval = false;
    this.spinner.show();
    for (var i = 0; i < this.timerdata.length; i++) {
      if (this.timerdata[i].id == id) {
        this.timerdata.splice(i, 1);
      }
    }
    this.drawer_conversion(this.timerdata,this.isEditTimeInterval);
    setTimeout(() => {
      this.spinner.hide();
    }, 1000);
  }

  //to convert the hh:mm to milliseconds for the drawer edit and delete method
  drawer_conversion(data,isEditTimeInterval) {
    this.time_interval_data = [];
    for (var i = 0; i < data.length; i++) {
      var start_time = moment().format("YYYY-MM-DD") + " " + data[i].start_time;
      var end_time = moment().format("YYYY-MM-DD") + " " + data[i].end_time;
      this.time_interval_data.push({ "start_time": new Date(start_time).getTime(), "end_time": new Date(end_time).getTime() })
    }
    this.updatetimeintervaldata(isEditTimeInterval);
  }

  //drawer table edit method
  edittimeintervals(id) {
    this.spinner.show();
    this.isEditTimeInterval = true;
    for (var i = 0; i < this.timerdata.length; i++) {
      // if (this.timerdata[i].task_id == id) {
        if (this.timerdata[i].id == id) {
        this.timerdata[i].start_time = this.start.value.srt_time;
        this.timerdata[i].end_time = this.end.value.ed_time;
      }
    }
    this.drawer_conversion(this.timerdata,this.isEditTimeInterval);
    setTimeout(() => {
      this.spinner.hide();
    }, 1000);
  }
  //update method to update time intervals START
  updatetimeintervaldata(isEditTimeInterval) {
    if (this.drawer_deleted == false) {
      this.drawer_delete(this.task_id);
    }
    if (this.timer_edit == false) {
      this.edittimer(1, 1, 1);
    }
    var task_duration = 0;
    var time = 0;
    var task_duration_ms = 0;
    this.time_interval = [];
    for (var i = 0; i < this.time_interval_data.length; i++) {
      this.time_interval.push(this.time_interval_data[i]);
      time = this.time_interval[i].end_time - this.time_interval[i].start_time;
      task_duration = task_duration + time;
    }
    task_duration_ms = task_duration;
    this.millisToMinutesAndSeconds(task_duration);
    task_duration = this.task_time
    let formdata = {
      "id": this.task_id,
      "time_interval": (JSON.stringify(this.time_interval)),
      "task_duration": task_duration,
      "task_duration_ms": task_duration_ms,
      "login_str": this.login_str
    }
    this.timeTrackerService.updatEndTime(formdata).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        if (this.drawer_deleted == false && isEditTimeInterval) {
          this.utilsService.openSnackBarAC("Time interval deleted successfully ", "OK");
        }
        else if(this.drawer_deleted == true && isEditTimeInterval){
          this.utilsService.openSnackBarAC("Time interval updated successfully ", "OK");
        } else{
          this.utilsService.openSnackBarAC("Time interval deleted successfully ", "OK");
        }
        this.job = [];
        this.jobdetails = [];
        this.getprojectjobdrodown();
      }
      else {
        if (this.drawer_deleted == false) {
          this.utilsService.openSnackBarMC("Failed to delete time interval ", "OK");
        }
        else {
          this.utilsService.openSnackBarMC("Failed to update time interval", "OK");
        }
      }
      this.getalltaskdata();
      this.task_time_intervals(this.task_id, JSON.stringify(this.time_interval_data));
      // if(this.drawer_deleted == false){
      //   this.drawer_delete(this.task_id);
      // }
      // if(this.timer_edit == false){
      //   this.edittimer(1,1,1);
      // }
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
    })
  }

  //get all projects based on the orgid and 
  //set the value if it is assigned to the logged user
  filter_project_dd: any = [];
  getprojectbyorgid() {
    this.project = [];
    this.projectdropdownList = [];
    this.projectsService.getActiveProjectDetailsByOrgId(this.Org_id).subscribe(data => {
      let response: any[] = JSON.parse(data.map.data);
      for (var i = 0; i < response.length; i++) {
        for (var j = 0; j < response[i].resourceDetails.length; j++) {
          if (response[i].resourceDetails[j].employeeDetails.id == this.emp_id) {
            this.project.push({ "name": response[i].project_name, "id": response[i].id, "client_id": response[i].clientDetails.id })
          }
        }
      }
      this.project = this.project.reduce((accumalator, current) => {
        if (
          !accumalator.some(
            (item) => item.id === current.id && item.name === current.name
          )
        ) {
          accumalator.push(current);
        }
        return accumalator;
      }, []);
      let filter_project = []
      for (var i = 0; i < this.project.length; i++) {
        filter_project.push({ "item_id": this.project[i].id, "item_text": this.project[i].name });
      }
      this.projectdropdownList = filter_project;
      this.filter_project_dd = filter_project;
      this.filterproject();
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
    })
  }

  //get all job details based on the org id
  jobdetails: any = [];
  filter_job_dd: any[] = [];
  jobs_loading: boolean = false;
  getjobdetailsbyorgid() {
    this.job = [];
    this.jobdetails = [];
    this.jobsdropdownList = [];
    var filter_job = [];
    this.jobsService.getActiveJobDetailsByOrgIdnew(this.Org_id).subscribe(data => {
      let response: any[] = JSON.parse(data.map.data);
      for (var i = 0; i < response.length; i++) {
        for (var j = 0; j < response[i].jobAssigneeDetails.length; j++) {
          if (response[i].jobAssigneeDetails[j].map.id === this.emp_id) {
            this.jobdetails.push({ "name": response[i].job_name, "id": response[i].id, "bill": response[i].bill, "project_id": response[i].project_id });
            this.job.push({ "id": response[i].id, "name": response[i].job_name });
            filter_job.push({ "item_id": response[i].id, "item_text": response[i].job_name });
          }
        }
      }
      this.jobs_loading = false;
      if (this.taskForm.value.project != "") {
        this.setjobsbyprojectid(this.taskForm.value.project);
      }
      filter_job = filter_job.reduce((accumalator, current) => {
        if (
          !accumalator.some(
            (item) => item.item_text === current.item_text
          )
        ) {
          accumalator.push(current);
        }
        return accumalator;
      }, []);
      this.jobsdropdownList = filter_job;
      this.filter_job_dd = filter_job;
      this.filterjob();
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
    })

  }
  //set touched to task field if we directly click the projects without type tasks
  settouchedtask() {
    if (this.taskForm.value.task == "") {
      this.taskForm.controls['task'].markAsTouched();
      // this.taskForm.controls['task'].markAsDirty();
    }
  }

  settouchedcli() {
    if (this.filterform.value.client == "") {
      this.filterform.controls['client'].markAsTouched();
      // this.filterform.controls['client'].markAsUntouched();
    }
  }

  settouchedprj() {
    if (this.filterform.value.fltr_projects == "") {
      this.filterform.controls['client'].markAsTouched();
      this.filterform.controls['fltr_projects'].markAsTouched();
    }
  }

  //set touched to task and project field if we directly click the jobs without click project and task
  settouchedproject() {
    let datestr = moment().format("YYYY-MM-DD").toString();
    if (this.taskForm.value.project == "" && this.today_date == datestr) {
      this.taskForm.controls['task'].markAsTouched();
      this.taskForm.controls['project'].markAsTouched();
      // this.taskForm.controls['project'].markAsDirty();
    }
  }

  //set touched to task, project and job field if we directly click the bill without click jobs,project and task
  settouchedjob() {
    let datestr = moment().format("YYYY-MM-DD").toString();
    if (this.taskForm.value.job == "" && this.today_date == datestr) {
      this.taskForm.controls['task'].markAsTouched();
      this.taskForm.controls['project'].markAsTouched();
      this.taskForm.controls['job'].markAsTouched();
      // this.taskForm.controls['job'].markAsDirty();
    }
  }
  selected_project_id: any;
  //set job by project id
  setjobsbyprojectid(val) {
    let proj_id;
    for (var i = 0; i < this.project.length; i++) {
      if (val == this.project[i].name) {
        proj_id = this.project[i].id;
        this.selected_project_id = this.project[i].id;
        this.client_id = this.project[i].client_id;
      }
    }
    if (!this.jobs_loading && !this.timer_button) {
    }
    else {
      this.taskForm.controls['job'].setValue("");
      this.taskForm.controls['job'].markAsUntouched();
      this.taskForm.controls['bill'].setValue("");
      this.taskForm.controls['bill'].enable();
    }
    this.job = [];
    for (var i = 0; i < this.jobdetails.length; i++) {
      if (proj_id == this.jobdetails[i].project_id) {
        this.job.push({ "name": this.jobdetails[i].name, "id": this.jobdetails[i].id, "mail_sended": this.jobdetails[i].mail_sended })
      }
    }
    this.job = this.sortObjectOfStrings(this.job);
    this.filterjob();
  }

  //set bill by job id
  setbillbyjobid(name) {
    let job_id;
    for (var i = 0; i < this.jobdetails.length; i++) {
      if (name == this.jobdetails[i].name && this.selected_project_id == this.jobdetails[i].project_id) {
        job_id = this.jobdetails[i].id;
      }
    }
    for (var i = 0; i < this.jobdetails.length; i++) {
      if (job_id == this.jobdetails[i].id) {
        if (this.jobdetails[i].bill != '' || undefined) {
          this.taskForm.controls['bill'].disable();
          this.taskForm.controls['bill'].setValue(this.jobdetails[i].bill);
        }
        else {
          this.taskForm.controls['bill'].enable();
          this.taskForm.controls['bill'].setValue(this.jobdetails[i].bill);
        }
      }
    }
  }

  resetprojobbill(event: any) {
    if (event != null) {
      if (event.length == 0) {
        this.taskForm.controls['project'].reset();
        this.taskForm.controls['project'].setValue("");
        this.taskForm.controls['job'].reset();
        this.taskForm.controls['job'].setValue("");
        this.taskForm.controls['bill'].reset();
        this.taskForm.controls['bill'].setValue("");
        this.taskForm.controls['bill'].enable();
      }
    }
  }
  //get clientdetails by org id
  getActiveClientDetailsByOrgId() {
    let filter_client = [];
    this.clientdropdownList = [];
    let OrgId = localStorage.getItem("OrgId");
    this.settingsService.getActiveClientDetailsByOrgId(OrgId).subscribe(data => {
      let response: any[] = JSON.parse(data.map.data);
      for (var i = 0; i < response.length; i++) {
        filter_client.push({ "item_text": response[i].client_name, "item_id": response[i].id });
      }
      this.clientdropdownList = filter_client;
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
    })
  }

  //set project based on the client details for the filter
  setprojectbydetaiils(data) {
    let client_ids = [];
    this.filter_valid = false;
    this.projectselectedItems = [];
    this.projectdropdownList = [];
    for (var i = 0; i < this.clientselectedItems.length; i++) {
      client_ids.push(this.clientselectedItems[i].item_id);
    }
    for (var i = 0; i < this.project.length; i++) {
      for (var j = 0; j < client_ids.length; j++) {
        if (this.project[i].client_id == client_ids[j]) {
          this.projectdropdownList.push({ "item_id": this.project[i].id, "item_text": this.project[i].name })
        }
      }
    }
  }

  //set jobdetails based on selected projects in the filter
  setjobbyprojectdetaiils($event) {
    let project_ids = [];
    let filter_job = [];
    this.jobsselectedItems = [];
    this.jobsdropdownList = [];
    for (var i = 0; i < this.projectselectedItems.length; i++) {
      project_ids.push(this.projectselectedItems[i].item_id);
    }
    for (var i = 0; i < this.jobdetails.length; i++) {
      for (var j = 0; j < project_ids.length; j++) {
        if (this.jobdetails[i].project_id == project_ids[j]) {
          filter_job.push({ "item_text": this.jobdetails[i].name, "item_id": this.jobdetails[i].id });
        }
      }
    }
    filter_job = filter_job.reduce((accumalator, current) => {
      if (
        !accumalator.some(
          (item) => item.item_text === current.item_text
        )
      ) {
        accumalator.push(current);
      }
      return accumalator;
    }, []);
    this.jobsdropdownList = filter_job;
  }
  //bulk delete for task
  bulk_delete_dialog() {
    const dialogRef = this.dialog.open(BulkDeleteDialogComponent, {
      width: '30%',
      panelClass: 'custom-viewdialogstyle',
      data: { key: "bulk-delete-time-tracker", showComment: false }
      // data: { name: this.bulk_delete_data },
    });
    dialogRef.afterClosed().subscribe(response => {
      if (response != undefined && response != "") {
        if (response.data == true) {
          this.deleteDetails(this.bulk_delete_data);
        }
      }
      this.selection.clear();
      this.bulk_delete_data = [];
      // this.ngOnInit();
      // this.getalltaskdata();

    });
  }
  deleteDetails(data: any) {
    this.spinner.show();
    let listdata = {
      "deleteIds": data
    }

    this.timeTrackerService.bulkDelete(listdata).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        this.utilsService.openSnackBarAC("Tasks deleted successfully", "OK");
        this.selection.clear();
        this.bulk_delete_data = [];
        // this.ngOnInit();
        this.getalltaskdata();
        //  this.dialogRef.close();
      }
      else {
        this.utilsService.openSnackBarMC("Failed to delete task details", "OK");
      }
      this.spinner.hide();
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
      //  this.dialogRef.close();
    })
  }

  sbmt_timelog_btn: boolean = true;
  checkbox_select_all: boolean = false;
  checkTaskStatus() {
    let cnt_ns: number = 0;
    let cnt_s: number = 0;
    for (var i = 0; i < this.arraydata.length; i++) {
      if (this.arraydata[i].approval_status === "Not submitted" || this.arraydata[i].approval_status === "Updated") {
        this.sbmt_timelog_btn = false;
        this.checkbox_select_all = true;
        cnt_ns += 1;
      }
      else if (this.arraydata[i].approval_status != "Not submitted" || this.arraydata[i].approval_status != "Updated") {
        cnt_s += 1;
      }
      else {
        this.sbmt_timelog_btn = true;
        this.checkbox_select_all = false;
      }
      if (cnt_ns == this.arraydata.length) {
        this.checkbox_select_all = false;
      }
      if (cnt_s == this.arraydata.length) {
        this.sbmt_timelog_btn = true;
        this.checkbox_select_all = true;
      }
    }
    if (this.arraydata.length == 0) {
      this.checkbox_select_all = true;
      this.sbmt_timelog_btn = true;
    }
  }
  //timelog submit btn to call dialog to choose approver
  billableTime: any;
  nonBillableTime: any;
  totalTimeMs: any;
  timelog_submit_dialog() {
    let ids = [];
    this.billableTime = 0;
    this.nonBillableTime = 0;
    this.totalTimeMs = 0;
    let totalTimeStr;
    if (this.arraydata.length > 0) {
      //reduce if you have any duplicates
      this.arraydata = this.arraydata.reduce((accumalator, current) => {
        if (
          !accumalator.some(
            (item) => item.id == current.id
          )
        ) {
          accumalator.push(current);
        }
        return accumalator;
      }, []);

      //for loop
      this.arraydata.forEach(data => {
        if (data.approval_status === "Not submitted" || data.approval_status === "Updated") {
          ids.push(data.id);
          this.totalTimeMs += data.task_duration_ms;
          if (data.bill == "Billable") {
            this.billableTime += data.task_duration_ms;
          } else if (data.bill == "Non Billable") {
            this.nonBillableTime += data.task_duration_ms;
          }
        }
      });

      this.millisToMinutesAndSeconds(this.billableTime);
      let billableTime_str = this.task_time
      this.millisToMinutesAndSeconds(this.nonBillableTime);
      let nonBillableTime_str = this.task_time;
      this.millisToMinutesAndSeconds(this.totalTimeMs);
      let totalTime_Str = this.task_time;

      const dialogRef = this.dialog.open(TimelogSubmitComponent, {
        width: '535px',
        panelClass: 'custom-viewdialogstyle',
        data: { ids: ids, billable: billableTime_str, nonBilliable: nonBillableTime_str, totalTimeMs: this.totalTimeMs, totalTimeStr: totalTime_Str, approver_list: this.approversortlist, header: "timelog_submit", date_of_request: this.today_date_str },
      });
      dialogRef.afterClosed().subscribe(response => {
        this.getalltaskdata();
      }
      );
    } else {
      this.utilsService.openSnackBarAC("No log hours available to submit", "OK");
    }

    // for (var i = 0; i < this.arraydata.length; i++) {
    //   if (this.arraydata[i].approval_status === "Not submitted" || this.arraydata[i].approval_status === "Updated") {
    //     ids.push(this.arraydata[i].id);
    //     this.totalTimeMs += this.arraydata[i].task_duration_ms;
    //     if (this.arraydata[i].bill == "Billable") {
    //       this.billableTime += this.arraydata[i].task_duration_ms;
    //     } else if (this.arraydata[i].bill == "Non Billable") {
    //       this.nonBillableTime += this.arraydata[i].task_duration_ms;
    //     }
    //   }
    // }
    // this.millisToMinutesAndSeconds(this.billableTime);
    // let billableTime_str = this.task_time
    // this.millisToMinutesAndSeconds(this.nonBillableTime);
    // let nonBillableTime_str = this.task_time;
    // this.millisToMinutesAndSeconds(this.totalTimeMs);
    // let totalTime_Str = this.task_time;
    // if (ids.length == 0) {
    //   this.utilsService.openSnackBarAC("No log hours available to submit", "OK");
    // }
    // else {
    //   const dialogRef = this.dialog.open(TimelogSubmitComponent, {
    //     width: '535px',
    //     panelClass: 'custom-viewdialogstyle',
    //     data: { ids: ids, billable: billableTime_str, nonBilliable: nonBillableTime_str, totalTimeMs: this.totalTimeMs, totalTimeStr: totalTime_Str, approver_list: this.approversortlist,header: "timelog_submit" },
    //   });
    //   dialogRef.afterClosed().subscribe(response => {
    //     this.getalltaskdata();
    //   }
    //   );
    // }
  }
  //filter integration
  filter() {
    this.spinner.show();
    var period;
    if (this.periodselectedItems.length != 0) {
      period = this.periodselectedItems[0].item_text;
    }
    if (this.periodselectedItems.length == 0) {
      period = "Today";
    }
    var start_date, end_date;
    let client_id = [];
    let project = [];
    let job = [];
    let bill = [];
    let status = [];

    //to fetch client id for filter
    if (this.clientselectedItems.length != 0) {
      for (var i = 0; i < this.clientselectedItems.length; i++) {
        client_id.push(this.clientselectedItems[i].item_id);
      }
    }
    if (this.clientselectedItems.length == 0) {
      for (var i = 0; i < this.clientdropdownList.length; i++) {
        client_id.push(this.clientdropdownList[i].item_id);
      }
    }

    //to fetch project name for filter
    if (this.projectselectedItems.length != 0) {
      for (var i = 0; i < this.projectselectedItems.length; i++) {
        project.push(this.projectselectedItems[i].item_text);
      }
    }

    if (this.projectselectedItems.length == 0) {
      for (var i = 0; i < this.filter_project_dd.length; i++) {
        project.push(this.filter_project_dd[i].item_text);
      }
    }

    //to fetch job name for filter
    if (this.jobsselectedItems.length != 0) {
      for (var i = 0; i < this.jobsselectedItems.length; i++) {
        job.push(this.jobsselectedItems[i].item_text);
      }
    }

    if (this.jobsselectedItems.length == 0) {
      for (var i = 0; i < this.filter_job_dd.length; i++) {
        job.push(this.filter_job_dd[i].item_text);
      }
    }

    //fetch bill name for tilter
    if (this.billselectedItems.length != 0) {
      for (var i = 0; i < this.billselectedItems.length; i++) {
        bill.push(this.billselectedItems[i].item_text)
      }
    }

    if (this.billselectedItems.length == 0) {
      for (var i = 0; i < this.billdropdownList.length; i++) {
        bill.push(this.billdropdownList[i].item_text)
      }
    }

    //to fet approval status for filter
    if (this.approveselectedItems.length != 0) {
      for (var i = 0; i < this.approveselectedItems.length; i++) {
        status.push(this.approveselectedItems[i].item_text);
      }
    }

    if (this.approveselectedItems.length == 0) {
      for (var i = 0; i < this.approvedropdownList.length; i++) {
        status.push(this.approvedropdownList[i].item_text);
      }
    }
    if (period === 'Today') {
      start_date = this.today_date;
      end_date = this.today_date;
    }
    if (period === 'Yesterday') {
      start_date = moment().subtract(1, "days").format("YYYY-MM-DD");
      end_date = moment().subtract(1, "days").format("YYYY-MM-DD");
    }
    if (period === 'This Week') {
      start_date = moment().startOf("week").format("YYYY-MM-DD");
      end_date = moment().endOf("week").format("YYYY-MM-DD");
    }
    if (period === 'Last Week') {
      start_date = moment().subtract(1, 'weeks').startOf("week").format("YYYY-MM-DD");
      end_date = moment().subtract(1, 'weeks').endOf("week").format("YYYY-MM-DD");
    }
    if (period === 'This Month') {
      start_date = moment().startOf("month").format("YYYY-MM-DD");
      end_date = moment().endOf("month").format("YYYY-MM-DD");
    }
    if (period === 'Last Month') {
      start_date = moment().subtract(1, 'month').startOf("month").format("YYYY-MM-DD");
      end_date = moment().subtract(1, 'month').endOf("month").format("YYYY-MM-DD");
    }
    if (period === 'Custom') {
      start_date = moment(this.filterform.controls['from_date'].value).format("YYYY-MM-DD");
      end_date = moment(this.filterform.controls['to_date'].value).format("YYYY-MM-DD");
    }
    let formdata = {
      "emp_id": this.emp_id,
      "start_date": start_date,
      "end_date": end_date,
      "client_id": client_id,
      "project": project,
      "job": job,
      "bill": bill,
      "status": status
    }
    this.arraydata = [];
    this.dataSource1.data = [];
    this.no_data = [];
    this.timeTrackerService.getFilterdata(formdata).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        var data1 = JSON.parse(data.map.details);
        var total_time = data.map.total_time;
        this.millisToMinutesAndSeconds(total_time);
        this.total_task_duration = this.task_time;
        if (data1.length > 0) {
          for (var i = 0; i < data1.length; i++) {
            this.arraydata.push(data1[i]);
          }
          this.displayedColumns = ['select', 'date_of_request', 'task', 'project', 'bill', 'task_duration', 'actions'];
          this.dataSource1.data = this.arraydata;
          this.no_data = this.arraydata;
        }
        if (data1.length === 0) {
          this.total_task_duration = '00:00:00';
        }
        this.reset_filter_btn = true;
        this.resetfilter();
        setTimeout(() => {
          this.spinner.hide();
        }, 2000);
      }
      else {
        setTimeout(() => {
          this.spinner.hide();
        }, 2000);
        // this.utilsService.openSnackBarMC("failed to get filter data", "OK");
      }
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
    })
    setTimeout(() => {
      this.spinner.hide();
    }, 2000);
  }
  resetfilter() {
    this.periodselectedItems = [];
    this.clientselectedItems = [];
    this.projectselectedItems = [];
    this.jobsselectedItems = [];
    this.billselectedItems = [];
    this.approveselectedItems = [];
    // this.filterform.controls['from_date'].setValue("");
    // this.filterform.controls['client'].setValue("");
    // this.filterform.controls['client'].reset();
    // this.filterform.controls['to_date'].reset();
    this.filterform.markAsUntouched();
  }
  onSearchChange(searchValue) {
    // console.log(searchValue);
  }
  //to send the employee details data for the timelog submit dialog dropdown field 
  approver: any = [];
  approveList: any = [];
  approversortlist: any = [];
  geEmployeeDetailsByOrgId() {
    this.approver = [];
    let employeelist = []
    //Here I have used the get ACTIVE EMPLOYEE DETAILS API call --> Means its get all user details under the Organization Id
    this.settingsService.getCustomActiveEmpDetailsByOrgID(this.Org_id).subscribe(data => {
      let response: any[] = JSON.parse(data.map.data);
      for (let i = 0; i < response.length; i++) {
        employeelist.push({ "name": response[i].firstname + " " + response[i].lastname, "id": response[i].id, "access": response[i].access_to });
      }
      // this.approver = employeelist;
      this.approveList = employeelist;
      for (let j = 0; j < this.approveList.length; j++) {
        let nameApprove = this.approveList[j].id;
        let access = this.approveList[j].access;
        let replaceList = JSON.parse(access);
        for (let y = 0; y < replaceList.length; y++) {
          let stringValue: string = replaceList[y];
          if (stringValue === "time-tracker") {
            this.approversortlist.push({ "name": this.approveList[j].name, "id": this.approveList[j].id });
          }
        }
      }

    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
    })
  }

  //to get project and jobs based on the orgid and empid
  // getprojectjobdrodown() {
  //   this.project = [];
  //   this.projectdropdownList = [];
  //   let formdata = {
  //     "empid": this.emp_id,
  //     "orgid": this.Org_id
  //   }
  //   this.timeTrackerService.getprojectjobdropdown(formdata).subscribe(data => {
  //     var response = JSON.parse(data.map.data);
  //     //project
  //     var projectdetails = response[0].map.projectdetails.myArrayList;
  //     projectdetails = projectdetails.reduce((accumalator, current) => {
  //       if (
  //         !accumalator.some(
  //           (item) => item.map.id === current.map.id && item.map.name === current.map.name
  //         )
  //       ) {
  //         accumalator.push(current);
  //       }
  //       return accumalator;
  //     }, []);
  //     let filter_project = []
  //     for (var i = 0; i < projectdetails.length; i++) {
  //       this.project.push({ "name": projectdetails[i].map.name, "id": projectdetails[i].map.id, "client_id": projectdetails[i].map.client_id });
  //       filter_project.push({ "item_id": projectdetails[i].map.id, "item_text": projectdetails[i].map.name });
  //     }
  //     this.projectdropdownList = filter_project;
  //     console.log("1951==>",this.projectdropdownList);
  //     this.filter_project_dd = filter_project;
  //     this.filterproject();

  //     //jobs
  //     var filter_job = [];
  //     this.job = [];
  //     var jobdetails = response[1].map.jobdetails.myArrayList;
  //     for (var i = 0; i < jobdetails.length; i++) {
  //       this.jobdetails.push({ "id": jobdetails[i].map.id, "name": jobdetails[i].map.name, "bill": jobdetails[i].map.bill, "project_id": jobdetails[i].map.project_id, "mail_sended": jobdetails[i].map.mail_sended });
  //       this.job.push({ "id": jobdetails[i].map.id, "name": jobdetails[i].map.name });
  //       filter_job.push({ "item_id": jobdetails[i].map.id, "item_text": jobdetails[i].map.name });
  //     }
  //     this.jobs_loading = false;
  //     if (this.taskForm.value.project != "") {
  //       this.setjobsbyprojectid(this.taskForm.value.project);
  //     }

  //     filter_job = filter_job.reduce((accumalator, current) => {
  //       if (
  //         !accumalator.some(
  //           (item) => item.item_text === current.item_text
  //         )
  //       ) {
  //         accumalator.push(current);
  //       }
  //       return accumalator;
  //     }, []);
  //     this.jobsdropdownList = filter_job;
  //     this.filter_job_dd = filter_job;
  //     this.filterjob();
  //   }, (error) => {
  //     this.router.navigate(["/404"]);
  //     this.spinner.hide();
  //   })
  // }

  getprojectjobdrodown() {
    this.project = [];
    this.projectdropdownList = [];
    let formdata = {
      "empid": this.emp_id,
      "orgid": this.Org_id
    }
    this.timeTrackerService.getProjectAndJobNames(formdata).subscribe(data => {
      var response = JSON.parse(data.map.data);
      this.orgEmpDetails = response[0].map.projectdetails.myArrayList[0].map.orgDetails;
      // var projectdetails = response[0].map.projectdetails.myArrayList;
      // this.jobdetails = response[1].map.jobdetails.myArrayList;
      //project
      var projectdetails = response[0].map.projectdetails.myArrayList;
      projectdetails = projectdetails.reduce((accumalator, current) => {
        if (
          !accumalator.some(
            (item) => item.map.id === current.map.id && item.map.name === current.map.name
          )
        ) {
          accumalator.push(current);
        }
        return accumalator;
      }, []);
      let filter_project = []
      for (var i = 0; i < projectdetails.length; i++) {
        this.project.push({ "name": projectdetails[i].map.name, "id": projectdetails[i].map.id, "client_id": projectdetails[i].map.client_id });
        filter_project.push({ "item_id": projectdetails[i].map.id, "item_text": projectdetails[i].map.name });
      }
      this.project = this.sortObjectOfStrings(this.project);
      this.projectdropdownList = filter_project;
      this.filter_project_dd = filter_project;
      this.filterproject();

      //jobs
      var filter_job = [];
      this.job = [];
      var jobdetails = response[1].map.jobdetails.myArrayList;
      for (var i = 0; i < jobdetails.length; i++) {
        this.jobdetails.push({ "id": jobdetails[i].map.id, "name": jobdetails[i].map.name, "bill": jobdetails[i].map.bill, "project_id": jobdetails[i].map.project_id, "mail_sended": jobdetails[i].map.mail_sended });
        this.job.push({ "id": jobdetails[i].map.id, "name": jobdetails[i].map.name });
        filter_job.push({ "item_id": jobdetails[i].map.id, "item_text": jobdetails[i].map.name });
      }
      this.jobs_loading = false;
      if (this.taskForm.value.project != "") {
        this.setjobsbyprojectid(this.taskForm.value.project);
      }

      filter_job = filter_job.reduce((accumalator, current) => {
        if (
          !accumalator.some(
            (item) => item.item_text === current.item_text
          )
        ) {
          accumalator.push(current);
        }
        return accumalator;
      }, []);
      this.jobsdropdownList = filter_job;
      this.filter_job_dd = filter_job;
      this.filterjob();
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
    })
  }

  sortObjectOfStrings(data) {
    data.sort((a, b) => {
      const nameA = a.name.toUpperCase();
      const nameB = b.name.toUpperCase();
      if (nameA < nameB) {
        return -1;
      }
      if (nameA > nameB) {
        return 1;
      }
      return 0;
    });
    return data;
  }

  //to check the logged in user have the access to the projects and jobs module
  projectJobsAccess: boolean = false;
  toCheckProjectJobsAccessTo() {
    let access = localStorage.getItem("emp_access");
    var access_to = [];
    if (access != null) {
      access_to = access.split(",");
    }
    this.projectJobsAccess = false;
    if(access_to.includes("project/jobs")){
      this.projectJobsAccess = true;
    }
  }

  //create project from dropdown
  addProject() {
    sessionStorage.setItem('TT-projectName', this.projectFilterCtrl.value);
    this.router.navigate(["/addproject"]);
  }

  //create Job from dropdown
  addJob() {
    if (this.selected_project_id) {
      sessionStorage.setItem('projectId', this.selected_project_id);
      sessionStorage.setItem('TT-jobName', this.jobFilterCtrl.value);
    }
    this.router.navigate(["/addjobs"]);
  }
}