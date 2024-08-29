import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeattendancedatereportComponent } from './employeeattendancedatereport.component';

describe('EmployeeattendancedatereportComponent', () => {
  let component: EmployeeattendancedatereportComponent;
  let fixture: ComponentFixture<EmployeeattendancedatereportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EmployeeattendancedatereportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EmployeeattendancedatereportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
