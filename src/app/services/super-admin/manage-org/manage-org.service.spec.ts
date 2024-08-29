import { TestBed } from '@angular/core/testing';

import { ManageOrgService } from './manage-org.service';

describe('ManageOrgService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ManageOrgService = TestBed.get(ManageOrgService);
    expect(service).toBeTruthy();
  });
});
