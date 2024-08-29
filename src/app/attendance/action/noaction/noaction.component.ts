import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ManageattendanceService } from 'src/app/services/manageattendance.service';

@Component({
  selector: 'app-noaction',
  templateUrl: './noaction.component.html',
  styleUrls: ['./noaction.component.less']
})
export class NoactionComponent implements OnInit {
  actioncards: any[] = [
    {
      "action":"I am in from office",
      "action_type":"in",
      "action_image":"../../../assets/images/punch-cards-icon/office-white.png",
      "current_section":"in",
      "next_section":"out"
    },
    {
     "action":"I am in from home",
     "action_type":"in",
     "action_image":"../../../assets/images/punch-cards-icon/home-white.png",
     "current_section":"in",
     "next_section":"out"
   },
  //  {
  //   "action":"Off today",
  //   "action_type":"out",
  //   "action_image":"../../../assets/images/punch-cards-icon/leave-white.png",
  //   "current_section":"in",
  //   "next_section":"in"
  // },
  {
   "action":"Commuting",
   "action_type":"in",
   "action_image":"../../../assets/images/punch-cards-icon/travel-white.png",
   "current_section":"in",
   "next_section":"out"
 },
 {
  "action":"Out now will connect later",
  "action_type":"out",
  "action_image":"../../../assets/images/punch-cards-icon/cf-white.png",
  "current_section":"out",
  "next_section":"back"
} ,
 {
  "action":"Out for personal work",
  "action_type":"out",
  "action_image":"../../../assets/images/punch-cards-icon/pwrk-white.png",
  "current_section":"out",
  "next_section":"back"
} ,
 {
  "action":"Out for official work",
  "action_type":"out",
  "action_image":"../../../assets/images/punch-cards-icon/officialwork-white.png",
  "current_section":"out",
  "next_section":"back"
} ,
 {
  "action":"Feeling sick will take rest",
  "action_type":"out",
  "action_image":"../../../assets/images/punch-cards-icon/sick-white.png",
  "current_section":"out",
  "next_section":"back"
} ,
{
 "action":"I am out",
 "action_type":"out",
 "action_image":"../../../assets/images/punch-cards-icon/out-sign-white.png",
 "current_section":"out",
 "next_section":"in"
} ,
{
"action":"Out for break",
"action_type":"out",
"action_image":"../../../assets/images/punch-cards-icon/out_for_break.png",
"current_section":"out",
"next_section":"back"
} ,
{
"action":"Out for Lunch",
"action_type":"out",
"action_image":"../../../assets/images/punch-cards-icon/out_for_lunch.png",
"current_section":"out",
"next_section":"back"
} ,
{
"action":"Back to work",
"action_type":"in",
"action_image":"../../../assets/images/punch-cards-icon/back-work-white.png",
"current_section":"back",
"next_section":"out"
}
  ];
  constructor(
    private manageattendanceService: ManageattendanceService,
    public router: Router,
    public dialogRef: MatDialogRef<any>,
    private spinner: NgxSpinnerService) { }

  ngOnInit() {
  }
  async defaultcardPost(){
    this.spinner.show();
    for await (let card of this.actioncards){
            var formData = new FormData();
            formData.append('org_id', localStorage.getItem("OrgId"));
            formData.append('action', card.action);
            formData.append('action_type', card.action_type);
            formData.append('current_section', card.current_section);
            formData.append('next_section', card.next_section);
            // `await` can only be used in an async body, but showing it here for simplicity.
            var file = await this.getFileFromUrl(card.action_image, 'image.jpg');
            formData.append('action_img', file , file.name);
            this.manageattendanceService.createActionCard(formData).subscribe(res => {
              // console.log(res);
            }) 
            
          }
    this.spinner.hide();
    this.dialogRef.close(true);
  }
  ///**************** To navigate manage attendance *************///
  manageAttendance(){
    // localStorage.setItem("navigateManageaction","true");
    this.dialogRef.close();
    setTimeout(() => {
      // localStorage.setItem("atd-settings","manage-action-cards");
      this.router.navigate(["/add-action-cards"]);
    }, 500);
    
    
  }
  ///****************** URL to file function***************///
  async getFileFromUrl(url, name, defaultType = 'image/jpeg'){
    const response = await fetch(url);
    const data = await response.blob();
    return new File([data], name, {
      type: data.type || defaultType,
    });
  }

}
