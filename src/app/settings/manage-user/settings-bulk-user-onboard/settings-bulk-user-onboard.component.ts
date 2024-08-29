import { Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import moment from 'moment-timezone';
import { NgxSpinnerService } from 'ngx-spinner';
import { NotificationService } from 'src/app/services/notification.service';
import { SettingsService } from 'src/app/services/settings.service';
import { UtilService } from 'src/app/services/util.service';
import { OrgUserLimitComponentComponent } from 'src/app/util/org-user-limit-component/org-user-limit-component.component';
import * as XLSX from 'xlsx';
@Component({
  selector: 'app-settings-bulk-user-onboard',
  templateUrl: './settings-bulk-user-onboard.component.html',
  styleUrls: ['./settings-bulk-user-onboard.component.less']
})
export class SettingsBulkUserOnBoardComponent implements OnInit {
  selectedFile: any;
  msg: string;
  importfile: any;
  fileSize: any;
  attachment: any;
  attachmentName: any;
  arraylist: any[] = [];
  emailFromExcel= [];
  FirstName: any;
  LastName: any;
  Email: any;
  Setpassword: any;
  Role: any;
  Designation: any;
  ReportingManager: any;
  Dateofjoining: any;
  login_str: any;
  loginurl: string;
  modifiedstring: string;
  loginstr: any;
  duplicateEmail: any;
  myArrayList: any;
  duplicateName: any;
  clearDuplicateEmail: boolean = false;
  isImportedFileAvail: boolean = false;
  clearDuplicateName: boolean = false;
  clearDuplicateEmailInExcel: boolean = false;
  clearDuplicateNameInExcel: boolean = false;
  duplicateEmails = [];
   uniqueEmails = [];
   concatedName:any[] =[];
   duplicateNameInExcel = [];
   uniqueName = [];
   mobileNoFromExcel = [];
   uniqueMobileNumber = [] ;
   duplicateMobileNumber = [];
   clearDuplicateMobileNumberInExcel: boolean = false;
   maillIssue: boolean = false;
  fileName = 'SampleExcelFile.xlsx';
  @ViewChild('FileSelect', { static: false }) myInputVariable: ElementRef;
  newEmpList = [
    {
      "first_name": "Tommy",
      "last_name": "D",
      "password": "Ysets#1",
      "email": "a@gmail.com",
      "date_of_joining": "01-12-2022",
      "designation": "Technical Associate",
      "reporting_manager": "YS#123",
      "role": "Developer",
      "branch": "Chennai",
      "stafftype": "Full-time",
      "countrycode" : "+63",
      "mobilenumber" : "1234567890",
      "shift": "Dawn shift"
    },
    {
      "first_name": "Jerry",
      "last_name": "jen",
      "password": "1234567",
      "email": "a@gmail.com",
      "date_of_joining": "01-12-2022",
      "designation": "Testing",
      "reporting_manager": "SE#106",
      "role": "Testing",
      "branch": "Chennai",
      "stafftype": "Part-time",
      "countrycode" : "+63",
      "mobilenumber" : "1234567890",
      "shift": "Midday shift",
    },
    {
      "first_name": "Joseph",
      "last_name": "tin",
      "password": "1234567",
      "email": "a@gmail.com",
      "date_of_joining": "01-12-2022",
      "designation": "Admin",
      "reporting_manager": "SE#102",
      "role": "Tester",
      "branch": "Chennai",
      "stafftype": "Full-time",
      "countrycode" : "+63",
      "mobilenumber" : "1234567890",
      "shift": "Dawn shift"
    },
    {
      "first_name": "Hendry",
      "last_name": "helwen",
      "password": "1234567",
      "email": "a@gmail.com",
      "date_of_joining": "01-12-2022",
      "designation": "Tester",
      "reporting_manager": "SE#105",
      "role": "Tester",
      "branch": "Chennai",
      "stafftype": "Part-time",
      "countrycode" : "+91",
      "mobilenumber" : "1234567890",
      "shift": "Midday shift",
    }
  ]
  incorrectExcelFile: boolean = false;
  emp_org_data: any;
  new_emp_id: any;

  constructor(private settingsService: SettingsService,
    private router: Router,
    private utilsService: UtilService,
    private spinner: NgxSpinnerService,
    public matDialog: MatDialog,private notificationService: NotificationService,
    public dialogRef: MatDialogRef<SettingsBulkUserOnBoardComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,) {
    // for to get a current webpage url
    /* Your code goes here on every router change */
    this.loginurl = window.location.href;
    this.modifiedstring = this.loginurl.slice(0, this.loginurl.length - 8);
    this.loginstr = "login";
    this.login_str = this.modifiedstring.concat(this.loginstr.toString());
  }

  numberOfUsers: number = 0;
  userLimit : number = 0;
  TrailAccount : boolean = false;
  warning: boolean = false;
  uploadUsersCount: number = 0;
  ngOnInit() {
    this.numberOfUsers = this.data.users;
    this.userLimit = this.data.userLimit;
    this.TrailAccount = this.data.trial;
    if(!this.TrailAccount){
      if(this.userLimit <=this.numberOfUsers && this.warning==false){
        this.warning = true;
        const dialog = this.matDialog.open(OrgUserLimitComponentComponent, {
          width: '35%',
          panelClass: 'custom-viewdialogstyle',
          data: { key: "branch-delete", showComment: false }
        });
        dialog.afterClosed().subscribe(
          async resp => {
            if (resp != undefined && resp != "") {
              if (resp.data == true) {
    
              }
            }
          }
        );
      }
    }
  }
  importUserExcelFile(event: any) {
    this.clearDuplicateEmail = false;
    this.clearDuplicateName = false;
    this.clearDuplicateEmailInExcel = false;
    this.clearDuplicateNameInExcel = false;
    // this.incorrectExcelFile = false;
    // this.isImportedFileAvail = false;
    if (!(event.target.files[0] || event.target.files.length == 0)) {
      this.msg = "you must select an file";
      return;
    }
    else if (event.target.files.length == undefined) {
      this.msg = "Incorrect file format";
      this.incorrectExcelFile = true;
    }
    var mimeType = event.target.files[0].type;
    // if (!((mimeType=='application/vnd.ms-excel') && (mimeType=='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'))) {
    if (!(mimeType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')) {
      this.msg = "Accepts only xls,xlsx and csv formats";
    } else {
      this.arraylist = [];
      if (event.target.files[0].size <= 5242880) {
        this.file = event.target.files[0];
        let fileReader = new FileReader();
        fileReader.readAsArrayBuffer(this.file);
        fileReader.onload = (e) => {
          this.arrayBuffer = fileReader.result;
          var data = new Uint8Array(this.arrayBuffer);
          var arr = new Array();
          for (var i = 0; i != data.length; ++i) arr[i] = String.fromCharCode(data[i]);
          var bstr = arr.join("");
          var workbook = XLSX.read(bstr, { type: "binary" });
          var first_sheet_name = workbook.SheetNames[0];
          var worksheet = workbook.Sheets[first_sheet_name];
          // console.log(XLSX.utils.sheet_to_json(worksheet, {
          //   header: 0,
          //   defval: ""
          // }));
          this.arraylist = XLSX.utils.sheet_to_json(worksheet, {
            header: 0,
            defval: ""
          });
          if(!this.TrailAccount){
            if(this.userLimit <=this.numberOfUsers + this.arraylist.length-1 && this.warning==false){
              const dialog = this.matDialog.open(OrgUserLimitComponentComponent, {
                width: '35%',
                panelClass: 'custom-viewdialogstyle',
                data: { key: "branch-delete", showComment: false }
              });
              dialog.afterClosed().subscribe(
                async resp => {
                  if (resp != undefined && resp != "") {
                    if (resp.data == true) {
          
                    }
                  }
                }
              );
            }
          }
        }
      } else {
        this.msg = "File size should be accepted maximum of 5MB";
      }

    }
  }

  arrayBuffer: any;
  file: any;
  uploadUserExcelFile() {
    this.spinner.show();
    let detailsArray: any = [];
    let finalData: Object;
    let zone = moment.tz.guess();
    //To validate email
    var regex =  (/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
    for (let i = 0; i < this.arraylist.length; i++) {  

      // To check first row(columns) in excel file is same
      if (!(this.arraylist[i].hasOwnProperty('first_name')) && !(this.arraylist[i].hasOwnProperty('last_name'))
        && !(this.arraylist[i].hasOwnProperty('password')) && !(this.arraylist[i].hasOwnProperty('email'))
        && !(this.arraylist[i].hasOwnProperty('date_of_joining')) && !(this.arraylist[i].hasOwnProperty('designation'))
        && !(this.arraylist[i].hasOwnProperty('reporting_manager')) && !(this.arraylist[i].hasOwnProperty('role'))
        && !(this.arraylist[i].hasOwnProperty('branch')) && !(this.arraylist[i].hasOwnProperty('stafftype'))
        && !(this.arraylist[i].hasOwnProperty('countrycode')) && !(this.arraylist[i].hasOwnProperty('mobilenumber'))
        && !(this.arraylist[i].hasOwnProperty('shift'))) {
        this.utilsService.openSnackBarMC("Invalid first row names!", "OK");
        this.spinner.hide();
        return;
      }
      // To check if there is any empty field      
      else if (this.arraylist[i].first_name === null || this.arraylist[i].first_name === undefined ||
        this.arraylist[i].first_name === "") {
        this.utilsService.openSnackBarMC("First name is required in " + (i + 2) + " row!", "OK");
        this.spinner.hide();
        // return;
      }
      else if (this.arraylist[i].last_name === null || this.arraylist[i].last_name === undefined ||
        this.arraylist[i].last_name === "") {
        this.utilsService.openSnackBarMC("Last name is required in " + (i + 2) + " row!", "OK");
        this.spinner.hide();
        return;
      }
      else if (this.arraylist[i].password === null || this.arraylist[i].password === undefined ||
        this.arraylist[i].password === "") {
        this.utilsService.openSnackBarMC("Password is required in " + (i + 2) + " row!", "OK");
        this.spinner.hide();
        return;
      }
      else if (this.arraylist[i].email === null || this.arraylist[i].email === undefined ||
        this.arraylist[i].email === "") {
        this.utilsService.openSnackBarMC("Email is required in " + (i + 2) + " row!", "OK");
        this.spinner.hide();
        return;
      }
      else if(!(regex.test(this.arraylist[i].email))){     
        this.utilsService.openSnackBarMC(this.arraylist[i].email +"   format is wrong!", "OK");
        this.spinner.hide();
        return;
      }
      else if (this.arraylist[i].date_of_joining === null || this.arraylist[i].date_of_joining === undefined ||
        this.arraylist[i].date_of_joining === "") {
        this.utilsService.openSnackBarMC("Date of joining is required in " + (i + 2) + " row!", "OK");
        this.spinner.hide();
        return;
      }
      else if (this.arraylist[i].designation === null || this.arraylist[i].designation === undefined ||
        this.arraylist[i].designation === "") {
        this.utilsService.openSnackBarMC("designation is required in " + (i + 2) + " row!", "OK");
        this.spinner.hide();
        return;
      }
      else if (this.arraylist[i].reporting_manager === null || this.arraylist[i].reporting_manager === undefined ||
        this.arraylist[i].reporting_manager === "") {
        this.utilsService.openSnackBarMC("Reporting manager is required in " + (i + 2) + " row!", "OK");
        this.spinner.hide();
        return;
      }
      else if (this.arraylist[i].role === null || this.arraylist[i].role === undefined ||
        this.arraylist[i].role === "") {
        this.utilsService.openSnackBarMC("Role is required in " + (i + 2) + " row!", "OK");
        this.spinner.hide();
        return;
      }
      else if (this.arraylist[i].branch === null || this.arraylist[i].branch === undefined ||
        this.arraylist[i].branch === "") {
        this.utilsService.openSnackBarMC("Branch is required in " + (i + 2) + " row!", "OK");
        this.spinner.hide();
        return;
      }
      else if(this.arraylist[i].date_of_joining === null || this.arraylist[i].date_of_joining === undefined ||
        this.arraylist[i].date_of_joining === "" ) {
          this.utilsService.openSnackBarMC("Date format is incorrect", "OK");
          this.spinner.hide();
          return;
        }
        else if(this.arraylist[i].stafftype === null || this.arraylist[i].stafftype === undefined ||
          this.arraylist[i].stafftype === "" ) {
            this.utilsService.openSnackBarMC("Staff type format is incorrect", "OK");
            this.spinner.hide();
            return;
          }
          else if(this.arraylist[i].shift === null || this.arraylist[i].shift === undefined ||
            this.arraylist[i].shift === "" ) {
              this.utilsService.openSnackBarMC("Shift format is incorrect", "OK");
              this.spinner.hide();
              return;
            }
          else if (this.arraylist[i].countrycode  === null || this.arraylist[i].countrycode  === undefined || // to find which row is empty
            this.arraylist[i].countrycode  === "") {
            this.utilsService.openSnackBarMC("Country Code  is required in " + (i + 2) + " row!", "OK");
            this.spinner.hide();
            return;
          }
          else if (this.arraylist[i].mobilenumber === null || this.arraylist[i].mobilenumber === undefined ||
            this.arraylist[i].mobilenumber === "") {
            this.utilsService.openSnackBarMC("Mobile Number is required in " + (i + 2) + " row!", "OK");
            this.spinner.hide();
            return;
          }
    }
    //To validate emails in excel sheet getting duplicate or not
    this.emailFromExcel = [];
    this.uniqueEmails = [];
    this.duplicateEmails = [];
    for (let i = 0; i < this.arraylist.length; i++) { 
      this.emailFromExcel.push(this.arraylist[i].email);
    }  
    this.emailFromExcel.map(emailId=>{
      if(!(this.uniqueEmails.includes(emailId))) {
        this.uniqueEmails.push(emailId); 
      }
      else {
        this.duplicateEmails.push(emailId);
      }
    });
    if(this.duplicateEmails.length !=0) {
        this.clearDuplicateEmailInExcel = true;
        this.isImportedFileAvail = true;        
        this.utilsService.openSnackBarMC("Email you have entered in excel sheet is duplicated", "OK");
        this.spinner.hide();
        return;
    }

    //To validate given names in excel sheet getting duplicate or not
    this.concatedName = [];
    this.uniqueName = [];
    this.duplicateNameInExcel = [];
    for (let i = 0; i < this.arraylist.length; i++) {
      this.concatedName.push(this.arraylist[i].first_name.concat(this.arraylist[i].last_name));
    }
    this.concatedName.map(concatedName1 => {
      if (!(this.uniqueName.includes(concatedName1))) {
        this.uniqueName.push(concatedName1);
      } else {
        this.duplicateNameInExcel.push(concatedName1);
      }
    })
    if (this.duplicateNameInExcel.length != 0) {
      this.clearDuplicateNameInExcel = true;
      this.isImportedFileAvail = true;
      this.utilsService.openSnackBarMC("Name you entered in excel sheet gets duplicated", "OK");
      this.spinner.hide();
      return;
    }

      //To validate mobile number in excel sheet getting duplicate or not
      this.mobileNoFromExcel = [];
      this.uniqueMobileNumber = [];
      this.duplicateMobileNumber = [];
      for (let i = 0; i < this.arraylist.length; i++) { 
        this.mobileNoFromExcel.push(this.arraylist[i].mobilenumber);
      }  
      this.mobileNoFromExcel.map(mobilenumberList=>{
        if(!(this.uniqueMobileNumber.includes(mobilenumberList))) {
          this.uniqueMobileNumber.push(mobilenumberList); 
        }
        else {
          this.duplicateMobileNumber.push(mobilenumberList);
        }
      });
      if(this.duplicateMobileNumber.length !=0) {
          this.clearDuplicateMobileNumberInExcel = true;
          this.isImportedFileAvail = true;        
          this.utilsService.openSnackBarMC("Mobile number you entered in excel sheet gets duplicated", "OK");
          this.spinner.hide();
          return;
      }
  //  })
   if(this.duplicateNameInExcel.length !=0) {
    this.clearDuplicateNameInExcel = true;
    this.isImportedFileAvail = true;        
    this.utilsService.openSnackBarMC("User name you have entered in excel is duplicated", "OK");
    this.spinner.hide();
    return;
}
    for (let i = 0; i < this.arraylist.length; i++) {
      let tempData: Object = {
        "firstname": this.arraylist[i]["first_name"],
        "lastname": this.arraylist[i]["last_name"],
        "email": this.arraylist[i]["email"],
        "password": this.arraylist[i]["password"].toString(),
        "role": this.arraylist[i]["role"],
        "branch": this.arraylist[i]["branch"],
        "designation": this.arraylist[i]["designation"],
        "reporting_manager": this.arraylist[i]["reporting_manager"],
        "staffTypes": this.arraylist[i]["stafftype"],
        "country_code_id" : this.arraylist[i]["countrycode"].toString(),
        "login_mobilenumber" : this.arraylist[i]["mobilenumber"].toString(),
        "shift": this.arraylist[i]["shift"],
        "date_of_joining": new Date(Math.round((this.arraylist[i]["date_of_joining"] - 25569) * 86400 * 1000)),
      }
      detailsArray.push(tempData);
    }
    finalData = {
      "org_id": localStorage.getItem('OrgId'),
      "detailsArray": detailsArray,
      "login_str": this.login_str,
      "timezone": zone,
    }
    this.settingsService.updateBulkEmpDetailsFromExcel(finalData).subscribe(data => {
      if (detailsArray.length === 0) {
        this.utilsService.openSnackBarMC(" Excel Format is incorrect!", "OK");
        this.spinner.hide();
      }
      else if (data.map.statusMessage == "Success" && data.map.Error == "Error in creating user due to mail configuration check the configuration details") {
        let response = JSON.parse(data.map.data);
        if(response.length <=1){ 
        this.emp_org_data = response.orgDetails.emp_id;
        this.new_emp_id = response.id;     
        } else if(response.length >1){
          this.emp_org_data = response[0].orgDetails.emp_id;
          this.new_emp_id = response[0].id;  
        } else {
          this.emp_org_data = response.orgDetails.emp_id;
          this.new_emp_id = response.id; 
        }
        this.utilsService.openSnackBarAC("Bulk users onboarded successfully", "OK");
        this.notificationWithEmailMsg();
        if(localStorage.getItem("Role") != 'org_admin') {
          setTimeout(() => {
            this.utilsService.openSnackBarMC("Mail configuration issue encountered, please contact admin", "OK");
          }, 2000);
        } else {
          setTimeout(() => {
            this.utilsService.openSnackBarMC("Mail configuration issue encountered, please check it", "OK");
          }, 2000);
        }
        this.spinner.hide();
        this.dialogRef.close();
        this.maillIssue = true;
        let idArray: any= [];
        for (let i = 0; i < response.length; i++) {
          localStorage.setItem("MailIssue", "true");
          idArray.push(response[i].id);
        }
        localStorage.setItem("EmpIdMailNotSent", JSON.stringify(idArray));
      }
      else if (data.map.statusMessage == "Success") {
        this.utilsService.openSnackBarAC("Bulk users onboarded successfully", "OK");
        this.spinner.hide();
        this.dialogRef.close();
        this.maillIssue = false;
      }
      else if (data.map.statusMessage == "Error" && data.map.data == "Duplicate Email Exists!") {
        this.duplicateEmail = data.map.duplicateEmailIds.myArrayList;
        
        this.clearDuplicateEmail = true;
        this.isImportedFileAvail = true;
        this.utilsService.openSnackBarMC(" Email already exists!", "OK");
        this.spinner.hide();
      }
      else if (data.map.statusMessage == "Error" && data.map.data == "Duplicate Name Exists!") {
        this.duplicateName = data.map.duplicateName.myArrayList;
        this.clearDuplicateName = true;
        this.isImportedFileAvail = true;
        this.utilsService.openSnackBarMC("User name already exist", "OK");
        this.spinner.hide();
      }
      else if (data.map.statusMessage == "Error" && (data.map.data.includes("Designation is not found"))) {
        this.utilsService.openSnackBarMC(data.map.data, "OK");
        this.spinner.hide();
      }
      else if (data.map.statusMessage == "Error" && (data.map.data.includes("Role is not found"))){
        this.utilsService.openSnackBarMC(data.map.data, "OK");
        this.spinner.hide();
      }
      else if (data.map.statusMessage == "Error" && (data.map.data .includes("Branch is not found"))) {
        this.utilsService.openSnackBarMC(data.map.data, "OK");
        this.spinner.hide();
      }
       else if (data.map.statusMessage == "Error" && (data.map.data.includes("Reporting manager id is not found"))) {
        this.utilsService.openSnackBarMC(data.map.data,"OK");
        this.spinner.hide();
      }
      else if (data.map.statusMessage == "Error" && (data.map.data.includes("Staff type is not found"))) {
        this.utilsService.openSnackBarMC(data.map.data,"OK");
        this.spinner.hide();
      }
      else if (data.map.statusMessage == "Error" && (data.map.data.includes("Country Tel Code is not found in the database!"))) {
        this.utilsService.openSnackBarMC(data.map.data,"OK");
        this.spinner.hide();
      }
      else if (data.map.statusMessage == "Error" && (data.map.data.includes("Duplicate mobile number exists!"))) {
        this.duplicateMobileNumber = data.map.duplicateMobileNumbesr.myArrayList;;
        this.clearDuplicateMobileNumberInExcel = true;
        this.isImportedFileAvail = true;
        this.utilsService.openSnackBarMC(data.map.data,"OK");
        this.spinner.hide();
      }
      else {
        this.utilsService.openSnackBarMC("Failed to create user", "OK");
        this.spinner.hide();
      }
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
    })
  }
  // }
  resetImportedFile() {
    this.myInputVariable.nativeElement.value = "";
    this.file = "";
    this.clearDuplicateEmail = false;
    this.clearDuplicateName = false;
    this.clearDuplicateEmailInExcel = false;
    this.clearDuplicateNameInExcel = false;
    this.msg = "";
    this.arraylist = [];
  }
  exportSampleExcelFile(): void {
    /* pass here the table id */
    let element = document.getElementById('excel-table');
    const ws: XLSX.WorkSheet = XLSX.utils.table_to_sheet(element,
      { dateNF: 'mm/dd/yyyy;@', cellDates: true, raw: true });

    /* generate workbook and add the worksheet */
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

    var range = { s: { r: 0 }, e: { r: 4 } };//A1:H5

    /* save to file */
    XLSX.writeFile(wb, this.fileName);
  }
  async notificationWithEmailMsg() {
    this.spinner.show();
    let notify_id;
    let zone = moment.tz.guess();
    let message =
    "Mail configuration issue encountered while creating bulk users.";
    let formdata = {
      "org_id":  localStorage.getItem("OrgId"),
      "message": message,
      "to_notify_id":  this.emp_org_data,
      "notifier": this.new_emp_id,
      "keyword": "mail-issue",
      "timezone": zone,
    };
    await this.notificationService
      .postNotification(formdata)
      .subscribe((data) => {
        if (data.map.statusMessage == "Success") {
          this.spinner.hide();
        } else {
          this.spinner.hide();
        }
      });
  }
}
