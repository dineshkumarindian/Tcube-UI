import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-un-available',
  templateUrl: './un-available.component.html',
  styleUrls: ['./un-available.component.less']
})
export class UnAvailableComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }
  
  reloadPage(){
    window.location.reload();
  }

}
