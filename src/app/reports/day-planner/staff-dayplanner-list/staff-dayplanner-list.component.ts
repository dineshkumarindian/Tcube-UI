import { Component, OnInit, ViewChild } from '@angular/core';
import { UntypedFormControl, Validators } from '@angular/forms';
import { EmployeeService } from '../../../services/employee.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { Router } from '@angular/router';
import { ReplaySubject, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MatSelect } from '@angular/material/select';
import { MatOption } from '@angular/material/core';
import moment from 'moment';
import { DayPlannerService } from '../../../services/day-planner/day-planner.service';
import { noDataMessage } from '../../../util/constants';
import * as Highcharts from 'highcharts/highstock';
import Drilldown from 'highcharts/modules/drilldown';
Drilldown(Highcharts);
import { AttendanceServiceService } from '../../../services/attendance-service.service';
import { NgxCaptureService } from 'ngx-capture';
import { jsPDF } from 'jspdf';
import { ExportService } from '../../../services/export.service';
import { element } from 'protractor';
import * as XLSX from 'xlsx';
import {errorMessage} from '../../../util/constants';
@Component({
  selector: 'app-staff-dayplanner-list',
  templateUrl: './staff-dayplanner-list.component.html',
  styleUrls: ['./staff-dayplanner-list.component.less']
})
export class StaffDayplannerListComponent implements OnInit {

  org_id: any;
  ativateemployeeData: any = [];
  employee_ids: any = [];
  employeeData: any = [];
  inativateemployeeData: any = [];
  reportsDetails: any[] = [];
  maxDate = new Date();
  requiredMessage = errorMessage;
  loading: boolean = false;

