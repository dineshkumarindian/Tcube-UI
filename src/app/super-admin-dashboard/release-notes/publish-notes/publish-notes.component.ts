import { Component, Inject, OnInit } from '@angular/core';
import {} from '../../../util/constants';
import {ReleaseNotesService} from '../../../services/super-admin/release-notes/release-notes.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NgxSpinnerService } from 'ngx-spinner';
import { UtilService } from 'src/app/services/util.service';
import {publishMessage,republishMessage} from 'src/app/util/constants';

@Component({
  selector: 'app-publish-notes',
  templateUrl: './publish-notes.component.html',
  styleUrls: ['./publish-notes.component.less']
})
export class PublishNotesComponent implements OnInit {
id:any;
publicRelease:boolean;
publishMsg = publishMessage;
republishMsg = republishMessage;


  constructor(
    private updateReleaseNotes:ReleaseNotesService,
    public dialogRef: MatDialogRef<any>,
     @Inject(MAT_DIALOG_DATA) public data: any,
     private spinner: NgxSpinnerService,
     private utilService:UtilService
  ) { 
    this.id = data.id;
    // console.log(data);
  }


  ngOnInit() {
    if(this.data.active == "publish"){
      this.publicRelease = false; 
    } else {
      this.publicRelease = true;
    }
  }

  updatePublishReleaseNotes(){
    this.spinner.show();
    let id1= this.id;
    this.updateReleaseNotes.updatepublishReleaseNotesDetails(id1).subscribe(data =>{
      if(data.map.statusMessage == "Success"){
        this.utilService.openSnackBarAC("Release notes published successfully", "OK");
       } else {
        this.utilService.openSnackBarMC("Failed to publish release notes","OK");
       }
      this.dialogRef.close({ data: true})
      this.spinner.hide();
    })
  }
  updateRePublishReleaseNotes(){
    this.spinner.show();
    let id1= this.id;
    this.updateReleaseNotes.updateRePublishReleaseNotesDetails(id1).subscribe(data =>{
       if(data.map.statusMessage == "Success"){
        this.utilService.openSnackBarAC("Release notes republished successfully", "OK");
       } else {
        this.utilService.openSnackBarMC("Failed to republish release notes","OK");
       }
      this.dialogRef.close({ data: true})
      this.spinner.hide();
    })
  }


}
