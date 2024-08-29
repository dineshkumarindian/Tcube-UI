import { Component, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MatSelect } from '@angular/material/select';
import { MatOption } from '@angular/material/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ReplaySubject, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ManagePricingPlanService } from 'src/app/services/super-admin/manage-pricing-plan/manage-pricing-plan.service';
import { UtilService } from 'src/app/services/util.service';
import { errorMessage } from '../../util/constants';

@Component({
  selector: 'app-add-pricing-plan',
  templateUrl: './add-pricing-plan.component.html',
  styleUrls: ['./add-pricing-plan.component.less']
})
export class AddPricingPlanComponent implements OnInit {
  requiredMessage = errorMessage;
  pricingFormGroup: UntypedFormGroup;
  selectedAccess = [];
  selectedAccessList = [];
  noDataFoundMessage = 'no match found';
  minDaysValid: number = 0;
  maxDaysValid: number = 0;
  isYearAccessField:boolean = false; 

  constructor(private _formbuilder: UntypedFormBuilder,
    private spinner: NgxSpinnerService,
    private router: Router,
    private utilsService: UtilService,
    private activatedRoute: ActivatedRoute,
    private managePricingPlanService: ManagePricingPlanService) { }
  plan_id: any;
  IsPlanIdAvailable: boolean = false;
  ngOnInit() {
    this.getAllPlanDetails();
    this.pricingFormGroup = this._formbuilder.group({
      p_name: ['', [Validators.required]],
      currency: ['', [Validators.required]],
      amount: ['', [Validators.required]],
      days: ['', [Validators.required, Validators.min(0), Validators.pattern(/^\d+$/)]],
      users: ['', [Validators.required,Validators.pattern(/^\d+$/)]],
      modules: ['', [Validators.required]],
      category: ['', [Validators.required]],
      // description: ['']
    });

    this.plan_id = this.activatedRoute.snapshot.params.id;
    if (this.plan_id) {
      this.IsPlanIdAvailable = true;
      this.getPlanbyID();
    }
    else {
      this.IsPlanIdAvailable = false;
    }
    this.filteredCurrency.next(this.CurrencyList.slice());

    // listen for search field value changes
    this.currencyFilterCtrl.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        this.filterclient();
      });

    this.filteredCategory.next(this.CategoryList.slice());

    // listen for search field value changes
    this.categoryFilterCtrl.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        this.filterCategory();
      });


    // load the initial bill list
    this.filteredAccess.next(this.accessList.slice());

    // listen for search field value changes
    this.accessFilterCtrl.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        this.filterAccess();
      });
  }

  /** Subject that emits when the component has been destroyed. */
  protected _onDestroy = new Subject<void>();
  accessList: string[] = ['dashboard', 'project/jobs', 'time-tracker', 'attendance', 'settings', 'leave-tracker', 'reports', 'day-planner', 'apps-integration', 'company-policy','subscription','performance-metrics'];
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

  protected CategoryList: any[] = [
    { text: "Month" },
    { text: "Year" },
  ]
  /** control for the MatSelect filter keyword */
  public currencyFilterCtrl: UntypedFormControl = new UntypedFormControl();

  /** list of currency filtered by search keyword */
  public filteredCurrency: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);
  /** control for the MatSelect filter keyword */
  public categoryFilterCtrl: UntypedFormControl = new UntypedFormControl();

  /** list of currency filtered by search keyword */
  public filteredCategory: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);

  /** list of bill filtered by search keyword */
  public filteredAccess: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);

  /** control for the MatSelect filter keyword */
  public accessFilterCtrl: UntypedFormControl = new UntypedFormControl();

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

  protected filterAccess() {
    if (!this.accessList) {
      return;
    }
    // get the search keyword
    let search = this.accessFilterCtrl.value;
    if (!search) {
      this.filteredAccess.next(this.accessList.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
    // filter the client
    this.filteredAccess.next(
      this.accessList.filter(bill => bill.toLowerCase().indexOf(search) > -1)
    );
  }

  protected filterCategory() {
    if (!this.CategoryList) {
      return;
    }
    // get the search keyword
    let search = this.categoryFilterCtrl.value;
    if (!search) {
      this.filteredCategory.next(this.CategoryList.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
    // filter the category 
    this.filteredCategory.next(
      this.CategoryList.filter(category => category.text.toLowerCase().indexOf(search) > -1)
    );
  }

  //create plan details
  createplan() {
    let arr: any = [];
    this.spinner.show();
    for (let i = 0; i < this.selectedAccess.length; i++) {
      if (this.selectedAccess[i] != undefined) {
        arr.push(this.selectedAccess[i])
      }
    };
    let formdata = {
      "plan": this.pricingFormGroup.value.p_name,
      "amount": this.pricingFormGroup.value.amount,
      "days": this.pricingFormGroup.value.days,
      "userslimit": this.pricingFormGroup.value.users,
      "currency": this.pricingFormGroup.value.currency,
      "category": this.pricingFormGroup.value.category,
      "modules": JSON.stringify(arr),
      // "desc": this.pricingFormGroup.value.description
    }
    this.managePricingPlanService.createPlan(formdata).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        this.utilsService.openSnackBarAC("Pricing plan details added successfully", "OK");
        setTimeout(() => {
          this.router.navigate(["/pricing-plan"]);
        }, 600);
      }
      else {
        this.utilsService.openSnackBarMC("Failed to create a pricing plan details", "OK");
      }
      setTimeout(() => {
        this.spinner.hide();
      }, 1000);
    })
    // this.spinner.hide();
  }

  //get plan details by id and set it to the form value
  getPlanbyID() {
    this.spinner.show();
    this.managePricingPlanService.getPlanById(this.plan_id).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        let response: any = JSON.parse(data.map.data);
        this.pricingFormGroup.setValue({
          "p_name": response.plan,
          "amount": response.amount,
          "users": response.users,
          "days": response.days,
          "currency": response.currency,
          "modules": JSON.parse(response.modules),
          // "description": response.desc
        })
        this.spinner.hide();
      }
    })
  }

  //update plan details
  updateplan() {
    this.spinner.show();

    let formdata = {
      "id": this.plan_id,
      "plan": this.pricingFormGroup.value.p_name,
      "amount": this.pricingFormGroup.value.amount,
      "currency": this.pricingFormGroup.value.currency,
      "modules": JSON.stringify(this.selectedAccess),
      // "desc": this.pricingFormGroup.value.description
    }
    this.managePricingPlanService.updatePlan(formdata).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        this.utilsService.openSnackBarAC("Pricing plan details updated successfully", "OK");
        setTimeout(() => {
          this.router.navigate(["/pricing_plan"]);
        }, 1000);
      }
      else {
        this.utilsService.openSnackBarMC("Failed to update a pricing plan details", "OK");
      }
      setTimeout(() => {
        this.spinner.hide();
      }, 1000);
    })
  }

  //get pricing plan details
  planname: any = [];
  modulesarr: any = [];
  allplandetails: any[] = [];
  getAllPlanDetails() {
    this.spinner.show();
    this.allplandetails = [];
    this.managePricingPlanService.getAllPlanDetails().subscribe(data => {
      if (data.map.statusMessage == "Success") {
        let response: any[] = JSON.parse(data.map.data);
        this.allplandetails = response;
        this.modulesarr = response.map(n => JSON.parse(n.modules));
        this.planname = response.map(n => n.plan.toLowerCase());
        for (var i = 0; i < this.allplandetails.length; i++) {
          let word = this.allplandetails[i].currency;
          this.allplandetails[i].currency = word.split(' ').pop();
          this.allplandetails[i].modules = JSON.parse(this.allplandetails[i].modules);
        }

      }
      else {
      }
      this.spinner.hide();
    })
  }

  planIndex: number;
  duplicateModules: boolean = false;
  onCheckModules(data) {
    for (var i = 0; i < this.modulesarr.length; i++) {
      this.duplicateModules = false;
      if (JSON.stringify(data) === JSON.stringify(this.modulesarr[i])) {
        this.planIndex = i;
        this.duplicateModules = true;
      }
    }
    setTimeout(() => {
      this.selectchange();
    }, 1000);
  }
  selectchange() {
    if (this.selectedAccess.length - 1 == this.accessList.length) {
      this.allSelected = true;
    }
    else {
      this.allSelected = false;
    }
  }

  duplicatemodules() {
    if (!this.duplicateModules) {
      this.createplan();
    }
    else {
      this.utilsService.openSnackBarMC("Already these module related plan exist on " + this.allplandetails[this.planIndex].plan + "", "OK");
    }
  }

  //oncheck the duplicate name of th pricing nam
  duplicate_pname: boolean = false;
  onCheckPlanName() {
    if (this.pricingFormGroup.value.p_name) {
      if (this.planname.find(x => x.toLowerCase() == (this.pricingFormGroup.value.p_name).toLowerCase()))
        this.duplicate_pname = true;
      else this.duplicate_pname = false;
    }
  }
  //// **********************Select all and unselect  all function start *******************//
  @ViewChild('select', { static: true }) select: MatSelect;
  allSelected = false;
  toggleAllSelection() {
    if (this.allSelected) {
      this.select.options.forEach((item: MatOption) => item.select());
    } else {
      this.select.options.forEach((item: MatOption) => item.deselect());
    }
  }
  //// **********************Select all and unselect  all function end*******************//
  selectCategoryDetails(event: any) {
    let catagory = event.value;
    this.isYearAccessField = false;
    this.pricingFormGroup.get('days').reset();
    this.pricingFormGroup.get('amount').reset();
    this.pricingFormGroup.get('users').reset();
    if (catagory == "Month") {
      this.minDaysValid = 0;
      this.maxDaysValid = 30;
      this.pricingFormGroup.get('users').setValue(0);
    }
    if (catagory == "Year") {
      this.pricingFormGroup.get('days').setValue(365);
      // this.pricingFormGroup.get('days').disable();
      this.isYearAccessField = true;
      this.minDaysValid = 0;
      this.maxDaysValid = 365;
    }
  }
}
