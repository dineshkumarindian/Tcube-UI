import { TestBed } from '@angular/core/testing';

import { ManagePricingPlanService } from './manage-pricing-plan.service';

describe('ManagePricingPlanService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ManagePricingPlanService = TestBed.get(ManagePricingPlanService);
    expect(service).toBeTruthy();
  });
});
