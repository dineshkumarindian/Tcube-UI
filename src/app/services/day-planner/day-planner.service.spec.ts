import { TestBed } from '@angular/core/testing';

import { DayPlannerService } from './day-planner.service';

describe('DayPlannerService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: DayPlannerService = TestBed.get(DayPlannerService);
    expect(service).toBeTruthy();
  });
});
