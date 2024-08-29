import { DataSource } from '@angular/cdk/collections';
import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-preview-image',
  templateUrl: './preview-image.component.html',
  styleUrls: ['./preview-image.component.less']
})
export class PreviewImageComponent implements OnInit {



  // ProfileImage(event:any){
  //   console.log(event)
  // }


  image: any;
  name: any;
  event: any;
  DataSource: any;
  empDetails: any;
  employeedetails: any;
  filteredData: any;
  firstname: any;
  currentItem: number = 0;
  id: any;
  length: number;

  constructor(public dialogRef: MatDialogRef<PreviewImageComponent>,
    @Inject(MAT_DIALOG_DATA) public data) {
    this.image = data.event.image;
    this.name = data.event.firstname;
    this.DataSource = data.event.filteredData;
    this.empDetails = data.employeedetails.filteredData;
    this.event = data.event;
    this.currentItem = data.event.filteredData;
    this.id = data.event.id


    // console.log(this.currentItem)
    // console.log(this.empDetails.length)
    // console.log(this.empDetails)
    // console.log(this.name)
    // console.log(data)
    // console.log(this.data.filteredData)
  }



  ngOnInit() {



    // this.currentItem = 0;
    // length = 0;
    // let filteredData;
    this.length = this.empDetails.length;
    for (var i = 0; i < this.empDetails.length; i++) {
      if (this.empDetails[i].id == this.event.id) {
        this.currentItem = i;

        // this.image = "";
        // this.name = "";
        // console.log(this.empDetails.length, this.event.id);
        // console.log(this.event.id)

      }
    }
    // console.log(this.currentItem)
  }


  // Prev() {
  //   this.currentItem--;
  //   this.image = this.empDetails[this.currentItem]; this.image;
  //   this.name = this.filteredData[this.currentItem]; this.firstname;
  // }
  Next() {
    this.currentItem++;
    if (this.currentItem > this.empDetails.length - 1) {
      this.currentItem = 0;
    }

    this.image = this.empDetails[this.currentItem].image;
    this.name = this.empDetails[this.currentItem].firstname;
  }
  Prev() {
    this.currentItem--;
    if (this.currentItem < 0) {
      this.currentItem = this.empDetails.length - 1;
    }
    this.image = this.empDetails[this.currentItem].image;
    this.name = this.empDetails[this.currentItem].firstname;
  }

}