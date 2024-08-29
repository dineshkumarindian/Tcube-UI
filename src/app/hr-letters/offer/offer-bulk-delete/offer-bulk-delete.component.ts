import { Component, OnInit,Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { UtilService } from '../../../services/util.service';
import { OfferLetterService } from '../../../services/offer-letter.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { Router } from '@angular/router';

@Component({
  selector: 'app-offer-bulk-delete',
  templateUrl: './offer-bulk-delete.component.html',
  styleUrls: ['./offer-bulk-delete.component.less']
})
export class OfferBulkDeleteComponent implements OnInit {

  constructor(public dialogRef:MatDialogRef<OfferBulkDeleteComponent>,
    @Inject(MAT_DIALOG_DATA) public data, private utilsService: UtilService,
    private offerLetterService: OfferLetterService, private spinner:NgxSpinnerService, private router : Router) { }

  ngOnInit() {
  }
  deleteDetails(){
    this.spinner.show();
    let listdata = {
        "deleteIds": this.data.name,
    }
    this.offerLetterService.bulkOfferLetterDelete(listdata).subscribe(data =>{
      if (data.map.statusMessage == "Success") {
        this.utilsService.openSnackBarAC("Offer Letter deleted successfully", "OK");
        this.dialogRef.close();
      }
      else {
        this.utilsService.openSnackBarMC("Failed to delete offer letter", "OK");
      }
      this.spinner.hide();
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
      this.dialogRef.close();
    })
    }
}
