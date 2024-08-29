import { TestBed } from '@angular/core/testing';

import { PerformanceMetricsService } from './performance-metrics.service';

describe('PerformanceMetricsService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: PerformanceMetricsService = TestBed.get(PerformanceMetricsService);
    expect(service).toBeTruthy();
  });
});
