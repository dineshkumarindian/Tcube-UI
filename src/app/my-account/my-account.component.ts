import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { RegisterService } from '../services/register.service';
import { SettingsService } from '../services/settings.service';
import { UpdateProfileImageComponent } from './update-profile-image/update-profile-image.component';

@Component({
  selector: 'app-my-account',
  templateUrl: './my-account.component.html',
  styleUrls: ['./my-account.component.less']
})
export class MyAccountComponent implements OnInit {

  role: any;
  url: any = "";
  imgAvailable: boolean = false;
  designation: any;
  getData: boolean = false;
  reporterImgAvailable: boolean = false;
  reporterurl: any;
  roleForReporter: any;
  responsibility: any;
  branch:any;
  stafftypeInProfile: any
  res = "";
  org_id :any;
  
  
  constructor(
    private registerService: RegisterService,
    private settingsService: SettingsService,
    private domSanitizer: DomSanitizer,
    private spinner: NgxSpinnerService,
    public matDialog: MatDialog,
    private router: Router,
  ) { }

  Details;
  OrgId: Boolean = false;
  ngOnInit() {
    let id = localStorage.getItem('Id');
    this.roleForReporter = localStorage.getItem('Role');
    if (this.roleForReporter == "org_admin" || this.roleForReporter == "super_admin") {
      // console.log("true");
      this.OrgId = true;
    } else this.OrgId = false;

    if (this.roleForReporter == "super_admin") {
      this.getSADetails(id);
    } else this.getEmpDetailsById(id);
  }

  getSADetails(id) {
    this.registerService.getSADetailsById(id).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        let response = JSON.parse(data.map.data);
        this.Details = response;
        // console.log(this.Details);
      }
      // console.log(this.Details);
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
    })
  }
  // getOrgDetailsById(id){
  //   this.registerService.getOrgDetailsById(id).subscribe(data =>{
  //     if (data.map.statusMessage == "Success"){
  //       let response =JSON.parse(data.map.data);
  //       this.Details= response;
  //     }
  //     console.log(this.Details);
  //   })
  // }
  getEmpDetailsById(id) {
    this.settingsService.getActiveEmpDetailsById(id).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        let response = JSON.parse(data.map.data);
        this.Details = response;
        console.log(this.Details);
        this.org_id = this.Details.orgDetails.org_id;
        this.role = response.roleDetails.role;
        this.designation = response.designationDetails.designation;
        this.responsibility = response.designationDetails.designation_responsibilities;
        if(response.branchDetails){
          this.branch = response.branchDetails.branch;
        }
        if(response.stafftypeDetails){
          this.stafftypeInProfile = response.stafftypeDetails.stafftype;
        }
        // console.log(this.branch);
        // console.log(this.responsibility);
        this.getReportingManagerDetailsByID(response.reporting_manager);
        if (response.profile_image != undefined) {
          this.imgAvailable = true;
          let stringArray = new Uint8Array(response.profile_image);
          const STRING_CHAR = stringArray.reduce((data, byte) => {
            return data + String.fromCharCode(byte);
          }, '');
          let base64String = btoa(STRING_CHAR);
          this.url = this.domSanitizer.bypassSecurityTrustUrl("data:image/jpeg;base64," + base64String);
        } else this.imgAvailable = false;


        if (this.roleForReporter != "org_admin" && this.roleForReporter != "super_admin") {
          // if (response.reporterDetails.profile_image != undefined) {
          //   this.reporterImgAvailable = true;
          //   let stringArray = new Uint8Array(response.reporterDetails.profile_image);
          //   const STRING_CHAR = stringArray.reduce((data, byte) => {
          //     return data + String.fromCharCode(byte);
          //   }, '');
          //   let base64String = btoa(STRING_CHAR);
          //   this.reporterurl = this.domSanitizer.bypassSecurityTrustUrl("data:image/jpeg;base64," + base64String);
          // } else this.reporterImgAvailable = false;
        }
        setTimeout(() => {
          this.getData = true;
        }, 1000)
      }
      // console.log(this.Details);
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
    })
  }

  updateProfileImage(data) {
    // console.log("Image Update");
    // this.settingsService.setEmployeeId(id);
    const dialogRef = this.matDialog.open(UpdateProfileImageComponent, {
      width: '50%',
      // height: '450px',
      maxHeight: '550px',
      panelClass: 'custom-viewdialogstyle',
      data: data
    });

    dialogRef.afterClosed().subscribe(
      result => {
        this.ngOnInit();
      })
  }

  //to get the reporting manager details by Id
  reporterDetails:any;
  getReportingManagerDetailsByID(id){
    this.reporterImgAvailable = false;
    this.settingsService.getActiveEmpDetailsById(id).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        let response = JSON.parse(data.map.data);
        this.reporterDetails = response;
          if (response.profile_image != undefined) {
            this.reporterImgAvailable = true;
            let stringArray = new Uint8Array(response.profile_image);
            const STRING_CHAR = stringArray.reduce((data, byte) => {
              return data + String.fromCharCode(byte);
            }, '');
            let base64String = btoa(STRING_CHAR);
            this.reporterurl = this.domSanitizer.bypassSecurityTrustUrl("data:image/jpeg;base64," + base64String);
          } else this.reporterImgAvailable = false;
      }
      else{
        this.reporterDetails = null;
      }
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
    })
  }
}

