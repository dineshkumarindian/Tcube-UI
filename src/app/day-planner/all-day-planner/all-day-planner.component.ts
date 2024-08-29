import { Component, OnInit, ViewChild } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { MatOption } from '@angular/material/core';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSelect } from '@angular/material/select';
import { DomSanitizer } from '@angular/platform-browser';
import moment from 'moment';
import { NgxSpinnerService } from 'ngx-spinner';
import { ReplaySubject, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { DayPlannerService } from 'src/app/services/day-planner/day-planner.service';
import { ExportService } from 'src/app/services/export.service';
import { LeaveTrackerService } from 'src/app/services/leave-tracker.service';
import { ProjectsService } from 'src/app/services/projects.service';
import { SettingsService } from 'src/app/services/settings.service';

@Component({
  selector: 'app-all-day-planner',
  templateUrl: './all-day-planner.component.html',
  styleUrls: ['./all-day-planner.component.less']
})
export class AllDayPlannerComponent implements OnInit {
  datepicker: UntypedFormControl;
  empId: any;
  orgId: any;
  todayDate: any;
  permanentTodayDate: any;
  empName: any;
  selectedDate: any;
  allDayTaskDetails: any = [];
  viewByData: any = ['Users', 'Projects', 'Status'];
  statusData: any = ['Todo', 'Inprogress', 'Done'];
  viewBy: UntypedFormControl = new UntypedFormControl('Users');
  status: UntypedFormControl = new UntypedFormControl();
  byStatus: boolean = false;
  byProjects: boolean = false;
  byUsers: boolean = true;
  showFilter: boolean = true;
  projectDetails: any = [];
  @ViewChild('select', { static: true }) select: MatSelect;
  allSelected = false;
  selecteduser: number = 0;
  protected _onDestroy = new Subject<void>();
  finalOutputData: any = [];
  finalEmptyData: any = [];
  todayLeaveList: any = [];

  //for project filter
  public project: UntypedFormControl = new UntypedFormControl();
  public projectFilterCtrl: UntypedFormControl = new UntypedFormControl();
  public filteredproject: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);
  public user: UntypedFormControl = new UntypedFormControl();
  public userFilterCtrl: UntypedFormControl = new UntypedFormControl();
  public filtereduser: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

  userDetails: any = [];
  noUsers: boolean = false;
  noProjects: boolean = false;
  // showStatusData: boolean = false;
  isnoTasksAvailable: boolean = false;
  showLoader: boolean = true;
  showMatChips: boolean = false;
  pageEvent: PageEvent;
  length = 20;
  pageSize = 10;
  constructor(
    public spinner: NgxSpinnerService,
    public dayPlannerService: DayPlannerService,
    public settingsService: SettingsService,
    public projectsService: ProjectsService,
    private domSanitizer: DomSanitizer,
    private exportservice: ExportService,
    private leavetrackerService: LeaveTrackerService,
  ) { }

  async ngOnInit() {
    this.empId = localStorage.getItem('Id');
    this.orgId = localStorage.getItem('OrgId');
    this.empName = localStorage.getItem('Name');
    this.todayDate = moment().toDate();
    this.permanentTodayDate = moment().format("YYYY-MM-DD");
    this.selectedDate = moment().format("YYYY-MM-DD");
    this.datepicker = new UntypedFormControl(new Date());
    // this.byUsers = true;
    await this.getAllDayTaskDetails();
    // this.getActiveEmpSpecificDetailsByOrgId();
    await this.getActiveProjectDetailsByOrgId();
  }

  showFilterFields() {
    this.showFilter = !this.showFilter;
  }

  toggleAllSelection() {
    if (this.allSelected) {
      this.select.options.forEach((item: MatOption) => item.select());
    } else {
      this.select.options.forEach((item: MatOption) => item.deselect());
    }
  }

  //datepicker with get method intwgration
  public onDateChange(event: MatDatepickerInputEvent<Date>) {
    this.todayDate = new Date(event.value);
    this.datepicker = new UntypedFormControl(this.todayDate);
    this.selectedDate = moment(this.todayDate).format("YYYY-MM-DD");
    // this.showStatusData = false;
    this.byStatus = false;
    this.byProjects = false;
    this.byUsers = true;
    this.showFilter = true;
    this.viewBy.setValue('Users');
    this.status.setValue(null);
    this.project.setValue(null);
    this.user.setValue(null);
    this.getAllDayTaskDetails();
    // this.getActiveEmpSpecificDetailsByOrgId();
    // for (var i = 0; i < this.userDetails.length; i++) {
    //   this.finalOutputData.push({ 'key': this.userDetails[i].firstname + " " + this.userDetails[i].lastname, 'data': this.allDayTaskDetails.filter(task => task.emp_id == this.userDetails[i].id) });
    // }
    // this.finalOutputData.sort((a, b) => b.data.length - a.data.length);
    // this.getActiveEmpSpecificDetailsByOrgId();
  }

  nextdate() {
    this.todayDate = new Date(+this.todayDate + 1 * 86400000);
    this.datepicker = new UntypedFormControl(this.todayDate);
    this.selectedDate = moment(this.todayDate).format("YYYY-MM-DD");
    // this.showStatusData = false;
    this.byStatus = false;
    this.byProjects = false;
    this.byUsers = true;
    this.showFilter = true;
    this.viewBy.setValue('Users');
    this.status.setValue(null);
    this.project.setValue(null);
    this.user.setValue(null);
    this.getAllDayTaskDetails();
    // this.getActiveEmpSpecificDetailsByOrgId();
    // for (var i = 0; i < this.userDetails.length; i++) {
    //   this.finalOutputData.push({ 'key': this.userDetails[i].firstname + " " + this.userDetails[i].lastname, 'data': this.allDayTaskDetails.filter(task => task.emp_id == this.userDetails[i].id) });
    // }
    // this.finalOutputData.sort((a, b) => b.data.length - a.data.length);
    // this.getActiveEmpSpecificDetailsByOrgId();
  }

  previousdate() {
    this.todayDate = new Date(+this.todayDate - 1 * 86400000);
    this.datepicker = new UntypedFormControl(this.todayDate);
    this.selectedDate = moment(this.todayDate).format("YYYY-MM-DD");
    // this.showStatusData = false;
    this.byStatus = false;
    this.byProjects = false;
    this.byUsers = true;
    this.showFilter = true;
    this.viewBy.setValue('Users');
    this.status.setValue(null);
    this.project.setValue(null);
    this.user.setValue(null);
    this.getAllDayTaskDetails();
    // this.getActiveEmpSpecificDetailsByOrgId();
    // for (var i = 0; i < this.userDetails.length; i++) {
    //   this.finalOutputData.push({ 'key': this.userDetails[i].firstname + " " + this.userDetails[i].lastname, 'data': this.allDayTaskDetails.filter(task => task.emp_id == this.userDetails[i].id) });
    // }
    // this.finalOutputData.sort((a, b) => b.data.length - a.data.length);
    // this.getActiveEmpSpecificDetailsByOrgId();
  }

  //view by option if else
  viewByOption(event) {
    if (event.value == 'Status') {
      this.byStatus = true;
      this.byProjects = false;
      this.byUsers = false;
      this.allSelected = false;
      this.project.setValue(null);
      this.user.setValue(null);
      this.finalOutputData = [];
      this.finalEmptyData = [];
      this.finalOutputData.push({ 'key': 'Done', 'data': this.allDayTaskDetails.filter(task => task.status == 'Done') });
      this.finalOutputData.push({ 'key': 'Inprogress', 'data': this.allDayTaskDetails.filter(task => task.status == 'Inprogress') });
      this.finalOutputData.push({ 'key': 'Todo', 'data': this.allDayTaskDetails.filter(task => task.status == 'Todo') });
    } else if (event.value == 'Projects') {
      this.byProjects = true;
      this.byStatus = false;
      this.byUsers = false;
      this.status.setValue(null);
      this.user.setValue(null);
      this.finalOutputData = [];
      this.finalEmptyData = [];
      for (var i = 0; i < this.projectDetails.length; i++) {
        this.finalOutputData.push({ 'key': this.projectDetails[i].project_name, 'data': this.allDayTaskDetails.filter(task => task.project_id == this.projectDetails[i].id) });
      }
      this.finalOutputData.sort((a, b) => b.data.length - a.data.length);
      this.finalEmptyData = this.finalOutputData.filter((a) => a.data.length == 0);
      this.finalOutputData = this.finalOutputData.filter((a) => a.data.length != 0);

    } else if (event.value == 'Users') {
      this.byUsers = true;
      this.byProjects = false;
      this.byStatus = false;
      this.status.setValue(null);
      this.project.setValue(null);
      this.finalOutputData = [];
      this.finalEmptyData = [];
      for (var i = 0; i < this.userDetails.length; i++) { ///, 'key_img': this.userDetails[i].profile_image
        this.finalOutputData.push({ 'key': this.userDetails[i].firstname + " " + this.userDetails[i].lastname, 'key_id': this.userDetails[i].id, 'data': this.allDayTaskDetails.filter(task => task.emp_id == this.userDetails[i].id) });
      }
      this.finalOutputData.sort((a, b) => b.data.length - a.data.length);
      this.finalEmptyData = this.finalOutputData.filter((a) => a.data.length == 0);
      this.finalOutputData = this.finalOutputData.filter((a) => a.data.length != 0);
      if (this.finalEmptyData.length > 0) {
        this.finalEmptyData = this.finalEmptyData.filter(t => !this.todayLeaveList.map(l => l.emp_id).includes(t.key_id));
      }
      // for image setting
      this.setTheImage();
      // this.finalOutputData.paginator = this.paginator;
    }
  }

  //Filter
  generalFilter() {
    if (this.byUsers) {
      let tempData = [];
      this.finalOutputData = [];
      this.finalEmptyData = [];
      if (this.project.value != null && this.status.value != null) tempData = this.allDayTaskDetails.filter(task => task.project_id == this.project.value.id && task.status == this.status.value);
      else {
        if (this.project.value) tempData = this.allDayTaskDetails.filter(task => task.project_id == this.project.value.id);
        else tempData = this.allDayTaskDetails.filter(task => task.status == this.status.value);
      }
      if (tempData.length > 0) {
        this.isnoTasksAvailable = true;
        for (var i = 0; i < this.userDetails.length; i++) {
          this.finalOutputData.push({ 'key': this.userDetails[i].firstname + " " + this.userDetails[i].lastname, 'key_id': this.userDetails[i].id, 'data': tempData.filter(task => task.emp_id == this.userDetails[i].id) });
        }
        this.finalOutputData.sort((a, b) => b.data.length - a.data.length);
        this.finalEmptyData = this.finalOutputData.filter((a) => a.data.length == 0);
        this.finalOutputData = this.finalOutputData.filter((a) => a.data.length != 0);
        if (this.finalEmptyData.length > 0) {
          this.finalEmptyData = this.finalEmptyData.filter(t => !this.todayLeaveList.map(l => l.emp_id).includes(t.key_id));
        }
        this.setTheImage();
      } else {
        this.isnoTasksAvailable = false;
      }

    } else if (this.byProjects) {
      let tempData = [];
      this.finalOutputData = [];
      this.finalEmptyData = [];
      let tempUserData;
      let empData = [];
      if (this.user.value != null) {
        let array = this.user.value;
        array.forEach(element => {
          if (element != undefined) {
            empData.push(element);
          }
        });
        this.selecteduser = empData.length;
        tempUserData = empData.map(data => data.id);
      }
      if (this.status.value != null && this.user.value != null) tempData = this.allDayTaskDetails.filter(task => tempUserData.includes(task.emp_id) && task.status == this.status.value);
      else {
        if (this.status.value) tempData = this.allDayTaskDetails.filter(task => task.status == this.status.value);
        else tempData = this.allDayTaskDetails.filter(task => tempUserData.includes(task.emp_id));
      }
      if (tempData.length > 0) {
        this.isnoTasksAvailable = true;
        for (var i = 0; i < this.projectDetails.length; i++) {
          this.finalOutputData.push({ 'key': this.projectDetails[i].project_name, 'data': tempData.filter(task => task.project_id == this.projectDetails[i].id) });
        }
        this.finalOutputData.sort((a, b) => b.data.length - a.data.length);
        this.finalEmptyData = this.finalOutputData.filter((a) => a.data.length == 0);
        this.finalOutputData = this.finalOutputData.filter((a) => a.data.length != 0);
      } else {
        this.isnoTasksAvailable = false;
      }
      if (this.selecteduser == this.userDetails.length) {
        this.allSelected = true;
      }
      else {
        this.allSelected = false;
      }

    } else if (this.byStatus) {
      let tempData = [];
      this.finalOutputData = [];
      this.finalEmptyData = [];
      let tempUserData;
      let empData = [];
      if (this.user.value != null) {
        let array = this.user.value;
        array.forEach(element => {
          if (element != undefined) {
            empData.push(element);
          }
        });
        this.selecteduser = empData.length;
        tempUserData = empData.map(data => data.id);
      }
      if (this.project.value != null && this.user.value != null) tempData = this.allDayTaskDetails.filter(task => tempUserData.includes(task.emp_id) && task.project_id == this.project.value.id);
      else {
        if (this.project.value) tempData = this.allDayTaskDetails.filter(task => task.project_id == this.project.value.id);
        else tempData = this.allDayTaskDetails.filter(task => tempUserData.includes(task.emp_id));
      }
      if (tempData.length > 0) {
        this.isnoTasksAvailable = true;
        this.finalOutputData.push({ 'key': 'Done', 'data': tempData.filter(task => task.status == 'Done') });
        this.finalOutputData.push({ 'key': 'Inprogress', 'data': tempData.filter(task => task.status == 'Inprogress') });
        this.finalOutputData.push({ 'key': 'Todo', 'data': tempData.filter(task => task.status == 'Todo') });
      } else {
        this.isnoTasksAvailable = false;
      }
      if (this.selecteduser == this.userDetails.length) {
        this.allSelected = true;
      }
      else {
        this.allSelected = false;
      }
    }
  }

  // reset the filters
  refresh() {
    this.showFilter = true;
    this.allSelected = false;
    if (this.byStatus) {
      this.byStatus = true;
      this.byProjects = false;
      this.byUsers = false;
      this.project.setValue(null);
      this.user.setValue(null);
      this.finalOutputData = [];
      this.finalEmptyData = [];
      this.finalOutputData.push({ 'key': 'Done', 'data': this.allDayTaskDetails.filter(task => task.status == 'Done') });
      this.finalOutputData.push({ 'key': 'Inprogress', 'data': this.allDayTaskDetails.filter(task => task.status == 'Inprogress') });
      this.finalOutputData.push({ 'key': 'Todo', 'data': this.allDayTaskDetails.filter(task => task.status == 'Todo') });
      if (this.allDayTaskDetails.length > 0) this.isnoTasksAvailable = true;
      else this.isnoTasksAvailable = false;

    } else if (this.byProjects) {
      this.byProjects = true;
      this.byStatus = false;
      this.byUsers = false;
      this.status.setValue(null);
      this.user.setValue(null);
      this.finalOutputData = [];
      this.finalEmptyData = [];
      for (var i = 0; i < this.projectDetails.length; i++) {
        this.finalOutputData.push({ 'key': this.projectDetails[i].project_name, 'data': this.allDayTaskDetails.filter(task => task.project_id == this.projectDetails[i].id) });
      }
      this.finalOutputData.sort((a, b) => b.data.length - a.data.length);
      this.finalEmptyData = this.finalOutputData.filter((a) => a.data.length == 0);
      this.finalOutputData = this.finalOutputData.filter((a) => a.data.length != 0);
      if (this.allDayTaskDetails.length > 0) this.isnoTasksAvailable = true;
      else this.isnoTasksAvailable = false;

    } else if (this.byUsers) {
      this.byUsers = true;
      this.byProjects = false;
      this.byStatus = false;
      this.status.setValue(null);
      this.project.setValue(null);
      this.finalOutputData = [];
      this.finalEmptyData = [];
      for (var i = 0; i < this.userDetails.length; i++) {
        this.finalOutputData.push({ 'key': this.userDetails[i].firstname + " " + this.userDetails[i].lastname, 'key_id': this.userDetails[i].id, 'data': this.allDayTaskDetails.filter(task => task.emp_id == this.userDetails[i].id) });
      }
      this.finalOutputData.sort((a, b) => b.data.length - a.data.length);
      this.finalEmptyData = this.finalOutputData.filter((a) => a.data.length == 0);
      this.finalOutputData = this.finalOutputData.filter((a) => a.data.length != 0);
      if (this.finalEmptyData.length > 0) {
        this.finalEmptyData = this.finalEmptyData.filter(t => !this.todayLeaveList.map(l => l.emp_id).includes(t.key_id));
      }
      this.setTheImage();
      if (this.allDayTaskDetails.length > 0) this.isnoTasksAvailable = true;
      else this.isnoTasksAvailable = false;
    }
  }

  //filter function for project form field
  protected filterproject() {
    if (!this.projectDetails) {
      return;
    }
    // get the search keyword
    let search = this.projectFilterCtrl.value;
    if (!search) {
      this.filteredproject.next(this.projectDetails.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
    // filter the client
    this.filteredproject.next(
      this.projectDetails.filter(data => data.project_name.toLowerCase().indexOf(search) > -1)
    );
  }
  //filter function for project form field
  protected filteruser() {
    if (!this.userDetails) {
      return;
    }
    // get the search keyword
    let search = this.userFilterCtrl.value;
    if (!search) {
      this.filtereduser.next(this.userDetails.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
    // filter the client
    this.filtereduser.next(
      this.userDetails.filter(data => data.firstname.toLowerCase().indexOf(search) > -1)
    );
  }

  getTaskCardHeight() {
    let height1 = window.innerHeight;
    return (height1 - 150);
  }

  // get project details by org id
  getActiveProjectDetailsByOrgId() {
    this.spinner.show();
    this.projectsService.getProjectNameAndId(this.orgId).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        let response = JSON.parse(data.map.data);
        this.projectDetails = response;
        if (this.projectDetails.length == 0) {
          this.noProjects = true;
        } else {
          this.noProjects = false;
          this.filteredproject.next(this.projectDetails.slice());
          this.projectFilterCtrl.valueChanges.pipe(takeUntil(this._onDestroy)).subscribe(() => {
            this.filterproject();
          });
        }

      }
      this.spinner.hide();
    }, (error) => {
      this.spinner.hide();
    });
  }
  // get the current day task details by org id
  getAllDayTaskDetails() {
    this.showMatChips = false;
    return new Promise<void>((resolve, reject) => {
      this.spinner.show();
      // this.showLoader = true;
      this.finalOutputData = [];
      this.finalEmptyData = [];
      let data = {
        "org_id": this.orgId,
        "date": this.selectedDate
      }
      this.dayPlannerService.getDayTaskDetailsByOrgIdAndDate(data).subscribe(async data => {
        if (data.map.statusMessage == "Success") {
          let response = JSON.parse(data.map.data);
          this.allDayTaskDetails = response;
          if (this.allDayTaskDetails.length > 0) {
            this.isnoTasksAvailable = true;
            // for (var i = 0; i < this.allDayTaskDetails.length; i++) {
            //   if (this.allDayTaskDetails[i].emp_image != undefined) {
            //     let stringArray = new Uint8Array(this.allDayTaskDetails[i].emp_image);
            //     const STRING_CHAR = stringArray.reduce((data, byte) => {
            //       return data + String.fromCharCode(byte);
            //     }, '');
            //     let base64String = btoa(STRING_CHAR);
            //     this.allDayTaskDetails[i].emp_image = this.domSanitizer.bypassSecurityTrustUrl("data:image/jpeg;base64," + base64String);
            //   } else {
            //     this.allDayTaskDetails[i].emp_image = "..//..//..//assets/images/user_person.png";
            //   }
            // }
            this.getEmpImagesForTasks([...new Set(this.allDayTaskDetails.map(item => item.emp_id))]);
            await this.getActiveEmpSpecificDetailsByOrgId();
            // this.spinner.hide();
            // this.finalOutputData.push({ 'key': 'Done', 'data': this.allDayTaskDetails.filter(task => task.status == 'Done') });
            // this.finalOutputData.push({ 'key': 'Inprogress', 'data': this.allDayTaskDetails.filter(task => task.status == 'Inprogress') });
            // this.finalOutputData.push({ 'key': 'Todo', 'data': this.allDayTaskDetails.filter(task => task.status == 'Todo') });
          } else {
            await this.getActiveEmpSpecificDetailsByOrgId();
            this.isnoTasksAvailable = false;
            // this.spinner.hide();
          }
        }
        resolve();
        this.spinner.hide();
      }, (error) => {
        reject(error);
        this.spinner.hide();
      });
    });

  }

  // get emp details by org id
  getActiveEmpSpecificDetailsByOrgId() {
    return new Promise<void>((resolve, reject) => {
      this.spinner.show();
      this.settingsService.getCustomActiveEmpDetailsByOrgID(this.orgId).subscribe(data => {
        if (data.map.statusMessage == "Success") {
          let response = JSON.parse(data.map.data);
          this.userDetails = response;
          if (this.userDetails.length == 0) {
            this.noUsers = true;
            // this.showLoader = false;
          } else {
            this.noUsers = false;
            for (var i = 0; i < this.userDetails.length; i++) {
              // if (this.userDetails[i].profile_image != undefined) {
              //   let stringArray = new Uint8Array(this.userDetails[i].profile_image);
              //   const STRING_CHAR = stringArray.reduce((data, byte) => {
              //     return data + String.fromCharCode(byte);
              //   }, '');
              //   let base64String = btoa(STRING_CHAR);
              //   this.userDetails[i].profile_image = this.domSanitizer.bypassSecurityTrustUrl("data:image/jpeg;base64," + base64String);
              // } else {
              //   this.userDetails[i].profile_image = "..//..//..//assets/images/user_person.png";
              // }

              //'key_img': this.userDetails[i].profile_image
              this.finalOutputData.push({ 'key': this.userDetails[i].firstname + " " + this.userDetails[i].lastname, 'key_id': this.userDetails[i].id, 'data': this.allDayTaskDetails.filter(task => task.emp_id == this.userDetails[i].id) });

            }
            this.finalOutputData.sort((a, b) => b.data.length - a.data.length);
            this.finalEmptyData = this.finalOutputData.filter((a) => a.data.length == 0);
            this.finalOutputData = this.finalOutputData.filter((a) => a.data.length != 0);
            // this.finalOutputData.length > 0 ? this.showFilter = true : this.showFilter = false;
            this.filtereduser.next(this.userDetails.slice());
            this.userFilterCtrl.valueChanges.pipe(takeUntil(this._onDestroy)).subscribe(() => {
              this.filteruser();
            });
            // this.showLoader = false;
            this.getEmpImages([...new Set(this.finalOutputData.map(item => item.key_id))]);
            this.todayLeaves();
          }
        }
        this.showLoader = false;
        this.spinner.hide();
        resolve(); // Resolve the promise when the operations are completed
      }, (error) => {
        reject(error);
        this.spinner.hide();
      });
    });
  }

  empObjWithImg: [] = [];
  isGettingEMpImage: boolean = true;
  getEmpImages(ids) {
    this.isGettingEMpImage = true;
    // this.spinner.show();
    let data = {
      "emp_ids": ids,
    }
    this.settingsService.getEmployeeImagesByIds(data).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        this.empObjWithImg = JSON.parse(data.map.data).map;
        for (let i = 0; i < this.finalOutputData.length; i++) {
          if (this.empObjWithImg[this.finalOutputData[i].key_id] != '') {
            let stringArray = new Uint8Array(this.empObjWithImg[this.finalOutputData[i].key_id]);
            const STRING_CHAR = stringArray.reduce((data, byte) => {
              return data + String.fromCharCode(byte);
            }, '');
            let base64String = btoa(STRING_CHAR);
            this.finalOutputData[i].key_img = this.domSanitizer.bypassSecurityTrustUrl("data:image/jpeg;base64," + base64String);
          } else {
            this.finalOutputData[i].key_img = 'assets/images/user_person.png';
          }
        }
        this.isGettingEMpImage = false;
        // this.spinner.hide();
      } else {
        this.finalOutputData.map((e) => e.key_img = 'assets/images/user_person.png');
        this.isGettingEMpImage = false;
        // this.spinner.hide();
      }
    }, (err) => {
      this.finalOutputData.map((e) => e.key_img = 'assets/images/user_person.png');
      this.isGettingEMpImage = false;
      // this.spinner.hide();
    });
  }

  taskEmpObjWithImg: [] = [];
  getEmpImagesForTasks(ids) {
    return new Promise<void>((resolve, reject) => {
      // this.spinner.show();
      let data = {
        "emp_ids": ids,
      }
      this.settingsService.getEmployeeImagesByIds(data).subscribe(data => {
        if (data.map.statusMessage == "Success") {
          this.taskEmpObjWithImg = JSON.parse(data.map.data).map;
          for (var i = 0; i < this.allDayTaskDetails.length; i++) {
            if (this.taskEmpObjWithImg[this.allDayTaskDetails[i].emp_id] != '') {
              let stringArray = new Uint8Array(this.taskEmpObjWithImg[this.allDayTaskDetails[i].emp_id]);
              const STRING_CHAR = stringArray.reduce((data, byte) => {
                return data + String.fromCharCode(byte);
              }, '');
              let base64String = btoa(STRING_CHAR);
              this.allDayTaskDetails[i].emp_image = this.domSanitizer.bypassSecurityTrustUrl("data:image/jpeg;base64," + base64String);
            } else {
              this.allDayTaskDetails[i].emp_image = 'assets/images/user_person.png';
            }
          }
          // this.spinner.hide();
        } else {
          this.allDayTaskDetails.map((e) => e.emp_image = 'assets/images/user_person.png');
          // this.spinner.hide();
        }
        resolve();
      }, (err) => {
        this.allDayTaskDetails.map((e) => e.emp_image = 'assets/images/user_person.png');
        reject(err);
        // this.spinner.hide();
      });
    });
  }

  setTheImage() {
    for (let i = 0; i < this.finalOutputData.length; i++) {
      if (this.empObjWithImg[this.finalOutputData[i].key_id] != '') {
        let stringArray = new Uint8Array(this.empObjWithImg[this.finalOutputData[i].key_id]);
        const STRING_CHAR = stringArray.reduce((data, byte) => {
          return data + String.fromCharCode(byte);
        }, '');
        let base64String = btoa(STRING_CHAR);
        this.finalOutputData[i].key_img = this.domSanitizer.bypassSecurityTrustUrl("data:image/jpeg;base64," + base64String);
      } else {
        this.finalOutputData[i].key_img = 'assets/images/user_person.png';
      }
    }
  }

  //TO get the today leave details by org id
  todayLeaves() {
    let zone = moment.tz.guess();
    let data: Object = {
      "org_id": localStorage.getItem("OrgId"),
      "start_date": moment(this.todayDate).startOf('day').toDate(),
      "timezone": zone,
    }
    this.leavetrackerService.getTodayLeavesByOrgid(data).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        let response: any[] = JSON.parse(data.map.data);
        this.todayLeaveList = response;
        if (response.length != 0 && this.finalEmptyData.length > 0) {
          this.finalEmptyData = this.finalEmptyData.filter(t => !this.todayLeaveList.map(l => l.emp_id).includes(t.key_id));
          this.showMatChips = true;
        } else {
          this.showMatChips = true;
        }
      } else {
        this.showMatChips = true;
      }
    }, (error) => {
      this.showMatChips = true;
    })
  }

  /// * * * * * * Export functions
  export_data: any = [];
  exportAsXLSX(): void {
    this.export_data = [];
    for (var i = 0; i < this.finalOutputData.length; i++) {
      for (var j = 0; j < this.finalOutputData[i].data.length; j++) {
        let data = this.finalOutputData[i].data;
        this.export_data.push({ "Employee_Id": data[j].emp_id, "Employee_Name": data[j].emp_name, "Task": data[j].day_task, "Date": data[j].date, "Project": data[j].project_name, "Status": data[j].status });
      }
    }
    this.exportservice.exportAsExcelFile(this.export_data, this.selectedDate + '_Day_planner_Details', "xlsx");
  }
  exportAsXLS() {
    this.export_data = [];
    for (var i = 0; i < this.finalOutputData.length; i++) {
      for (var j = 0; j < this.finalOutputData[i].data.length; j++) {
        let data = this.finalOutputData[i].data;
        this.export_data.push({ "Employee_Id": data[j].emp_id, "Employee_Name": data[j].emp_name, "Task": data[j].day_task, "Date": data[j].date, "Project": data[j].project_name, "Status": data[j].status });
      }
    }
    this.exportservice.exportAsExcelFile(this.export_data, this.selectedDate + '_Day_planner_Details', "xls");
  }
  exportAsCSV() {
    this.export_data = [];
    for (var i = 0; i < this.finalOutputData.length; i++) {
      for (var j = 0; j < this.finalOutputData[i].data.length; j++) {
        let data = this.finalOutputData[i].data;
        this.export_data.push({ "Employee_Id": data[j].emp_id, "Employee_Name": data[j].emp_name, "Task": data[j].day_task, "Date": data[j].date, "Project": data[j].project_name, "Status": data[j].status });
      }
    }
    this.exportservice.exportAsExcelFile(this.export_data, this.selectedDate + '_Day_planner_Details', "csv");
  }

}
