import { TestBed } from '@angular/core/testing';

import { ManageIntegrationService } from './manage-integration.service';

describe('ManageIntegrationService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ManageIntegrationService = TestBed.get(ManageIntegrationService);
    expect(service).toBeTruthy();
  });
});
