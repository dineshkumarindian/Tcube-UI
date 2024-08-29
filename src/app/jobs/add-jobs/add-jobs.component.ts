import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators, ValidationErrors } from '@angular/forms';
import { MatSelect } from '@angular/material/select';
import { MatOption } from '@angular/material/core';
import { ActivatedRoute, Router } from '@angular/router';
import * as moment from 'moment-timezone';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { NgxSpinnerService } from 'ngx-spinner';
import { ReplaySubject, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { JobsService } from 'src/app/services/jobs.service';
import { ProjectsService } from 'src/app/services/projects.service';
import { SettingsService } from 'src/app/services/settings.service';
import { UtilService } from 'src/app/services/util.service';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { errorMessage, characterLength, validFormat, alreadyExistMessage } from '../../util/constants';
import { NotificationService } from 'src/app/services/notification.service';

@Component({
  selector: 'app-add-jobs',
  templateUrl: './add-jobs.component.html',
  styleUrls: ['./add-jobs.component.less']
})
export class AddJobsComponent implements OnInit {
  usersselectedItems = [];
  showmanager: boolean = false;
  showusers: boolean = false;
  dropdownsettings: IDropdownSettings = {};
  managerlist = [];
  userlist = [];
  assigneeList: any[] = [];
  // bills = [];
  selectedValue: any;
  employeeDetails: any[] = [];
  ProjectDetailsList: any[] = [];
  activeProjectList: any[] = [];
  selectedProjectId: any;
  jobId: any;
  isCompleted: Boolean = false;
  requiredMessage = errorMessage;
  characterLength = characterLength;
  whiteSpaceMessage = validFormat;
  existMessage = alreadyExistMessage;
  loginurl: string;
  modifiedstring: string;
  jobsstr: string;
  jobs_str: string;
  /** list of project */
  protected project: any[] = [
    { name: 'COI-SILM', id: 1 },
    { name: 'Staffing RDM', id: 2 },
    { name: 'KISDEVOPS', id: 3 },
    { name: 'T-Cube', id: 4 },

  ];

  /** list of bill */
  protected bill: any[] = [
    { name: 'Billable', id: 1 },
    { name: 'Non Billable', id: 2 },

  ];

  /** control for the description */
  description = new UntypedFormControl('', [Validators.required, Validators.maxLength(5000)]);

  /** control for the selected project */
  public projectCtrl: UntypedFormControl = new UntypedFormControl("", [Validators.required]);

  /** control for the MatSelect filter keyword */
  public projectFilterCtrl: UntypedFormControl = new UntypedFormControl();

  /** list of head filtered by search keyword */
  public filteredproject: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);

  /** control for the selected project */
  public billCtrl: UntypedFormControl = new UntypedFormControl("",);

  /** control for the MatSelect filter keyword */
  public billFilterCtrl: UntypedFormControl = new UntypedFormControl();

  /** list of head filtered by search keyword */
  public filteredbill: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);

  /** control for the selected project */
  public AssigneeCtrl: UntypedFormControl = new UntypedFormControl("", [Validators.required]);

  /** control for the MatSelect filter keyword */
  public AssigneeFilterCtrl: UntypedFormControl = new UntypedFormControl();

  /** list of head filtered by search keyword */
  public filteredAssignee: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);

  @ViewChild('singleSelect', { static: true }) singleSelect: MatSelect;

  /** Subject that emits when the component has been destroyed. */
  protected _onDestroy = new Subject<void>();
  isJobIdAvailable: boolean = false;
  isIdAvailable: boolean = false;
  updateUsersselectedItems = [];
  projectId: any;
  @Output()
  open: EventEmitter<any> = new EventEmitter();
  Editor = ClassicEditor;
  ckconfig = {};
  orgAdminId: any;

  public onReady(editor: any) {

    editor.ui.getEditableElement().parentElement.insertBefore(
      editor.ui.view.toolbar.element,
      editor.ui.getEditableElement()
    );
  }
  constructor(
    private settingsService: SettingsService,
    private jobsService: JobsService,
    private formBuilder: UntypedFormBuilder,
    private utilsService: UtilService,
    private router: Router,
    private projectsService: ProjectsService,
    private activatedRoute: ActivatedRoute,
    private spinner: NgxSpinnerService,
    private notificationService: NotificationService,
  ) {
    this.loginurl = window.location.href;
    this.modifiedstring = this.loginurl.slice(0, this.loginurl.length - 7);
    this.jobsstr = "jobs";
    this.jobs_str = this.modifiedstring.concat(this.jobsstr.toString());
  }
  jobsFormGroup: UntypedFormGroup = this.formBuilder.group({
    job_name: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9](.*[a-zA-Z0-9])?$/),]],
    s_date: [''],
    e_date: [''],
    hours: ['',[Validators.min(0), Validators.pattern('^(0|[1-9][0-9]*)$')]],
    rate_per_hour: ['', [Validators.min(0), Validators.pattern('^(0|[1-9][0-9]*)$')]],
    description: [''],

  })

  oldAssignees: any[] = [];
  oldAssigneeIds: any[] = [];
  oldAssigneeRph: any[] = [];
  oldAssigneehours: any[] = [];
  oldAssigneecost: any[] = [];
  TTJobName:any;
  ngOnInit() {
    // let string='877sswere';
    // .test(string);
    // console.log(a);
    // this.getProjectsByOrgId();
    // setTimeout(() => {
    this.getProjectsByOrgId();
    // }, 1000);
    this.jobId = this.activatedRoute.snapshot.params.id;
    if (this.jobId) {
      this.projectId = localStorage.getItem("projectId");
      let ids = localStorage.getItem("assigneeIds");
      let rph = localStorage.getItem("assigneeRph");
      let cost = localStorage.getItem("assignee_cost");
      let hours = localStorage.getItem("assignee_hours");
      this.oldAssigneeIds = JSON.parse(ids);
      this.oldAssigneeRph = JSON.parse(rph);
      this.oldAssigneecost = JSON.parse(cost);
      this.oldAssigneehours = JSON.parse(hours);
      // this.oldAssigneeIds = this.jobsService.getAssigneesIds();
      // this.oldAssigneeRph = this.jobsService.getAssigneesRph();
      this.isIdAvailable = true;
      this.isJobIdAvailable = true;
      setTimeout(() => {
        this.getEmpDetailsByProjectId(this.projectId);
      }, 1500);

      this.formValues();
    } else {
      this.isJobIdAvailable = false;
    }
    // load the initial bill list
    this.filteredbill.next(this.bill.slice());

    // listen for search field value changes
    this.billFilterCtrl.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        this.filterbill();
      });

      
  }
  // projectresoyrcedetails:any[]=[];
  // getEmpDetailsByProjectId(id) {
  //   // debugger;
  //   if (this.jobId) {
  //     this.isCompleted = false;
  //     this.spinner.show();
  //   }
  //   this.employeeDetails = [];
  //   this.projectsService.getActiveProjectDetailsById(id).subscribe(data => {
  //     if (data.map.statusMessage == "Success") {
  //       let response = JSON.parse(data.map.data);
  //       for (let i = 0; i < response.resourceDetails.length; i++) {
  //         this.employeeDetails.push(response.resourceDetails[i])
  //       }
  //       // console.log(this.employeeDetails);

  //       var filterArray = this.employeeDetails.reduce((accumalator, current) => {
  //         if (
  //           !accumalator.some(
  //             (item) => item.employeeDetails.id === current.employeeDetails.id
  //           )
  //         ) {
  //           accumalator.push(current);
  //         }
  //         return accumalator;
  //       }, []);
  //       // console.log(filterArray);
  //       this.employeeDetails = filterArray;
  //       // load the initial assignee list
  //       this.filteredAssignee.next(this.employeeDetails.slice());
  //       // listen for search field value changes
  //       this.AssigneeFilterCtrl.valueChanges
  //         .pipe(takeUntil(this._onDestroy))
  //         .subscribe(() => {
  //           this.filterassignee();
  //         });

  //       setTimeout(() => {
  //         this.spinner.hide();
  //       }, 2000)
  //       this.setAssignees();
  //     }
  //     else {
  //       setTimeout(() => {
  //         this.spinner.hide();
  //       }, 2000)
  //     }
  //   }, (error) => {
  //     this.router.navigate(["/404"]);
  //     this.spinner.hide();
  //   })
  // }
  ProjectstringName: string;
  // To display the assignees(reactivated assignees also)in that particular project taken using reference id - for assignee dropdown
  getEmpDetailsByProjectId(id) {
    // debugger;
    if (this.jobId) {
      this.isCompleted = false;
      this.spinner.show();
    }
    this.employeeDetails = [];
    this.projectsService.getProjectByReferenceId(id).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        let projectdata = JSON.parse(data.map.data);
        this.employeeDetails = projectdata[0].resourceDetails;
        this.ProjectstringName = projectdata[0].project_name;
        
        this.orgAdminId = this.employeeDetails[0].map.orgadmin_id;
        //   for(let i=0;i<projectResource.length;i++) {
        //   if(projectResource[i].map.designation == "team_members") {
        //     this.employeeDetails.push(projectResource[i]);
        //   }        
        // }
        var filterArray = this.employeeDetails.reduce((accumalator, current) => {
          if (
            !accumalator.some(
              (item) => item.map.id === current.map.id
            )
          ) {
            accumalator.push(current);
          }
          return accumalator;
        }, []);
        // console.log(filterArray);
        this.employeeDetails = filterArray;
        // load the initial assignee list
        this.filteredAssignee.next(this.employeeDetails.slice());
        // listen for search field value changes
        this.AssigneeFilterCtrl.valueChanges
          .pipe(takeUntil(this._onDestroy))
          .subscribe(() => {
            this.filterassignee();
          });

        setTimeout(() => {
          this.spinner.hide();
        }, 2000)
        this.setAssignees();
      }
      else {
        setTimeout(() => {
          this.spinner.hide();
        }, 2000)
      }
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
    })
  }

  setAssignees() {
    this.spinner.show();
    setTimeout(() => {
      this.AssigneeCtrl.setValue(this.oldAssigneeIds);
      this.updateUsersselectedItems = this.oldAssigneeIds;
      for (let i = 0; i < this.oldAssigneeRph.length; i++) {
        this.userlist[i].rph = this.oldAssigneeRph[i];
        this.assigneeList[i].rph = this.oldAssigneeRph[i];
      }
    }, 1000);
    this.spinner.hide();
    // this.oldAssigneeIds=[];
    // this.oldAssigneeRph=[];
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
      this.ProjectDetailsList.filter(project => project.project_name.toLowerCase().indexOf(search) > -1)
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
    // filter the client
    this.filteredbill.next(
      this.bill.filter(bill => bill.name.toLowerCase().indexOf(search) > -1)
    );
  }
  protected filterassignee() {
    if (!this.employeeDetails) {
      return;
    }
    // get the search keyword
    let search = this.AssigneeFilterCtrl.value;
    if (!search) {
      this.filteredAssignee.next(this.employeeDetails.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
    // filter the client
    this.filteredAssignee.next(
      this.employeeDetails.filter(user => user.map.name.toLowerCase().indexOf(search) > -1)
    );
  }
  usersfunction(event) {
    this.userlist = [];
    this.assigneeList = [];
    // console.log(this.usersselectedItems);
    for (let i = 0; i < this.usersselectedItems.length; i++) {
      if (this.usersselectedItems[i] != undefined) {
        this.userlist.push({ name: this.usersselectedItems[i].map.name, rph: '0' });
        this.assigneeList.push({ emp_id: this.usersselectedItems[i].map.id, rph: '0', assignee_hours: 0.0, assignee_cost: 0 })
      }
    }
    if (this.assigneeList.length == this.employeeDetails.length) {
      this.allSelected = true;
    }
    else {
      this.allSelected = false;
    }
    if (this.usersselectedItems.length > 0) {
      this.showusers = true;
    }
    else {
      this.showusers = false;
    }
    // console.log(this.userlist);
  }

  userData = [];
  updateUsersfunction(event) {
    this.userlist = [];
    this.assigneeList = [];
    this.userData = [];
    for (let i = 0; i < this.updateUsersselectedItems.length; i++) {
      for (let j = 0; j < this.employeeDetails.length; j++) {
        if (this.employeeDetails[j].map.id == this.updateUsersselectedItems[i]) {
          this.userData.push(this.employeeDetails[j]);
        }
      }
    }

    for (let i = 0; i < this.userData.length; i++) {
      this.userlist.push({ name: this.userData[i].map.name, rph: '0' });
      this.assigneeList.push({ emp_id: this.userData[i].map.id, rph: '0', assignee_hours: 0.0, assignee_cost: 0 })
    }

    // if again select the user => set the previus rph
    for (let i = 0; i < this.jobAssigneeIds.length; i++) {
      for (let j = 0; j < this.userlist.length; j++) {
        if (this.assigneeList[j].emp_id == this.jobAssigneeIds[i]) {
          this.assigneeList[j].rph = this.jobAssigneeRph[i];
          this.userlist[j].rph = this.jobAssigneeRph[i];
          this.assigneeList[j].assignee_hours = this.jobAssigneehours[i];
          this.assigneeList[j].assignee_cost = this.jobAssigneecost[i];
        }
      }
    }

    if (this.updateUsersselectedItems.length > 0) {
      this.showusers = true;
    }
    else {
      this.showusers = false;
    }
    // console.log(this.userlist);
    // console.log(this.assigneeList);
    if (this.assigneeList.length == this.employeeDetails.length) {
      this.allSelectedjob = true;
    }
    else {
      this.allSelectedjob = false;
    }
  }
  rphchangemanager(i: number, value: any) {
    this.managerlist[i].rph = value;
    // console.log(this.managerlist);
  }
  rphchangeuser(i: number, value: any) {
    this.userlist[i].rph = value;
    this.assigneeList[i].rph = value;
    // console.log(this.userlist);
    // console.log(this.assigneeList);

  }
  // onSelectAll(items: any) {
  //   console.log(items);
  // }
  // onItemSelect(items: any) {
  //   console.log(items);
  // }
  async selectedProjectEvent(event) {    
    // if (!this.editorSave) {
      this.assigneeList = [];
      this.userlist = [];
      this.AssigneeCtrl = new UntypedFormControl("", [Validators.required]);
      this.jobsFormGroup.reset();
      this.getEmpDetailsByProjectId(this.selectedProjectId);
    // }
    // this.jobAssigneeIds=[];
    // this.jobAssigneeRph=[];
    // if (!this.jobId) {
    await this.getJobsName(this.selectedProjectId);
    // }
    // console.log(this.projectCtrl.value);
  }

  // remove local storage assignee ids and rphstyle
  removeLocal() {
    localStorage.removeItem('assigneeIds');
    localStorage.removeItem('assigneeRph');
    localStorage.removeItem('assignee_hours');
    localStorage.removeItem('assignee_cost');
  }
  // As it getting all data in response it slowdown the add job so commanded
  // getProjectsByOrgId() {
  //   this.spinner.show();
  //   let orgId = localStorage.getItem("OrgId");
  //   this.projectsService.getActiveProjectDetailsByOrgId(orgId).subscribe(data => {
  //     if (data.map.statusMessage == "Success") {
  //       this.ProjectDetailsList = JSON.parse(data.map.data);
  //       console.log("400==>",this.ProjectDetailsList);
  //       // load the initial project list
  //       this.filteredproject.next(this.ProjectDetailsList.slice());

  //       // listen for search field value changes
  //       this.projectFilterCtrl.valueChanges
  //         .pipe(takeUntil(this._onDestroy))
  //         .subscribe(() => {
  //           this.filterproject();
  //         });
  //       this.spinner.hide();
  //     } else {
  //       this.spinner.hide();
  //     }

  //   }, (error) => {
  //     this.router.navigate(["/404"]);
  //     this.spinner.hide();
  //   })
  // }

  //For project name dropdown 
  getProjectsByOrgId() {
    this.spinner.show();
    let orgId = localStorage.getItem("OrgId");
    this.projectsService.getProjectNameAndId(orgId).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        this.activeProjectList = JSON.parse(data.map.data);
        for (let i = 0; i < this.activeProjectList.length; i++) {
          if (this.activeProjectList[i].project_status == 'Inprogress') {
            this.ProjectDetailsList.push(this.activeProjectList[i]);
          }
        }
        this.filteredproject.next(this.ProjectDetailsList.slice());
        // listen for search field value changes
        this.projectFilterCtrl.valueChanges
          .pipe(takeUntil(this._onDestroy))
          .subscribe(() => {
            this.filterproject();
          });
        this.spinner.hide();
      } else {
        this.spinner.hide();
      }
      this.setProjectId();

    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
    })
  }

  async addJob() {
    this.spinner.show();
    let orgId = localStorage.getItem("OrgId");
    let zone = moment.tz.guess();
    let data: Object = {
      "org_id": orgId,
      "job_name": this.jobsFormGroup.value.job_name,
      "project_id": this.selectedProjectId,
      "start_date": this.jobsFormGroup.value.s_date,
      "end_date": this.jobsFormGroup.value.e_date,
      "hours": this.jobsFormGroup.value.hours,
      "rate_per_hour": this.jobsFormGroup.value.rate_per_hour,
      "description": this.description.value,
      "bill": this.billCtrl.value,
      "assignees": this.assigneeList,
      "timezone": zone,
      "jobs_url": this.jobs_str
    }
    let Assignee_list: any = this.assigneeList;
    let job = this.jobsFormGroup.value.job_name;
    job = job.charAt(0).toUpperCase() + job.slice(1);
    let project = this.ProjectstringName;
    project = project.charAt(0).toUpperCase() + project.slice(1);
    await this.jobsService.createJobDetails(data).subscribe(async data => {
      if (data.map.statusMessage == "Success" && data.map.Error == "Error in creating user due to mail configuration check the configuration details") {
         await this.utilsService.openSnackBarAC("Job added successfully", "OK");
        this.selectedProjectEvent(this.selectedProjectId);
        if (!this.editorSave) {
          this.router.navigate(["/jobs"]);
        }
        let zone = moment.tz.guess();
        let message =
        "Mail configuration issue encountered  while creating job.";
        let formdata = {
          org_id: localStorage.getItem("OrgId"),
          message: message,
          to_notify_id: this.orgAdminId,
          notifier: localStorage.getItem("Id"),
          keyword: "mail-issue",
          timezone: zone,
        };
        this.notificationService
          .postNotification(formdata)
          .subscribe((data) => {
            if (data.map.statusMessage == "Success") {
              this.spinner.hide();
            } else {
              this.spinner.hide();
            }
          });
        for (let i = 0; i < Assignee_list.length; i++) {
          let message = '<p style="font-size: 14px !important; line-height:20px;">You have been assigned in <span style="background-color: #46464d; border-radius: 4px; color: white; padding: 0px 5px 2px 5px; font-weight: 400; font-size: 12px !important;">' + job + '</span> job on the <span style="background-color: #2e7f35; border-radius: 4px; color: white; padding: 0px 5px; font-weight: 400;font-size: 12px !important;"> ' + project + '</span> project</p>';
          let formdata = {
            "org_id": localStorage.getItem('OrgId'),
            "message": message,
            "to_notify_id": Assignee_list[i].emp_id,
            "notifier": localStorage.getItem('Id'),
            "module_name": "Project and Jobs",
            "sub_module_name": "Job",
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

      } else if (data.map.statusMessage == "Success") {
        await this.utilsService.openSnackBarAC("Job added successfully", "OK");
        this.selectedProjectEvent(this.selectedProjectId);
        if (!this.editorSave) {
          // this.jobsFormGroup.reset();
          // this.AssigneeCtrl.reset();
          this.router.navigate(["/jobs"]);
        }

        for (let i = 0; i < Assignee_list.length; i++) {
          let message = '<p style="font-size: 14px !important; line-height:20px;">You have been assigned in <span style="background-color: #46464d; border-radius: 4px; color: white; padding: 0px 5px 2px 5px; font-weight: 400; font-size: 12px !important;">' + job + '</span> job on the <span style="background-color: #2e7f35; border-radius: 4px; color: white; padding: 0px 5px; font-weight: 400;font-size: 12px !important;"> ' + project + '</span> project</p>';
          let formdata = {
            "org_id": localStorage.getItem('OrgId'),
            "message": message,
            "to_notify_id": Assignee_list[i].emp_id,
            "notifier": localStorage.getItem('Id'),
            "module_name": "Project and Jobs",
            "sub_module_name": "Job",
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
      else {
        await this.utilsService.openSnackBarMC(data.map.data, "OK");
        this.selectedProjectEvent(this.selectedProjectId);
      }
      if (this.editorSave) {
        this.jobsFormGroup.reset();
        this.billCtrl.reset();
        this.description.reset();
        this.spinner.hide();
      }
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
    })
    if (this.editorSave) {
      this.jobsFormGroup.reset();
    }
  }
  // keep form section
  editorSave: boolean = false;
  keepEditor(event) {
    if (event.checked == true) {
      this.editorSave = true;
    } else {
      this.editorSave = false;
    }

  }
  jobAssigneeIds = [];
  jobAssigneeRph = [];
  jobAssigneehours = [];
  jobAssigneecost = [];
  formValues() {
    this.spinner.show();
    this.jobsService.getJobDetailsById(this.jobId).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        let jobdata = JSON.parse(data.map.data);
        let jobAssigneeDetails: any[] = jobdata.jobAssigneeDetails;
        for (let i = 0; i < jobAssigneeDetails.length; i++) {
          this.jobAssigneeIds.push(jobAssigneeDetails[i].employeeDetails.id);
          this.jobAssigneeRph.push(jobAssigneeDetails[i].rate_per_hour);
          this.jobAssigneehours.push(jobAssigneeDetails[i].assignee_hours);
          this.jobAssigneecost.push(jobAssigneeDetails[i].assignee_cost);
        }
        if (jobdata.start_date) {
          let st_date = new Date(jobdata.start_date);
          this.jobsFormGroup.get('s_date').setValue(st_date);
        }
        if (jobdata.end_date) {
          let ed_date = new Date(jobdata.end_date);
          this.jobsFormGroup.get('e_date').setValue(ed_date);
        }
        this.getJobsName(jobdata.project_id);
        this.projectCtrl.setValue(jobdata.project_id);
        this.jobsFormGroup.get('job_name').setValue(jobdata.job_name);
        this.jobsFormGroup.get('hours').setValue(jobdata.hours);
        this.jobsFormGroup.get('rate_per_hour').setValue(jobdata.rate_per_hour);
        this.description.setValue(jobdata.description);
        this.billCtrl.setValue(jobdata.bill);
        setTimeout(() => {
          this.spinner.hide();
        }, 2000)
      } else {
        setTimeout(() => {
          this.spinner.hide();
        }, 2000)
      }
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
    })
  }
  // ***********For dublicate job name validation under same project**************
  activeJobNameList: any = [];
  isjobNameAvail: Boolean = false;
  getJobsName(projectId) {
    let tempData;
    this.activeJobNameList = [];
    tempData = [];
    let orgId = localStorage.getItem("OrgId");
    this.jobsService.getActiveJobNameWithProject_idName(orgId).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        let response = JSON.parse(data.map.data);
        tempData = response.filter(a => a.project_id == projectId);
        for (let i = 0; i < tempData.length; i++) {
          this.activeJobNameList.push(tempData[i].job_name);
        }
        if (this.isIdAvailable) {
          for (let i = 0; i < this.activeJobNameList.length; i++) {
            if (this.jobsFormGroup.get('job_name').value == this.activeJobNameList[i]) {
              this.activeJobNameList.splice(i, 1);
            }
          }
          this.isIdAvailable = false;
        }
      }
    })
  }
  // To check the project name is already exist or not
  jobNameCheck(event) {
    if (this.jobsFormGroup.value.job_name) {
      if (this.activeJobNameList.find(x => x.toLowerCase() == event.toLowerCase()))
        this.isjobNameAvail = true;
      else this.isjobNameAvail = false;
    }
  }
  Assignees: any[] = []
  updateJob() {
    this.spinner.show();
    let orgId = localStorage.getItem("OrgId");
    let zone = moment.tz.guess();
    let data: Object = {
      "id": this.jobId,
      "org_id": orgId,
      "job_name": this.jobsFormGroup.value.job_name,
      "project_id": this.selectedProjectId,
      "start_date": this.jobsFormGroup.value.s_date,
      "end_date": this.jobsFormGroup.value.e_date,
      "hours": this.jobsFormGroup.value.hours,
      "rate_per_hour": this.jobsFormGroup.value.rate_per_hour,
      "description": this.description.value,
      "bill": this.billCtrl.value,
      "assignees": this.assigneeList,
      "timezone": zone,
    }
    this.jobsService.updateJob(data).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        let job = this.jobsFormGroup.value.job_name;
        let project = this.ProjectstringName;
        job = job.charAt(0).toUpperCase() + job.slice(1);
        project = project.charAt(0).toUpperCase() + project.slice(1);
        for (let i = 0; i < this.assigneeList.length; i++) {
          if (!this.oldAssigneeIds.includes(this.assigneeList[i].emp_id)) {
            let message = '<p style="font-size: 14px !important; line-height:20px;">You have been assigned in <span style="background-color: #46464d; border-radius: 4px; color: white; padding: 0px 5px 2px 5px; font-weight: 400; font-size: 12px !important;">' + job + '</span> job on the <span style="background-color: #2e7f35; border-radius: 4px; color: white; padding: 0px 5px; font-weight: 400;font-size: 12px !important;"> ' + project + '</span> project</p>';
            let formdata = {
              "org_id": localStorage.getItem('OrgId'),
              "message": message,
              "to_notify_id": this.assigneeList[i].emp_id,
              "notifier": localStorage.getItem('Id'),
              "module_name": "Project and Jobs",
              "sub_module_name": "Job",
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
        // *************removed user notification ************
        for (let g = 0; g < this.assigneeList.length; g++) {
          this.Assignees.push(this.assigneeList[g].emp_id)
        }
        for (let i = 0; i < this.jobAssigneeIds.length; i++) {
          if (!this.Assignees.includes(this.jobAssigneeIds[i])) {
            let message = '<p style="font-size: 14px !important; line-height:20px;">You have been unassigned in <span style="background-color: #46464d; border-radius: 4px; color: white; padding: 0px 5px 2px 5px; font-weight: 400; font-size: 12px !important;">' + job + '</span> job on the <span style="background-color: #2e7f35; border-radius: 4px; color: white; padding: 0px 5px; font-weight: 400; font-size: 12px !important;"> ' + project + '</span> project</p>';
            let formdata = {
              "org_id": localStorage.getItem('OrgId'),
              "message": message,
              "to_notify_id": this.jobAssigneeIds[i],
              "notifier": localStorage.getItem('Id'),
              "module_name": "Project and Jobs",
              "sub_module_name": "Job",
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
        this.utilsService.openSnackBarAC("Job updated successfully", "OK");
        setTimeout(() => {
          this.router.navigate(["/jobs"]);
          // localStorage.removeItem('assigneeIds');
          // localStorage.removeItem('assigneeRph');
          this.removeLocal();
        }, 1000);
      }
      else {
        this.utilsService.openSnackBarMC("Failed to update job", "OK");
      }
      this.spinner.hide();
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
    })
  }
  setProjectId() {
    if (sessionStorage.getItem("projectId")) {
      this.TTJobName = sessionStorage.getItem("TT-jobName");
      let projectId;
      projectId = sessionStorage.getItem("projectId");
      setTimeout(() => {
        this.projectCtrl.setValue(Math.floor(projectId));
        this.getEmpDetailsByProjectId(projectId);
        this.getJobsName(projectId);
      }, 500);
      setTimeout(() => {
        if(this.TTJobName != "null"){
          this.jobsFormGroup.get('job_name').setValue(this.TTJobName);
          this.jobNameCheck(this.TTJobName);
        }
      }, 800);
      // sessionStorage.removeItem("projectId");
    }
  }

  //*****************Select and unselect function the dropdown menus statrt************//

  @ViewChild('select', { static: true }) select: MatSelect;
  allSelected = false;
  toggleAllSelection() {
    if (this.allSelected) {
      this.select.options.forEach((item: MatOption) => item.select());
    } else {
      this.select.options.forEach((item: MatOption) => item.deselect());
    }
  }

  @ViewChild('updatejob', { static: true }) updatejob: MatSelect;
  allSelectedjob = false;
  toggleAllSelectionjob() {
    if (this.allSelectedjob) {
      this.updatejob.options.forEach((item: MatOption) => item.select());
    } else {
      this.updatejob.options.forEach((item: MatOption) => item.deselect());
    }
  }
  //*****************Select and unselect function the dropdown menus end************//
}
