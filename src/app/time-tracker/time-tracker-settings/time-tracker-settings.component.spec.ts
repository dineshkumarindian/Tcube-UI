import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TimeTrackerSettingsComponent } from './time-tracker-settings.component';

describe('TimeTrackerSettingsComponent', () => {
  let component: TimeTrackerSettingsComponent;
  let fixture: ComponentFixture<TimeTrackerSettingsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TimeTrackerSettingsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TimeTrackerSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
