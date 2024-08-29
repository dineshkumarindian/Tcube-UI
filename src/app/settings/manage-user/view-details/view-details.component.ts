import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { JobsService } from 'src/app/services/jobs.service';
import { ProjectsService } from 'src/app/services/projects.service';
import { SettingsService } from 'src/app/services/settings.service';
import { TimeTrackerService } from 'src/app/services/time-tracker.service';

@Component({
  selector: 'app-view-details',
  templateUrl: './view-details.component.html',
  styleUrls: ['./view-details.component.less']
})
export class ViewDetailsComponent implements OnInit {
  tempProjectData;
  tempJobData: any[] = [];
  projectDetailsWithJobs: any[] = [];
  projectName;
  jobName;
  password;
  show: boolean = true;
  constructor(
    private domSanitizer: DomSanitizer,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private projectsService: ProjectsService,
    private jobsService: JobsService,
    private router: Router,
    private spinner: NgxSpinnerService,
    public timeTrackerService: TimeTrackerService,
    public settingsService: SettingsService,
  ) { }

  isUser: Boolean = false;
  isClient: Boolean = false;
  imgAvailable: boolean = false;
  isUserProjAndjobDetails: boolean = false;
  url: any;
  reporter: any;
  projectCount: any = 0;
  jobCount: any = 0;
  usersProjectCount: any = 0;
  projects: any[] = [];
  clientId: any;
  userId: any;
  orgId: any;
  userProjectDetails: any;
  projectDetails: any = [];
  jobDetails: any = [];
  noProjects: boolean = false;
  filteredProjectDetails:any = [];
  filteredJobDetails:any=[];
  projectAndJobs: any = [];
  jobdetails: any = [];
  isJobExist:boolean = false;

  ngOnInit() {
    this.orgId = localStorage.getItem('OrgId')
    if (this.data.key == 'user') {
      // this.isUser = true;
      this.isUserProjAndjobDetails = true;
      this.userId = this.data.mainData.id;
      this.reporter = this.data.mainData.reporting_manager;
      this.getEmpDetails();
      this.getProjectDetails();
    }
    else if (this.data.key == 'client') {
      this.isClient = true;
      this.clientId = this.data.mainData.id;
      this.getActiveProjectDetailsByClientId(this.clientId);
    }

    // For Profile Image
    // if (this.data.mainData.profile_image != undefined) {
    //   this.imgAvailable = true;
    //   let stringArray = new Uint8Array(this.data.mainData.profile_image);
    //   const STRING_CHAR = stringArray.reduce((data, byte) => {
    //     return data + String.fromCharCode(byte);
    //   }, '');
    //   let base64String = btoa(STRING_CHAR);
    //   this.url = this.domSanitizer.bypassSecurityTrustUrl("data:image/jpeg;base64," + base64String);
    // } else this.imgAvailable = false;


    // //For reporting manager
    // if (this.data.mainData.reporterDetails == undefined) {
    //   this.reporter = '';
    // } else {
    //   this.reporter = this.data.mainData.reporterDetails.firstname + " " + this.data.mainData.reporterDetails.lastname;
    // }
    // this.password = this.data.mainData.password;
  }

  getEmpDetails() {
    this.settingsService.getActiveEmpDetailsById(this.userId).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        this.data.mainData = JSON.parse(data.map.data);

        // For Profile Image
        if (this.data.mainData.profile_image != undefined) {
          this.imgAvailable = true;
          let stringArray = new Uint8Array(this.data.mainData.profile_image);
          const STRING_CHAR = stringArray.reduce((data, byte) => {
            return data + String.fromCharCode(byte);
          }, '');
          let base64String = btoa(STRING_CHAR);
          this.url = this.domSanitizer.bypassSecurityTrustUrl("data:image/jpeg;base64," + base64String);
        } else this.imgAvailable = false;

        //For reporting manager
        // if (this.data.mainData.reporterDetails == undefined) {
        //   this.reporter = '';
        // } else {
        //   this.reporter = this.data.mainData.reporterDetails.firstname + " " + this.data.mainData.reporterDetails.lastname;
        // }
        this.password = this.data.mainData.password;
      }
      this.isUser = true;
    });
  }
  
  getActiveProjectDetailsByClientId(id) {
    this.spinner.show();
    this.projectsService.getActiveProjectDetailsByClientId(id).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        let projectData: any[] = JSON.parse(data.map.data);
        this.tempProjectData = projectData;
        this.projectCount = this.tempProjectData.length;
        for (let i = 0; i < projectData.length; i++) {
          let id = projectData[i].id;
          this.getActiveJobDetailsByProjectId(id, i);
        }
      }
      setTimeout(() => {
        this.spinner.hide();
      }, 1300);
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
    })
  }

  //to get project and jobs based on the orgid and empid by using reference id
  getProjectDetails() {
    this.spinner.show();
    this.projectDetails = [];
    let formdata = {
      "empid": this.userId,
      "orgid": this.orgId
    }
    this.timeTrackerService.getProjectAndJobNames(formdata).subscribe(data => {
      var response = JSON.parse(data.map.data);
      var projectdetails = response[0].map.projectdetails.myArrayList;
      this.jobdetails = response[1].map.jobdetails.myArrayList;
      //remove the duplicate projects
      for(let i=0;i<response.length; i++){
      this.projectDetails = projectdetails.reduce((accumalator, current) => {
        if (!accumalator.some((item) => item.map.id === current.map.id && item.map.name === current.map.name)) {
          accumalator.push(current);
        } return accumalator;
      }, []);
    }
      this.projectDetails.map(projectInfo => {
        this.filteredProjectDetails.push({ "id": projectInfo.map.id, "name": projectInfo.map.name });
      });
      this.jobdetails.map(jobInfo => {
        this.filteredProjectDetails.map(pInfo => {
          if (pInfo.id == jobInfo.map.project_id) {
            pInfo.isJobExist = true;
            this.filteredJobDetails.push({ "projectId": pInfo.id, "jobName": jobInfo.map.name });
          }
        });
      });
      this.projectCount = this.filteredProjectDetails.length;
      this.jobCount = this.filteredJobDetails.length;
      setTimeout(() => {  
        this.spinner.hide();
      }, 1300);
    // } 
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
      
    })
  }
  getActiveJobDetailsByProjectId(id, length) {
    this.spinner.show();
    let dummy = [];
    let jobNames = [];
    this.jobsService.getActiveJobDetailsByProjectId(id).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        let jobData: any[] = JSON.parse(data.map.data);
        this.tempJobData = jobData;
        this.jobCount += this.tempJobData.length;
        for (let i = 0; i < jobData.length; i++) {
          jobNames.push(jobData[i].job_name);
        }
        dummy.push({ project_name: this.tempProjectData[length].project_name, jobs: jobNames });
        this.projectDetailsWithJobs.push(dummy);
      }
      setTimeout(() => {
        this.spinner.hide();
      }, 1300);
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
    })
  }
  // show password
  onClick() {
    if (this.password === 'password') {
      this.password = 'text';
      this.show = false;
    } else {
      this.password = 'password';
      this.show = true;
    }
  }
}
