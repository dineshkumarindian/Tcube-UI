import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import moment from 'moment-timezone';
import { NgxSpinnerService } from 'ngx-spinner';
import { ReplaySubject, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { DayPlannerService } from 'src/app/services/day-planner/day-planner.service';
import { UtilService } from 'src/app/services/util.service';

@Component({
  selector: 'app-edit-day-task',
  templateUrl: './edit-day-task.component.html',
  styleUrls: ['./edit-day-task.component.less']
})
export class EditDayTaskComponent implements OnInit {
  dayTaskFormGroup: UntypedFormGroup;
  todayDate: any;
  noProjects:boolean = false;

  constructor(
    public dialogRef: MatDialogRef<any>,
    @Inject(MAT_DIALOG_DATA) public data,
    private fb: UntypedFormBuilder,
    private spinner: NgxSpinnerService,
    private utilsService: UtilService,
    private dayPlannerService: DayPlannerService,
  ) { }

  /** control for the MatSelect filter keyword */
  public projectFilterCtrl: UntypedFormControl = new UntypedFormControl();

  /** list of head filtered by search keyword */
  public filteredproject: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);

  protected _onDestroy = new Subject<void>();

  projectDetails: any[] = [];
  ngOnInit() {
    this.todayDate = moment().format("DD-MM-YYYY");
    this.projectDetails = this.data.project;
    this.dayTaskFormGroup = this.fb.group({
      project: ['', [Validators.required]],
      task: ['', [Validators.required]]
    });

    if (this.projectDetails.length == 0) {
      this.noProjects = true;
    } else {
      this.filteredproject.next(this.projectDetails.slice());
      this.projectFilterCtrl.valueChanges.pipe(takeUntil(this._onDestroy)).subscribe(() => {
        this.filterproject();
      });
    }

    this.dayTaskFormGroup.get('task').setValue(this.data.details.day_task);
    this.dayTaskFormGroup.get('project').setValue(this.data.details.project_id);

  }

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
      this.projectDetails.filter(data => data.name.toLowerCase().indexOf(search) > -1)
    );
  }


  //edit day task
  editDayTask() {
    this.spinner.show();
    let newProjectDetails = this.projectDetails.find(a => a.id === this.dayTaskFormGroup.value.project);
    let tempData: Object = {
      "id": this.data.details.id,
      "org_id": localStorage.getItem("OrgId"),
      "day_task": this.dayTaskFormGroup.value.task,
      "project_name": newProjectDetails.name,
      "project_id": newProjectDetails.id,
      "status" : this.data.details.status
    }
    this.dayPlannerService.updateDayTask(tempData).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        this.utilsService.openSnackBarAC("Task updated successfully", "OK");
        this.dialogRef.close({ data: true});
      } else {
        this.utilsService.openSnackBarMC("Failed to update task", "OK");
      }
      this.spinner.hide();
    }, (error) => {
      this.spinner.hide();
    })
  }

}
