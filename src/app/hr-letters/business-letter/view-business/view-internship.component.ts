
// <!----- view business letter ------->

import {
  Component,
  OnInit,
  ElementRef,
  ViewChild,
  Inject,
  AfterViewInit,
  ViewEncapsulation,
} from "@angular/core";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { InternshipletterService } from "src/app/services/businessletter.service";
import { UtilService } from "src/app/services/util.service";
import { ActivatedRoute, Router } from "@angular/router";
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
pdfMake.vfs = pdfFonts.pdfMake.vfs;
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { NgxSpinnerService } from "ngx-spinner";



export interface DialogData {
  companyLogo: any;
  activateId: any;
  id: any;
  name: string;
  date: string;
  address: string;
  programtitle: string;
  description: string;
  directorName: string;
  directorSign: string;
  companyName: string;
  companyAddress: string;
  companyLink: string;
  signatureRole: string;
  logoFileName: string;
  signFileName: string;
}

@Component({
  selector: "app-view-internship",
  templateUrl: "./view-internship.component.html",
  styleUrls: ["./view-internship.component.less"],
  encapsulation: ViewEncapsulation.None,
})
export class ViewInternshipComponent implements AfterViewInit {

  isInternActiveId: boolean = false;
  internId: any;
  description: string;
  company_logo: any;
  date: any;
  address: any;
  heading: any;
  name: any;
  public fileEncode: any = {};
  fileString: any;
  descriptionData: string;
  logoImage: any;
  constructor(
    public internService: InternshipletterService,
    public utilService: UtilService,
    public router: Router,
    private utilsService: UtilService,
    public activeRoute: ActivatedRoute,
    public dialogRef: MatDialogRef<ViewInternshipComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private spinner: NgxSpinnerService
  ) {
    this.logoImage = this.data.companyLogo;
    this.getViewData();

  }
  companyLogo: any;
  activateId: any;
  id: any;
  programtitle: string;
  directorName: string;
  directorSign: string;
  companyName: string;
  companyAddress: string;
  companyLink: string;
  signatureRole: string;
  logoFileName: string;
  signFileName: string;
  todayDate: string;
  getViewData() {
    // this.spinner.show();
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = today.getFullYear();
    this.todayDate = dd + '/' + mm + '/' + yyyy;
    this.name = this.data.name;
    this.address = this.data.address;
    this.programtitle = this.data.programtitle;
    this.directorName = this.data.directorName;
    this.directorSign = this.data.directorSign;
    this.companyName = this.data.companyName;
    this.companyAddress = this.data.companyAddress;
    this.companyLink = this.data.companyLink;
    this.signatureRole = this.data.signatureRole;
    this.logoFileName = this.data.logoFileName;
    this.signFileName = this.data.signFileName;
    this.description = this.data.description;
    this.company_logo = this.data.companyLogo;

    this.internId = this.data.activateId;
    if (this.internId) {
      this.isInternActiveId = true;
    } else {
      this.isInternActiveId = false;
    }

  }
  onNoClick(): void {
    this.dialogRef.close();
  }


  ngAfterViewInit() {
    this.htmlTopdfConvert();

  }

