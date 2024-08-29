import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ManageOrgService } from 'src/app/services/super-admin/manage-org/manage-org.service';
import { UtilService } from 'src/app/services/util.service';

@Component({
  selector: 'app-deactivate-org',
  templateUrl: './deactivate-org.component.html',
  styleUrls: ['./deactivate-org.component.less']
})
export class DeactivateOrgComponent implements OnInit {

  constructor(
    private manageOrgService: ManageOrgService,
    private formBuilder: UntypedFormBuilder,
    @Inject(MAT_DIALOG_DATA) public data,
    public dialogRef: MatDialogRef<DeactivateOrgComponent>,
    private utilsService: UtilService,
    private router : Router,
    private spinner: NgxSpinnerService
  ) { }

  ngOnInit() {
  }
  deactivateformgroup: UntypedFormGroup = this.formBuilder.group({
    comments: ['', []]
  });

  deleteDetails() {
    this.spinner.show();
    let data: Object = {
      "id": this.data,
      "status": "deactivated",
      "comments": this.deactivateformgroup.value.comments,
    }
    let id = localStorage.getItem("organizationId");
    this.manageOrgService.deactivateOrg(data).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        this.utilsService.openSnackBarAC("Organization details deactivated successfully", "OK");
        this.dialogRef.close();
      }
      else {
        this.utilsService.openSnackBarMC("Failed to deactivate organization details", "OK");
      }
      this.spinner.hide();
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
      this.dialogRef.close();
    })
  }

}
