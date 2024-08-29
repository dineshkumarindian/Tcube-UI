import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-demo-video',
  templateUrl: './demo-video.component.html',
  styleUrls: ['./demo-video.component.less']
})
export class DemoVideoComponent implements OnInit {

  // skipBtn:Boolean = false;
  constructor() { }

  ngOnInit() {
  }

  // ngAfterViewInit(){
  //   setTimeout(() => {
  //     this.skipBtn = true;
  //   }, 3000);
  // }

}
