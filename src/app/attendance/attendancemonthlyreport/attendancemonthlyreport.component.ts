import {
  animate,
  state,
  style,
  transition,
  trigger,
} from "@angular/animations";
import { DatePipe } from "@angular/common";
import { Component, OnInit, ViewChild } from "@angular/core";
import { UntypedFormControl } from "@angular/forms";
import { MatPaginator, PageEvent } from "@angular/material/paginator";
import { MatDatepicker } from "@angular/material/datepicker";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { DomSanitizer } from "@angular/platform-browser";
import moment from "moment";
import { Moment } from "moment-timezone";
import { NgxSpinnerService } from "ngx-spinner";
import { AttendanceServiceService } from "../../services/attendance-service.service";
import { Router } from "@angular/router";
import { noDataMessage } from "../../util/constants";
import * as tablePageOption from "../../util/table-pagination-option";

@Component({
  selector: "app-attendancemonthlyreport",
  templateUrl: "./attendancemonthlyreport.component.html",
  styleUrls: ["./attendancemonthlyreport.component.less"],
  animations: [
    trigger("detailExpand", [
      state(
        "void",
        style({ height: "0px", minHeight: "0", visibility: "hidden" })
      ),
      state("*", style({ height: "*", visibility: "visible" })),
      transition("void <=> *", animate("225ms cubic-bezier(0.4, 0.0, 0.2, 1)")),
    ]),
  ],
})
export class AttendancemonthlyreportComponent implements OnInit {
  nodataMswg = noDataMessage;
  displayedColumns: string[] = [
    "date",
    "firstIn",
    "lastout",
    "activeHours",
    "inactiveHours",
    "timediff",
    "Logs",
  ];
  dataSource: MatTableDataSource<any>;
  expand_details: any[];
  alldetails: any;
  monthlyresponse: any;
  startdates: any;
  enddates: any;
  emp_name: any;
  email: string | null;
  yearofmonth: string;
  Filter: boolean;
  filterData: string;
  maxDate: Date;
  matpagesize: number = 5;
  matpageindex: number = 0;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  datepicker: UntypedFormControl;
  date = new UntypedFormControl(moment());
  today: any;
  nextdisable: boolean = true;
  lastlog: number;
  pageSize: number = 10;
  tablePaginationOption: number[];

  constructor(
    private attendanceService: AttendanceServiceService,
    private spinner: NgxSpinnerService,
    private domSanitizer: DomSanitizer,
    private router: Router,
    public datepipe: DatePipe
  ) {}
  ngOnInit() {
    this.email = localStorage.getItem("Email");
    this.emp_name = localStorage.getItem("Name");
    this.alldetails = [];
    this.startdates = new Date();
    this.maxDate = new Date();
    // this.datepicker = new FormControl(new Date());
    this.date.setValue(new Date());
    const date = new Date(this.startdates);
    this.startdates = new Date(date.getFullYear(), date.getMonth(), 1);
    this.today = this.datepipe.transform(this.startdates, "dd-MM-yyyy");
    this.enddates = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    this.getmonthlyReport();
  }

  // chosenYearHandler(normalizedYear: Moment) {
  //   const ctrlValue = this.date.value;
  //   // ctrlValue.year(normalizedYear.year());
  //   // this.date.setValue(normalizedYear);
  // }

  chosenMonthHandler(
    normalizedMonth: Moment,
    datepicker: MatDatepicker<Moment>
  ) {
    const ctrlValue = this.date.value;
    // ctrlValue.month(normalizedMonth.month());
    this.date.setValue(normalizedMonth);

    var date1 = moment(normalizedMonth).format("YYYY-MM-DD");
    const date = new Date(date1);
    this.startdates = new Date(date.getFullYear(), date.getMonth(), 1);
    // console.log(this.startdates);
    this.enddates = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    // console.log(this.enddates);
    let datestr = this.datepipe.transform(this.startdates, "dd-MM-yyyy");
    if (this.today == datestr) {
      this.nextdisable = true;
    } else {
      this.nextdisable = false;
    }
    this.getmonthlyReport();
    datepicker.close();
  }

  // ! expand row to show logs
  details(data: any) {
    if (this.lastlog != undefined && this.lastlog != data) {
      var activelog = document.getElementById("logId" + this.lastlog);
      activelog.click();
    }
    if (this.lastlog == data) {
      this.lastlog = undefined;
    } else {
      this.lastlog = data;
    }
    var index = this.matpageindex * this.matpagesize + data;
    this.expand_details = this.alldetails[index];
  }
  next() {
    const date = new Date(this.startdates);
    this.startdates = new Date(date.getFullYear(), date.getMonth() + 1, 1);
    this.enddates = new Date(date.getFullYear(), date.getMonth() + 2, 0);
    this.date.setValue(this.startdates);
    let datestr = this.datepipe.transform(this.startdates, "dd-MM-yyyy");
    if (this.today == datestr) {
      this.nextdisable = true;
    } else {
      this.nextdisable = false;
    }
    this.getmonthlyReport();
  }
  previous() {
    const date = new Date(this.startdates);
    this.startdates = new Date(date.getFullYear(), date.getMonth() - 1, 1);
    this.enddates = new Date(date.getFullYear(), date.getMonth(), 0);
    this.date.setValue(this.startdates);
    let datestr = this.datepipe.transform(this.startdates, "dd-MM-yyyy");
    if (this.today == datestr) {
      this.nextdisable = true;
    } else {
      this.nextdisable = false;
    }
    this.getmonthlyReport();
  }

