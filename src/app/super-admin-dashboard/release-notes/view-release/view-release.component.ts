import { Component, OnInit, ElementRef, Inject, AfterViewInit } from '@angular/core';
import { UtilService } from '../../../services/util.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ReleaseNotesService } from '../../../services/super-admin/release-notes/release-notes.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DatePipe } from '@angular/common';
import { UntypedFormBuilder, FormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import { PDFDocument } from 'pdf-lib';
import moment from 'moment-timezone';
pdfMake.vfs = pdfFonts.pdfMake.vfs;
@Component({
  selector: 'app-view-release',
  templateUrl: './view-release.component.html',
  styleUrls: ['./view-release.component.less']
})
export class ViewReleaseComponent implements AfterViewInit {

  isReleaseNotesActiveId:boolean = false;
  isInternActiveId: boolean = false;
  currentDate = new Date();
  releaseForm: UntypedFormGroup;
  releaseId: any;

  whatsNew: string ='';
  improvement:string ='';
  bugFixes:string ='';
  comingSoon:string  ='';
  general:string ='';

  annexure_details: any;
  pdfencodeString: any;
  pdfDocument: any;
  logoImage: any;
  version: any;
  title: any;
  company_logo: any;
  activateId: any;
  internId: any;


  date: any;
  heading: any;
  name: any;
  public fileEncode: any = {};
  fileString: string = "";
  descriptionData: string;
  terms_conditionsData: string;
  todayDate: string;
  logoFileName: string;
  companyLink: string;


  constructor(private releaseService: ReleaseNotesService,
    public utilService: UtilService,
    private spinner: NgxSpinnerService,
    private datePipe: DatePipe,
    private utilsService: UtilService,
    public router: Router,
    public activeRoute: ActivatedRoute,
    private formBuilder: UntypedFormBuilder,
    public dialogRef: MatDialogRef<ViewReleaseComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    
  ) {
    // console.log(data);
    this.whatsNew = this.data.whatsNew;
    this.improvement =this.data.improvement;
    this.bugFixes = this.data.bugFixes;
    this.comingSoon = this.data.comingSoon;
    this.general = this.data.general;
    this.logoImage = this.data.companyLogo;
    // this.getViewData();
    this.internId = this.data.activateId;
    // console.log(this.internId);
    if (this.internId != undefined ) {
      this.isInternActiveId = true;
    } else {
      this.isInternActiveId = false;
    }
    // console.log(this.logoImage);
    
  }
  // getViewData() {
    
  // }

  onNoClick(): void {
    this.dialogRef.close();
  }

  ngAfterViewInit() {
    this.htmlTopdfConvert();
  }



  async htmlTopdfConvert() {
    this.spinner.show();
    let logoElement = this.logoImage;
    let element = document.getElementById("contentToConvert");
    let elementContent = document.getElementById("contentToPageContent");
    var encodeString: string;
   
    
    let pdfarraybufferlist: any[] = [];
    await html2canvas(element, { scale: 3, logging: true }).then(function (canvas) {
      const image = { type: 'jpeg', quality: 0.98 };
      const margin = [0.5, 0.5];
      const filename = 'myfile.pdf';

      var imgWidth = 8.5;
      var pageHeight = 11;

      var innerPageWidth = imgWidth - margin[0] * 2;
      var innerPageHeight = pageHeight - margin[1] * 2;

      // Calculate the number of pages.
      var pxFullHeight = canvas.height;
      var pxPageHeight = Math.floor(canvas.width * (pageHeight / imgWidth));
      var nPages = Math.ceil(pxFullHeight / pxPageHeight);

      // Define pageHeight separately so it can be trimmed on the final page.
      var pageHeight = innerPageHeight;

      // Create a one-page canvas to split up the full image.
      var pageCanvas = document.createElement('canvas');
      var pageCtx = pageCanvas.getContext('2d');
      pageCanvas.width = canvas.width;
      pageCanvas.height = pxPageHeight;

      // Initialize the PDF.
      var pdf = new jsPDF('p', 'in', [8.5, 11]);

      for (var page = 0; page < nPages; page++) {
        // Trim the final page to reduce file size.
        if (page === nPages - 1 && pxFullHeight % pxPageHeight !== 0) {
          pageCanvas.height = pxFullHeight % pxPageHeight;
          pageHeight = (pageCanvas.height * innerPageWidth) / pageCanvas.width;
        }

        // Display the page.
        var w = pageCanvas.width;
        var h = pageCanvas.height;
        pageCtx.fillStyle = 'white';
        pageCtx.fillRect(0, 0, w, h);
        pageCtx.drawImage(canvas, 0, page * pxPageHeight, w, h, 0, 0, w, h);

        // Add the page to the PDF.
        if (page > 0) pdf.addPage();
        // debugger;
        var imgData = pageCanvas.toDataURL('image/' + image.type, image.quality);
        pdf.addImage(imgData, image.type, margin[1], margin[0], innerPageWidth, pageHeight);
     }
      // pdf.save("pdf1/pdf");
      let arrayBuffer = pdf.output('arraybuffer');
       pdfarraybufferlist.push(arrayBuffer);
     
    });
    await html2canvas(elementContent, { scale: 3, logging: true }).then(function (canvas) {
      const image = { type: 'jpeg', quality: 0.98 };
      const margin = [0.5, 0.5];
      const filename = 'myfile.pdf';

      var imgWidth = 8.5;
      var pageHeight = 11;

      var innerPageWidth = imgWidth - margin[0] * 2;
      var innerPageHeight = pageHeight - margin[1] * 2;

      // Calculate the number of pages.
      var pxFullHeight = canvas.height;
      var pxPageHeight = Math.floor(canvas.width * (pageHeight / imgWidth));
      var nPages = Math.ceil(pxFullHeight / pxPageHeight);

      // Define pageHeight separately so it can be trimmed on the final page.
      var pageHeight = innerPageHeight;

      // Create a one-page canvas to split up the full image.
      var pageCanvas = document.createElement('canvas');
      var pageCtx = pageCanvas.getContext('2d');
      pageCanvas.width = canvas.width;
      pageCanvas.height = pxPageHeight;

      // Initialize the PDF.
      var pdf = new jsPDF('p', 'in', [8.5, 11]);

      for (var page = 0; page < nPages; page++) {
        // Trim the final page to reduce file size.
        if (page === nPages - 1 && pxFullHeight % pxPageHeight !== 0) {
          pageCanvas.height = pxFullHeight % pxPageHeight;
          pageHeight = (pageCanvas.height * innerPageWidth) / pageCanvas.width;
        }

        // Display the page.
        var w = pageCanvas.width;
        var h = pageCanvas.height;
        pageCtx.fillStyle = 'white';
        pageCtx.fillRect(0, 0, w, h);
        pageCtx.drawImage(canvas, 0, page * pxPageHeight, w, h, 0, 0, w, h);

        // Add the page to the PDF.
        if (page > 0) pdf.addPage();
        // debugger;
        var imgData = pageCanvas.toDataURL('image/' + image.type, image.quality);
        pdf.addImage(imgData, image.type, margin[1], margin[0], innerPageWidth, pageHeight);
     }
      // pdf.save("pdf1/pdf");
      let arrayBuffer = pdf.output('arraybuffer');
       pdfarraybufferlist.push(arrayBuffer);
    });
    const mergedPdf = await this.mergePdfs(pdfarraybufferlist);
    var blob = new Blob([mergedPdf.buffer], { type: 'application/pdf' });
    var reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onloadend = () => {
      // encodeString = (<string>reader.result).split(',')[1];
      this.pdfDocument = (<string>reader.result).split(',')[1];
      // console.log(this.pdfDocument);
    }
    const pdfUrl = URL.createObjectURL(
      new Blob([mergedPdf], { type: 'application/pdf' }),
    );
    // window.open(pdfUrl);
         // this.downloadFile(blob);
    // setTimeout(() => {
      this.pdfencodeString = mergedPdf.buffer;
    setTimeout(() =>{
      this.spinner.hide();
    },2000);
    // var totalPdf = new jsPDF("p","mm","a4",true);
    // pdf.save();
    // pdf1.save();
    // let pdfDocument = pdf.output().concat(pdf1.output());
    // this.fileString = btoa(pdf.output().concat(pdf1.output()));
    // console.log(this.fileString);
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


  //create release notes integration
  public createDetails() {
    // console.log("createList");
    this.spinner.show();
    let orgId = localStorage.getItem("OrgId");
    let zone = moment.tz.guess();
    let data = {
      "keyNote":this.data.key,
      "version": this.data.version,
      "dor": this.data.dor,
      "releaseNotesTitle":this.data.title,
      "productName":this.data.productName,
      "companyLogo": this.data.companyLogo,
      "logoFileName": this.data.logoFileName,
      "whatsNew":this.data.whatsNew,
      "improvement":this.data.improvement,
      "bugFixes":this.data.bugFixes,
      "general":this.data.general,
      "comingsoon":this.data.comingSoon,
      "notes_pdfFormat": this.pdfDocument,
      "timezone": zone,
    };
    // console.log(this.data)
    this.releaseService.createReleaseDetails(data).subscribe((data) => {

        if (data.map.statusMessage == "Success") {
          this.utilsService.openSnackBarAC(
            "Release notes created successfully",
            "OK"
          );
          this.spinner.hide();
          setTimeout(() => {
            this.router.navigate(["/release-notes"]);
            this.dialogRef.close();
          }, 500);
        } else {
          this.utilsService.openSnackBarMC(
            "Failed to create release notes",
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
  //update release notes integration
  public updateList() {
    // console.log(this.pdfDocument);
    // console.log("updateList");
    this.spinner.show();
    let zone = moment.tz.guess();
    let data = {
      "keyNote":this.data.key,
      "version": this.data.version,
      "dor": this.data.dor,
      "releaseNotesTitle":this.data.title,
      "productName":this.data.productName,
      "companyLogo": this.data.companyLogo,
      "logoFileName": this.data.logoFileName,
      "whatsNew":this.data.whatsNew,
      "improvement":this.data.improvement,
      "bugFixes":this.data.bugFixes,
      "general":this.data.general,
      "comingsoon":this.data.comingSoon,
      "notes_pdfFormat": this.pdfDocument,
      "is_publish":this.data.ispublish,
      "timezone": zone,
    };
    // console.log(data);
    this.releaseService
      .updateReleaseNotesDetails(this.internId, data)
      .subscribe((result) => {
        if (result.map.statusMessage == "Success") {
          this.utilsService.openSnackBarAC(
            "Release notes updated successfully",
            "OK"
          );
          this.spinner.hide();
          setTimeout(() => {
            this.router.navigate(["/release-notes"]);
            this.dialogRef.close();
          }, 500);
        } else {
          this.utilsService.openSnackBarMC(
            "Failed to update release notes",
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
