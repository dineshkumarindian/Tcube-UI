import { Component, OnInit,Inject } from '@angular/core';
import { UntypedFormGroup ,UntypedFormBuilder,Validators} from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NgxSpinnerService } from 'ngx-spinner';
import { SettingsService } from 'src/app/services/settings.service';
import { UtilService } from 'src/app/services/util.service';

@Component({
  selector: 'app-users-component',
  templateUrl: './users-component.component.html',
  styleUrls: ['./users-component.component.less']
})
export class UsersComponentComponent implements OnInit {
  UserList:any [];
  constructor(public dialogRef: MatDialogRef<any>,
    @Inject(MAT_DIALOG_DATA) public data: any) { 
      this.UserList = data.users; 
      console.log( this.UserList);
    }

  ngOnInit(): void {
  }

}
