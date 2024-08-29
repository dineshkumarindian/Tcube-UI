import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { AttendanceServiceService } from 'src/app/services/attendance-service.service';
import { ManageattendanceService } from 'src/app/services/manageattendance.service';
import { SettingsService } from 'src/app/services/settings.service';
import { UtilService } from 'src/app/services/util.service';
import { DeleteComponent } from 'src/app/util/delete/delete.component';
import { BulkDeleteDialogComponent } from 'src/app//util/bulk-delete-dialog/bulk-delete-dialog.component';

@Component({
  selector: 'app-manage-action-cards',
  templateUrl: './manage-action-cards.component.html',
  styleUrls: ['./manage-action-cards.component.less']
})
export class ManageActionCardsComponent implements OnInit {
  incards: any[] = [];
  outcards: any[] = [];
  backcards: any[] = [];
  allactioncards: any[] = [];
  allActionCard: any = [];
  cards: any[] = [];
  constructor(public matDialog: MatDialog,
    private attendanceService: AttendanceServiceService,
    private spinner: NgxSpinnerService,
    private domSanitizer: DomSanitizer,
    private manageattendanceService: ManageattendanceService,
    private settingsService: SettingsService,
    private utilsService: UtilService,
    private router: Router,) { }
    storedAction:string;
  ngOnInit() {
    this.ActionCard();
    this.storedAction = localStorage.getItem("action-card");
    this.toggle(this.storedAction);
  }

  defaultactioncards: any[] = [
    {
      "action": "I am in from office",
      "action_type": "in",
      "action_image": "../../../assets/images/punch-cards-icon/office-white.png",
      "current_section": "in",
      "next_section": "out"
    },
    {
      "action": "I am in from home",
      "action_type": "in",
      "action_image": "../../../assets/images/punch-cards-icon/home-white.png",
      "current_section": "in",
      "next_section": "out"
    },
    // {
    //   "action": "Off today",
    //   "action_type": "out",
    //   "action_image": "../../../assets/images/punch-cards-icon/leave-white.png",
    //   "current_section": "in",
    //   "next_section": "in"
    // },
    {
      "action": "Commuting",
      "action_type": "in",
      "action_image": "../../../assets/images/punch-cards-icon/travel-white.png",
      "current_section": "in",
      "next_section": "out"
    },
    {
      "action": "Out now will connect later",
      "action_type": "out",
      "action_image": "../../../assets/images/punch-cards-icon/cf-white.png",
      "current_section": "out",
      "next_section": "back"
    },
    {
      "action": "Out for personal work",
      "action_type": "out",
      "action_image": "../../../assets/images/punch-cards-icon/pwrk-white.png",
      "current_section": "out",
      "next_section": "back"
    },
    {
      "action": "Out for official work",
      "action_type": "out",
      "action_image": "../../../assets/images/punch-cards-icon/officialwork-white.png",
      "current_section": "out",
      "next_section": "back"
    },
    {
      "action": "Feeling sick will take rest",
      "action_type": "out",
      "action_image": "../../../assets/images/punch-cards-icon/sick-white.png",
      "current_section": "out",
      "next_section": "back"
    },
    {
      "action": "I am out",
      "action_type": "out",
      "action_image": "../../../assets/images/punch-cards-icon/out-sign-white.png",
      "current_section": "out",
      "next_section": "in"
    },
    {
      "action": "Out for break",
      "action_type": "out",
      "action_image": "../../../assets/images/punch-cards-icon/out_for_break.png",
      "current_section": "out",
      "next_section": "back"
    },
    {
      "action": "Out for Lunch",
      "action_type": "out",
      "action_image": "../../../assets/images/punch-cards-icon/out_for_lunch.png",
      "current_section": "out",
      "next_section": "back"
    },
    {
      "action": "Back to work",
      "action_type": "in",
      "action_image": "../../../assets/images/punch-cards-icon/back-work-white.png",
      "current_section": "back",
      "next_section": "out"
    }
  ];

  //get all action cards by org id
  ActionCard() {
    this.spinner.show();
    this.incards = [];
    this.backcards = [];
    this.outcards = [];
    this.allactioncards = [];
    this.allActionCard = [];
    this.manageattendanceService.getAllActionCardByOrgId(localStorage.getItem("OrgId")).subscribe(async data => {

      if (data.map.statusMessage == "Success") {
        // this.allactioncards = JSON.parse(data.map.data);
        // let response: any[] = JSON.parse(data.map.data);
        this.allactioncards = data.map.data.myArrayList;
        let response: any[] = data.map.data.myArrayList;
        
        for (var i = 0; i < response.length; i++) {
          this.allActionCard.push(response[i].map.action.toLowerCase());
          // console.log(this.allActionCard);
          let stringArray = new Uint8Array(response[i].map.action_image.myArrayList);
          const STRING_CHAR = stringArray.reduce((data, byte) => {
            return data + String.fromCharCode(byte);
          }, '');
          let base64String = btoa(STRING_CHAR);
          response[i].map.action_image = this.domSanitizer.bypassSecurityTrustUrl("data:image/jpeg;base64," + base64String);
          if (response[i].map.current_section == "in") {
            this.incards.push(response[i].map);
          }
          if (response[i].map.current_section == "back") {
            this.backcards.push(response[i].map);
          }
          if (response[i].map.current_section == "out") {
            this.outcards.push(response[i].map);
          }
        }
        this.spinner.hide();
      }
      else {
        this.spinner.hide();
      }
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
    })
  }


