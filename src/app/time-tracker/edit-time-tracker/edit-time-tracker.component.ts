// import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, NgForm, Validators } from '@angular/forms';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSelect } from '@angular/material/select';
import { NgxSpinnerService } from 'ngx-spinner';
import { ReplaySubject, Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { JobsService } from '../../services/jobs.service';
import { ProjectsService } from '../../services/projects.service';
import { TimeTrackerService } from '../../services/time-tracker.service';
import { UtilService } from '../../services/util.service';
import { TimeTrackerComponent } from '../time-tracker.component';
import moment from 'moment'; import { formatDate } from '@angular/common';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE, NativeDateAdapter } from '@angular/material/core';
import { Router } from '@angular/router';
import { errorMessage, editTask, quickEditTask, quickAddTask } from '../../util/constants';
import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { NotificationService } from 'src/app/services/notification.service';


export interface DialogData {
  task: any;
  project: any;
  job: any;
  bill: any;
  id: number;
  taskdate: any;
}

const QuickAddDate = {
  parse: { dateInput: 'DD-MM-YYYY' },
  display: {
    dateInput: 'input',
    monthYearLabel: { year: 'numeric', month: 'numeric' },
    dateA11yLabel: { year: 'numeric', month: 'numeric', day: 'numeric' },
    monthYearA11yLabel: { year: 'numeric', month: 'numeric' }
  }
};
export class PickDateAdapter extends NativeDateAdapter {
  format(taskdata: Date, displayFormat: Object): string {
    if (displayFormat === 'input') {
      return formatDate(taskdata, 'dd-MM-yyyy', this.locale);;
    } else {
      return taskdata.toDateString();
    }
  }
}

@Component({
  selector: 'app-edit-time-tracker',
  templateUrl: './edit-time-tracker.component.html',
  styleUrls: ['./edit-time-tracker.component.less'],
  providers: [
    { provide: DateAdapter, useClass: PickDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: QuickAddDate }
  ]
})
export class EditTimeTrackerComponent implements OnInit {
  maxDate = new Date();
  editform: UntypedFormGroup;
  newEditForm: UntypedFormGroup;
  emp_id: any;
  Org_id: any;
  client_id: any;
  reloading: boolean = false;
  quickAddTask: boolean;
  taskdata: any;

  requiredMessage = errorMessage;
  editTask = editTask;
  quickAddTaskData = quickAddTask;
  quickEditTask = quickEditTask;

  /** list of project */
  project: any[] = [];

  /** list of bill */
  bill: any[] = [
    { name: 'Billable', id: 1 },
    { name: 'Non Billable', id: 2 },
  ];

  /** list of bill */
  job: any[] = [];

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

