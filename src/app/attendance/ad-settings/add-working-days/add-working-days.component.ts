import { Component, OnInit } from '@angular/core';
import { ThemePalette } from '@angular/material/core';
import { FormsModule, UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { ManageOrgService } from '../../../services/super-admin/manage-org/manage-org.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { Router } from '@angular/router';
import { UtilService } from '../../../services/util.service';

export interface Task {
  name: string;
  completed: boolean;
  color: ThemePalette;
  subtasks?: Task[];
}

@Component({
  selector: 'app-add-working-days',
  templateUrl: './add-working-days.component.html',
  styleUrls: ['./add-working-days.component.less']
})
export class AddWorkingDaysComponent implements OnInit {
  allComplete: boolean = false;
  workingDaysFormGroup: UntypedFormGroup;
  isChecked: boolean = false;
  checkBoxEnable: boolean = false;
  workingDayDetails: any[] = [];
  weekDays: any[] = [
    { 'id': 0, 'day': 'Sunday' },
    { 'id': 1, 'day': 'Monday' },
    { 'id': 2, 'day': 'Tuesday' },
    { 'id': 3, 'day': 'Wednesday' },
    { 'id': 4, 'day': 'Thursday' },
    { 'id': 5, 'day': 'Friday' },
    { 'id': 6, 'day': 'Saturday' }];

  constructor(private _formbuilder: UntypedFormBuilder,
    private manageOrg: ManageOrgService,
    private spinner: NgxSpinnerService,
    private router: Router,
    private utilsService: UtilService) { }

  ngOnInit(): void {
    this.workingDaysFormGroup = this._formbuilder.group({
      sunday: false,
      monday: false,
      tuesday: false,
      wednesday: false,
      thursday: false,
      friday: false,
      saturday: false,
    })
    this.getOrgDetailsById();
  }

  //get the org details in working days
  getOrgDetailsById() {
    this.spinner.show();
    this.manageOrg.getOrgDetailsById(localStorage.getItem("OrgId")).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        let response = JSON.parse(data.map.data);
        let workingDays = JSON.parse(response.working_days);
        // console.log(response);
        // console.log(workingDays);
        workingDays.forEach(element => {
          this.workingDayDetails.push(element);
          this.workingDaysFormGroup.get(element.day.toLowerCase()).setValue(true);
        });
        this.spinner.hide();
      } else {
        this.spinner.hide();
      }
    })
  }

  // check the specific working days 
  setCheckBoxChange(event: any, id: number) {
    if (event.checked) {
      let day = this.weekDays.find(day => day.id === id);
      this.workingDayDetails.push(day);
    } else {
      this.workingDayDetails = this.workingDayDetails.filter(day => day.id !== id);
    }
  }

  // update the working days
  updateWorkingDays() {
    this.spinner.show();
    let days = [];
    this.weekDays.forEach(element => {
      if (this.workingDaysFormGroup.get(element.day.toLowerCase()).value) {
        days.push(element);
      }
    });
    let data = {
      "org_id": localStorage.getItem("OrgId"),
      "working_days": JSON.stringify(days)
    }
    this.manageOrg.updateWorkingDays(data).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        this.utilsService.openSnackBarAC("Working days updated successfully", "OK");
        this.spinner.hide();
        setTimeout(() =>{
          this.router.navigate(["/attendance-settings"]);
        },200);
      } else {
        this.utilsService.openSnackBarMC("Failed to update working days", "OK");
        this.spinner.hide();
      }
    },
      (error) => {
        this.router.navigate(["/404"]);
        this.spinner.hide();
      })

  }


}
