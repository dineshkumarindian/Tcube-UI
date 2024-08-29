import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ReplaySubject, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { SettingsService } from 'src/app/services/settings.service';
import { UtilService } from 'src/app/services/util.service';
import {errorMessage, validFormat,} from '../../../../util/constants';

@Component({
  selector: 'app-add-client-form',
  templateUrl: './add-client-form.component.html',
  styleUrls: ['./add-client-form.component.less']
})
export class AddClientFormComponent implements OnInit {
heading: string;
subheading: string;
requiredMessage = errorMessage;
validFormat = validFormat;
  /** Subject that emits when the component has been destroyed. */
  protected _onDestroy = new Subject<void>();
  clientIdUpdate: number;
  constructor(private formBuilder: UntypedFormBuilder,
    private settingsService: SettingsService,
    private router: Router,
    public matDialog: MatDialog,
    private utilsService: UtilService,
    private spinner: NgxSpinnerService,
    private activatedRoute: ActivatedRoute,) { }
  ngOnInit() {
    this.clientIdUpdate = this.activatedRoute.snapshot.params.id;
    if(this.clientIdUpdate){
      this.heading = "Edit Client";
      this.subheading = "Modify client configuration details";
      this.clientFormValue();
    }
    else{
      this.heading = "Add Client";
      this.subheading = "Client configuration details";
    }
     // load the initial client list
     this.filteredCurrency.next(this.CurrencyList.slice());

     // listen for search field value changes
     this.currencyFilterCtrl.valueChanges
       .pipe(takeUntil(this._onDestroy))
       .subscribe(() => {
         this.filterclient();
       });
 
     // load the initial bill list
     this.filteredbill.next(this.bill.slice());
 
     // listen for search field value changes
     this.billFilterCtrl.valueChanges
       .pipe(takeUntil(this._onDestroy))
       .subscribe(() => {
         this.filterbill();
       });

       this.getActiveClientDetailsByOrgId();
  }

