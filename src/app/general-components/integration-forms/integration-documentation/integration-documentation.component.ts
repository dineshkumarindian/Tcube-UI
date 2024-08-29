import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-integration-documentation',
  templateUrl: './integration-documentation.component.html',
  styleUrls: ['./integration-documentation.component.less']
})
export class IntegrationDocumentationComponent implements OnInit {
  component: any;
  interactiveUrl: string = environment.hostName+"slack/events";

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) { }

  ngOnInit() {
    this.component = this.data;
  }

}
