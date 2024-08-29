import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NgxSpinnerService } from 'ngx-spinner';
import { JobsService } from 'src/app/services/jobs.service';
import { ProjectsService } from 'src/app/services/projects.service';
import { SettingsService } from 'src/app/services/settings.service';
import { UtilService } from 'src/app/services/util.service';
// import { ClientDeleteComponent } from 'src/app/settings/client-delete/client-delete.component';

@Component({
  selector: 'app-client-settings-common-dialog',
  templateUrl: './client-settings-common-dialog.component.html',
  styleUrls: ['./client-settings-common-dialog.component.less']
})
export class ClientSettingsCommonDialogComponent implements OnInit {
  delete: boolean = false;
  activate: boolean = false;
  deactivate: boolean = false;
  activebulkdelete: boolean = false;
  inactivebulkdelete: boolean = false;
  bulkactivate: boolean = false;
  bulkdeactivate: boolean = false;
  viewClient: boolean = false;
  constructor(
    private settingsService: SettingsService,
    public dialogRef: MatDialogRef<ClientSettingsCommonDialogComponent>,
    private utilsService: UtilService,
    private spinner: NgxSpinnerService,
    @Inject(MAT_DIALOG_DATA) public data,
    private formBuilder: UntypedFormBuilder,
    private projectsService: ProjectsService,
    private jobsService: JobsService,) { }

