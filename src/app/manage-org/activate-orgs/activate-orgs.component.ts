import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NavigationEnd, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { RegisterService } from 'src/app/services/register.service';
import { UtilService } from 'src/app/services/util.service';
import { ManageOrgService } from 'src/app/services/super-admin/manage-org/manage-org.service';

@Component({
  selector: 'app-activate-orgs',
  templateUrl: './activate-orgs.component.html',
  styleUrls: ['./activate-orgs.component.less']
})
export class ActivateOrgsComponent implements OnInit {
  loginurl: string;
  modifiedstring: string;
  loginstr: string;
  login_str: string;
  constructor(
    private manageOrgService: ManageOrgService,
    private formBuilder: UntypedFormBuilder,
    @Inject(MAT_DIALOG_DATA) public data,
    public dialogRef: MatDialogRef<ActivateOrgsComponent>,
    private router: Router,
    private utilsService: UtilService,
    private spinner: NgxSpinnerService
  ) {
    // for to get a current webpage url
    this.loginurl = window.location.href;
    this.modifiedstring = this.loginurl.slice(0, this.loginurl.length - 13);
    this.loginstr = "login";
    this.login_str = this.modifiedstring.concat(this.loginstr.toString());
  }

  ngOnInit() {
  }
  activateformgroup: UntypedFormGroup = this.formBuilder.group({
    comments: ['', []]
  });

  deleteDetails() {
    this.spinner.show();
    let data: Object = {
      "id": this.data,
      "status": "activated",
      "comments": this.activateformgroup.value.comments,
      "login_str": this.login_str
    }
    let id = localStorage.getItem("organizationId");
    this.manageOrgService.activateOrg(data).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        this.utilsService.openSnackBarAC("Organization details activated successfully", "OK");
        this.dialogRef.close();
      }
      else {
        this.utilsService.openSnackBarMC("Failed to activate organization details", "OK");
      }
      this.spinner.hide();
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
      this.dialogRef.close();
    })
  }

}
