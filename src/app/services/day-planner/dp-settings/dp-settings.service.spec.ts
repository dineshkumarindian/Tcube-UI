import { TestBed } from '@angular/core/testing';

import { DpSettingsService } from './dp-settings.service';

describe('DpSettingsService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: DpSettingsService = TestBed.get(DpSettingsService);
    expect(service).toBeTruthy();
  });
});
