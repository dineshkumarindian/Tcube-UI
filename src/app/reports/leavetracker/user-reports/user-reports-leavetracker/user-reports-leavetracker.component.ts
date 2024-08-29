import { Component, Input, OnInit, ViewChild } from '@angular/core';
// import * as Highcharts from 'highcharts';
import { ReplaySubject, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { FormBuilder, UntypedFormControl, FormGroup, Validators } from '@angular/forms';
import { MatOption } from '@angular/material/core';
import { PageEvent } from '@angular/material/paginator';
import { DateAdapter } from '@angular/material/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { EmployeeService } from 'src/app/services/employee.service';
import { DatePipe } from '@angular/common';
import { NgxSpinnerService } from 'ngx-spinner';
import { DomSanitizer } from '@angular/platform-browser';
import { LeaveTrackerService } from 'src/app/services/leave-tracker.service';
import { SettingsService } from 'src/app/services/settings.service';
import { Router } from '@angular/router';
import moment from 'moment';
import * as Highcharts from 'highcharts/highstock';
import { MatSelect } from '@angular/material/select';
import { errorMessage } from '../../../../util/constants';
import { ExportService } from 'src/app/services/export.service';
import { noDataMessage } from 'src/app/util/constants';
import * as tablePageSize from '../../../../util/table-pagination-option';
@Component({
  selector: 'app-user-reports-leavetracker',
  templateUrl: './user-reports-leavetracker.component.html',
  styleUrls: ['./user-reports-leavetracker.component.less']
})
export class UserReportsLeavetrackerComponent implements OnInit {
  requiredMessage = errorMessage;
  nodataMsg = noDataMessage;
  title = 'HighChartNetworkGraph';
  chart: any;
  maxDate: Date;
  pageSize: number = 10;
  tablePaginationOption: number[];
  // alldetails:any = [];
  displayedColumns: string[] = ['empid', 'employeename','applied_date','leavetype', 'startdate', 'enddate', 'reportername', 'daystaken'];
  // dataSource = [...ELEMENT_DATA];
  dataSourcereports = new MatTableDataSource();
  // dataSourcereports: MatTableDataSource<any>;
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;

  /** control for the MatSelect filter keyword */
  public dateFilterCtrl: UntypedFormControl = new UntypedFormControl();

  /** control for the MatSelect filter keyword */
  public userFilterCtrl: UntypedFormControl = new UntypedFormControl();

  /** list of client filtered by search keyword */
  public filtereddate: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);

  /** control for the selected start date range */
  public start: UntypedFormControl = new UntypedFormControl("", [Validators.required]);

  /** control for the selected end date  range */
  public end: UntypedFormControl = new UntypedFormControl("", [Validators.required]);

  /** control for the selected date range */
  public dateCtrl: UntypedFormControl = new UntypedFormControl("", [Validators.required]);

  /** control for the selected user */
  public userCtrl: UntypedFormControl = new UntypedFormControl("", [Validators.required]);

  /** list of client filtered by search keyword */
  public filtereduser: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);

  protected _onDestroy = new Subject<void>();

  @ViewChild('singleSelect', { static: true }) singleSelect: MatSelect;
  @ViewChild('select', { static: true }) select: MatSelect;

  constructor(private employeeService: EmployeeService,
    private router: Router,
    private spinner: NgxSpinnerService,
    private leaveTrackerService: LeaveTrackerService,
    public datepipe: DatePipe,
    private domSanitizer: DomSanitizer,
    private exportservice: ExportService,
    private dateAdapter: DateAdapter<Date>,
    private settingsService: SettingsService,) { this.dateAdapter.setLocale('en-GB'); }

  /** list of bill */
  protected dateData: any[] = [
    // { data: 'Today', id: 1 },
    // { data: 'Yesterday', id: 2 },
    { data: 'This week', id: 3 },
    { data: 'Last week', id: 4 },
    { data: 'This Month', id: 5 },
    { data: 'Last Month', id: 6 },
    { data: 'Custom Date', id: 7 }
  ];
  /** list of employee */
  protected employeeData: any[] = [];
  employee_ids: any[] = [];
  org_id: any;
  customdate: boolean = false;
  customdatevalidation: boolean = false;
  daterangevalidation: boolean = false;
  Single_user: boolean = false;
  startdates: any;
  enddates: any;
  today: any;
  show: boolean = false;
  email: string | null;
  empId: string | null;
  employee: string;
  filterData: string;
  leavetypeFilter: boolean = false;
  Multiple_select: boolean = true;
  No_Data_Found: boolean;
  Leave_name: any = [];
  protected inativateemployeeData: any[] = [];
  protected ativateemployeeData: any[] = [];
  activeusers: boolean = true;
  inactiveattendance: boolean = false;
  // All_employee: boolean = false;


  // @ViewChild('TableOnePaginator', { static: true }) tableOnePaginator: MatPaginator;
  // @ViewChild('TableOneSort', { static: true }) tableOneSort: MatSort;
  ngOnInit() {

    this.org_id = localStorage.getItem("OrgId");
    this.getOrgEmployees();

    this.filtereddate.next(this.dateData.slice());
    // listen for search field value changes
    this.dateFilterCtrl.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        this.filterDate();
      });

    // ***************load the initial employee list*************
    this.filtereduser.next(this.employeeData.slice());

    // listen for search field value changes
    this.userFilterCtrl.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        this.filterEmployee();
      });
    this.startdates = new Date();
    this.maxDate = new Date();
    // this.datepicker = new FormControl(new Date());
    const date = new Date(this.startdates);
    var startdates = new Date(date.getFullYear(), date.getMonth(), 1);
    this.today = this.datepipe.transform(startdates, 'dd-MM-yyyy');
    this.startdates = this.today
    var enddates = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    this.enddates = this.datepipe.transform(enddates, 'dd-MM-yyyy');
    // this.addColours();
  }

  // Function for single and mutiple user select
  index_id: any = []
  findreport() {
    this.show = true;
    var array = this.userCtrl.value;
    this.index_id = array;
    if (array.length > 1) {
      this.Single_user = false;
      this.getAllLeaveDetailsForAllEmployee();

    }
    else {
      this.empId = array[0];
      this.Multiple_select = false;
      this.Single_user = true;
      this.getActiveLeaveTypeByOrgIdAndDatesForData();
    }
  }

  // ---------------------------------get org employees name and id--------------------------------
  getOrgEmployees() {
    this.employeeService.getOrgEmployees(this.org_id).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        var response = data.map.data.myArrayList;
        var inactivateresponse = data.map.inactivateusers.myArrayList;
        for (var i = 0; i < response.length; i++) {
          this.ativateemployeeData.push(response[i].map);
          this.employee_ids.push(response[i].map.id)
        }
        this.employeeData = this.ativateemployeeData;
        this.filterEmployee();

        for (var i = 0; i < inactivateresponse.length; i++) {
          this.inativateemployeeData.push(inactivateresponse[i].map);
        }
      }
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
    })
  }
  //---------------------------------show the active employee report------------------------
  inactiveusers() {
    this.inactiveattendance = true;
    this.activeusers = false;
    if (this.inactiveattendance == true) {
      this.employeeData = this.inativateemployeeData;
      this.filterEmployee();
    }
    this.show = false;
    this.start = new UntypedFormControl("", [Validators.required]);
    this.end = new UntypedFormControl("", [Validators.required]);
    this.dateCtrl = new UntypedFormControl("", [Validators.required]);
    this.userCtrl = new UntypedFormControl("", [Validators.required]);
    this.customdate = false;
    this.customdatevalidation = false;
    this.daterangevalidation = false;
    this.leavetracker_report = false;
    this.leavetracker_report_table = false;
    this.allSelected = false;
  }
  activeuseattendance() {
    this.inactiveattendance = false;
    this.activeusers = true;
    if (this.inactiveattendance == false) {
      this.employeeData = this.ativateemployeeData;
      this.filterEmployee();
    }
    this.show = false;
    this.start = new UntypedFormControl("", [Validators.required]);
    this.end = new UntypedFormControl("", [Validators.required]);
    this.dateCtrl = new UntypedFormControl("", [Validators.required]);
    this.userCtrl = new UntypedFormControl("", [Validators.required]);
    this.customdate = false;
    this.customdatevalidation = false;
    this.daterangevalidation = false;
    this.leavetracker_report = false;
    this.leavetracker_report_table = false;
    this.allSelected = false;
  }
  // --------------------------------Filter Date field function-----------------------------
  protected filterDate() {
    if (!this.dateData) {
      return;
    }
    // get the search keyword
    let search = this.dateFilterCtrl.value;
    if (!search) {
      this.filtereddate.next(this.dateData.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
    // filter the client
    this.filtereddate.next(
      this.dateData.filter(dateData => dateData.data.toLowerCase().indexOf(search) > -1)
    );
  }

  // --------------------------------Filter employee field function---------------------------
  protected filterEmployee() {
    if (!this.employeeData) {
      return;
    }
    // get the search keyword
    let search = this.userFilterCtrl.value;
    // if(search.length>0){
    //   this.All_employee = false;
    // }
    // else{
    //   this.All_employee = true;
    // }
    if (!search) {
      this.filtereduser.next(this.employeeData.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
    // filter the client
    this.filtereduser.next(
      this.employeeData.filter(employeeData => employeeData.name.toLowerCase().indexOf(search) > -1)
    );

  }

  //-------------------------Select Employeedetails-----------------------------
  length: any = [];
  selectEmploy(event) {
    this.email = event.mail;
    this.employee = event.name;
    this.empId = event.id;
  }


  selectChangeHandler(data) {
    if (data == "Custom Date") {
      this.customdate = true;
    }
    else {
      if (data == "Today") {
        this.startdates = moment().toDate();
        this.enddates = moment().toDate();
      }
      if (data == "Yesterday") {
        this.startdates = moment().subtract(1, "days").toDate();
        this.enddates = moment().subtract(1, "days").toDate();
      }
      if (data == "This week") {
        this.startdates = moment().startOf("week").toDate();
        this.enddates = moment().endOf("week").toDate();
      }
      if (data == "Last week") {
        this.startdates = moment().subtract(1, 'weeks').startOf("week").toDate();
        this.enddates = moment().subtract(1, 'weeks').endOf("week").toDate();
      }
      if (data == "This Month") {
        this.startdates = moment().startOf("month").toDate();
        this.enddates = moment().endOf("month").toDate();
      }
      if (data == "Last Month") {
        this.startdates = moment().subtract(1, 'month').startOf("month").toDate();
        this.enddates = moment().subtract(1, 'month').endOf("month").toDate();
      }
      this.customdate = false;
      this.daterangevalidation = true;
    }
    if (this.end.value == "") {
      this.customdatevalidation = false;
    }
    else {
      this.customdatevalidation = true;
    }
  }

  tempData: any[];
  approvedCounts: any = [];
  Leavetype: any = [];
  Empname: any = [];
  EmpIds: any = [];
  Requiredarray1: any = [];
  Requiredarray2: any = [];
  leaveCounts: any = [];
  EmpleaveCounts: any = [];
  EmpleaveCounts1: any = [];
  Table_value: any = [];
  TableValueLength: number;
  leavetracker_report: boolean = false;
  leavetracker_report_table: boolean = false;
  list_empId = [];
  username: string;

  leaveTypeDetail: any = [];
  leaveAvailCount = [];
  takenLeave: number = 0;
  availLeave: number = 0;
  getActiveLeaveTypeByOrgIdAndDatesForData() {
    this.leavetracker_report = true;
    this.leavetracker_report_table = false;
    // this.Single_user = true;
    this.leaveCounts = [];
    this.Leavetype = [];
    this.list_empId = [];
    this.spinner.show();
    if (this.customdate == true) {
      this.startdates = moment(this.start.value).toDate();
      this.enddates = moment(this.end.value).toDate();
    }
    this.tempData = [];
    this.list_empId.push(this.empId);

    let data: Object = {
      "emp_id": this.list_empId,
      "org_id": localStorage.getItem("OrgId"),
      "start_date": this.startdates,
      "end_date": this.enddates,
    }

    this.leaveTrackerService.getActiveleaveByEmpIdAndYearByOrgid1(data).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        let response = JSON.parse(data.map.data);
        this.tablePaginationOption = tablePageSize.tablePaginationOption(response.length);
        if (response.length > 0) {
          this.username = response[1].emp_name;
          this.leaveTypeDetail = response[0].myArrayList;
          response.shift();
        }
        if (response.length == 0) {
          this.No_Data_Found = true;
        }
        else {
          this.tempData = [];
          this.tempData = response.filter(a => a.approval_status == 'Approved');
          if (this.tempData.length == 0) {
            this.No_Data_Found = true;
          } else {
            this.No_Data_Found = false;
            this.tempData = JSON.parse(JSON.stringify(this.tempData));
            for (let i = 0; i < this.tempData.length; i++) {
              this.tempData[i].start_date = moment(this.tempData[i].start_date).format("DD-MM-YYYY");
              this.tempData[i].end_date = moment(this.tempData[i].end_date).format("DD-MM-YYYY");
            }
          }
          // this.tempData = this.tempData.map(a => moment(a.start_date).format("DD-MM-YYYY"));
          // this.tempData = this.tempData.map(a => moment(a.end_date).format("DD-MM-YYYY"));
          // for (let i = 0; i < response.length; i++) {
          //   response[i].start_date = moment(response[i].start_date).format("DD-MM-YYYY");
          //   response[i].end_date = moment(response[i].end_date).format("DD-MM-YYYY");
          //   if (response[i].approval_status == "Approved") {
          //     this.tempData.push(response[i]);
          //     // ------------no data found section-----------------
          //     let length1 = this.tempData.length;
          //     if (length1 == 0) {
          //       this.No_Data_Found = true;
          //     }
          //     else {
          //       this.No_Data_Found = false;
          //     }
          //   }
          // }
        }

        this.Table_value = this.tempData;
        this.TableValueLength = this.Table_value.length;
        this.displayedColumns = ['empid', 'leavetype','applied_date','startdate', 'enddate', 'reportername', 'daystaken'];
        // -------------------- for to get leave types arrray with dublicate removing-----------------------

        let tempdata = this.tempData.map(n => n.leave_type);
        this.Leavetype = tempdata.filter(function (elem, index, self) {
          return index === self.indexOf(elem);
        })
        for (let j = 0; j < this.Leavetype.length; j++) {
          // -----------------To get leaveconts----------------------

          let details = this.tempData.filter(n => n.leave_type == this.Leavetype[j]);
          let counts = details.reduce((val, fi) => val + fi.total_days, 0);
          // let counts = details.reduce(function(val, fi) {return val + fi.total_days } ,0);
          this.leaveCounts.push(counts);
        }

      }

      if (this.Single_user && this.tempData.length > 0) {
        setTimeout(() => {
          Highcharts.chart('container', this.setchartoption());
          this.spinner.hide();
        }, 1000);
      }
      else {
        this.Single_user = false;
        this.dataSourcereports = new MatTableDataSource(this.Table_value);
        setTimeout(() => this.dataSourcereports.paginator = this.paginator);
        this.dataSourcereports.sort = this.sort;
        this.leavetracker_report_table = true;
        setTimeout(() => {
          const element = document.getElementById("box");
          // element.scrollIntoView({ block: "end" });
          element.scrollIntoView({ behavior: "smooth", block: "end", inline: "nearest" });
        }, 200);
        setTimeout(() => {
          this.spinner.hide();
        }, 1000);
      }
      this.leaveAvailCount = [];
      for (let i = 0; i < this.Leavetype.length; i++) {
        let leaveTypeName = this.Leavetype[i];
        let filteredLeaveType = this.leaveTypeDetail.filter(a => a.map.leaveTypeName === leaveTypeName);
        filteredLeaveType.forEach(days => {
          let count = (filteredLeaveType[0].map.leaveTypeAvailDays) - this.leaveCounts[i];
          days.taken = this.leaveCounts[i];
          days.availableDays = count;
          this.leaveAvailCount.push(days);
        });
      }

    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
    });
  }

  //  ! To Date field validation
  todatechange() {
    if (this.end.value == "") {
      this.customdatevalidation = false;
    }
    else {
      this.customdatevalidation = true;
    }
  }

  // -----------------------To cancel form function-------------------------

  cancelform() {
    this.show = false;
    this.start = new UntypedFormControl("", [Validators.required]);
    this.end = new UntypedFormControl("", [Validators.required]);
    this.dateCtrl = new UntypedFormControl("", [Validators.required]);
    this.userCtrl = new UntypedFormControl("", [Validators.required]);
    this.customdate = false;
    this.customdatevalidation = false;
    this.daterangevalidation = false;
    this.leavetracker_report = false;
    this.leavetracker_report_table = false;
    this.allSelected = false;
  }
  options: any;
  options_all: any;
  setchartoption() {
    this.options = {
      chart: {
        type: 'column',
      },
      title: false,
      // {
      //   // text: 'Leave report',
      // },
      subtitle: {
        // text: 'Click the bar to view the full details in table',
      },
      xAxis: {
        categories: this.Leavetype,
        title: {
          text: 'leaves',
        },
      },
      yAxis: {
        min: 0,
        title: {
          text: 'Days count',
          align: 'middle',
        },
        labels: {
          overflow: 'justify',
        },
      },
      tooltip: {
        headerFormat: "",
        useHTML: true,
        pointFormat: 'Leaves Taken : {point.y:.1f}',
      },
      plotOptions: {
        bar: {
          dataLabels: {
            enabled: true,
          },
        },
        series: {
          borderWidth: 0,
          cursor: 'pointer',
          dataLabels: {
            enabled: true,
            format: '{point.y:.1f}',
          }
        },
        // showInLegend: true,
      },
      legend: false,
      // {
      //   layout: 'none',
      //   align: 'none',
      //   veriticalAlign: 'none',
      //   x: 0,
      //   y: 0,
      //   floating: true,
      //   borderWidth: 2,
      //   shadow: true,
      // },
      credits: {
        enabled: false,
      },
      series: [
        {
          name: 'Leaves taken',
          data: this.leaveCounts,
          events: {
            click: (event) => {
              this.Showtable(event.point.category);
              this.takenLeave = this.leaveAvailCount[event.point.index].taken;
              // this.availLeave = this.leaveAvailCount[event.point.index].availableDays;
            },
          },
          colorByPoint: true
        }],

    };
    return this.options;
  }

  leaveData: any = [];
  async Showtable(data) {
    this.spinner.show();
    this.Leave_name = data
    this.leaveData = [];
    this.Table_value = [];
    this.Table_value = this.tempData.filter(a => a.leave_type == data);
    let leave_data = {
      "leave_type_id":this.Table_value[0].leave_type_id,
      "emp_id":this.Table_value[0].emp_id
    }
    await this.leaveTrackerService.getLeaveDetailsAvaiableAndTakenDays(leave_data).subscribe(data =>{
      if (data.map.statusMessage == "Success") {
        let response = JSON.parse(data.map.data);
        this.availLeave = response.map.available_day;
        this.spinner.hide();
        // this.availLeave = this.leaveAvailCount[event.point.index].availableDays;
      }
    })


    this.leaveData = this.tempData.filter(a => a.leave_type == data);
    this.dataSourcereports = new MatTableDataSource(this.Table_value);
    this.displayedColumns = ['empid', 'employeename','applied_date','startdate', 'enddate', 'reportername', 'daystaken'];
    setTimeout(() => { this.dataSourcereports.paginator = this.paginator });
    this.dataSourcereports.sort = this.sort;
    this.leavetracker_report_table = true;
    // this.tableOnePaginator.firstPage();
    setTimeout(() => {
      const element = document.getElementById("box");
      // element.scrollIntoView({ block: "end" });
      element.scrollIntoView({ behavior: "smooth", block: "end", inline: "nearest" });
    }, 200);
  }

  // ----------------------------------- method for all employee details gettings------------------------------------
  Array_filter: any = [];
  // Array_filter2: any = [];
  Emp_names: any = [];
  Array_value: any = [];
  filtered_array: any = [];
  Length_array: any = [];
  Org_array: any = [];
  Requiredarr: any = [];
  getAllLeaveDetailsForAllEmployee() {
    this.Multiple_select = true;
    this.leavetracker_report = true;
    this.leavetracker_report_table = false;
    this.EmpleaveCounts = [];
    this.Empname = [];
    this.Array_filter = [];
    // this.Array_filter2 = [];
    this.Emp_names = [];
    this.filtered_array = [];
    this.Org_array = [];
    this.Length_array = [];
    this.Requiredarray1 = [];
    this.Requiredarr = [];
    this.tempData = [];
    this.spinner.show();
    if (this.customdate == true) {
      this.startdates = moment(this.start.value).toDate();
      this.enddates = moment(this.end.value).toDate();
    }
    var empIdlist = this.userCtrl.value;

    let data: Object = {
      "emp_id": empIdlist,
      "org_id": localStorage.getItem("OrgId"),
      "start_date": this.startdates,
      "end_date": this.enddates,
    }
    this.leaveTrackerService.getActiveleaveByEmpIdAndYearByOrgid1(data).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        let response = JSON.parse(data.map.data);
        if (response.length == 0) {
          this.No_Data_Found = true;
        }
        else {
          this.tempData = response.filter(a => a.approval_status == 'Approved');

          if (this.tempData.length == 0) {
            this.No_Data_Found = true;
          } else {
            this.No_Data_Found = false;
          }
        }
        // -------------------- for to get leave types arrray with dublicate removing-----------------------

        let tempdata = this.tempData.map(n => n.emp_name)
        this.Empname = tempdata.filter(function (elem, index, self) {
          return index === self.indexOf(elem);
        })
        this.filtered_array = this.Empname;
        let temp = this.tempData.map(n => n.emp_id)
        this.EmpIds = temp.filter(function (elem, index, self) {
          return index === self.indexOf(elem);
        })

        for (let j = 0; j < this.EmpIds.length; j++) {
          // -----------------To get leaveconts----------------------
          let details2 = this.tempData.filter(n => n.emp_id == this.EmpIds[j]);
          let Empleavecounts2 = details2.reduce((val, fi) => val + fi.total_days, 0);
          this.EmpleaveCounts.push(Empleavecounts2);
        }

        // ----------------to get the all users leave report----------------------
        if (this.allSelected == true) {
          this.filtered_array = [];
          let details1 = this.employeeData;
          for (let H = 0; H < this.EmpIds.length; H++) {
            details1 = details1.filter(n => n.id != this.EmpIds[H]);
          }
          // *********this is for to get first name only of the employee*****************
          this.Emp_names = [];
          for (let g = 0; g < details1.length; g++) {
            var array = details1[g].name.split(" ", 1);
            this.Emp_names.push(array.toString());
          }
          // *******************array concatination for leave taking users and non lave takers**************
          this.Requiredarr = this.EmpIds;
          this.Requiredarray1 = this.EmpIds.concat(this.Emp_names);
          this.filtered_array = this.Empname.concat(this.Emp_names);
          // **********push leave counts as 0 for non leave takers********************
          this.Length_array = this.filtered_array.length - this.EmpleaveCounts.length;
          for (let a = 0; a < this.Length_array; a++) {
            this.EmpleaveCounts.push(0);
          }
        }

        else {
          let details1 = this.employeeData;
          let merge3: any;
          this.Requiredarr = [];
          this.Emp_names = [];
          this.Array_value = [];
          for (let t = 0; t < this.index_id.length; t++) {
            let details2 = details1.filter(n => n.id == this.index_id[t]);
            this.Array_value.push(details2);
            merge3 = this.Array_value.flat(1);
          }
          // *********this is for to get first name only of the employee*****************
          for (let g = 0; g < merge3.length; g++) {
            var array = merge3[g].name.split(" ", 1);
            this.Emp_names.push(array.toString());
          }
          // dublicate removal
          this.Requiredarr = this.EmpIds;
          this.Requiredarray1 = this.filtered_array.concat(this.Emp_names);
          this.Org_array = this.Requiredarray1.filter(function (elem, index, self) {
            return index === self.indexOf(elem);
          })
          // **********push leave counts as 0 for non leave takers********************
          this.Length_array = this.Org_array.length - this.filtered_array.length;
          for (let a = 0; a < this.Length_array; a++) {
            this.EmpleaveCounts.push(0);
          }
          this.filtered_array = this.Org_array;

        }

      }

      setTimeout(() => {
        Highcharts.chart('alldatareport', this.setchartoption_forall());
      }, 1000);
      this.spinner.hide();
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
    });
  }

  //-------------------- bar chart for all employee chart---------------------------
  setchartoption_forall() {

    if (this.EmpleaveCounts.length > 15) {
      this.options_all = {
        chart: {
          type: 'column',
        },
        title: false,
        // {
        //   // text: 'Leave report',
        // },
        subtitle: {
          // text: 'Click the bar to view the full details in table',
        },
        xAxis: {
          categories: this.filtered_array,
          // title: {
          //   text: 'users',
          // },
          min: 0,
          max: 15,
          scrollbar: {
            enabled: true,
            height: 5,
            barBorderRadius: 1,
            cursor: Highcharts.Pointer
          },
          // tickLength: 20,
        },

        yAxis: {
          min: 0,
          title: {
            text: 'Days count',
            align: 'middle',
          },
          labels: {
            overflow: 'justify',
          },
        },
        tooltip: {
          headerFormat: "",
          useHTML: true,
          pointFormat: 'Leaves Taken : {point.y:.1f}',
        },
        plotOptions: {
          bar: {
            dataLabels: {
              enabled: true,
            },
            innerWidth: 50,
          },
          series: {
            borderWidth: 0,
            cursor: 'pointer',
            dataLabels: {
              enabled: true,
              format: '{point.y:.1f}',
            }
          },
          // showInLegend: true,
        },
        legend: false,
        credits: {
          enabled: false,
        },
        series: [
          {
            name: 'Leaves taken',
            data: this.EmpleaveCounts,
            events: {
              click: (event) => {
                var Eventemp = this.Requiredarr[event.point.index];
                this.empId = Eventemp;
                this.getActiveLeaveTypeByOrgIdAndDatesForData();
              },
            },
            colorByPoint: true
          }],
      };
    }
    else {
      this.options_all = {
        chart: {
          type: 'column',
        },
        title: false,
        // {
        //   // text: 'Leave report',
        // },
        subtitle: {
          // text: 'Click the bar to view the full details in table',
        },
        xAxis: {
          categories: this.filtered_array,
          // title: {
          //   text: 'users',
          // },
          // tickLength: 20,
        },

        yAxis: {
          min: 0,
          title: {
            text: 'Days count',
            align: 'middle',
          },
          labels: {
            overflow: 'justify',
          },
        },
        tooltip: {
          headerFormat: "",
          useHTML: true,
          pointFormat: 'Leaves Taken : {point.y:.1f}',
        },
        plotOptions: {
          bar: {
            dataLabels: {
              enabled: true,
            },
            innerWidth: 50,
          },
          series: {
            borderWidth: 0,
            cursor: 'pointer',
            dataLabels: {
              enabled: true,
              format: '{point.y:.1f}',
            }
          },
          // showInLegend: true,
        },
        legend: false,
        credits: {
          enabled: false,
        },
        series: [
          {
            name: 'Leaves taken',
            data: this.EmpleaveCounts,
            events: {
              click: (event) => {
                var Eventemp = this.Requiredarr[event.point.index];
                this.empId = Eventemp;

                this.getActiveLeaveTypeByOrgIdAndDatesForData();
              },
            },
            colorByPoint: true
          }],
      };
    }

    return this.options_all;
  }

  //! 


  allSelected = false;
  toggleAllSelection() {
    if (this.allSelected) {
      this.select.options.forEach((item: MatOption) => item.select());
    } else {
      this.select.options.forEach((item: MatOption) => item.deselect());
    }
  }
  optionClick() {
    let newStatus = true;
    this.select.options.forEach((item: MatOption) => {
      if (!item.selected) {
        newStatus = false;
      }
    });
    this.allSelected = newStatus;

  }
  //pagination size
  changePage(event) {
    this.pageSize = event.pageSize;
  }

  // **********************filter for the leave type table*********************************
  applyFilter(event: Event) {
    this.leavetypeFilter = false;
    this.filterData = (event.target as HTMLInputElement).value;
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSourcereports.filter = filterValue.trim().toLowerCase();
    if (this.dataSourcereports.filteredData.length == 0) {
      this.leavetypeFilter = true;
    }
    if (this.dataSourcereports.paginator) {
      this.dataSourcereports.paginator = this.paginator;
    }
  }

  // **********************************table export*******************************
  export_data: any = [];
  export_name: any = [];
  exportAsXLSX(): void {
    this.export_data = [];
    for (var i = 0; i < this.Table_value.length; i++) {
      this.export_data.push({ "Employee_Id": this.Table_value[i].emp_id, "Employee_Name": this.Table_value[i].emp_name, "Leave_type": this.Table_value[i].leave_type, "Start_date": this.Table_value[i].start_date, "End_Date": this.Table_value[i].end_date, "Reporter_name": this.Table_value[i].reporter_name, "Total_days": this.Table_value[i].total_days })
    }
    this.export_name = this.Table_value[0].emp_name + "_leave_report";
    this.exportservice.exportAsExcelFile(this.export_data, this.export_name, "xlsx");
  }
  exportAsXLS() {
    this.export_data = [];
    for (var i = 0; i < this.Table_value.length; i++) {
      this.export_data.push({ "Employee_Id": this.Table_value[i].emp_id, "Employee_Name": this.Table_value[i].emp_name, "Leave_type": this.Table_value[i].leave_type, "Start_date": this.Table_value[i].start_date, "End_Date": this.Table_value[i].end_date, "Reporter_name": this.Table_value[i].reporter_name, "Total_days": this.Table_value[i].total_days })
    }
    this.export_name = this.Table_value[0].emp_name + "_leave_report";
    this.exportservice.exportAsExcelFile(this.export_data, this.export_name, "xls");
  }
  exportAsCSV() {
    this.export_data = [];
    for (var i = 0; i < this.Table_value.length; i++) {
      this.export_data.push({ "Employee_Id": this.Table_value[i].emp_id, "Employee_Name": this.Table_value[i].emp_name, "Leave_type": this.Table_value[i].leave_type, "Start_date": this.Table_value[i].start_date, "End_Date": this.Table_value[i].end_date, "Reporter_name": this.Table_value[i].reporter_name, "Total_days": this.Table_value[i].total_days })
    }
    this.export_name = this.Table_value[0].emp_name + "_leave_report";
    this.exportservice.exportAsExcelFile(this.export_data, this.export_name, "csv");
  }
}