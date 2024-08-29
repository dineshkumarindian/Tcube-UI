import { Component, OnInit ,Inject} from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NgxSpinnerService } from 'ngx-spinner';
import { UtilService } from 'src/app/services/util.service';
import {ReleaseNotesService} from '../../../services/super-admin/release-notes/release-notes.service';
import {errorMessage} from '../../../util/constants';
import { Router } from '@angular/router';
import {MainNavComponent} from '../../../main-nav/main-nav.component';
import {FooterComponent} from '../../../footer/footer.component';

@Component({
  selector: 'app-update-relase-dialog',
  templateUrl: './update-relase-dialog.component.html',
  styleUrls: ['./update-relase-dialog.component.less']
})
export class UpdateRelaseDialogComponent implements OnInit {
  releaseVersionFrom:UntypedFormGroup;
  ReleaseVersion = new UntypedFormControl('', [Validators.required]);
  requiredMessage = errorMessage;
  // private _formbuilder: any;

  constructor(
    public dialogRef: MatDialogRef<any>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private spinner: NgxSpinnerService,
    private utilService:UtilService,
    private releaseVersionService:ReleaseNotesService,
    private _formbuilder: UntypedFormBuilder,
    private router:Router,
    // public mainNavComponent:MainNavComponent,
    // public footerComponent:FooterComponent
  ) { }

  ngOnInit(): void {
    this.releaseVersionFrom = new UntypedFormGroup({
      ReleaseVersion:this.ReleaseVersion
    });
   
  }
  

 
  updateReleaseVersion(){
    this.spinner.show();
    let data = {
      "update_release_version":this.releaseVersionFrom.controls['ReleaseVersion'].value
    }
    this.releaseVersionService.updateReleaseVersion(data).subscribe(data =>{
      if(data.map.statusMessage == "Success"){
        this.utilService.openSnackBarAC("Release updated successfully", "OK");
        this.utilService.sendUpdateVersionCheck();
        this.updateReleaseData();
       
      } else {
        this.utilService.openSnackBarMC("Failed to update releaseversion","OK");
        this.spinner.hide();
        this.dialogRef.close();
      }
    })
  }

  async updateReleaseData() {
    this.spinner.show();
    let DummyId = 0;
    await this.releaseVersionService.update_release(DummyId).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        this.spinner.hide();
        this.dialogRef.close();
      }
      else {
        this.utilService.openSnackBarMC("Failed to update release", "OK");
        this.spinner.hide();
      }
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
    })
  }
}
