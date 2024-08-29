import { TestBed } from '@angular/core/testing';

import { OfferLetterService } from './offer-letter.service';

describe('OfferLetterService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: OfferLetterService = TestBed.get(OfferLetterService);
    expect(service).toBeTruthy();
  });
});
