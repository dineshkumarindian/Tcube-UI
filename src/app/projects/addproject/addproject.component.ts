import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MatSelect } from '@angular/material/select';
import { MatOption } from '@angular/material/core';
import { ActivatedRoute, Router } from '@angular/router';
import moment from 'moment-timezone';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { NgxSpinnerService } from 'ngx-spinner';
import { ReplaySubject, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ProjectsService } from 'src/app/services/projects.service';
import { SettingsService } from 'src/app/services/settings.service';
import { UtilService } from 'src/app/services/util.service';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { errorMessage, alreadyExistMessage, characterLength, validFormat } from '../../util/constants';
import { NotificationService } from 'src/app/services/notification.service';

var CKEDITOR: any;
@Component({
  selector: 'app-addproject',
  templateUrl: './addproject.component.html',
  styleUrls: ['./addproject.component.less']
})
export class AddprojectComponent implements OnInit {
  /** list of client */

  selectedProjectId: any;
  protected client: any[] = [
    { name: 'Seyontec', id: 1 },
    { name: 'ServXGlobal', id: 2 },
    { name: 'ITAG', id: 3 },
    { name: 'TSRI', id: 4 },

  ];

  /** list of head */
  protected head: any[] = [
    { name: 'Prabhu', id: 1 },
    { name: 'JaiShree', id: 2 },
    { name: 'Rio', id: 3 }

  ];

  /** control for the selected clien */
  public clientCtrl: UntypedFormControl = new UntypedFormControl("", [Validators.required]);

  /** control for the MatSelect filter keyword */
  public clientFilterCtrl: UntypedFormControl = new UntypedFormControl();

