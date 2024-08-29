import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShowingPlanDetailsComponent } from './showing-plan-details.component';

describe('ShowingPlanDetailsComponent', () => {
  let component: ShowingPlanDetailsComponent;
  let fixture: ComponentFixture<ShowingPlanDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ShowingPlanDetailsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShowingPlanDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
