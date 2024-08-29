import { TestBed } from '@angular/core/testing';

import { AttendanceServiceService } from './attendance-service.service';

describe('AttendanceServiceService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: AttendanceServiceService = TestBed.get(AttendanceServiceService);
    expect(service).toBeTruthy();
  });
});
