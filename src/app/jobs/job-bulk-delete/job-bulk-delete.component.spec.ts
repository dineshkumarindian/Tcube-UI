import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { JobBulkDeleteComponent } from './job-bulk-delete.component';

describe('JobBulkDeleteComponent', () => {
  let component: JobBulkDeleteComponent;
  let fixture: ComponentFixture<JobBulkDeleteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ JobBulkDeleteComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(JobBulkDeleteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
