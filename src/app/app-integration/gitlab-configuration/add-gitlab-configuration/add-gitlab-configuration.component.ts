import { Component, OnInit, ViewChild } from "@angular/core";
import { UntypedFormBuilder, FormControl, UntypedFormGroup, Validators } from "@angular/forms";
import { MatSelect } from "@angular/material/select";
import { MatDialog } from "@angular/material/dialog";
import { MatOption } from "@angular/material/core";

import { ActivatedRoute, Router } from "@angular/router";
import axios from "axios";
import { NgxSpinnerService } from "ngx-spinner";
import { ReplaySubject, Subject } from "rxjs";
import { GitlabIntegrationService } from "src/app/services/app-integration/gitlab-service/gitlab-integration.service";
import { RegisterService } from "src/app/services/register.service";
import { UtilService } from "src/app/services/util.service";
import { alreadyExistMessage, errorMessage, validFormat } from "src/app/util/constants";
import { IntegrationDocumentationComponent } from 'src/app/general-components/integration-forms/integration-documentation/integration-documentation.component';


@Component({
  selector: 'app-add-gitlab-configuration',
  templateUrl: './add-gitlab-configuration.component.html',
  styleUrls: ['./add-gitlab-configuration.component.less']
})
export class AddGitlabConfigurationComponent implements OnInit {
  validFormatMessage = validFormat;
  requiredMessage = errorMessage;
  existMessage = alreadyExistMessage;
  whiteSpaceMessage = validFormat;
  email: string;
  orgid: any;
  integrationId: any;
  ProjectDetailsList = [];
  selectedProjects = [];
  constructor(private spinner: NgxSpinnerService,
    private formBuilder: UntypedFormBuilder,
    private utilsService: UtilService,
    public matDialog: MatDialog,
    public router: Router,
    private activatedRoute: ActivatedRoute,
    private gitlabService: GitlabIntegrationService) { }


  gitlabIntegrationFormGroup: UntypedFormGroup;
  ngOnInit() {
    this.integrationId = this.activatedRoute.snapshot.params.id;
    this.orgid = localStorage.getItem("OrgId");
    this.email = localStorage.getItem("Email");
    this.gitlabIntegrationFormGroup = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email, Validators.pattern(/^[a-z0-9!#$%&'*+\/=?^_`{|}~.-]+@[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*$/i)]],
      token: ['', [Validators.required ,Validators.pattern(/^[a-zA-Z0-9](.*[a-zA-Z0-9])?$/)]],
      url: ['', [Validators.required , Validators.pattern(/^[a-zA-Z0-9](.*[a-zA-Z0-9])?$/)]]
    });

    if (this.integrationId) {
      this.getGitLabDetailsByID();
    }
    else {
      this.gitlabIntegrationFormGroup.controls['email'].setValue(this.email);
      this.gitlabIntegrationFormGroup.controls['email'].disable();
    }
    // this.getJiraintegrationByOrgid();

  }

  protected _onDestroy = new Subject<void>();
  //post method to create jira credentials for the org
  Project_ids: any = [];
  response: any = [];
  async createGitLabcredentials() {
    this.spinner.show();
    //for converting the selected projects to array string
    let url = this.gitlabIntegrationFormGroup.value.url;
    if (url.endsWith('/')) {
      url = url.slice(0, -1);
    }
    let formdata = {
      "org_id": this.orgid,
      "email": this.email,
      "token": this.gitlabIntegrationFormGroup.value.token,
      "url": url,
    }
    const ACCESS_TOKEN = this.gitlabIntegrationFormGroup.value.token;
    const ACCESS_URL = url;
    const url1 = `${ACCESS_URL}/api/v4/projects`;

    // Set the headers to include your access token
    const headers = { Authorization: `Bearer ${ACCESS_TOKEN}` };
    let page = 1;
    const perPage = 100;
    // Set the query parameters
    const params = { page, per_page: perPage };
    // const response = await axios.get(url, { headers, params });

    try {
      this.response = await axios.get(url1, { headers, params });
      for (let i = 0; i < this.response.data.length; i++) {
        this.Project_ids.push(this.response.data[i]);
      }
      this.gitlabService.createGitLabConfig(formdata).subscribe(data => {
        if (data.map.statusMessage == "Success") {
          this.utilsService.openSnackBarAC("Gitlab integration details added successfully", "OK");
          setTimeout(() => {
            this.router.navigate(['/view-gitlab-configuration']);
          }, 300);
          this.spinner.hide();
        } else {
          this.spinner.hide();
          this.utilsService.openSnackBarMC("Failed to create configuration details. Please verify the configurations", "OK")
        }
      })
    } catch (err) {
      this.utilsService.openSnackBarMC("Invalid credentials", "OK");
      this.spinner.hide();
    }
  }

