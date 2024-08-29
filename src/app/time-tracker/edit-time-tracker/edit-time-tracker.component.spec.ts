import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditTimeTrackerComponent } from './edit-time-tracker.component';

describe('EditTimeTrackerComponent', () => {
  let component: EditTimeTrackerComponent;
  let fixture: ComponentFixture<EditTimeTrackerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditTimeTrackerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditTimeTrackerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
