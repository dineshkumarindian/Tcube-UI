import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ReplaySubject, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ManageattendanceService } from 'src/app/services/manageattendance.service';
import { UtilService } from 'src/app/services/util.service';
import {errorMessage,noDataMessage,alreadyExistMessage,validFormat} from '../../../../util/constants';

@Component({
  selector: 'app-action-card-form',
  templateUrl: './action-card-form.component.html',
  styleUrls: ['./action-card-form.component.less']
})
export class ActionCardFormComponent implements OnInit {

  nodataMsg = noDataMessage;
  existMessage = alreadyExistMessage;
  requiredMessage = errorMessage;
  whiteSpaceMessage = validFormat;
  allActionCard: any[] = [];
  heading: string;
  subheading: string;
  isActionIdAvail: boolean = false;
  isActionNmeAvail: boolean =false;

  constructor(private formBuilder: UntypedFormBuilder,
    private router: Router,
    public matDialog: MatDialog,
    private utilsService: UtilService,
    private spinner: NgxSpinnerService,
    private dialog: MatDialog,
    private domSanitizer: DomSanitizer,
    private activatedRoute: ActivatedRoute,
    private manageattendanceService: ManageattendanceService,) { }
    actioncard_id: any;
  ngOnInit() {
    this.ActionCard();
    this.actioncard_id = this.activatedRoute.snapshot.params.id;
    if(this.actioncard_id){
      this.heading = "Edit Action Card";
      this.subheading = "Edit action card configuration details";
      this.isActionIdAvail =true;
      setTimeout(() => {
      this.setactioncardvalues(this.actioncard_id);
      }, 1000);
    }
    else{
      this.heading = "Add Action Card";
      this.subheading = "Create attendance action card configuration details"
    }
    let action = localStorage.getItem("atd-form");
    let actionsection;
    if (action == "In Actions") {
      actionsection = "in";
    }
    if (action == "Out Actions") {
      actionsection = "out";
    }
    if (action == "Back Actions") {
      actionsection = "back";
    }
    this.currentActionCtrl.setValue(actionsection);
     // load the initial action type list
     this.filteredactiontype.next(this.actiontype.slice());

     // listen for search field value changes
     this.actiontypeFilterCtrl.valueChanges
       .pipe(takeUntil(this._onDestroy))
       .subscribe(() => {
         this.filteractiontype();
       });
 
     // load the initial current action 
     this.filteredcurrentact.next(this.actionsec.slice());
 
     // listen for search field value changes
     this.currentacttypeFilterCtrl.valueChanges
       .pipe(takeUntil(this._onDestroy))
       .subscribe(() => {
         this.filteractionsection();
       });
 
     // load the initial after action 
     this.filteredafteract.next(this.actionaftersec.slice());
 
     // listen for search field value changes
     this.afteracttypeFilterCtrl.valueChanges
       .pipe(takeUntil(this._onDestroy))
       .subscribe(() => {
         this.filterafteractionsection();
       });
  }

  /** list of actiontype */
  protected actiontype: any[] = [
    { name: 'In', value: 'in', id: 1 },
    { name: 'Out', value: 'out', id: 2 },
    // { name: 'Leave', value: 'leave', id: 3 }
  ];

  /** list of actionsec */
  protected actionsec: any[] = [
    { name: 'In', value: 'in', id: 1 },
    { name: 'Out', value: 'out', id: 2 },
    { name: 'Back', value: 'back', id: 3 }
  ];

  /** list of after actionsec */
  protected actionaftersec: any[] = [
    { name: 'In', value: 'in', id: 1 },
    { name: 'Out', value: 'out', id: 2 },
    { name: 'Back', value: 'back', id: 3 }
  ];

    /** Subject that emits when the component has been destroyed. */
    protected _onDestroy = new Subject<void>();
    
    /** control for the selected actiontype */
    public acttypeCtrl: UntypedFormControl = new UntypedFormControl("", [Validators.required]);

