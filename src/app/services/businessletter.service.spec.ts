import { TestBed } from '@angular/core/testing';

import { InternshipletterService } from './businessletter.service';

describe('InternshipletterService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: InternshipletterService = TestBed.get(InternshipletterService);
    expect(service).toBeTruthy();
  });
});
