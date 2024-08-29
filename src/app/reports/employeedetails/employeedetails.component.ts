import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator} from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { SettingsService } from 'src/app/services/settings.service';
import {noDataMessage} from '../../util/constants';


@Component({
  selector: 'app-employeedetails',
  templateUrl: './employeedetails.component.html',
  styleUrls: ['./employeedetails.component.less']
})
export class EmployeedetailsComponent implements OnInit {
  noDataMsg = noDataMessage;
  displayedColumns: string[] = ['id', 'firstname', 'lastname', 'email', 'designation', 'role', 'is_activated'];
  dataSource: MatTableDataSource<any>;
  alldetails: any;
  yearofmonth: string;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  constructor( private spinner: NgxSpinnerService, private settingsService:SettingsService, private router : Router,) { }
  ngOnInit() {
    this.getemployeereport();
  }
  getemployeereport(){
    this.spinner.show();
    this.settingsService.getAllEmployeeReportsByOrgId(localStorage.getItem("OrgId")).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        
        let response: any[] = JSON.parse(data.map.data);
        this.alldetails= response;
        this.dataSource = new MatTableDataSource(response);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        setTimeout(() => {
          this.spinner.hide();
        }, 2000);
      }
      else {
        setTimeout(() => {
          this.spinner.hide();
        }, 2000);
        // console.log(data);
      }
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
    })
    
  }
}
