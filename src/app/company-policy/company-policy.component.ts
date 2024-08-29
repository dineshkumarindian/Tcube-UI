import { Component, ElementRef, OnInit, ViewChild, Renderer2 } from '@angular/core';
import { Router } from '@angular/router';
import { CompanyPolicyService } from 'src/app/services/company-policy.service';
import { CommonModule, DatePipe } from '@angular/common';
import { DateAdapter } from '@angular/material/core';
import { UtilService } from '../services/util.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { MatIconModule } from '@angular/material/icon';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { MatTooltip, MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-company-policy',
  templateUrl: './company-policy.component.html',
  styleUrls: ['./company-policy.component.less'],
  standalone: true,
  imports: [CommonModule, MatIconModule,  MatTooltipModule,],
})
export class CompanyPolicyComponent implements OnInit {

  isAddPolicy: boolean = false;
  ispolicyDataShowing: boolean = false;
  Org_id: any;
  singlePolicyData: any;
  policyDetails: any;
  policyPdf: any;
  isPolicyPdfOrNot: boolean = true;
  pdfUrl: SafeResourceUrl;
  pdfData: Blob;
  policyData: any=[];
  isComingSoonShowing: boolean = false;
  @ViewChild('pdfIframeContainer', { static: true }) pdfContainerRef!: ElementRef;
  @ViewChild("myTooltip") myTooltip: MatTooltip;
  constructor(public router: Router, public policyService: CompanyPolicyService, private spinner: NgxSpinnerService,
    public utilService: UtilService, private sanitizer: DomSanitizer,
    public datepipe: DatePipe,
    private dateAdapter: DateAdapter<Date>, private renderer: Renderer2) { }

  async ngOnInit() {
    this.Org_id = localStorage.getItem('OrgId');
    this.getActivePolicyByOrgId();
  }

  uploadButton() {
    this.isAddPolicy = false;
    this.router.navigate(["add-policy/" + false]);
  }
  navigateToAdd() {
    this.isAddPolicy = true;
    this.router.navigate(["add-policy/" + true]);
  }
  
  policyContent: any = [];
  policyNameList: any = [];
  async getActivePolicyByOrgId() {
    this.spinner.show();    
    await this.policyService.getActivePolicyByOrgId(this.Org_id).subscribe((data) => {
      if (data.map.statusMessage == "Success") {
        let response:any [] ;
       response = JSON.parse(data.map.data);
        if(response.length !=0) {
          this.isComingSoonShowing = false;
        for (let i = 0; i < response.length; i++) {
          if (response[i].created_time != response[i].modified_time) {
            this.policyNameList.push(response[i].policyname);
            this.policyData.push({ "id": response[i].id, "policyname": response[i].policyname, "createddate": response[i].issuedDate, "updatedate": response[i].modified_time, "description": response[i].description });
          } else {
            this.policyData.push({ "id": response[i].id, "policyname": response[i].policyname, "createddate": response[i].issuedDate, "updatedate": null, "description": response[i].description });
          }
        }
      } else if(response.length == 0) {
        this.isComingSoonShowing = true;
      }
      else {
       this.policyData = [];
      }
        this.spinner.hide();
      } else {
        // this.utilService.openSnackBarMC("Failed to get policy details", "OK");
        this.spinner.hide();
      }
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
    });
  }
  showPolicyData(id) {
    this.spinner.show();
    this.policyService.getPolicybyId(id).subscribe((data) => {
      if (data.map.statusMessage == "Success") {
        let response = JSON.parse(data.map.data);
        this.singlePolicyData = response;
        if (this.singlePolicyData?.description) {
          this.isPolicyPdfOrNot = false;
          this.policyDetails = response;
        }
        else if (this.singlePolicyData?.policy_pdfFormat) {
          this.isPolicyPdfOrNot = true;
          const uint8Array = new Uint8Array(this.singlePolicyData.policy_pdfFormat);
          this.pdfData = new Blob([uint8Array], { type: 'application/pdf' }); // Assuming 'pdfData' is the property name containing PDF data
          this.pdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(URL.createObjectURL(this.pdfData));

        }
        this.ispolicyDataShowing = true;
        this.spinner.hide();
      } else {
        // this.utilService.openSnackBarMC("Failed to get policy details", "OK");
        this.spinner.hide();
      }
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
    })

  }
  backToPolicy() {
    this.ispolicyDataShowing = false;
    this.myTooltip.disabled = false;
    this.myTooltip.show();
  }
  navigateToSettings() {
    this.router.navigate(["/company-policy-settings"]);
  }
  getPdfHeight() {
    let height1 = window.innerHeight;
    return (height1 - 139);
  }
}
