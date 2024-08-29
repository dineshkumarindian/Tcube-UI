import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormBuilder, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { SettingsService } from 'src/app/services/settings.service';
import { UtilService } from 'src/app/services/util.service';

@Component({
  selector: 'app-settings-bulk-delete',
  templateUrl: './settings-bulk-delete.component.html',
  styleUrls: ['./settings-bulk-delete.component.less']
})
export class SettingsBulkDeleteComponent implements OnInit {
  bulkLeavetype: boolean = false;
  bulkRoleType: Boolean = false;
  bulkDeleteClientType: boolean = false;
  bulkDeleteInactiveType: boolean = false;
  bulkDesignation: boolean = false;
  bulkDeleteHolidays: boolean = false;
  bulkDeleteInactiveUser: boolean = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data,
    private spinner: NgxSpinnerService,
    private settingsService: SettingsService,
    private utilsService: UtilService,
    private router : Router,
    public dialogRef: MatDialogRef<SettingsBulkDeleteComponent>,
    private formBuilder: UntypedFormBuilder

  ) {
    
   }
 

  ngOnInit() {
    if (this.data.header == "Leave Types Bulk") {
      this.bulkLeavetype = true;
    } else if (this.data.header == "clientBulkDelete") {
      this.bulkDeleteClientType = true;
    }else if (this.data.header == "inDeactiveClientDetails") {
      this.bulkDeleteInactiveType = true;
    }else if (this.data.header == "Role") {
      this.bulkRoleType = true;
    }
    else if (this.data.header == "Designation Bulk ") {
      this.bulkLeavetype = true;
      this.bulkDesignation = true;
    } else if(this.data.header == "Holidays Bulk"){
      this.bulkDeleteHolidays = true;
    }else if(this.data.header == " User Bulk ") {
      this.bulkDeleteInactiveUser = true;
    }
  }
  deleteLeaveTypeConfoirm() {
    this.spinner.show();
    let data: Object = {
      "deleteIds": this.data.deleteList,
    }
    this.settingsService.bulkdeleteLeaveTypes(data).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        this.utilsService.openSnackBarAC("Leave type details deleted successfully", "OK");
        this.dialogRef.close("delete");
      }
      else {
        this.utilsService.openSnackBarMC("Failed to delete leave type details", "OK");
      }
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
      this.dialogRef.close();
    })
    setTimeout(() => {
      this.spinner.hide();
    }, 1000);
  }
  bulkdeleteHolidays() {
    this.spinner.show();
    let data: Object = {
      "deleteIds": this.data.deleteList,
    }
    this.settingsService.bulkDeleteHolidays(data).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        this.utilsService.openSnackBarAC("Holiday details deleted successfully", "OK");
        this.dialogRef.close();
      }
      else {
        this.utilsService.openSnackBarMC("Failed to delete holiday details", "OK");
      }
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
      this.dialogRef.close();
    })
    setTimeout(() => {
      this.spinner.hide();
    }, 1000);
  }
  bulkDeleteClientDetails() {
    this.spinner.show();
    let data: Object = {
      "deleteIds": this.data.deleteList,
    }
    this.settingsService.bulkDeleteClientDetails(data).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        this.utilsService.openSnackBarAC("Client details deleted successfully", "OK");
        this.dialogRef.close();
      }
      else {
        this.utilsService.openSnackBarMC("Failed to delete client details", "OK");
      }
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
      this.dialogRef.close();
    })
    setTimeout(() => {
      this.spinner.hide();
    }, 1000);
  }
//Bulk delete roles
  bulkDeleteRoleConfirm() {
    this.spinner.show();
    let data: Object = {
      "deleteIds": this.data.deleteList,
    }
    this.settingsService.bulkdeleteRole(data).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        this.utilsService.openSnackBarAC("Roles details deleted successfully", "OK");
        this.dialogRef.close();
      }
      else {
        this.utilsService.openSnackBarMC("Failed to delete roles details", "OK");
      }
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
      this.dialogRef.close();
    })
    setTimeout(() => {
      this.spinner.hide();
    }, 1000);
  }
// bulk delete for designation
  bulkDeleteDesignation() {
    this.spinner.show();
    let data: Object = {
      "deleteIds": this.data.deleteList,
    }
    this.settingsService.bulkdeleteDesignation(data).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        this.utilsService.openSnackBarAC("Designation details deleted successfully", "OK");
        this.dialogRef.close();
      }
      else {
        this.utilsService.openSnackBarMC("Failed to delete Designation details", "OK");
      }
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
      this.dialogRef.close();
    })
    setTimeout(() => {
      this.spinner.hide();
    }, 1000);
  }

  // bulk delete for user
  bulkDeleteUser() {
    this.spinner.show();
    let data: Object = {
      "deleteIds": this.data.deleteList,
    }
    this.settingsService.bulkdeleteUser(data).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        this.utilsService.openSnackBarAC("Bulk users deleted successfully", "OK");
        this.dialogRef.close();
      }
      else {
        this.utilsService.openSnackBarMC("Failed to delete bulk user", "OK");
      }
      this.spinner.hide();
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
      this.dialogRef.close();
    })
    // setTimeout(() => {
    //   this.spinner.hide();
    // }, 1000);
  }

}
