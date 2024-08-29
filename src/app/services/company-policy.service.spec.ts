import { TestBed } from '@angular/core/testing';

import { CompanyPolicyService } from './company-policy.service';

describe('CompanyPolicyService', () => {
  let service: CompanyPolicyService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CompanyPolicyService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