  async htmlTopdfConvert() {
    let logoElement = this.logoImage;
    let element = document.getElementById("contentToConvert");
    var encodeString: string;
    var pdf = new jsPDF("p", "mm", "a4", true);
    // let internData:Boolean = true;
    // let internSubData:Boolean = true;{ scale: 5, logging: true }
    let resp = await html2canvas(element, { scale: 5, logging: true }).then(function (canvas) {

      // console.log("canvas",canvas.width,canvas.height);
      var ctx = canvas.getContext("2d");

      //set the image quality
      // ctx['webkitImageSmoothingEnabled'] = true;
      // ctx['mozImageSmoothingEnabled'] = true;
      // ctx['imageSmoothingEnabled'] = true
      // ctx['imageSmoothingQuality'] = "high";
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      // let a4w = 190,
      //   a4h = 256.8;
      let a4w = 190;
      let a4h = 290;
      let imgHeight = Math.floor(a4h * canvas.width) / a4w;
      let renderedHeight = 0;

      // var logo = document.getElementById("logo-img") as HTMLCanvasElement;
      let logo = logoElement;
      while (renderedHeight < canvas.height) {
        var page = document.createElement("canvas");
        page.width = canvas.width;
        page.height = Math.min(imgHeight, canvas.height - renderedHeight);

        //Trim the specified area with getImageData and draw it into the canvas object created earlier
        page
          .getContext("2d")
          .putImageData(
            ctx.getImageData(
              0,
              renderedHeight,
              canvas.width,
              Math.min(imgHeight, canvas.height - renderedHeight)
            ),
            0,
            0
          );
        //Add an image to the page with a 10 mm / 20 mm margin
        if (renderedHeight == 0) {
          pdf.addImage(
            page.toDataURL("image/jpeg", 1.0),
            "JPEG",
            10,
            5,
            a4w,
            Math.min(a4h, (a4w * page.height) / page.width), undefined, 'FAST');
          //Add header logo Math.min(a4h, (a4w * page.height) / page.width),Math.min(a4h, (a4w * page.height) / page.width)
          // pdf.addImage(logo, "PNG", 15,5, 20, 20,undefined,'FAST');
        } else {
          pdf.addImage(
            page.toDataURL("image/jpeg", 1.0),
            "JPEG",
            10,
            10,
            a4w,
            Math.min(a4h, (a4w * page.height) / page.width), undefined, 'FAST');
          //Add header logo
          pdf.addImage(logo, "PNG", 15, 5, 20, 20, undefined, 'FAST');
        }
        renderedHeight += imgHeight;
        if (renderedHeight < canvas.height) {
          pdf.addPage(); //Add an empty page if there is more to follow
        }
      }


    });
    let pdfDocument = pdf.output();

    this.fileString = btoa(pdf.output());
    // console.log(this.fileString);
    // console.log(this.fileString);
    // pdf.save("internshipletter.pdf");

  }


  //create business letter integration
  public createList() {
    this.spinner.show();
    let orgId = localStorage.getItem("OrgId");
    this.fileEncode = {
      "org_id": orgId,
      "name": this.data.name,
      //  "doj": this.data.date,
      "address": this.data.address,
      "program_title": this.data.programtitle,
      "description": this.data.description,
      "companyLogo": this.data.companyLogo,
      "internPdfFormat": this.fileString,
      "directorSign": this.data.directorSign,
      "directorName": this.data.directorName,
      "companyName": this.data.companyName,
      "companyAddress": this.data.companyAddress,
      "companySite": this.data.companyLink,
      "signatureRole": this.data.signatureRole,
      "logoFileName": this.data.logoFileName,
      "signFileName": this.data.signFileName,
      "today_Date": this.todayDate
    };
    // console.log("this fileencode ....", this.fileEncode);
    this.internService
      .createBusinessDetails(this.fileEncode)
      .subscribe((data) => {
        if (data.map.statusMessage == "Success") {
          // this.resetform();
          this.utilsService.openSnackBarAC(
            "Letter created successfully",
            "OK"
          );
          this.spinner.hide();
          setTimeout(() => {
            this.router.navigate(["/business_letter"]);
            this.dialogRef.close();
          }, 500);
        } else {
          this.utilsService.openSnackBarMC(
            "Failed to create letter",
            "OK"
          );
          this.spinner.hide();
        }
      }, (error) => {
        this.router.navigate(["/404"]);
        this.spinner.hide();
        this.dialogRef.close();
      });
  }

  //update business letter integration
  public updateList() {
    this.spinner.show();
    let orgId = localStorage.getItem("OrgId");
    this.fileEncode = {
      "org_id": orgId,
      "name": this.data.name,
      // "doj": this.data.date,
      "address": this.data.address,
      "program_title": this.data.programtitle,
      "description": this.data.description,
      "companyLogo": this.data.companyLogo,
      "internPdfFormat": this.fileString,
      // "pdfFileLink":this.fileString,
      "directorSign": this.data.directorSign,
      "directorName": this.data.directorName,
      "companyName": this.data.companyName,
      "companyAddress": this.data.companyAddress,
      "companySite": this.data.companyLink,
      "signatureRole": this.data.signatureRole,
      "logoFileName": this.data.logoFileName,
      "signFileName": this.data.signFileName,
      "today_Date": this.todayDate
    };
    this.internService
      .updateBusinessDetails(this.data.id, this.fileEncode)
      .subscribe((result) => {
        // console.log(result);
        if (result.map.statusMessage == "Success") {
          this.utilsService.openSnackBarAC(
            "Letter updated successfully",
            "OK"
          );
          this.spinner.hide();
          setTimeout(() => {
            this.router.navigate(["/business_letter"]);
            this.dialogRef.close();
          }, 500);
        } else {
          this.utilsService.openSnackBarMC(
            "Failed to update letter",
            "OK"
          );
          this.spinner.hide();
        }
      }, (error) => {
        this.router.navigate(["/404"]);
        this.spinner.hide();
        this.dialogRef.close();
      });
  }
}


