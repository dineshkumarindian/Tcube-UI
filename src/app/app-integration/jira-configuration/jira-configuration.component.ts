import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { JiraIntegrationService } from 'src/app/services/Jira-integration/jira-integration.service';
import { UtilService } from 'src/app/services/util.service';
import {DeleteComponent} from "src/app/util/delete/delete.component";


@Component({
  selector: 'app-jira-configuration',
  templateUrl: './jira-configuration.component.html',
  styleUrls: ['./jira-configuration.component.less']
})
export class JiraConfigurationComponent implements OnInit {

  constructor(
    private jiraIntegrationService: JiraIntegrationService,
    public spinner: NgxSpinnerService,
    private utilsService: UtilService,
    private router: Router,
    private dialog: MatDialog,
  ) { }
  orgId:any;
  ngOnInit() {
    this.orgId = localStorage.getItem('OrgId');
    this.getJiraintegrationByOrgid();
  }

  //get jira configuration based on the orgid
  jiraIntegrationDetails:any;
  jiraConfigured:boolean = false;
  boardNames:any[];
  getJiraintegrationByOrgid(){
    this.spinner.show();
    this.jiraIntegrationService.getJiraCredByOrgId(this.orgId).subscribe(data =>{
      if(data.map.statusMessage == "Success"){
        let response = JSON.parse(data.map.data);
        this.jiraIntegrationDetails = response;
        // console.log(this.jiraIntegrationDetails);
        this.boardNames = JSON.parse(this.jiraIntegrationDetails.projects);
     
        this.jiraConfigured = true;
        this.spinner.hide();
      }else if(data.map.statusMessage == "Failed"){
        this.jiraIntegrationDetails = "";
        this.jiraConfigured = false;
        this.spinner.hide();
      }else{
        this.spinner.hide();
        this.jiraIntegrationDetails = "";
        this.jiraConfigured = false;
        this.utilsService.openSnackBarMC("Failed to fetching the jira integration details. Please verify the integration","OK");
      }

    })

  }
  editconfig() {
    this.router.navigate([
      "/edit-jira-integration" + "/" + this.jiraIntegrationDetails.id,
    ]);
  }
  deleteDialog(){
    const dialogRef = this.dialog.open(DeleteComponent, {
      width: '30%',
      panelClass: 'custom-viewdialogstyle',
      data:{key:"business-delete",showComment:false}
      // data: { id: intern_id },
    })
    dialogRef.afterClosed().subscribe(resp => {
      if(resp != undefined && resp != null){
      if (resp.data == true) {
        this.DeleteConfiguration(this.jiraIntegrationDetails.id);
        // this.internshipDetails = [];
        // this.ngOnInit();
      }
    }
    })
  }
  
  
  DeleteConfiguration(id) {
    this.spinner.show();
    this.jiraIntegrationService.deleteJiraConfig(id).subscribe(data =>{
      if (data.map.statusMessage == "Success") {
        this.jiraConfigured = false;
        this.utilsService.openSnackBarAC("Jira integration details deleted successfully", "OK");
        this.spinner.hide();
      }
      else {
        this.spinner.hide();
        this.utilsService.openSnackBarMC("Failed to delete integration details", "OK");
      }
    },
    (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
    })
    

  }


}