  // public duration:FormControl = new FormControl();
  // public durationMinute:FormControl = new FormControl();
  // public durationHour:FormControl = new FormControl();
  // public durationSecond:FormControl = new FormControl();
  /** list of job filtered by search keyword */
  public filteredjob: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);

  @ViewChild('singleSelect', { static: true }) singleSelect: MatSelect;

  @ViewChild('autosize', { static: false }) autosize: CdkTextareaAutosize;


  // @ViewChild('f',{static: true}) myEditForm:any;
  @ViewChild('regForm', { static: false }) myForm: NgForm;
  /** Subject that emits when the component has been destroyed. */
  protected _onDestroy = new Subject<void>();

  // durationMinuteOne =this.durationMinute.setValue('00');
  // durationHourOne=this.durationHour.setValue('00');
  taskdetails: any = [];
  todayDate: any;
  editorSave: boolean;
  editQuickTask: boolean;
  taskJob: any;
  loginurl: string;
  modifiedstring: string;
  loginstr: string;
  login_str: string;

  constructor(private spinner: NgxSpinnerService,
    public timeTrackerService: TimeTrackerService,
    private formBuilder: UntypedFormBuilder,
    private formBuilder2: UntypedFormBuilder,
    @Inject(MAT_DIALOG_DATA) public data,
    public dialog: MatDialog,
    public utilsService: UtilService,
    private router: Router,
    private projectsService: ProjectsService,
    private jobsService: JobsService,private notificationService: NotificationService) {
    // for to get a current webpage url
    this.loginurl = window.location.href;
    this.modifiedstring = this.loginurl.slice(0, this.loginurl.length - 13);
    this.loginstr = "login";
    this.login_str = this.modifiedstring.concat(this.loginstr.toString());

  }

  Space(event: any) {
    if (event.target.selectionStart === 0 && event.code === "Space") {
      event.preventDefault();
    }
  }

  ngOnInit() {
    // this.spinner.show();
    this.quickAddTask = this.data[3];
    if (this.quickAddTask == false) {
      this.taskdetails = this.data[0];
      this.taskJob = this.data[0].job;
      this.emp_id = localStorage.getItem('Id');
      this.Org_id = localStorage.getItem('OrgId');
      this.reloading = true;
      this.editform = this.formBuilder.group({
        tasks: ['', Validators.required],
        project: ['', Validators.required],
        job: ['', Validators.required],
        bill: ['', Validators.required]
      });
      setTimeout(() => {
        this.getprojectbyorgid();
        this.getjobdetailsbyorgid();
      }, 100);
      this.setformvalues();
      // setTimeout(() => {
      //   this.spinner.hide();
      // }, 1000);
    } else {
      if (this.data[4] == false) {
        this.newEditForm = this.formBuilder2.group({
          tasks: ['', Validators.required],
          project: ['', Validators.required],
          job: ['', Validators.required],
          bill: ['', Validators.required],
          durationMinute: ['', Validators.required],
          durationHour: ['', Validators.required],
          taskdate: [this.todayDate = this.data[5], Validators.required],
        });
        this.editorSave = false;
        this.editQuickTask = false;
        this.emp_id = localStorage.getItem('Id');
        this.Org_id = localStorage.getItem('OrgId');
        this.reloading = true;
        let clientdata = this.data[1];
        this.todayDate = this.data[5];
        for (let i = 0; i < clientdata.length; i++) {
          this.client_id = clientdata[i].client_id;
        }

        setTimeout(() => {
          this.getprojectbyorgid();
          this.getjobdetailsbyQuickAdd();
        }, 100);
        this.setQuickAddTask();
      } else {
        //for edit quick taskdatas
        this.taskdetails = this.data[0];
        this.taskJob = this.data[0].job;
        this.newEditForm = this.formBuilder2.group({
          tasks: ['', Validators.required],
          project: ['', Validators.required],
          job: ['', Validators.required],
          bill: ['', Validators.required],
          durationMinute: ['', Validators.required],
          durationHour: ['', Validators.required],
          taskdate: [this.todayDate = this.data[5], Validators.required],
        });
        this.editorSave = false;
        this.editQuickTask = true;
        this.emp_id = localStorage.getItem('Id');
        this.Org_id = localStorage.getItem('OrgId');
        this.reloading = true;
        let clientdata = this.data[1];
        this.todayDate = this.data[5];
        for (let i = 0; i < clientdata.length; i++) {
          this.client_id = clientdata[i].client_id;
        }
        setTimeout(() => {
          this.getprojectbyorgid();
          this.getjobdetailsbyQuickAddTask();
        }, 100);
        this.setQuickAddTaskValues();
      }

    }
  }
  // this is for to show error message on invalid time duration entering
  errorforhour: boolean = false;
  onCheckvalueforhour(value) {
    if (value > 23) {
      this.errorforhour = true;
    }
    else {
      this.errorforhour = false;
    }
  }
  errorforminute: boolean = false;
  onCheckvalueforminutes(value) {
    if (value > 59) {
      this.errorforminute = true;
    }
    else {
      this.errorforminute = false;
    }
  }

  setformvalues() {
    this.editform.setValue({
      tasks: this.taskdetails.task,
      project: this.taskdetails.project,
      job: this.taskdetails.job,
      bill: this.taskdetails.bill
    });
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
  setQuickAddTaskValues() {
    let duration = this.taskdetails.task_duration;
    const durationArray = duration.split(":");
    let durationhour = durationArray[0];
    let durationMinute = durationArray[1];

    this.newEditForm.setValue({
      tasks: this.taskdetails.task,
      project: this.taskdetails.project,
      job: this.taskdetails.job,
      bill: this.taskdetails.bill,
      durationHour: durationhour,
      durationMinute: durationMinute,
      taskdate: this.todayDate
    })

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
    if (!this.bill) {
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

  //Integration
  //update method to update task details
  update() {
    this.spinner.show();
    this.editform.controls['bill'].enable();
    let formdata = {
      "id": this.taskdetails.id,
      "client_id": this.client_id,
      "task": this.editform.value.tasks,
      "project": this.editform.value.project,
      "job": this.editform.value.job,
      "bill": this.editform.value.bill,
      "task_duration": this.taskdetails.task_duration,
      "task_duration_ms": this.taskdetails.task_duration_ms,
      "login_str": this.login_str,
      "date_of_request": this.taskdetails.date_of_request
    }
    this.timeTrackerService.updateTaskDetails(formdata).subscribe(data => {
      if (data.map.statusMessage == "Success" && data.map.Error == "Error in sending mail with job hours exceeded due to mail configuration check the configuration details") {
        this.utilsService.openSnackBarAC("Task updated successfully", "OK");
        this.notificationWithEmailMsg();
        this.close()
      }
      else if (data.map.statusMessage == "Success") {
        this.utilsService.openSnackBarAC("Task updated successfully", "OK");
        this.close()
      }
      else {
        this.utilsService.openSnackBarMC("Failed to update task details", "OK");
        // console.log("failed");
      }
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
      this.close()
    })
    setTimeout(() => {
      this.spinner.hide();
    }, 500);
  }
  async notificationWithEmailMsg() {
    this.spinner.show();
    let notify_id;
    let zone = moment.tz.guess();
    let message =
    "Mail configuration issue encountered during  "+ this.emp_id +" timesheet submission.";
    let formdata = {
      "org_id": this.Org_id,
      "message": message,
      "to_notify_id":  this.data[0].orgDetails.emp_id,
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
  updateQuickAddTask() {
    this.spinner.show();
    this.newEditForm.controls['bill'].enable();
    let hours = this.newEditForm.value.durationHour;
    let minute = this.newEditForm.value.durationMinute;
    let second = "00";
    this.durationTime = hours + ":" + minute + ":" + second;
    this.timetomillsecond(this.durationTime);
    let formdata = {
      "id": this.taskdetails.id,
      "client_id": this.client_id,
      "task": this.newEditForm.value.tasks,
      "project": this.newEditForm.value.project,
      "job": this.newEditForm.value.job,
      "bill": this.newEditForm.value.bill,
      "task_duration": this.durationTime,
      "task_duration_ms": this.milliseconds,
      "login_str": this.login_str,
      "date_of_request": moment(this.newEditForm.value.taskdate).format("YYYY-MM-DD")
    }
    this.timeTrackerService.updateTaskDetails(formdata).subscribe(data => {
      if (data.map.statusMessage == "Success" && data.map.Error == "Error in sending mail with job hours exceeded due to mail configuration check the configuration details") {
        this.utilsService.openSnackBarAC("Task updated successfully", "OK");
        this.notificationWithEmailMsg();
        this.close()
      }
      if (data.map.statusMessage == "Success") {
        this.utilsService.openSnackBarAC("Task updated successfully", "OK");
        this.close()
      }
      else {
        this.utilsService.openSnackBarMC("Failed to update task details", "OK");
        // console.log("failed");
      }
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
    })
    setTimeout(() => {
      this.spinner.hide();
    }, 500);
  }
  close() {
    const dialogRef = this.dialog.closeAll();
  }
  getDialogQuickTask() {
    this.dialog.afterOpened.subscribe(() => { })
    // const dialogRef = this.dialog.afterOpened.subscribe.(() => { 

    //  });
  }
  //get all projects based on the orgid and 
  //set the value if it is assigned to the logged user
  getprojectbyorgid() {
    this.spinner.show();
    this.project = [];
    this.project = this.data[1];
    this.filterproject();
    setTimeout(() => {
      this.spinner.hide();
    }, 2000);
  }

  //get all job details based on the org id
  jobdetails: any = [];
  getjobdetailsbyorgid() {
    // this.spinner.show();
    this.job = [];
    this.jobdetails = [];
    this.jobdetails = this.data[2];

    this.setjobsbyprojectid(this.taskdetails.project);
    this.filterjob();
  }
  getjobdetailsbyQuickAdd() {
    // this.spinner.show();
    this.job = [];
    this.jobdetails = [];
    this.jobdetails = this.data[2];
    // this.setjobsbyprojectid(this.taskdetails.project);

    this.filterjob();
  }

  //for edit
  getjobdetailsbyQuickAddTask() {
    // this.spinner.show();
    this.job = [];
    this.jobdetails = [];
    this.jobdetails = this.data[2];

    this.setjobsbyprojectidquickTask(this.taskdetails.project);

    this.filterjob();
  }
  selected_project_id: any;
  getBillType: boolean = false;
  //set job by project id
  setjobsbyprojectid(val) {
    let proj_id;
    this.project.forEach(x => {
      if (val == x.name) {
        proj_id = x.id;
        this.selected_project_id = x.id;
        this.client_id = x.client_id;
      }
    })

    this.job = [];
    this.jobdetails.forEach(y => {
      if (proj_id == y.project_id) {
        this.job.push({ "name": y.name, "id": y.id, "bill": y.bill, "mail_sended": y.mail_sended })
      }
    });
    this.getBillType = false;
    this.job.forEach(z => {
      if (this.taskJob == z.name) {
        if (z.bill != '') {
          this.getBillType = true;
        }
      }
    });
    this.editform.controls['bill'].enable();
    if (this.reloading) {
      this.reloading = false;
      this.editform.controls['job'].setValue(this.taskdetails.job);
      this.editform.controls['bill'].setValue(this.taskdetails.bill);
      if (this.getBillType) {
        this.editform.controls['bill'].disable();
      }
    }
    else {
      this.editform.controls['job'].reset();
      this.editform.controls['job'].setValue("");
      this.editform.controls['bill'].reset();
      this.editform.controls['bill'].setValue("");
    }
    this.filterjob();
    // this.spinner.hide();
  }
  quickJobProjectTask: boolean = false;
  setjobsbyprojectidquickTask(val) {
    let proj_id;
    this.project.forEach(x => {
      if (val == x.name) {
        proj_id = x.id;
        this.selected_project_id = x.id;
        this.client_id = x.client_id;
      }
    })

    this.job = [];
    this.jobdetails.forEach(y => {
      if (proj_id == y.project_id) {
        this.job.push({ "name": y.name, "id": y.id, "bill": y.bill, "mail_sended": y.mail_sended })
      }
    });
    this.setQuickAddTask();
    this.getBillType = false;
    this.job.forEach(z => {
      if (this.taskJob == z.name) {
        if (z.bill != '') {
          this.quickJobProjectTask = true;
        }
      }
    });
    this.newEditForm.controls['bill'].enable();
    if (this.reloading) {
      this.reloading = false;
      this.newEditForm.controls['job'].setValue(this.taskdetails.job);
      this.newEditForm.controls['bill'].setValue(this.taskdetails.bill);
      if (this.quickJobProjectTask) {
        this.newEditForm.controls['bill'].disable();
      }
    }
    else {
      this.newEditForm.controls['job'].reset();
      this.newEditForm.controls['job'].setValue("");
      this.newEditForm.controls['bill'].reset();
      this.newEditForm.controls['bill'].setValue("");
    }
    this.filterjob();
  }
  //set bill by job id
  setbillbyjobid(data) {
    this.editform.controls['bill'].enable();
    this.jobdetails.forEach(x => {
      if (data == x.name && this.selected_project_id == x.project_id) {
        if (x.bill != '') {
          this.editform.controls['bill'].setValue(x.bill);
          this.editform.controls['bill'].disable();
        }
        else {
          this.editform.controls['bill'].reset();
          this.editform.controls['bill'].setValue("");
        }
      }
    })
  }

  setbillbyjobQuickAdd(data) {
    this.newEditForm.controls['bill'].enable();
    this.jobdetails.forEach(x => {
      if (data == x.name && this.selected_project_id == x.project_id) {
        if (x.bill != '') {
          this.newEditForm.controls['bill'].setValue(x.bill);
          this.newEditForm.controls['bill'].disable();
        }
        else {
          this.newEditForm.controls['bill'].reset();
          this.newEditForm.controls['bill'].setValue("");
        }
      }
    })
  }
  setQuickAddTask() {
    // this.editform.setValue({
    //   tasks: this.taskdetails.task,
    //   project: this.taskdetails.project,
    //   job: this.taskdetails.job,
    //   bill: this.taskdetails.bill 
    // })

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
  durationTime: any;
  initialValue = {
    tasks: '',
    project: '',
    job: '',
    bill: '',
    durationMinute: '',
    durationHour: '',
  }

  onInputEntry(event, nextInput) {
    let input = event.target;
    let length = input.value.length;
    let maxLength = input.attributes.maxlength.value;

    if (length >= maxLength) {
      nextInput.focus();
    }
  }
  // To create quick add task submit value enter the keyboard

  onSomeAction(event) {
    if (this.newEditForm.valid) {
      if (event.keyCode === 13) {  // 13 number using keyboard enter key value
        this.createQuickAddTask();
      }
    }

  }
  jobdetailsForQuickAdd: any = [];
  jobDetails1:any[] = [];
  createQuickAddTask() {
    this.spinner.show();
    this.newEditForm.controls['bill'].enable();
    let hours = this.newEditForm.value.durationHour;
    if (this.newEditForm.value.durationHour.length == 1) {
      hours = "0" + hours;
    }
    let minute = this.newEditForm.value.durationMinute;
    let second = "00";
    this.durationTime = hours + ":" + minute + ":" + second;
    this.timetomillsecond(this.durationTime);
    let date = this.newEditForm.value.taskdate;
    var todayAddeddate = moment(date).format("YYYY-MM-DD");
    this.jobdetailsForQuickAdd = this.data[2];
    this.jobDetails1 = [];
      for(let i=0;i<this.jobdetailsForQuickAdd.length;i++) {
        if(this.jobdetailsForQuickAdd[i].bill == ""){
          this.jobDetails1.push(this.jobdetailsForQuickAdd[i].name);
        }
      }
    
    //  this.data[5] = todayAddeddate;
    let formdata = {
      "org_id": this.Org_id,
      "emp_id": this.emp_id,
      "client_id": this.client_id,
      "task": this.newEditForm.value.tasks,
      "project": this.newEditForm.value.project,
      "job": this.newEditForm.value.job,
      "bill": this.newEditForm.value.bill,
      "task_duration": this.durationTime,
      "task_duration_ms": this.milliseconds,
      "date_of_request": todayAddeddate,
      "time_interval": null,
      "login_str": this.login_str
    }
    this.timeTrackerService.QuickAddTaskDetails(formdata).subscribe(data => {
      if (data.map.statusMessage == "Success" && data.map.Error == "Error in sending mail with estimated hours due to mail configuration check the configuration details" ) {
        this.utilsService.openSnackBarAC("Task added successfully", "OK");
        this.notificationWithEmailMsg();
        if (this.editorSave == false) {
          this.close();
          this.data[6].callback(todayAddeddate);
        } else if((this.jobDetails1.includes(this.newEditForm.value.job)) && this.editorSave == true) {
          this.myForm.resetForm({ taskdate: this.newEditForm.get('taskdate').value, project: this.newEditForm.get('project').value, job: this.newEditForm.get('job').value});


          this.data[6].callback(todayAddeddate);
        }
       else if(!(this.jobDetails1.includes(this.newEditForm.value.job)) && this.editorSave == true){
        this.myForm.resetForm({ taskdate: this.newEditForm.get('taskdate').value, project: this.newEditForm.get('project').value, job: this.newEditForm.get('job').value, bill: this.newEditForm.get('bill').value});
        this.newEditForm.controls['bill'].disable();

        this.data[6].callback(todayAddeddate);
      } 
    }
      if (data.map.statusMessage == "Success") {
        this.utilsService.openSnackBarAC("Task added successfully", "OK");
        if (this.editorSave == false) {
          this.close();
          this.data[6].callback(todayAddeddate);
        } else if((this.jobDetails1.includes(this.newEditForm.value.job)) && this.editorSave == true) {
          this.myForm.resetForm({ taskdate: this.newEditForm.get('taskdate').value, project: this.newEditForm.get('project').value, job: this.newEditForm.get('job').value});


          this.data[6].callback(todayAddeddate);
        }
       else if(!(this.jobDetails1.includes(this.newEditForm.value.job)) && this.editorSave == true){
        this.myForm.resetForm({ taskdate: this.newEditForm.get('taskdate').value, project: this.newEditForm.get('project').value, job: this.newEditForm.get('job').value, bill: this.newEditForm.get('bill').value});
        this.newEditForm.controls['bill'].disable();

        this.data[6].callback(todayAddeddate);
      } 
    }else {
        this.utilsService.openSnackBarMC("Failed to add task", "OK");
      }
      setTimeout(() => {
        this.spinner.hide();
      }, 1000);
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
      this.close();
    })
  }

  keepEditor(event) {
    if (event.checked == true) {
      this.editorSave = true;
    } else {
      this.editorSave = false;
    }

  }

  //to convert the hh:mm:ss to milliseconds
  milliseconds: number;
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
    this.milliseconds = (hrs + min + sec) * 1000;
  }
  onSubmit() {
    this.newEditForm.reset();
    //   // this.myEditForm.reset();
    //   // this.newEditForm.reset();
    //   this.myEditForm.resetForm()
  }
  onClear() {
    //  this.myEditForm.resetForm();
    this.newEditForm.reset();
  }
}
