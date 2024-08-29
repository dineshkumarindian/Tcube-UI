import { TestBed } from '@angular/core/testing';

import { ManageBranchDetailsService } from './manage-branch-details.service';

describe('ManageBranchDetailsService', () => {
  let service: ManageBranchDetailsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ManageBranchDetailsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
