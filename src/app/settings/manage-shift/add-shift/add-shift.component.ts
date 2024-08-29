import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { RegisterService } from 'src/app/services/register.service';
import { SettingsService } from 'src/app/services/settings.service';
import { UtilService } from 'src/app/services/util.service';
import { errorMessage, alreadyExistMessage, validFormat } from '../../../util/constants';
import moment from 'moment';
import { ManageShiftService } from 'src/app/services/manage-shift/manage-shift.service';

@Component({
  selector: 'app-add-shift',
  templateUrl: './add-shift.component.html',
  styleUrls: ['./add-shift.component.less']
})
export class AddShiftComponent implements OnInit {
  requiredMessage = errorMessage;
  existMessage = alreadyExistMessage;
  validFormatMessage = validFormat;
  totalTimeInMS:number;
  emp_id: any;
  org_id: any;
  updateId: any;
  shiftIdUpdate: boolean = false;
  constructor(private formBuilder: UntypedFormBuilder,
    private router: Router,
    private utilsService: UtilService,
    private spinner: NgxSpinnerService,
    private activatedRoute: ActivatedRoute,
    private manageShiftService: ManageShiftService) { }

  ngOnInit(): void {
    this.emp_id = localStorage.getItem('Id');
    this.org_id = localStorage.getItem('OrgId');
    this.updateId = this.activatedRoute.snapshot.params.id;
    if(this.updateId){
      this.getShiftById();
      this.shiftIdUpdate = true;
    }
  }

  //setform values while click the edit btn
  setFormValues(){
    this.spinner.show();
    this.shiftFormGroup.setValue({
      shift: this.shiftDetails.shift,
      startTime: this.shiftDetails.start_time,
      endTime: this.shiftDetails.end_time,
      desc: this.shiftDetails?.desc
    })
    this.spinner.hide();
  }

  //formgroup
  shiftFormGroup: UntypedFormGroup = this.formBuilder.group({
    shift: ['', [Validators.required, Validators.pattern(/^[^\s]+(\s+[^\s]+)*$/)]],
    startTime: ['', [Validators.required]],
    endTime: ['', [Validators.required]],
    desc: ['']
  })

  //function to stay active shift tab if we redirects from the shift form
  backToShift() {
    localStorage.setItem("ManageShiftAction", "true");
    this.router.navigate(['/settings']);
  }

  //convert ms to hh:mm
  msToTime(duration) {
    var milliseconds: any = Math.floor((duration % 1000) / 100),
      seconds: any = Math.floor((duration / 1000) % 60),
      minutes: any = Math.floor((duration / (1000 * 60)) % 60),
      hours: any = Math.floor((duration / (1000 * 60 * 60)) % 24);

    hours = (hours < 10) ? "0" + hours : hours;
    minutes = (minutes < 10) ? "0" + minutes : minutes;
    seconds = (seconds < 10) ? "0" + seconds : seconds;

    return hours + " Hrs : " + minutes + " Mins";
  }

  //check the average shift time that should be between 8 to 10 hrs
  checkAverageShiftTime() {
    let min: number = 28800000;
    let max: number = 36000000;
    if (this.shiftFormGroup.value.startTime && this.shiftFormGroup.value.endTime) {
      var start_time: any = new Date(moment().format("YYYY-MM-DD") + " " + this.shiftFormGroup.value.startTime).getTime();
      var end_time: any = new Date(moment().format("YYYY-MM-DD") + " " + this.shiftFormGroup.value.endTime).getTime();
      this.totalTimeInMS = 0;

       if(end_time < start_time){
        end_time = 0;
        end_time = new Date(moment().add(1, 'days').format("YYYY-MM-DD") + " " + this.shiftFormGroup.value.endTime).getTime();
      }

      this.totalTimeInMS = Math.abs(new Date(end_time).getTime() - new Date(start_time).getTime());
      if( this.totalTimeInMS >= min &&  this.totalTimeInMS <= max){
        this.checkDuplicateTimings();
      }else{
        this.utilsService.openSnackBarMC("Shift hours range from 8-10 hours","OK")
      }
    }
  }

