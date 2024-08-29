import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { errorMessage } from './util/constants';
import { DataServiceService } from './util/shared/data-service.service';
import { Subscription } from 'rxjs';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less']
})
export class AppComponent implements OnInit, OnDestroy {
  requiredMessage = errorMessage;
  title = 'T-cube';
  loggedInStatus = true;
  private subscription: Subscription;
  constructor(
    public router: Router, private dataServiceService: DataServiceService
  ) {
    // console.log(router.url);   
    let role = localStorage.getItem("Role");
    if (role != 'super_admin') {
      this.subscription = this.dataServiceService.data$.subscribe(data => {
        if (data?.plan == "expired") {
          this.loggedInStatus = false;
        } else {
          this.loggedInStatus = true;
        }
      });
    }
  }
  ngOnInit(): void {

  }

  ngOnDestroy() {
    // Unsubscribe to avoid memory leaks
    this.subscription.unsubscribe();
  }
}
