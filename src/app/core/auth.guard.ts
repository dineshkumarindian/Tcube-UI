import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { UtilService } from '../services/util.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    public router: Router, private utilService: UtilService,
  ) { }
  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
      let status = "false" ;
      status = localStorage.getItem("LoggedInStatus");
    if (status != "true") {
      this.router.navigate(['login']);
      this.utilService.openSnackBarMC("Can't sign in without credentials!", "OK");
      return false;
    }
    else {
      return true;
    }
  }
}

