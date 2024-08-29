import { DatePipe } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { Subscription } from 'rxjs';
import { AttendanceServiceService } from '../../services/attendance-service.service';
import { PreviewImageComponent } from './preview-image/preview-image.component';
import { noDataMessage } from '../../util/constants';

@Component({
  selector: 'app-employee-section',
  templateUrl: './employee-section.component.html',
  styleUrls: ['./employee-section.component.less']
})
export class EmployeeSectionComponent implements OnInit, OnDestroy {
  nodataMsg = noDataMessage;
  displayedactiveEmpColumns: string[] = ['image', 'email', 'name', 'designation', 'time', 'Status'];
  dataSource3: MatTableDataSource<any>;
  activeemploader: boolean = true;
  activeemp: boolean = true;
  filtertoggle: boolean  = false;
  Filter: boolean;
  filterData: string;
  subscriptions: Subscription[] = [];
  dashtable: boolean;
  constructor(public dialog: MatDialog, public router: Router,
    private attendanceService: AttendanceServiceService,
    private spinner: NgxSpinnerService,
    public datepipe: DatePipe,
    private domSanitizer: DomSanitizer,) { }

  ngOnInit() {
    this.getactiveemployeebydate();
    if (localStorage.getItem("Role") === "org_admin") {
      this.dashtable = true;
    } else {
      this.dashtable = false;
    }
  }
  ngOnDestroy() {
    this.subscriptions.forEach(x => {
      if (!x.closed) {
        x.unsubscribe();
      }
    });
  }
  getactiveemployeebydate() {
    this.spinner.show();
    let datefm = this.datepipe.transform(new Date(), 'dd-MM-yyyy');
    let formdata = {
      "org_id": localStorage.getItem("OrgId"),
      "date": datefm,
    }
    let subscription = this.attendanceService.getActiveEmployeeDetails(formdata).subscribe(data => {
      this.activeemploader = true;
      if (data.map.statusMessage == "Success") {
        // console.log(data.map)
        let response: any[] = JSON.parse(data.map.data);
        // console.log(response);
        for (var i = 0; i < response.length; i++) {
          if (response[i].image != undefined) {
            // debugger
            let stringArray = new Uint8Array(response[i].image);
            const STRING_CHAR = stringArray.reduce((data, byte) => {
              return data + String.fromCharCode(byte);
            }, '');
            let base64String = btoa(STRING_CHAR);
            response[i].image = this.domSanitizer.bypassSecurityTrustUrl("data:image/jpeg;base64," + base64String);
          }
          else {
            response[i].image = "assets/images/user_person.png";
          }
        }
        this.activeemploader = false;
        // response = [];
        this.dataSource3 = new MatTableDataSource(response);

        if (response.length > 0) {
          this.activeemp = false;
        }
        setTimeout(() => {
          this.spinner.hide();
        }, 2000);
      }
      else {
        this.activeemploader = false;
        setTimeout(() => {
          this.spinner.hide();
        }, 2000);
      }

    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
    })
    this.subscriptions.push(subscription);


  }

  
  profileImage(event: any) {
    const dialogRef = this.dialog.open(PreviewImageComponent, {
      // width: '40%',
      // height: '450px',
      // maxHeight: '500px',
      panelClass: 'my-custom-dialog-class',
      data: {
        event: event, employeedetails: this.dataSource3
        
      }
    });
  }
  
  // filter
  applyFilter(event: Event) {
    this.Filter = false;
    this.filterData = (event.target as HTMLInputElement).value;
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource3.filter = filterValue.trim().toLowerCase();
    if (this.dataSource3.filteredData.length == 0) {
      this.Filter = true;
    }
    // if (this.dataSource3.paginator) {
    //   this.dataSource3.paginator = this.paginator;
    // }
  }
  filter_toggle(){
    if(this.filtertoggle){
      this.filtertoggle = false;
      this.dataSource3.filter = '';
    }
    else{
      this.filtertoggle = true;
    }
  }


  

  // empname(event: any) {
  //   const dialogRef = this.dialog.open(PreviewImageComponent, {
  //     data: event
  //   });
  // }
  // console.log("Image view");


}