  // getJiraintegrationByOrgid(){
  //   this.spinner.show();
  //   this.gitlabService.getGitLabDetailsByOrgid(localStorage.getItem('OrgId')).subscribe(data =>{
  //     if(data.map.statusMessage == "Success"){
  //       let response = JSON.parse(data.map.data);
  //       console.log(response);

  //       // this.jiraIntegrationDetails = response;
  //       // this.jiraConfigured = true;
  //       this.spinner.hide();
  //     }else if(data.map.statusMessage == "Failed"){
  //       // this.jiraIntegrationDetails = "";
  //       // this.jiraConfigured = false;
  //       this.spinner.hide();
  //     }else{
  //       this.spinner.hide();
  //       // this.jiraIntegrationDetails = "";
  //       // this.jiraConfigured = false;
  //       this.utilsService.openSnackBarMC("Error while fetching the jira software configuration details","OK");
  //     }

  //   })

  // }


  //get jira credentilas by id
  gitlabCredDetails: any;
  getGitLabDetailsByID() {
    this.spinner.show();
    this.gitlabService.getgitlabdetailsbyid(this.integrationId).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        let response = JSON.parse(data.map.data);
        this.gitlabCredDetails = response;
        this.spinner.hide();
        setTimeout(() => {
          this.setFormvalues();
        }, 1000);
      }
      else {
        this.spinner.hide();
        this.utilsService.openSnackBarMC("Failed to get a gitLab credentials by id", "OK")
      }
    })
  }

  //set form values to the formfield
  setFormvalues() {
    if (this.gitlabCredDetails) {
      this.gitlabIntegrationFormGroup.controls['email'].setValue(this.gitlabCredDetails.email);
      this.gitlabIntegrationFormGroup.controls['email'].disable();
      this.gitlabIntegrationFormGroup.controls['token'].setValue(this.gitlabCredDetails.access_token);
      this.gitlabIntegrationFormGroup.controls['url'].setValue(this.gitlabCredDetails.url);
    }
  }

  //edit and update method for the jira crentials
  async updateGitLabDetails() {
    this.spinner.show();
    let url = this.gitlabIntegrationFormGroup.value.url;
    if (url.endsWith('/')) {
      url = url.slice(0, -1);
    }
    let formdata = {
      "id": this.integrationId,
      "org_id": this.orgid,
      "email": this.email,
      "access_token": this.gitlabIntegrationFormGroup.value.token,
      "url": url,
    }
    const ACCESS_TOKEN = this.gitlabIntegrationFormGroup.value.token;
    const ACCESS_URL = url;
    const url1 = `${ACCESS_URL}/api/v4/projects`;

    // Set the headers to include your access token
    const headers = { Authorization: `Bearer ${ACCESS_TOKEN}` };
    let page = 1;
    const perPage = 100;
    // Set the query parameters
    const params = { page, per_page: perPage };
    // const response = await axios.get(url, { headers, params });

    try {
      this.response = await axios.get(url1, { headers, params });
      for (let i = 0; i < this.response.data.length; i++) {
        this.Project_ids.push(this.response.data[i]);
      }

      this.gitlabService.updateGitLabConfig(formdata).subscribe(data => {
        if (data.map.statusMessage == "Success") {
          this.utilsService.openSnackBarAC("Gitlab integration details updated successfully", "OK");
          this.spinner.hide();
          setTimeout(() => {
            this.router.navigate(['/view-gitlab-configuration']);
          }, 300);
        }
        else {
          this.spinner.hide();
          this.utilsService.openSnackBarMC("Failed to update the integration details. Please verify the integration", "OK");
        }
      })
    } catch (err) {
      this.utilsService.openSnackBarMC("Invalid credentials", "OK");
      this.spinner.hide();
    }

  }

  //to open read docs dialog
  //to open slack integration documention
  documentationDialog() {
    let screenWidth = screen.availWidth;
    if (screenWidth <= 750) {
      const dialogRef = this.matDialog.open(IntegrationDocumentationComponent, {
        width: '90%',
        panelClass: 'custom-viewdialogstyle', data: "GitLab",
      });
    } else {
      const dialogRef = this.matDialog.open(IntegrationDocumentationComponent, {
        width: '70%',
        panelClass: 'custom-viewdialogstyle', data: "GitLab",
      });
    }
  }

  backToAppsIntegrationPage() {
    this.router.navigate(['/view-gitlab-configuration']);
  }

}



