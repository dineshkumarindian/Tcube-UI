import { TestBed } from '@angular/core/testing';

import { ReminderDetailsService } from './reminder-details.service';

describe('ReminderDetailsService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ReminderDetailsService = TestBed.get(ReminderDetailsService);
    expect(service).toBeTruthy();
  });
});
