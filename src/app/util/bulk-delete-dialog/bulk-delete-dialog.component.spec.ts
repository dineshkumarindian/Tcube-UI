import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BulkDeleteDialogComponent } from './bulk-delete-dialog.component';

describe('BulkDeleteDialogComponent', () => {
  let component: BulkDeleteDialogComponent;
  let fixture: ComponentFixture<BulkDeleteDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BulkDeleteDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BulkDeleteDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
