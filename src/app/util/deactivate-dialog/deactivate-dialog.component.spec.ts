import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DeactivateDialogComponent } from './deactivate-dialog.component';

describe('DeactivateDialogComponent', () => {
  let component: DeactivateDialogComponent;
  let fixture: ComponentFixture<DeactivateDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DeactivateDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DeactivateDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