  ngOnInit() {
    console.log(this.data);

    if (this.data.header == "delete") {
      this.delete = true;
    }
    else if (this.data.header == "deactivate") {
      this.deactivate = true;
    }
    else if (this.data.header == "activate") {
      this.activate = true;
    }
    else if (this.data.header == "activeClientBD") {
      this.activebulkdelete = true;
    }
    else if (this.data.header == "inactiveClientBD") {
      this.inactivebulkdelete = true;
    }
    else if (this.data.header == "clientBulkAct") {
      this.bulkactivate = true;
    }
    else if (this.data.header == "clientBulkDeat") {
      this.bulkdeactivate = true;
    }
    else if (this.data.header == "viewClient") {
      this.viewClient = true;
      this.clientId = this.data.mainData.id;
      setTimeout(() => {
        if (this.data.Activeclient) {
          this.getActiveProjectDetailsByClientId(this.clientId);
        }
        else {
          this.getInactiveProjectDetailsByClientId(this.clientId);

        }
      }, 100);
    }
  }
  //common formgroup
  cdFormgroup: UntypedFormGroup = this.formBuilder.group({
    comments: ['', []]
  });
  //delete client details
  deleteDetails() {
    this.spinner.show();
    let id = localStorage.getItem("clientId");
    this.settingsService.deleteClient(id).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        this.utilsService.openSnackBarAC("Client details deleted successfully", "OK");
        this.dialogRef.close();
      }
      else {
        this.utilsService.openSnackBarMC("Failed to delete client details", "OK");
      }
      this.spinner.hide();
    })
  }

  // activate Client
  activateClient() {
    this.spinner.show();
    let data: Object = {
      "id": localStorage.getItem("clientId"),
      "status": "activated",
      "comments": this.cdFormgroup.value.comments,
    }
    this.settingsService.activateClient(data).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        this.utilsService.openSnackBarAC("Client activated successfully", "OK");
        this.dialogRef.close();
      }
      else {
        this.utilsService.openSnackBarMC("Failed to activate client", "OK");
      }
      this.spinner.hide();
    })
  }
  //deactivate clients
  deactivateClient() {
    this.spinner.show();
    let data: Object = {
      "id": localStorage.getItem("clientId"),
      "status": "activated",
      "comments": this.cdFormgroup.value.comments,
    }
    this.settingsService.deactivateClient(data).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        this.utilsService.openSnackBarAC("Client deactivated successfully", "OK");
        this.dialogRef.close();
      }
      else {
        this.utilsService.openSnackBarMC("Failed to deactivate client", "OK");
      }
      this.spinner.hide();
    })
  }

  //bulk delete client details
  bulkDeleteClientDetails() {
    this.spinner.show();
    let data: Object = {
      "deleteIds": this.data.deleteList,
    }
    this.settingsService.bulkDeleteClientDetails(data).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        this.utilsService.openSnackBarAC("Client details deleted successfully", "OK");
        this.dialogRef.close();
      }
      else {
        this.utilsService.openSnackBarMC("Failed to delete client details", "OK");
      }
    })
    setTimeout(() => {
      this.spinner.hide();
    }, 1000);
  }

  // bulkDeactiveClient 
  bulkDeactiveClientDetails() {
    this.spinner.show();
    let data: Object = {
      "deleteIds": this.data.deleteList,
      "action": "activated",
      "comments": this.cdFormgroup.value.comments
    }
    // console.log(data);
    this.settingsService.bulkDeactivateClientDetails(data).subscribe(data => {
      // console.log(data);
      if (data.map.statusMessage == "Success") {
        this.utilsService.openSnackBarAC("Client details deactivated successfully", "OK");
        this.dialogRef.close();
      }
      else {
        this.utilsService.openSnackBarMC("Failed to deactivate the client details", "OK");
      }
    })
    setTimeout(() => {
      this.spinner.hide();
    }, 2000);
  }
  // bulk active client
  bulkactiveClientDetails() {
    this.spinner.show();
    let data: Object = {
      "deleteIds": this.data.deleteList,
      "action": "deactivated",
      "comments": this.cdFormgroup.value.comments
    }
    // console.log(data);
    this.settingsService.bulkActivateClientDetails(data).subscribe(data => {
      // console.log(data);
      if (data.map.statusMessage == "Success") {
        this.utilsService.openSnackBarAC("Client details activated successfully", "OK");
        this.dialogRef.close();
      }
      else {
        this.utilsService.openSnackBarMC("Failed to activate details", "OK");
      }
    })
    setTimeout(() => {
      this.spinner.hide();
    }, 2000);
  }

  tempProjectData: any[] = [];
  tempJobData: any[] = [];
  projectDetailsWithJobs: any[] = [];
  projectCount: any = 0;
  jobCount: any = 0;
  projects: any[] = [];
  clientId: any;
  projectids: any = [];
  //get active project details by client id
  getActiveProjectDetailsByClientId(id) {
    this.spinner.show();
    this.projectsService.getActiveProjecIdAndNameByClientId(id).subscribe(async data => {
      if (data.map.statusMessage == "Success") {
        let projectData: any[] = JSON.parse(data.map.data);
        this.tempProjectData = projectData;
        this.projectCount = this.tempProjectData.length;
        this.projectids = projectData.map((subarray: any) => subarray[0]);
        await this.getJobsNameListWithProjectIds(this.projectids);
      }
      this.spinner.hide();
    })
  }

  getInactiveProjectDetailsByClientId(id) {
    this.spinner.show();
    this.projectsService.getInactiveProjecIdAndNameByClientId(id).subscribe(async data => {
      if (data.map.statusMessage == "Success") {
        let projectData: any[] = JSON.parse(data.map.data);
        this.tempProjectData = projectData;
        this.projectCount = this.tempProjectData.length;
        this.projectids = projectData.map((subarray: any) => subarray[0]);
        await this.getJobsNameListWithProjectIds(this.projectids);
      }
      this.spinner.hide();
    })
  }
  getJobsNameListWithProjectIds(ids) {
    return new Promise<void>((resolve, reject) => {
      let jobNames = [];
      let formData: Object = {
        "projectIds": ids,
      }
      this.jobsService.getJobsNameListWithProjectIds(formData).subscribe(data => {
        if (data.map.statusMessage == "Success") {
          let jobData: any[] = JSON.parse(data.map.data);
          this.tempJobData = jobData;
          this.jobCount += this.tempJobData.length;
          for (let i = 0; i < this.tempProjectData.length; i++) {
            for (let j = 0; j < jobData.length; j++) {
              if (jobData[j][1] == this.tempProjectData[i][1]) {
                jobNames.push(jobData[j][0]);
              }
            }
            this.projectDetailsWithJobs.push({ project_name: this.tempProjectData[i][1], jobs: jobNames });
            jobNames = [];
          }
          resolve(); // Resolve the promise when the operations are completed
        }
      });
    });
  }
}
