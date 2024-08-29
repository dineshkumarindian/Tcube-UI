import { TestBed } from '@angular/core/testing';

import { ManageSatffTypeDetailsService } from './manage-satff-type-details.service';

describe('ManageSatffTypeDetailsService', () => {
  let service: ManageSatffTypeDetailsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ManageSatffTypeDetailsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
