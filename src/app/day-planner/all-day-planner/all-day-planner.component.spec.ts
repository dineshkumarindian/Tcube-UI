import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AllDayPlannerComponent } from './all-day-planner.component';

describe('AllDayPlannerComponent', () => {
  let component: AllDayPlannerComponent;
  let fixture: ComponentFixture<AllDayPlannerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AllDayPlannerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AllDayPlannerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
