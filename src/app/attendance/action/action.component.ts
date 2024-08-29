import { DatePipe } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import  moment from 'moment-timezone';
import { connectableObservableDescriptor } from 'rxjs/internal/observable/ConnectableObservable';
import { AttendanceServiceService } from 'src/app/services/attendance-service.service';
import { NotallowedComponent } from './notallowed/notallowed.component';
import { NgxSpinnerService } from 'ngx-spinner';
import { Router } from '@angular/router';


@Component({
  selector: 'app-action',
  templateUrl: './action.component.html',
  styleUrls: ['./action.component.less']
})
export class ActionComponent implements OnInit {

  constructor(public dialog: MatDialog,
    public dialogRef: MatDialogRef<any>,
     @Inject(MAT_DIALOG_DATA) public data: any,
     private attendanceService: AttendanceServiceService,
     private router: Router,
     private spinner: NgxSpinnerService,
     private datepipe: DatePipe) { 
      // console.log(data);
     }
  show: string;
  action: any;
  actiontype: string;
  public showother: boolean = false;
  isDisabled: boolean = false;
  othercontroller = new UntypedFormControl();
  actioncards:any[]=[];
  actionsection:string;
  cards: any[]=[];
  verifycards: any[]=[];
  cancelIndex: number;
  calcelaction: string;
  email: string;
  today:any;
  leavelist: any[] = [];
  notallowed: any[] = [];   
  labelPosition: 'in' | 'out';
  checkboxActionOut:boolean = false;
  ngOnInit() {
    this.today = moment().format("DD-MM-YYYY");
    this.show = this.data.actiontype;
    this.actiontype = this.data.actiontype;
    this.action = this.data.action;
    this.actioncards = this.data.actioncards;
    this.actionsection = this.data.actionsection;
    if(this.actionsection == "out"){
      this.checkboxActionOut = true;
      this.labelPosition = 'out';
    } else{
      this.checkboxActionOut = false;
      this.labelPosition = 'in';
    }
    this.email = localStorage.getItem("Email");
    this.cards = [];   
    if(this.actionsection== undefined){
      this.actionsection = 'in';
    }
    else{
      if(this.action.actionType==="out" && this.action.next_section === "back" && this.action.dateOfRequest != this.today){
        this.actionsection = 'in';
      }
    }    
    for(var bk=0;bk<this.actioncards.length; bk++){
      if(this.actioncards[bk].map.current_section==this.actionsection){
          this.cards.push(this.actioncards[bk].map);
      }

      if(this.actioncards[bk].current_section=="in" && this.actioncards[bk].next_section=="in"){
       this.leavelist.push(this.actioncards[bk].action);
      }
    }
    // if(this.action != undefined){
    //   for(var j =0;j<this.cards.length;j++){
    //     if(this.cards[j].action==this.action.action && this.today === this.action.dateOfRequest){
    //       this.cancelIndex = j;
    //       this.cards[this.cancelIndex].action = "Cancel "+this.cards[this.cancelIndex].action;
    //     }
    //   }
    // }
    
    
    
    if(this.cancelIndex != undefined){
      setTimeout(() => {  this.cancelenable();},200)
    }
    this.getdatereport();

  }
  canceleleave(card){
    let formdata = {
      "action": card.action,
      "next_section":"in",
      "action_type": "out"
    }
    this.clickcard(formdata);
  }
  cancelenable(){
    var otherelement = document.getElementById("other");
    if(otherelement.classList.contains("disable")){
      otherelement.classList.remove('disable');
    }
    else{
      otherelement.classList.add('disable');
    }
    for(var bk=0; bk<this.cards.length;bk++){
      if(this.cancelIndex != bk){
        var element = document.getElementById("actionId"+bk);
        if(element.classList.contains("disable")){
            element.classList.remove('disable');
        }
        else{
            element.classList.add('disable');
        }
      }  
    }
  }

  clickcard(action: any) {
    if(!this.notallowed.includes(action.action)){
      this.dialogRef.close({ data: action});
    }else{  
      const dialogRef = this.dialog.open(NotallowedComponent, { width: '50%',  panelClass: 'custom-viewdialogstyle', });
      
      
    }
    // if(action == "Back to work"){
    //   this.actiontype='in';
    // }
    // this.dialogRef.close({ data: action})
    // this.dialogRef.close({ data: action.action ,type: this.actiontype})
    // this.onNoClick();
  }
  switchinout(type:string){
    this.actiontype= type;
    // if(this.actiontype=='in'){
    //    this.actiontype='out';
    // }
    // else{
    //   this.actiontype='in';
    // }
  }
  othervalue() {
    var tempnext ='';
    if(this.actiontype==='in'){
      tempnext='out';
   }
   else{
     tempnext='in';
   }
    let formdata = {
      "action": this.othercontroller.value,
      "next_section":tempnext,
      "action_type": this.actiontype
    }
    this.clickcard(formdata);
  }
  togglefield() {
    this.showother = !this.showother;
    for(var bk=0; bk<this.cards.length;bk++){
         var element = document.getElementById("actionId"+bk);
         if(element.classList.contains("disable")){
             element.classList.remove('disable');
         }
         else{
             element.classList.add('disable');
         }
    }
  }
  onNoClick(): void {
    this.dialogRef.close();
  }
  getdatereport() {
    let date = this.datepipe.transform(new Date(), 'dd-MM-yyyy')
    this.attendanceService.getactiondatereportdata(date, this.email).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        let response = data.map.outActionReport.myArrayList;
        for(let bk=0; bk<response.length; bk++) {
            if(this.leavelist.includes(response[bk].map.action)){
              this.notallowed.push(response[bk].map.action);
            }
        }
      }
     
    }, (error) => {
      this.dialogRef.close();
      this.router.navigate(["/404"]);
      this.spinner.hide();
    })
  }
}
