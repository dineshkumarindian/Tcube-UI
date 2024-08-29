import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UtilService } from '../services/util.service';
import {logOutMsg} from '../util/constants';
import {CacheService} from '../services/catche.service';
@Component({
  selector: 'app-logout',
  templateUrl: './logout.component.html',
  styleUrls: ['./logout.component.less']
})
export class LogoutComponent implements OnInit {
  logOutMsg = logOutMsg ;
  constructor(private router: Router, 
    private utilsService: UtilService,
    private cacheService: CacheService) { }

  ngOnInit() {
  }

  logout() {
    // setTimeout(() => {
      localStorage.clear();
      sessionStorage.clear();
      // window.location.reload()
      this.utilsService.sendNotificationCheck();
      // this.clearCookies();

      // Clear HTTP cache
      // this.cacheService.clearCache();
  
      // Redirect to login or home page
      this.redirectToLogin();
      // localStorage.removeItem('Id');
      // localStorage.removeItem('Name');
      // localStorage.removeItem('Role');
      // localStorage.removeItem('Email');
      // localStorage.removeItem('OrgId');
      // localStorage.removeItem('SAId');
      // localStorage.removeItem('SACompanyName');
      // localStorage.removeItem('projectsJobs');
      // localStorage.removeItem('timeTracker');
      // localStorage.removeItem('attendence');
      // localStorage.removeItem('settings');
    // }, 2000);
    // this.router.navigate(["/login"]);
    sessionStorage.removeItem('More_sidenav');
  }

  clearCookies() {
    const cookies = document.cookie.split(";");

    for (const cookie of cookies) {
      const eqPos = cookie.indexOf("=");
      const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
      document.cookie = name + `=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
    }
  }

  private redirectToLogin() {
    // Logic to redirect the user to the login page
    // window.location.href = '/login'; // Adjust the URL to your login route
    this.router.navigate(["/login"]);
  }
}