  resetlog(event?: PageEvent) {
    this.pageSize = event.pageSize;
    this.matpageindex = event.pageIndex;
    if (this.lastlog != undefined) {
      var activelog = document.getElementById("logId" + this.lastlog);
      if (activelog != null) {
        activelog.click();
      }
    }
    if (this.matpagesize > event.pageSize) {
      if (!(this.lastlog < event.pageSize)) {
        this.lastlog = undefined;
      }
    }
    this.matpagesize = event.pageSize;
  }
  getmonthlyReport() {
    this.spinner.show();
    this.lastlog = undefined;
    let formdata = {
      email: this.email,
      startdate: this.formatedate(this.startdates),
      enddate: this.formatedate(this.enddates),
    };
    // this.attendanceService.getMonthreportdata(formdata).subscribe(data => {
    //   if (data.map.statusMessage == "Success") {
    //     let response: any[] = JSON.parse(data.map.report);
    //     this.tablePaginationOption = tablePageOption.tablePaginationOption(response.length);
    //     this.monthlyresponse = response.reverse();
    //     this.alldetails = JSON.parse(data.map.details).reverse();
    //     // console.log(this.alldetails);
    //     for (var i = 0; i < this.alldetails.length; i++) {
    //       for (var j = 0; j < this.alldetails[i].length; j++) {
    //         // console.log(this.alldetails[i][j]);
    //         if (this.alldetails[i][j].image) {
    //           let stringArray = new Uint8Array(this.alldetails[i][j].image);
    //           const STRING_CHAR = stringArray.reduce((data, byte) => {
    //             return data + String.fromCharCode(byte);
    //           }, '');
    //           let base64String = btoa(STRING_CHAR);
    //           this.alldetails[i][j].image = this.domSanitizer.bypassSecurityTrustUrl("data:image/jpeg;base64," + base64String);
    //         }

    //       }

    //     }
    //     // console.log(this.alldetails);
    //     this.dataSource = new MatTableDataSource(response);
    //     this.matpageindex = 0;
    //     this.paginator.firstPage();
    //     this.dataSource.paginator = this.paginator;
    //     this.dataSource.sort = this.sort;
    //     setTimeout(() => {
    //       this.spinner.hide();
    //     }, 4000);
    //   }
    //   else {
    //     setTimeout(() => {
    //       this.spinner.hide();
    //     }, 4000);
    //     // console.log(data);
    //   }
    // }, (error) => {
    //   this.router.navigate(["/404"]);
    //   this.spinner.hide();
    // })
    this.attendanceService.getMonthreportdata(formdata).subscribe(
      (data) => {
        if (data.map.statusMessage == "Success") {
          let response: any[] = JSON.parse(data.map.report);
          this.tablePaginationOption = tablePageOption.tablePaginationOption(
            response.length
          );
          this.monthlyresponse = response.reverse();
          this.alldetails = JSON.parse(data.map.details).reverse();

          // Async function to process the images
          const processImagesAsync = async () => {
            for (let i = 0; i < this.alldetails.length; i++) {
              for (let j = 0; j < this.alldetails[i].length; j++) {
                if (this.alldetails[i][j].image) {
                  let stringArray = new Uint8Array(this.alldetails[i][j].image);
                  const STRING_CHAR = stringArray.reduce((data, byte) => {
                    return data + String.fromCharCode(byte);
                  }, "");
                  let base64String = btoa(STRING_CHAR);
                  this.alldetails[i][j].image =
                    this.domSanitizer.bypassSecurityTrustUrl(
                      "data:image/jpeg;base64," + base64String
                    );
                }
                // Introduce a delay of 500 milliseconds after processing each image
                await new Promise((resolve) => setTimeout(resolve, 500));
              }
            }
          };
          processImagesAsync();
          // Images processed, continue with other operations
          this.dataSource = new MatTableDataSource(response);
          this.matpageindex = 0;
          this.paginator.firstPage();
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;
          this.spinner.hide();
        } else {
          this.spinner.hide();
        }
      },
      (error) => {
        this.router.navigate(["/404"]);
        this.spinner.hide();
      }
    );
  }

  // filter
  applyFilter(event: Event) {
    this.Filter = false;
    this.filterData = (event.target as HTMLInputElement).value;
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.filteredData.length == 0) {
      this.Filter = true;
    }
    if (this.dataSource.paginator) {
      this.dataSource.paginator = this.paginator;
    }
  }

  formatedate(string: string) {
    var date = new Date(string),
      mnth = ("0" + (date.getMonth() + 1)).slice(-2),
      day = ("0" + date.getDate()).slice(-2);
    // this.yearofmonth=mnth+' '+date.getFullYear();
    this.yearofmonth = date.getMonth() + 1 + " " + date.getFullYear();
    // this.yearofmonth =  date.getMonth() + 1, 1;
    return [day, mnth, date.getFullYear()].join("-");
  }
}
