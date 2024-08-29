import { Component, OnInit, ViewChild } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { MatSelect } from '@angular/material/select';
import { Router } from '@angular/router';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { ReplaySubject, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.less']
})
export class ReportsComponent implements OnInit {

  constructor(public router: Router,) { }

  /** control for the selected bank */
  public reportCtrl: UntypedFormControl = new UntypedFormControl();

  /** control for the MatSelect filter keyword */
  public reportFilterCtrl: UntypedFormControl = new UntypedFormControl();

  /** list of report filtered by search keyword */
  public filteredreport: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);

  @ViewChild('singleSelect', { static: true }) singleSelect: MatSelect;
  /** Subject that emits when the component has been destroyed. */
  protected _onDestroy = new Subject<void>();
  public report: any[] = [
    { "name": "Daily Attendance Status", "id": 1 },
    { "name": "Resources Attendance Report", "id": 2 },
    { "name": "Resources Leave Report", "id": 3 },
    { "name": "Project and Jobs Report", "id": 4 },
    { "name": "Day Planner Reports", "id": 5 },
    { "name": "Time Tracker Reports", "id": 6 }
    // {"name": "Weekly Attendance Report", "id":3},
    // {"name": "Monthly Attendance Report", "id":4},
    // {"name": "Today Task Time Report", "id":5},
    // {"name": "Weekly Task Repor", "id":6},
    // {"name": "Monthly Task Report", "id":7},
    // {"name": "All Jobs Reports with project ", "id":8},
    // {"name": "All Projects Reports", "id":9},
  ];
  ngOnInit() {
    this.filterreport();
    // listen for search field value changes
    this.reportFilterCtrl.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        this.filterreport();
      });

  }
  protected filterreport() {
    if (!this.report) {
      return;
    }
    // get the search keyword
    let search = this.reportFilterCtrl.value;
    if (!search) {
      this.filteredreport.next(this.report.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
    // filter the report
    this.filteredreport.next(
      this.report.filter(report => report.name.toLowerCase().indexOf(search) > -1)
    );
  }
  searchreport(data: any) {
    setTimeout(() => {
      // if(data=="All Employee Details"){
      //   this.router.navigate(['/employeedetails'])
      // }
      if (data == 1) {
        this.router.navigate(['/employeeattendancedatereport']);
      }
      if (data == 2) {
        this.router.navigate(['/userattendancereport']);
      }
      if (data == 3) {
        this.router.navigate(['/user-reports-leavetracker']);
      }
      if (data == 4) {
        this.router.navigate(['/project-jobs-report']);
      } 
      if(data == 5){
        this.router.navigate(['/day-planner-reports']);
      }
      if(data == 6){
        this.router.navigate(['/user-timesheet-reports']);
      }
    }, 500);


  }

}