  //add method
  addShift() {
    this.spinner.show();
    let totalTime = this.msToTime(this.totalTimeInMS);
    let formData = {
      org_id: this.org_id,
      shift: this.shiftFormGroup.value.shift,
      start_time: this.shiftFormGroup.value.startTime,
      end_time: this.shiftFormGroup.value.endTime,
      desc: this.shiftFormGroup.value.desc,
      total_hours_ms: this.totalTimeInMS,
      totalTime: totalTime,
      created_by: this.emp_id
    }
    this.manageShiftService.create(formData).subscribe(data =>{
      if (data.map.statusMessage == "Success") {
        this.utilsService.openSnackBarAC("New shift details created successfully", "OK");
        setTimeout(() => {
          this.backToShift();
        }, 700);
      }else if(data.map.statusMessage == "Failed"){
        this.utilsService.openSnackBarMC("Failed to create new shift", "OK");
      }else{
        this.utilsService.openSnackBarMC("Error while creating new shift", "OK");
      }
      this.spinner.hide();
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
    })
  }

  //get shift details by id
  shiftDetails:any;
  getShiftById(){
    this.spinner.show();
    this.manageShiftService.getById(this.updateId).subscribe(data =>{
      if (data.map.statusMessage == "Success"){
        let response = JSON.parse(data.map.data);
        this.shiftDetails = response;
        if(this.shiftDetails){
          this.setFormValues();
        }
      }
    });
    this.spinner.hide();
  }

  //update method
  updateShift(){
    this.spinner.show();
    let totalTime = this.msToTime(this.totalTimeInMS);
    let formData = {
      id: this.updateId,
      org_id: this.org_id,
      shift: this.shiftFormGroup.value.shift,
      start_time: this.shiftFormGroup.value.startTime,
      end_time: this.shiftFormGroup.value.endTime,
      desc: this.shiftFormGroup.value.desc,
      total_hours_ms: this.totalTimeInMS,
      totalTime: totalTime,
      modified_by: this.emp_id
    }
    this.manageShiftService.update(formData).subscribe(data =>{
      if (data.map.statusMessage == "Success") {
        this.utilsService.openSnackBarAC("Shift details updated successfully", "OK");
        setTimeout(() => {
          this.backToShift();
        }, 700);
      }else if(data.map.statusMessage == "Failed"){
        this.utilsService.openSnackBarMC("Failed to update shift details", "OK");
      }else{
        this.utilsService.openSnackBarMC("Error while updating shift details", "OK");
      }
      this.spinner.hide();
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
    })
  }

  //to check the duplicate for the shift name
  duplicateName:boolean = false;
  checkDuplicate(eve){
    this.duplicateName = false;
    if(this.shiftFormGroup.value.shift != ""){
      let shift;
      if(this.updateId){
        if((this.shiftFormGroup.value.shift).toLowerCase() == (this.shiftDetails.shift).toLowerCase()){
          shift = "";
        }else{
          shift = this.shiftFormGroup.value.shift;
        }
      }else{
        shift = this.shiftFormGroup.value.shift;
      }
      let formdata = {
        orgId: this.org_id,
        shift: shift,
        startTime: "",
        endTime: ""
      }
      this.manageShiftService.checkDuplicate(formdata).subscribe(data =>{
        this.duplicateName = data;
      })
    }
  }

  //to check the duplicate occurs on the shift timing 
  checkDuplicateTimings(){
    this.spinner.show();
    let start, end;
    start = this.shiftFormGroup.value.startTime;
    end = this.shiftFormGroup.value.endTime;
    if(this.updateId){
      if(this.shiftFormGroup.value.startTime == this.shiftDetails.start_time &&  this.shiftFormGroup.value.endTime == this.shiftDetails.end_time){
        start = "";
        end = "";
      }
    }
    let formdata = {
      orgId: this.org_id,
      shift: "",
      startTime: start,
      endTime: end
    }
    this.manageShiftService.checkDuplicate(formdata).subscribe(data =>{
      if(data == true){
        this.utilsService.openSnackBarMC("Same timings already occurs on another active shift, please check and create/update the shift","OK");
      }else if(data == false){
        if(this.updateId){
          this.updateShift();
        }else{
          this.addShift();
        }
      }
    })
    this.spinner.hide();
  }
}
