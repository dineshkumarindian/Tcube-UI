import {  Component, OnInit, ViewChild,} from '@angular/core';
import {  UntypedFormControl } from '@angular/forms';
import {  Subscription } from 'rxjs';
import { UtilService } from 'src/app/services/util.service';
import { ManageRoleComponent } from './manage-role/manage-role.component';
import { ManageDesignationComponent } from './manage-designation/manage-designation.component';
import { ManageUserComponent } from './manage-user/manage-user.component';
@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.less'],
  //  providers: [
  //      {provide: DateAdapter, useClass: PickDateAdapter},
  //       {provide: MAT_DATE_FORMATS, useValue: QuickAddDate,deps: [MAT_DATE_LOCALE]},
  //       { provide: MAT_DATE_FORMATS, useValue: QuickAddDate },
  //       {
  //         provide: NG_VALUE_ACCESSOR,
  //         useExisting: forwardRef(() => SettingsComponent),
  //         multi: true,
  //       },
  //   ]
})
export class SettingsComponent implements OnInit {
  clickEventsubscription:Subscription;
  @ViewChild(ManageRoleComponent) private roleComponent: ManageRoleComponent;
  @ViewChild(ManageDesignationComponent) private designationComponent: ManageDesignationComponent;
  @ViewChild(ManageUserComponent) private userComponent: ManageUserComponent;

  constructor(
    private utilsService: UtilService,
  ) {
    this.clickEventsubscription = this.utilsService.getActiveRole().subscribe(()=>{
        this.selected.setValue(1);
        setTimeout(() =>{
          this.selected.setValue(0);
        },100
        )
  })
  }
  selected = new UntypedFormControl(0);

  ngOnInit() {
   
    if(localStorage.getItem("ManageRoleAction")) {
      this.selected.setValue(0);
      localStorage.removeItem("ManageRoleAction");
  }
    if(localStorage.getItem("ManageDesignationAction")) {
        this.selected.setValue(1);
        localStorage.removeItem("ManageDesignationAction");
    }
    if(localStorage.getItem("ManageShiftAction")) {
      this.selected.setValue(2);
      localStorage.removeItem("ManageShiftAction");
  }
  if(localStorage.getItem("ManageUserAction")) {
      this.selected.setValue(3);
      localStorage.removeItem("ManageUserAction");
  }
  }
  labelName: string;
  selectedTabValue(event) {
    this.labelName = event.tab.textLabel;      
    if(this.labelName == "Manage Role") {
      this.roleComponent.resetFilter();
    } else if(this.labelName == "Manage Designation"){
      this.designationComponent.resetFilter();
    } else if(this.labelName == "Manage Users") {
      this.userComponent.resetFilter();
    }    
  }
}