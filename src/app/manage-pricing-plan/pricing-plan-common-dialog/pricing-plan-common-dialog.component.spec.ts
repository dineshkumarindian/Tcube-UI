import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PricingPlanCommonDialogComponent } from './pricing-plan-common-dialog.component';

describe('PricingPlanCommonDialogComponent', () => {
  let component: PricingPlanCommonDialogComponent;
  let fixture: ComponentFixture<PricingPlanCommonDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PricingPlanCommonDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PricingPlanCommonDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
