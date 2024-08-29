import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ReplaySubject, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ProjectsService } from 'src/app/services/projects.service';
import { SettingsService } from 'src/app/services/settings.service';
import { UtilService } from 'src/app/services/util.service';
import {errorMessage,alreadyExistMessage,validFormat,duplicateName} from '../../../util/constants';

@Component({
  selector: 'app-update-reporting-manager',
  templateUrl: './update-reporting-manager.component.html',
  styleUrls: ['./update-reporting-manager.component.less']
})
export class UpdateReportingManagerComponent implements OnInit {
  validFormatMessage = validFormat;
  requiredMessage = errorMessage;
  existMessage = alreadyExistMessage;
  duplicateName = duplicateName;
header: any;
emp_id: any;
current_manager: any;
protected _onDestroy = new Subject<void>();
reportingManagerForm: UntypedFormGroup;
  constructor(private fb: UntypedFormBuilder,
    private utilService: UtilService,
    private spinner: NgxSpinnerService,
    private router: Router,
    private settingsService: SettingsService,
    @Inject(MAT_DIALOG_DATA) public data,
    public dialogRef: MatDialogRef<UpdateReportingManagerComponent>) { }

  ngOnInit() {
    this.getEmployeeDetailsByOrgId();
    this.reportingManagerForm = this.fb.group({
      // reporting_manager: ['',[Validators.required]],
    })
    this.header = this.data.key;
    this.emp_id = this.data.id;
    this.current_manager = this.data.current_manager;
    this.setFormvalue();
  }

  

  //set form value 
  setFormvalue(){
    this.spinner.show();
    setTimeout(() => {
    this.empCtrl.setValue(this.current_manager);
    }, 500);
    setTimeout(() => {
      this.spinner.hide();
    }, 1000);
  }
  public empCtrl: UntypedFormControl = new UntypedFormControl("", [Validators.required]);
  /** control for the MatSelect filter keyword */
  public empFilterCtrl: UntypedFormControl = new UntypedFormControl(); 
  /** list of bill filtered by search keyword */
  public filteredEmps: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);
  protected filteremp() {
    if (!this.employeeDetails) {
      return;
    }
    // get the search keyword
    let search = this.empFilterCtrl.value;
    if (!search) {
      this.filteredEmps.next(this.employeeDetails.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
    // filter the client
    this.filteredEmps.next(
      this.employeeDetails.filter(list => list.firstname.toLowerCase().indexOf(search) > -1)
    );
  }
  employeeDetails = [];
  getEmployeeDetailsByOrgId() {
    // this.spinner.show();
    let orgId = localStorage.getItem("OrgId");
    //Here I have used the get ACTIVE EMPLOYEE DETAILS API call --> Means its get all user details under the Organization Id
    this.settingsService.getCustomActiveEmpDetailsByOrgID(orgId).subscribe(data => {
      let response: any[] = JSON.parse(data.map.data);
      this.employeeDetails = response;
      // load the initial emp list
      this.filteredEmps.next(this.employeeDetails.slice());
      // listen for search field value changes
      this.empFilterCtrl.valueChanges
        .pipe(takeUntil(this._onDestroy))
        .subscribe(() => {
          this.filteremp();
        });
      // this.spinner.hide();
    }, (error) => {
      this.router.navigate(["/404"]);
      // this.spinner.hide();
    })
  }

  //update reporting manager
  UpadateReporting(){
    this.spinner.show();
    let formdata = {
      "empid": this.emp_id,
      "reporting_manager": this.empCtrl.value
    }
    this.settingsService.updatereportingManager(formdata).subscribe(data =>{
      if (data.map.statusMessage == "Success") {
        this.utilService.openSnackBarAC("Reporting Manager Updated Successfully", "OK");
        this.spinner.hide();
        this.closeDialog();
      }
      else if(data.map.statusMessage == "Failed"){
        this.utilService.openSnackBarMC("Failed to update reporting manager", "OK");
      }else{
        this.utilService.openSnackBarMC("Error in updating reporting manager", "OK");
      }
      this.spinner.hide();
    })
  }

     //function to close the dialog
  //send response of isModified value to the parent component
  closeDialog(){
    this.dialogRef.close({ data: true});
  }
}
