import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OrgBulkDeleteComponent } from './org-bulk-delete.component';

describe('OrgBulkDeleteComponent', () => {
  let component: OrgBulkDeleteComponent;
  let fixture: ComponentFixture<OrgBulkDeleteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OrgBulkDeleteComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OrgBulkDeleteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
