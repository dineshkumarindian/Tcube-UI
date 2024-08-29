
//  <!------ bulk delete business_letter ----->

import { Component, OnInit, Inject} from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { UtilService } from 'src/app/services/util.service';
import {InternshipletterService} from 'src/app/services/businessletter.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { Router } from '@angular/router';

@Component({
  selector: 'app-internship-bulk-delete',
  templateUrl: './internship-bulk-delete.component.html',
  styleUrls: ['./internship-bulk-delete.component.less']
})
export class InternshipBulkDeleteComponent implements OnInit {

  description:any;
  constructor(public dialogRef:MatDialogRef<InternshipBulkDeleteComponent>,
    @Inject(MAT_DIALOG_DATA) public data, 
    private utilsService: UtilService,
    private internservice:InternshipletterService,
    private spinner:NgxSpinnerService,
    private router : Router,) {
   }

  ngOnInit() {
  
  }
  
//bulk-delete business letter
deleteDetails(){
    this.spinner.show();
    let listdata = {
        "deleteIds": this.data.name,
    }
    this.internservice.bulkDeleteBusinessDetails(listdata).subscribe(data =>{
      if (data.map.statusMessage == "Success") {
        this.utilsService.openSnackBarAC("Letter details deleted successfully", "OK");
        this.dialogRef.close();
      }
      else {
        this.utilsService.openSnackBarMC("Faild to delete letter details", "OK");
      }
      this.spinner.hide();
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
      this.dialogRef.close();
    })
    }
}
