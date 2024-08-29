import { Component, OnInit,Inject } from '@angular/core';
import { MatDialogRef ,MAT_DIALOG_DATA} from '@angular/material/dialog';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { UtilService } from '../../services/util.service';
import { ManageOrgService } from '../../services/super-admin/manage-org/manage-org.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-org-delete',
  templateUrl: './org-delete.component.html',
  styleUrls: ['./org-delete.component.less']
})
export class OrgDeleteComponent implements OnInit {
  // isDeletedOrg:any;

  constructor(
    private manageOrgService: ManageOrgService,
    public dialogRef: MatDialogRef<OrgDeleteComponent>,
    private utilsService: UtilService,
    private spinner: NgxSpinnerService,
    public formbuilder: UntypedFormBuilder,
    private router : Router,
    @Inject(MAT_DIALOG_DATA)public data

  ) {
   
   }
    
  orgdeleteformgroup: UntypedFormGroup =this.formbuilder.group({
    comments: ['', [Validators.required]],
  });

  ngOnInit() {

  }

  deleteDetails() {
    this.spinner.show();
    let data: object = {
      "id":localStorage.getItem("organizationId"),
      "comments": this.orgdeleteformgroup.value.comments,
    }
    this.manageOrgService.deleteOrg(data).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        this.utilsService.openSnackBarAC("Organization details deleted successfully", "OK");
        this.dialogRef.close();
      }
      else {
        this.utilsService.openSnackBarMC("Failed to delete organization details", "OK");
      }
      this.spinner.hide();
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
      this.dialogRef.close();
    })
  }

}