  // delete action cards
  deleteaction(id: number, section: string) {

    const dialogRef = this.matDialog.open(DeleteComponent, {
      width: '30%',
      panelClass: 'custom-viewdialogstyle', 
      data: {key: "attendance-delete", showComment : false },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result != undefined && result != "") {
        if (result.data == true) {
          this.deleteactionafterconfoirm(id, section);
        }
      }

    });

  }
  deleteactionafterconfoirm(id: number, section: string) {
    this.spinner.show();
    this.manageattendanceService.deleteActionCard(id).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        this.utilsService.openSnackBarAC("Action card deleted successfully", "OK");
        this.incards = [];
        this.backcards = [];
        this.outcards = [];
        this.ActionCard();
        this.toggle(section);
        this.spinner.hide();
      }
      else {
        this.utilsService.openSnackBarAC("Action card failed to delete", "OK");
        this.spinner.hide();
      }

    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
    })
  }

  action_data: any;
  cardheader: any;
  reset_toggle: boolean = true;
  actionmultipleselect: boolean = false;
  actionCardsIds = [];
  actionmultipledelete: boolean = false;
  showallcards: boolean = false;
  isIncardActive:boolean = false;
  isOutcardActive:boolean = false;
  isBackcardActive:boolean = false;

  toggle(data) {
    this.reset_toggle = true;
    this.actionmultipleselect = false;
    this.actionCardsIds = [];
    this.actionmultipledelete = false;
    if (data == "in") {
      this.cardheader = "In Actions";
      localStorage.setItem("action-card","in");
      this.isOutcardActive = false;
      this.isBackcardActive = false;
      this.cards = this.incards;
      if (this.action_data === data) {
        this.showallcards = !this.showallcards;
        this.action_data = data;
        this.isIncardActive = this.showallcards;
      }
      else {
        this.isIncardActive = true;
        this.showallcards = true;
        this.action_data = data;
      }

    }
    if (data == "out") {
      this.cardheader = "Out Actions";
      localStorage.setItem("action-card","out");
      this.isIncardActive = false;
      this.isBackcardActive = false;
      this.cards = this.outcards;
      if (this.action_data === data) {
        this.showallcards = !this.showallcards;
        this.action_data = data;
        this.isOutcardActive = this.showallcards;
      }
      else {
        this.showallcards = true;
        this.isOutcardActive = true;
        this.action_data = data;
      }
    }
    if (data == "back") {
      this.cardheader = "Back Actions";
      localStorage.setItem("action-card","back");
      this.isIncardActive = false;
      this.isOutcardActive = false;
      this.cards = this.backcards;
      if (this.action_data === data) {
        this.showallcards = !this.showallcards;
        this.action_data = data;
        this.isBackcardActive = this.showallcards ;
      }
      else {
        this.isBackcardActive = true;
        this.showallcards = true;
        this.action_data = data;
      }
    }
  }
  dataRefresh(data) {
    this.reset_toggle = true;
    this.actionCardsIds = [];
    if (data == "in") {
      this.cardheader = "In Actions";
      localStorage.setItem("action-card","in");
      this.isOutcardActive = false;
      this.isBackcardActive = false;
      this.cards = this.incards;
      if (this.action_data === data) {
        this.action_data = data;
        this.isIncardActive = this.showallcards;
      }
      else {
        this.isIncardActive = true;
        this.action_data = data;
      }

    }
    if (data == "out") {
      this.cardheader = "Out Actions";
      localStorage.setItem("action-card","out");
      this.isIncardActive = false;
      this.isBackcardActive = false;
      this.isOutcardActive = true;
      this.cards = this.outcards;
      if (this.action_data === data) {
        this.action_data = data;
      }
      else {
        this.isOutcardActive = true;
        this.action_data = data;
      }
    }
    if (data == "back") {
      this.cardheader = "Back Actions";
      localStorage.setItem("action-card","back");
      this.isIncardActive = false;
      this.isOutcardActive = false;
      this.cards = this.backcards;
      if (this.action_data === data) {
        this.action_data = data;
      }
      else {
        this.isBackcardActive = true;
        this.action_data = data;
      }
    }
  }
  resetToggle() {
    this.reset_toggle = !this.reset_toggle;
  }
  async resetSection(cardheader: string) {
    this.spinner.show();
    let section;
    if (cardheader == "In Actions") {
      section = "in";
    }
    if (cardheader == "Out Actions") {
      section = "out";
    }
    if (cardheader == "Back Actions") {
      section = "back";
    }
    if (this.cards.length != 0) {
      await this.deleteactionsection();
      for await (let i of this.defaultactioncards) {
        if (i.current_section == section) {
          var formData = new FormData();
          formData.append('org_id', localStorage.getItem("OrgId"));
          formData.append('action', i.action);
          formData.append('action_type', i.action_type);
          formData.append('current_section', i.current_section);
          formData.append('next_section', i.next_section);
          // `await` can only be used in an async body, but showing it here for simplicity.
          var file = await this.getFileFromUrl(i.action_image, 'image.jpg');
          formData.append('action_img', file, file.name);
          this.manageattendanceService.createActionCard(formData).subscribe(res => {
            // console.log(res);
          })
        }
      }
    }
    else {
      for await (let i of this.defaultactioncards) {
        if (i.current_section == section) {
          var formData = new FormData();
          formData.append('org_id', localStorage.getItem("OrgId"));
          formData.append('action', i.action);
          formData.append('action_type', i.action_type);
          formData.append('current_section', i.current_section);
          formData.append('next_section', i.next_section);
          // `await` can only be used in an async body, but showing it here for simplicity.
          var file = await this.getFileFromUrl(i.action_image, 'image.jpg');
          formData.append('action_img', file, file.name);
          this.manageattendanceService.createActionCard(formData).subscribe(res => {
            // console.log(res);
          })
        }
      }

    }

    setTimeout(() => {
      this.incards = [];
      this.backcards = [];
      this.outcards = [];
      this.ActionCard();
      this.dataRefresh(section);
      // this.toggle(section)
      this.spinner.hide();

    }, 5000);

  }

  async deleteactionsection() {
    for await (const bk of this.cards) {
      this.manageattendanceService.deleteActionCard(bk.id).subscribe(data => {
        if (data.map.statusMessage != "Success") {
          this.utilsService.openSnackBarAC("Action card failed to delete", "OK");
          this.incards = [];
          this.backcards = [];
          this.outcards = [];
          this.ActionCard();
        }
      }, (error) => {
        this.router.navigate(["/404"]);
        this.spinner.hide();
      });
    }

  }
  actionmultiselect() {
    this.actionmultipleselect = !this.actionmultipleselect;
    this.actionmultipledelete = false;
    this.actionCardsIds = [];
  }
  multiDeleteActionToggle() {
    this.actionmultipledelete = !this.actionmultipledelete;
  }
  actioncardselect(id) {
    var index = this.actionCardsIds.indexOf(id);
    if (index === -1) {
      // id not found, pushing onto array
      this.actionCardsIds.push(id);
    } else {
      // id is found, removing from array
      this.actionCardsIds.splice(index, 1);
    }
  }
   // delete action cards
   bulkdeleteaction() {

    const dialogRef = this.matDialog.open(BulkDeleteDialogComponent, {
      width: '30%',
      panelClass: 'custom-viewdialogstyle', 
      data: {key: "attendance-bulk-delete", showComment : false },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result != undefined && result != "") {
        if (result.data == true) {
          this.multiDeleteAction();
        }
      }
    });

  }
  async multiDeleteAction() {
    this.spinner.show();
    for await (const id of this.actionCardsIds) {
      this.manageattendanceService.deleteActionCard(id).subscribe(data => {
        if (data.map.statusMessage == "Success") {
          this.utilsService.openSnackBarAC("Action cards deleted successfully", "OK");
          this.incards = [];
          this.backcards = [];
          this.outcards = [];
          this.ActionCard();
        }
        else {
          this.utilsService.openSnackBarMC("Action cards failed to delete", "OK");
          this.incards = [];
          this.backcards = [];
          this.outcards = [];
          this.ActionCard();
        }
      }, (error) => {
        this.router.navigate(["/404"]);
        this.spinner.hide();
      });
    }
    setTimeout(() => {
      this.incards = [];
      this.backcards = [];
      this.outcards = [];
      this.ActionCard();
      this.showallcards = false;
      this.spinner.hide();

    }, 2000);
  }

  
    ///****************** URL to file function***************///
    attachmentName: any;
    async getFileFromUrl(url, name, defaultType = 'image/jpeg') {
      const response = await fetch(url);
      const data = await response.blob();
      this.attachmentName = name;
      return new File([data], name, {
        type: data.type || defaultType,
      });
    }

    //add action cards redirect
    addactioncard(){
      localStorage.setItem("atd-form", "any");
      this.router.navigate(["/add-action-cards"]);
    }

    addcardsection(data){
      localStorage.setItem("atd-form", data);
      this.router.navigate(["/add-action-cards"]);
    }

    //edit method to redirect form page with the action card id
    editactioncard(id){
      this.router.navigate(["edit-action-cards/"+id]);
    }

}
