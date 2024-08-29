import { TestBed } from '@angular/core/testing';

import { ManageattendanceService } from './manageattendance.service';

describe('ManageattendanceService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ManageattendanceService = TestBed.get(ManageattendanceService);
    expect(service).toBeTruthy();
  });
});
