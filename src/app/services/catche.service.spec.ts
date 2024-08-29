import { TestBed } from '@angular/core/testing';

import { CatcheService } from './catche.service';

describe('CatcheService', () => {
  let service: CatcheService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CatcheService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
