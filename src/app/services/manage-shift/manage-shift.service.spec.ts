import { TestBed } from '@angular/core/testing';

import { ManageShiftService } from './manage-shift.service';

describe('ManageShiftService', () => {
  let service: ManageShiftService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ManageShiftService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