  /** list of client filtered by search keyword */
  public filteredclient: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);

  /** control for the selected head */
  public headCtrl: UntypedFormControl = new UntypedFormControl("", [Validators.required]);

  /** control for the MatSelect filter keyword */
  public headFilterCtrl: UntypedFormControl = new UntypedFormControl();

  /** list of head filtered by search keyword */
  public filteredhead: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);

  /** control for the selected manager */
  public managerCtrl: UntypedFormControl = new UntypedFormControl("", [Validators.required]);

  /** control for the MatSelect filter keyword */
  public managerFilterCtrl: UntypedFormControl = new UntypedFormControl();

  /** list of head filtered by search keyword */
  public filteredmanager: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);
  /** control for the selected user */
  public userCtrl: UntypedFormControl = new UntypedFormControl("", [Validators.required]);

  /** control for the description */
  description = new UntypedFormControl('', [Validators.required, Validators.maxLength(5000)]);
  /** control for the MatSelect filter keyword */
  public userFilterCtrl: UntypedFormControl = new UntypedFormControl();

  /** list of head filtered by search keyword */
  public filtereduser: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);

  @ViewChild('singleSelect', { static: true }) singleSelect: MatSelect;

  /** Subject that emits when the component has been destroyed. */
  protected _onDestroy = new Subject<void>();
  clientDetails: any[];
  jobsFormGroup: any;
  selectedclient: string = '';
  @Output()
  open: EventEmitter<any> = new EventEmitter();
  Editor = ClassicEditor;
  ckconfig = {};
  requiredMessage = errorMessage;
  existMessage = alreadyExistMessage;
  characterLength = characterLength;
  whiteSpaceMessage = validFormat;
  loginurl: string;
  modifiedstring: string;
  projectsstr: string;
  projects_str: string;

  public onReady(editor: any) {

    editor.ui.getEditableElement().parentElement.insertBefore(
      editor.ui.view.toolbar.element,
      editor.ui.getEditableElement()
    );
  }


  constructor(private settingsService: SettingsService,
    private formBuilder: UntypedFormBuilder,
    private utilsService: UtilService,
    private router: Router,
    private projectsService: ProjectsService,
    private spinner: NgxSpinnerService,
    private notificationService: NotificationService,
    private activatedRoute: ActivatedRoute,) {
    this.loginurl = window.location.href;
    this.modifiedstring = this.loginurl.slice(0, this.loginurl.length - 10);
    this.projectsstr = "projects";
    this.projects_str = this.modifiedstring.concat(this.projectsstr.toString());

  }
  orgAdminId: any;
  employeeDetails: any = [];
  managerdropdownList = [];
  managerDetails = [];
  userDetails = [];
  managerselectedItems = [];
  updatemanagerselectedItems = [];
  updateUsersselectedItems = [];
  usersdropdownList = [];
  usersselectedItems = [];
  showmanager: boolean = false;
  showusers: boolean = false;
  dropdownsettings: IDropdownSettings = {};
  managerlist = [];
  userlist = [];
  projectId: any;
  isProjectIdAvailable: boolean = false;
  managersIds: any[] = [];
  managersRph: any[] = [];
  usersIds: any[] = [];
  usersRph: any[] = [];
  activeProjectNameList: any = [];
  isIdAvailable: boolean = false;
  isPjtNmeAvail: Boolean = false;
  isClientCountZoro: Boolean = false;
  // clientdropdownList = [];
  // clientselectedItems = [];
  // headdropdownList = [];
  // headselectedItems = [];

  selectedValue: string;
  // clients: any[] = [
  //   {value: 'COI-SILM'},
  //   {value: 'COI-PAM'},
  //   {value: 'KISDEVOPS'},
  //   {value: 'STAFFING-RDM'}
  // ];
  heads: any[] = [
    { value: 'Prabhu' },
    { value: 'Jaishree' },
    { value: 'Rio' }
  ];

  TTRedirectedProjectName:string = "";

  managerfunction(event) {
    this.managerlist = [];
    this.managerDetails = [];
    for (let i = 0; i < this.managerselectedItems.length; i++) {

      if (this.managerselectedItems[i] != undefined) {
        this.managerlist.push({ name: this.managerselectedItems[i].firstname + " " + this.managerselectedItems[i].lastname, rph: '0' });
        this.managerDetails.push({ emp_id: this.managerselectedItems[i].id, rph: '0' })
      }
    }
    if (this.managerlist.length == this.employeeDetails.length) {
      this.allSelected = true;
    }
    else {
      this.allSelected = false;
    }
    if (this.managerselectedItems.length > 0) {
      this.showmanager = true;
    }
    else {
      this.showmanager = false;
    }
  }

  @ViewChild('select', { static: true }) select: MatSelect;
  allSelected = false;
  toggleAllSelection() {
    if (this.allSelected) {
      this.select.options.forEach((item: MatOption) => item.select());
    } else {
      this.select.options.forEach((item: MatOption) => item.deselect());
    }
  }

  //------------ update for project user function start -------------------//

  @ViewChild('updateproject', { static: true }) updateproject: MatSelect;
  allSelectedManager = false;
  SelectionManagerUpdate() {
    // console.log(this.allSelectedjob);

    if (this.allSelectedManager) {
      this.updateproject.options.forEach((item: MatOption) => item.select());
    } else {
      this.updateproject.options.forEach((item: MatOption) => item.deselect());
    }
  }

  managerData = [];
  updateManagerfunction(event) {
    this.managerlist = [];
    this.managerDetails = [];
    this.managerData = [];
    for (let i = 0; i < this.updatemanagerselectedItems.length; i++) {
      for (let j = 0; j < this.employeeDetails.length; j++) {
        if (this.employeeDetails[j].id == this.updatemanagerselectedItems[i]) {
          this.managerData.push(this.employeeDetails[j]);
        }
      }
    }
    // console.log(this.managerData);
    // console.log("length -->" + this.managerData.length);

    for (let i = 0; i < this.managerData.length; i++) {
      this.managerlist.push({ name: this.managerData[i].firstname + " " + this.managerData[i].lastname, rph: '0' });
      this.managerDetails.push({ emp_id: this.managerData[i].id, rph: '0' })
    }
    // console.log(this.managerDetails);
    // if again select the manager => set the previus rph
    for (let i = 0; i < this.projectManager.length; i++) {
      for (let j = 0; j < this.managerlist.length; j++) {
        if (this.managerDetails[j].emp_id == this.projectManager[i]) {
          this.managerDetails[j].rph = this.managerRph[i];
          this.managerlist[j].rph = this.managerRph[i];
        }
      }
    }
    if (this.managerlist.length == this.employeeDetails.length) {
      this.allSelectedManager = true;
    }
    else {
      this.allSelectedManager = false;
    }
    if (this.updatemanagerselectedItems.length > 0) {
      this.showmanager = true;
    }
    else {
      this.showmanager = false;
    }
  }
  //------------ update for project user function end  -------------------//


  ///To select and unselect all user in Project Users start

  @ViewChild('userselect', { static: true }) userselect: MatSelect;
  allSelecteduser = false;
  toggleAllSelectionuser() {
    if (this.allSelecteduser) {
      this.userselect.options.forEach((item: MatOption) => item.select());
    } else {
      this.userselect.options.forEach((item: MatOption) => item.deselect());
    }
  }
  usersfunction(event) {
    this.userlist = [];
    this.userDetails = [];
    for (let i = 0; i < this.usersselectedItems.length; i++) {
      if (this.usersselectedItems[i] != undefined) {
        this.userlist.push({ name: this.usersselectedItems[i].firstname + " " + this.usersselectedItems[i].lastname, rph: '0' });
        this.userDetails.push({ emp_id: this.usersselectedItems[i].id, rph: '0' });
      }
    }
    if (this.userlist.length == this.employeeDetails.length) {
      this.allSelecteduser = true;
    }
    else {
      this.allSelecteduser = false;
    }
    if (this.usersselectedItems.length > 0) {
      this.showusers = true;
    }
    else {
      this.showusers = false;
    }
  }
  ///To select and unselect all user in Project Users end

  ///-------  To select and unselect all update user in Project Users start ----///


  @ViewChild('updateuser', { static: true }) updateuser: MatSelect;
  allSelectedupdate = false;
  toggleAllSelectionupdateuser() {
    // console.log(this.allSelectedjob);
    if (this.allSelectedupdate) {
      this.updateuser.options.forEach((item: MatOption) => item.select());
    } else {
      this.updateuser.options.forEach((item: MatOption) => item.deselect());
    }
  }
  userData = [];
  UpdateUsersfunction(event) {
    // console.log(this.updateUsersselectedItems);
    this.userlist = [];
    this.userDetails = [];
    this.userData = [];
    for (let i = 0; i < this.updateUsersselectedItems.length; i++) {
      for (let j = 0; j < this.employeeDetails.length; j++) {
        if (this.employeeDetails[j].id == this.updateUsersselectedItems[i]) {
          this.userData.push(this.employeeDetails[j]);
        }
      }
    }
    // console.log(this.userData);

    for (let i = 0; i < this.userData.length; i++) {
      this.userlist.push({ name: this.userData[i].firstname + " " + this.userData[i].lastname, rph: '0' });
      this.userDetails.push({ emp_id: this.userData[i].id, rph: '0' });
    }

    // if again select the user => set the previus rph
    for (let i = 0; i < this.teamMemberToSet.length; i++) {
      for (let j = 0; j < this.userlist.length; j++) {
        if (this.userDetails[j].emp_id == this.teamMemberToSet[i]) {
          this.userDetails[j].rph = this.teamMemberRph[i];
          this.userlist[j].rph = this.teamMemberRph[i];
        }
      }
    }
    if (this.userlist.length == this.employeeDetails.length) {
      this.allSelectedupdate = true;
    }
    else {
      this.allSelectedupdate = false;
    }
    if (this.updateUsersselectedItems.length > 0) {
      this.showusers = true;
    }
    else {
      this.showusers = false;
    }

  }
  rphchangemanager(i: number, value: any) {
    this.managerlist[i].rph = value;
    this.managerDetails[i].rph = value;
    // console.log(this.managerlist);
    // console.log(this.managerDetails);
  }
  rphchangeuser(i: number, value: any) {
    this.userlist[i].rph = value;
    this.userDetails[i].rph = value;
    // console.log(this.userlist);
    // console.log(this.userDetails);
  }
  // onSelectAll(items: any) {
  //   console.log(items);
  // }
  // onItemSelect(items: any) {
  //   console.log(items);
  // }

  projectFormGroup: UntypedFormGroup = this.formBuilder.group({
    project_name: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9](.*[a-zA-Z0-9])?$/)]],
    description: [''],
    cost: [''],
    head_rph: ['0'],
    s_date: [''],
    e_date: [''],
    // head_rph: ['', [Validators.required]],
    // manager_rph: ['', [Validators.required]],

  })

  ngOnInit() {
    this.TTRedirectedProjectName =  sessionStorage.getItem("TT-projectName");
    this.geEmployeeDetailsByOrgId();
    this.getActiveClientDetailsByOrgId();
    this.projectId = this.activatedRoute.snapshot.params.id;
    if (this.projectId) {
      let mIds = localStorage.getItem("managerIds");
      let mRph = localStorage.getItem("managerRph");
      let uIds = localStorage.getItem("UserIds");
      let uRph = localStorage.getItem("UserRph");
      this.managersIds = JSON.parse(mIds);
      this.managersRph = JSON.parse(mRph);
      this.usersIds = JSON.parse(uIds);
      this.usersRph = JSON.parse(uRph);
      this.isIdAvailable = true;
      this.formValues();
      this.isProjectIdAvailable = true;
    } else {
      this.isProjectIdAvailable = false;
    }

    this.usersdropdownList = [
      { item_id: 1, item_text: 'Hari' },
      { item_id: 2, item_text: 'Bala' },
      { item_id: 3, item_text: 'Rio' },
      { item_id: 4, item_text: 'Vikram' },
      { item_id: 5, item_text: 'Sudharsan' }
    ];
    this.managerselectedItems = [];
    this.usersselectedItems = [];
    this.dropdownsettings = {
      singleSelection: false,
      idField: 'item_id',
      textField: 'item_text',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      itemsShowLimit: 10,
      allowSearchFilter: true
    };

    // load the initial head list
    this.filteredhead.next(this.head.slice());

    // listen for search field value changes
    this.headFilterCtrl.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        this.filterhead();
      });

    this.getActiveProjectNameList();
  }


  protected filterclient() {
    if (!this.clientDetails) {
      return;
    }
    // get the search keyword
    let search = this.clientFilterCtrl.value;
    if (!search) {
      this.filteredclient.next(this.clientDetails.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
    // filter the client
    this.filteredclient.next(
      this.clientDetails.filter(client => client.client_name.toLowerCase().indexOf(search) > -1)
    );
  }

  protected filterhead() {
    if (!this.employeeDetails) {
      return;
    }
    // get the search keyword
    let search = this.headFilterCtrl.value;
    if (!search) {
      this.filteredhead.next(this.employeeDetails.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
    // filter the head
    this.filteredhead.next(
      this.employeeDetails.filter(head => head.firstname.toLowerCase().indexOf(search) > -1)
    );
  }
  protected filtermanager() {
    if (!this.employeeDetails) {
      return;
    }
    // get the search keyword
    let search = this.managerFilterCtrl.value;
    if (!search) {
      this.filteredmanager.next(this.employeeDetails.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
    // filter the head
    this.filteredmanager.next(
      this.employeeDetails.filter(head => head.firstname.toLowerCase().indexOf(search) > -1)
    );
  }
  protected filteruser() {
    if (!this.employeeDetails) {
      return;
    }
    // get the search keyword
    let search = this.userFilterCtrl.value;
    if (!search) {
      this.filtereduser.next(this.employeeDetails.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
    // filter the head
    this.filtereduser.next(
      this.employeeDetails.filter(head => head.firstname.toLowerCase().indexOf(search) > -1)
    );
  }

  setHeadRph() {
    // console.log("true");
    this.projectFormGroup.get('head_rph').setValue(0);
  }
  // empAdminDetails:any[]=[];
  // empUserDetails:any[]=[];
  geEmployeeDetailsByOrgId() {
    let orgId = localStorage.getItem("OrgId");
    //before used method --> getActiveEmpDetailsByOrgId()
    //Here I have used the get ACTIVE EMPLOYEE DETAILS API call --> Means its get all user details under the Organization Id
    this.settingsService.getCustomActiveEmpDetailsByOrgID(orgId).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        let response: any[] = JSON.parse(data.map.data);
        this.employeeDetails = response;

        for (let i = 0; i < this.employeeDetails.length; i++) {
          if(this.employeeDetails[i].role == "OrgAdmin") {
          this.orgAdminId= this.employeeDetails[i].id;
          }
          this.managerdropdownList.push({ item_id: this.employeeDetails[i].id, item_text: this.employeeDetails[i].firstname + " " + this.employeeDetails[i].lastname });
        }
        
        // load the initial head list
        this.filteredhead.next(this.employeeDetails.slice());

        // listen for search field value changes
        this.headFilterCtrl.valueChanges
          .pipe(takeUntil(this._onDestroy))
          .subscribe(() => {
            this.filterhead();
          });
        // load the initial manager list
        this.filteredmanager.next(this.employeeDetails.slice());

        // listen for search field value changes
        this.managerFilterCtrl.valueChanges
          .pipe(takeUntil(this._onDestroy))
          .subscribe(() => {
            this.filtermanager();
          });

        // load the initial user list
        this.filtereduser.next(this.employeeDetails.slice());

        // listen for search field value changes
        this.userFilterCtrl.valueChanges
          .pipe(takeUntil(this._onDestroy))
          .subscribe(() => {
            this.filteruser();
          });
      }
      this.setResourceDetails();
      // for(let i=0; i<this.employeeDetails.length; i++){
      //   if(this.employeeDetails.role == "admin" || this.employeeDetails.role == "Admin" ){
      //     this.empAdminDetails.push(this.employeeDetails[i]);
      //   }else this.empUserDetails.push(this.employeeDetails[i])
      // }
      // console.log(this.empAdminDetails);
      // console.log(this.empUserDetails);
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
    })
  }
  setResourceDetails() {
    this.spinner.show();

    setTimeout(() => {
      this.managerCtrl.setValue(this.managersIds);
      this.updatemanagerselectedItems = this.managersIds;
      for (let i = 0; i < this.managersRph.length; i++) {
        this.managerlist[i].rph = this.managersRph[i];
        this.managerDetails[i].rph = this.managersRph[i];
      }
    }, 500);

    setTimeout(() => {
      this.userCtrl.setValue(this.usersIds);
      this.usersselectedItems = this.usersIds;
      for (let i = 0; i < this.usersRph.length; i++) {
        this.userlist[i].rph = this.usersRph[i];
        this.userDetails[i].rph = this.usersRph[i];
      }
    }, 500);
    setTimeout(() => {
      this.spinner.hide();
    }, 2000);
  }

  //Get client details 
  getActiveClientDetailsByOrgId() {
    let OrgId = localStorage.getItem("OrgId");
    this.settingsService.getActiveClientDetailsByOrgId(OrgId).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        let response: any[] = JSON.parse(data.map.data);
        this.clientDetails = response;
        // console.log(this.clientDetails);
        if (this.clientDetails.length == 0) {
          this.isClientCountZoro = true;
        } else {
          this.isClientCountZoro = false;
        }
        // load the initial client list
        this.filteredclient.next(this.clientDetails.slice());

        // listen for search field value changes
        this.clientFilterCtrl.valueChanges
          .pipe(takeUntil(this._onDestroy))
          .subscribe(() => {
            this.filterclient();
          });

      }
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
    })
  }

  // create project
  async addProject() {
    this.spinner.show();
    let orgId = localStorage.getItem("OrgId");
    let zone = moment.tz.guess();
    let data: Object = {
      "org_id": orgId,
      "project_name": this.projectFormGroup.value.project_name,
      "project_id": this.selectedProjectId,
      "start_date": this.projectFormGroup.value.s_date,
      "end_date": this.projectFormGroup.value.e_date,
      "project_cost": this.projectFormGroup.value.cost,
      "client_id": this.clientCtrl.value,
      "project_head_id": this.headCtrl.value,
      "project_head_rph": this.projectFormGroup.value.head_rph,
      "description": this.description.value,
      "project_manager_details": this.managerDetails,
      "resource_details": this.userDetails,
      "timezone": zone,
      "projects_url": this.projects_str
    }

    let project = this.projectFormGroup.value.project_name;
    project = project.charAt(0).toUpperCase() + project.slice(1);
    await this.projectsService.createProject(data).subscribe(async data => {
      if(data.map.statusMessage == "Success" && data.map.Error == "Error in sending details due to invalid mail check the configuration details") {
          // send notification with mail expired info message
    let zone = moment.tz.guess();
    let message =
    "Mail configuration issue encountered while creating project.";
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
  
         let PHmessage = '<p style="font-size: 14px !important; line-height:20px;">You have been assigned as <span style="background-color: #29c7be; border-radius: 4px; color: white; padding: 0px 5px 2px 5px; font-weight: 400;font-size: 12px !important;">project head</span> in <span style="background-color: #2e7f35; border-radius: 4px; color: white; padding: 0px 5px; font-weight: 400; font-size: 12px !important;">' + project + '</span> project</p>';
         let PHformdata = {
           "org_id": localStorage.getItem('OrgId'),
           "message": PHmessage,
           "to_notify_id": this.headCtrl.value,
           "notifier": localStorage.getItem('Id'),
           "module_name": "Project and Jobs",
           "sub_module_name": "Project",
           "date_of_request": moment(new Date()).format("YYYY-MM-DD"),
           "approval_status": "Approved",
           "timezone": zone
         }
         this.notificationService.postNotification(PHformdata).subscribe(data => {
           if (data.map.statusMessage == "Success") {
           }
           else {
           }
         })
 
         for (let i = 0; i < this.managerDetails.length; i++) {
           let PMmessage = '<p style="font-size: 14px !important; line-height:20px;">You have been assigned as <span style="background-color: #29c7be; border-radius: 4px; color: white; padding: 0px 5px 2px 5px; font-weight: 400;font-size: 12px !important;">project manager</span> in <span style="background-color: #2e7f35; border-radius: 4px; color: white; padding: 0px 5px; font-weight: 400; font-size: 12px !important;">' + project + '</span> project</p>';
           let formdata = {
             "org_id": localStorage.getItem('OrgId'),
             "message": PMmessage,
             "to_notify_id": this.managerDetails[i].emp_id,
             "notifier": localStorage.getItem('Id'),
             "module_name": "Project and Jobs",
             "sub_module_name": "Project",
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
         for (let i = 0; i < this.userDetails.length; i++) {
           let message = '<p style="font-size: 14px !important; line-height:20px;">You have been assigned in <span style="background-color: #2e7f35; border-radius: 4px; color: white; padding: 0px 5px; font-weight: 400; font-size: 12px !important;">' + project + '</span> project</p>';
           let formdata = {
             "org_id": localStorage.getItem('OrgId'),
             "message": message,
             "to_notify_id": this.userDetails[i].emp_id,
             "notifier": localStorage.getItem('Id'),
             "module_name": "Project and Jobs",
             "sub_module_name": "Project",
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
         // this.resetform();
         await this.utilsService.openSnackBarAC("Project added successfully", "OK");
         this.spinner.hide();
         setTimeout(() => {
           this.router.navigate(["/projects"]);
         }, 200);
    }else if (data.map.statusMessage == "Success") {
        let PHmessage = '<p style="font-size: 14px !important; line-height:20px;">You have been assigned as <span style="background-color: #29c7be; border-radius: 4px; color: white; padding: 0px 5px 2px 5px; font-weight: 400;font-size: 12px !important;">project head</span> in <span style="background-color: #2e7f35; border-radius: 4px; color: white; padding: 0px 5px; font-weight: 400; font-size: 12px !important;">' + project + '</span> project</p>';
        let PHformdata = {
          "org_id": localStorage.getItem('OrgId'),
          "message": PHmessage,
          "to_notify_id": this.headCtrl.value,
          "notifier": localStorage.getItem('Id'),
          "module_name": "Project and Jobs",
          "sub_module_name": "Project",
          "date_of_request": moment(new Date()).format("YYYY-MM-DD"),
          "approval_status": "Approved",
          "timezone": zone
        }
        this.notificationService.postNotification(PHformdata).subscribe(data => {
          if (data.map.statusMessage == "Success") {
          }
          else {
          }
        })

        for (let i = 0; i < this.managerDetails.length; i++) {
          let PMmessage = '<p style="font-size: 14px !important; line-height:20px;">You have been assigned as <span style="background-color: #29c7be; border-radius: 4px; color: white; padding: 0px 5px 2px 5px; font-weight: 400;font-size: 12px !important;">project manager</span> in <span style="background-color: #2e7f35; border-radius: 4px; color: white; padding: 0px 5px; font-weight: 400; font-size: 12px !important;">' + project + '</span> project</p>';
          let formdata = {
            "org_id": localStorage.getItem('OrgId'),
            "message": PMmessage,
            "to_notify_id": this.managerDetails[i].emp_id,
            "notifier": localStorage.getItem('Id'),
            "module_name": "Project and Jobs",
            "sub_module_name": "Project",
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
        for (let i = 0; i < this.userDetails.length; i++) {
          let message = '<p style="font-size: 14px !important; line-height:20px;">You have been assigned in <span style="background-color: #2e7f35; border-radius: 4px; color: white; padding: 0px 5px; font-weight: 400; font-size: 12px !important;">' + project + '</span> project</p>';
          let formdata = {
            "org_id": localStorage.getItem('OrgId'),
            "message": message,
            "to_notify_id": this.userDetails[i].emp_id,
            "notifier": localStorage.getItem('Id'),
            "module_name": "Project and Jobs",
            "sub_module_name": "Project",
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
        // this.resetform();
        await this.utilsService.openSnackBarAC("Project added successfully", "OK");
        this.spinner.hide();
        setTimeout(() => {
          this.router.navigate(["/projects"]);
        }, 200);
      }
      else {
        await this.utilsService.openSnackBarMC(data.map.data, "OK");
        this.spinner.hide();
      }

    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
    })
  }

  empData = [];
  geEmployeeDetailsId(id) {
    this.settingsService.getActiveEmpDetailsById(id).subscribe(data => {
      let response: any[] = JSON.parse(data.map.data);
      // console.log(response);
      this.empData.push(response);
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
    })
    // console.log(this.empData);
  }

  projectHead;
  headRph;
  projectManager = [];
  managerRph = [];
  teamMemberToSet = [];
  teamMemberRph = [];

  // Set the form values for update method
  CUR: any = "CUR";
  currencyid: any;
  // formValues() {
  //   this.spinner.show();
  //   this.projectsService.getActiveProjectDetailsById(this.projectId).subscribe(data => {
  //     if (data.map.statusMessage == "Success") {
  //       let projectdata = JSON.parse(data.map.data);
  //       console.log("611==>",projectdata);
  //       this.currencyid = projectdata.clientDetails.currency.substr(projectdata.clientDetails.currency.length - 3);
  //       this.CUR = this.currencyid;
  //       let projectResource: any[] = projectdata.resourceDetails;

  //       for (let i = 0; i < projectResource.length; i++) {
  //         if (i == 0) {
  //           this.projectHead = projectResource[0].employeeDetails.id;
  //           this.headRph = projectResource[0].rate_per_hour;
  //         }
  //         else if (projectResource[i].designation == "project_manager") {
  //           this.projectManager.push(projectResource[i].employeeDetails.id);
  //           this.managerRph.push(projectResource[i].rate_per_hour);
  //         } else {
  //           this.teamMemberToSet.push(projectResource[i].employeeDetails.id);
  //           this.teamMemberRph.push(projectResource[i].rate_per_hour)
  //         }
  //       }

  //       let st_date, ed_date;
  //       if (projectdata.start_date != undefined) {
  //         st_date = new Date(projectdata.start_date);
  //       }
  //       else {
  //         st_date = '';
  //       }
  //       if (projectdata.end_date != undefined) {
  //         ed_date = new Date(projectdata.end_date);
  //       }
  //       else {
  //         ed_date = '';
  //       }
  //       this.projectFormGroup.get('project_name').setValue(projectdata.project_name);
  //       this.projectFormGroup.get('s_date').setValue(st_date);
  //       this.projectFormGroup.get('e_date').setValue(ed_date);
  //       this.description.setValue(projectdata.description);
  //       this.projectFormGroup.get('cost').setValue(projectdata.project_cost);
  //       this.clientCtrl.setValue(projectdata.clientDetails.id);
  //       this.headCtrl.setValue(this.projectHead);
  //       this.projectFormGroup.get('head_rph').setValue(this.headRph);

  //       // setTimeout(() => {
  //       //   this.managerCtrl.setValue(this.projectManager);
  //       //   this.updatemanagerselectedItems = this.projectManager;
  //       //   for (let i = 0; i < this.managerRph.length; i++) {
  //       //     this.managerlist[i].rph = this.managerRph[i];
  //       //     this.managerDetails[i].rph = this.managerRph[i];
  //       //   }
  //       // }, 1000);
  //       // setTimeout(() => {
  //       //   this.userCtrl.setValue(this.teamMemberToSet);
  //       //   this.usersselectedItems = this.teamMemberToSet;
  //       //   for (let i = 0; i < this.teamMemberRph.length; i++) {
  //       //     this.userlist[i].rph = this.teamMemberRph[i];
  //       //     this.userDetails[i].rph = this.teamMemberRph[i];
  //       //   }
  //       // }, 1000);
  //       this.spinner.hide();
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
  formValues() {
    this.spinner.show();
    this.projectsService.getProjectByReferenceId(this.projectId).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        let projectdata = JSON.parse(data.map.data);
        let projectResource: any[] = projectdata[0].resourceDetails;
        for (let i = 0; i < projectResource.length; i++) {
          if (i == 0) {
            this.projectHead = projectResource[0].map.id;
            this.headRph = projectResource[0].map.rate_per_hour;
          }
          else if (projectResource[i].designation == "project_manager") {
            this.projectManager.push(projectResource[i].map.id);
            this.managerRph.push(projectResource[i].map.rate_per_hour);
          } else {
            this.teamMemberToSet.push(projectResource[i].map.id);
            this.teamMemberRph.push(projectResource[i].map.rate_per_hour)
          }
        }

        let st_date, ed_date;
        if (projectdata[0].start_date != undefined) {
          st_date = new Date(projectdata[0].start_date);
        }
        else {
          st_date = '';
        }
        if (projectdata[0].end_date != undefined) {
          ed_date = new Date(projectdata[0].end_date);
        }
        else {
          ed_date = '';
        }
        this.projectFormGroup.get('project_name').setValue(projectdata[0].project_name);
        this.projectFormGroup.get('s_date').setValue(st_date);
        this.projectFormGroup.get('e_date').setValue(ed_date);
        this.description.setValue(projectdata[0].description);
        this.projectFormGroup.get('cost').setValue(projectdata[0].project_cost);
        // this.clientCtrl.setValue(projectdata[0].clientDetails.id);
        this.clientCtrl.setValue(projectdata[0].clientId);
        this.headCtrl.setValue(this.projectHead);
        this.projectFormGroup.get('head_rph').setValue(this.headRph);

        // setTimeout(() => {
        //   this.managerCtrl.setValue(this.projectManager);
        //   this.updatemanagerselectedItems = this.projectManager;
        //   for (let i = 0; i < this.managerRph.length; i++) {
        //     this.managerlist[i].rph = this.managerRph[i];
        //     this.managerDetails[i].rph = this.managerRph[i];
        //   }
        // }, 1000);
        // setTimeout(() => {
        //   this.userCtrl.setValue(this.teamMemberToSet);
        //   this.usersselectedItems = this.teamMemberToSet;
        //   for (let i = 0; i < this.teamMemberRph.length; i++) {
        //     this.userlist[i].rph = this.teamMemberRph[i];
        //     this.userDetails[i].rph = this.teamMemberRph[i];
        //   }
        // }, 1000);
        this.spinner.hide();
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
  // Update project
  async updateProject() {
    this.spinner.show();
    let orgId = localStorage.getItem("OrgId");
    let zone = moment.tz.guess();
    let data: Object = {
      "id": this.projectId,
      "org_id": orgId,
      "project_name": this.projectFormGroup.value.project_name,
      "project_cost": this.projectFormGroup.value.cost,
      "client_id": this.clientCtrl.value,
      "project_head_id": this.headCtrl.value,
      "project_head_rph": this.projectFormGroup.value.head_rph,
      "description": this.description.value,
      "project_manager_details": this.managerDetails,
      "resource_details": this.userDetails,
      "start_date": this.projectFormGroup.value.s_date,
      "end_date": this.projectFormGroup.value.e_date,
      "timezone": zone,
    }
    await this.projectsService.updateProject(data).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        let project = this.projectFormGroup.value.project_name;
        project = project.charAt(0).toUpperCase() + project.slice(1);
        if (this.projectHead != this.headCtrl.value) {
          let PHmessage = '<p style="font-size: 14px !important; line-height:20px;">You have been assigned as <span style="background-color: #29c7be; border-radius: 4px; color: white; padding: 0px 5px 2px 5px; font-weight: 400;font-size: 12px !important;" >project head</span> in <span style="background-color: #2e7f35; border-radius: 4px; color: white; padding: 0px 5px; font-weight: 400;font-size: 12px !important;">' + project + '</span> project</p>';
          let PHformdata = {
            "org_id": localStorage.getItem('OrgId'),
            "message": PHmessage,
            "to_notify_id": this.headCtrl.value,
            "notifier": localStorage.getItem('Id'),
            "module_name": "Project and Jobs",
            "sub_module_name": "Project",
            "date_of_request": moment(new Date()).format("YYYY-MM-DD"),
            "approval_status": "Approved",
            "timezone": zone
          }
          this.notificationService.postNotification(PHformdata).subscribe(data => {
            if (data.map.statusMessage == "Success") {
            }
            else {
            }
          })
        }


        for (let i = 0; i < this.managerDetails.length; i++) {
          if (!this.managersIds.includes(this.managerDetails[i].emp_id)) {
            let PMmessage = '<p style="font-size: 14px !important; line-height:20px;">You have been assigned as <span style="background-color: #29c7be; border-radius: 4px; color: white; padding: 0px 5px 2px 5px; font-weight: 400;font-size: 12px !important;">project manager</span> in <span style="background-color: #2e7f35; border-radius: 4px; color: white; padding: 0px 5px; font-weight: 400; font-size: 12px !important;">' + project + '</span> project</p>';
            let formdata = {
              "org_id": localStorage.getItem('OrgId'),
              "message": PMmessage,
              "to_notify_id": this.managerDetails[i].emp_id,
              "notifier": localStorage.getItem('Id'),
              "module_name": "Project and Jobs",
              "sub_module_name": "Project",
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
        for (let i = 0; i < this.userDetails.length; i++) {
          if (!this.usersIds.includes(this.userDetails[i].emp_id)) {
            let message = '<p style="font-size: 14px !important; line-height:20px;">You have been assigned in <span style="background-color: #2e7f35; border-radius: 4px; color: white; padding: 0px 5px; font-weight: 400; font-size: 12px !important;">' + project + '</span> project</p>';
            let formdata = {
              "org_id": localStorage.getItem('OrgId'),
              "message": message,
              "to_notify_id": this.userDetails[i].emp_id,
              "notifier": localStorage.getItem('Id'),
              "module_name": "Project and Jobs",
              "sub_module_name": "Project",
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
        // this.resetform();
        this.utilsService.openSnackBarAC("Project updated successfully", "OK");
        this.spinner.hide();

        setTimeout(() => {
          this.router.navigate(["/projects"]);
        }, 200);
      }
      else {
        this.utilsService.openSnackBarMC("Failed to update project", "OK");
        this.spinner.hide();

      }
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
    })
  }

  //event handler for the select element's change event
  // CUR: any = "CUR";
  // currencyid: any;
  selectChangeHandler(selectedclient) {
    //update the ui
    this.settingsService.getClientDetailsById(selectedclient).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        let response = JSON.parse(data.map.data);
        // this.projectFormGroup.get("cost").setValue(response.currency);
        // this.Dummy =response.currency;
        this.currencyid = response.currency.substr(response.currency.length - 3);
        this.CUR = this.currencyid;
      }
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
    })
  }

  // get the active projects name list by organization id
  getActiveProjectNameList() {
    this.spinner.show();
    this.projectsService.getActiveProjecttNameListByOrgId(localStorage.getItem("OrgId")).subscribe(projects => {
      if (projects.map.statusMessage == "Success") {
        this.activeProjectNameList = JSON.parse(projects.map.data);
      }
      this.spinner.hide();
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
    })
      if(this.TTRedirectedProjectName != "null"){
        this.projectFormGroup.get('project_name').setValue(this.TTRedirectedProjectName);
        setTimeout(() => {
        this.pjtNameCheck(this.TTRedirectedProjectName);
        }, 1000);
    }
  }

  // To check the project name is already exist or not
  pjtNameCheck(event) {
    if (this.isIdAvailable) {
      for (let i = 0; i < this.activeProjectNameList.length; i++) {
        if (this.projectFormGroup.get('project_name').value == this.activeProjectNameList[i]) {
          this.activeProjectNameList.splice(i, 1);
        }
      }
      this.isIdAvailable = false;
    }
    // check project name is already exist or not
    if (this.projectFormGroup.value.project_name) {
      if (this.activeProjectNameList.find(x => x.toLowerCase() == event.toLowerCase()))
        this.isPjtNmeAvail = true;
      else this.isPjtNmeAvail = false;
    }
  }


}


