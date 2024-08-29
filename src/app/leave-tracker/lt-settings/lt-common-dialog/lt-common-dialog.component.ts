import { Component, OnInit , Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { NgxSpinnerService } from "ngx-spinner";
import * as $  from 'jquery'


@Component({
  selector: 'app-lt-common-dialog',
  templateUrl: './lt-common-dialog.component.html',
  styleUrls: ['./lt-common-dialog.component.less']
})
export class LtCommonDialogComponent implements OnInit {
  todayLeavesData:any = [];
  todayLeaveDataLength:number;
  isImageData:boolean = false;
  
  constructor(public dialogRef: MatDialogRef<LtCommonDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data) {
     }

  ngOnInit() {
    
  setTimeout(()=>{ 
    // console.log(this.data);
    this.isImageData = true;
    this.todayLeavesData = this.data.todayleaves;
    this.todayLeaveDataLength = this.todayLeavesData.length;
    
  },);
   
    this.clickFunction('seven');
   
  }

  clickFunction(id) {
    $('#modal-container').removeAttr('class').addClass(id);
  $('#modal-container').click(function(){
    $(this).addClass('out');
  });
 }
 removeThis(id:any) {
  this.todayLeavesData = this.todayLeavesData.filter(item => item.id != id);
  if(this.todayLeavesData.length == 0){
    this.dialogRef.close();
  }

 }


}
