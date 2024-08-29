import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddPricingPlanComponent } from './add-pricing-plan.component';

describe('AddPricingPlanComponent', () => {
  let component: AddPricingPlanComponent;
  let fixture: ComponentFixture<AddPricingPlanComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddPricingPlanComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddPricingPlanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
