import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ManageOrgService } from 'src/app/services/super-admin/manage-org/manage-org.service';
import { UtilService } from 'src/app/services/util.service';

@Component({
  selector: 'app-org-bulk-delete',
  templateUrl: './org-bulk-delete.component.html',
  styleUrls: ['./org-bulk-delete.component.less']
})
export class OrgBulkDeleteComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<OrgBulkDeleteComponent>,
     private formBuilder: UntypedFormBuilder,
    @Inject(MAT_DIALOG_DATA) public data,
    private manageOrgService: ManageOrgService,
    private utilsService: UtilService,
    private router : Router,
    private spinner: NgxSpinnerService
  ) { }

  ngOnInit() {
  }
  bulkdeleteformgroup: UntypedFormGroup = this.formBuilder.group({
    comments: ['', []]
  });

  // Bulk delete for orgs
  deleteDetails() {
    this.spinner.show();
    let listdata = {
      "deleteIds": this.data,
      "comments":this.bulkdeleteformgroup.value.comments,
    }
    this.manageOrgService.bulkdeleteOrg(listdata).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        this.utilsService.openSnackBarAC("Organization details deleted successfully", "OK");
        this.dialogRef.close();
      }
      else {
        this.utilsService.openSnackBarMC("Faild to delete organization details", "OK");
      }
      this.spinner.hide();
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
      this.dialogRef.close();
    })
  }
}