  public userCtrl: UntypedFormControl = new UntypedFormControl("", [Validators.required]);
  public userFilterCtrl: UntypedFormControl = new UntypedFormControl();
  public filtereduser: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);
  protected _onDestroy = new Subject<void>();

  public dateCtrl: UntypedFormControl = new UntypedFormControl("", [Validators.required]);
  public dateFilterCtrl: UntypedFormControl = new UntypedFormControl();
  public filtereddate: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);
  protected dateData: any[] = [
    // { data: 'Today', id: 1 },
    // { data: 'Yesterday', id: 2 },
    { data: 'This week', id: 3 },
    { data: 'Last week', id: 4 },
    { data: 'This Month', id: 5 },
    { data: 'Last Month', id: 6 },
    { data: 'This Year', id: 7 },
    { data: 'Last Year', id: 8 },
    { data: 'Custom Date', id: 9 },
  ];
  email: any;
  employee: any;
  empId: any;
  customdate: boolean = false;
  customdatevalidation: boolean = false;
  daterangevalidation: boolean = false;
  startdates: any;
  enddates: any;
  start = new UntypedFormControl("", [Validators.required]);
  end = new UntypedFormControl("", [Validators.required]);
  list_empId = [];
  show: boolean = false;
  day_planner_reports: boolean = false;
  single_user_details: any[] = [];
  No_Data_single_user: boolean = false;
  plan_for_the_day_count: number = 0;
  update_for_the_day_count: number = 0;
  // missing_day_planner_counts: number = 0;
  nodataMsg = noDataMessage;
  no_data_found_day_planner_status: boolean = false;
  is_day_planner_counts: boolean = false;
  options: any;
  activeUser: boolean = true;
  inactiveUser: boolean = false;
  not_available_day_planner = false;
  No_Data_Found: boolean = false;
  // isPanelExpanded: boolean = false;

  // plan_Days_percentage: number = 0;
  // update_Days_percentage: number = 0;
  // not_posted_percentage: number = 0;
  // checkInCounts: number = 0;
  // expandedPanels :any;
  panelExpansionState: boolean[] = [];


  @ViewChild('singleSelect', { static: true }) singleSelect: MatSelect;
  @ViewChild('select', { static: true }) select: MatSelect;
  @ViewChild('screen', { static: true }) screen: any;

  constructor(private employeeService: EmployeeService,
    private spinner: NgxSpinnerService,
    private router: Router,
    private dayPlannerService: DayPlannerService,
    private attendanceServiceService: AttendanceServiceService,
    private captureService: NgxCaptureService,
    private exportservice: ExportService) {
    // this.expandedPanels = this.reportsDetails.map(() => true);
  }

  ngOnInit(): void {
    this.org_id = localStorage.getItem("OrgId");
    this.day_planner_reports = false;
    this.getOrgEmployees();
    this.filtereduser.next(this.employeeData.slice());

    // listen for search field value changes
    this.userFilterCtrl.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        this.filterEmployee();
      });
    this.filtereddate.next(this.dateData.slice());
    // listen for search field value changes
    this.dateFilterCtrl.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        this.filterDate();
      });
  }
  getOrgEmployees() {
    this.spinner.show();
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
        this.spinner.hide();
      } else {
        this.spinner.hide();
      }
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
    })
  }

  dayPlannerActiveUser() {
    this.activeUser = true;
    this.inactiveUser = false;
    this.No_Data_Found = false;
    if (this.activeUser == true) {
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
    this.day_planner_reports = false;

  }
  dayPlannerInActiveUser() {
    this.activeUser = false;
    this.inactiveUser = true;
    this.No_Data_Found = false;
    if (this.inactiveUser == true) {
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
    this.day_planner_reports = false;
    // this.allSelected = false;

  }
  cancelform() {
    this.show = false;
    this.No_Data_Found = false;
    this.start = new UntypedFormControl("", [Validators.required]);
    this.end = new UntypedFormControl("", [Validators.required]);
    this.dateCtrl = new UntypedFormControl("", [Validators.required]);
    this.userCtrl = new UntypedFormControl("", [Validators.required]);
    this.customdate = false;
    this.customdatevalidation = false;
    this.daterangevalidation = false;
    this.day_planner_reports = false;
  }

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

  //-------------------------Select Employeedetails-----------------------------
  length: any = [];
  selectEmploy(event) {
    this.empId = event;
    this.single_user_details = this.ativateemployeeData.filter(obj => obj.id === event);
    if (this.single_user_details.length == 0) {
      this.single_user_details = this.inativateemployeeData.filter(obj => obj.id === event);
    }
  }

  // allSelected = false;
  // toggleAllSelection() {
  //   if (this.allSelected) {
  //     this.select.options.forEach((item: MatOption) => item.select());
  //   } else {
  //     this.select.options.forEach((item: MatOption) => item.deselect());
  //   }
  // }
  // optionClick() {
  //   let newStatus = true;
  //   this.select.options.forEach((item: MatOption) => {
  //     if (!item.selected) {
  //       newStatus = false;
  //     }
  //   });
  //   this.allSelected = newStatus;

  // }

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
      if (data == "This Year") {
        this.startdates = moment().startOf("years").format("YYYY-MM-DD");
        this.enddates = moment().endOf("years").format("YYYY-MM-DD");
      }
      if (data == "Last Year") {
        this.startdates = moment().subtract(1, 'years').startOf("years").format("YYYY-MM-DD");
        this.enddates = moment().subtract(1, 'years').endOf("years").format("YYYY-MM-DD");
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

  //  ! To Date field validation
  todatechange() {
    if (this.end.value == "") {
      this.customdatevalidation = false;
    }
    else {
      this.customdatevalidation = true;
    }
  }

  findreport() {
    this.show = true;
    this.day_planner_reports = true;
    this.No_Data_Found = false;
    this.getActiveLeaveTypeByOrgIdAndDatesForData();
    this.getTotalCheckInCounts();
  }



  async getActiveLeaveTypeByOrgIdAndDatesForData() {
    this.spinner.show();
    let start_date;
    let end_date;
    this.reportsDetails = [];
    this.list_empId = [];
    this.No_Data_single_user = false;
    this.is_day_planner_counts = false;
    this.plan_for_the_day_count = 0;
    this.update_for_the_day_count = 0;
    if (this.customdate == true) {
      this.startdates = moment(this.start.value).toDate();
      this.enddates = moment(this.end.value).toDate();
    }
    start_date = moment(this.startdates).format("YYYY-MM-DD");
    end_date = moment(this.enddates).format("YYYY-MM-DD");
    this.list_empId.push(this.empId);
    let data: Object = {
      "emp_id": this.list_empId,
      "org_id": parseInt(localStorage.getItem("OrgId")),
      "start_date": start_date,
      "end_date": end_date,
    }
    await this.dayPlannerService.getDayPlannerReportsDetails(data).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        let response: any[] = JSON.parse(data.map.data);
        // console.log("getDayPlannerReportsDetails...",response);
        let date_of_start = start_date;
        let date_of_end = end_date;
        while (date_of_start <= date_of_end) {
          let date: any = date_of_start;
          let reports_details: any[] = response.filter(obj => obj.date === date);
          if (reports_details.length > 0) {
            let data = {
              "date": date,
              "reports": reports_details
            }
            this.reportsDetails.push(data);
          }
          date_of_start = moment(date).add(1, 'days').format('YYYY-MM-DD');
        }
        if (this.reportsDetails.length > 0) {
          this.No_Data_single_user = false;
        } else {
          this.No_Data_single_user = true;
        }
        for (let i = 0; i < this.reportsDetails.length; i++) {
          let data = this.reportsDetails[i].reports;
          data.forEach(element => {
            if (element.is_submitted == true) {
              this.reportsDetails[i].post_to_channel = true;
              // this.plan_for_the_day_count = this.plan_for_the_day_count + 1;
            }
            if (element.is_updated == true) {
              this.reportsDetails[i].update_to_channel = true;
              // this.update_for_the_day_count = this.plan_for_the_day_count + 1;
            }
          });
          if (this.reportsDetails[i].post_to_channel == true) {
            this.plan_for_the_day_count = this.plan_for_the_day_count + 1;
          }
          if (this.reportsDetails[i].update_to_channel == true) {
            this.update_for_the_day_count = this.update_for_the_day_count + 1;
          }
        }
        if (this.plan_for_the_day_count == 0) {
          this.is_day_planner_counts = true;
        }
        // this.isPanelExpanded = true;
        // this.reportsDetails.p
        // console.log(this.plan_for_the_day_count + " " + this.update_for_the_day_count);
        // console.log(this.reportsDetails);
        // this.tablePaginationOption = tablePageSize.tablePaginationOption(response.length);
        // if (response.length > 0) {
        // }
      } else {
        this.No_Data_single_user = false;
      }
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
    });
  }


  checkInCounts = 0;
  plan_Days_percentage = 0;
  update_Days_percentage = 0;
  missing_day_planner_counts = 0;
  not_posted_percentage = 0;
  async getTotalCheckInCounts() {
    this.spinner.show();
    this.no_data_found_day_planner_status = false;
    let start_date = moment(this.startdates).format("YYYY-MM-DD");
    let end_date = moment(this.enddates).format("YYYY-MM-DD");
    let data = {
      "mail": this.single_user_details[0].mail,
      "startdate": start_date,
      "enddate": end_date,
    }
    await this.attendanceServiceService.getUserInActionCount(data).subscribe(data => {
      if (data.map.statusMessage = "Success") {
        let counts = data.map.data;
        this.checkInCounts = counts;
        // console.log("total_checkin_counts", this.checkInCounts);
        this.plan_Days_percentage = (this.plan_for_the_day_count / this.checkInCounts) * 100;
        if (isNaN(this.plan_Days_percentage) || this.plan_Days_percentage < 0) {
          this.plan_Days_percentage = 0;
        }
        this.update_Days_percentage = (this.update_for_the_day_count / this.checkInCounts) * 100;
        if (isNaN(this.update_Days_percentage) || this.plan_Days_percentage < 0) {
          this.update_Days_percentage = 0;
        }
        this.not_posted_percentage = 100 - this.plan_Days_percentage;
        if (isNaN(this.not_posted_percentage)) {
          this.not_posted_percentage = 0;
        }
        // console.log("plan_percentage", this.plan_Days_percentage + "update_percentage", this.update_Days_percentage + "not_posted_percentage", this.not_posted_percentage);
        this.missing_day_planner_counts = this.checkInCounts - this.plan_for_the_day_count;
        if (isNaN(this.missing_day_planner_counts) || this.missing_day_planner_counts < 0) {
          this.missing_day_planner_counts = 0;
        }
        if (this.plan_for_the_day_count == 0 && this.update_for_the_day_count == 0 && this.missing_day_planner_counts == 0) {
          this.no_data_found_day_planner_status = true;
        } else {
          // setTimeout(() => {
          Highcharts.chart('piechart', this.setchartoption());
          // }, 1000);
          // this.spinner.hide();
        }
        if (this.No_Data_single_user && this.is_day_planner_counts && this.no_data_found_day_planner_status) {
          this.No_Data_Found = true;
        } else {
          this.No_Data_Found = false;
        }
        this.spinner.hide();


      } else {
        this.spinner.hide();
        this.missing_day_planner_counts = 0;
        this.not_posted_percentage = 100;
      }
    })

  }


  setchartoption() {
    this.options = {
      chart: {
        plotBackgroundColor: null,
        plotBorderWidth: null,
        plotShadow: false,
        type: 'pie'
      },
      title: {
        text: ''
      },
      tooltip: {
        valueSuffix: '%'
      },
      // subtitle: {
      //   text:
      //     'Source:<a href="https://www.mdpi.com/2072-6643/11/3/684/htm" target="_default">MDPI</a>'
      // },
      plotOptions: {
        series: {
          allowPointSelect: true,
          cursor: 'pointer',
          dataLabels: [{
            enabled: true,
            distance: 20
          }, {
            enabled: true,
            distance: -40,
            format: '{point.percentage.1f}%',
            style: {
              fontSize: '1.2em',
              textOutline: 'none',
              opacity: 0.7
            },
            filter: {
              operator: '>',
              property: 'percentage',
              value: 10
            }
          }],
          showInLegend: true
        }
      },
      series: [
        {
          name: 'Percentage',
          colorByPoint: true,
          data: [
            {
              name: 'Plan For The Day',
              y: this.plan_Days_percentage
            },
            {
              name: 'Update For The Day',
              y: this.update_Days_percentage
            },
            {
              name: 'No Plan For The Day',
              y: this.not_posted_percentage
            },
          ]
        }
      ],
      credits: {
        enabled: false
      }
    }
    return this.options;
  }

  export_data: any = [];
  exportAsXLSX(): void {
    this.export_data = [];
    this.loading = true;
    let start_date = moment(this.startdates).format("DD-MM-YYYY");
    let end_date = moment(this.enddates).format("DD-MM-YYYY");
    for (var i = 0; i < this.reportsDetails.length; i++) {
      for (var j = 0; j < this.reportsDetails[i].reports.length; j++) {
        let data = this.reportsDetails[i].reports[j];
        this.export_data.push({ "Employee_Id": data.emp_id, "Employee_Name": data.emp_name, "Task": data.day_task, "Date": data.date, "Project": data.project_name, "Status": data.status });
      }
    }
    const groupedData = this.groupBy(this.export_data, 'Date');
    const fileName = this.single_user_details[0].name + "(" + start_date + " to " + end_date + ")" + " report" + ".xlsx";
    const firstSheetName = "Summary";
    let wb = XLSX.utils.book_new();
    let ws: XLSX.WorkSheet;
    let dayPlannerExportCount: any = ({ "Plan for the day": this.plan_for_the_day_count, "Update for the day": this.update_for_the_day_count, "No plan for the day": this.missing_day_planner_counts });
    let firstSheet = XLSX.utils.json_to_sheet([dayPlannerExportCount]);
    XLSX.utils.book_append_sheet(wb, firstSheet, firstSheetName);
    // console.log("1193==>",firstSheet);
    Object.keys(groupedData).forEach((k, index) => {
      let sheetName = groupedData[k][0].Date;
      let sheetDateName = moment(sheetName).format("DD-MM-YYYY");
      // let sheetName1 = index === 0 ? firstSheetName : `${sheetName}`;
      ws = XLSX.utils.json_to_sheet(groupedData[k]);
      XLSX.utils.book_append_sheet(wb, ws, sheetDateName);
    })
    XLSX.writeFile(wb, fileName);
    this.loading = false;
  }
  // this.exportservice.exportAsExcelFile(this.export_data, this.single_user_details[0].name + "(" + start_date + " to " + end_date + " report", "xlsx");
  exportAsXLS() {
    this.export_data = [];
    this.loading = true;
    let start_date = moment(this.startdates).format("DD-MM-YYYY");
    let end_date = moment(this.enddates).format("DD-MM-YYYY");
    for (var i = 0; i < this.reportsDetails.length; i++) {
      for (var j = 0; j < this.reportsDetails[i].reports.length; j++) {
        let data = this.reportsDetails[i].reports[j];
        this.export_data.push({ "Employee_Id": data.emp_id, "Employee_Name": data.emp_name, "Task": data.day_task, "Date": data.date, "Project": data.project_name, "Status": data.status });
      }
    }
    const groupedData = this.groupBy(this.export_data, 'Date');
    console.log(groupedData);
    const fileName = this.single_user_details[0].name + "(" + start_date + " to " + end_date + ")" + " report" + ".xls";
    const firstSheetName = "Summary";
    let wb = XLSX.utils.book_new();
    let ws: XLSX.WorkSheet;
    let dayPlannerExportCount: any = ({ "Plan for the day": this.plan_for_the_day_count, "Update for the day": this.update_for_the_day_count, "No plan for the day": this.missing_day_planner_counts });
    let firstSheet = XLSX.utils.json_to_sheet([dayPlannerExportCount]);
    // console.log("1193==>",firstSheet);
    XLSX.utils.book_append_sheet(wb, firstSheet, firstSheetName);
    Object.keys(groupedData).forEach((k, index) => {
      let sheetName = groupedData[k][0].Date;
      let sheetDateName = moment(sheetName).format("DD-MM-YYYY");
      // let sheetName1 = index === 0 ? firstSheetName : `${sheetName}`;
      // ws = index === 0 ? firstSheet : XLSX.utils.json_to_sheet(groupedData[k]);
      ws = XLSX.utils.json_to_sheet(groupedData[k]);
      XLSX.utils.book_append_sheet(wb, ws, sheetDateName);
    })
    XLSX.writeFile(wb, fileName);
    this.loading = false;
    // this.exportservice.exportAsExcelFile(this.export_data, this.single_user_details[0].name + "(" + start_date + " to " + end_date + " report", "xls");
  }

  // exportAsCSV() {
  //   this.export_data = [];
  //   let start_date = moment(this.startdates).format("YYYY-MM-DD");
  //   let end_date = moment(this.enddates).format("YYYY-MM-DD");
  //   for (var i = 0; i < this.reportsDetails.length; i++) {
  //     for (var j = 0; j < this.reportsDetails[i].reports.length; j++) {
  //       let data = this.reportsDetails[i].reports[j];
  //       this.export_data.push({ "Employee_Id": data.emp_id, "Employee_Name": data.emp_name, "Task": data.day_task, "Date": data.date, "Project": data.project_name, "Status": data.status });
  //     }
  //   }
  //   const groupedData = this.groupBy(this.export_data, 'Date');
  //   console.log(groupedData);
  //   const fileName = this.single_user_details[0].name + "(" + start_date + " to " + end_date + ")"+" report" + ".csv";
  //   const firstSheetName = "Summary";
  //   let wb = XLSX.utils.book_new();
  //   let ws: XLSX.WorkSheet;
  //   let dayPlannerExportCount: any = ({ "Plan for the day": this.plan_for_the_day_count, "Update for the day": this.update_for_the_day_count, "No plan for the day": this.missing_day_planner_counts });
  //   let firstSheet = XLSX.utils.json_to_sheet([dayPlannerExportCount]);
  //   XLSX.utils.book_append_sheet(wb, firstSheet, firstSheetName);
  //   Object.keys(groupedData).forEach((key) => {
  //     let sheetName = key;
  //     console.log(groupedData[key]);
  //     let ws = XLSX.utils.json_to_sheet([groupedData[key]]);
  //     XLSX.utils.book_append_sheet(wb,ws,sheetName);
  //   })
  //     // let sheetName = groupedData[k][0].Date;
  //     // let sheetName1 = index === 0 ? firstSheetName : `${sheetName}`;
  //     // ws = index === 0 ? firstSheet : XLSX.utils.json_to_sheet(groupedData[k]);
  //     // XLSX.utils.book_append_sheet(wb, ws, sheetName1);
  //   // })
  //   XLSX.writeFile(wb, fileName);
  //   // this.exportservice.exportAsExcelFile(this.export_data, this.single_user_details[0].name + "(" + start_date + " to " + end_date + ")" + " report", "csv");
  // }

  groupBy(array, key) {
    return array.reduce((result, currentValue) => {
      const groupKey = currentValue[key];
      if (!result[groupKey]) {
        result[groupKey] = [];
      }
      result[groupKey].push(currentValue);
      return result;
    }, {});
  }
  // isPanelExpanded(index: number): boolean {
  //   // Use this method to determine the expansion state of each panel dynamically
  //   return this.expandedPanels[index];
  // }
  // imgBase64 = '';
  // loading: boolean = false;
  // capture(data) {
  //   for(let i=0;i<this.reportsDetails.length;i++){
  //     this.togglePanel(i);
  //   }
  //   this.loading = true;
  //   this.captureService
  //     .getImage(this.screen.nativeElement, true)
  //     .toPromise()
  //     .then((img) => {
  //       this.imgBase64 = img;
  //       if (data == "png") {
  //         this.convertToPNG();
  //       }
  //       else if (data == "pdf") {
  //         this.convertToPDF();
  //       }
  //     })
  //     .catch((error) => {
  //       this.router.navigate(["/404"]);
  //     });
  // }

  // convertToPNG() {
  //   const element = document.createElement('a');
  //   element.setAttribute('href', this.imgBase64);
  //   element.setAttribute('download', "dinesh" + ' report.png');
  //   element.setAttribute('type', 'image/png');
  //   element.style.display = 'none';
  //   document.body.appendChild(element);
  //   element.click();
  //   document.body.removeChild(element);
  //   this.loading = false;
  // }

  // convertToPDF() {
  //   const doc = new jsPDF();
  //   const imgData = this.imgBase64;
  //   // Get the dimensions of the PDF page
  //   const pageSize = doc.internal.pageSize;
  //   const pageWidth = pageSize.getWidth();
  //   const pageHeight = pageSize.getHeight();

  //   // Calculate the desired dimensions and positioning for the image
  //   const imageWidth = pageWidth; // Adjust as needed, leaving 10 units of margin on each side
  //   const imageHeight = (pageHeight); // Maintain the aspect ratio, adjust the factor (100) as needed
  //   const imageX = null; // Center the image horizontally
  //   const imageY = null;

  //   // Set the font size to increase the size of the content
  //   const fontSize = 12; // Adjust as needed, increase to make the content larger

  //   doc.setFontSize(fontSize);
  //   doc.addImage(imgData, 'PNG', imageX, imageY, imageWidth, imageHeight, '', 'FAST');
  //   doc.save("dinesh" + ' report.pdf');
  //   this.loading = false;
  // }
  // togglePanel(index: number) {
  //   this.panelExpansionState[index] = !this.panelExpansionState[index];
  // }

}
