import { TestBed } from '@angular/core/testing';

import { GitlabIntegrationService } from './gitlab-integration.service';

describe('GitlabIntegrationService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: GitlabIntegrationService = TestBed.get(GitlabIntegrationService);
    expect(service).toBeTruthy();
  });
});
