import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BulkDeactivateDialogComponent } from './bulk-deactivate-dialog.component';

describe('BulkDeactivateDialogComponent', () => {
  let component: BulkDeactivateDialogComponent;
  let fixture: ComponentFixture<BulkDeactivateDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BulkDeactivateDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BulkDeactivateDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
