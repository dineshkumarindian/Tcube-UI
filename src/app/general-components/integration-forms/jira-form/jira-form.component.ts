import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatOption } from '@angular/material/core';
import { MatSelect } from '@angular/material/select';
import { NgxSpinnerService } from 'ngx-spinner';
import { UtilService } from 'src/app/services/util.service';
import { errorMessage, alreadyExistMessage, validFormat, duplicateName } from '../../../util/constants';
import { JiraIntegrationService } from 'src/app/services/Jira-integration/jira-integration.service'
import { ActivatedRoute, Router } from '@angular/router';
import { ReplaySubject, Subject } from 'rxjs';
import { ProjectsService } from 'src/app/services/projects.service';
import { takeUntil } from 'rxjs/operators';
import { IntegrationDocumentationComponent } from '../integration-documentation/integration-documentation.component';
import { HttpHeaders,HttpClient,HttpParams} from '@angular/common/http';
import axios from 'axios';
import { resolve } from 'url';


@Component({
  selector: 'app-jira-form',
  templateUrl: './jira-form.component.html',
  styleUrls: ['./jira-form.component.less']
})
export class JiraFormComponent implements OnInit {
  validFormatMessage = validFormat;
  requiredMessage = errorMessage;
  existMessage = alreadyExistMessage;
  duplicateName = duplicateName;
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
    private projectsService: ProjectsService,
    private jiraIntegrationService: JiraIntegrationService,
    private http: HttpClient) { }

  jiraIntegrationFormGroup: UntypedFormGroup;
  ngOnInit() {
    this.integrationId = this.activatedRoute.snapshot.params.id;
    this.orgid = localStorage.getItem("OrgId");
    this.email = localStorage.getItem("Email");
    // this.getProjectsByOrgId();
    this.jiraIntegrationFormGroup = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email, Validators.pattern(/^[a-z0-9!#$%&'*+\/=?^_`{|}~.-]+@[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*$/i)]],
      token: ['', [Validators.required, this.noWhitespaceValidator]],
      url: ['', [Validators.required, Validators.pattern('(https?://)?([\\da-z.-]+)\\.([a-z.]{2,6})[/\\w .-]*/?')]],
      boardIds :['',[Validators.required]]
    });

    if (this.integrationId) {
      this.getJiracredByID();
    }
    else {
      this.jiraIntegrationFormGroup.controls['email'].setValue(this.email);
      this.jiraIntegrationFormGroup.controls['email'].disable();
    }

  }

  public noWhitespaceValidator(control: FormControl) {
    return (control.value || '').trim().length ? null : { 'whitespace': true };
  }

  @ViewChild('select', { static: true }) select: MatSelect;
  allSelected = false;
  toggleAllSelection() {
    // console.log(this.allSelected);
    if (this.allSelected) {
      this.select.options.forEach((item: MatOption) => item.select());
    } else {
      this.select.options.forEach((item: MatOption) => item.deselect());
    }
  }

  protected _onDestroy = new Subject<void>();
  /** control for the selected project */
  public projectCtrl: UntypedFormControl = new UntypedFormControl("", [Validators.required]);

  /** control for the MatSelect filter keyword */
  public projectFilterCtrl: UntypedFormControl = new UntypedFormControl();

  /** list of head filtered by search keyword */
  public filteredproject: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);

  selectedProjectEvent(eve) {
    // console.log(eve);
    // console.log(this.selectedProjects);
  }
  protected filterproject() {
    if (!this.ProjectDetailsList) {
      return;
    }
    // get the search keyword
    let search = this.projectFilterCtrl.value;
    if (!search) {
      this.filteredproject.next(this.ProjectDetailsList.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
    // filter the client
    this.filteredproject.next(
      this.ProjectDetailsList.filter(project => project.project_name.toLowerCase().indexOf(search) > -1)
    );
  }
  activeProjectList = [];
  noprojectfound: boolean = false;
  //For project name dropdown 
  // getProjectsByOrgId() {
  //   this.spinner.show();
  //   let orgId = localStorage.getItem("OrgId");
  //   this.projectsService.getProjectNameAndId(orgId).subscribe(data => {
  //     if (data.map.statusMessage == "Success") {
  //       this.activeProjectList = JSON.parse(data.map.data);
  //       for (let i = 0; i < this.activeProjectList.length; i++) {
  //         if (this.activeProjectList[i].project_status == 'Inprogress') {
  //           this.ProjectDetailsList.push(this.activeProjectList[i]);
  //         }
  //       }
  //       this.noprojectfound = false;
  //       this.filteredproject.next(this.ProjectDetailsList.slice());
  //       // listen for search field value changes
  //       this.projectFilterCtrl.valueChanges
  //         .pipe(takeUntil(this._onDestroy))
  //         .subscribe(() => {
  //           this.filterproject();
  //         });
  //       this.spinner.hide();
  //     } else {
  //       this.spinner.hide();
  //       this.noprojectfound = true;
  //       this.ProjectDetailsList = [];
  //     }

  //   }, (error) => {
  //     this.router.navigate(["/404"]);
  //     this.spinner.hide();
  //   })
  // }
  
  jiraAxios:any;
  async jiraBaseUrl(event) {
    // this.spinner.show();
    this.jiraAxios = {};
    const apiUrl = event;
    const username = this.jiraIntegrationFormGroup.get('email')?.value;
    const password = this.jiraIntegrationFormGroup.get('token')?.value;

    if(apiUrl != null && username != null && password != null) {
      // console.log("apiUrl..."+ apiUrl +"username...."+ username +"password..."+ password );
    }
    // const headers = new HttpHeaders().set(
    //   'Authorization',
    //   'Basic ' + btoa(username + ':' + password)
    // ); Buffer.from(username + ':' + password).toString('base64')

    // const authHeader = 'Basic ' + btoa(username + ':' + password);
    
    // this.jiraAxios = axios.create({
    //   baseURL: apiUrl,
    //   headers: {
    //     Authorization: authHeader,
    //     'Content-Type': 'application/json',
    //   },
    // });
    this.getboardIdsDetails(apiUrl,username,password);
    // try {
    //   const boardId = '123'; // Replace with your Jira board ID
    //   const response = await jiraAxios.get(`/rest/agile/1.0/board`);
    //   console.log(response);
    //   // Process the backlog details here
    // } catch (error) {
    //   console.error(error);
    // }
    
    // const res = await axios.get(apiUrl, { headers});
    // console.log(res);
      // .subscribe(response => {
      //   console.log(response);
      //   // Process the backlog details here
      // }, error => {
      //   console.error(error);
      // });
  // }


    // console.log("apiUrl..." + apiUrl + "username..." + username + "password..." + password);

  }

  boardIds:any[];
  boardIdsLength:number = 0;
  async getboardIdsDetails(apiUrl:any,username:any,password:any) {
    this.spinner.show();
    this.boardIds = [];
    let data ={
      "apiurl":apiUrl,
      "username":username,
      "password":password
    }
    // console.log(data);
    this.jiraIntegrationService.getAllBoardDetails(data).subscribe(data =>{
      // console.log(data);
      if(data.map.statusMessage == "Success"){
        let response = data.map.data.jsonObject.map;
        this.boardIdsLength = response.total;
        let values = response.values.myArrayList;
        for(let i=0;i<this.boardIdsLength;i++){
          let boardDetails = values[i].map;
          this.boardIds.push({"id":boardDetails.id,"board_name":boardDetails.name,"project_name":boardDetails.location.map.name});
        }
        if(this.integrationId){
          this.jiraIntegrationFormGroup.get('boardIds').setValue(this.selectoptionIds);
        }
        // console.log(response+"length..."+this.boardIdsLength);
        this.spinner.hide();
      } else {
          this.spinner.hide();
          this.utilsService.openSnackBarMC("Failed to add Jira credentials, please verify the basic auth token and jira base url", "OK");
        }
    })
    // console.log(this.boardIds);

    // try {
    //   this.spinner.show();
    //   const boardId = '123'; // Replace with your Jira board ID
    //   const response = await this.jiraAxios.get(`/rest/agile/1.0/board`) ;
    //   console.log(response.data);
    //   this.spinner.hide();
    //   // Process the backlog details here
    // } catch (error) {
    //   console.error(error);
    // }
  };
  selectoptionIds:any[];
  selectBoardIds(event){
    this.selectoptionIds = event.value;
    // console.log(this.selectoptionIds);
  }
  //post method to create jira credentials for the org
  createJiracredentials() {
    this.spinner.show();
    //for converting the selected projects to array string
    let arr: any = []
    
    // let str = this.selectedProjects.filter(x => {
    //   if (x != undefined) {
    //     arr.push(x);
    //   }
    // })
    let url = this.jiraIntegrationFormGroup.value.url;
    if (url.endsWith('/')) {
      url = url.slice(0, -1);
    }
    let boardData = [];
    if(this.selectoptionIds){
      this.boardIds.forEach(x =>{
        this.selectoptionIds.forEach(y =>{
        if(x.id == y){
          boardData.push(x);
        }
       })
      })
    }
    let formdata = {
      "org_id": this.orgid,
      "email": this.email,
      "token": this.jiraIntegrationFormGroup.value.token,
      "url": url,
      "projects": JSON.stringify(boardData)
    }
    // console.log(formdata);
    this.jiraIntegrationService.createJiraCredentials(formdata).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        this.utilsService.openSnackBarAC("Jira integration details added successfully", "OK");
        setTimeout(() => {
          this.router.navigate(['/view-jira-configuration']);
        }, 300);
        this.spinner.hide();
      } else {
        this.spinner.hide();
        this.utilsService.openSnackBarMC("Failed to create Jira configurations", "OK")
      }
    })
  }

  //get jira credentilas by id
  jiraCredDetails: any;
  boardNames:any;
  getJiracredByID() {
    this.spinner.show();
    this.jiraIntegrationService.getJiraCredById(this.integrationId).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        let response = JSON.parse(data.map.data);
        this.jiraCredDetails = response;
        let boardDetails = JSON.parse(this.jiraCredDetails.projects);
        let selectedBoardIds = [];
        boardDetails.forEach(x =>{
          selectedBoardIds.push(x.id);
        })
        this.selectoptionIds = selectedBoardIds;
        // console.log(this.selectoptionIds);
        this.spinner.hide();
        setTimeout(() => {
          this.setFormvalues();
        }, 1000);
      }
      else {
        this.spinner.hide();
        this.utilsService.openSnackBarMC("Failed to get a Jira credentials by id", "OK")
      }
    })
  }

  //set form values to the formfield
  setFormvalues() {
    // console.log(this.jiraCredDetails);
    if (this.jiraCredDetails) {
      this.jiraIntegrationFormGroup.controls['email'].setValue(this.jiraCredDetails.email);
      this.jiraIntegrationFormGroup.controls['token'].setValue(this.jiraCredDetails.token);
      this.jiraIntegrationFormGroup.controls['url'].setValue(this.jiraCredDetails.url);
      // console.log(this.boardIds);
      setTimeout(() => {
      // this.selectedProjects = JSON.parse(this.jiraCredDetails.projects);
      // this.jiraIntegrationFormGroup.controls['boardIds'].setValue(JSON.parse(this.jiraCredDetails.projects));

      }, 500);
      // this.projectCtrl.setValue(JSON.parse(this.jiraCredDetails.projects));
      // if (this.ProjectDetailsList.length == this.projectCtrl.value.length) {
      //   this.allSelected = true;
      // }
      // else {
      //   this.allSelected = false;
      // }
    }
  }

  //edit and update method for the jira crentials
  updateJiraCred() {
    this.spinner.show();
    //for converting the selected projects to array string
    let arr: any = []
    let str = this.selectedProjects.filter(x => {
      if (x != undefined) {
        arr.push(x);
      }
    })
    let url = this.jiraIntegrationFormGroup.value.url;
    if (url.endsWith('/')) {
      url = url.slice(0, -1);
    }
    let boardData = [];
    if(this.selectoptionIds){
      this.boardIds.forEach(x =>{
        this.selectoptionIds.forEach(y =>{
        if(x.id == y){
          boardData.push(x);
        }
       })
      })
    }
    let formdata = {
      "id": this.integrationId,
      "org_id": this.orgid,
      "email": this.jiraIntegrationFormGroup.value.email,
      "token": this.jiraIntegrationFormGroup.value.token,
      "url": url,
      "projects": JSON.stringify(boardData)
    }
    this.jiraIntegrationService.update(formdata).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        this.utilsService.openSnackBarAC("Jira integration details updated successfully", "OK");
        this.spinner.hide();
        setTimeout(() => {
          this.router.navigate(['/view-jira-configuration']);
        }, 300);
      }
      else {
        this.spinner.hide();
        this.utilsService.openSnackBarMC("Failed to update the Jira integration", "OK");
      }
    })
  }

  //to open read docs dialog
  //to open slack integration documention
  documentationDialog() {
    let screenWidth = screen.availWidth;
    if (screenWidth <= 750) {
      const dialogRef = this.matDialog.open(IntegrationDocumentationComponent, {
        width: '90%',
        panelClass: 'custom-viewdialogstyle', data: "Jira",
      });
    } else {
      const dialogRef = this.matDialog.open(IntegrationDocumentationComponent, {
        width: '70%',
        panelClass: 'custom-viewdialogstyle', data: "Jira Software",
      });
    }
  }

  backToAppsIntegrationPage() {
    this.router.navigate(['/view-jira-configuration']);
  }

}

