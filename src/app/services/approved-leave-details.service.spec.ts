import { TestBed } from '@angular/core/testing';

import { ApprovedLeaveDetailsService } from './approved-leave-details.service';

describe('ApprovedLeaveDetailsService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ApprovedLeaveDetailsService = TestBed.get(ApprovedLeaveDetailsService);
    expect(service).toBeTruthy();
  });
});