  numberOnly(event): boolean {
    const charCode = (event.which) ? event.which : event.keyCode;
      if (charCode > 31 && (charCode < 48 || charCode > 57)) {
         return false;
      }
      return true;
  
  }
  // CurrencyList
  protected CurrencyList: any[] = [
    { code: "AFN", text: "Afghanistan Afghanis – AFN" },
    { code: "ALL", text: "Albania Leke – ALL" },
    { code: "DZD", text: "Algeria Dinars – DZD" },
    { code: "ARS", text: "Argentina Pesos – ARS" },
    { code: "AUD", text: "Australia Dollars – AUD" },
    { code: "ATS", text: "Austria Schillings – ATS" },
    { code: "BSD", text: "Bahamas Dollars – BSD" },
    { code: "BHD", text: "Bahrain Dinars – BHD" },
    { code: "BDT", text: "Bangladesh Taka – BDT" },
    { code: "BBD", text: "Barbados Dollars – BBD" },
    { code: "BEF", text: "Belgium Francs – BEF" },
    { code: "BMD", text: "Bermuda Dollars – BMD" },
    { code: "BRL", text: "Brazil Reais – BRL" },
    { code: "BGN", text: "Bulgaria Leva – BGN" },
    { code: "CAD", text: "Canada Dollars – CAD" },
    { code: "XOF", text: "CFA BCEAO Francs – XOF" },
    { code: "XAF", text: "CFA BEAC Francs – XAF" },
    { code: "CLP", text: "Chile Pesos – CLP" },
    { code: "CNY", text: "China Yuan Renminbi – CNY" },
    { code: "COP", text: "Colombia Pesos – COP" },
    { code: "XPF", text: "CFP Francs – XPF" },
    { code: "CRC", text: "Costa Rica Colones – CRC" },
    { code: "HRK", text: "Croatia Kuna – HRK" },
    { code: "CYP", text: "Cyprus Pounds – CYP" },
    { code: "CZK", text: "Czech Republic Koruny – CZK" },
    { code: "DKK", text: "Denmark Kroner – DKK" },
    { code: "DEM", text: "Deutsche (Germany) Marks – DEM" },
    { code: "DOP", text: "Dominican Republic Pesos – DOP" },
    { code: "NLG", text: "Dutch (Netherlands) Guilders - NLG" },
    { code: "XCD", text: "Eastern Caribbean Dollars – XCD" },
    { code: "EGP", text: "Egypt Pounds – EGP" },
    { code: "EEK", text: "Estonia Krooni – EEK" },
    { code: "EUR", text: "Euro – EUR" },
    { code: "FJD", text: "Fiji Dollars – FJD" },
    { code: "FIM", text: "Finland Markkaa – FIM" },
    { code: "FRF", text: "France Francs – FRF" },
    { code: "DEM", text: "Germany Deutsche Marks – DEM" },
    { code: "XAU", text: "Gold Ounces – XAU" },
    { code: "GRD", text: "Greece Drachmae – GRD" },
    { code: "GTQ", text: "Guatemalan Quetzal – GTQ" },
    { code: "NLG", text: "Holland (Netherlands) Guilders – NLG" },
    { code: "HKD", text: "Hong Kong Dollars – HKD" },
    { code: "HUF", text: "Hungary Forint – HUF" },
    { code: "ISK", text: "Iceland Kronur – ISK" },
    { code: "XDR", text: "IMF Special Drawing Right – XDR" },
    { code: "INR", text: "India Rupees – INR" },
    { code: "IDR", text: "Indonesia Rupiahs – IDR" },
    { code: "IRR", text: "Iran Rials – IRR" },
    { code: "IQD", text: "Iraq Dinars – IQD" },
    { code: "IEP", text: "Ireland Pounds – IEP" },
    { code: "ILS", text: "Israel New Shekels – ILS" },
    { code: "ITL", text: "Italy Lire – ITL" },
    { code: "JMD", text: "Jamaica Dollars – JMD" },
    { code: "JPY", text: "Japan Yen – JPY" },
    { code: "JOD", text: "Jordan Dinars – JOD" },
    { code: "KES", text: "Kenya Shillings – KES" },
    { code: "KRW", text: "Korea (South) Won – KRW" },
    { code: "KWD", text: "Kuwait Dinars – KWD" },
    { code: "LBP", text: "Lebanon Pounds – LBP" },
    { code: "LUF", text: "Luxembourg Francs – LUF" },
    { code: "MYR", text: "Malaysia Ringgits – MYR" },
    { code: "MTL", text: "Malta Liri – MTL" },
    { code: "MUR", text: "Mauritius Rupees – MUR" },
    { code: "MXN", text: "Mexico Pesos – MXN" },
    { code: "MAD", text: "Morocco Dirhams – MAD" },
    { code: "NLG", text: "Netherlands Guilders – NLG" },
    { code: "NZD", text: "New Zealand Dollars – NZD" },
    { code: "NOK", text: "Norway Kroner – NOK" },
    { code: "OMR", text: "Oman Rials – OMR" },
    { code: "PKR", text: "Pakistan Rupees – PKR" },
    { code: "XPD", text: "Palladium Ounces – XPD" },
    { code: "PEN", text: "Peru Nuevos Soles – PEN" },
    { code: "PHP", text: "Philippines Pesos – PHP" },
    { code: "XPT", text: "Platinum Ounces – XPT" },
    { code: "PLN", text: "Poland Zlotych – PLN" },
    { code: "PTE", text: "Portugal Escudos – PTE" },
    { code: "QAR", text: "Qatar Riyals – QAR" },
    { code: "RON", text: "Romania New Lei – RON" },
    { code: "ROL", text: "Romania Lei – ROL" },
    { code: "RUB", text: "Russia Rubles – RUB" },
    { code: "SAR", text: "Saudi Arabia Riyals – SAR" },
    { code: "XAG", text: "Silver Ounces – XAG" },
    { code: "SGD", text: "Singapore Dollars – SGD" },
    { code: "SKK", text: "Slovakia Koruny – SKK" },
    { code: "SIT", text: "Slovenia Tolars – SIT" },
    { code: "ZAR", text: "South Africa Rand – ZAR" },
    { code: "KRW", text: "South Korea Won – KRW" },
    { code: "ESP", text: "Spain Pesetas – ESP" },
    { code: "XDR", text: "Special Drawing Rights (IMF) – XDR" },
    { code: "LKR", text: "Sri Lanka Rupees – LKR" },
    { code: "SDD", text: "Sudan Dinars – SDD" },
    { code: "SEK", text: "Sweden Kronor – SEK" },
    { code: "CHF", text: "Switzerland Francs – CHF" },
    { code: "TWD", text: "Taiwan New Dollars – TWD" },
    { code: "THB", text: "Thailand Baht – THB" },
    { code: "TTD", text: "Trinidad and Tobago Dollars – TTD" },
    { code: "TND", text: "Tunisia Dinars – TND" },
    { code: "TRY", text: "Turkey New Lira – TRY" },
    { code: "AED", text: "United Arab Emirates Dirhams – AED" },
    { code: "GBP", text: "United Kingdom Pounds – GBP" },
    { code: "USD", text: "United States Dollars – USD" },
    { code: "VEB", text: "Venezuela Bolivares – VEB" },
    { code: "VND", text: "Vietnam Dong – VND" },
    { code: "ZMK", text: "Zambia Kwacha – ZMK" },
  ]

