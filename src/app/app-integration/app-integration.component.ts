import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-app-integration',
  templateUrl: './app-integration.component.html',
  styleUrls: ['./app-integration.component.less']
})
export class AppIntegrationComponent implements OnInit {

  constructor(private router: Router,) { }

  ngOnInit() {
  }

   //navigate page function
   navigate(page:string){
    setTimeout(() => {
      this.router.navigate([page]);
    }, 500)
  }
}
