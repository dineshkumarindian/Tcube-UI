import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BulkActivateDialogComponent } from './bulk-activate-dialog.component';

describe('BulkActivateDialogComponent', () => {
  let component: BulkActivateDialogComponent;
  let fixture: ComponentFixture<BulkActivateDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BulkActivateDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BulkActivateDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
