
// <!----- delete business_letter ------->

import { Component, OnInit ,Inject} from '@angular/core';
import {MatDialogRef,MAT_DIALOG_DATA} from '@angular/material/dialog';
import {InternshipletterService} from '../../../services/businessletter.service';
import {UtilService} from 'src/app/services/util.service';
import {NgxSpinnerService} from 'ngx-spinner';
import { Router } from '@angular/router';

export interface DialogData{
  id:number
}

@Component({
  selector: 'app-delete-internship',
  templateUrl: './delete-internship.component.html',
  styleUrls: ['./delete-internship.component.less']
})
export class DeleteInternshipComponent implements OnInit {

  constructor(private internService:InternshipletterService, 
    public dialogRef: MatDialogRef<DeleteInternshipComponent>,
    private utilsService:UtilService,
    @Inject(MAT_DIALOG_DATA)public data:DialogData,
    private spinner: NgxSpinnerService,
    private router : Router,) {

     }

  ngOnInit() {
  }

  //delete the business letter
deleteUserDetail(id:any){
    this.spinner.show();
    this.internService.deleteByIdBusinessDetails(id).subscribe(data => {
      //  console.log(data);
        if (data.map.statusMessage == "Success") {
          this.utilsService.openSnackBarAC("Letter deleted successfully", "OK");
          this.spinner.hide();
          this.dialogRef.close();
        }
        else {
          this.utilsService.openSnackBarMC("Failed to delete letter details", "OK");
          this.spinner.hide();
        }
      }, (error) => {
        this.router.navigate(["/404"]);
        this.spinner.hide();
        this.dialogRef.close();
      })
  }

}
