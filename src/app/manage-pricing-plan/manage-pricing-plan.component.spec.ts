import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ManagePricingPlanComponent } from './manage-pricing-plan.component';

describe('ManagePricingPlanComponent', () => {
  let component: ManagePricingPlanComponent;
  let fixture: ComponentFixture<ManagePricingPlanComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ManagePricingPlanComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ManagePricingPlanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
