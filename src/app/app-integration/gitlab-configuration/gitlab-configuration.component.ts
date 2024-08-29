import { Component, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { GitlabIntegrationService } from "..//..//services/app-integration/gitlab-service/gitlab-integration.service";
import { UtilService } from '..//..//services/util.service';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { DeleteComponent } from '..//../util/delete/delete.component';
import {gitlabNoOption,gitlabYesOption} from '../../util/note-message';

@Component({
  selector: 'app-gitlab-configuration',
  templateUrl: './gitlab-configuration.component.html',
  styleUrls: ['./gitlab-configuration.component.less']
})
export class GitlabConfigurationComponent implements OnInit {
  yesOrNoOption = ["Yes", "No"];
  GitIntegration: string = "Yes";
  gitLabConfigNoteMessage = gitlabNoOption;

  constructor(
    public spinner: NgxSpinnerService,
    private gitlabService: GitlabIntegrationService,
    private utilsService: UtilService,
    private router: Router,
    public matDialog: MatDialog,
  ) { }

  ngOnInit() {
    this.getGitLabDetailsByOrgid();
  }
  gitlabIntegrationDetails: any;
  gitlabConfigured: boolean = false;
  getGitLabDetailsByOrgid() {
    this.spinner.show();
    this.gitlabConfigureYesOrNo = false;
    this.gitlabService.getGitLabDetailsByOrgid(localStorage.getItem('OrgId')).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        let response = JSON.parse(data.map.data);
        this.gitlabIntegrationDetails = response;
        this.gitlabConfigured = true;
        if (this.gitlabIntegrationDetails.git_integration == true) {
          this.GitIntegration = "Yes";
          this.gitLabConfigNoteMessage = gitlabYesOption;
        }
        else {
          this.GitIntegration = "No";
          this.gitLabConfigNoteMessage = gitlabNoOption;
         }
        this.spinner.hide();
      } else if (data.map.statusMessage == "Failed") {
        this.gitlabIntegrationDetails = "";
        this.gitlabConfigured = false;
        this.spinner.hide();
      } else {
        this.spinner.hide();
        this.gitlabIntegrationDetails = "";
        this.gitlabConfigured = false;
        // this.utilsService.openSnackBarMC("Error while fetching the GitLab configuration details","OK");
      }
    })

  }
  gitlab_integration: boolean = false;
  UpdateGitLabIntegration() {
    this.spinner.show();
    if (this.GitIntegration == "Yes") {
      this.gitlab_integration = true;
    }
    else {
      this.gitlab_integration = false;

    }
    // const response = await axios.get(url, { headers, params });
    let formdata = {
      "id": this.gitlabIntegrationDetails.id,
      "gitlab_integration": this.gitlab_integration,
    }

    this.gitlabService.updateGitLabIntegration(formdata).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        this.utilsService.openSnackBarAC("Gitlab integration  updated successfully", "OK");
        this.spinner.hide();
        this.getGitLabDetailsByOrgid();
      }
      else {
        this.spinner.hide();
        this.utilsService.openSnackBarMC("Failed to update integration details. Please verify the integration", "OK");
        this.getGitLabDetailsByOrgid();
      }
    })

  }
  editconfig() {
    this.router.navigate([
      "/edit-gitlab-integration" + "/" + this.gitlabIntegrationDetails.id,
    ]);
  }

  
  deleteIntegrationDialog() {
    const dialogRef = this.matDialog.open(DeleteComponent, {
      width: '40%',
      panelClass: 'custom-viewdialogstyle',
      data:{ key:"Integration-delete",showComment:false },
    });
    dialogRef.afterClosed().subscribe(
      result => {
        if (result != undefined && result != "") {
          if (result.data == true) {
            this.DeleteConfiguration();
          }
        }
      })
  }
  DeleteConfiguration() {
    this.spinner.show();
    let formdata = {
      "id": this.gitlabIntegrationDetails.id,
    }
    this.gitlabService.getGitLabDetailsDeleteByid(formdata).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        this.getGitLabDetailsByOrgid();
        this.utilsService.openSnackBarAC("Gitlab integration details deleted successfully", "OK");
        this.spinner.hide();
      }
      else {
        this.spinner.hide();
        this.utilsService.openSnackBarMC("Failed to delete integration details", "OK");
      }
    })
  }
  gitlabConfigureYesOrNo: boolean = false;
  radioButtonClickedGitLabIntegration(event: any) {
    this.gitlabConfigureYesOrNo = event;
    if(event.value == "Yes"){
      this.gitLabConfigNoteMessage = gitlabYesOption;
    } else {
      this.gitLabConfigNoteMessage = gitlabNoOption;
    }
  }
}
