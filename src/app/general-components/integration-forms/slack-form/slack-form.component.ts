import { Component, OnInit } from '@angular/core';
import { FormControl, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { DayPlannerService } from 'src/app/services/day-planner/day-planner.service';
import { IntegrationsService } from 'src/app/services/general-components/integrations/integrations.service';
import { UtilService } from 'src/app/services/util.service';
import { IntegrationDocumentationComponent } from '../integration-documentation/integration-documentation.component';
import { errorMessage, validFormat } from '../../../util/constants';

@Component({
  selector: 'app-slack-form',
  templateUrl: './slack-form.component.html',
  styleUrls: ['./slack-form.component.less']
})
export class SlackFormComponent implements OnInit {
  requiredMessage = errorMessage;
  validMessage = validFormat;
  moduleName: any;
  moduleDetails: any;
  slackIntegrationDetails: any;
  isSlackIntAvail: boolean;
  integrationId: any;
  header:string ="Add";
  headerModule:string;
  constructor(
    private spinner: NgxSpinnerService,
    private formBuilder: UntypedFormBuilder,
    // private settingsService: SettingsService,
    private utilsService: UtilService,
    public matDialog: MatDialog,
    public integrationsService: IntegrationsService,
    public dayPlannerService: DayPlannerService,
    public router: Router,
    private activatedRoute: ActivatedRoute
  ) { }

  displayList = [
    { name: 'Day Planner', description: 'While submit the tasks, you will get notification in slack given web hook channel!', key: 'day-planner', reason: 'create-tasks', back_btn_tooltip_msg: "Back To Day Planner Settings" },
    { name: 'Leave Tracker', description: 'While approve the leave request, you will get notification in slack given web hook channel!', key: 'leave-tracker', reason: 'approve-leave', back_btn_tooltip_msg: "Back To Leave Tracker Settings" },
    { name: 'Attendance', description: 'While users give their attendance, will get notification in slack!', key: 'attendance', reason: 'check-in', back_btn_tooltip_msg: "Back To Attendance Settings" },
    { name: 'Approvals', description: 'While users submit leave request or timesheet , will get notification in slack and responsible person can approve or reject the request!', key: 'approvals', reason: 'approve-reject', back_btn_tooltip_msg: "Back To Manage Slack" }
  ];
  approvals: boolean = false;
  ngOnInit() {
    this.moduleName = localStorage.getItem('integrationModuleName');
    if (this.moduleName == "approvals"){
      this.approvals = true;
    }
    // console.log(this.moduleName);
    this.moduleDetails = this.displayList.find(d => d.key == this.moduleName);
    // this.getslackDetails();
    this.integrationId = this.activatedRoute.snapshot.params.id;
    if (this.integrationId) {
      this.header = "Edit";
      this.setSlackFormValue();
    }
    if(this.moduleName == "attendance") {
      this.headerModule  ="Attendance";
    } else if(this.moduleName == "day-planner") {
      this.headerModule = "Day Planner";
    } else {
      this.headerModule ="Leave Tracker";
    }
  }
  oauthToken: FormControl = new FormControl('', Validators.required);
  slackIntegrationFormGroup: UntypedFormGroup = this.formBuilder.group({
    url: ['', [Validators.required,Validators.pattern('(https?://)?([\\da-z.-]+)\\.([a-z.]{2,6})[/\\w .-]*/?')]]
  })

  addSlackIntegration() {
    this.spinner.show();
    let data: Object = {
      "org_id": localStorage.getItem("OrgId"),
      "created_by": localStorage.getItem('Id'),
      "app_name": "slack",
      "url": this.slackIntegrationFormGroup.value.url,
      "whatsapp_access_token": this.approvals ? this.oauthToken.value : null,
      "module_name": this.moduleDetails.key,
      "reason": this.moduleDetails.reason,
    }
    this.integrationsService.createSlackIntegration(data).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        this.utilsService.openSnackBarAC("Slack integration details added successfully", "OK");
        if(localStorage.getItem("fromSlackIntegration") == "true"){
          this.router.navigate(['/manage-slack']);
          localStorage.removeItem('fromSlackIntegration');
        }
        else if (this.moduleName == 'day-planner') {
          this.router.navigate(['/dp-settings']);
        } else if (this.moduleName == 'leave-tracker') {
          this.router.navigate(['/leave-tracker-settings']);
        } else if (this.moduleName == 'attendance') {
          this.router.navigate(['/attendance-settings']);
        }
        localStorage.removeItem('integrationModuleName');
        this.spinner.hide();
      }
      else {
        this.utilsService.openSnackBarMC("Failed to create integration details. Please verify the integration", "OK");
        this.spinner.hide();
      }
    })
  }

  //update method
  updateSlackIntegration() {
    this.spinner.show();
    let module = "";
    if (this.slackIntegrationFormGroup.value.msg_section == 'approve-leave') {
      module = "leave-tracker";
    } else (this.slackIntegrationFormGroup.value.msg_section == 'check-in')
    module = "attendance";

    let data: Object = {
      "id": this.integrationId,
      "org_id": localStorage.getItem("OrgId"),
      "created_by": localStorage.getItem('Id'),
      "app_name": "slack",
      "url": this.slackIntegrationFormGroup.value.url,
      "whatsapp_access_token": this.approvals ? this.oauthToken.value : null,
      "module_name": this.moduleDetails.key,
      "reason": this.moduleDetails.reason,
    }
    this.integrationsService.updateSlackIntegration(data).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        this.utilsService.openSnackBarAC("Slack integration details updated successfully", "OK");
        
        if(localStorage.getItem("fromSlackIntegration")=="true"){
          this.router.navigate(['/manage-slack']);
          localStorage.removeItem('fromSlackIntegration');
        }
        else if (this.moduleName == 'day-planner') {
          this.router.navigate(['/dp-settings']);
        } else if (this.moduleName == 'leave-tracker') {
          this.router.navigate(['/leave-tracker-settings']);
        } else if (this.moduleName == 'attendance') {
          this.router.navigate(['/attendance-settings']);
        }
        localStorage.removeItem('integrationModuleName');
        this.spinner.hide();
      } else {
        this.utilsService.openSnackBarMC("Failed to create integration details. Please verify the integration", "OK");
        this.spinner.hide();
      }
    })
  }

  backToSetting() {
    //********* Redirecting - By using filter method */
    // let data = [{ key: 'day-planner', url: '/dp-settings' }, { key: 'leave-tracker', url: '/leave-tracker-settings' }, { key: 'attendance', url: '/attendance-settings' }];
    // let redirectTo: any = data.filter(x => x.key == this.moduleName);
    // console.log(redirectTo);
    // this.router.navigate([redirectTo[0].url]);

    //********* Redirecting - By using if else method */
    if(localStorage.getItem("fromSlackIntegration")=="true"){
      this.router.navigate(['/manage-slack']);
      localStorage.removeItem('fromSlackIntegration');
    }
    else if (this.moduleName == 'day-planner') {
      this.router.navigate(['/dp-settings']);
    } else if (this.moduleName == 'leave-tracker') {
      this.router.navigate(['/leave-tracker-settings']);
    } else if (this.moduleName == 'attendance') {
      this.router.navigate(['/attendance-settings']);
    }
    localStorage.removeItem('integrationModuleName');
  }

  setSlackFormValue() {
     this.integrationsService.getIntegrationById(this.integrationId).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        let result = JSON.parse(data.map.data);
        this.slackIntegrationFormGroup.get('url').setValue(result.url);
        if(this.approvals){
          this.oauthToken.setValue(result.whatsapp_access_token);
        }
      }
    })
  }

  //to open slack integration documention
  documentationDialog() {
    let screenWidth = screen.availWidth;
    if(this.moduleDetails.name === "Approvals"){
      if (screenWidth <= 750) {
        const dialogRef = this.matDialog.open(IntegrationDocumentationComponent, {
          width: '90%',
          // height: '350px',
          panelClass: 'custom-viewdialogstyle', data: "SlackApprovals",
        });
      } else {
        const dialogRef = this.matDialog.open(IntegrationDocumentationComponent, {
          width: '70%',
          // height: '355px',
          panelClass: 'custom-viewdialogstyle', data: "SlackApprovals",
        });
      }
    }
    else{
      if (screenWidth <= 750) {
        const dialogRef = this.matDialog.open(IntegrationDocumentationComponent, {
          width: '90%',
          height: '350px',
          panelClass: 'custom-viewdialogstyle', data: "Slack",
        });
      } else {
        const dialogRef = this.matDialog.open(IntegrationDocumentationComponent, {
          width: '70%',
          height: '355px',
          panelClass: 'custom-viewdialogstyle', data: "Slack",
        });
      }
    }
    
  }


  //get slack details
  // getslackDetails() {
  //   this.spinner.show();
  //   let data: Object = {
  //     "org_id": localStorage.getItem("OrgId"),
  //     "module_name": this.moduleDetails.key,
  //     "reason": this.moduleDetails.reason,
  //     "app_name": "slack"
  //   }
  //   this.integrationsService.getslackDetails(data).subscribe(data => {
  //     if (data.map.statusMessage == "Success") {
  //       let response = JSON.parse(data.map.data);
  //       this.slackIntegrationDetails = response;
  //       if (this.slackIntegrationDetails != null) {
  //         this.isSlackIntAvail = true;
  //       }
  //       console.log(this.slackIntegrationDetails);
  //     } else if (data.map.statusMessage == "Error") {
  //     }
  //     this.spinner.hide();
  //   })
  // }


}
