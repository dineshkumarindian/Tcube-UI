import { TestBed } from '@angular/core/testing';

import { JiraIntegrationService } from './jira-integration.service';

describe('JiraIntegrationService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: JiraIntegrationService = TestBed.get(JiraIntegrationService);
    expect(service).toBeTruthy();
  });
});
