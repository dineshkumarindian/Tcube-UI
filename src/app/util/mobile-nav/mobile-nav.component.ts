import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SettingsService } from 'src/app/services/settings.service';

@Component({
  selector: 'app-mobile-nav',
  templateUrl: './mobile-nav.component.html',
  styleUrls: ['./mobile-nav.component.less']
})
export class MobileNavComponent implements OnInit {
  orgName: string;
  name: string;
  projectsJobs: boolean = false;
  timeTracker: boolean = false;
  attendence: boolean = false;
  settings: boolean = false;
  reports: boolean = false;
  leaveTracker: boolean = false;
  HR_Letters: boolean = false;
  changeText: boolean;
  companyPolicy: boolean = false;
  constructor(private router: Router,
    private settingsService: SettingsService) { }

  ngOnInit() {
    this.modulesShow();

    //! checkscreen size for every second
    setInterval(()=> { this.screenCheck() },  1000);
  }
 // module access function
  modulesShow() {
    let role = localStorage.getItem('Role');
    if (role == 'super_admin') {
      this.name = localStorage.getItem('Name');
      this.orgName = localStorage.getItem('SACompanyName');
      this.timeTracker = false;
      this.attendence = false;
      this.settings = false;
      this.leaveTracker = false;
      this.projectsJobs = false;
      this.HR_Letters = false;
      this.reports = false;
    } else if (role == "org_admin") {
      this.name = localStorage.getItem('Name');
      this.orgName = localStorage.getItem('OrgName');
      this.projectsJobs = true;
      this.timeTracker = true;
      this.attendence = true;
      this.settings = true;
      this.reports = true;
      this.leaveTracker = true;
      this.HR_Letters = true ; 
      this.companyPolicy = true; 
    } else {
      this.getEmpLoyeeDetailsById();
    }
  }
   //empId access function
  getEmpLoyeeDetailsById() {
    let Id = localStorage.getItem("Id");
    this.orgName = localStorage.getItem('OrgName');
    this.settingsService.getActiveEmpDetailsById(Id).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        let response = JSON.parse(data.map.data);
        this.name = response.firstname;
        let roleDetails = JSON.parse(response.roleDetails.access_to);
        for (let i = 0; i < roleDetails.length; i++) {
          if (roleDetails[i] == "project/jobs")
            this.projectsJobs = true;
          else if (roleDetails[i] == "time-tracker")
            this.timeTracker = true;
          else if (roleDetails[i] == "attendance")
            this.attendence = true;
          else if (roleDetails[i] == "settings") {
            this.settings = true;
          }else if(roleDetails[i] == "leave-tracker"){
            this.leaveTracker = true;
          }
          // else if(roleDetails[i] == "HR-letters"){
          //   this.HR_Letters = true;
          // }
          else if(roleDetails[i] == "reports"){
            this.reports = true;
          } else if(roleDetails[i] == "company-policy") {
            this.companyPolicy = true;
          }
        }
      }
    })

  }
 

  //navigate page function
  navigate(page:string){
    setTimeout(() => {
      this.router.navigate([page]);
    }, 500)
  }

  //Screen size check for not to show in big screen
  screenCheck(){
    let screenWidth = screen.availWidth;
    if(screenWidth > 960){
      this.router.navigate(["/dashboard"]);
    }
  }
}
