import { Component, OnInit, ElementRef, ViewChild, Inject, AfterViewInit } from '@angular/core';
import { UtilService } from 'src/app/services/util.service';
import { ActivatedRoute, Router } from '@angular/router';
import { OfferLetterService } from 'src/app/services/offer-letter.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DatePipe } from '@angular/common';
import { UntypedFormBuilder, FormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import { PDFDocument } from 'pdf-lib';
pdfMake.vfs = pdfFonts.pdfMake.vfs;

export interface DialogData {
  signFileName: string;
  logoFileName: string;
  id: any;
  activateId: any;
  name: string;
  dob: string;
  doj: string;
  designation: string;
  location: string;
  salary: string;
  companyName: string;
  companyAddress: string;
  companyLink: string;
  currentDate: string;
  signatureName: string;
  signatureRole: string;
  companyLogo: string;
  signature: string;
  description: string;
  letterTitle: string;
  annexure_details: any;
}
@Component({
  selector: 'app-view-offer',
  templateUrl: './view-offer.component.html',
  styleUrls: ['./view-offer.component.less'],
  providers: [DatePipe]
})
export class ViewOfferComponent implements AfterViewInit {

  isOfferLetterActiveId: boolean = false;
  currentDate = new Date();
  offerForm: UntypedFormGroup;
  offerId: any;
  description: string;
  description1: string;
  annexure_details: any;
  pdfencodeString: any;
  pdfDocument:any;
  isInternActiveId:any;
  // annexure_details: Array<any> = [
  //   {
  //     'letterTitle1': '',
  //     'description1': ''
  //   }
  // ];
  // description1: string;

  constructor(private offerService: OfferLetterService,
    public utilService: UtilService,
    private spinner: NgxSpinnerService,
    private datePipe: DatePipe,
    public router: Router,
    public activeRoute: ActivatedRoute,
    private formBuilder: UntypedFormBuilder,
    public dialogRef: MatDialogRef<ViewOfferComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.description = this.data.description;
    this.offerId = this.data.activateId;
    if (this.offerId) {
      this.isOfferLetterActiveId = true;
    } else {
      this.isOfferLetterActiveId = false;
    }

  }

  onNoClick(): void {
    this.dialogRef.close();
  }
  date: any;
  heading: any;
  name: any;
  public fileEncode: any = {};
  fileString: string = "";
  descriptionData: string;
  terms_conditionsData: string;
  ngAfterViewInit() {
    this.pdfGenerationFormat();
  }
  async pdfGenerationFormat() {
    this.spinner.show();
    // let jsPDF;
    // let orgId = localStorage.getItem("OrgId");
    let logoElement = this.data.companyLogo;
    let footer1 = this.data.companyAddress;
    let footer2 = this.data.companyName;
    let footer3 = this.data.companyLink;
    let signature_content = " Signature : _________________ \n \n Name      : __________________\n \n Date        : __________________";

    let element = document.getElementById("contentToConvert");
    var encodeString: string;
    let pdfarraybufferlist: any[] = [];
    await html2canvas(element, { scale: 5, logging: true }).then(async function (canvas) {
      // const imgData = canvas.toDataURL('image/jpeg');
      var pdf = new jsPDF('p', 'mm', 'a4', true);
      var ctx = canvas.getContext('2d');
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      let a4w = 190, a4h = 237;
      let imgHeight = Math.floor(a4h * canvas.width / a4w);
      let renderedHeight = 0;
      let logo = logoElement;
      let footer_address = footer1;
      let footer_name = footer2;
      let footer_website = footer3;
      let default_signature = signature_content;
      while (renderedHeight < canvas.height) {
        var page = document.createElement("canvas");
        page.width = canvas.width;
        page.height = Math.min(imgHeight, canvas.height - renderedHeight);
        let y = 10000;
        //Trim the specified area with getImageData and draw it into the canvas object created earlier
        page.getContext('2d').putImageData(ctx.getImageData(0, renderedHeight, canvas.width, Math.min(imgHeight, canvas.height - renderedHeight)), 0, 0);
        //Add an image to the page with a 10 mm / 20 mm margin
        if (renderedHeight == 0) {
          pdf.addImage(page.toDataURL('image/jpeg', 0.3), 'JPEG', 10, 30, a4w, Math.min(a4h, a4w * page.height / page.width), undefined, 'FAST');
          //Add header logo
          pdf.addImage(logo, 'PNG', 18, 8, 20, 20, undefined, 'FAST');
        } else {
          pdf.addImage(page.toDataURL('image/jpeg', 0.3), 'JPEG', 10, 40, a4w, Math.min(a4h, a4w * page.height / page.width), undefined, 'FAST');
          //Add header logo
          pdf.addImage(logo, 'PNG', 18, 8, 20, 20, undefined, 'FAST');
        }
        //Footer
        var str1 = footer_name;
        var str2 = footer_address;
        var str3 = footer_website;
        let candidate_signature = default_signature;
        pdf.setFontSize(10);
        pdf.setLineCap(1);
        pdf.setFontSize(8);
        pdf.text(str1, 93, pdf.internal.pageSize.height - 12, { align: 'center' });
        pdf.line(5, pdf.internal.pageSize.getHeight() - 11, pdf.internal.pageSize.getWidth() - 11, pdf.internal.pageSize.getHeight() - 11);
        pdf.text(str2, 93, pdf.internal.pageSize.height - 7, { align: 'center' });
        pdf.text(str3, 93, pdf.internal.pageSize.height - 3, { align: 'center' });
        renderedHeight += imgHeight;
        if (renderedHeight < canvas.height && renderedHeight >= 5000) {
          pdf.addPage();
        }
      }
      let arrayBuffer = pdf.output('arraybuffer');
      await pdfarraybufferlist.push(arrayBuffer);
      // pdf.save('offerletter.pdf');
      // encodeString = btoa(pdf.output());
    })
    let k = 0;
    for await (let l of this.data.annexure_details) {
      let elementannexure = document.getElementById("annexureId" + k);
      k += 1;
      await html2canvas(elementannexure, { scale: 5, logging: true }).then(async function (canvas) {
        // const imgData = canvas.toDataURL('image/jpeg');
        var pdf = new jsPDF('p', 'mm', 'a4');
        var ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        let a4w = 190, a4h = 237;
        let imgHeight = Math.floor(a4h * canvas.width / a4w);
        let renderedHeight = 0;
        let logo = logoElement;
        let footer_address = footer1;
        let footer_name = footer2;
        let footer_website = footer3;
        let default_signature = signature_content;
        while (renderedHeight < canvas.height) {
          var page = document.createElement("canvas");
          page.width = canvas.width;
          page.height = Math.min(imgHeight, canvas.height - renderedHeight);
          let y = 10000;
          //Trim the specified area with getImageData and draw it into the canvas object created earlier
          page.getContext('2d').putImageData(ctx.getImageData(0, renderedHeight, canvas.width, Math.min(imgHeight, canvas.height - renderedHeight)), 0, 0);
          //Add an image to the page with a 10 mm / 20 mm margin
          if (renderedHeight == 0) {
            pdf.addImage(page.toDataURL('image/jpeg', 0.3), 'JPEG', 10, 30, a4w, Math.min(a4h, a4w * page.height / page.width), undefined, 'FAST');
            //Add header logo
            pdf.addImage(logo, 'PNG', 18, 8, 20, 20, undefined, 'FAST');
          } else {
            pdf.addImage(page.toDataURL('image/jpeg', 0.3), 'JPEG', 10, 40, a4w, Math.min(a4h, a4w * page.height / page.width), undefined, 'FAST');
            //Add header logo
            pdf.addImage(logo, 'PNG', 18, 8, 20, 20, undefined, 'FAST');
          }
          //Footer
          var str1 = footer_name;
          var str2 = footer_address;
          var str3 = footer_website;
          let candidate_signature = default_signature;
          pdf.setFontSize(10);
          pdf.setLineCap(2);
          pdf.setFontSize(8);
          pdf.text(str1, 93, pdf.internal.pageSize.height - 12, { align: 'center' });
          pdf.line(5, pdf.internal.pageSize.getHeight() - 11, pdf.internal.pageSize.getWidth() - 11, pdf.internal.pageSize.getHeight() - 11);
          pdf.text(str2, 93, pdf.internal.pageSize.height - 7, { align: 'center' });
          pdf.text(str3, 93, pdf.internal.pageSize.height - 3, { align: 'center' });
          renderedHeight += imgHeight;
          if (renderedHeight < canvas.height && renderedHeight >= 3000) {
            pdf.addPage();
          }
        }
        let arrayBuffer = pdf.output('arraybuffer');
        await pdfarraybufferlist.push(arrayBuffer);
        // pdf.save('offerletter.pdf');
        // encodeString = btoa(pdf.output());
      })


    }
    const mergedPdf = await this.mergePdfs(pdfarraybufferlist);
    // this.pdfencodeString = mergedPdf.buffer;
    var blob = new Blob([mergedPdf.buffer], { type: 'application/pdf' });
    var reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onloadend = () => {
      // encodeString = (<string>reader.result).split(',')[1];
      this.pdfDocument = (<string>reader.result).split(',')[1];``
    }
    const pdfUrl = URL.createObjectURL(
      new Blob([mergedPdf], { type: 'application/pdf' }),
    );
         // this.downloadFile(blob);
    // setTimeout(() => {
      this.pdfencodeString = mergedPdf.buffer;

  }
  downloadFile(blob): void {
    // const blob: Blob = new Blob([data], {type: 'text/csv'});
    const fileName: string = 'Offer_Letter.pdf';
    const objectUrl: string = URL.createObjectURL(blob);
    const a: HTMLAnchorElement = document.createElement('a') as HTMLAnchorElement;

    a.href = objectUrl;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();

    document.body.removeChild(a);
    URL.revokeObjectURL(objectUrl);
  }
  async mergePdfs(pdfsToMerges: ArrayBuffer[]) {
    const mergedPdf = await PDFDocument.create();
    for await (let bk of pdfsToMerges) {
      const pdf = await PDFDocument.load(bk);
      const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
      copiedPages.forEach((page) => {
        // page.setWidth(210);
        mergedPdf.addPage(page);
      });

    }
    // await Promise.all(actions);
    const mergedPdfFile = await mergedPdf.save();
    return mergedPdfFile;
  }
  public saveDetails() {
    let orgId = localStorage.getItem("OrgId");
    this.fileEncode = {
      "org_id": orgId,
      "name": this.data.name,
      "dob": this.data.dob,
      // "doj"                   : this.data.doj,
      // "designation"           : this.data.designation,
      // "location"              : this.data.location,
      "companyName": this.data.companyName,
      "companyAddress": this.data.companyAddress,
      "companyLink": this.data.companyLink,
      "companyLogo": this.data.companyLogo,
      "signature": this.data.signature,
      "signatureName": this.data.signatureName,
      "signatureRole": this.data.signatureRole,
      "logoFileName": this.data.logoFileName,
      "signFileName": this.data.signFileName,
      "offerLetterPdfFormat": this.pdfDocument,
      "description": this.data.description,
      "letterTitle": this.data.letterTitle,
      "annexure_details": JSON.stringify(this.data.annexure_details),
    };
    const offerFormdata = JSON.stringify(this.fileEncode);
    this.spinner.show();
    this.offerService.createDetails(offerFormdata).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        this.utilService.openSnackBarAC("Offer letter added successfully", "OK");
        this.spinner.hide();
        setTimeout(() => {
          this.router.navigate(["/offer"]);
          this.dialogRef.close();
          /** spinner ends after 1 second */
        }, 500);
        // this.createPdf(data.map.data.id);
      } else {
        this.utilService.openSnackBarMC("Failed to add offer letter", "OK");
        this.spinner.hide();
      }
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
      this.dialogRef.close();
    });
  }

  public updateList() {
    this.spinner.show();
    let orgId = localStorage.getItem("OrgId");
    this.fileEncode = {
      "org_id": orgId,
      "name": this.data.name,
      "dob": this.data.dob,
      // "doj"                   : this.data.doj,
      // "designation"           : this.data.designation,
      // "location"              : this.data.location,
      "companyName": this.data.companyName,
      "companyAddress": this.data.companyAddress,
      "companyLink": this.data.companyLink,
      "companyLogo": this.data.companyLogo,
      "signature": this.data.signature,
      "signatureName": this.data.signatureName,
      "signatureRole": this.data.signatureRole,
      "logoFileName": this.data.logoFileName,
      "signFileName": this.data.signFileName,
      "offerLetterPdfFormat": this.pdfDocument,
      "description": this.data.description,
      "letterTitle": this.data.letterTitle,
      "annexure_details": JSON.stringify(this.data.annexure_details),
    };

    this.offerService.updateOfferLetterDetails(this.data.id, this.fileEncode).subscribe(result => {
      if (result.map.statusMessage == "Success") {
        this.utilService.openSnackBarAC("Offer letter updated successfully", "OK");
        this.spinner.hide();
        setTimeout(() => {
          this.router.navigate(["/offer"]);
          this.dialogRef.close();
        }, 2000);
        // this.updatePdf(result.map.data.id);
      } else {
        this.utilService.openSnackBarMC("Failed to update offer letter", "OK");
        this.spinner.hide();
      }
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
      this.dialogRef.close();
    })
  }

  // public updatePdf(id) {
  //   // let formdata: any;
  //   // formdata = {
  //   //   "offerLetterPdfFormat": this.pdfencodeString
  //   // }
  //   // let formdata = new FormData();
  //   // formdata.append("offerLetterPdfFormat", this.pdfencodeString)
  //   console.log(this.pdfencodeString);
  //   this.spinner.show();
  //   this.offerService.updateOfferLetterPdf(id, this.pdfencodeString).subscribe(result => {
  //     if (result.map.statusMessage == "Success") {
  //       this.utilService.openSnackBarAC("Offer letter updated successfully", "OK");
  //       this.spinner.hide();
  //       setTimeout(() => {
  //         this.router.navigate(["/offer"]);
  //         this.dialogRef.close();
  //       }, 2000);
  //     } else {
  //       this.utilService.openSnackBarMC("Failed to update offer letter", "OK");
  //       this.spinner.hide();
  //     }
  //   })
  // }
  // public createPdf(id) {
  //   // let formdata: any;
  //   // formdata = {
  //   //   "offerLetterPdfFormat": this.pdfencodeString
  //   // }
  //   // let formdata = new FormData();
  //   // formdata.append("offerLetterPdfFormat", this.pdfencodeString)
  //   console.log(this.pdfencodeString);
  //   this.spinner.show();
  //   this.offerService.updateOfferLetterPdf(id, this.pdfencodeString).subscribe(result => {
  //     if (result.map.statusMessage == "Success") {
  //       this.utilService.openSnackBarAC("Offer letter added successfully", "OK");
  //       this.spinner.hide();
  //       setTimeout(() => {
  //         this.router.navigate(["/offer"]);
  //         this.dialogRef.close();
  //       }, 2000);
  //     } else {
  //       this.utilService.openSnackBarMC("Failed to add offer letter", "OK");
  //       this.spinner.hide();
  //     }
  //   })
  // }


}
