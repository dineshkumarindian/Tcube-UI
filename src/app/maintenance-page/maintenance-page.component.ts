import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {Location} from '@angular/common';


@Component({
  selector: 'app-maintenance-page',
  templateUrl: './maintenance-page.component.html',
  styleUrls: ['./maintenance-page.component.less']
})
export class MaintenancePageComponent implements OnInit {
 
   constructor(private router: Router, private _location: Location) {}
  
//   OnClickFunction() {
//     let value = localStorage.getItem("backBtn");
//     //  console.log(value);
//     this.router.navigate([value]); 
//  }

goBack() {
  this._location.back();
}

  ngOnInit() {

  }

}