    /** control for the selected current action */
    public currentActionCtrl: UntypedFormControl = new UntypedFormControl("", [Validators.required]);
  
    /** control for the selected current action */
    public afterActionCtrl: UntypedFormControl = new UntypedFormControl("", [Validators.required]);
  
    /** control for the MatSelect filter keyword */
    public actiontypeFilterCtrl: UntypedFormControl = new UntypedFormControl();
  
    /** list of bill filtered by search keyword */
    public filteredactiontype: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);
  
    /** control for the MatSelect filter keyword */
    public currentacttypeFilterCtrl: UntypedFormControl = new UntypedFormControl();
  
    /** list of bill filtered by search keyword */
    public filteredcurrentact: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);
  
    /** control for the MatSelect filter keyword */
    public afteracttypeFilterCtrl: UntypedFormControl = new UntypedFormControl();
  
    /** list of bill filtered by search keyword */
    public filteredafteract: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);

    protected filteractiontype() {
      if (!this.actiontype) {
        return;
      }
      // get the search keyword
      let search = this.actiontypeFilterCtrl.value;
      if (!search) {
        this.filteredactiontype.next(this.actiontype.slice());
        return;
      } else {
        search = search.toLowerCase();
      }
      // filter the client
      this.filteredactiontype.next(
        this.actiontype.filter(actiontype => actiontype.name.toLowerCase().indexOf(search) > -1)
      );
    }
    protected filteractionsection() {
      if (!this.actionsec) {
        return;
      }
      // get the search keyword
      let search = this.currentacttypeFilterCtrl.value;
      if (!search) {
        this.filteredcurrentact.next(this.actionsec.slice());
        return;
      } else {
        search = search.toLowerCase();
      }
      // filter the action section
      this.filteredcurrentact.next(
        this.actionsec.filter(actionsec => actionsec.name.toLowerCase().indexOf(search) > -1)
      );
    }
    protected filterafteractionsection() {
      if (!this.actionaftersec) {
        return;
      }
      // get the search keyword
      let search = this.afteracttypeFilterCtrl.value;
      if (!search) {
        this.filteredafteract.next(this.actionaftersec.slice());
        return;
      } else {
        search = search.toLowerCase();
      }
      // filter the client
      this.filteredafteract.next(
        this.actionaftersec.filter(actionaftersec => actionaftersec.name.toLowerCase().indexOf(search) > -1)
      );
    }

    msg: any;
    selectedFile: File = null;
    fileSize: number = 0;
    base64url: any;
    attachment_update: File = null;
    attachmentName: any;
    attachment: File = null;
    attachmentCopy: any;
    url: any;
    filetype: any;
    onFileChanged(event: any) {
      if (!(event.target.files[0] || event.target.files[0].length == 0)) {
        this.msg = "you must select an Image";
        return;
      }
      var mimeType = event.target.files[0].type;
      if (mimeType.match(/image\/*/) == null) {
        this.msg = "Accept jpg,png image format";
      } else {
        if (event.target.files[0].size <= 500000) {
          var reader = new FileReader();
          reader.readAsDataURL(event.target.files[0]);
          this.selectedFile = event.target.files[0];
          this.filetype = this.selectedFile.type;
          this.attachmentName = this.selectedFile.name;
          this.attachmentCopy = this.selectedFile;
          reader.onload = (_event) => {
            this.msg = "";
            this.url = reader.result;
            // console.log(this.url);
          }
        }
        else {
          this.msg="Image size should be accepted maximum of 500KB";
          // this.utilsService.openSnackBarMC("Please select below 500kb only", "OK");
          this.spinner.hide();
        }
  
      }
      this.fileSize = this.selectedFile.size;
      this.attachment = this.selectedFile;
      this.attendanceceActionGroup.get("actimg").setValue(this.attachment);
      this.imagerestriction();
    }

    atdbtn_imgrest:boolean = true;
  // for image restruction on add leave type
  imagerestriction() {
    if ((this.filetype == 'image/png') || (this.filetype == 'image/jpeg') || (this.filetype == 'image/jpg') || (this.filetype == 'image/webp')) {
      this.atdbtn_imgrest = true;
    }
    else {
      this.atdbtn_imgrest = false;
    }
  }
    //attendance action form
    attendanceceActionGroup: UntypedFormGroup = this.formBuilder.group({
      action_name: ['', [Validators.required,Validators.pattern(/^(\s+\S+\s*)*(?!\s).*$/)]],
      // acttype: ['', [Validators.required]],
      // after: ['', [Validators.required]],
      // current: ['', [Validators.required]],
      // actimg: ['', [Validators.required]]
      actimg: ['']
    })

    onactiontypechange() {
      if (this.acttypeCtrl.value == "in") {
        this.actionsec = [
          { name: 'In', value: 'in', id: 1 },
          { name: 'Back', value: 'back', id: 2 }
        ];
        this.actionaftersec = [
          { name: 'Out', value: 'out', id: 1 }
        ];
      }
      if (this.acttypeCtrl.value == "out") {
        this.actionsec = [
          // { name: 'In', value: 'in', id: 1 },
          { name: 'Out', value: 'out', id: 1 }
        ];
        this.actionaftersec = [
          { name: 'In', value: 'in', id: 1 },
          { name: 'Back', value: 'back', id: 2 }
        ];
      }
      // if (this.acttypeCtrl.value == "leave") {
      //   this.actionsec = [
      //     { name: 'In', value: 'in', id: 1 }
      //   ];
      //   this.actionaftersec = [
      //     { name: 'In', value: 'in', id: 1 }
      //   ];
      // }
  
  
      // load the initial current action 
      this.filteredcurrentact.next(this.actionsec.slice());
      this.filteredafteract.next(this.actionaftersec.slice());
  
    }
// getall action cards
ActionCard() {
  this.spinner.show();
  this.allActionCard = [];
  this.manageattendanceService.getAllActionCardByOrgId(localStorage.getItem("OrgId")).subscribe(async data => {

    if (data.map.statusMessage == "Success") {
      // let response: any[] = JSON.parse(data.map.data);
      let response = data.map.data.myArrayList;
      for (var i = 0; i < response.length; i++) {
        this.allActionCard.push(response[i].map.action.toLowerCase());
        
      }
      this.spinner.hide();
    }
    else {
      this.spinner.hide();
    }
    this.tempActionCardsname = this.allActionCard;
  }, (error) => {
    this.router.navigate(["/404"]);
    this.spinner.hide();
  })
}
   //remove duplicate action name of attendance name
   onAttendanceAction: boolean = false;
   tempActionCardsname: any[] = [];
   onCheckAttendanceName(event) {
    if(this.isActionIdAvail) {
     for(let i=0;i< this.tempActionCardsname.length;i++) {
       if (this.attendanceceActionGroup.get('action_name').value == this.tempActionCardsname[i]) {
         this.tempActionCardsname.splice(i, 1);
       }
     }
     this.isActionIdAvail = false;
    }
   // check project name is already exist or not
   if (this.attendanceceActionGroup.value.action_name) {
    if (this.tempActionCardsname.find(x => x.toLowerCase() == event.toLowerCase()))
      this.isActionNmeAvail = true;
    else this.isActionNmeAvail = false;
  }
}

  //  onCheckAttendanceName() {
  //    var value = this.attendanceceActionGroup.get('action_name').value;
  //    if (value) {
  //      if (this.tempActionCardsname.includes(value.toLowerCase())) {
  //        this.onAttendanceAction = true;
  //      }
  //      else {
  //        this.onAttendanceAction = false;
  //      }
  //    }
  //  }

     ///****************** URL to file function***************///
  async getFileFromUrl(url, name, defaultType = 'image/jpeg') {
    const response = await fetch(url);
    const data = await response.blob();
    this.attachmentName = name;
    return new File([data], name, {
      type: data.type || defaultType,
    });
  }

  cancel_actionimage(){
    this.attachmentName = null;
    this.attachmentCopy = null;
    this.attachment = null;
    this.fileSize = null;
    this.selectedFile = null;
    this.atdbtn_imgrest= true;
    this.url = "";
    this.attendanceceActionGroup.get("actimg").setValue(null);
  }

   cancel() {
    this.attachmentName = null;
    this.attachmentCopy = null;
    this.attachment = null;
    this.fileSize = null;
    this.selectedFile = null;
    this.url = null;
    this.atdbtn_imgrest= true;
    this.attendanceceActionGroup.get("actimg").setValue('');
    // this.router.navigate(['/attendance-settings']);
  }

  //post action cards
  cancelattendance() {
    this.afterActionCtrl.setValue('');
    this.currentActionCtrl.setValue('');
    this.acttypeCtrl.setValue('');
    this.attendanceceActionGroup.get("action_name").setValue('');
    this.attendanceceActionGroup.get("actimg").setValue('');
    this.attendanceceActionGroup.get("action_name").setValue('');
    this.cancel();
    this.router.navigate(['/attendance-settings']);
  }

  actioncards: any[] = [
    {
      "action_image": "../../../assets/images/punch-cards-icon/office-white.png",
    }
  ];
  filecheck: any;
  async postattendanceaction() {
    this.spinner.show();
    var formData = new FormData();
    let actiontype;
    if (this.acttypeCtrl.value === "leave" || this.acttypeCtrl.value === "out") {
      actiontype = "out";
    }
    else {
      actiontype = "in";
    }
    formData.append('org_id', localStorage.getItem("OrgId"));
    formData.append('action', this.attendanceceActionGroup.get("action_name").value);
    formData.append('action_type', actiontype);
    formData.append('current_section', this.currentActionCtrl.value);
    formData.append('next_section', this.afterActionCtrl.value);

    this.filecheck = this.attendanceceActionGroup.get("actimg").value;
    if (this.filecheck == "" || this.filecheck == null) {
      var file = await this.getFileFromUrl("../../../assets/images/punch-cards-icon/default.png", 'image.jpg');
      formData.append('action_img', file);
    } else {
      formData.append('action_img', this.attendanceceActionGroup.get("actimg").value);
    }
    // console.log(formData);

    this.manageattendanceService.createActionCard(formData).subscribe(res => {
      // this.showallcards = !this.showallcards;
      this.ActionCard();
      if (res.map.statusMessage == "Success") {
        this.utilsService.openSnackBarAC("Action card added successfully", "OK");
        this.spinner.hide();
      }
      else {
        this.utilsService.openSnackBarMC("Action card failed to create", "OK");
        this.spinner.hide();
      }
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
    })
    localStorage.removeItem("atd-form");
    setTimeout(() => {
    this.router.navigate(["/attendance-settings"]);
    }, 1000);
  }

  //set for values
  updateaction:boolean = false;
  setactioncardvalues(id) {
    this.spinner.show();
    this.updateaction = true;
    this.manageattendanceService.getActionCardByid(id).subscribe(data=>{
      if(data.map.statusMessage == "Success") {
        let card = JSON.parse(data.map.data);
        let actiontype;
        if (card.action_type === "out" && card.current_section === "in" && card.next_section === "in") {
          actiontype = "leave";
        }
        else {
          actiontype = card.action_type;
        }
        this.tempActionCardsname = [];
        for (let k = 0; k < this.allActionCard.length; k++) {
          if (!((card.action).toLowerCase() == this.allActionCard[k])) {
            let data = this.allActionCard[k];
            this.tempActionCardsname.push(data);
          }
        }
        this.afterActionCtrl.setValue(card.next_section);
        this.currentActionCtrl.setValue(card.current_section);
        this.acttypeCtrl.setValue(actiontype);
        this.attendanceceActionGroup.get("action_name").setValue(card.action);
        let base64 = card.action_image;
        let stringArray = new Uint8Array(card.action_image);
        const STRING_CHAR = stringArray.reduce((data, byte) => {
          return data + String.fromCharCode(byte);
        }, '');
        base64 = btoa(STRING_CHAR);
        const imageName = 'name.png';
        const imageBlob = this.dataURItoBlob(base64);
        const imageFile = new File([imageBlob], imageName, { type: 'image/png' });
        this.attendanceceActionGroup.get("actimg").setValue(imageFile);
        var reader = new FileReader();
        reader.readAsDataURL(imageFile);
        this.selectedFile = imageFile;
        this.attachmentName = this.selectedFile.name;
        this.attachmentCopy = this.selectedFile;
        // this.selectedFile = event.target.files[0];
        reader.onload = (_event) => {
          this.msg = "";
          this.url = reader.result;
          // console.log(this.url);
        }
        this.fileSize = this.selectedFile.size;
        this.attachment = this.selectedFile;
        this.attendanceceActionGroup.get("actimg").setValue(this.attachment);
        this.onactiontypechange();
      }
      else{
        this.utilsService.openSnackBarMC("Failed to set the action card values","OK");
      }
      this.spinner.hide();
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
    })
   
  }

  dataURItoBlob(dataURI) {
    const byteString = window.atob(dataURI);
    const arrayBuffer = new ArrayBuffer(byteString.length);
    const int8Array = new Uint8Array(arrayBuffer);
    for (let i = 0; i < byteString.length; i++) {
      int8Array[i] = byteString.charCodeAt(i);
    }
    const blob = new Blob([int8Array], { type: 'image/png' });
    return blob;
  }

  //update function for the action cards
  async updateattendanceaction() {
    this.spinner.show();
    let actiontype;
    if (this.acttypeCtrl.value === "leave" || this.acttypeCtrl.value === "out") {
      actiontype = "out";
    }
    else {
      actiontype = "in";
    }
    var formData = new FormData();
    formData.append('id', this.actioncard_id);
    formData.append('org_id', localStorage.getItem("OrgId"));
    formData.append('action', this.attendanceceActionGroup.get("action_name").value);
    formData.append('action_type', actiontype);
    formData.append('current_section', this.currentActionCtrl.value);
    formData.append('next_section', this.afterActionCtrl.value);
    // formData.append('action_img', this.attendanceceActionGroup.get("actimg").value);
    this.filecheck = this.attendanceceActionGroup.get("actimg").value;
    if (this.filecheck == "" || this.filecheck == null) {
      var file = await this.getFileFromUrl("../../../assets/images/punch-cards-icon/default.png", 'image.jpg');
      formData.append('action_img', file);
    } else {
      formData.append('action_img', this.attendanceceActionGroup.get("actimg").value);
    }
    this.manageattendanceService.updateActionCard(formData).subscribe(res => {
      if (res.map.statusMessage == "Success") {
        this.utilsService.openSnackBarAC("Action card updated successfully", "OK");
        this.spinner.hide();
         this.redirectbtn();
      }
      else {
        this.utilsService.openSnackBarMC("Action card failed to update", "OK");
      }
      this.spinner.hide();
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
    })
  }

  redirectbtn(){
    // let action;
    // let data = localStorage.getItem("atd-form");
    // console.log(data);
    
        //  localStorage.removeItem("atd-form");
        //  console.log(data);
        //  if(data === "In Actions" || data === "any"){
        //   action = "in";
        // }
        // if(data === "Out Actions"){
        //   action = "out";
        // }
        // if(data === "Back Actions"){
        //   action = "back";
        // }
        // localStorage.setItem("action-card",action);
        // console.log(action);
        
         this.router.navigate(['/manage-action-cards']);
  }
}