    /** list of bill */
    protected bill: any[] = [
      { name: 'Hourly Job Rate', id: 1 },
      { name: 'Hourly User Rate', id: 2 },
      { name: 'Hourly User Rate-Jobs', id: 3 },
      { name: 'Hourly User Rate-Projects', id: 4 },
    ];

    protected filterclient() {
      if (!this.CurrencyList) {
        return;
      }
      // get the search keyword
      let search = this.currencyFilterCtrl.value;
      if (!search) {
        this.filteredCurrency.next(this.CurrencyList.slice());
        return;
      } else {
        search = search.toLowerCase();
      }
      // filter the client
      this.filteredCurrency.next(
        this.CurrencyList.filter(client => client.text.toLowerCase().indexOf(search) > -1)
      );
    }

    protected filterbill() {
      if (!this.bill) {
        return;
      }
      // get the search keyword
      let search = this.billFilterCtrl.value;
      if (!search) {
        this.filteredbill.next(this.bill.slice());
        return;
      } else {
        search = search.toLowerCase();
      }
      // filter the client
      this.filteredbill.next(
        this.bill.filter(bill => bill.name.toLowerCase().indexOf(search) > -1)
      );
    }

    //Clients formgroup
    ClientFormGroup: UntypedFormGroup = this.formBuilder.group({
      clientName: ['', [Validators.required, Validators.pattern("^([A-Za-z]+ )+[A-Za-z]+$|^[A-Za-z]+$")]],
      email: ['', [Validators.required, Validators.email,Validators.pattern("^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{1,10}$(.*[a-zA-Z])?$")]],
      fName: ['', [Validators.required, Validators.pattern("[A-Za-z]{2,32}")]],
      lName: ['', [Validators.required, Validators.pattern("[A-Za-z]{1,32}")]],
      mobile: ['', [Validators.required, Validators.pattern(/^([+]\d{2}[ ])?\d{10}$/)]],
      // personal_mobile_number: ['', [Validators.required,Validators.pattern(/^([+]\d{2}[ ])?\d{10}$/)]]
    })
    
    /** control for the selected clien */
  public currencyCtrl: UntypedFormControl = new UntypedFormControl("", [Validators.required]);

  /** control for the MatSelect filter keyword */
  public currencyFilterCtrl: UntypedFormControl = new UntypedFormControl();

