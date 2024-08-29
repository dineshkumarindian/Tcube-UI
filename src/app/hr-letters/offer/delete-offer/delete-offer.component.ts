import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
// import {InternshipLetterService} from '../../../services/internship-letter.service';
import { UtilService } from '../../../services/util.service';
import { OfferLetterService } from '../../../services/offer-letter.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { Router } from '@angular/router';
export interface DialogData {
  id: number
}
@Component({
  selector: 'app-delete-offer',
  templateUrl: './delete-offer.component.html',
  styleUrls: ['./delete-offer.component.less']
})
export class DeleteOfferComponent implements OnInit {

  constructor(private offerLetterService: OfferLetterService,
    public dialogRef: MatDialogRef<DeleteOfferComponent>,
    private utilsService: UtilService, @Inject(MAT_DIALOG_DATA) public data: DialogData, private spinner: NgxSpinnerService, private router : Router) { }

  ngOnInit() {
  }

  deleteUserDetails(id: any) {
    this.spinner.show();
    this.offerLetterService.deleteOfferLetterByIdDetails(id).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        this.utilsService.openSnackBarAC("Offer letter deleted successfully", "OK");
        this.spinner.hide();
        this.dialogRef.close();
      }
      else {
        this.utilsService.openSnackBarMC("Failed to delete offer letter details", "OK");
        this.spinner.hide();
      }
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
      this.dialogRef.close();
    })
  }

}