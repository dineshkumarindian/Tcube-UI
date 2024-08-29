import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { UtilService } from 'src/app/services/util.service';
import { noCommentMessage } from 'src/app/util/constants';

@Component({
  selector: 'app-view-comments',
  templateUrl: './view-comments.component.html',
  styleUrls: ['./view-comments.component.less']
})
export class ViewCommentsComponent implements OnInit {
  header: string;
  commentDetails: any = [];
  commentDetails1: any = [];
  splitteddetails: any = [];
  noCommentMessage = noCommentMessage;

  constructor(private router: Router,
    private utilsService: UtilService,
    private spinner: NgxSpinnerService,
    public matDialog: MatDialog,
    public dialogRef: MatDialogRef<ViewCommentsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,) { }

  ngOnInit(): void {
    this.header = this.data.title;
    this.splitteddetails = [];
    for (let i = 0; i < this.data.details.length; i++) {
      if (this.data.details[i] != '-') {
        if (this.splitteddetails.includes(this.data.details[i])) {
          this.commentDetails.push(this.data.details[i]);
        } 
        else {
          this.splitteddetails.push(this.data.details[i]);
        }
      }
      else {
        if (this.splitteddetails.includes(this.data.details[i])) {
          this.commentDetails.push(this.data.details[i]);
        } 
        else {
          this.splitteddetails.push(this.data.details[i]);
        }
      }
    }
  }
}
