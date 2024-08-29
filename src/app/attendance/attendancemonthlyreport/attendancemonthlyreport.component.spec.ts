import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AttendancemonthlyreportComponent } from './attendancemonthlyreport.component';

describe('AttendancemonthlyreportComponent', () => {
  let component: AttendancemonthlyreportComponent;
  let fixture: ComponentFixture<AttendancemonthlyreportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AttendancemonthlyreportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AttendancemonthlyreportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
