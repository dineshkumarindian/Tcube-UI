import { Component, OnInit, QueryList, ViewChildren } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ReplaySubject, Subject, Subscription } from 'rxjs';
import { RegisterService } from '../../../services/register.service';
import { SettingsService } from '../../../services/settings.service';
import { UtilService } from '../../../services/util.service';
import { takeUntil } from 'rxjs/operators';
import { SelectionModel } from '@angular/cdk/collections';
import {errorMessage,alreadyExistMessage,validFormat} from '../../../util/constants';

@Component({
  selector: 'app-add-designation',
  templateUrl: './add-designation.component.html',
  styleUrls: ['./add-designation.component.less']
})
export class AddDesignationComponent implements OnInit {

  requiredMessage = errorMessage;
  existMessage = alreadyExistMessage;
  validFormatMessage = validFormat;
  is_default_leavetype_created: boolean;
  organizationName:string;
  employeeDetails: any[] = [];
  mailCheck: any = [];
  ifDesignationAvail: boolean = false;
  ifDesignationIdAvail: boolean = true;
  isDesignationEditEnabled: boolean = false;
  designationIdUpdate: any;
  designationDetailsData: any[] = [];
  designationDetails: any[] = [];

  /** list of bill filtered by search keyword */
  public filteredEmps: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);
  /** control for the MatSelect filter keyword */
  public empFilterCtrl: UntypedFormControl = new UntypedFormControl();
  /** control for the MatSelect filter keyword */
  public designationFilterCtrl: UntypedFormControl = new UntypedFormControl();
  /** list of currency filtered by search keyword */
  public filtereddesignation: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);

  @ViewChildren(MatPaginator) paginator = new QueryList<MatPaginator>();
  @ViewChildren(MatSort) sort = new QueryList<MatSort>();
  redirectDesignTab: any;
  constructor(
    private formBuilder: UntypedFormBuilder,
    private settingsService: SettingsService,
    private router: Router,
    public matDialog: MatDialog,
    private utilsService: UtilService,
    private spinner: NgxSpinnerService,
    private registerService: RegisterService,
    private activatedRoute: ActivatedRoute,
  ) {   
}

  /** Subject that emits when the component has been destroyed. */
