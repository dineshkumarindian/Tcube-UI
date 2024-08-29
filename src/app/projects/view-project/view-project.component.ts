import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ProjectsService } from 'src/app/services/projects.service';
import { UtilService } from 'src/app/services/util.service';

@Component({
  selector: 'app-view-project',
  templateUrl: './view-project.component.html',
  styleUrls: ['./view-project.component.less']
})
export class ViewProjectComponent implements OnInit {
  projectId: any
  projectValues: any[];
  projectManager: any[] = [];
  teamMembers: any[] = [];
  inactiveTeamMembers: any[] = [];
  inactiveProjectManager: any[] = [];
  isCost: Boolean = false;
  isDescription: Boolean = false;
  jobs: any[] = [];
  tempAssigneeData: any[] = [];
  assignees: any[] = [];
  totalUsers: any;
  totalJobs: any;
  description: string;
  constructor(private activatedRoute: ActivatedRoute,
    private projectsService: ProjectsService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private utilService: UtilService,
    private spinner: NgxSpinnerService) {
    this.description = this.data.projectData.description;
  }
  project_logged: any = 0;
  project_logged_hours: any = [];
  project_logged_mins: any = [];
  ngOnInit() {
    this.spinner.show();
    this.jobs = this.data.jobs;
    this.totalUsers = this.data.totalUsers;
    this.totalJobs = this.data.totalJobs;
    let data1: any[] = this.data.projectData.resourceDetails;
    this.projectValues = Array(this.data.projectData);
    if (this.data.projectData.project_cost != undefined) {
      this.isCost = true;
    }
    if (this.description != "") {
      this.isDescription = true;
    }
    for (let i = 0; i < data1.length; i++) {
      let designation = data1[i].map.designation;
      let status = data1[i].map.status;
      if (designation == "project_manager" && data1[i].map.status == "Active") {
        this.projectManager.push(data1[i]);
      } else if (designation == "project_manager" && data1[i].map.status == "Inactive") {
        this.inactiveProjectManager.push(data1[i]);
      } else if (designation == "team_members" && data1[i].map.status == "Active") {
        this.teamMembers.push(data1[i]);
      }
      else if (designation == "team_members" && data1[i].map.status == "Inactive") {
        this.inactiveTeamMembers.push(data1[i]);
      }
      setTimeout(() => {
        this.spinner.hide();
      }, 700);
    }
    // console.log(this.jobs);
    for (let i = 0; i < this.jobs.length; i++) {
      this.tempAssigneeData = [];
      let jobAssignee = this.jobs[i].jobAssigneeDetails;
      for (let j = 0; j < jobAssignee.length; j++) {
        this.tempAssigneeData.push(jobAssignee[j].map.name);
      }
      this.assignees.push(this.tempAssigneeData);
    }
    // console.log(this.assignees);
    for (let i = 0; i < this.jobs.length; i++) {
      var tName = this.jobs[i].logged_hours;
      let Hrs_array = tName.match(/\d+/g)
      this.project_logged_hours.push(Math.floor(Hrs_array[0]));
      if(Hrs_array.length>1){
        this.project_logged_mins.push(Math.floor(Hrs_array[1]));
      }
    }
    let tempHours = this.project_logged_hours.reduce((value, aaa) => value + aaa);
    let tempMins = this.project_logged_mins.reduce((value, aaa) => value + aaa);
    var hrs = 0;
    var mins = 0;

    var temp = Math.floor((tempMins * 60000) / 1000);
    var hours = Math.floor(temp / 60 / 60);
    if (hours) {
      hrs += hours

    }
    var minutes = Math.floor((temp / 60 / 60 - hours) * 60);
    if (minutes) {
      mins += minutes
    }
    this.project_logged = tempHours + Math.floor(hrs) + ' Hrs ' + mins + ' Mins';
  }
}
