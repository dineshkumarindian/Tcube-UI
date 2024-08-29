import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TimesheetReportsTimetrackerComponent } from './timesheet-reports-timetracker.component';

describe('TimesheetReportsTimetrackerComponent', () => {
  let component: TimesheetReportsTimetrackerComponent;
  let fixture: ComponentFixture<TimesheetReportsTimetrackerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TimesheetReportsTimetrackerComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TimesheetReportsTimetrackerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
