import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { TimeTrackerService } from 'src/app/services/time-tracker.service';
import { UtilService } from 'src/app/services/util.service';

@Component({
  selector: 'app-task-bulk-delete',
  templateUrl: './task-bulk-delete.component.html',
  styleUrls: ['./task-bulk-delete.component.less']
})
export class TaskBulkDeleteComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<TaskBulkDeleteComponent>,
    @Inject(MAT_DIALOG_DATA) public data,
    public timeTrackerService: TimeTrackerService,
    private utilsService: UtilService,
    private spinner: NgxSpinnerService,
    private router: Router,

  ) { }

  list=[];
  ngOnInit() {
    this.list= this.data.name;
  }

   // bulk delete for tasks
   deleteDetails(){
     this.spinner.show();
    let listdata = {
        "deleteIds": this.list
    }

    this.timeTrackerService.bulkDelete(listdata).subscribe(data => {
        if (data.map.statusMessage == "Success") {
          this.utilsService.openSnackBarAC("Task details deleted successfully", "OK");
          this.dialogRef.close();
        }
        else {
          this.utilsService.openSnackBarMC("Failed to delete task details", "OK");
        }
        this.spinner.hide();
      }, (error) => {
        this.router.navigate(["/404"]);
        this.spinner.hide();
        this.dialogRef.close();
      })
  }

}
