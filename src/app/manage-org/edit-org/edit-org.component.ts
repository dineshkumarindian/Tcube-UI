import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, FormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { NgxSpinnerService } from 'ngx-spinner';
import { UtilService } from 'src/app/services/util.service';
import { RegisterCommonDialogComponent } from 'src/app/register/register-common-dialog/register-common-dialog.component';
import { ManageOrgService } from 'src/app/services/super-admin/manage-org/manage-org.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-edit-org',
  templateUrl: './edit-org.component.html',
  styleUrls: ['./edit-org.component.less']
})
export class EditOrgComponent implements OnInit {
  public pricingarr:any = [
    {name: "Plan A",id: 1},
    {name: "Plan B",id: 2},
    {name: "Plan C",id: 3},
    {name: "Plan D",id: 4},];
  orgDetails:any;
  error: boolean= false;
  constructor(
    private manageOrgService: ManageOrgService,
    private formBuilder: UntypedFormBuilder,
    public dialogRef: MatDialogRef<EditOrgComponent>,
    private utilsService: UtilService,
    private spinner: NgxSpinnerService,
    private router : Router,
    private dialog: MatDialog
  ) { }
  OrgFormGroup: UntypedFormGroup = this.formBuilder.group({
    clientName: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    fName: ['', [Validators.required]],
    lName: ['', [Validators.required]],
    plan: ['', [Validators.required]],
    password: ['', [Validators.required]],
    c_password: ['', [Validators.required]],
  },{ validator: this.checkPasswords });
  checkPasswords(group: UntypedFormGroup) {
    const pass = group.controls.password.value;
    const confirmPass = group.controls.c_password.value;
  
    return pass === confirmPass ? null : { notSame: true };
  }
  ngOnInit() {
    this.getOrgDetailById();
  }

  cPass(event){
    if(this.OrgFormGroup.value.password != event){
      this.error = true ;
    }
  }
  getOrgDetailById(){
    this.spinner.show();
    let id=localStorage.getItem('organizationId');
    this.manageOrgService.getOrgDetailsById(id).subscribe(data =>{
      let response = JSON.parse(data.map.data);
      this.orgDetails=response;
      this.OrgFormGroup.get('fName').setValue(this.orgDetails.firstname);
      this.OrgFormGroup.get('lName').setValue(this.orgDetails.lastname);
      this.OrgFormGroup.get('clientName').setValue(this.orgDetails.company_name);
      this.OrgFormGroup.get('email').setValue(this.orgDetails.email);
      this.OrgFormGroup.get('password').setValue(this.orgDetails.password);
      this.OrgFormGroup.get('c_password').setValue(this.orgDetails.password);
      this.OrgFormGroup.get('plan').setValue(this.orgDetails.plan);
      this.spinner.hide();
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
    })
  }
  updateOrg(){
    this.spinner.show();
    let formdata = {
      "id": +localStorage.getItem('organizationId'),
      "firstname": this.OrgFormGroup.value.fName,
      "lastname": this.OrgFormGroup.value.lName,
      "email": this.OrgFormGroup.value.email,
      "company_name": this.OrgFormGroup.value.clientName,
      "password": this.OrgFormGroup.value.c_password,
      "first_time": false,
      // "plan": this.OrgFormGroup.value.plan
    }
    this.manageOrgService.updateOrg(formdata).subscribe(data =>{
      if (data.map.statusMessage == "Success"){
        this.utilsService.openSnackBarAC("Organization details updated successfully", "OK");
        this.dialogRef.close();
        // setTimeout(() => {
        //   this.router.navigate(["/login"]);
        // }, 2000);
        // this.spinner.hide();
      }
      else{
        this.utilsService.openSnackBarMC("Failed to update organization details", "OK");
        // this.spinner.hide();
      }
      this.spinner.hide();
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
      this.dialogRef.close();
    })
  }
  openpricingdetails(){
    let heading = this.OrgFormGroup.value.plan +" - "+"Pricing details"
    this.dialog.open(RegisterCommonDialogComponent,{
      width: '30%',
      height: '85%',
      panelClass: 'custom-viewdialogstyle',
      data:[heading]
    });
  }
}