  /** list of currency filtered by search keyword */
  public filteredCurrency: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);

  /** control for the selected project */
  public billCtrl: UntypedFormControl = new UntypedFormControl("", [Validators.required]);

  /** control for the MatSelect filter keyword */
  public billFilterCtrl: UntypedFormControl = new UntypedFormControl();

  /** list of bill filtered by search keyword */
  public filteredbill: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);

  isClientIdAvailable:boolean = false;
  clientDetailsData: any[] = [];
  onClientName: boolean = false;
  clientDetails: any[] = [];

    //client details should be remove duplicate client name
    onCheckClientName() {
      if (this.clientIdUpdate) {
        for (let k = 0; k < this.clientDetailsData.length; k++) {
          if (this.ClientFormGroup.get('clientName').value == this.clientDetailsData[k]) {
            this.clientDetailsData.splice(k, 1);
          }
        }
        this.isClientIdAvailable = false;
      }
      if (this.ClientFormGroup.value.clientName) {
        if (this.clientDetailsData.find(x => x.toLowerCase() == (this.ClientFormGroup.value.clientName).toLowerCase()))
          this.onClientName = true;
        else this.onClientName = false;
      }
  
    }

    //get all active clients
    activateClientData: boolean = false;
    getActiveClientDetailsByOrgId() {
      this.clientDetailsData = [];
      this.spinner.show();
      let OrgId = localStorage.getItem("OrgId");
      this.settingsService.getActiveClientDetailsByOrgId(OrgId).subscribe(data => {
        if (data.map.statusMessage == "Success") {
          let response: any[] = JSON.parse(data.map.data);
          this.clientDetails = response;
          for (let i = 0; i < this.clientDetails.length; i++) {
            let word = this.clientDetails[i].currency;
            this.clientDetails[i].currency = word.split(' ').pop();
            this.clientDetailsData.push(this.clientDetails[i].client_name);
          }
          this.spinner.hide();
        }


      }, (error) => {
        this.router.navigate(["/404"]);
        this.spinner.hide();
      })
      setTimeout(() => {
        this.getInactiveClientName();
      }, 2000);
  
    }

      //getAll inactive client Name
  getInactiveClientName() {
    let OrgId = localStorage.getItem("OrgId");
    this.settingsService.getInactiveClientDetailsByOrgId(OrgId).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        let response = JSON.parse(data.map.data);
        for (let i = 0; i < response.length; i++) {
          this.clientDetailsData.push(response[i].client_name);
        }
      }
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
    });
  }

  //post method for the client details
  addClient() {
    this.spinner.show();
    let OrgId = localStorage.getItem("OrgId");
    let data: Object = {
      "org_id": OrgId,
      "client_name": this.ClientFormGroup.value.clientName,
      "currency": this.currencyCtrl.value,
      "billing_method": this.billCtrl.value,
      "email": this.ClientFormGroup.value.email,
      "firstname": this.ClientFormGroup.value.fName,
      "lastname": this.ClientFormGroup.value.lName,
      "mobile_number": this.ClientFormGroup.value.mobile,
    }
    this.settingsService.createClient(data).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        this.utilsService.openSnackBarAC("client added successfully", "OK");
        setTimeout(() => {
          this.router.navigate(['/project-jobs-settings']);
        }, 500);
      }
      else {
        this.utilsService.openSnackBarMC("Failed to add client", "OK");
      }
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
    })
    setTimeout(() => {
      this.spinner.hide();
    }, 1000);
  }

  //set formvalues for the while clicking the edit method
  clientFormValue() {
    this.spinner.show();
    this.settingsService.getClientDetailsById(this.clientIdUpdate).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        let response = JSON.parse(data.map.data);
        // console.log(response);
        this.ClientFormGroup.get('clientName').setValue(response.client_name);
        this.currencyCtrl.setValue(response.currency);
        this.billCtrl.setValue(response.billing_method)
        this.ClientFormGroup.get('email').setValue(response.email);
        this.ClientFormGroup.get('fName').setValue(response.firstname);
        this.ClientFormGroup.get('lName').setValue(response.lastname);
        this.ClientFormGroup.get('mobile').setValue(response.mobile_number);
      }
      this.spinner.hide();
    })
  }

  //update client details
  updateClient() {
    this.spinner.show();
    let OrgId = localStorage.getItem("OrgId");
    let data: Object = {
      "id": this.clientIdUpdate,
      "org_id": OrgId,
      "client_name": this.ClientFormGroup.value.clientName,
      "currency": this.currencyCtrl.value,
      "billing_method": this.billCtrl.value,
      "email": this.ClientFormGroup.value.email,
      "firstname": this.ClientFormGroup.value.fName,
      "lastname": this.ClientFormGroup.value.lName,
      "mobile_number": this.ClientFormGroup.value.mobile,
    }
    this.settingsService.updateClient(data).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        this.utilsService.openSnackBarAC("Client updated successfully", "OK");
        setTimeout(() => {
          this.router.navigate(['/project-jobs-settings']);
        }, 500);
      }
      else {
        this.utilsService.openSnackBarMC("Failed to update client", "OK");
      }
      this.spinner.hide();
    })
  }

  //client form redirect
  clienttformtoggle(){
    this.router.navigate(['/project-jobs-settings']);
  }
}
