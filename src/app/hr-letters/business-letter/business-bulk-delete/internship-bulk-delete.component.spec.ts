import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InternshipBulkDeleteComponent } from './internship-bulk-delete.component';

describe('InternshipBulkDeleteComponent', () => {
  let component: InternshipBulkDeleteComponent;
  let fixture: ComponentFixture<InternshipBulkDeleteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InternshipBulkDeleteComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InternshipBulkDeleteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