protected _onDestroy = new Subject<void>();
 //Designation formgroup
 DesignationFormGroup: UntypedFormGroup = this.formBuilder.group({
  designation: ['', [Validators.required, Validators.pattern(/^[^\s]+(\s+[^\s]+)*$/)]],
  responsibilities: [''],
})
  ngOnInit() {
    this.redirectDesignTab = localStorage.getItem("customDesigTab");
    this.getOrgDetailById();
    // this.geEmployeeDetailsByOrgId();
    this.getActiveDesignationDetailsByOrgId();
    this.designationIdUpdate = this.activatedRoute.snapshot.params.id;
    if (this.designationIdUpdate) {
      this.designationFormValue();
    }
    localStorage.removeItem("this.redirectDesignTab");
  }

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
  protected filterDesignation() {
    if (!this.designationDetails) {
      return;
    }
    // get the search keyword
    let search = this.designationFilterCtrl.value;
    if (!search) {
      this.filtereddesignation.next(this.designationDetails.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
    // filter the client
    this.filtereddesignation.next(
      this.designationDetails.filter(designation => designation.designation.toLowerCase().indexOf(search) > -1)
    );
  }

  getOrgDetailById() {
    let orgId = localStorage.getItem('OrgId');
    this.registerService.getOrgDetailsById(orgId).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        let response = JSON.parse(data.map.data);
        this.is_default_leavetype_created = response.is_leavetype_created;
        this.organizationName = response.company_name;
      }
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
    })
  }
  // empDataSource = new MatTableDataSource();
  // geEmployeeDetailsByOrgId() {
  //   this.spinner.show();
  //   let orgId = localStorage.getItem("OrgId");
  //   this.settingsService.getActiveEmpDetailsByOrgId(orgId).subscribe(data => {
  //     let response: any[] = JSON.parse(data.map.data);
  //     for (let i = 0; i < response.length; i++) {
  //       if (response[i].is_deleted == false)
  //         this.employeeDetails.push(response[i]);
  //     }
  //     this.empDataSource = new MatTableDataSource(this.employeeDetails);
  //     this.empDataSource.sort = this.sort.toArray()[2];
  //     this.empDataSource.paginator = this.paginator.toArray()[2];

  //     // load the initial emp list
  //     this.filteredEmps.next(this.employeeDetails.slice());
  //     // listen for search field value changes
  //     this.empFilterCtrl.valueChanges
  //       .pipe(takeUntil(this._onDestroy))
  //       .subscribe(() => {
  //         this.filteremp();
  //       });

  //     this.spinner.hide();
  //   }, (error) => {
  //     this.router.navigate(["/404"]);
  //     this.spinner.hide();
  //   })
  // }
  Bulkdeletedesignation = false;
  public designationdetails: boolean = false;
  selection_designation = new SelectionModel(true, []);
  toggleDesignation() {
    this.selection_designation.clear();
    this.Bulkdeletedesignation = false
    this.resetform("Designation");
    this.ifDesignationAvail = false;
    this.designationdetails = !this.designationdetails;
    if (this.designationIdUpdate && this.isDesignationEditEnabled) {
      this.designationFormValue();
    } else {
      this.designationIdUpdate = null;
      this.getActiveDesignationDetailsByOrgId();
    }
    this.isDesignationEditEnabled = !this.isDesignationEditEnabled;
    this.selection_designation.clear();
    this.Bulkdeletedesignation = false;
  }
  resetform(data) {
    if (data == "Designation") {
      this.DesignationFormGroup.reset();
    }
  }
  designationDataSource = new MatTableDataSource();
  displayedColumnsDesignation: string[] = ['selector', 'designation', 'designation_responsibilities', 'action'];
  getActiveDesignationDetailsByOrgId() {
    this.designationDetailsData = []; // for validating duplicate designation
    let OrgId = localStorage.getItem("OrgId");
    this.settingsService.getActiveDesignationDetailsByOrgId(OrgId).subscribe(data => {
      let response = JSON.parse(data.map.data);
      this.designationDetails = response;
      // for validating duplicate designation
      for (let i = 0; i < this.designationDetails.length; i++) {
        this.designationDetailsData.push(this.designationDetails[i].designation);
      }

      // load the initial bill list
      this.filtereddesignation.next(this.designationDetails.slice());

      // listen for search field value changes
      this.designationFilterCtrl.valueChanges
        .pipe(takeUntil(this._onDestroy))
        .subscribe(() => {
          this.filterDesignation();
        });

      this.designationDataSource = new MatTableDataSource(this.designationDetails);
      this.designationDataSource.sort = this.sort.toArray()[0];
      this.designationDataSource.paginator = this.paginator.toArray()[0];
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
    })
  }
  designationFormValue() {
    this.spinner.show();
    this.settingsService.getDesignationById(this.designationIdUpdate).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        let response = JSON.parse(data.map.data);
        this.DesignationFormGroup.get('designation').setValue(response.designation);
        this.DesignationFormGroup.get('responsibilities').setValue(response.designation_responsibilities);
      }
      this.spinner.hide();
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
    })
  }
   // To check duplicate designation
   onCheckDesignation() {
    if (this.ifDesignationIdAvail) {
      for (let i = 0; i < this.designationDetailsData.length; i++) {
        if (this.DesignationFormGroup.get('designation').value == this.designationDetailsData[i]) {
          this.designationDetailsData.splice(i, 1);
        }
      }
      this.ifDesignationIdAvail = false;
    }
    let value = this.DesignationFormGroup.get('designation').value;
    for (let i = 0; i < this.designationDetailsData.length; i++) {
      if (value.toLowerCase() == this.designationDetailsData[i].toLowerCase()) {
        this.ifDesignationAvail = true;
        break;
      } else {
        this.ifDesignationAvail = false;
      }
    }

  }

  addDesignation() {
    this.spinner.show();
    let OrgId = localStorage.getItem("OrgId");
    let data: Object = {
      "designation": this.DesignationFormGroup.value.designation,
      "org_id": OrgId,
      "designation_responsibilities": this.DesignationFormGroup.value.responsibilities,
    }
    this.settingsService.createDesignationDetails(data).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        this.utilsService.openSnackBarAC("Designation added successfully", "OK");
        setTimeout(() => {
          localStorage.setItem("ManageDesignationAction", "true");
          this.router.navigate(['/settings']);
        }, 500);
      }
      else {
        this.utilsService.openSnackBarMC("Failed to add designation", "OK");
      }
      this.spinner.hide();
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
    })
  }

 
  updateDesignation() {
    this.spinner.show();
    let OrgId = localStorage.getItem("OrgId");
    let data: Object = {
      "id": this.designationIdUpdate,
      "designation": this.DesignationFormGroup.value.designation,
      "org_id": OrgId,
      "designation_responsibilities": this.DesignationFormGroup.value.responsibilities,
    }
    this.settingsService.updateDesignation(data).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        this.utilsService.openSnackBarAC("Designation updated successfully", "OK");
        setTimeout(() => {
          localStorage.setItem("ManageDesignationAction", "true");
          this.router.navigate(['/settings']);
        }, 500);
      }
      else {
        this.utilsService.openSnackBarMC("Failed to update designation", "OK");
      }
      this.spinner.hide();
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
    })
  }
  designationCancelformtoggle(){
    localStorage.setItem("ManageDesignationAction", "true");
    this.router.navigate(['/settings']);
  }
  backToDesignation() {
    localStorage.setItem("ManageDesignationAction", "true");
    this.router.navigate(['/settings']);
  }
}
