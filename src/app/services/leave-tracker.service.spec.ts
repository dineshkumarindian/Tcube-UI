import { TestBed } from '@angular/core/testing';

import { LeaveTrackerService } from './leave-tracker.service';

describe('LeaveTrackerService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: LeaveTrackerService = TestBed.get(LeaveTrackerService);
    expect(service).toBeTruthy();
  });
});
